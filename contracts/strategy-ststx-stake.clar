;; title: strategy-ststx-stake
;; version: 1.0.0
;; summary: stSTX liquid staking strategy
;; description: Stack STX via Stackswap stSTX - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2300))
(define-constant ERR-INVALID-AMOUNT (err u2301))
(define-constant ERR-NO-POSITION (err u2302))
(define-constant ERR-COOLDOWN-ACTIVE (err u2303))
(define-constant ERR-STRATEGY-PAUSED (err u2304))

;; Unstaking cooldown (21 days in seconds)
(define-constant UNSTAKE-COOLDOWN u1814400)

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-stx-staked uint u0)
(define-data-var total-ststx-minted uint u0)
(define-data-var next-stake-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map stake-positions uint {
  staker: principal,
  stx-amount: uint,
  ststx-amount: uint,
  staked-at: uint,       ;; Clarity 4: Unix timestamp
  unstake-initiated: uint,  ;; Clarity 4: Unix timestamp
  rewards-earned: uint,
  is-active: bool,
  is-unstaking: bool
})

;; Public Functions

;; Stake STX for stSTX
(define-public (stake-stx (amount uint))
  (let (
    (stake-id (var-get next-stake-id))
    (ststx-amount (calculate-ststx-amount amount))
  )
    (asserts! (not (var-get strategy-paused)) ERR-STRATEGY-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer STX and mint stSTX (simplified)
    (try! (stx-transfer? amount tx-sender tx-sender))

    (map-set stake-positions stake-id {
      staker: tx-sender,
      stx-amount: amount,
      ststx-amount: ststx-amount,
      staked-at: stacks-block-time,
      unstake-initiated: u0,
      rewards-earned: u0,
      is-active: true,
      is-unstaking: false
    })

    (var-set next-stake-id (+ stake-id u1))
    (var-set total-stx-staked (+ (var-get total-stx-staked) amount))
    (var-set total-ststx-minted (+ (var-get total-ststx-minted) ststx-amount))

    (print {
      event: "stx-staked",
      stake-id: stake-id,
      staker: tx-sender,
      stx-amount: amount,
      ststx-amount: ststx-amount,
      timestamp: stacks-block-time
    })

    (ok stake-id)
  )
)

;; Initiate unstaking
(define-public (initiate-unstake (stake-id uint))
  (let (
    (position (unwrap! (map-get? stake-positions stake-id) ERR-NO-POSITION))
  )
    (asserts! (is-eq tx-sender (get staker position)) ERR-UNAUTHORIZED)
    (asserts! (get is-active position) ERR-NO-POSITION)
    (asserts! (not (get is-unstaking position)) ERR-COOLDOWN-ACTIVE)

    (map-set stake-positions stake-id
      (merge position {
        unstake-initiated: stacks-block-time,
        is-unstaking: true
      }))

    (print {
      event: "unstake-initiated",
      stake-id: stake-id,
      cooldown-ends: (+ stacks-block-time UNSTAKE-COOLDOWN),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Complete unstaking after cooldown
(define-public (complete-unstake (stake-id uint))
  (let (
    (position (unwrap! (map-get? stake-positions stake-id) ERR-NO-POSITION))
    (cooldown-elapsed (>= (- stacks-block-time (get unstake-initiated position)) UNSTAKE-COOLDOWN))
  )
    (asserts! (is-eq tx-sender (get staker position)) ERR-UNAUTHORIZED)
    (asserts! (get is-unstaking position) ERR-NO-POSITION)
    (asserts! cooldown-elapsed ERR-COOLDOWN-ACTIVE)

    ;; Transfer STX back (simplified)
    (try! (begin (stx-transfer? (get stx-amount position) tx-sender (get staker position))))

    (map-set stake-positions stake-id
      (merge position { is-active: false }))

    (var-set total-stx-staked (- (var-get total-stx-staked) (get stx-amount position)))

    (print {
      event: "unstake-completed",
      stake-id: stake-id,
      stx-returned: (get stx-amount position),
      timestamp: stacks-block-time
    })

    (ok (get stx-amount position))
  )
)

;; Pause strategy
(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

;; Resume strategy
(define-public (resume-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused false)
    (ok true)
  )
)

;; Private Functions

(define-private (calculate-ststx-amount (stx-amount uint))
  ;; Simplified 1:1 ratio for now
  stx-amount
)

;; Read-Only Functions

(define-read-only (get-position (stake-id uint))
  (map-get? stake-positions stake-id)
)

(define-read-only (get-total-staked)
  (var-get total-stx-staked)
)

(define-read-only (is-strategy-paused)
  (var-get strategy-paused)
)
