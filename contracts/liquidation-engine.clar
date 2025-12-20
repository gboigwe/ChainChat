;; title: liquidation-engine
;; version: 1.0.0
;; summary: Automated liquidation system
;; description: Liquidate undercollateralized positions - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5400))
(define-constant ERR-NOT-LIQUIDATABLE (err u5401))

;; Liquidation threshold (basis points)
(define-constant LIQUIDATION-THRESHOLD u8500)  ;; 85% LTV

;; Data Variables
(define-data-var total-liquidations uint u0)
(define-data-var next-liquidation-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map liquidation-history uint {
  position: principal,
  collateral-seized: uint,
  debt-repaid: uint,
  liquidator: principal,
  liquidated-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (liquidate-position (position principal) (collateral uint) (debt uint))
  (let (
    (ltv (/ (* debt u10000) collateral))
    (liquidation-id (var-get next-liquidation-id))
  )
    (asserts! (>= ltv LIQUIDATION-THRESHOLD) ERR-NOT-LIQUIDATABLE)

    (map-set liquidation-history liquidation-id {
      position: position,
      collateral-seized: collateral,
      debt-repaid: debt,
      liquidator: tx-sender,
      liquidated-at: stacks-block-time
    })

    (var-set total-liquidations (+ (var-get total-liquidations) u1))
    (var-set next-liquidation-id (+ liquidation-id u1))

    (print {
      event: "position-liquidated",
      position: position,
      collateral: collateral,
      debt: debt,
      timestamp: stacks-block-time
    })

    (ok liquidation-id)
  )
)

;; Read-Only Functions

(define-read-only (get-liquidation-record (liquidation-id uint))
  (map-get? liquidation-history liquidation-id)
)

(define-read-only (get-total-liquidations)
  (var-get total-liquidations)
)

(define-read-only (is-liquidatable (collateral uint) (debt uint))
  (>= (/ (* debt u10000) collateral) LIQUIDATION-THRESHOLD)
)
