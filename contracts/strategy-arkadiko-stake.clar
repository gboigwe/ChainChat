;; title: strategy-arkadiko-stake
;; version: 1.0.0
;; summary: Arkadiko protocol staking strategy
;; description: Auto-compound DIKO staking rewards - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2100))
(define-constant ERR-INVALID-AMOUNT (err u2101))
(define-constant ERR-NO-STAKE (err u2102))
(define-constant ERR-LOCKED (err u2103))
(define-constant ERR-STRATEGY-PAUSED (err u2104))

;; Compound intervals (in seconds)
(define-constant MIN-COMPOUND-INTERVAL u86400)  ;; 24 hours

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-staked uint u0)
(define-data-var total-rewards-earned uint u0)
(define-data-var total-compounded uint u0)
(define-data-var next-stake-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map stake-positions uint {
  staker: principal,
  amount-staked: uint,
  rewards-accumulated: uint,
  stake-start: uint,        ;; Clarity 4: Unix timestamp
  last-compound: uint,      ;; Clarity 4: Unix timestamp
  auto-compound-enabled: bool,
  is-active: bool
})

(define-map compound-history uint {
  stake-id: uint,
  rewards-compounded: uint,
  compounded-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-compound-id uint u1)

(define-map staker-stakes principal (list 50 uint))

;; Private Functions

(define-private (calculate-rewards (stake-id uint))
  (let (
    (stake (unwrap! (map-get? stake-positions stake-id) u0))
    (time-elapsed (- stacks-block-time (get last-compound stake)))
    (base-apy u1000)  ;; 10% APY in basis points
    (rewards (/ (* (get amount-staked stake) (* base-apy time-elapsed)) (* u10000 u31536000)))
  )
    rewards
  )
)

;; Public Functions

;; Stake DIKO tokens
(define-public (stake-tokens (amount uint) (auto-compound bool))
  (let (
    (stake-id (var-get next-stake-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-STRATEGY-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer tokens to contract (simplified)
    ;; (try! (contract-call? arkadiko-token transfer amount tx-sender tx-sender none))

    ;; Create stake position
    (map-set stake-positions stake-id {
      staker: tx-sender,
      amount-staked: amount,
      rewards-accumulated: u0,
      stake-start: stacks-block-time,
      last-compound: stacks-block-time,
      auto-compound-enabled: auto-compound,
      is-active: true
    })

    (var-set next-stake-id (+ stake-id u1))
    (var-set total-staked (+ (var-get total-staked) amount))

    (print {
      event: "tokens-staked",
      stake-id: stake-id,
      staker: tx-sender,
      amount: amount,
      auto-compound: auto-compound,
      timestamp: stacks-block-time
    })

    (ok stake-id)
  )
)

;; Unstake tokens
(define-public (unstake-tokens (stake-id uint))
  (let (
    (stake (unwrap! (map-get? stake-positions stake-id) ERR-NO-STAKE))
    (pending-rewards (calculate-rewards stake-id))
    (total-return (+ (get amount-staked stake) (get rewards-accumulated stake) pending-rewards))
  )
    (asserts! (is-eq tx-sender (get staker stake)) ERR-UNAUTHORIZED)
    (asserts! (get is-active stake) ERR-NO-STAKE)

    ;; Transfer tokens back (simplified)
    ;; (try! (begin (contract-call? arkadiko-token transfer total-return tx-sender (get staker stake) none)))

    ;; Update stake
    (map-set stake-positions stake-id
      (merge stake { is-active: false }))

    (var-set total-staked (- (var-get total-staked) (get amount-staked stake)))

    (print {
      event: "tokens-unstaked",
      stake-id: stake-id,
      staker: tx-sender,
      amount: (get amount-staked stake),
      rewards: (+ (get rewards-accumulated stake) pending-rewards),
      timestamp: stacks-block-time
    })

    (ok total-return)
  )
)

;; Compound rewards
(define-public (compound-rewards (stake-id uint))
  (let (
    (stake (unwrap! (map-get? stake-positions stake-id) ERR-NO-STAKE))
    (pending-rewards (calculate-rewards stake-id))
    (compound-id (var-get next-compound-id))
    (time-since-last-compound (- stacks-block-time (get last-compound stake)))
  )
    (asserts! (or
      (is-eq tx-sender (get staker stake))
      (get auto-compound-enabled stake)
    ) ERR-UNAUTHORIZED)
    (asserts! (get is-active stake) ERR-NO-STAKE)
    (asserts! (> pending-rewards u0) ERR-INVALID-AMOUNT)
    (asserts! (>= time-since-last-compound MIN-COMPOUND-INTERVAL) ERR-LOCKED)

    ;; Update stake with compounded rewards
    (map-set stake-positions stake-id
      (merge stake {
        amount-staked: (+ (get amount-staked stake) pending-rewards),
        rewards-accumulated: u0,
        last-compound: stacks-block-time
      }))

    ;; Record compound event
    (map-set compound-history compound-id {
      stake-id: stake-id,
      rewards-compounded: pending-rewards,
      compounded-at: stacks-block-time
    })

    (var-set next-compound-id (+ compound-id u1))
    (var-set total-compounded (+ (var-get total-compounded) pending-rewards))
    (var-set total-rewards-earned (+ (var-get total-rewards-earned) pending-rewards))

    (print {
      event: "rewards-compounded",
      stake-id: stake-id,
      staker: (get staker stake),
      amount: pending-rewards,
      new-stake: (+ (get amount-staked stake) pending-rewards),
      timestamp: stacks-block-time
    })

    (ok pending-rewards)
  )
)

;; Claim rewards without compounding
(define-public (claim-rewards (stake-id uint))
  (let (
    (stake (unwrap! (map-get? stake-positions stake-id) ERR-NO-STAKE))
    (pending-rewards (calculate-rewards stake-id))
    (total-rewards (+ (get rewards-accumulated stake) pending-rewards))
  )
    (asserts! (is-eq tx-sender (get staker stake)) ERR-UNAUTHORIZED)
    (asserts! (get is-active stake) ERR-NO-STAKE)
    (asserts! (> total-rewards u0) ERR-INVALID-AMOUNT)

    ;; Transfer rewards (simplified)
    ;; (try! (begin (contract-call? arkadiko-token transfer total-rewards tx-sender (get staker stake) none)))

    ;; Update stake
    (map-set stake-positions stake-id
      (merge stake {
        rewards-accumulated: u0,
        last-compound: stacks-block-time
      }))

    (var-set total-rewards-earned (+ (var-get total-rewards-earned) total-rewards))

    (print {
      event: "rewards-claimed",
      stake-id: stake-id,
      staker: tx-sender,
      amount: total-rewards,
      timestamp: stacks-block-time
    })

    (ok total-rewards)
  )
)

;; Toggle auto-compound
(define-public (toggle-auto-compound (stake-id uint) (enabled bool))
  (let (
    (stake (unwrap! (map-get? stake-positions stake-id) ERR-NO-STAKE))
  )
    (asserts! (is-eq tx-sender (get staker stake)) ERR-UNAUTHORIZED)
    (asserts! (get is-active stake) ERR-NO-STAKE)

    (map-set stake-positions stake-id
      (merge stake { auto-compound-enabled: enabled }))

    (print {
      event: "auto-compound-toggled",
      stake-id: stake-id,
      enabled: enabled,
      timestamp: stacks-block-time
    })

    (ok true)
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

;; Read-Only Functions

(define-read-only (get-stake-position (stake-id uint))
  (map-get? stake-positions stake-id)
)

(define-read-only (get-pending-rewards (stake-id uint))
  (ok (calculate-rewards stake-id))
)

(define-read-only (get-total-staked)
  (var-get total-staked)
)

(define-read-only (get-total-rewards-earned)
  (var-get total-rewards-earned)
)

(define-read-only (get-total-compounded)
  (var-get total-compounded)
)

(define-read-only (is-strategy-paused)
  (var-get strategy-paused)
)

(define-read-only (get-compound-record (compound-id uint))
  (map-get? compound-history compound-id)
)
