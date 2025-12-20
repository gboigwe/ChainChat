;; title: strategy-lending
;; version: 1.0.0
;; summary: Automated lending protocol aggregator
;; description: Optimize lending across Zest/Arkadiko - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2800))
(define-constant ERR-INVALID-AMOUNT (err u2801))
(define-constant ERR-NO-POSITION (err u2802))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-lent uint u0)
(define-data-var total-interest-earned uint u0)
(define-data-var next-position-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map lending-positions uint {
  lender: principal,
  protocol: (string-ascii 50),
  amount: uint,
  interest-rate: uint,
  lent-at: uint,          ;; Clarity 4: Unix timestamp
  interest-earned: uint,
  is-active: bool
})

;; Public Functions

(define-public (lend-assets (protocol (string-ascii 50)) (amount uint))
  (let (
    (position-id (var-get next-position-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    (map-set lending-positions position-id {
      lender: tx-sender,
      protocol: protocol,
      amount: amount,
      interest-rate: u500,  ;; 5% APY
      lent-at: stacks-block-time,
      interest-earned: u0,
      is-active: true
    })

    (var-set next-position-id (+ position-id u1))
    (var-set total-lent (+ (var-get total-lent) amount))

    (print {
      event: "assets-lent",
      position-id: position-id,
      protocol: protocol,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok position-id)
  )
)

(define-public (withdraw-lending (position-id uint))
  (let (
    (position (unwrap! (map-get? lending-positions position-id) ERR-NO-POSITION))
    (interest (calculate-interest position-id))
  )
    (asserts! (is-eq tx-sender (get lender position)) ERR-UNAUTHORIZED)
    (asserts! (get is-active position) ERR-NO-POSITION)

    (map-set lending-positions position-id
      (merge position { is-active: false }))

    (var-set total-lent (- (var-get total-lent) (get amount position)))
    (var-set total-interest-earned (+ (var-get total-interest-earned) interest))

    (print {
      event: "lending-withdrawn",
      position-id: position-id,
      amount: (get amount position),
      interest: interest,
      timestamp: stacks-block-time
    })

    (ok (+ (get amount position) interest))
  )
)

(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

;; Private Functions

(define-private (calculate-interest (position-id uint))
  (let (
    (position (unwrap! (map-get? lending-positions position-id) u0))
    (time-elapsed (- stacks-block-time (get lent-at position)))
    (rate (get interest-rate position))
  )
    (/ (* (get amount position) (* rate time-elapsed)) (* u10000 u31536000))
  )
)

;; Read-Only Functions

(define-read-only (get-position (position-id uint))
  (map-get? lending-positions position-id)
)

(define-read-only (get-total-lent)
  (var-get total-lent)
)

(define-read-only (get-total-interest)
  (var-get total-interest-earned)
)
