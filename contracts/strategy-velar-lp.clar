;; title: strategy-velar-lp
;; version: 1.0.0
;; summary: Velar DEX liquidity provider strategy
;; description: Concentrated liquidity provision on Velar - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2200))
(define-constant ERR-INVALID-AMOUNT (err u2201))
(define-constant ERR-POSITION-NOT-FOUND (err u2202))
(define-constant ERR-OUT-OF-RANGE (err u2203))
(define-constant ERR-STRATEGY-PAUSED (err u2204))

;; Price range parameters (basis points)
(define-constant DEFAULT-RANGE-WIDTH u1000)  ;; 10%

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-liquidity uint u0)
(define-data-var total-fees-collected uint u0)
(define-data-var next-position-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map concentrated-positions uint {
  provider: principal,
  token-a: principal,
  token-b: principal,
  amount-a: uint,
  amount-b: uint,
  price-lower: uint,
  price-upper: uint,
  liquidity: uint,
  fees-earned: uint,
  created-at: uint,        ;; Clarity 4: Unix timestamp
  last-rebalanced: uint,   ;; Clarity 4: Unix timestamp
  is-active: bool,
  in-range: bool
})

(define-map fee-tier-stats uint {
  tier-bps: uint,
  total-volume: uint,
  total-fees: uint
})

;; Public Functions

;; Add concentrated liquidity
(define-public (add-concentrated-liquidity
  (token-a principal)
  (token-b principal)
  (amount-a uint)
  (amount-b uint)
  (price-lower uint)
  (price-upper uint))
  (let (
    (position-id (var-get next-position-id))
    (liquidity (calculate-liquidity amount-a amount-b))
  )
    (asserts! (not (var-get strategy-paused)) ERR-STRATEGY-PAUSED)
    (asserts! (> amount-a u0) ERR-INVALID-AMOUNT)
    (asserts! (> amount-b u0) ERR-INVALID-AMOUNT)
    (asserts! (< price-lower price-upper) ERR-OUT-OF-RANGE)

    (map-set concentrated-positions position-id {
      provider: tx-sender,
      token-a: token-a,
      token-b: token-b,
      amount-a: amount-a,
      amount-b: amount-b,
      price-lower: price-lower,
      price-upper: price-upper,
      liquidity: liquidity,
      fees-earned: u0,
      created-at: stacks-block-time,
      last-rebalanced: stacks-block-time,
      is-active: true,
      in-range: true
    })

    (var-set next-position-id (+ position-id u1))
    (var-set total-liquidity (+ (var-get total-liquidity) liquidity))

    (print {
      event: "concentrated-liquidity-added",
      position-id: position-id,
      provider: tx-sender,
      amount-a: amount-a,
      amount-b: amount-b,
      price-range: { lower: price-lower, upper: price-upper },
      timestamp: stacks-block-time
    })

    (ok position-id)
  )
)

;; Remove liquidity
(define-public (remove-liquidity (position-id uint))
  (let (
    (position (unwrap! (map-get? concentrated-positions position-id) ERR-POSITION-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get provider position)) ERR-UNAUTHORIZED)
    (asserts! (get is-active position) ERR-POSITION-NOT-FOUND)

    (map-set concentrated-positions position-id
      (merge position { is-active: false }))

    (var-set total-liquidity (- (var-get total-liquidity) (get liquidity position)))

    (print {
      event: "liquidity-removed",
      position-id: position-id,
      provider: tx-sender,
      amount-a: (get amount-a position),
      amount-b: (get amount-b position),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Rebalance position to new price range
(define-public (rebalance-range (position-id uint) (new-price-lower uint) (new-price-upper uint))
  (let (
    (position (unwrap! (map-get? concentrated-positions position-id) ERR-POSITION-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get provider position)) ERR-UNAUTHORIZED)
    (asserts! (get is-active position) ERR-POSITION-NOT-FOUND)
    (asserts! (< new-price-lower new-price-upper) ERR-OUT-OF-RANGE)

    (map-set concentrated-positions position-id
      (merge position {
        price-lower: new-price-lower,
        price-upper: new-price-upper,
        last-rebalanced: stacks-block-time,
        in-range: true
      }))

    (print {
      event: "range-rebalanced",
      position-id: position-id,
      new-range: { lower: new-price-lower, upper: new-price-upper },
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Collect fees
(define-public (collect-fees (position-id uint))
  (let (
    (position (unwrap! (map-get? concentrated-positions position-id) ERR-POSITION-NOT-FOUND))
    (fees (get fees-earned position))
  )
    (asserts! (is-eq tx-sender (get provider position)) ERR-UNAUTHORIZED)
    (asserts! (> fees u0) ERR-INVALID-AMOUNT)

    (map-set concentrated-positions position-id
      (merge position { fees-earned: u0 }))

    (var-set total-fees-collected (+ (var-get total-fees-collected) fees))

    (print {
      event: "fees-collected",
      position-id: position-id,
      amount: fees,
      timestamp: stacks-block-time
    })

    (ok fees)
  )
)

;; Pause strategy
(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

;; Resume strategy
(define-public (resume-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused false)
    (ok true)
  )
)

;; Private Functions

(define-private (calculate-liquidity (amount-a uint) (amount-b uint))
  ;; Simplified liquidity calculation
  (/ (+ amount-a amount-b) u2)
)

;; Read-Only Functions

(define-read-only (get-position (position-id uint))
  (map-get? concentrated-positions position-id)
)

(define-read-only (get-total-liquidity)
  (var-get total-liquidity)
)

(define-read-only (get-total-fees)
  (var-get total-fees-collected)
)

(define-read-only (is-strategy-paused)
  (var-get strategy-paused)
)
