;; title: price-oracle-redstone
;; version: 1.0.0
;; summary: RedStone oracle integration
;; description: Fetch prices from RedStone - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5100))
(define-constant ERR-STALE-PRICE (err u5101))

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map redstone-prices (string-ascii 20) {
  price: uint,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (update-price (symbol (string-ascii 20)) (price uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set redstone-prices symbol {
      price: price,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-price (symbol (string-ascii 20)))
  (match (map-get? redstone-prices symbol)
    feed (ok (get price feed))
    (err u0)
  )
)
