;; title: faucet
;; version: 1.0.0
;; summary: Test token faucet
;; description: Dispense test tokens for development - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u7800))
(define-constant ERR-ALREADY-CLAIMED (err u7801))
(define-constant ERR-COOLDOWN (err u7802))

;; Faucet parameters
(define-constant FAUCET-AMOUNT u10000000000)  ;; 10,000 tokens with 6 decimals
(define-constant COOLDOWN-PERIOD u86400)  ;; 24 hours in seconds

;; Data Variables
(define-data-var total-claims uint u0)
(define-data-var total-distributed uint u0)
(define-data-var is-active bool true)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map claims principal {
  last-claim: uint,  ;; Clarity 4: Unix timestamp
  total-claimed: uint,
  claim-count: uint
})

;; Public Functions

(define-public (claim-tokens)
  (let (
    (claimer tx-sender)
    (user-claims (default-to
      { last-claim: u0, total-claimed: u0, claim-count: u0 }
      (map-get? claims claimer)))
    (last-claim-time (get last-claim user-claims))
    (time-since-claim (- stacks-block-time last-claim-time))
  )
    (asserts! (var-get is-active) (err u400))
    (asserts! (or
      (is-eq last-claim-time u0)
      (>= time-since-claim COOLDOWN-PERIOD)
    ) ERR-COOLDOWN)

    (map-set claims claimer {
      last-claim: stacks-block-time,
      total-claimed: (+ (get total-claimed user-claims) FAUCET-AMOUNT),
      claim-count: (+ (get claim-count user-claims) u1)
    })

    (var-set total-claims (+ (var-get total-claims) u1))
    (var-set total-distributed (+ (var-get total-distributed) FAUCET-AMOUNT))

    (print {
      event: "tokens-claimed",
      user: claimer,
      amount: FAUCET-AMOUNT,
      timestamp: stacks-block-time
    })

    (ok FAUCET-AMOUNT)
  )
)

(define-public (toggle-faucet)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set is-active (not (var-get is-active)))
    (ok (var-get is-active))
  )
)

(define-public (emergency-withdraw)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-claim-info (user principal))
  (map-get? claims user)
)

(define-read-only (can-claim (user principal))
  (let (
    (user-claims (map-get? claims user))
  )
    (match user-claims
      claims-data (let (
        (time-since-claim (- stacks-block-time (get last-claim claims-data)))
      )
        (>= time-since-claim COOLDOWN-PERIOD)
      )
      true  ;; Never claimed before
    )
  )
)

(define-read-only (time-until-next-claim (user principal))
  (match (map-get? claims user)
    claims-data (let (
      (time-since-claim (- stacks-block-time (get last-claim claims-data)))
    )
      (if (>= time-since-claim COOLDOWN-PERIOD)
        (ok u0)
        (ok (- COOLDOWN-PERIOD time-since-claim))
      )
    )
    (ok u0)  ;; Never claimed, can claim now
  )
)

(define-read-only (get-faucet-stats)
  (ok {
    total-claims: (var-get total-claims),
    total-distributed: (var-get total-distributed),
    is-active: (var-get is-active),
    faucet-amount: FAUCET-AMOUNT,
    cooldown-period: COOLDOWN-PERIOD
  })
)

(define-read-only (is-faucet-active)
  (var-get is-active)
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate recipient principals
(define-read-only (validate-recipient (r principal))
  (principal-destruct? r)
)

;; 2. Clarity 4: int-to-utf8 - Format total distributed amount
(define-read-only (format-total-distributed)
  (ok (int-to-utf8 (var-get total-distributed)))
)

;; 3. Clarity 4: string-to-uint? - Parse amount from string
(define-read-only (parse-amount-str (a-str (string-ascii 20)))
  (match (string-to-uint? a-str)
    a (ok a)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track faucet timestamps
(define-read-only (get-faucet-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
