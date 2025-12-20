;; title: strategy-borrowing
;; version: 1.0.0
;; summary: Collateralized borrowing strategy
;; description: Leverage positions through borrowing - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2900))
(define-constant ERR-INVALID-AMOUNT (err u2901))
(define-constant ERR-INSUFFICIENT-COLLATERAL (err u2902))
(define-constant ERR-NO-LOAN (err u2903))

;; Collateral ratios (in basis points)
(define-constant MIN-COLLATERAL-RATIO u15000)  ;; 150%

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-borrowed uint u0)
(define-data-var total-collateral uint u0)
(define-data-var next-loan-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map borrow-positions uint {
  borrower: principal,
  collateral-amount: uint,
  borrowed-amount: uint,
  interest-rate: uint,
  borrowed-at: uint,      ;; Clarity 4: Unix timestamp
  interest-accrued: uint,
  is-active: bool
})

;; Public Functions

(define-public (borrow-with-collateral (collateral uint) (borrow-amount uint))
  (let (
    (loan-id (var-get next-loan-id))
    (collateral-ratio (/ (* collateral u10000) borrow-amount))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (> collateral u0) ERR-INVALID-AMOUNT)
    (asserts! (>= collateral-ratio MIN-COLLATERAL-RATIO) ERR-INSUFFICIENT-COLLATERAL)

    (map-set borrow-positions loan-id {
      borrower: tx-sender,
      collateral-amount: collateral,
      borrowed-amount: borrow-amount,
      interest-rate: u800,  ;; 8% APY
      borrowed-at: stacks-block-time,
      interest-accrued: u0,
      is-active: true
    })

    (var-set next-loan-id (+ loan-id u1))
    (var-set total-borrowed (+ (var-get total-borrowed) borrow-amount))
    (var-set total-collateral (+ (var-get total-collateral) collateral))

    (print {
      event: "loan-created",
      loan-id: loan-id,
      collateral: collateral,
      borrowed: borrow-amount,
      timestamp: stacks-block-time
    })

    (ok loan-id)
  )
)

(define-public (repay-loan (loan-id uint))
  (let (
    (loan (unwrap! (map-get? borrow-positions loan-id) ERR-NO-LOAN))
    (interest (calculate-interest loan-id))
    (total-repay (+ (get borrowed-amount loan) interest))
  )
    (asserts! (is-eq tx-sender (get borrower loan)) ERR-UNAUTHORIZED)
    (asserts! (get is-active loan) ERR-NO-LOAN)

    (map-set borrow-positions loan-id
      (merge loan { is-active: false }))

    (var-set total-borrowed (- (var-get total-borrowed) (get borrowed-amount loan)))
    (var-set total-collateral (- (var-get total-collateral) (get collateral-amount loan)))

    (print {
      event: "loan-repaid",
      loan-id: loan-id,
      repaid: total-repay,
      timestamp: stacks-block-time
    })

    (ok total-repay)
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

(define-private (calculate-interest (loan-id uint))
  (let (
    (loan (unwrap! (map-get? borrow-positions loan-id) u0))
    (time-elapsed (- stacks-block-time (get borrowed-at loan)))
    (rate (get interest-rate loan))
  )
    (/ (* (get borrowed-amount loan) (* rate time-elapsed)) (* u10000 u31536000))
  )
)

;; Read-Only Functions

(define-read-only (get-loan (loan-id uint))
  (map-get? borrow-positions loan-id)
)

(define-read-only (get-total-borrowed)
  (var-get total-borrowed)
)

(define-read-only (get-total-collateral)
  (var-get total-collateral)
)
