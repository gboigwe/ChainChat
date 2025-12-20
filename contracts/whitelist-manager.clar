;; title: whitelist-manager
;; version: 1.0.0
;; summary: Whitelist and blacklist management
;; description: Access control via lists - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4800))
(define-constant ERR-BLACKLISTED (err u4801))

;; Data Variables
(define-data-var whitelist-enabled bool false)
(define-data-var blacklist-enabled bool true)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map whitelist principal {
  added-at: uint,  ;; Clarity 4: Unix timestamp
  added-by: principal,
  reason: (string-ascii 100)
})

(define-map blacklist principal {
  added-at: uint,  ;; Clarity 4: Unix timestamp
  added-by: principal,
  reason: (string-ascii 100)
})

;; Public Functions

(define-public (add-to-whitelist (user principal) (reason (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set whitelist user {
      added-at: stacks-block-time,
      added-by: tx-sender,
      reason: reason
    })

    (print {
      event: "whitelisted",
      user: user,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (add-to-blacklist (user principal) (reason (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set blacklist user {
      added-at: stacks-block-time,
      added-by: tx-sender,
      reason: reason
    })

    (print {
      event: "blacklisted",
      user: user,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (remove-from-whitelist (user principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-delete whitelist user)
    (ok true)
  )
)

(define-public (remove-from-blacklist (user principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-delete blacklist user)
    (ok true)
  )
)

(define-public (toggle-whitelist-mode)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set whitelist-enabled (not (var-get whitelist-enabled)))
    (ok (var-get whitelist-enabled))
  )
)

;; Read-Only Functions

(define-read-only (is-whitelisted (user principal))
  (is-some (map-get? whitelist user))
)

(define-read-only (is-blacklisted (user principal))
  (is-some (map-get? blacklist user))
)

(define-read-only (can-access (user principal))
  (let (
    (whitelisted (is-whitelisted user))
    (blacklisted (is-blacklisted user))
    (whitelist-mode (var-get whitelist-enabled))
  )
    (and
      (not blacklisted)
      (or (not whitelist-mode) whitelisted)
    )
  )
)

(define-read-only (get-whitelist-status (user principal))
  (map-get? whitelist user)
)

(define-read-only (get-blacklist-status (user principal))
  (map-get? blacklist user)
)
