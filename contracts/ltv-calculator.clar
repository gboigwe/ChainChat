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
