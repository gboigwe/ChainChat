;; title: kyc-registry
;; version: 1.0.0
;; summary: KYC verification registry
;; description: Track user KYC status - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5100))
(define-constant ERR-NOT-VERIFIED (err u5101))

;; KYC levels
(define-constant KYC-NONE u0)
(define-constant KYC-LEVEL-1 u1)
(define-constant KYC-LEVEL-2 u2)
(define-constant KYC-LEVEL-3 u3)

;; Data Variables
(define-data-var total-verified uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map kyc-records principal {
  kyc-level: uint,
  verified-at: uint,  ;; Clarity 4: Unix timestamp
  verified-by: principal,
  expires-at: uint,
  country-code: (string-ascii 3),
  is-active: bool
})

(define-map kyc-providers principal {
  name: (string-ascii 50),
  approved: bool,
  added-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (add-kyc-provider (provider principal) (name (string-ascii 50)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set kyc-providers provider {
      name: name,
      approved: true,
      added-at: stacks-block-time
    })

    (ok true)
  )
)

(define-public (verify-user
  (user principal)
  (kyc-level uint)
  (country-code (string-ascii 3))
  (expires-at uint))
  (let (
    (provider-data (unwrap! (map-get? kyc-providers tx-sender) ERR-UNAUTHORIZED))
  )
    (asserts! (get approved provider-data) ERR-UNAUTHORIZED)

    (map-set kyc-records user {
      kyc-level: kyc-level,
      verified-at: stacks-block-time,
      verified-by: tx-sender,
      expires-at: expires-at,
      country-code: country-code,
      is-active: true
    })

    (var-set total-verified (+ (var-get total-verified) u1))

    (print {
      event: "kyc-verified",
      user: user,
      level: kyc-level,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (revoke-kyc (user principal))
  (let (
    (kyc-data (unwrap! (map-get? kyc-records user) ERR-NOT-VERIFIED))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set kyc-records user (merge kyc-data {
      is-active: false
    }))

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-kyc-status (user principal))
  (map-get? kyc-records user)
)

(define-read-only (is-kyc-verified (user principal))
  (match (map-get? kyc-records user)
    kyc-data (and
      (get is-active kyc-data)
      (or
        (is-eq (get expires-at kyc-data) u0)
        (> (get expires-at kyc-data) stacks-block-time)
      )
    )
    false
  )
)

(define-read-only (has-kyc-level (user principal) (required-level uint))
  (match (map-get? kyc-records user)
    kyc-data (and
      (get is-active kyc-data)
      (>= (get kyc-level kyc-data) required-level)
      (or
        (is-eq (get expires-at kyc-data) u0)
        (> (get expires-at kyc-data) stacks-block-time)
      )
    )
    false
  )
)

(define-read-only (get-total-verified)
  (var-get total-verified)
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate KYC user principals
(define-read-only (validate-kyc-user (u principal))
  (principal-destruct? u)
)

;; 2. Clarity 4: int-to-ascii - Format KYC level
(define-read-only (format-kyc-level (l uint))
  (ok (int-to-ascii l))
)

;; 3. Clarity 4: string-to-uint? - Parse KYC level from string
(define-read-only (parse-kyc-level (l-str (string-ascii 5)))
  (match (string-to-uint? l-str)
    l (ok l)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track KYC timestamps
(define-read-only (get-kyc-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
