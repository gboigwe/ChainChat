;; title: vault-treasury
;; version: 1.0.0
;; summary: Protocol treasury management
;; description: Manages protocol treasury funds and budgets - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u900))
(define-constant ERR-INVALID-AMOUNT (err u901))
(define-constant ERR-INSUFFICIENT-FUNDS (err u902))
(define-constant ERR-PROPOSAL-NOT-FOUND (err u903))
(define-constant ERR-ALREADY-EXECUTED (err u904))
(define-constant ERR-NOT-APPROVED (err u905))
(define-constant ERR-EXPIRED (err u906))
(define-constant ERR-INVALID-SIGNATURES (err u907))

;; Proposal types
(define-constant PROPOSAL-TYPE-GRANT u1)
(define-constant PROPOSAL-TYPE-BUDGET u2)
(define-constant PROPOSAL-TYPE-INVESTMENT u3)
(define-constant PROPOSAL-TYPE-BUYBACK u4)

;; Multi-sig requirements
(define-constant REQUIRED-SIGNATURES u3)
(define-constant PROPOSAL-DURATION u604800)  ;; 7 days

;; Data Variables
(define-data-var total-treasury-balance uint u0)
(define-data-var total-allocated uint u0)
(define-data-var total-spent uint u0)
(define-data-var next-proposal-id uint u1)
(define-data-var treasury-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map spending-proposals uint {
  proposer: principal,
  proposal-type: uint,
  recipient: principal,
  amount: uint,
  description: (string-ascii 200),
  created-at: uint,     ;; Clarity 4: Unix timestamp
  expires-at: uint,     ;; Clarity 4: Unix timestamp
  executed-at: uint,    ;; Clarity 4: Unix timestamp
  approvals: uint,
  executed: bool,
  cancelled: bool
})

(define-map proposal-approvals {
  proposal-id: uint,
  approver: principal
} bool)

(define-map treasury-managers principal bool)

(define-map budget-allocations (string-ascii 50) {
  category: (string-ascii 50),
  allocated-amount: uint,
  spent-amount: uint,
  period-start: uint,   ;; Clarity 4: Unix timestamp
  period-end: uint,     ;; Clarity 4: Unix timestamp
  is-active: bool
})

(define-map spending-history uint {
  proposal-id: uint,
  recipient: principal,
  amount: uint,
  category: (string-ascii 50),
  spent-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-spending-id uint u1)

;; Initialize treasury managers
(map-set treasury-managers CONTRACT-OWNER true)

;; Private Functions

(define-private (is-manager (user principal))
  (default-to false (map-get? treasury-managers user))
)

(define-private (count-approvals (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? spending-proposals proposal-id) u0))
  )
    (get approvals proposal)
  )
)

;; Public Functions

;; Add treasury manager
(define-public (add-manager (manager principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set treasury-managers manager true)

    (print {
      event: "manager-added",
      manager: manager,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Remove treasury manager
(define-public (remove-manager (manager principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-delete treasury-managers manager)

    (print {
      event: "manager-removed",
      manager: manager,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Deposit to treasury
(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer funds to contract
    (try! (stx-transfer? amount tx-sender tx-sender))

    (var-set total-treasury-balance (+ (var-get total-treasury-balance) amount))

    (print {
      event: "treasury-deposit",
      depositor: tx-sender,
      amount: amount,
      new-balance: (var-get total-treasury-balance),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Create spending proposal
(define-public (create-proposal
  (proposal-type uint)
  (recipient principal)
  (amount uint)
  (description (string-ascii 200)))
  (let (
    (proposal-id (var-get next-proposal-id))
    (expires-at (+ stacks-block-time PROPOSAL-DURATION))
  )
    (asserts! (is-manager tx-sender) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount (var-get total-treasury-balance)) ERR-INSUFFICIENT-FUNDS)

    (map-set spending-proposals proposal-id {
      proposer: tx-sender,
      proposal-type: proposal-type,
      recipient: recipient,
      amount: amount,
      description: description,
      created-at: stacks-block-time,
      expires-at: expires-at,
      executed-at: u0,
      approvals: u0,
      executed: false,
      cancelled: false
    })

    (var-set next-proposal-id (+ proposal-id u1))

    (print {
      event: "proposal-created",
      proposal-id: proposal-id,
      proposer: tx-sender,
      amount: amount,
      recipient: recipient,
      timestamp: stacks-block-time
    })

    (ok proposal-id)
  )
)

;; Approve spending proposal
(define-public (approve-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? spending-proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    (already-approved (default-to false
      (map-get? proposal-approvals { proposal-id: proposal-id, approver: tx-sender })))
  )
    (asserts! (is-manager tx-sender) ERR-UNAUTHORIZED)
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)
    (asserts! (not (get cancelled proposal)) ERR-PROPOSAL-NOT-FOUND)
    (asserts! (<= stacks-block-time (get expires-at proposal)) ERR-EXPIRED)
    (asserts! (not already-approved) ERR-UNAUTHORIZED)

    ;; Record approval
    (map-set proposal-approvals { proposal-id: proposal-id, approver: tx-sender } true)

    ;; Increment approval count
    (map-set spending-proposals proposal-id
      (merge proposal {
        approvals: (+ (get approvals proposal) u1)
      }))

    (print {
      event: "proposal-approved",
      proposal-id: proposal-id,
      approver: tx-sender,
      total-approvals: (+ (get approvals proposal) u1),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Execute approved proposal
(define-public (execute-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? spending-proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    (spending-id (var-get next-spending-id))
  )
    (asserts! (is-manager tx-sender) ERR-UNAUTHORIZED)
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)
    (asserts! (not (get cancelled proposal)) ERR-PROPOSAL-NOT-FOUND)
    (asserts! (<= stacks-block-time (get expires-at proposal)) ERR-EXPIRED)
    (asserts! (>= (get approvals proposal) REQUIRED-SIGNATURES) ERR-NOT-APPROVED)
    (asserts! (<= (get amount proposal) (var-get total-treasury-balance)) ERR-INSUFFICIENT-FUNDS)

    ;; Transfer funds
    (try! (begin (stx-transfer? (get amount proposal) tx-sender (get recipient proposal))))

    ;; Update proposal
    (map-set spending-proposals proposal-id
      (merge proposal {
        executed: true,
        executed-at: stacks-block-time
      }))

    ;; Update treasury balance
    (var-set total-treasury-balance (- (var-get total-treasury-balance) (get amount proposal)))
    (var-set total-spent (+ (var-get total-spent) (get amount proposal)))

    ;; Record spending history
    (map-set spending-history spending-id {
      proposal-id: proposal-id,
      recipient: (get recipient proposal),
      amount: (get amount proposal),
      category: "proposal",
      spent-at: stacks-block-time
    })
    (var-set next-spending-id (+ spending-id u1))

    (print {
      event: "proposal-executed",
      proposal-id: proposal-id,
      recipient: (get recipient proposal),
      amount: (get amount proposal),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Cancel proposal
(define-public (cancel-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? spending-proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
  )
    (asserts! (or
      (is-eq tx-sender CONTRACT-OWNER)
      (is-eq tx-sender (get proposer proposal))
    ) ERR-UNAUTHORIZED)
    (asserts! (not (get executed proposal)) ERR-ALREADY-EXECUTED)

    (map-set spending-proposals proposal-id
      (merge proposal { cancelled: true }))

    (print {
      event: "proposal-cancelled",
      proposal-id: proposal-id,
      cancelled-by: tx-sender,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Set budget allocation
(define-public (set-budget
  (category (string-ascii 50))
  (amount uint)
  (duration uint))
  (let (
    (period-end (+ stacks-block-time duration))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    (map-set budget-allocations category {
      category: category,
      allocated-amount: amount,
      spent-amount: u0,
      period-start: stacks-block-time,
      period-end: period-end,
      is-active: true
    })

    (var-set total-allocated (+ (var-get total-allocated) amount))

    (print {
      event: "budget-allocated",
      category: category,
      amount: amount,
      duration: duration,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Pause treasury
(define-public (pause-treasury)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set treasury-paused true)
    (ok true)
  )
)

;; Resume treasury
(define-public (resume-treasury)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set treasury-paused false)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-treasury-balance)
  (var-get total-treasury-balance)
)

(define-read-only (get-total-spent)
  (var-get total-spent)
)

(define-read-only (get-total-allocated)
  (var-get total-allocated)
)

(define-read-only (get-proposal (proposal-id uint))
  (map-get? spending-proposals proposal-id)
)

(define-read-only (has-approved (proposal-id uint) (approver principal))
  (default-to false (map-get? proposal-approvals { proposal-id: proposal-id, approver: approver }))
)

(define-read-only (get-budget-allocation (category (string-ascii 50)))
  (map-get? budget-allocations category)
)

(define-read-only (get-spending-record (spending-id uint))
  (map-get? spending-history spending-id)
)

(define-read-only (is-treasury-manager (user principal))
  (is-manager user)
)

(define-read-only (is-treasury-paused)
  (var-get treasury-paused)
)

(define-read-only (get-available-funds)
  (- (var-get total-treasury-balance) (var-get total-allocated))
)
