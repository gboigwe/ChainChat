;; title: validation-utils
;; version: 1.0.0
;; summary: Input validation utilities
;; description: Validate inputs and data - Clarity 4

;; Constants
(define-constant ERR-INVALID-AMOUNT (err u7000))
(define-constant ERR-INVALID-ADDRESS (err u7001))
(define-constant ERR-INVALID-PERCENTAGE (err u7002))

;; Read-Only Functions

(define-read-only (is-valid-amount (amount uint))
  (> amount u0)
)

(define-read-only (is-within-range (value uint) (min-val uint) (max-val uint))
  (and (>= value min-val) (<= value max-val))
)

(define-read-only (is-valid-percentage (percent uint))
  ;; Percentage in basis points (0-10000 = 0-100%)
  (<= percent u10000)
)

(define-read-only (is-valid-fee (fee uint))
  ;; Fee in basis points (max 20% = 2000)
  (<= fee u2000)
)

(define-read-only (is-non-zero-principal (address principal))
  ;; In Clarity, we can't directly check if principal is "zero address"
  ;; but we can verify it's not the contract itself in some cases
  (not (is-eq address tx-sender))
)

(define-read-only (is-valid-ltv (ltv uint))
  ;; LTV in basis points (max 90% = 9000)
  (and (> ltv u0) (<= ltv u9000))
)

(define-read-only (is-valid-collateralization (ratio uint))
  ;; Min collateralization ratio 110% = 11000 basis points
  (>= ratio u11000)
)

(define-read-only (is-sufficient-balance (balance uint) (required uint))
  (>= balance required)
)

(define-read-only (is-valid-slippage (slippage uint))
  ;; Max slippage 10% = 1000 basis points
  (<= slippage u1000)
)

(define-read-only (is-valid-duration (duration uint))
  ;; Duration in seconds (min 1 hour, max 4 years)
  (and (>= duration u3600) (<= duration u126144000))
)

(define-read-only (is-future-timestamp (timestamp uint))
  (> timestamp stacks-block-time)
)

(define-read-only (is-past-timestamp (timestamp uint))
  (< timestamp stacks-block-time)
)

(define-read-only (is-valid-price (price uint))
  (and (> price u0) (< price u1000000000000))
)

(define-read-only (validate-transfer-amount (amount uint) (balance uint))
  (and
    (> amount u0)
    (>= balance amount)
  )
)

(define-read-only (validate-swap-params
  (amount-in uint)
  (min-amount-out uint)
  (max-slippage uint))
  (and
    (> amount-in u0)
    (> min-amount-out u0)
    (<= max-slippage u1000)
  )
)

(define-read-only (is-valid-apy (apy uint))
  ;; APY in basis points (max 1000% = 100000)
  (<= apy u100000)
)

(define-read-only (check-minimum-deposit (amount uint))
  ;; Minimum deposit 1 STX = 1000000 micro-STX
  (>= amount u1000000)
)
