;; title: vault-governance
;; version: 1.0.0
;; summary: DAO governance for vault parameters
;; description: Governance system for vault configuration and upgrades - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u300))
(define-constant ERR-PROPOSAL-NOT-FOUND (err u301))
(define-constant ERR-ALREADY-VOTED (err u302))
(define-constant ERR-VOTING-ENDED (err u303))
(define-constant ERR-VOTING-ACTIVE (err u304))
(define-constant ERR-QUORUM-NOT-MET (err u305))
(define-constant ERR-PROPOSAL-FAILED (err u306))

;; Proposal Types
(define-constant PROPOSAL-TYPE-FEE-CHANGE u1)
(define-constant PROPOSAL-TYPE-PARAMETER-CHANGE u2)
(define-constant PROPOSAL-TYPE-UPGRADE u3)
(define-constant PROPOSAL-TYPE-EMERGENCY u4)

;; Voting Parameters
(define-constant VOTING-PERIOD u1008) ;; ~1 week in blocks (assuming 10min blocks)
(define-constant QUORUM-PERCENT u30) ;; 30% quorum required
(define-constant APPROVAL-THRESHOLD u60) ;; 60% approval required

;; Data Variables
(define-data-var next-proposal-id uint u1)
(define-data-var total-voting-power uint u0)
(define-data-var governance-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map proposals uint {
  proposer: principal,
  proposal-type: uint,
  title: (string-ascii 100),
  description: (string-ascii 500),
  target-contract: principal,
  proposed-value: uint,
  votes-for: uint,
  votes-against: uint,
  start-time: uint,  ;; Clarity 4: Unix timestamp
  end-time: uint,    ;; Clarity 4: Unix timestamp
  executed: bool,
  passed: bool
})

(define-map votes { proposal-id: uint, voter: principal } {
  vote: bool,  ;; true = for, false = against
  voting-power: uint,
  voted-at: uint  ;; Clarity 4: Unix timestamp
})

(define-map voting-power principal uint)

(define-map delegations principal principal) ;; delegator -> delegate

;; Public Functions

;; Create new proposal
(define-public (create-proposal
  (proposal-type uint)
  (title (string-ascii 100))
  (description (string-ascii 500))
  (target-contract principal)
  (proposed-value uint))
  (let (
    (proposal-id (var-get next-proposal-id))
    (proposer-power (get-voting-power tx-sender))
  )
    (asserts! (not (var-get governance-paused)) ERR-UNAUTHORIZED)
    (asserts! (> proposer-power u0) ERR-UNAUTHORIZED) ;; Must have voting power

    ;; Create proposal
    (map-set proposals proposal-id {
      proposer: tx-sender,
      proposal-type: proposal-type,
      title: title,
      description: description,
      target-contract: target-contract,
      proposed-value: proposed-value,
      votes-for: u0,
      votes-against: u0,
      start-time: stacks-block-time,
      end-time: (+ stacks-block-time (* VOTING-PERIOD u600)), ;; ~1 week (600 sec/block estimate)
      executed: false,
      passed: false
    })

    ;; Increment proposal ID
    (var-set next-proposal-id (+ proposal-id u1))

    ;; Emit event
    (print {
      event: "proposal-created",
      proposal-id: proposal-id,
      proposer: tx-sender,
      type: proposal-type,
      title: title,
      timestamp: stacks-block-time
    })

    (ok proposal-id)
  )
)

;; Cast vote
(define-public (vote (proposal-id uint) (vote-for bool))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    (voter-power (get-voting-power tx-sender))
    (vote-key { proposal-id: proposal-id, voter: tx-sender })
  )
    (asserts! (> voter-power u0) ERR-UNAUTHORIZED)
    (asserts! (is-none (map-get? votes vote-key)) ERR-ALREADY-VOTED)
    (asserts! (< stacks-block-time (get end-time proposal)) ERR-VOTING-ENDED)

    ;; Record vote
    (map-set votes vote-key {
      vote: vote-for,
      voting-power: voter-power,
      voted-at: stacks-block-time
    })

    ;; Update proposal vote counts
    (map-set proposals proposal-id
      (merge proposal {
        votes-for: (if vote-for
          (+ (get votes-for proposal) voter-power)
          (get votes-for proposal)),
        votes-against: (if vote-for
          (get votes-against proposal)
          (+ (get votes-against proposal) voter-power))
      }))

    ;; Emit event
    (print {
      event: "vote-cast",
      proposal-id: proposal-id,
      voter: tx-sender,
      vote-for: vote-for,
      voting-power: voter-power,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Execute proposal after voting ends
(define-public (execute-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    (total-votes (+ (get votes-for proposal) (get votes-against proposal)))
    (total-power (var-get total-voting-power))
  )
    (asserts! (>= stacks-block-time (get end-time proposal)) ERR-VOTING-ACTIVE)
    (asserts! (not (get executed proposal)) ERR-UNAUTHORIZED)

    ;; Check quorum
    (asserts! (>= (* total-votes u100) (* total-power QUORUM-PERCENT)) ERR-QUORUM-NOT-MET)

    ;; Check if proposal passed
    (let (
      (approval-rate (if (> total-votes u0)
        (/ (* (get votes-for proposal) u100) total-votes)
        u0))
      (passed (>= approval-rate APPROVAL-THRESHOLD))
    )
      ;; Mark as executed
      (map-set proposals proposal-id
        (merge proposal {
          executed: true,
          passed: passed
        }))

      ;; Emit event
      (print {
        event: "proposal-executed",
        proposal-id: proposal-id,
        passed: passed,
        votes-for: (get votes-for proposal),
        votes-against: (get votes-against proposal),
        timestamp: stacks-block-time
      })

      (if passed
        (ok true)
        ERR-PROPOSAL-FAILED)
    )
  )
)

;; Delegate voting power
(define-public (delegate-vote (delegate principal))
  (begin
    (map-set delegations tx-sender delegate)
    (print {
      event: "vote-delegated",
      delegator: tx-sender,
      delegate: delegate,
      timestamp: stacks-block-time
    })
    (ok true)
  )
)

;; Remove delegation
(define-public (remove-delegation)
  (begin
    (map-delete delegations tx-sender)
    (print {
      event: "delegation-removed",
      delegator: tx-sender,
      timestamp: stacks-block-time
    })
    (ok true)
  )
)

;; Set voting power (called by staking contract)
(define-public (set-voting-power (user principal) (power uint))
  (begin
    ;; In production, verify caller is authorized staking contract
    (let (
      (old-power (default-to u0 (map-get? voting-power user)))
      (power-delta (if (> power old-power)
        (- power old-power)
        (- old-power power)))
    )
      (map-set voting-power user power)

      ;; Update total voting power
      (if (> power old-power)
        (var-set total-voting-power (+ (var-get total-voting-power) power-delta))
        (var-set total-voting-power (- (var-get total-voting-power) power-delta))
      )

      (ok true)
    )
  )
)

;; Admin Functions

(define-public (pause-governance)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set governance-paused true)
    (ok true)
  )
)

(define-public (resume-governance)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set governance-paused false)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id)
)

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes { proposal-id: proposal-id, voter: voter })
)

(define-read-only (get-voting-power (user principal))
  (match (map-get? delegations user)
    delegate (default-to u0 (map-get? voting-power delegate))
    (default-to u0 (map-get? voting-power user))
  )
)

(define-read-only (get-delegation (user principal))
  (map-get? delegations user)
)

(define-read-only (get-total-voting-power)
  (var-get total-voting-power)
)

(define-read-only (is-governance-paused)
  (var-get governance-paused)
)

(define-read-only (can-execute (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (and
      (>= stacks-block-time (get end-time proposal))
      (not (get executed proposal)))
    false
  )
)

(define-read-only (get-proposal-status (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal {
      is-active: (< stacks-block-time (get end-time proposal)),
      is-executed: (get executed proposal),
      is-passed: (get passed proposal),
      votes-for: (get votes-for proposal),
      votes-against: (get votes-against proposal)
    }
    {
      is-active: false,
      is-executed: false,
      is-passed: false,
      votes-for: u0,
      votes-against: u0
    }
  )
)
