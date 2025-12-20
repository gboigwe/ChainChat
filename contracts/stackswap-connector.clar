;; title: stackswap-connector
;; version: 1.0.0
;; summary: StackSwap DEX connector
;; description: Interface with StackSwap DEX - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5900))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u5901))

;; Data Variables
(define-data-var total-trades uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map trade-records uint {
  trader: principal,
  pair: (string-ascii 20),
  amount-in: uint,
  amount-out: uint,
  fee-paid: uint,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

(define-map pair-liquidity (string-ascii 20) {
  reserve-a: uint,
  reserve-b: uint,
  total-lp-tokens: uint,
  last-updated: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (execute-swap
  (pair (string-ascii 20))
  (amount-in uint)
  (min-amount-out uint))
  (let (
    (trade-id (var-get total-trades))
    (liquidity-data (unwrap! (map-get? pair-liquidity pair) ERR-INSUFFICIENT-LIQUIDITY))
    (amount-out (get-amount-out amount-in (get reserve-a liquidity-data) (get reserve-b liquidity-data)))
    (fee (/ (* amount-in u30) u10000))  ;; 0.3% fee
  )
    (asserts! (>= amount-out min-amount-out) (err u400))

    (map-set trade-records trade-id {
      trader: tx-sender,
      pair: pair,
      amount-in: amount-in,
      amount-out: amount-out,
      fee-paid: fee,
      timestamp: stacks-block-time
    })

    (var-set total-trades (+ trade-id u1))

    (print {
      event: "stackswap-trade",
      trade-id: trade-id,
      pair: pair,
      timestamp: stacks-block-time
    })

    (ok amount-out)
  )
)

(define-public (initialize-pair
  (pair (string-ascii 20))
  (reserve-a uint)
  (reserve-b uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set pair-liquidity pair {
      reserve-a: reserve-a,
      reserve-b: reserve-b,
      total-lp-tokens: u0,
      last-updated: stacks-block-time
    })

    (ok true)
  )
)

;; Private Functions

(define-private (get-amount-out (amount-in uint) (reserve-in uint) (reserve-out uint))
  (let (
    (amount-in-with-fee (/ (* amount-in u997) u1000))
    (numerator (* amount-in-with-fee reserve-out))
    (denominator (+ reserve-in amount-in-with-fee))
  )
    (/ numerator denominator)
  )
)

;; Read-Only Functions

(define-read-only (get-trade-record (trade-id uint))
  (map-get? trade-records trade-id)
)

(define-read-only (get-pair-info (pair (string-ascii 20)))
  (map-get? pair-liquidity pair)
)

(define-read-only (get-total-trades)
  (var-get total-trades)
)
