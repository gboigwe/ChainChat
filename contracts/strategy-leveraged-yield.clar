;; title: strategy-leveraged-yield
;; version: 1.0.0
;; summary: Leveraged yield farming strategy
;; description: Amplify yields through leverage - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u3000))
(define-constant ERR-INVALID-LEVERAGE (err u3001))
(define-constant ERR-NO-POSITION (err u3002))

;; Maximum leverage (3x)
(define-constant MAX-LEVERAGE u300)

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-positions uint u0)
(define-data-var next-position-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map leveraged-positions uint {
  user: principal,
  collateral: uint,
  borrowed: uint,
  leverage-ratio: uint,
  entry-price: uint,
  created-at: uint,    ;; Clarity 4: Unix timestamp
  is-active: bool
})

;; Public Functions

(define-public (open-leveraged-position (collateral uint) (leverage uint))
  (let (
    (position-id (var-get next-position-id))
    (borrowed (/ (* collateral (* leverage u100)) u100))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (<= leverage MAX-LEVERAGE) ERR-INVALID-LEVERAGE)

    (map-set leveraged-positions position-id {
      user: tx-sender,
      collateral: collateral,
      borrowed: borrowed,
      leverage-ratio: leverage,
      entry-price: u1000000,
      created-at: stacks-block-time,
      is-active: true
    })

    (var-set next-position-id (+ position-id u1))
    (var-set total-positions (+ (var-get total-positions) u1))

    (print {
      event: "leveraged-position-opened",
      position-id: position-id,
      leverage: leverage,
      timestamp: stacks-block-time
    })

    (ok position-id)
  )
)

(define-public (close-position (position-id uint))
  (let (
    (position (unwrap! (map-get? leveraged-positions position-id) ERR-NO-POSITION))
  )
    (asserts! (is-eq tx-sender (get user position)) ERR-UNAUTHORIZED)

    (map-set leveraged-positions position-id
      (merge position { is-active: false }))

    (print {
      event: "position-closed",
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
  (map-get? leveraged-positions position-id)
)

(define-read-only (get-total-positions)
  (var-get total-positions)
)
