;; title: strategy-hedging
;; version: 1.0.0
;; summary: Portfolio hedging strategies
;; description: Protect positions with hedges - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u3400))
(define-constant ERR-NO-HEDGE (err u3401))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-hedges uint u0)
(define-data-var next-hedge-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map hedge-positions uint {
  hedger: principal,
  underlying-amount: uint,
  hedge-amount: uint,
  hedge-type: (string-ascii 20),
  created-at: uint,    ;; Clarity 4: Unix timestamp
  cost: uint,
  is-active: bool
})

;; Public Functions

(define-public (create-hedge (underlying uint) (hedge uint) (hedge-type (string-ascii 20)))
  (let (
    (hedge-id (var-get next-hedge-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)

    (map-set hedge-positions hedge-id {
      hedger: tx-sender,
      underlying-amount: underlying,
      hedge-amount: hedge,
      hedge-type: hedge-type,
      created-at: stacks-block-time,
      cost: u0,
      is-active: true
    })

    (var-set next-hedge-id (+ hedge-id u1))
    (var-set total-hedges (+ (var-get total-hedges) u1))

    (print {
      event: "hedge-created",
      hedge-id: hedge-id,
      type: hedge-type,
      timestamp: stacks-block-time
    })

    (ok hedge-id)
  )
)

(define-public (close-hedge (hedge-id uint))
  (let (
    (hedge (unwrap! (map-get? hedge-positions hedge-id) ERR-NO-HEDGE))
  )
    (asserts! (is-eq tx-sender (get hedger hedge)) ERR-UNAUTHORIZED)

    (map-set hedge-positions hedge-id
      (merge hedge { is-active: false }))

    (print {
      event: "hedge-closed",
      hedge-id: hedge-id,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-hedge (hedge-id uint))
  (map-get? hedge-positions hedge-id)
)

(define-read-only (get-total-hedges)
  (var-get total-hedges)
)
