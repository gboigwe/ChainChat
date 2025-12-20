;; title: strategy-delta-neutral
;; version: 1.0.0
;; summary: Delta-neutral hedging strategy
;; description: Market-neutral positions for stable returns - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u3100))
(define-constant ERR-INVALID-AMOUNT (err u3101))
(define-constant ERR-NO-POSITION (err u3102))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-positions uint u0)
(define-data-var next-position-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map delta-neutral-positions uint {
  trader: principal,
  long-amount: uint,
  short-amount: uint,
  funding-rate: uint,
  created-at: uint,    ;; Clarity 4: Unix timestamp
  pnl: uint,
  is-active: bool
})

;; Public Functions

(define-public (open-delta-neutral (long uint) (short uint))
  (let (
    (position-id (var-get next-position-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (is-eq long short) ERR-INVALID-AMOUNT)

    (map-set delta-neutral-positions position-id {
      trader: tx-sender,
      long-amount: long,
      short-amount: short,
      funding-rate: u0,
      created-at: stacks-block-time,
      pnl: u0,
      is-active: true
    })

    (var-set next-position-id (+ position-id u1))
    (var-set total-positions (+ (var-get total-positions) u1))

    (print {
      event: "delta-neutral-opened",
      position-id: position-id,
      timestamp: stacks-block-time
    })

    (ok position-id)
  )
)

(define-public (close-delta-neutral (position-id uint))
  (let (
    (position (unwrap! (map-get? delta-neutral-positions position-id) ERR-NO-POSITION))
  )
    (asserts! (is-eq tx-sender (get trader position)) ERR-UNAUTHORIZED)

    (map-set delta-neutral-positions position-id
      (merge position { is-active: false }))

    (print {
      event: "delta-neutral-closed",
      position-id: position-id,
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

(define-read-only (get-position (position-id uint))
  (map-get? delta-neutral-positions position-id)
)
