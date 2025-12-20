;; title: strategy-basis-trading
;; version: 1.0.0
;; summary: Basis trading arbitrage
;; description: Profit from spot-futures spread - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u3200))
(define-constant ERR-NO-SPREAD (err u3201))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-trades uint u0)
(define-data-var next-trade-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map basis-trades uint {
  trader: principal,
  spot-amount: uint,
  futures-amount: uint,
  spread: uint,
  executed-at: uint,  ;; Clarity 4: Unix timestamp
  profit: uint,
  is-closed: bool
})

;; Public Functions

(define-public (execute-basis-trade (spot uint) (futures uint) (spread uint))
  (let (
    (trade-id (var-get next-trade-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (> spread u0) ERR-NO-SPREAD)

    (map-set basis-trades trade-id {
      trader: tx-sender,
      spot-amount: spot,
      futures-amount: futures,
      spread: spread,
      executed-at: stacks-block-time,
      profit: u0,
      is-closed: false
    })

    (var-set next-trade-id (+ trade-id u1))
    (var-set total-trades (+ (var-get total-trades) u1))

    (print {
      event: "basis-trade-opened",
      trade-id: trade-id,
      spread: spread,
      timestamp: stacks-block-time
    })

    (ok trade-id)
  )
)

(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-trade (trade-id uint))
  (map-get? basis-trades trade-id)
)
