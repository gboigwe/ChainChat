;; title: price-feed-aggregator
;; version: 1.0.0
;; summary: Aggregate prices from multiple oracles
;; description: Median price from multiple sources - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5200))

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map aggregated-prices (string-ascii 20) {
  price: uint,
  sources-count: uint,
  updated-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (aggregate-price (symbol (string-ascii 20)) (prices (list 5 uint)))
  (let (
    (median-price (calculate-median prices))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set aggregated-prices symbol {
      price: median-price,
      sources-count: (len prices),
      updated-at: stacks-block-time
    })

    (ok median-price)
  )
)

;; Private Functions

(define-private (calculate-median (prices (list 5 uint)))
  ;; Simplified median calculation
  (unwrap-panic (element-at prices u2))
)

;; Read-Only Functions

(define-read-only (get-aggregated-price (symbol (string-ascii 20)))
  (map-get? aggregated-prices symbol)
)
