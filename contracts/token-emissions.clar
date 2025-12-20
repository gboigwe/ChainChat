;; title: token-emissions
;; version: 1.0.0
;; summary: Token emission schedule
;; description: Control token inflation and emissions - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4600))
(define-constant ERR-NO-EMISSIONS (err u4601))

;; Emission rate (tokens per second)
(define-constant INITIAL-EMISSION-RATE u100)

;; Data Variables
(define-data-var current-emission-rate uint INITIAL-EMISSION-RATE)
(define-data-var total-emitted uint u0)
(define-data-var last-emission-time uint u0)
(define-data-var emissions-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map emission-history uint {
  amount: uint,
  recipient: principal,
  emitted-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-emission-id uint u1)

;; Public Functions

(define-public (mint-emissions (recipient principal))
  (let (
    (time-elapsed (- stacks-block-time (var-get last-emission-time)))
    (emission-amount (* time-elapsed (var-get current-emission-rate)))
    (emission-id (var-get next-emission-id))
  )
    (asserts! (not (var-get emissions-paused)) ERR-UNAUTHORIZED)
    (asserts! (> emission-amount u0) ERR-NO-EMISSIONS)

    (map-set emission-history emission-id {
      amount: emission-amount,
      recipient: recipient,
      emitted-at: stacks-block-time
    })

    (var-set total-emitted (+ (var-get total-emitted) emission-amount))
    (var-set last-emission-time stacks-block-time)
    (var-set next-emission-id (+ emission-id u1))

    (print {
      event: "tokens-emitted",
      amount: emission-amount,
      recipient: recipient,
      timestamp: stacks-block-time
    })

    (ok emission-amount)
  )
)

(define-public (update-emission-rate (new-rate uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (var-set current-emission-rate new-rate)

    (print {
      event: "emission-rate-updated",
      new-rate: new-rate,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (pause-emissions)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set emissions-paused true)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-emission-rate)
  (var-get current-emission-rate)
)

(define-read-only (get-total-emitted)
  (var-get total-emitted)
)

(define-read-only (get-emission-record (emission-id uint))
  (map-get? emission-history emission-id)
)

(define-read-only (is-emissions-paused)
  (var-get emissions-paused)
)
