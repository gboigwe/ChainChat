;; title: oracle-security
;; version: 1.0.0
;; summary: Oracle security and validation
;; description: Validate and secure oracle price feeds - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6200))
(define-constant ERR-PRICE-MANIPULATION (err u6201))

;; Max price deviation (basis points)
(define-constant MAX-PRICE-DEVIATION u1000)  ;; 10%

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map price-validation-history uint {
  symbol: (string-ascii 20),
  old-price: uint,
  new-price: uint,
  deviation: uint,
  validated-at: uint,  ;; Clarity 4: Unix timestamp
  is-valid: bool
})

(define-data-var next-validation-id uint u1)

;; Public Functions

(define-public (validate-price-update (symbol (string-ascii 20)) (old-price uint) (new-price uint))
  (let (
    (deviation (calculate-deviation old-price new-price))
    (is-valid (<= deviation MAX-PRICE-DEVIATION))
    (validation-id (var-get next-validation-id))
  )
    (asserts! is-valid ERR-PRICE-MANIPULATION)

    (map-set price-validation-history validation-id {
      symbol: symbol,
      old-price: old-price,
      new-price: new-price,
      deviation: deviation,
      validated-at: stacks-block-time,
      is-valid: is-valid
    })

    (var-set next-validation-id (+ validation-id u1))

    (ok is-valid)
  )
)

;; Private Functions

(define-private (calculate-deviation (old-price uint) (new-price uint))
  (let (
    (diff (if (> new-price old-price)
            (- new-price old-price)
            (- old-price new-price)))
  )
    (/ (* diff u10000) old-price)
  )
)

;; Read-Only Functions

(define-read-only (get-validation-record (validation-id uint))
  (map-get? price-validation-history validation-id)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate oracle principals
(define-read-only (validate-oracle-principal (oracle principal))
  (principal-destruct? oracle)
)

;; 2. Clarity 4: int-to-ascii - Format price deviations
(define-read-only (format-price-deviation (deviation uint))
  (ok (int-to-ascii deviation))
)

;; 3. Clarity 4: string-to-uint? - Parse validation IDs
(define-read-only (parse-validation-id (id-str (string-ascii 20)))
  (match (string-to-uint? id-str)
    id (ok id)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track oracle validations
(define-read-only (get-oracle-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
