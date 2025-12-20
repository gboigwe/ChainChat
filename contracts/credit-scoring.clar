;; title: credit-scoring
;; version: 1.0.0
;; summary: On-chain credit scoring
;; description: Calculate credit scores for users - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5700))

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map credit-scores principal {
  score: uint,
  history-length: uint,
  default-count: uint,
  updated-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (update-credit-score (user principal) (score uint))
  (let (
    (current-score (default-to {score: u0, history-length: u0, default-count: u0, updated-at: u0}
      (map-get? credit-scores user)))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set credit-scores user {
      score: score,
      history-length: (+ (get history-length current-score) u1),
      default-count: (get default-count current-score),
      updated-at: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-credit-score (user principal))
  (map-get? credit-scores user)
)
