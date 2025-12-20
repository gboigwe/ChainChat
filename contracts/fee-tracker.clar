;; title: fee-tracker
;; version: 1.0.0
;; summary: Fee collection tracking
;; description: Track all protocol fees - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5400))

;; Fee types
(define-constant FEE-DEPOSIT u1)
(define-constant FEE-WITHDRAWAL u2)
(define-constant FEE-PERFORMANCE u3)
(define-constant FEE-MANAGEMENT u4)

;; Data Variables
(define-data-var total-fees-collected uint u0)
(define-data-var next-fee-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map fee-records uint {
  fee-type: uint,
  amount: uint,
  payer: principal,
  recipient: principal,
  vault: principal,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

(define-map vault-fee-summary principal {
  total-collected: uint,
  deposit-fees: uint,
  withdrawal-fees: uint,
  performance-fees: uint,
  management-fees: uint,
  last-collection: uint  ;; Clarity 4: Unix timestamp
})

(define-map fee-distribution-history uint {
  total-amount: uint,
  treasury-share: uint,
  stakers-share: uint,
  team-share: uint,
  distributed-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (record-fee
  (fee-type uint)
  (amount uint)
  (payer principal)
  (recipient principal)
  (vault principal))
  (let (
    (fee-id (var-get next-fee-id))
    (summary (default-to
      { total-collected: u0, deposit-fees: u0, withdrawal-fees: u0,
        performance-fees: u0, management-fees: u0, last-collection: u0 }
      (map-get? vault-fee-summary vault)))
  )
    (map-set fee-records fee-id {
      fee-type: fee-type,
      amount: amount,
      payer: payer,
      recipient: recipient,
      vault: vault,
      timestamp: stacks-block-time
    })

    (map-set vault-fee-summary vault {
      total-collected: (+ (get total-collected summary) amount),
      deposit-fees: (if (is-eq fee-type FEE-DEPOSIT)
        (+ (get deposit-fees summary) amount)
        (get deposit-fees summary)),
      withdrawal-fees: (if (is-eq fee-type FEE-WITHDRAWAL)
        (+ (get withdrawal-fees summary) amount)
        (get withdrawal-fees summary)),
      performance-fees: (if (is-eq fee-type FEE-PERFORMANCE)
        (+ (get performance-fees summary) amount)
        (get performance-fees summary)),
      management-fees: (if (is-eq fee-type FEE-MANAGEMENT)
        (+ (get management-fees summary) amount)
        (get management-fees summary)),
      last-collection: stacks-block-time
    })

    (var-set total-fees-collected (+ (var-get total-fees-collected) amount))
    (var-set next-fee-id (+ fee-id u1))

    (print {
      event: "fee-recorded",
      fee-id: fee-id,
      type: fee-type,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok fee-id)
  )
)

;; Read-Only Functions

(define-read-only (get-fee-record (fee-id uint))
  (map-get? fee-records fee-id)
)

(define-read-only (get-vault-fees (vault principal))
  (map-get? vault-fee-summary vault)
)

(define-read-only (get-total-fees-collected)
  (var-get total-fees-collected)
)

(define-read-only (get-distribution-record (distribution-id uint))
  (map-get? fee-distribution-history distribution-id)
)
