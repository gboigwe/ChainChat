;; title: strategy-options-selling
;; version: 1.0.0
;; summary: Covered options selling strategy
;; description: Generate income from option premiums - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u3300))
(define-constant ERR-INVALID-STRIKE (err u3301))

;; Data Variables
(define-data-var strategy-paused bool false)
(define-data-var total-options-sold uint u0)
(define-data-var next-option-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map sold-options uint {
  seller: principal,
  strike-price: uint,
  premium: uint,
  collateral: uint,
  expiry: uint,       ;; Clarity 4: Unix timestamp
  created-at: uint,   ;; Clarity 4: Unix timestamp
  is-exercised: bool,
  is-active: bool
})

;; Public Functions

(define-public (sell-covered-call (strike uint) (premium uint) (collateral uint) (duration uint))
  (let (
    (option-id (var-get next-option-id))
    (expiry (+ stacks-block-time duration))
  )
    (asserts! (not (var-get strategy-paused)) ERR-UNAUTHORIZED)
    (asserts! (> strike u0) ERR-INVALID-STRIKE)

    (map-set sold-options option-id {
      seller: tx-sender,
      strike-price: strike,
      premium: premium,
      collateral: collateral,
      expiry: expiry,
      created-at: stacks-block-time,
      is-exercised: false,
      is-active: true
    })

    (var-set next-option-id (+ option-id u1))
    (var-set total-options-sold (+ (var-get total-options-sold) u1))

    (print {
      event: "option-sold",
      option-id: option-id,
      premium: premium,
      timestamp: stacks-block-time
    })

    (ok option-id)
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

(define-read-only (get-option (option-id uint))
  (map-get? sold-options option-id)
)
