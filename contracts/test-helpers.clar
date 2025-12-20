;; title: test-helpers
;; version: 1.0.0
;; summary: Testing helper functions
;; description: Utilities for contract testing - Clarity 4

;; Constants
(define-constant TEST-AMOUNT u1000000)  ;; 1 token with 6 decimals
(define-constant TEST-ADDRESS-1 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
(define-constant TEST-ADDRESS-2 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)

;; Read-Only Functions

(define-read-only (create-test-data)
  (ok {
    amount: TEST-AMOUNT,
    sender: TEST-ADDRESS-1,
    recipient: TEST-ADDRESS-2,
    timestamp: stacks-block-time
  })
)

(define-read-only (calculate-test-fee (amount uint))
  (ok (/ (* amount u30) u10000))  ;; 0.3%
)

(define-read-only (is-test-amount (amount uint))
  (is-eq amount TEST-AMOUNT)
)

(define-read-only (verify-test-range (value uint) (expected uint) (tolerance uint))
  (let (
    (diff (if (> value expected)
            (- value expected)
            (- expected value)))
  )
    (<= diff tolerance)
  )
)

(define-read-only (generate-test-hash (seed uint))
  (ok (keccak256 seed))
)

(define-read-only (create-test-tuple (a uint) (b uint) (c principal))
  (ok {
    value-a: a,
    value-b: b,
    address: c
  })
)

(define-read-only (mock-balance-check (user principal) (required uint))
  ;; Always returns true for testing
  (ok true)
)

(define-read-only (simulate-time-passage (current-time uint) (seconds uint))
  (ok (+ current-time seconds))
)

(define-read-only (calculate-percentage (amount uint) (percent uint))
  (ok (/ (* amount percent) u10000))
)

(define-read-only (verify-signature-format (sig (buff 65)))
  (ok (is-eq (len sig) u65))
)

(define-read-only (mock-price-feed (symbol (string-ascii 20)))
  ;; Returns mock price of $100 with 6 decimals
  (ok u100000000)
)

(define-read-only (simulate-liquidation-check (health-factor uint))
  (ok (< health-factor u10000))  ;; Below 1.0 = liquidatable
)

(define-read-only (calculate-test-rewards (staked uint) (duration uint))
  ;; Simple 10% APY calculation
  (ok (/ (* (* staked u10) duration) u31536000))
)
