;; title: ltv-calculator
;; version: 1.0.0
;; summary: Loan-to-Value calculator
;; description: Calculate LTV ratios for positions - Clarity 4

;; Constants
(define-constant ERR-INVALID-INPUT (err u5800))

;; Read-Only Functions

(define-read-only (calculate-ltv (debt uint) (collateral uint))
  (if (is-eq collateral u0)
    (err ERR-INVALID-INPUT)
    (ok (/ (* debt u10000) collateral))
  )
)

(define-read-only (calculate-max-borrow (collateral uint) (max-ltv uint))
  (ok (/ (* collateral max-ltv) u10000))
)

(define-read-only (calculate-required-collateral (debt uint) (max-ltv uint))
  (ok (/ (* debt u10000) max-ltv))
)

(define-read-only (is-healthy (debt uint) (collateral uint) (threshold uint))
  (ok (< (/ (* debt u10000) collateral) threshold))
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: int-to-ascii - Format LTV values for display
(define-read-only (format-ltv-value (ltv uint))
  (ok (int-to-ascii ltv))
)

;; 2. Clarity 4: string-to-uint? - Parse LTV values from strings
(define-read-only (parse-ltv-string (ltv-str (string-ascii 10)))
  (match (string-to-uint? ltv-str)
    ltv (if (<= ltv u10000) (ok ltv) (err u997))
    (err u998)
  )
)

;; 3. Clarity 4: buff-to-uint-le - Decode LTV from buffer
(define-read-only (decode-ltv-buffer (ltv-buff (buff 16)))
  (ok (buff-to-uint-le ltv-buff))
)

;; 4. Clarity 4: burn-block-height - Get timing for LTV calculations
(define-read-only (get-ltv-calc-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
