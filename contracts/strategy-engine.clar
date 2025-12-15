
;; title: strategy-engine
;; version: 2.0.0
;; summary: ChainChat Strategy Engine - Clarity 4
;; description: Parses AI commands and executes DeFi strategies on Stacks

;; ChainChat Strategy Engine Contract
;; Parses AI commands and executes DeFi strategies on Stacks
;; Upgraded to Clarity 4 with stacks-block-time

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u401))
(define-constant ERR-INVALID-COMMAND (err u402))
(define-constant ERR-STRATEGY-NOT-FOUND (err u403))
(define-constant ERR-INSUFFICIENT-FUNDS (err u404))
(define-constant ERR-STRATEGY-ACTIVE (err u405))
(define-constant ERR-NO-ACTIVE-STRATEGY (err u406))
(define-constant ERR-RISK-LIMIT-EXCEEDED (err u407))

;; Strategy IDs
(define-constant STRATEGY-SAFE u1)
(define-constant STRATEGY-GROWTH u2)
(define-constant STRATEGY-CUSTOM u3)

;; Risk Levels
(define-constant RISK-LOW u1)
(define-constant RISK-MEDIUM u2)
(define-constant RISK-HIGH u3)

;; Data Variables
(define-data-var vault-contract principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.strategy-vault)
(define-data-var alex-connector principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.alex-connector)
(define-data-var engine-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map user-strategies principal {
  strategy-id: uint,
  amount-allocated: uint,
  risk-level: uint,
  start-time: uint, ;; Clarity 4: Unix timestamp using stacks-block-time
  is-active: bool
})

(define-map strategy-definitions uint {
  name: (string-ascii 50),
  description: (string-ascii 200),
  min-amount: uint,
  max-amount: uint,
  target-apy: uint,
  risk-score: uint
})

(define-map user-risk-settings principal {
  max-allocation: uint,
  risk-tolerance: uint,
  stop-loss-percent: uint
})

(define-map command-mappings (string-ascii 100) {
  action: (string-ascii 20),
  strategy-id: uint,
  risk-level: uint
})

;; Initialize Strategy Definitions
(map-set strategy-definitions STRATEGY-SAFE {
  name: "Safe Strategy",
  description: "Low-risk ALEX yield farming with stable pairs",
  min-amount: u1000000, ;; 1 STX
  max-amount: u100000000000, ;; 100k STX
  target-apy: u8, ;; 8% APY
  risk-score: u20 ;; Low risk (0-100 scale)
})

(map-set strategy-definitions STRATEGY-GROWTH {
  name: "Growth Strategy",
  description: "Higher-yield ALEX strategies with moderate risk",
  min-amount: u5000000, ;; 5 STX
  max-amount: u50000000000, ;; 50k STX
  target-apy: u15, ;; 15% APY
  risk-score: u60 ;; Medium risk
})

;; Initialize Command Mappings
(map-set command-mappings "start safe strategy" {
  action: "start",
  strategy-id: STRATEGY-SAFE,
  risk-level: RISK-LOW
})

(map-set command-mappings "start growth strategy" {
  action: "start",
  strategy-id: STRATEGY-GROWTH,
  risk-level: RISK-MEDIUM
})

(map-set command-mappings "exit all positions" {
  action: "exit",
  strategy-id: u0,
  risk-level: u0
})

(map-set command-mappings "stop strategy" {
  action: "stop",
  strategy-id: u0,
  risk-level: u0
})

(map-set command-mappings "set risk low" {
  action: "set-risk",
  strategy-id: u0,
  risk-level: RISK-LOW
})

(map-set command-mappings "set risk medium" {
  action: "set-risk",
  strategy-id: u0,
  risk-level: RISK-MEDIUM
})

(map-set command-mappings "set risk high" {
  action: "set-risk",
  strategy-id: u0,
  risk-level: RISK-HIGH
})

;; Admin Functions
(define-public (set-vault-contract (new-vault principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set vault-contract new-vault)
    (ok true)
  )
)

(define-public (set-alex-connector (new-connector principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set alex-connector new-connector)
    (ok true)
  )
)

(define-public (pause-engine)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set engine-paused true)
    (ok true)
  )
)

(define-public (resume-engine)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set engine-paused false)
    (ok true)
  )
)

;; Main Command Processing Function
(define-public (execute-command (command (string-ascii 100)) (amount uint))
  (let (
    (command-data (unwrap! (map-get? command-mappings command) ERR-INVALID-COMMAND))
    (action (get action command-data))
  )
    (asserts! (not (var-get engine-paused)) ERR-UNAUTHORIZED)

    ;; Route to appropriate action
    (if (is-eq action "start")
      (start-strategy (get strategy-id command-data) amount (get risk-level command-data))
      (if (is-eq action "exit")
        (exit-all-strategies)
        (if (is-eq action "stop")
          (stop-current-strategy)
          (if (is-eq action "set-risk")
            (set-user-risk-level (get risk-level command-data))
            ERR-INVALID-COMMAND
          )
        )
      )
    )
  )
)

;; Strategy Execution Functions
(define-private (start-strategy (strategy-id uint) (amount uint) (risk-level uint))
  (let (
    (strategy-def (unwrap! (map-get? strategy-definitions strategy-id) ERR-STRATEGY-NOT-FOUND))
    (current-strategy (map-get? user-strategies tx-sender))
    (user-risk (get-user-risk-settings tx-sender))
  )
    ;; Check if user already has active strategy
    (asserts! (or (is-none current-strategy)
                  (not (get is-active (unwrap-panic current-strategy)))) ERR-STRATEGY-ACTIVE)

    ;; Validate amount limits
    (asserts! (>= amount (get min-amount strategy-def)) ERR-INSUFFICIENT-FUNDS)
    (asserts! (<= amount (get max-amount strategy-def)) ERR-RISK-LIMIT-EXCEEDED)
    (asserts! (<= amount (get max-allocation user-risk)) ERR-RISK-LIMIT-EXCEEDED)

    ;; Allocate funds from vault
    ;; (try! (contract-call? (var-get vault-contract) allocate-funds tx-sender amount))

    ;; Record strategy with stacks-block-time (Clarity 4)
    (map-set user-strategies tx-sender {
      strategy-id: strategy-id,
      amount-allocated: amount,
      risk-level: risk-level,
      start-time: stacks-block-time, ;; Clarity 4: Unix timestamp
      is-active: true
    })

    ;; Execute strategy through ALEX connector (will implement in next contract)
    ;; (try! (contract-call? (var-get alex-connector) execute-strategy strategy-id amount))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "start-strategy",
      user: tx-sender,
      strategy-id: strategy-id,
      amount: amount,
      risk-level: risk-level,
      strategy-name: (get name strategy-def),
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok strategy-id)
  )
)

(define-private (stop-current-strategy)
  (let (
    (current-strategy (unwrap! (map-get? user-strategies tx-sender) ERR-NO-ACTIVE-STRATEGY))
  )
    (asserts! (get is-active current-strategy) ERR-NO-ACTIVE-STRATEGY)

    ;; Stop strategy execution (will implement ALEX integration)
    ;; (try! (contract-call? (var-get alex-connector) stop-strategy tx-sender))

    ;; Return funds to vault
    ;; (try! (contract-call? (var-get vault-contract) return-funds tx-sender (get amount-allocated current-strategy)))

    ;; Update strategy status
    (map-set user-strategies tx-sender
      (merge current-strategy { is-active: false }))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "stop-strategy",
      user: tx-sender,
      strategy-id: (get strategy-id current-strategy),
      amount-returned: (get amount-allocated current-strategy),
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok (get amount-allocated current-strategy))
  )
)

(define-private (exit-all-strategies)
  (match (map-get? user-strategies tx-sender)
    strategy (if (get is-active strategy)
               (stop-current-strategy)
               (ok u0))
    (ok u0)
  )
)

(define-private (set-user-risk-level (risk-level uint))
  (let (
    (current-settings (get-user-risk-settings tx-sender))
    (max-allocation (if (is-eq risk-level RISK-LOW) u10000000000 ;; 10k STX max for low risk
                        (if (is-eq risk-level RISK-MEDIUM) u25000000000 ;; 25k STX for medium
                            u50000000000))) ;; 50k STX for high risk
    (stop-loss (if (is-eq risk-level RISK-LOW) u5 ;; 5% stop-loss for low risk
                   (if (is-eq risk-level RISK-MEDIUM) u10 ;; 10% for medium
                       u20))) ;; 20% for high risk
  )
    (map-set user-risk-settings tx-sender {
      max-allocation: max-allocation,
      risk-tolerance: risk-level,
      stop-loss-percent: stop-loss
    })

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "set-risk-level",
      user: tx-sender,
      risk-level: risk-level,
      max-allocation: max-allocation,
      stop-loss-percent: stop-loss,
      timestamp: stacks-block-time ;; Clarity 4: Unix timestamp
    })

    (ok risk-level)
  )
)

;; Risk Management Functions
(define-public (check-stop-loss (user principal))
  ;; This will be called by oracle or monitoring system
  ;; Implementation depends on price feed integration
  (ok true)
)

(define-public (emergency-stop-strategy (user principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    ;; Force stop user strategy in emergency
    (let (
      (current-strategy (unwrap! (map-get? user-strategies user) ERR-NO-ACTIVE-STRATEGY))
    )
      (asserts! (get is-active current-strategy) ERR-NO-ACTIVE-STRATEGY)

      ;; Return funds
      ;; (try! (contract-call? (var-get vault-contract) return-funds user (get amount-allocated current-strategy)))

      ;; Deactivate strategy
      (map-set user-strategies user
        (merge current-strategy { is-active: false }))

      (ok true)
    )
  )
)

;; Read-Only Functions
(define-read-only (get-user-strategy (user principal))
  (map-get? user-strategies user)
)

(define-read-only (get-strategy-definition (strategy-id uint))
  (map-get? strategy-definitions strategy-id)
)

(define-read-only (get-user-risk-settings (user principal))
  (default-to {
    max-allocation: u10000000000, ;; 10k STX default
    risk-tolerance: RISK-LOW,
    stop-loss-percent: u5
  } (map-get? user-risk-settings user))
)

(define-read-only (get-command-mapping (command (string-ascii 100)))
  (map-get? command-mappings command)
)

(define-read-only (is-engine-paused)
  (var-get engine-paused)
)

(define-read-only (get-vault-contract)
  (var-get vault-contract)
)

(define-read-only (get-alex-connector)
  (var-get alex-connector)
)

;; Portfolio Information
(define-read-only (get-user-portfolio (user principal))
  (let (
    (strategy (map-get? user-strategies user))
    (risk-settings (get-user-risk-settings user))
  )
    {
      strategy: strategy,
      risk-settings: risk-settings,
      available-commands: (list "start safe strategy" "start growth strategy" "exit all positions" "set risk low" "set risk medium" "set risk high")
    }
  )
)
