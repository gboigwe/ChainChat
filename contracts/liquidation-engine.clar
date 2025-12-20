;; title: liquidation-engine
;; version: 1.0.0
;; summary: Automated liquidation system
;; description: Liquidate undercollateralized positions - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5400))
(define-constant ERR-NOT-LIQUIDATABLE (err u5401))
(define-constant ERR-LIQUIDATION-FAILED (err u5402))
(define-constant ERR-INSUFFICIENT-PAYMENT (err u5403))

;; Liquidation threshold (basis points)
(define-constant LIQUIDATION-THRESHOLD u8500)  ;; 85% LTV
(define-constant LIQUIDATION-BONUS u500)  ;; 5% bonus to liquidator
(define-constant MAX-LIQUIDATION-CLOSE u5000)  ;; Max 50% of debt per liquidation

;; Data Variables
(define-data-var total-liquidations uint u0)
(define-data-var next-liquidation-id uint u1)
(define-data-var total-collateral-seized uint u0)
(define-data-var total-debt-repaid uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map liquidation-history uint {
  position: principal,
  collateral-seized: uint,
  debt-repaid: uint,
  liquidation-bonus: uint,
  liquidator: principal,
  health-factor-before: uint,
  liquidated-at: uint  ;; Clarity 4: Unix timestamp
})

(define-map position-status principal {
  total-collateral: uint,
  total-debt: uint,
  is-liquidated: bool,
  liquidation-count: uint
})

;; Public Functions

(define-public (liquidate-position
  (position principal)
  (debt-to-cover uint)
  (collateral-asset principal))
  (let (
    (liquidation-id (var-get next-liquidation-id))
    (position-data (default-to
      { total-collateral: u0, total-debt: u0, is-liquidated: false, liquidation-count: u0 }
      (map-get? position-status position)))
    (total-collateral (get total-collateral position-data))
    (total-debt (get total-debt position-data))
    (ltv (if (> total-collateral u0) (/ (* total-debt u10000) total-collateral) u10000))
    (max-debt-to-cover (/ (* total-debt MAX-LIQUIDATION-CLOSE) u10000))
    (actual-debt-to-cover (if (> debt-to-cover max-debt-to-cover) max-debt-to-cover debt-to-cover))
    (collateral-to-seize (/ (* actual-debt-to-cover (+ u10000 LIQUIDATION-BONUS)) u10000))
    (health-factor (if (> total-debt u0) (/ (* total-collateral u10000) total-debt) u10000))
  )
    ;; Check position is liquidatable
    (asserts! (>= ltv LIQUIDATION-THRESHOLD) ERR-NOT-LIQUIDATABLE)
    (asserts! (<= collateral-to-seize total-collateral) ERR-LIQUIDATION-FAILED)

    ;; Transfer debt repayment from liquidator to contract
    (try! (stx-transfer? actual-debt-to-cover tx-sender CONTRACT-OWNER))

    ;; Transfer collateral (+ bonus) to liquidator
    ;; In production, this would transfer from the collateral vault
    (try! (stx-transfer? collateral-to-seize CONTRACT-OWNER tx-sender))

    ;; Record liquidation
    (map-set liquidation-history liquidation-id {
      position: position,
      collateral-seized: collateral-to-seize,
      debt-repaid: actual-debt-to-cover,
      liquidation-bonus: (- collateral-to-seize actual-debt-to-cover),
      liquidator: tx-sender,
      health-factor-before: health-factor,
      liquidated-at: stacks-block-time
    })

    ;; Update position status
    (map-set position-status position {
      total-collateral: (- total-collateral collateral-to-seize),
      total-debt: (- total-debt actual-debt-to-cover),
      is-liquidated: (is-eq (- total-debt actual-debt-to-cover) u0),
      liquidation-count: (+ (get liquidation-count position-data) u1)
    })

    ;; Update global stats
    (var-set total-liquidations (+ (var-get total-liquidations) u1))
    (var-set total-collateral-seized (+ (var-get total-collateral-seized) collateral-to-seize))
    (var-set total-debt-repaid (+ (var-get total-debt-repaid) actual-debt-to-cover))
    (var-set next-liquidation-id (+ liquidation-id u1))

    (print {
      event: "position-liquidated",
      liquidation-id: liquidation-id,
      position: position,
      collateral-seized: collateral-to-seize,
      debt-repaid: actual-debt-to-cover,
      liquidator: tx-sender,
      health-factor-before: health-factor,
      timestamp: stacks-block-time
    })

    (ok liquidation-id)
  )
)

(define-public (update-position-debt (position principal) (new-debt uint))
  (let (
    (current-position (default-to
      { total-collateral: u0, total-debt: u0, is-liquidated: false, liquidation-count: u0 }
      (map-get? position-status position)))
  )
    ;; This would be called by lending contract
    (map-set position-status position
      (merge current-position { total-debt: new-debt }))
    (ok true)
  )
)

(define-public (update-position-collateral (position principal) (new-collateral uint))
  (let (
    (current-position (default-to
      { total-collateral: u0, total-debt: u0, is-liquidated: false, liquidation-count: u0 }
      (map-get? position-status position)))
  )
    ;; This would be called by collateral-manager contract
    (map-set position-status position
      (merge current-position { total-collateral: new-collateral }))
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-liquidation-record (liquidation-id uint))
  (map-get? liquidation-history liquidation-id)
)

(define-read-only (get-position-status (position principal))
  (map-get? position-status position)
)

(define-read-only (get-total-liquidations)
  (var-get total-liquidations)
)

(define-read-only (get-total-collateral-seized)
  (var-get total-collateral-seized)
)

(define-read-only (get-total-debt-repaid)
  (var-get total-debt-repaid)
)

(define-read-only (is-liquidatable (collateral uint) (debt uint))
  (if (> collateral u0)
    (>= (/ (* debt u10000) collateral) LIQUIDATION-THRESHOLD)
    true
  )
)

(define-read-only (calculate-health-factor (collateral uint) (debt uint))
  (if (> debt u0)
    (ok (/ (* collateral u10000) debt))
    (ok u10000)
  )
)

(define-read-only (calculate-liquidation-amount (position principal))
  (match (map-get? position-status position)
    pos-data (let (
      (total-debt (get total-debt pos-data))
      (max-close (/ (* total-debt MAX-LIQUIDATION-CLOSE) u10000))
    )
      (ok {
        max-debt-to-cover: max-close,
        collateral-to-seize: (/ (* max-close (+ u10000 LIQUIDATION-BONUS)) u10000)
      }))
    (err ERR-NOT-LIQUIDATABLE)
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate liquidator and position principals
(define-read-only (validate-position-principal (position principal))
  (principal-destruct? position)
)

;; 2. Clarity 4: int-to-ascii - Format liquidation amounts
(define-read-only (format-liquidation-id (liq-id uint))
  (ok (int-to-ascii liq-id))
)

(define-read-only (format-collateral (collateral uint))
  (ok (int-to-ascii collateral))
)

;; 3. Clarity 4: string-to-uint? - Parse liquidation parameters from strings
(define-read-only (parse-liquidation-id (id-str (string-ascii 20)))
  (match (string-to-uint? id-str)
    parsed-id (ok parsed-id)
    (err u998)
  )
)

;; 4. Clarity 4: buff-to-uint-le - Decode collateral amounts from buffers
(define-read-only (decode-collateral-buffer (coll-buff (buff 16)))
  (ok (buff-to-uint-le coll-buff))
)

;; 5. Clarity 4: burn-block-height - Track liquidations with Bitcoin timestamps
(define-read-only (get-liquidation-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height,
    time-since-burn: (- stacks-block-time burn-block-height)
  })
)
