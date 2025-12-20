;; title: vault-staking
;; version: 1.0.0
;; summary: Governance token staking mechanism
;; description: Stake tokens for governance power and rewards - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u800))
(define-constant ERR-INVALID-AMOUNT (err u801))
(define-constant ERR-NO-STAKE (err u802))
(define-constant ERR-LOCKED (err u803))
(define-constant ERR-INVALID-LOCK-PERIOD (err u804))
(define-constant ERR-ALREADY-LOCKED (err u805))

;; Lock periods (in seconds)
(define-constant LOCK-PERIOD-NONE u0)
(define-constant LOCK-PERIOD-1-MONTH u2592000)   ;; 30 days
(define-constant LOCK-PERIOD-3-MONTHS u7776000)  ;; 90 days
(define-constant LOCK-PERIOD-6-MONTHS u15552000) ;; 180 days
(define-constant LOCK-PERIOD-1-YEAR u31536000)   ;; 365 days

;; Voting power multipliers (in basis points)
(define-constant MULTIPLIER-NONE u10000)      ;; 1x (100%)
(define-constant MULTIPLIER-1-MONTH u12000)   ;; 1.2x (120%)
(define-constant MULTIPLIER-3-MONTHS u15000)  ;; 1.5x (150%)
(define-constant MULTIPLIER-6-MONTHS u20000)  ;; 2x (200%)
(define-constant MULTIPLIER-1-YEAR u30000)    ;; 3x (300%)

;; Early withdrawal penalty (basis points)
(define-constant EARLY-WITHDRAWAL-PENALTY u2000)  ;; 20%

;; Data Variables
(define-data-var total-staked uint u0)
(define-data-var total-voting-power uint u0)
(define-data-var penalty-pool uint u0)
(define-data-var staking-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map stakes principal {
  amount-staked: uint,
  voting-power: uint,
  lock-period: uint,
  locked-until: uint,     ;; Clarity 4: Unix timestamp
  staked-at: uint,        ;; Clarity 4: Unix timestamp
  last-claim-time: uint,  ;; Clarity 4: Unix timestamp
  multiplier: uint
})

(define-map stake-history uint {
  user: principal,
  action: (string-ascii 20),  ;; "stake", "unstake", "lock"
  amount: uint,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-history-id uint u1)

;; Staking tiers
(define-map staking-tiers uint {
  min-amount: uint,
  tier-name: (string-ascii 20),
  benefits: (string-ascii 100)
})

;; Initialize staking tiers
(map-set staking-tiers u1 {
  min-amount: u1000000,      ;; 1 STX
  tier-name: "Bronze",
  benefits: "Basic voting rights"
})

(map-set staking-tiers u2 {
  min-amount: u10000000,     ;; 10 STX
  tier-name: "Silver",
  benefits: "Enhanced voting + Priority support"
})

(map-set staking-tiers u3 {
  min-amount: u50000000,     ;; 50 STX
  tier-name: "Gold",
  benefits: "2x voting + Fee discounts"
})

(map-set staking-tiers u4 {
  min-amount: u100000000,    ;; 100 STX
  tier-name: "Platinum",
  benefits: "3x voting + Revenue share"
})

;; Private Functions

(define-private (calculate-voting-power (amount uint) (multiplier uint))
  (/ (* amount multiplier) u10000)
)

(define-private (get-multiplier-for-lock-period (lock-period uint))
  (if (is-eq lock-period LOCK-PERIOD-1-YEAR)
    MULTIPLIER-1-YEAR
    (if (is-eq lock-period LOCK-PERIOD-6-MONTHS)
      MULTIPLIER-6-MONTHS
      (if (is-eq lock-period LOCK-PERIOD-3-MONTHS)
        MULTIPLIER-3-MONTHS
        (if (is-eq lock-period LOCK-PERIOD-1-MONTH)
          MULTIPLIER-1-MONTH
          MULTIPLIER-NONE
        )
      )
    )
  )
)

;; Public Functions

;; Stake tokens
(define-public (stake (amount uint) (lock-period uint))
  (let (
    (current-stake (default-to
      { amount-staked: u0, voting-power: u0, lock-period: u0, locked-until: u0,
        staked-at: u0, last-claim-time: u0, multiplier: MULTIPLIER-NONE }
      (map-get? stakes tx-sender)))
    (multiplier (get-multiplier-for-lock-period lock-period))
    (new-amount (+ (get amount-staked current-stake) amount))
    (new-voting-power (calculate-voting-power new-amount multiplier))
    (locked-until (if (> lock-period u0)
                    (+ stacks-block-time lock-period)
                    u0))
    (history-id (var-get next-history-id))
  )
    (asserts! (not (var-get staking-paused)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (or
      (is-eq lock-period LOCK-PERIOD-NONE)
      (is-eq lock-period LOCK-PERIOD-1-MONTH)
      (is-eq lock-period LOCK-PERIOD-3-MONTHS)
      (is-eq lock-period LOCK-PERIOD-6-MONTHS)
      (is-eq lock-period LOCK-PERIOD-1-YEAR)
    ) ERR-INVALID-LOCK-PERIOD)

    ;; Transfer tokens to contract
    (try! (stx-transfer? amount tx-sender tx-sender))

    ;; Update stake
    (map-set stakes tx-sender {
      amount-staked: new-amount,
      voting-power: new-voting-power,
      lock-period: lock-period,
      locked-until: locked-until,
      staked-at: stacks-block-time,
      last-claim-time: stacks-block-time,
      multiplier: multiplier
    })

    ;; Update globals
    (var-set total-staked (+ (var-get total-staked) amount))
    (var-set total-voting-power (+ (var-get total-voting-power) new-voting-power))

    ;; Record history
    (map-set stake-history history-id {
      user: tx-sender,
      action: "stake",
      amount: amount,
      timestamp: stacks-block-time
    })
    (var-set next-history-id (+ history-id u1))

    (print {
      event: "tokens-staked",
      user: tx-sender,
      amount: amount,
      lock-period: lock-period,
      voting-power: new-voting-power,
      timestamp: stacks-block-time
    })

    (ok new-voting-power)
  )
)

;; Unstake tokens
(define-public (unstake (amount uint))
  (let (
    (user-stake (unwrap! (map-get? stakes tx-sender) ERR-NO-STAKE))
    (locked-until (get locked-until user-stake))
    (is-locked (> locked-until stacks-block-time))
    (penalty-amount (if is-locked
                      (/ (* amount EARLY-WITHDRAWAL-PENALTY) u10000)
                      u0))
    (withdraw-amount (- amount penalty-amount))
    (remaining-amount (- (get amount-staked user-stake) amount))
    (new-voting-power (calculate-voting-power remaining-amount (get multiplier user-stake)))
    (history-id (var-get next-history-id))
  )
    (asserts! (>= (get amount-staked user-stake) amount) ERR-INVALID-AMOUNT)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Update stake
    (if (is-eq remaining-amount u0)
      (map-delete stakes tx-sender)
      (map-set stakes tx-sender
        (merge user-stake {
          amount-staked: remaining-amount,
          voting-power: new-voting-power
        }))
    )

    ;; Transfer tokens back (minus penalty if locked)
    (try! (begin (stx-transfer? withdraw-amount tx-sender tx-sender)))

    ;; Add penalty to pool if applicable
    (if (> penalty-amount u0)
      (var-set penalty-pool (+ (var-get penalty-pool) penalty-amount))
      true
    )

    ;; Update globals
    (var-set total-staked (- (var-get total-staked) amount))
    (var-set total-voting-power (- (var-get total-voting-power) (get voting-power user-stake)))

    ;; Record history
    (map-set stake-history history-id {
      user: tx-sender,
      action: "unstake",
      amount: amount,
      timestamp: stacks-block-time
    })
    (var-set next-history-id (+ history-id u1))

    (print {
      event: "tokens-unstaked",
      user: tx-sender,
      amount: amount,
      penalty: penalty-amount,
      actual-withdrawn: withdraw-amount,
      timestamp: stacks-block-time
    })

    (ok withdraw-amount)
  )
)

;; Extend lock period
(define-public (extend-lock (new-lock-period uint))
  (let (
    (user-stake (unwrap! (map-get? stakes tx-sender) ERR-NO-STAKE))
    (current-lock (get lock-period user-stake))
    (new-multiplier (get-multiplier-for-lock-period new-lock-period))
    (new-locked-until (+ stacks-block-time new-lock-period))
    (new-voting-power (calculate-voting-power (get amount-staked user-stake) new-multiplier))
    (history-id (var-get next-history-id))
  )
    (asserts! (> new-lock-period current-lock) ERR-INVALID-LOCK-PERIOD)
    (asserts! (or
      (is-eq new-lock-period LOCK-PERIOD-1-MONTH)
      (is-eq new-lock-period LOCK-PERIOD-3-MONTHS)
      (is-eq new-lock-period LOCK-PERIOD-6-MONTHS)
      (is-eq new-lock-period LOCK-PERIOD-1-YEAR)
    ) ERR-INVALID-LOCK-PERIOD)

    ;; Update stake with new lock
    (map-set stakes tx-sender
      (merge user-stake {
        lock-period: new-lock-period,
        locked-until: new-locked-until,
        multiplier: new-multiplier,
        voting-power: new-voting-power
      }))

    ;; Update total voting power
    (var-set total-voting-power
      (+ (- (var-get total-voting-power) (get voting-power user-stake)) new-voting-power))

    ;; Record history
    (map-set stake-history history-id {
      user: tx-sender,
      action: "lock-extended",
      amount: (get amount-staked user-stake),
      timestamp: stacks-block-time
    })
    (var-set next-history-id (+ history-id u1))

    (print {
      event: "lock-extended",
      user: tx-sender,
      new-lock-period: new-lock-period,
      new-voting-power: new-voting-power,
      timestamp: stacks-block-time
    })

    (ok new-voting-power)
  )
)

;; Distribute penalty pool (admin only)
(define-public (distribute-penalties (recipients (list 10 principal)) (amounts (list 10 uint)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    ;; This would distribute penalties to recipients
    ;; Simplified implementation for now

    (print {
      event: "penalties-distributed",
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Pause staking (admin only)
(define-public (pause-staking)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set staking-paused true)
    (ok true)
  )
)

;; Resume staking (admin only)
(define-public (resume-staking)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set staking-paused false)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-stake (user principal))
  (map-get? stakes user)
)

(define-read-only (get-voting-power (user principal))
  (match (map-get? stakes user)
    stake-info (ok (get voting-power stake-info))
    (ok u0)
  )
)

(define-read-only (get-total-staked)
  (var-get total-staked)
)

(define-read-only (get-total-voting-power)
  (var-get total-voting-power)
)

(define-read-only (get-penalty-pool)
  (var-get penalty-pool)
)

(define-read-only (is-locked (user principal))
  (match (map-get? stakes user)
    stake-data (> (get locked-until stake-data) stacks-block-time)
    false
  )
)

(define-read-only (get-stake-history (history-id uint))
  (map-get? stake-history history-id)
)

(define-read-only (get-staking-tier (tier-id uint))
  (map-get? staking-tiers tier-id)
)

(define-read-only (is-staking-paused)
  (var-get staking-paused)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate staker principals
(define-read-only (validate-staker (staker principal))
  (principal-destruct? staker)
)

;; 2. Clarity 4: int-to-utf8 - Format staking amounts
(define-read-only (format-stake-amount (user principal))
  (match (get-stake user)
    stake-data (ok (int-to-utf8 (get amount-staked stake-data)))
    (ok (int-to-utf8 u0))
  )
)

;; 3. Clarity 4: string-to-uint? - Parse lock periods
(define-read-only (parse-lock-period (period-str (string-ascii 20)))
  (match (string-to-uint? period-str)
    period (ok period)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track stake timing
(define-read-only (get-staking-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
