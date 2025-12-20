;; title: vault-rewards
;; version: 1.0.0
;; summary: Reward distribution for vault participants
;; description: Manages reward pools and distributions - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u700))
(define-constant ERR-INVALID-AMOUNT (err u701))
(define-constant ERR-NO-REWARDS (err u702))
(define-constant ERR-POOL-NOT-FOUND (err u703))
(define-constant ERR-ALREADY-CLAIMED (err u704))
(define-constant ERR-POOL-ENDED (err u705))

;; Reward calculation precision
(define-constant PRECISION u1000000)

;; Data Variables
(define-data-var next-pool-id uint u1)
(define-data-var total-rewards-distributed uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map reward-pools uint {
  vault: principal,
  reward-token: principal,
  total-rewards: uint,
  rewards-per-block: uint,
  start-time: uint,      ;; Clarity 4: Unix timestamp
  end-time: uint,        ;; Clarity 4: Unix timestamp
  total-staked: uint,
  reward-per-token: uint,
  last-update-time: uint, ;; Clarity 4: Unix timestamp
  is-active: bool
})

(define-map user-rewards {
  pool-id: uint,
  user: principal
} {
  amount-staked: uint,
  reward-debt: uint,
  pending-rewards: uint,
  last-claim-time: uint,  ;; Clarity 4: Unix timestamp
  total-claimed: uint
})

(define-map user-pool-list principal (list 50 uint))

(define-map claim-history uint {
  pool-id: uint,
  user: principal,
  amount: uint,
  claimed-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-claim-id uint u1)

;; Private Functions

(define-private (calculate-pending-rewards (pool-id uint) (user principal))
  (let (
    (pool-data (unwrap! (map-get? reward-pools pool-id) (err u0)))
    (user-data (default-to
      { amount-staked: u0, reward-debt: u0, pending-rewards: u0, last-claim-time: u0, total-claimed: u0 }
      (map-get? user-rewards { pool-id: pool-id, user: user })))
    (user-stake (get amount-staked user-data))
    (reward-per-token (get reward-per-token pool-data))
  )
    (if (is-eq user-stake u0)
      (ok u0)
      (ok (+
        (get pending-rewards user-data)
        (/ (* user-stake (- reward-per-token (get reward-debt user-data))) PRECISION)
      ))
    )
  )
)

(define-private (update-pool (pool-id uint))
  (let (
    (pool-data (unwrap! (map-get? reward-pools pool-id) (err u0)))
    (current-time stacks-block-time)
    (last-update (get last-update-time pool-data))
    (total-staked (get total-staked pool-data))
  )
    (if (or (is-eq total-staked u0) (>= last-update current-time))
      (ok pool-data)
      (let (
        (time-elapsed (- current-time last-update))
        (reward-amount (* time-elapsed (get rewards-per-block pool-data)))
        (reward-per-token-increment (/ (* reward-amount PRECISION) total-staked))
        (new-reward-per-token (+ (get reward-per-token pool-data) reward-per-token-increment))
      )
        (map-set reward-pools pool-id
          (merge pool-data {
            reward-per-token: new-reward-per-token,
            last-update-time: current-time
          })
        )
        (ok (merge pool-data {
          reward-per-token: new-reward-per-token,
          last-update-time: current-time
        }))
      )
    )
  )
)

;; Public Functions

;; Create reward pool
(define-public (create-pool
  (vault principal)
  (reward-token principal)
  (total-rewards uint)
  (rewards-per-block uint)
  (duration uint))
  (let (
    (pool-id (var-get next-pool-id))
    (current-time stacks-block-time)
    (end-time (+ current-time duration))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (> total-rewards u0) ERR-INVALID-AMOUNT)
    (asserts! (> rewards-per-block u0) ERR-INVALID-AMOUNT)

    (map-set reward-pools pool-id {
      vault: vault,
      reward-token: reward-token,
      total-rewards: total-rewards,
      rewards-per-block: rewards-per-block,
      start-time: current-time,
      end-time: end-time,
      total-staked: u0,
      reward-per-token: u0,
      last-update-time: current-time,
      is-active: true
    })

    (var-set next-pool-id (+ pool-id u1))

    (print {
      event: "pool-created",
      pool-id: pool-id,
      vault: vault,
      total-rewards: total-rewards,
      duration: duration,
      timestamp: stacks-block-time
    })

    (ok pool-id)
  )
)

;; Stake in reward pool
(define-public (stake (pool-id uint) (amount uint))
  (let (
    (pool-data (unwrap! (map-get? reward-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-data (default-to
      { amount-staked: u0, reward-debt: u0, pending-rewards: u0, last-claim-time: u0, total-claimed: u0 }
      (map-get? user-rewards { pool-id: pool-id, user: tx-sender })))
    (updated-pool (try! (update-pool pool-id)))
  )
    (asserts! (get is-active pool-data) ERR-POOL-ENDED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Calculate pending rewards before updating stake
    (let (
      (pending (try! (calculate-pending-rewards pool-id tx-sender)))
      (new-stake (+ (get amount-staked user-data) amount))
      (new-reward-debt (/ (* new-stake (get reward-per-token updated-pool)) PRECISION))
    )
      ;; Update user rewards
      (map-set user-rewards { pool-id: pool-id, user: tx-sender } {
        amount-staked: new-stake,
        reward-debt: new-reward-debt,
        pending-rewards: pending,
        last-claim-time: (get last-claim-time user-data),
        total-claimed: (get total-claimed user-data)
      })

      ;; Update pool total staked
      (map-set reward-pools pool-id
        (merge updated-pool {
          total-staked: (+ (get total-staked updated-pool) amount)
        })
      )

      (print {
        event: "staked",
        pool-id: pool-id,
        user: tx-sender,
        amount: amount,
        timestamp: stacks-block-time
      })

      (ok true)
    )
  )
)

;; Unstake from reward pool
(define-public (unstake (pool-id uint) (amount uint))
  (let (
    (pool-data (unwrap! (map-get? reward-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-data (unwrap! (map-get? user-rewards { pool-id: pool-id, user: tx-sender }) ERR-NO-REWARDS))
    (updated-pool (try! (update-pool pool-id)))
  )
    (asserts! (>= (get amount-staked user-data) amount) ERR-INVALID-AMOUNT)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Calculate pending rewards
    (let (
      (pending (try! (calculate-pending-rewards pool-id tx-sender)))
      (new-stake (- (get amount-staked user-data) amount))
      (new-reward-debt (/ (* new-stake (get reward-per-token updated-pool)) PRECISION))
    )
      ;; Update user rewards
      (map-set user-rewards { pool-id: pool-id, user: tx-sender } {
        amount-staked: new-stake,
        reward-debt: new-reward-debt,
        pending-rewards: pending,
        last-claim-time: (get last-claim-time user-data),
        total-claimed: (get total-claimed user-data)
      })

      ;; Update pool total staked
      (map-set reward-pools pool-id
        (merge updated-pool {
          total-staked: (- (get total-staked updated-pool) amount)
        })
      )

      (print {
        event: "unstaked",
        pool-id: pool-id,
        user: tx-sender,
        amount: amount,
        timestamp: stacks-block-time
      })

      (ok true)
    )
  )
)

;; Claim rewards
(define-public (claim-rewards (pool-id uint))
  (let (
    (pool-data (unwrap! (map-get? reward-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-data (unwrap! (map-get? user-rewards { pool-id: pool-id, user: tx-sender }) ERR-NO-REWARDS))
    (updated-pool (try! (update-pool pool-id)))
    (pending (try! (calculate-pending-rewards pool-id tx-sender)))
    (claim-id (var-get next-claim-id))
  )
    (asserts! (> pending u0) ERR-NO-REWARDS)

    ;; Transfer rewards (would need actual token transfer implementation)
    ;; (try! (contract-call? reward-token transfer pending tx-sender tx-sender none))

    ;; Update user data
    (map-set user-rewards { pool-id: pool-id, user: tx-sender }
      (merge user-data {
        pending-rewards: u0,
        reward-debt: (/ (* (get amount-staked user-data) (get reward-per-token updated-pool)) PRECISION),
        last-claim-time: stacks-block-time,
        total-claimed: (+ (get total-claimed user-data) pending)
      })
    )

    ;; Record claim
    (map-set claim-history claim-id {
      pool-id: pool-id,
      user: tx-sender,
      amount: pending,
      claimed-at: stacks-block-time
    })

    (var-set next-claim-id (+ claim-id u1))
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) pending))

    (print {
      event: "rewards-claimed",
      pool-id: pool-id,
      user: tx-sender,
      amount: pending,
      timestamp: stacks-block-time
    })

    (ok pending)
  )
)

;; End reward pool
(define-public (end-pool (pool-id uint))
  (let (
    (pool-data (unwrap! (map-get? reward-pools pool-id) ERR-POOL-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (get is-active pool-data) ERR-POOL-ENDED)

    (map-set reward-pools pool-id
      (merge pool-data { is-active: false }))

    (print {
      event: "pool-ended",
      pool-id: pool-id,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-pool-info (pool-id uint))
  (map-get? reward-pools pool-id)
)

(define-read-only (get-user-rewards (pool-id uint) (user principal))
  (map-get? user-rewards { pool-id: pool-id, user: user })
)

(define-read-only (get-pending-rewards (pool-id uint) (user principal))
  (calculate-pending-rewards pool-id user)
)

(define-read-only (get-claim-record (claim-id uint))
  (map-get? claim-history claim-id)
)

(define-read-only (get-total-rewards-distributed)
  (var-get total-rewards-distributed)
)

(define-read-only (get-pool-count)
  (- (var-get next-pool-id) u1)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate reward pool participants
(define-read-only (validate-participant (user principal))
  (principal-destruct? user)
)

;; 2. Clarity 4: int-to-utf8 - Format reward amounts
(define-read-only (format-pool-id (pool-id uint))
  (ok (int-to-utf8 pool-id))
)

;; 3. Clarity 4: string-to-uint? - Parse pool IDs
(define-read-only (parse-pool-id (id-str (string-ascii 10)))
  (match (string-to-uint? id-str)
    pool-id (ok pool-id)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track reward distribution
(define-read-only (get-reward-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
