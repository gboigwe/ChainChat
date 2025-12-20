;; title: multi-sig
;; version: 1.0.0
;; summary: Multi-signature wallet
;; description: M-of-N signature system - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4900))
(define-constant ERR-ALREADY-SIGNED (err u4901))
(define-constant ERR-NOT-SIGNER (err u4902))
(define-constant ERR-INVALID-THRESHOLD (err u4903))

;; Data Variables
(define-data-var required-signatures uint u3)
(define-data-var total-signers uint u0)
(define-data-var next-transaction-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map signers principal bool)

(define-map transactions uint {
  proposer: principal,
  target: principal,
  amount: uint,
  created-at: uint,  ;; Clarity 4: Unix timestamp
  executed-at: uint,
  signature-count: uint,
  is-executed: bool
})

(define-map transaction-signatures { tx-id: uint, signer: principal } {
  signed-at: uint,  ;; Clarity 4: Unix timestamp
  approved: bool
})

;; Public Functions

(define-public (add-signer (new-signer principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set signers new-signer true)
    (var-set total-signers (+ (var-get total-signers) u1))
    (ok true)
  )
)

(define-public (propose-transaction (target principal) (amount uint))
  (let (
    (tx-id (var-get next-transaction-id))
  )
    (asserts! (is-signer tx-sender) ERR-NOT-SIGNER)

    (map-set transactions tx-id {
      proposer: tx-sender,
      target: target,
      amount: amount,
      created-at: stacks-block-time,
      executed-at: u0,
      signature-count: u0,
      is-executed: false
    })

    (var-set next-transaction-id (+ tx-id u1))

    (print {
      event: "transaction-proposed",
      tx-id: tx-id,
      proposer: tx-sender,
      timestamp: stacks-block-time
    })

    (ok tx-id)
  )
)

(define-public (sign-transaction (tx-id uint))
  (let (
    (tx-data (unwrap! (map-get? transactions tx-id) (err u404)))
    (sig-key { tx-id: tx-id, signer: tx-sender })
  )
    (asserts! (is-signer tx-sender) ERR-NOT-SIGNER)
    (asserts! (is-none (map-get? transaction-signatures sig-key)) ERR-ALREADY-SIGNED)
    (asserts! (not (get is-executed tx-data)) (err u400))

    (map-set transaction-signatures sig-key {
      signed-at: stacks-block-time,
      approved: true
    })

    (map-set transactions tx-id (merge tx-data {
      signature-count: (+ (get signature-count tx-data) u1)
    }))

    (ok true)
  )
)

(define-public (execute-transaction (tx-id uint))
  (let (
    (tx-data (unwrap! (map-get? transactions tx-id) (err u404)))
  )
    (asserts! (>= (get signature-count tx-data) (var-get required-signatures)) (err u403))
    (asserts! (not (get is-executed tx-data)) (err u400))

    (try! (stx-transfer? (get amount tx-data) tx-sender (get target tx-data)))

    (map-set transactions tx-id (merge tx-data {
      is-executed: true,
      executed-at: stacks-block-time
    }))

    (ok true)
  )
)

;; Private Functions

(define-private (is-signer (user principal))
  (default-to false (map-get? signers user))
)

;; Read-Only Functions

(define-read-only (get-transaction (tx-id uint))
  (map-get? transactions tx-id)
)

(define-read-only (get-signature (tx-id uint) (signer principal))
  (map-get? transaction-signatures { tx-id: tx-id, signer: signer })
)

(define-read-only (get-required-signatures)
  (var-get required-signatures)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate signer principals
(define-read-only (validate-signer-principal (signer principal))
  (principal-destruct? signer)
)

;; 2. Clarity 4: int-to-ascii - Format signature counts
(define-read-only (format-required-sigs)
  (ok (int-to-ascii (var-get required-signatures)))
)

;; 3. Clarity 4: string-to-uint? - Parse transaction IDs
(define-read-only (parse-tx-id (id-str (string-ascii 20)))
  (match (string-to-uint? id-str)
    tx-id (ok tx-id)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track multi-sig transactions
(define-read-only (get-multisig-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
