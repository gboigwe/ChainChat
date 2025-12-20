;; title: token-distribution
;; version: 1.0.0
;; summary: Token airdrop and distribution
;; description: Manage token distributions and airdrops - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4200))
(define-constant ERR-ALREADY-CLAIMED (err u4201))
(define-constant ERR-NOT-ELIGIBLE (err u4202))

;; Data Variables
(define-data-var distribution-active bool false)
(define-data-var total-distributed uint u0)
(define-data-var next-round-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map distribution-rounds uint {
  total-allocation: uint,
  distributed-amount: uint,
  start-time: uint,    ;; Clarity 4: Unix timestamp
  end-time: uint,      ;; Clarity 4: Unix timestamp
  is-active: bool
})

(define-map eligible-addresses principal uint)
(define-map claimed-amounts principal uint)

;; Public Functions

(define-public (create-distribution-round (allocation uint) (duration uint))
  (let (
    (round-id (var-get next-round-id))
    (end-time (+ stacks-block-time duration))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set distribution-rounds round-id {
      total-allocation: allocation,
      distributed-amount: u0,
      start-time: stacks-block-time,
      end-time: end-time,
      is-active: true
    })

    (var-set next-round-id (+ round-id u1))

    (print {
      event: "distribution-round-created",
      round-id: round-id,
      allocation: allocation,
      timestamp: stacks-block-time
    })

    (ok round-id)
  )
)

(define-public (claim-distribution)
  (let (
    (eligible-amount (unwrap! (map-get? eligible-addresses tx-sender) ERR-NOT-ELIGIBLE))
    (already-claimed (default-to u0 (map-get? claimed-amounts tx-sender)))
  )
    (asserts! (is-eq already-claimed u0) ERR-ALREADY-CLAIMED)
    (asserts! (var-get distribution-active) ERR-UNAUTHORIZED)

    (map-set claimed-amounts tx-sender eligible-amount)
    (var-set total-distributed (+ (var-get total-distributed) eligible-amount))

    (print {
      event: "tokens-claimed",
      claimer: tx-sender,
      amount: eligible-amount,
      timestamp: stacks-block-time
    })

    (ok eligible-amount)
  )
)

(define-public (set-eligible (addresses (list 100 principal)) (amounts (list 100 uint)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    ;; Simplified - would need to iterate and set each address
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-eligible-amount (address principal))
  (map-get? eligible-addresses address)
)

(define-read-only (get-claimed-amount (address principal))
  (map-get? claimed-amounts address)
)

(define-read-only (get-total-distributed)
  (var-get total-distributed)
)
