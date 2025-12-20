;; title: price-oracle-pyth
;; version: 1.0.0
;; summary: Pyth Network oracle integration
;; description: Fetch prices from Pyth - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5000))
(define-constant ERR-STALE-PRICE (err u5001))

;; Max price age (5 minutes in seconds)
(define-constant MAX-PRICE-AGE u300)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map price-feeds (string-ascii 20) {
  price: uint,
  confidence: uint,
  updated-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (update-price (symbol (string-ascii 20)) (price uint) (confidence uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set price-feeds symbol {
      price: price,
      confidence: confidence,
      updated-at: stacks-block-time
    })

    (print {
      event: "price-updated",
      symbol: symbol,
      price: price,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-price (symbol (string-ascii 20)))
  (let (
    (feed (unwrap! (map-get? price-feeds symbol) (err u0)))
  )
    (asserts! (<= (- stacks-block-time (get updated-at feed)) MAX-PRICE-AGE) ERR-STALE-PRICE)
    (ok (get price feed))
  )
)

;; Clarity 4 Enhanced Functions
(define-read-only (validate-pyth-address (pyth principal))
  (principal-destruct? pyth)
)
(define-read-only (format-pyth-price (symbol (string-ascii 20)))
  (match (map-get? price-feeds symbol)
    feed (ok (int-to-ascii (get price feed)))
    (err u404)))
(define-read-only (parse-confidence (conf-str (string-ascii 20)))
  (match (string-to-uint? conf-str) conf (ok conf) (err u998)))
(define-read-only (get-pyth-timestamps)
  (ok {stacks-time: stacks-block-time, burn-time: burn-block-height}))
