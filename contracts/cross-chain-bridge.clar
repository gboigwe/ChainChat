;; title: cross-chain-bridge
;; version: 1.0.0
;; summary: Cross-chain asset bridge
;; description: Bridge assets across chains - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6500))
(define-constant ERR-BRIDGE-PAUSED (err u6501))
(define-constant ERR-INVALID-CHAIN (err u6502))

;; Supported chains
(define-constant NETWORK-ETHEREUM u1)
(define-constant NETWORK-BSC u2)
(define-constant NETWORK-POLYGON u3)
(define-constant NETWORK-AVALANCHE u4)

;; Bridge status
(define-constant STATUS-PENDING u1)
(define-constant STATUS-CONFIRMED u2)
(define-constant STATUS-COMPLETED u3)
(define-constant STATUS-FAILED u4)

;; Data Variables
(define-data-var bridge-paused bool false)
(define-data-var next-bridge-id uint u1)
(define-data-var total-bridged-volume uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map bridge-transactions uint {
  user: principal,
  from-chain: uint,
  to-chain: uint,
  token: principal,
  amount: uint,
  status: uint,
  initiated-at: uint,  ;; Clarity 4: Unix timestamp
  completed-at: uint,
  bridge-fee: uint
})

(define-map chain-configs uint {
  is-active: bool,
  min-amount: uint,
  max-amount: uint,
  bridge-fee: uint,  ;; Basis points
  total-volume: uint
})

(define-map user-bridge-stats principal {
  total-bridges: uint,
  total-volume: uint,
  last-bridge: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (initiate-bridge
  (to-chain uint)
  (token principal)
  (amount uint))
  (let (
    (bridge-id (var-get next-bridge-id))
    (chain-config (unwrap! (map-get? chain-configs to-chain) ERR-INVALID-CHAIN))
    (bridge-fee (/ (* amount (get bridge-fee chain-config)) u10000))
    (user-stats (default-to
      { total-bridges: u0, total-volume: u0, last-bridge: u0 }
      (map-get? user-bridge-stats tx-sender)))
  )
    (asserts! (not (var-get bridge-paused)) ERR-BRIDGE-PAUSED)
    (asserts! (get is-active chain-config) ERR-INVALID-CHAIN)
    (asserts! (>= amount (get min-amount chain-config)) (err u400))
    (asserts! (<= amount (get max-amount chain-config)) (err u401))

    (map-set bridge-transactions bridge-id {
      user: tx-sender,
      from-chain: u0,  ;; Stacks chain
      to-chain: to-chain,
      token: token,
      amount: amount,
      status: STATUS-PENDING,
      initiated-at: stacks-block-time,
      completed-at: u0,
      bridge-fee: bridge-fee
    })

    (map-set user-bridge-stats tx-sender {
      total-bridges: (+ (get total-bridges user-stats) u1),
      total-volume: (+ (get total-volume user-stats) amount),
      last-bridge: stacks-block-time
    })

    (var-set next-bridge-id (+ bridge-id u1))
    (var-set total-bridged-volume (+ (var-get total-bridged-volume) amount))

    (print {
      event: "bridge-initiated",
      bridge-id: bridge-id,
      to-chain: to-chain,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok bridge-id)
  )
)

(define-public (complete-bridge (bridge-id uint))
  (let (
    (bridge-data (unwrap! (map-get? bridge-transactions bridge-id) (err u404)))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (is-eq (get status bridge-data) STATUS-PENDING) (err u400))

    (map-set bridge-transactions bridge-id (merge bridge-data {
      status: STATUS-COMPLETED,
      completed-at: stacks-block-time
    }))

    (ok true)
  )
)

(define-public (configure-chain
  (target-chain-id uint)
  (is-active bool)
  (min-amount uint)
  (max-amount uint)
  (bridge-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set chain-configs target-chain-id {
      is-active: is-active,
      min-amount: min-amount,
      max-amount: max-amount,
      bridge-fee: bridge-fee,
      total-volume: u0
    })

    (ok true)
  )
)

(define-public (toggle-bridge-pause)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set bridge-paused (not (var-get bridge-paused)))
    (ok (var-get bridge-paused))
  )
)

;; Read-Only Functions

(define-read-only (get-bridge-transaction (bridge-id uint))
  (map-get? bridge-transactions bridge-id)
)

(define-read-only (get-chain-config (target-chain-id uint))
  (map-get? chain-configs target-chain-id)
)

(define-read-only (get-user-stats (user principal))
  (map-get? user-bridge-stats user)
)

(define-read-only (is-bridge-paused)
  (var-get bridge-paused)
)

(define-read-only (get-total-volume)
  (var-get total-bridged-volume)
)
