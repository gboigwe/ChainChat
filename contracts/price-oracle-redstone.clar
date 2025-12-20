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

;; Clarity 4 Enhanced Functions
(define-read-only (validate-redstone-feed (feed principal))
  (principal-destruct? feed)
)
(define-read-only (format-redstone-price (price uint))
  (ok (int-to-utf8 price)))
(define-read-only (parse-timestamp (ts-str (string-ascii 20)))
  (match (string-to-uint? ts-str) ts (ok ts) (err u998)))
(define-read-only (get-redstone-timestamps)
  (ok {stacks-time: stacks-block-time, burn-time: burn-block-height}))
