;; title: vault-fee-collector
;; version: 1.0.0
;; summary: Protocol fee collection and distribution
;; description: Collects and manages protocol fees from vaults - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u600))
(define-constant ERR-INSUFFICIENT-BALANCE (err u601))
(define-constant ERR-INVALID-PERCENTAGE (err u602))
(define-constant ERR-NO-FEES-COLLECTED (err u603))

;; Fee percentages (in basis points, 1% = 100)
(define-constant DEFAULT-PROTOCOL-FEE u30)  ;; 0.3%
(define-constant MAX-FEE u1000)  ;; 10% max

;; Data Variables
(define-data-var protocol-fee-percent uint DEFAULT-PROTOCOL-FEE)
(define-data-var total-fees-collected uint u0)
(define-data-var total-fees-distributed uint u0)
(define-data-var fee-collection-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map vault-fees principal {
  total-collected: uint,
  last-collection: uint,  ;; Clarity 4: Unix timestamp
  fee-percent: uint
})

(define-map fee-recipients principal {
  allocation-percent: uint,  ;; In basis points
  total-received: uint,
  is-active: bool
})

(define-map collection-history uint {
  collector: principal,
  amount: uint,
  collected-at: uint,  ;; Clarity 4: Unix timestamp
  vault: principal
})

(define-data-var next-collection-id uint u1)

;; Public Functions

;; Collect fees from vault
(define-public (collect-fees (vault principal) (amount uint))
  (let (
    (collection-id (var-get next-collection-id))
    (vault-fee-data (default-to
      { total-collected: u0, last-collection: u0, fee-percent: (var-get protocol-fee-percent) }
      (map-get? vault-fees vault)))
  )
    (asserts! (not (var-get fee-collection-paused)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-NO-FEES-COLLECTED)

    ;; Transfer fees to this contract
    (try! (stx-transfer? amount tx-sender tx-sender))

    ;; Update vault fees
    (map-set vault-fees vault {
      total-collected: (+ (get total-collected vault-fee-data) amount),
      last-collection: stacks-block-time,
      fee-percent: (get fee-percent vault-fee-data)
    })

    ;; Record collection
    (map-set collection-history collection-id {
      collector: tx-sender,
      amount: amount,
      collected-at: stacks-block-time,
      vault: vault
    })

    (var-set next-collection-id (+ collection-id u1))
    (var-set total-fees-collected (+ (var-get total-fees-collected) amount))

    ;; Emit event
    (print {
      event: "fees-collected",
      vault: vault,
      amount: amount,
      collection-id: collection-id,
      timestamp: stacks-block-time
    })

    (ok collection-id)
  )
)

;; Distribute fees to recipients
(define-public (distribute-fees (recipient principal) (amount uint))
  (let (
    (recipient-data (unwrap! (map-get? fee-recipients recipient) ERR-UNAUTHORIZED))
    (contract-balance (stx-get-balance tx-sender))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (get is-active recipient-data) ERR-UNAUTHORIZED)
    (asserts! (<= amount contract-balance) ERR-INSUFFICIENT-BALANCE)

    ;; Transfer fees
    (try! (begin (stx-transfer? amount tx-sender recipient)))

    ;; Update recipient data
    (map-set fee-recipients recipient
      (merge recipient-data {
        total-received: (+ (get total-received recipient-data) amount)
      }))

    (var-set total-fees-distributed (+ (var-get total-fees-distributed) amount))

    ;; Emit event
    (print {
      event: "fees-distributed",
      recipient: recipient,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Add fee recipient
(define-public (add-recipient (recipient principal) (allocation-percent uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= allocation-percent u10000) ERR-INVALID-PERCENTAGE)

    (map-set fee-recipients recipient {
      allocation-percent: allocation-percent,
      total-received: u0,
      is-active: true
    })

    (print {
      event: "recipient-added",
      recipient: recipient,
      allocation: allocation-percent,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Update protocol fee
(define-public (set-protocol-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= new-fee MAX-FEE) ERR-INVALID-PERCENTAGE)

    (var-set protocol-fee-percent new-fee)

    (print {
      event: "protocol-fee-updated",
      new-fee: new-fee,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Set vault-specific fee
(define-public (set-vault-fee (vault principal) (fee-percent uint))
  (let (
    (vault-data (default-to
      { total-collected: u0, last-collection: u0, fee-percent: (var-get protocol-fee-percent) }
      (map-get? vault-fees vault)))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= fee-percent MAX-FEE) ERR-INVALID-PERCENTAGE)

    (map-set vault-fees vault
      (merge vault-data { fee-percent: fee-percent }))

    (ok true)
  )
)

;; Pause fee collection
(define-public (pause-collection)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set fee-collection-paused true)
    (ok true)
  )
)

;; Resume fee collection
(define-public (resume-collection)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set fee-collection-paused false)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-vault-fees (vault principal))
  (map-get? vault-fees vault)
)

(define-read-only (get-recipient-info (recipient principal))
  (map-get? fee-recipients recipient)
)

(define-read-only (get-collection-record (collection-id uint))
  (map-get? collection-history collection-id)
)

(define-read-only (get-protocol-fee)
  (var-get protocol-fee-percent)
)

(define-read-only (get-total-fees-collected)
  (var-get total-fees-collected)
)

(define-read-only (get-total-fees-distributed)
  (var-get total-fees-distributed)
)

(define-read-only (get-contract-balance)
  (stx-get-balance tx-sender)
)

(define-read-only (is-collection-paused)
  (var-get fee-collection-paused)
)
