;; title: strategy-liquidity-mining
;; version: 1.0.0
;; summary: Multi-protocol liquidity mining strategy
;; description: Automated liquidity mining across protocols - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2400))
(define-constant ERR-INVALID-AMOUNT (err u2401))
(define-constant ERR-FARM-NOT-FOUND (err u2402))
(define-constant ERR-STRATEGY-PAUSED (err u2403))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-farmed uint u0)
(define-data-var total-rewards-claimed uint u0)
(define-data-var next-farm-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map farm-positions uint {
  farmer: principal,
  protocol: (string-ascii 50),
  lp-token: principal,
  amount-deposited: uint,
  rewards-earned: uint,
  deposited-at: uint,      ;; Clarity 4: Unix timestamp
  last-harvest: uint,      ;; Clarity 4: Unix timestamp
  is-active: bool
})

(define-map protocol-farms (string-ascii 50) {
  protocol-name: (string-ascii 50),
  reward-token: principal,
  total-tvl: uint,
  apy: uint,
  is-active: bool
})

;; Public Functions

(define-public (deposit-to-farm
  (protocol (string-ascii 50))
  (lp-token principal)
  (amount uint))
  (let (
    (farm-id (var-get next-farm-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-STRATEGY-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    (map-set farm-positions farm-id {
      farmer: tx-sender,
      protocol: protocol,
      lp-token: lp-token,
      amount-deposited: amount,
      rewards-earned: u0,
      deposited-at: stacks-block-time,
      last-harvest: stacks-block-time,
      is-active: true
    })

    (var-set next-farm-id (+ farm-id u1))
    (var-set total-farmed (+ (var-get total-farmed) amount))

    (print {
      event: "farm-deposit",
      farm-id: farm-id,
      protocol: protocol,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok farm-id)
  )
)

(define-public (harvest-rewards (farm-id uint))
  (let (
    (farm (unwrap! (map-get? farm-positions farm-id) ERR-FARM-NOT-FOUND))
    (rewards (calculate-pending-rewards farm-id))
  )
    (asserts! (is-eq tx-sender (get farmer farm)) ERR-UNAUTHORIZED)
    (asserts! (get is-active farm) ERR-FARM-NOT-FOUND)

    (map-set farm-positions farm-id
      (merge farm {
        rewards-earned: (+ (get rewards-earned farm) rewards),
        last-harvest: stacks-block-time
      }))

    (var-set total-rewards-claimed (+ (var-get total-rewards-claimed) rewards))

    (print {
      event: "rewards-harvested",
      farm-id: farm-id,
      amount: rewards,
      timestamp: stacks-block-time
    })

    (ok rewards)
  )
)

(define-public (withdraw-from-farm (farm-id uint))
  (let (
    (farm (unwrap! (map-get? farm-positions farm-id) ERR-FARM-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender (get farmer farm)) ERR-UNAUTHORIZED)
    (asserts! (get is-active farm) ERR-FARM-NOT-FOUND)

    (map-set farm-positions farm-id
      (merge farm { is-active: false }))

    (var-set total-farmed (- (var-get total-farmed) (get amount-deposited farm)))

    (print {
      event: "farm-withdrawal",
      farm-id: farm-id,
      amount: (get amount-deposited farm),
      timestamp: stacks-block-time
    })

    (ok (get amount-deposited farm))
  )
)

(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

(define-public (resume-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused false)
    (ok true)
  )
)

;; Private Functions

(define-private (calculate-pending-rewards (farm-id uint))
  (let (
    (farm (unwrap! (map-get? farm-positions farm-id) u0))
    (time-elapsed (- stacks-block-time (get last-harvest farm)))
    (base-apy u1500)  ;; 15% APY
  )
    (/ (* (get amount-deposited farm) (* base-apy time-elapsed)) (* u10000 u31536000))
  )
)

;; Read-Only Functions

(define-read-only (get-farm-position (farm-id uint))
  (map-get? farm-positions farm-id)
)

(define-read-only (get-pending-rewards (farm-id uint))
  (ok (calculate-pending-rewards farm-id))
)

(define-read-only (get-total-farmed)
  (var-get total-farmed)
)

(define-read-only (is-strategy-paused)
  (var-get strategy-paused)
)
