;; title: ChainChat Strategy Vault Contract
;; version: 2.0.0
;; summary: Strategy Vault - Clarity 4
;; description: Safely holds user STX for AI-powered strategy execution

;; ChainChat Strategy Vault Contract - Clarity 4
;; Safely holds user STX for AI-powered strategy execution
;; Upgraded to Clarity 4 with stacks-block-time

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u401))
(define-constant ERR-INSUFFICIENT-BALANCE (err u402))
(define-constant ERR-VAULT-PAUSED (err u403))
(define-constant ERR-INVALID-AMOUNT (err u404))
(define-constant ERR-WITHDRAWAL-LIMIT (err u405))

;; Data Variables
(define-data-var vault-paused bool false)
(define-data-var total-deposits uint u0)
(define-data-var emergency-mode bool false)

;; Data Maps
(define-map user-balances principal uint)
(define-map user-strategies principal uint) ;; tracks active strategy count per user
(define-map authorized-contracts principal bool)

;; Authorization Functions
(define-public (authorize-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set authorized-contracts contract true)
    (ok true)
  )
)

(define-public (revoke-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-delete authorized-contracts contract)
    (ok true)
  )
)

(define-private (is-authorized-contract (contract principal))
  (default-to false (map-get? authorized-contracts contract))
)

;; Vault Management
(define-public (pause-vault)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set vault-paused true)
    (ok true)
  )
)

(define-public (resume-vault)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set vault-paused false)
    (ok true)
  )
)

(define-public (activate-emergency-mode)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set emergency-mode true)
    (var-set vault-paused true)
    (ok true)
  )
)

;; User Deposit Function
(define-public (deposit (amount uint))
  (let (
    (current-balance (get-user-balance tx-sender))
  )
    (asserts! (not (var-get vault-paused)) ERR-VAULT-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Update user balance (track deposits)
    (map-set user-balances tx-sender (+ current-balance amount))

    ;; Update total deposits
    (var-set total-deposits (+ (var-get total-deposits) amount))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "deposit",
      user: tx-sender,
      amount: amount,
      new-balance: (+ current-balance amount),
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok (+ current-balance amount))
  )
)

;; User Withdrawal Function
(define-public (withdraw (amount uint))
  (let (
    (current-balance (get-user-balance tx-sender))
    (active-strategies (get-user-strategy-count tx-sender))
  )
    (asserts! (not (var-get vault-paused)) ERR-VAULT-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
    (asserts! (is-eq active-strategies u0) ERR-WITHDRAWAL-LIMIT) ;; No active strategies

    ;; Update user balance
    (map-set user-balances tx-sender (- current-balance amount))

    ;; Update total deposits
    (var-set total-deposits (- (var-get total-deposits) amount))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "withdraw",
      user: tx-sender,
      amount: amount,
      new-balance: (- current-balance amount),
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok (- current-balance amount))
  )
)

;; Strategy Contract Functions (only authorized contracts can call these)
(define-public (allocate-funds (user principal) (amount uint))
  (let (
    (current-balance (get-user-balance user))
    (current-strategies (get-user-strategy-count user))
  )
    (asserts! (is-authorized-contract contract-caller) ERR-UNAUTHORIZED)
    (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)

    ;; Update user balance (subtract allocated amount)
    (map-set user-balances user (- current-balance amount))

    ;; Increment active strategy count
    (map-set user-strategies user (+ current-strategies u1))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "allocate-funds",
      user: user,
      amount: amount,
      remaining-balance: (- current-balance amount),
      active-strategies: (+ current-strategies u1),
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok amount)
  )
)

(define-public (return-funds (user principal) (amount uint))
  (let (
    (current-balance (get-user-balance user))
    (current-strategies (get-user-strategy-count user))
  )
    (asserts! (is-authorized-contract contract-caller) ERR-UNAUTHORIZED)
    (asserts! (> current-strategies u0) ERR-UNAUTHORIZED) ;; Must have active strategies

    ;; Update user balance (add returned amount)
    (map-set user-balances user (+ current-balance amount))

    ;; Decrement active strategy count
    (map-set user-strategies user (- current-strategies u1))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "return-funds",
      user: user,
      amount: amount,
      new-balance: (+ current-balance amount),
      active-strategies: (- current-strategies u1),
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok (+ current-balance amount))
  )
)

;; Emergency Withdrawal (when emergency mode is active)
(define-public (emergency-withdraw)
  (let (
    (current-balance (get-user-balance tx-sender))
  )
    (asserts! (var-get emergency-mode) ERR-UNAUTHORIZED)
    (asserts! (> current-balance u0) ERR-INSUFFICIENT-BALANCE)

    ;; Clear user balance
    (map-delete user-balances tx-sender)
    (map-delete user-strategies tx-sender)

    ;; Update total deposits
    (var-set total-deposits (- (var-get total-deposits) current-balance))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "emergency-withdraw",
      user: tx-sender,
      amount: current-balance,
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok current-balance)
  )
)

;; Read-Only Functions
(define-read-only (get-user-balance (user principal))
  (default-to u0 (map-get? user-balances user))
)

(define-read-only (get-user-strategy-count (user principal))
  (default-to u0 (map-get? user-strategies user))
)

(define-read-only (get-total-deposits)
  (var-get total-deposits)
)

(define-read-only (is-vault-paused)
  (var-get vault-paused)
)

(define-read-only (is-emergency-mode)
  (var-get emergency-mode)
)

(define-read-only (get-contract-balance)
  (var-get total-deposits)
)

(define-read-only (is-contract-authorized (contract principal))
  (is-authorized-contract contract)
)
