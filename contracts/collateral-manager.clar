;; title: collateral-manager
;; version: 1.0.0
;; summary: Multi-asset collateral management
;; description: Track and manage collateral types - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5500))
(define-constant ERR-INVALID-COLLATERAL (err u5501))
(define-constant ERR-INSUFFICIENT-COLLATERAL (err u5502))
(define-constant ERR-BELOW-LIQUIDATION (err u5503))
(define-constant ERR-TRANSFER-FAILED (err u5504))

;; Data Variables
(define-data-var total-collateral-value uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map collateral-types principal {
  name: (string-ascii 20),
  ltv-ratio: uint,  ;; Basis points (7500 = 75%)
  liquidation-threshold: uint,  ;; Basis points (8500 = 85%)
  is-enabled: bool,
  price-per-unit: uint,  ;; Price in USD (6 decimals)
  total-deposited: uint,
  added-at: uint  ;; Clarity 4: Unix timestamp
})

(define-map user-collateral {user: principal, asset: principal} {
  amount: uint,
  locked-at: uint,  ;; Clarity 4: Unix timestamp
  borrowed-against: uint
})

(define-map user-total-collateral principal {
  total-value-usd: uint,
  total-borrowed: uint,
  health-factor: uint  ;; 10000 = 1.0 (healthy)
})

;; Public Functions

(define-public (add-collateral-type (asset principal) (name (string-ascii 20)) (ltv uint) (threshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set collateral-types asset {
      name: name,
      ltv-ratio: ltv,
      liquidation-threshold: threshold,
      is-enabled: true,
      price-per-unit: u1000000,  ;; Default $1.00
      total-deposited: u0,
      added-at: stacks-block-time
    })

    (print {
      event: "collateral-type-added",
      asset: asset,
      name: name,
      ltv: ltv,
      threshold: threshold,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (update-collateral-price (asset principal) (new-price uint))
  (let (
    (collateral-type (unwrap! (map-get? collateral-types asset) ERR-INVALID-COLLATERAL))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set collateral-types asset
      (merge collateral-type { price-per-unit: new-price }))

    (ok true)
  )
)

(define-public (deposit-collateral (asset principal) (amount uint))
  (let (
    (collateral-type (unwrap! (map-get? collateral-types asset) ERR-INVALID-COLLATERAL))
    (current-collateral (default-to
      { amount: u0, locked-at: u0, borrowed-against: u0 }
      (map-get? user-collateral {user: tx-sender, asset: asset})))
    (new-amount (+ (get amount current-collateral) amount))
    (collateral-value (/ (* amount (get price-per-unit collateral-type)) u1000000))
  )
    (asserts! (get is-enabled collateral-type) ERR-INVALID-COLLATERAL)
    (asserts! (> amount u0) ERR-INVALID-COLLATERAL)

    ;; Transfer STX to contract (for STX collateral)
    ;; In production, add SIP-010 token transfers for other assets
    (try! (stx-transfer? amount tx-sender CONTRACT-OWNER))

    ;; Update user collateral
    (map-set user-collateral {user: tx-sender, asset: asset} {
      amount: new-amount,
      locked-at: stacks-block-time,
      borrowed-against: (get borrowed-against current-collateral)
    })

    ;; Update collateral type totals
    (map-set collateral-types asset
      (merge collateral-type {
        total-deposited: (+ (get total-deposited collateral-type) amount)
      }))

    ;; Update user total collateral
    (update-user-collateral-value tx-sender collateral-value true)

    ;; Update global total
    (var-set total-collateral-value (+ (var-get total-collateral-value) collateral-value))

    (print {
      event: "collateral-deposited",
      user: tx-sender,
      asset: asset,
      amount: amount,
      value-usd: collateral-value,
      timestamp: stacks-block-time
    })

    (ok new-amount)
  )
)

(define-public (withdraw-collateral (asset principal) (amount uint))
  (let (
    (collateral-type (unwrap! (map-get? collateral-types asset) ERR-INVALID-COLLATERAL))
    (current-collateral (unwrap! (map-get? user-collateral {user: tx-sender, asset: asset}) ERR-INSUFFICIENT-COLLATERAL))
    (new-amount (- (get amount current-collateral) amount))
    (collateral-value (/ (* amount (get price-per-unit collateral-type)) u1000000))
    (borrowed (get borrowed-against current-collateral))
    (remaining-value (/ (* new-amount (get price-per-unit collateral-type)) u1000000))
    (max-borrow (/ (* remaining-value (get ltv-ratio collateral-type)) u10000))
  )
    (asserts! (>= (get amount current-collateral) amount) ERR-INSUFFICIENT-COLLATERAL)
    (asserts! (> amount u0) ERR-INVALID-COLLATERAL)

    ;; Check health factor - can't withdraw if it would make position unhealthy
    (asserts! (>= max-borrow borrowed) ERR-BELOW-LIQUIDATION)

    ;; Transfer STX back to user
    (try! (stx-transfer? amount CONTRACT-OWNER tx-sender))

    ;; Update user collateral
    (if (is-eq new-amount u0)
      (map-delete user-collateral {user: tx-sender, asset: asset})
      (map-set user-collateral {user: tx-sender, asset: asset}
        (merge current-collateral { amount: new-amount }))
    )

    ;; Update collateral type totals
    (map-set collateral-types asset
      (merge collateral-type {
        total-deposited: (- (get total-deposited collateral-type) amount)
      }))

    ;; Update user total collateral
    (update-user-collateral-value tx-sender collateral-value false)

    ;; Update global total
    (var-set total-collateral-value (- (var-get total-collateral-value) collateral-value))

    (print {
      event: "collateral-withdrawn",
      user: tx-sender,
      asset: asset,
      amount: amount,
      value-usd: collateral-value,
      timestamp: stacks-block-time
    })

    (ok new-amount)
  )
)

(define-public (record-borrow (user principal) (asset principal) (borrow-amount uint))
  (let (
    (current-collateral (unwrap! (map-get? user-collateral {user: user, asset: asset}) ERR-INSUFFICIENT-COLLATERAL))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set user-collateral {user: user, asset: asset}
      (merge current-collateral {
        borrowed-against: (+ (get borrowed-against current-collateral) borrow-amount)
      }))

    (ok true)
  )
)

;; Private Functions

(define-private (update-user-collateral-value (user principal) (value uint) (is-deposit bool))
  (let (
    (current-totals (default-to
      { total-value-usd: u0, total-borrowed: u0, health-factor: u10000 }
      (map-get? user-total-collateral user)))
    (new-value (if is-deposit
      (+ (get total-value-usd current-totals) value)
      (- (get total-value-usd current-totals) value)))
  )
    (map-set user-total-collateral user
      (merge current-totals { total-value-usd: new-value }))
    true
  )
)

;; Read-Only Functions

(define-read-only (get-collateral-type (asset principal))
  (map-get? collateral-types asset)
)

(define-read-only (get-user-collateral (user principal) (asset principal))
  (map-get? user-collateral {user: user, asset: asset})
)

(define-read-only (get-user-total-collateral (user principal))
  (map-get? user-total-collateral user)
)

(define-read-only (get-total-collateral-value)
  (var-get total-collateral-value)
)

(define-read-only (calculate-max-borrow (user principal) (asset principal))
  (match (map-get? user-collateral {user: user, asset: asset})
    collateral (match (map-get? collateral-types asset)
      coll-type (let (
        (collateral-value (/ (* (get amount collateral) (get price-per-unit coll-type)) u1000000))
        (max-borrow (/ (* collateral-value (get ltv-ratio coll-type)) u10000))
      )
        (ok max-borrow))
      (err ERR-INVALID-COLLATERAL))
    (err ERR-INSUFFICIENT-COLLATERAL)
  )
)

(define-read-only (get-health-factor (user principal) (asset principal))
  (match (map-get? user-collateral {user: user, asset: asset})
    collateral (match (map-get? collateral-types asset)
      coll-type (let (
        (collateral-value (/ (* (get amount collateral) (get price-per-unit coll-type)) u1000000))
        (borrowed (get borrowed-against collateral))
        (liquidation-value (/ (* collateral-value (get liquidation-threshold coll-type)) u10000))
      )
        (if (is-eq borrowed u0)
          (ok u10000)  ;; Perfect health if no borrows
          (ok (/ (* liquidation-value u10000) borrowed))))  ;; Health factor
      (err ERR-INVALID-COLLATERAL))
    (err ERR-INSUFFICIENT-COLLATERAL)
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate and decompose collateral asset principals
(define-read-only (validate-asset-principal (asset principal))
  (principal-destruct? asset)
)

;; 2. Clarity 4: int-to-utf8 - Format collateral values for display
(define-read-only (format-collateral-value (user principal) (asset principal))
  (match (map-get? user-collateral {user: user, asset: asset})
    collateral (ok (int-to-utf8 (get amount collateral)))
    (err ERR-INSUFFICIENT-COLLATERAL)
  )
)

;; 3. Clarity 4: string-to-uint? - Parse price inputs from string
(define-read-only (parse-price-string (price-str (string-ascii 20)))
  (match (string-to-uint? price-str)
    price (ok price)
    (err u998)
  )
)

;; 4. Clarity 4: buff-to-uint-le - Convert buffer to collateral amount
(define-read-only (buffer-to-amount (amount-buff (buff 16)))
  (ok (buff-to-uint-le amount-buff))
)

;; 5. Clarity 4: burn-block-height - Get Bitcoin timestamp for collateral tracking
(define-read-only (get-collateral-burn-time)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height,
    time-diff: (- stacks-block-time burn-block-height)
  })
)
