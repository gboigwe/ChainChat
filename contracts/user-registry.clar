;; title: user-registry
;; version: 1.0.0
;; summary: User registration and profiles
;; description: User management system - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-ALREADY-REGISTERED (err u4700))
(define-constant ERR-NOT-REGISTERED (err u4701))

;; Data Variables
(define-data-var total-users uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map users principal {
  username: (string-ascii 50),
  registered-at: uint,  ;; Clarity 4: Unix timestamp
  last-active: uint,
  reputation-score: uint,
  is-active: bool,
  is-verified: bool
})

(define-map username-to-principal (string-ascii 50) principal)

;; Public Functions

(define-public (register-user (username (string-ascii 50)))
  (let (
    (caller tx-sender)
  )
    (asserts! (is-none (map-get? users caller)) ERR-ALREADY-REGISTERED)

    (map-set users caller {
      username: username,
      registered-at: stacks-block-time,
      last-active: stacks-block-time,
      reputation-score: u100,
      is-active: true,
      is-verified: false
    })

    (map-set username-to-principal username caller)
    (var-set total-users (+ (var-get total-users) u1))

    (print {
      event: "user-registered",
      user: caller,
      username: username,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (update-activity)
  (let (
    (caller tx-sender)
    (user-data (unwrap! (map-get? users caller) ERR-NOT-REGISTERED))
  )
    (map-set users caller (merge user-data {
      last-active: stacks-block-time
    }))

    (ok true)
  )
)

(define-public (verify-user (user principal))
  (let (
    (user-data (unwrap! (map-get? users user) ERR-NOT-REGISTERED))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u401))

    (map-set users user (merge user-data {
      is-verified: true
    }))

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-user-profile (user principal))
  (map-get? users user)
)

(define-read-only (get-principal-by-username (username (string-ascii 50)))
  (map-get? username-to-principal username)
)

(define-read-only (get-total-users)
  (var-get total-users)
)

(define-read-only (is-registered (user principal))
  (is-some (map-get? users user))
)
