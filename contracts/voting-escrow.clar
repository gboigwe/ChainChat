;; title: voting-escrow
;; version: 1.0.0
;; summary: Vote-escrowed governance
;; description: Lock tokens for voting power - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4300))
(define-constant ERR-INVALID-LOCK (err u4301))
(define-constant ERR-LOCKED (err u4302))

;; Max lock duration (4 years in seconds)
(define-constant MAX-LOCK-DURATION u126144000)

;; Data Variables
(define-data-var total-locked uint u0)
(define-data-var total-voting-power uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map locked-balances principal {
  amount: uint,
  locked-until: uint,    ;; Clarity 4: Unix timestamp
  voting-power: uint
})

;; Public Functions

(define-public (create-lock (amount uint) (duration uint))
  (let (
    (unlock-time (+ stacks-block-time duration))
    (voting-power (calculate-voting-power amount duration))
  )
    (asserts! (<= duration MAX-LOCK-DURATION) ERR-INVALID-LOCK)

    (map-set locked-balances tx-sender {
      amount: amount,
      locked-until: unlock-time,
      voting-power: voting-power
    })

    (var-set total-locked (+ (var-get total-locked) amount))
    (var-set total-voting-power (+ (var-get total-voting-power) voting-power))

    (print {
      event: "lock-created",
      user: tx-sender,
      amount: amount,
      duration: duration,
      voting-power: voting-power,
      timestamp: stacks-block-time
    })

    (ok voting-power)
  )
)

(define-public (withdraw-lock)
  (let (
    (lock (unwrap! (map-get? locked-balances tx-sender) ERR-UNAUTHORIZED))
  )
    (asserts! (>= stacks-block-time (get locked-until lock)) ERR-LOCKED)

    (map-delete locked-balances tx-sender)
    (var-set total-locked (- (var-get total-locked) (get amount lock)))
    (var-set total-voting-power (- (var-get total-voting-power) (get voting-power lock)))

    (print {
      event: "lock-withdrawn",
      user: tx-sender,
      amount: (get amount lock),
      timestamp: stacks-block-time
    })

    (ok (get amount lock))
  )
)

;; Private Functions

(define-private (calculate-voting-power (amount uint) (duration uint))
  (/ (* amount duration) MAX-LOCK-DURATION)
)

;; Read-Only Functions

(define-read-only (get-locked-balance (user principal))
  (map-get? locked-balances user)
)

(define-read-only (get-voting-power (user principal))
  (match (map-get? locked-balances user)
    lock (ok (get voting-power lock))
    (ok u0)
  )
)

(define-read-only (get-total-locked)
  (var-get total-locked)
)
