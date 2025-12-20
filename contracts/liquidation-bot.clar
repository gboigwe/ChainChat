;; title: liquidation-bot
;; version: 1.0.0
;; summary: Automated liquidation bot
;; description: Bot to execute liquidations automatically - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6000))

;; Liquidator incentive (basis points)
(define-constant LIQUIDATOR-BONUS u500)  ;; 5%

;; Data Variables
(define-data-var total-bot-liquidations uint u0)
(define-data-var bot-earnings uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map bot-liquidations uint {
  position: principal,
  amount: uint,
  bonus: uint,
  executed-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-bot-liquidation-id uint u1)

;; Public Functions

(define-public (execute-bot-liquidation (position principal) (amount uint))
  (let (
    (liquidation-id (var-get next-bot-liquidation-id))
    (bonus (/ (* amount LIQUIDATOR-BONUS) u10000))
  )
    (map-set bot-liquidations liquidation-id {
      position: position,
      amount: amount,
      bonus: bonus,
      executed-at: stacks-block-time
    })

    (var-set total-bot-liquidations (+ (var-get total-bot-liquidations) u1))
    (var-set bot-earnings (+ (var-get bot-earnings) bonus))
    (var-set next-bot-liquidation-id (+ liquidation-id u1))

    (ok bonus)
  )
)

;; Read-Only Functions

(define-read-only (get-bot-stats)
  {
    total-liquidations: (var-get total-bot-liquidations),
    total-earnings: (var-get bot-earnings)
  }
)
