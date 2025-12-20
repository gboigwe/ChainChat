;; title: arkadiko-connector
;; version: 1.0.0
;; summary: Arkadiko protocol connector
;; description: Interface with Arkadiko swaps and vaults - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6100))

;; Data Variables
(define-data-var swap-counter uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map arkadiko-swaps uint {
  user: principal,
  from-token: principal,
  to-token: principal,
  amount-in: uint,
  amount-out: uint,
  executed-at: uint  ;; Clarity 4: Unix timestamp
})

(define-map diko-staking-positions principal {
  staked-amount: uint,
  rewards-earned: uint,
  stake-timestamp: uint,  ;; Clarity 4: Unix timestamp
  last-claim: uint
})

;; Public Functions

(define-public (swap-arkadiko
  (from-token principal)
  (to-token principal)
  (amount-in uint)
  (min-amount-out uint))
  (let (
    (swap-id (var-get swap-counter))
    (amount-out (calculate-ark-output amount-in))
  )
    (asserts! (>= amount-out min-amount-out) (err u400))

    (map-set arkadiko-swaps swap-id {
      user: tx-sender,
      from-token: from-token,
      to-token: to-token,
      amount-in: amount-in,
      amount-out: amount-out,
      executed-at: stacks-block-time
    })

    (var-set swap-counter (+ swap-id u1))

    (print {
      event: "arkadiko-swap",
      swap-id: swap-id,
      amount-out: amount-out,
      timestamp: stacks-block-time
    })

    (ok amount-out)
  )
)

(define-public (stake-diko (amount uint))
  (let (
    (existing-stake (default-to
      { staked-amount: u0, rewards-earned: u0, stake-timestamp: stacks-block-time, last-claim: u0 }
      (map-get? diko-staking-positions tx-sender)))
  )
    (map-set diko-staking-positions tx-sender {
      staked-amount: (+ (get staked-amount existing-stake) amount),
      rewards-earned: (get rewards-earned existing-stake),
      stake-timestamp: stacks-block-time,
      last-claim: (get last-claim existing-stake)
    })

    (ok true)
  )
)

;; Private Functions

(define-private (calculate-ark-output (amount-in uint))
  (/ (* amount-in u997) u1000)  ;; 0.3% fee
)

;; Read-Only Functions

(define-read-only (get-swap-record (swap-id uint))
  (map-get? arkadiko-swaps swap-id)
)

(define-read-only (get-staking-position (user principal))
  (map-get? diko-staking-positions user)
)
