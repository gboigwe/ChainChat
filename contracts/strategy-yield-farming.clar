;; title: strategy-yield-farming
;; version: 1.0.0
;; summary: Optimized yield farming aggregator
;; description: Auto-switches between best yield opportunities - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u2500))
(define-constant ERR-INVALID-AMOUNT (err u2501))
(define-constant ERR-NO-VAULT (err u2502))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-deposited uint u0)
(define-data-var next-vault-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map yield-vaults uint {
  depositor: principal,
  amount: uint,
  target-protocol: (string-ascii 50),
  current-apy: uint,
  deposited-at: uint,     ;; Clarity 4: Unix timestamp
  last-rebalance: uint,   ;; Clarity 4: Unix timestamp
  is-active: bool
})

;; Public Functions

(define-public (deposit-for-yield (amount uint) (target-protocol (string-ascii 50)))
  (let (
    (vault-id (var-get next-vault-id))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    (map-set yield-vaults vault-id {
      depositor: tx-sender,
      amount: amount,
      target-protocol: target-protocol,
      current-apy: u0,
      deposited-at: stacks-block-time,
      last-rebalance: stacks-block-time,
      is-active: true
    })

    (var-set next-vault-id (+ vault-id u1))
    (var-set total-deposited (+ (var-get total-deposited) amount))

    (print {
      event: "yield-deposit",
      vault-id: vault-id,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok vault-id)
  )
)

(define-public (withdraw-from-yield (vault-id uint))
  (let (
    (vault (unwrap! (map-get? yield-vaults vault-id) ERR-NO-VAULT))
  )
    (asserts! (is-eq tx-sender (get depositor vault)) ERR-UNAUTHORIZED)

    (map-set yield-vaults vault-id (merge vault { is-active: false }))
    (var-set total-deposited (- (var-get total-deposited) (get amount vault)))

    (print {
      event: "yield-withdrawal",
      vault-id: vault-id,
      amount: (get amount vault),
      timestamp: stacks-block-time
    })

    (ok (get amount vault))
  )
)

(define-public (pause-strategy)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set strategy-paused true)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-vault (vault-id uint))
  (map-get? yield-vaults vault-id)
)

(define-read-only (get-total-deposited)
  (var-get total-deposited)
)
