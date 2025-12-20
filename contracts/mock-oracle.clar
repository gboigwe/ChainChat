;; title: mock-oracle
;; version: 1.0.0
;; summary: Mock price oracle for testing
;; description: Settable price oracle for tests - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u7400))

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map prices (string-ascii 20) {
  price: uint,
  decimals: uint,
  last-updated: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (set-price (symbol (string-ascii 20)) (price uint) (decimals uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set prices symbol {
      price: price,
      decimals: decimals,
      last-updated: stacks-block-time
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

(define-public (batch-set-prices
  (symbols (list 10 (string-ascii 20)))
  (price-list (list 10 uint)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-price (symbol (string-ascii 20)))
  (match (map-get? prices symbol)
    price-data (ok (get price price-data))
    (err u404)
  )
)

(define-read-only (get-price-data (symbol (string-ascii 20)))
  (ok (map-get? prices symbol))
)

(define-read-only (is-price-fresh (symbol (string-ascii 20)) (max-age uint))
  (match (map-get? prices symbol)
    price-data (ok (<= (- stacks-block-time (get last-updated price-data)) max-age))
    (ok false)
  )
)

(define-read-only (get-price-with-decimals (symbol (string-ascii 20)))
  (match (map-get? prices symbol)
    price-data (ok {
      price: (get price price-data),
      decimals: (get decimals price-data)
    })
    (err u404)
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: int-to-utf8 - Format mock prices
(define-read-only (format-mock-price (symbol (string-ascii 20)))
  (match (map-get? prices symbol)
    price-data (ok (int-to-utf8 (get price price-data)))
    (err u404)
  )
)

;; 2. Clarity 4: string-to-uint? - Parse price values
(define-read-only (parse-price-value (price-str (string-ascii 30)))
  (match (string-to-uint? price-str)
    price (ok price)
    (err u998)
  )
)

;; 3. Clarity 4: buff-to-uint-le - Decode price from buffer
(define-read-only (decode-price-buffer (price-buff (buff 16)))
  (ok (buff-to-uint-le price-buff))
)

;; 4. Clarity 4: burn-block-height - Track mock oracle updates
(define-read-only (get-mock-oracle-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
