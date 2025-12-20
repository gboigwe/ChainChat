;; title: token-vesting
;; version: 1.0.0
;; summary: Token vesting schedules
;; description: Lock tokens with vesting schedules - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4100))
(define-constant ERR-NO-SCHEDULE (err u4101))
(define-constant ERR-NOTHING-TO-CLAIM (err u4102))

;; Data Variables
(define-data-var next-schedule-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map vesting-schedules uint {
  beneficiary: principal,
  total-amount: uint,
  claimed-amount: uint,
  start-time: uint,       ;; Clarity 4: Unix timestamp
  cliff-duration: uint,
  vesting-duration: uint,
  is-revocable: bool,
  is-revoked: bool
})

;; Public Functions

(define-public (create-vesting-schedule
  (beneficiary principal)
  (amount uint)
  (cliff-duration uint)
  (vesting-duration uint)
  (revocable bool))
  (let (
    (schedule-id (var-get next-schedule-id))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set vesting-schedules schedule-id {
      beneficiary: beneficiary,
      total-amount: amount,
      claimed-amount: u0,
      start-time: stacks-block-time,
      cliff-duration: cliff-duration,
      vesting-duration: vesting-duration,
      is-revocable: revocable,
      is-revoked: false
    })

    (var-set next-schedule-id (+ schedule-id u1))

    (print {
      event: "vesting-schedule-created",
      schedule-id: schedule-id,
      beneficiary: beneficiary,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok schedule-id)
  )
)

(define-public (claim-vested-tokens (schedule-id uint))
  (let (
    (schedule (unwrap! (map-get? vesting-schedules schedule-id) ERR-NO-SCHEDULE))
    (vested-amount (try! (calculate-vested-amount schedule-id)))
    (claimable (- vested-amount (get claimed-amount schedule)))
  )
    (asserts! (is-eq tx-sender (get beneficiary schedule)) ERR-UNAUTHORIZED)
    (asserts! (> claimable u0) ERR-NOTHING-TO-CLAIM)
    (asserts! (not (get is-revoked schedule)) ERR-UNAUTHORIZED)

    (map-set vesting-schedules schedule-id
      (merge schedule {
        claimed-amount: (+ (get claimed-amount schedule) claimable)
      }))

    (print {
      event: "vested-tokens-claimed",
      schedule-id: schedule-id,
      amount: claimable,
      timestamp: stacks-block-time
    })

    (ok claimable)
  )
)

;; Private Functions

(define-private (calculate-vested-amount (schedule-id uint))
  (let (
    (schedule (unwrap! (map-get? vesting-schedules schedule-id) (err u0)))
    (elapsed (- stacks-block-time (get start-time schedule)))
    (cliff-time (get cliff-duration schedule))
    (vesting-time (get vesting-duration schedule))
    (total (get total-amount schedule))
  )
    (if (< elapsed cliff-time)
      (ok u0)
      (if (>= elapsed vesting-time)
        (ok total)
        (ok (/ (* total elapsed) vesting-time))
      )
    )
  )
)

;; Read-Only Functions

(define-read-only (get-vesting-schedule (schedule-id uint))
  (map-get? vesting-schedules schedule-id)
)

(define-read-only (get-vested-amount (schedule-id uint))
  (calculate-vested-amount schedule-id)
)
