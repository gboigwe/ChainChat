;; title: proposal-executor
;; version: 1.0.0
;; summary: Execute governance proposals
;; description: Execute approved proposals automatically - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4400))
(define-constant ERR-NOT-PASSED (err u4401))
(define-constant ERR-ALREADY-EXECUTED (err u4402))

;; Data Variables
(define-data-var total-executed uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map executed-proposals uint {
  proposal-id: uint,
  executed-by: principal,
  executed-at: uint,  ;; Clarity 4: Unix timestamp
  success: bool
})

;; Public Functions

(define-public (execute-proposal (proposal-id uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set executed-proposals proposal-id {
      proposal-id: proposal-id,
      executed-by: tx-sender,
      executed-at: stacks-block-time,
      success: true
    })

    (var-set total-executed (+ (var-get total-executed) u1))

    (print {
      event: "proposal-executed",
      proposal-id: proposal-id,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-execution-record (proposal-id uint))
  (map-get? executed-proposals proposal-id)
)

(define-read-only (get-total-executed)
  (var-get total-executed)
)
