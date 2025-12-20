;; title: analytics-tracker
;; version: 1.0.0
;; summary: Protocol analytics tracking
;; description: Track user activities and events - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5200))

;; Event types
(define-constant EVENT-DEPOSIT u1)
(define-constant EVENT-WITHDRAWAL u2)
(define-constant EVENT-SWAP u3)
(define-constant EVENT-STAKE u4)
(define-constant EVENT-UNSTAKE u5)

;; Data Variables
(define-data-var total-events uint u0)
(define-data-var next-event-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map user-activity-summary principal {
  total-events: uint,
  first-seen: uint,  ;; Clarity 4: Unix timestamp
  last-seen: uint,
  deposit-count: uint,
  withdrawal-count: uint,
  total-volume: uint
})

(define-map analytics-events uint {
  user: principal,
  event-type: uint,
  amount: uint,
  timestamp: uint,  ;; Clarity 4: Unix timestamp
  metadata: (string-ascii 200)
})

(define-map daily-volume uint {
  date: uint,  ;; Day timestamp
  total-deposits: uint,
  total-withdrawals: uint,
  unique-users: uint,
  total-transactions: uint
})

;; Public Functions

(define-public (track-event
  (event-type uint)
  (amount uint)
  (metadata (string-ascii 200)))
  (let (
    (event-id (var-get next-event-id))
    (user tx-sender)
    (summary (default-to
      { total-events: u0, first-seen: stacks-block-time, last-seen: u0,
        deposit-count: u0, withdrawal-count: u0, total-volume: u0 }
      (map-get? user-activity-summary user)))
  )
    (map-set analytics-events event-id {
      user: user,
      event-type: event-type,
      amount: amount,
      timestamp: stacks-block-time,
      metadata: metadata
    })

    (map-set user-activity-summary user {
      total-events: (+ (get total-events summary) u1),
      first-seen: (get first-seen summary),
      last-seen: stacks-block-time,
      deposit-count: (if (is-eq event-type EVENT-DEPOSIT)
        (+ (get deposit-count summary) u1)
        (get deposit-count summary)),
      withdrawal-count: (if (is-eq event-type EVENT-WITHDRAWAL)
        (+ (get withdrawal-count summary) u1)
        (get withdrawal-count summary)),
      total-volume: (+ (get total-volume summary) amount)
    })

    (var-set next-event-id (+ event-id u1))
    (var-set total-events (+ (var-get total-events) u1))

    (print {
      event: "analytics-tracked",
      event-id: event-id,
      user: user,
      type: event-type,
      timestamp: stacks-block-time
    })

    (ok event-id)
  )
)

;; Read-Only Functions

(define-read-only (get-user-summary (user principal))
  (map-get? user-activity-summary user)
)

(define-read-only (get-event (event-id uint))
  (map-get? analytics-events event-id)
)

(define-read-only (get-total-events)
  (var-get total-events)
)

(define-read-only (get-daily-volume (day-timestamp uint))
  (map-get? daily-volume day-timestamp)
)
