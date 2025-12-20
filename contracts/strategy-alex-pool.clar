;; title: strategy-alex-pool
;; version: 1.0.0
;; summary: ALEX DEX liquidity pool strategy
;; description: Automated liquidity provision on ALEX - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2000))
(define-constant ERR-INVALID-AMOUNT (err u2001))
(define-constant ERR-POOL-NOT-FOUND (err u2002))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u2003))
(define-constant ERR-SLIPPAGE-EXCEEDED (err u2004))
(define-constant ERR-STRATEGY-PAUSED (err u2005))

;; Strategy parameters
(define-constant MAX-SLIPPAGE u500)  ;; 5% in basis points
(define-constant REBALANCE-THRESHOLD u1000)  ;; 10%

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-liquidity-provided uint u0)
(define-data-var total-fees-earned uint u0)
(define-data-var next-position-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map liquidity-positions uint {
  provider: principal,
  pool-token-a: principal,
  pool-token-b: principal,
  amount-a: uint,
  amount-b: uint,
  lp-tokens: uint,
  entry-price: uint,
  created-at: uint,     ;; Clarity 4: Unix timestamp
  last-rebalance: uint, ;; Clarity 4: Unix timestamp
  fees-earned: uint,
  is-active: bool
})

(define-map pool-stats principal {
  pool-id: principal,
  total-volume: uint,
  total-fees: uint,
  apy: uint,
  last-update: uint  ;; Clarity 4: Unix timestamp
})

(define-map user-positions principal (list 50 uint))

(define-map rebalance-history uint {
  position-id: uint,
  old-ratio: uint,
  new-ratio: uint,
  rebalanced-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-rebalance-id uint u1)

;; Private Functions

(define-private (calculate-lp-tokens (amount-a uint) (amount-b uint))
  ;; Simplified LP token calculation
  (/ (+ amount-a amount-b) u2)
)

(define-private (check-slippage (expected uint) (actual uint))
  (let (
    (difference (if (> expected actual)
                   (- expected actual)
                   (- actual expected)))
    (slippage-percent (/ (* difference u10000) expected))
  )
    (<= slippage-percent MAX-SLIPPAGE)
  )
)

;; Public Functions

;; Add liquidity to ALEX pool
(define-public (add-liquidity
  (pool-token-a principal)
  (pool-token-b principal)
  (amount-a uint)
  (amount-b uint)
  (min-lp-tokens uint))
  (let (
    (position-id (var-get next-position-id))
    (lp-tokens (calculate-lp-tokens amount-a amount-b))
    (entry-price (/ (* amount-a u10000) amount-b))
  )
    (asserts! (not (var-get strategy-paused)) ERR-STRATEGY-PAUSED)
    (asserts! (> amount-a u0) ERR-INVALID-AMOUNT)
    (asserts! (> amount-b u0) ERR-INVALID-AMOUNT)
    (asserts! (>= lp-tokens min-lp-tokens) ERR-SLIPPAGE-EXCEEDED)

    ;; Transfer tokens to contract (simplified - would need actual token transfers)
    ;; (try! (contract-call? pool-token-a transfer amount-a tx-sender tx-sender none))
    ;; (try! (contract-call? pool-token-b transfer amount-b tx-sender tx-sender none))

    ;; Record position
    (map-set liquidity-positions position-id {
      provider: tx-sender,
      pool-token-a: pool-token-a,
      pool-token-b: pool-token-b,
      amount-a: amount-a,
      amount-b: amount-b,
      lp-tokens: lp-tokens,
      entry-price: entry-price,
      created-at: stacks-block-time,
      last-rebalance: stacks-block-time,
      fees-earned: u0,
      is-active: true
    })

    (var-set next-position-id (+ position-id u1))
    (var-set total-liquidity-provided (+ (var-get total-liquidity-provided) (+ amount-a amount-b)))

    (print {
      event: "liquidity-added",
      position-id: position-id,
      provider: tx-sender,
      amount-a: amount-a,
      amount-b: amount-b,
      lp-tokens: lp-tokens,
      timestamp: stacks-block-time
    })

    (ok position-id)
  )
)

;; Remove liquidity from ALEX pool
(define-public (remove-liquidity (position-id uint) (lp-tokens-to-burn uint))
  (let (
    (position (unwrap! (map-get? liquidity-positions position-id) ERR-POOL-NOT-FOUND))
    (total-lp-tokens (get lp-tokens position))
    (amount-a-to-return (/ (* (get amount-a position) lp-tokens-to-burn) total-lp-tokens))
    (amount-b-to-return (/ (* (get amount-b position) lp-tokens-to-burn) total-lp-tokens))
    (remaining-lp (- total-lp-tokens lp-tokens-to-burn))
  )
    (asserts! (is-eq tx-sender (get provider position)) ERR-UNAUTHORIZED)
    (asserts! (get is-active position) ERR-POOL-NOT-FOUND)
    (asserts! (<= lp-tokens-to-burn total-lp-tokens) ERR-INSUFFICIENT-LIQUIDITY)

    ;; Transfer tokens back (simplified)
    ;; (try! (begin (contract-call? pool-token-a transfer amount-a-to-return tx-sender (get provider position) none)))
    ;; (try! (begin (contract-call? pool-token-b transfer amount-b-to-return tx-sender (get provider position) none)))

    ;; Update or delete position
    (if (is-eq remaining-lp u0)
      (map-set liquidity-positions position-id
        (merge position { is-active: false }))
      (map-set liquidity-positions position-id
        (merge position {
          lp-tokens: remaining-lp,
          amount-a: (- (get amount-a position) amount-a-to-return),
          amount-b: (- (get amount-b position) amount-b-to-return)
        }))
    )

    (print {
      event: "liquidity-removed",
      position-id: position-id,
      provider: tx-sender,
      amount-a: amount-a-to-return,
      amount-b: amount-b-to-return,
      timestamp: stacks-block-time
    })

    (ok { amount-a: amount-a-to-return, amount-b: amount-b-to-return })
  )
)

;; Rebalance position
(define-public (rebalance-position (position-id uint))
  (let (
    (position (unwrap! (map-get? liquidity-positions position-id) ERR-POOL-NOT-FOUND))
    (rebalance-id (var-get next-rebalance-id))
    (current-ratio (/ (* (get amount-a position) u10000) (get amount-b position)))
    (entry-ratio (get entry-price position))
  )
    (asserts! (is-eq tx-sender (get provider position)) ERR-UNAUTHORIZED)
    (asserts! (get is-active position) ERR-POOL-NOT-FOUND)

    ;; Record rebalance
    (map-set rebalance-history rebalance-id {
      position-id: position-id,
      old-ratio: entry-ratio,
      new-ratio: current-ratio,
      rebalanced-at: stacks-block-time
    })

    ;; Update position
    (map-set liquidity-positions position-id
      (merge position {
        last-rebalance: stacks-block-time,
        entry-price: current-ratio
      }))

    (var-set next-rebalance-id (+ rebalance-id u1))

    (print {
      event: "position-rebalanced",
      position-id: position-id,
      old-ratio: entry-ratio,
      new-ratio: current-ratio,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Claim fees
(define-public (claim-fees (position-id uint))
  (let (
    (position (unwrap! (map-get? liquidity-positions position-id) ERR-POOL-NOT-FOUND))
    (fees (get fees-earned position))
  )
    (asserts! (is-eq tx-sender (get provider position)) ERR-UNAUTHORIZED)
    (asserts! (> fees u0) ERR-INVALID-AMOUNT)

    ;; Transfer fees (simplified)
    ;; (try! (begin (stx-transfer? fees tx-sender (get provider position))))

    ;; Update position
    (map-set liquidity-positions position-id
      (merge position { fees-earned: u0 }))

    (var-set total-fees-earned (+ (var-get total-fees-earned) fees))

    (print {
      event: "fees-claimed",
      position-id: position-id,
      provider: tx-sender,
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

;; Read-Only Functions

(define-read-only (get-position (position-id uint))
  (map-get? liquidity-positions position-id)
)

(define-read-only (get-pool-stats (pool-id principal))
  (map-get? pool-stats pool-id)
)

(define-read-only (get-total-liquidity)
  (var-get total-liquidity-provided)
)

(define-read-only (get-total-fees-earned)
  (var-get total-fees-earned)
)

(define-read-only (is-strategy-paused)
  (var-get strategy-paused)
)

(define-read-only (get-rebalance-record (rebalance-id uint))
  (map-get? rebalance-history rebalance-id)
)
