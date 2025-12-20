;; title: vault-insurance
;; version: 1.0.0
;; summary: Insurance fund for vault protection
;; description: Manages insurance pool for vault losses - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u1000))
(define-constant ERR-INVALID-AMOUNT (err u1001))
(define-constant ERR-INSUFFICIENT-FUNDS (err u1002))
(define-constant ERR-CLAIM-NOT-FOUND (err u1003))
(define-constant ERR-ALREADY-PROCESSED (err u1004))
(define-constant ERR-NOT-APPROVED (err u1005))
(define-constant ERR-CLAIM-EXPIRED (err u1006))
(define-constant ERR-COVERAGE-EXCEEDED (err u1007))

;; Claim statuses
(define-constant STATUS-PENDING u1)
(define-constant STATUS-APPROVED u2)
(define-constant STATUS-REJECTED u3)
(define-constant STATUS-PAID u4)

;; Coverage limits (in basis points)
(define-constant MAX-COVERAGE-PERCENT u5000)  ;; 50% of loss
(define-constant MIN-CLAIM-AMOUNT u1000000)   ;; 1 STX minimum

;; Claim review period
(define-constant CLAIM-REVIEW-PERIOD u259200)  ;; 3 days

;; Data Variables
(define-data-var total-insurance-pool uint u0)
(define-data-var total-claims-paid uint u0)
(define-data-var total-claims-filed uint u0)
(define-data-var next-claim-id uint u1)
(define-data-var insurance-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map vault-coverage principal {
  vault: principal,
  coverage-limit: uint,
  premium-rate: uint,      ;; In basis points
  total-premiums-paid: uint,
  last-premium-payment: uint,  ;; Clarity 4: Unix timestamp
  is-covered: bool
})

(define-map insurance-claims uint {
  claimant: principal,
  vault: principal,
  loss-amount: uint,
  claimed-amount: uint,
  description: (string-ascii 300),
  evidence-hash: (buff 32),
  filed-at: uint,         ;; Clarity 4: Unix timestamp
  reviewed-at: uint,      ;; Clarity 4: Unix timestamp
  paid-at: uint,          ;; Clarity 4: Unix timestamp
  status: uint,
  reviewer: (optional principal)
})

(define-map claim-votes {
  claim-id: uint,
  voter: principal
} {
  approved: bool,
  voted-at: uint  ;; Clarity 4: Unix timestamp
})

(define-map insurance-reviewers principal bool)

(define-map premium-history uint {
  vault: principal,
  amount: uint,
  paid-at: uint  ;; Clarity 4: Unix timestamp
})

(define-data-var next-premium-id uint u1)

;; Initialize insurance reviewers
(map-set insurance-reviewers CONTRACT-OWNER true)

;; Private Functions

(define-private (is-reviewer (user principal))
  (default-to false (map-get? insurance-reviewers user))
)

(define-private (calculate-coverage (loss-amount uint))
  (/ (* loss-amount MAX-COVERAGE-PERCENT) u10000)
)

;; Public Functions

;; Add insurance reviewer
(define-public (add-reviewer (reviewer principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set insurance-reviewers reviewer true)

    (print {
      event: "reviewer-added",
      reviewer: reviewer,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Deposit to insurance pool
(define-public (deposit-insurance (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer funds to contract
    (try! (stx-transfer? amount tx-sender tx-sender))

    (var-set total-insurance-pool (+ (var-get total-insurance-pool) amount))

    (print {
      event: "insurance-deposit",
      depositor: tx-sender,
      amount: amount,
      new-pool-balance: (var-get total-insurance-pool),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Register vault for coverage
(define-public (register-vault
  (vault principal)
  (coverage-limit uint)
  (premium-rate uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (> coverage-limit u0) ERR-INVALID-AMOUNT)

    (map-set vault-coverage vault {
      vault: vault,
      coverage-limit: coverage-limit,
      premium-rate: premium-rate,
      total-premiums-paid: u0,
      last-premium-payment: u0,
      is-covered: true
    })

    (print {
      event: "vault-registered",
      vault: vault,
      coverage-limit: coverage-limit,
      premium-rate: premium-rate,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Pay premium
(define-public (pay-premium (vault principal) (amount uint))
  (let (
    (coverage-data (unwrap! (map-get? vault-coverage vault) ERR-UNAUTHORIZED))
    (premium-id (var-get next-premium-id))
  )
    (asserts! (get is-covered coverage-data) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer premium to contract
    (try! (stx-transfer? amount tx-sender tx-sender))

    ;; Update coverage data
    (map-set vault-coverage vault
      (merge coverage-data {
        total-premiums-paid: (+ (get total-premiums-paid coverage-data) amount),
        last-premium-payment: stacks-block-time
      }))

    ;; Add to insurance pool
    (var-set total-insurance-pool (+ (var-get total-insurance-pool) amount))

    ;; Record premium payment
    (map-set premium-history premium-id {
      vault: vault,
      amount: amount,
      paid-at: stacks-block-time
    })
    (var-set next-premium-id (+ premium-id u1))

    (print {
      event: "premium-paid",
      vault: vault,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; File insurance claim
(define-public (file-claim
  (vault principal)
  (loss-amount uint)
  (description (string-ascii 300))
  (evidence-hash (buff 32)))
  (let (
    (coverage-data (unwrap! (map-get? vault-coverage vault) ERR-UNAUTHORIZED))
    (claim-id (var-get next-claim-id))
    (coverage-amount (calculate-coverage loss-amount))
  )
    (asserts! (get is-covered coverage-data) ERR-UNAUTHORIZED)
    (asserts! (>= loss-amount MIN-CLAIM-AMOUNT) ERR-INVALID-AMOUNT)
    (asserts! (<= coverage-amount (get coverage-limit coverage-data)) ERR-COVERAGE-EXCEEDED)

    (map-set insurance-claims claim-id {
      claimant: tx-sender,
      vault: vault,
      loss-amount: loss-amount,
      claimed-amount: coverage-amount,
      description: description,
      evidence-hash: evidence-hash,
      filed-at: stacks-block-time,
      reviewed-at: u0,
      paid-at: u0,
      status: STATUS-PENDING,
      reviewer: none
    })

    (var-set next-claim-id (+ claim-id u1))
    (var-set total-claims-filed (+ (var-get total-claims-filed) u1))

    (print {
      event: "claim-filed",
      claim-id: claim-id,
      claimant: tx-sender,
      vault: vault,
      loss-amount: loss-amount,
      claimed-amount: coverage-amount,
      timestamp: stacks-block-time
    })

    (ok claim-id)
  )
)

;; Review claim
(define-public (review-claim (claim-id uint) (approved bool))
  (let (
    (claim-data (unwrap! (map-get? insurance-claims claim-id) ERR-CLAIM-NOT-FOUND))
  )
    (asserts! (is-reviewer tx-sender) ERR-UNAUTHORIZED)
    (asserts! (is-eq (get status claim-data) STATUS-PENDING) ERR-ALREADY-PROCESSED)

    ;; Update claim status
    (map-set insurance-claims claim-id
      (merge claim-data {
        status: (if approved STATUS-APPROVED STATUS-REJECTED),
        reviewed-at: stacks-block-time,
        reviewer: (some tx-sender)
      }))

    (print {
      event: "claim-reviewed",
      claim-id: claim-id,
      reviewer: tx-sender,
      approved: approved,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Pay approved claim
(define-public (pay-claim (claim-id uint))
  (let (
    (claim-data (unwrap! (map-get? insurance-claims claim-id) ERR-CLAIM-NOT-FOUND))
    (claimed-amount (get claimed-amount claim-data))
  )
    (asserts! (is-reviewer tx-sender) ERR-UNAUTHORIZED)
    (asserts! (is-eq (get status claim-data) STATUS-APPROVED) ERR-NOT-APPROVED)
    (asserts! (<= claimed-amount (var-get total-insurance-pool)) ERR-INSUFFICIENT-FUNDS)

    ;; Transfer insurance payout
    (try! (begin (stx-transfer? claimed-amount tx-sender (get claimant claim-data))))

    ;; Update claim
    (map-set insurance-claims claim-id
      (merge claim-data {
        status: STATUS-PAID,
        paid-at: stacks-block-time
      }))

    ;; Update pool
    (var-set total-insurance-pool (- (var-get total-insurance-pool) claimed-amount))
    (var-set total-claims-paid (+ (var-get total-claims-paid) claimed-amount))

    (print {
      event: "claim-paid",
      claim-id: claim-id,
      claimant: (get claimant claim-data),
      amount: claimed-amount,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Cancel vault coverage
(define-public (cancel-coverage (vault principal))
  (let (
    (coverage-data (unwrap! (map-get? vault-coverage vault) ERR-UNAUTHORIZED))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set vault-coverage vault
      (merge coverage-data { is-covered: false }))

    (print {
      event: "coverage-cancelled",
      vault: vault,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Pause insurance
(define-public (pause-insurance)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set insurance-paused true)
    (ok true)
  )
)

;; Resume insurance
(define-public (resume-insurance)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set insurance-paused false)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-insurance-pool-balance)
  (var-get total-insurance-pool)
)

(define-read-only (get-total-claims-paid)
  (var-get total-claims-paid)
)

(define-read-only (get-total-claims-filed)
  (var-get total-claims-filed)
)

(define-read-only (get-vault-coverage (vault principal))
  (map-get? vault-coverage vault)
)

(define-read-only (get-claim (claim-id uint))
  (map-get? insurance-claims claim-id)
)

(define-read-only (get-premium-record (premium-id uint))
  (map-get? premium-history premium-id)
)

(define-read-only (is-insurance-reviewer (user principal))
  (is-reviewer user)
)

(define-read-only (is-insurance-paused)
  (var-get insurance-paused)
)

(define-read-only (get-max-coverage (loss-amount uint))
  (calculate-coverage loss-amount)
)
