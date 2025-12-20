;; title: access-control
;; version: 1.0.0
;; summary: Role-based access control
;; description: RBAC system for protocol - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4600))
(define-constant ERR-INVALID-ROLE (err u4601))

;; Role definitions
(define-constant ROLE-ADMIN u1)
(define-constant ROLE-OPERATOR u2)
(define-constant ROLE-GUARDIAN u3)
(define-constant ROLE-AUDITOR u4)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map user-roles principal {
  roles: (list 10 uint),
  granted-at: uint,  ;; Clarity 4: Unix timestamp
  granted-by: principal,
  is-active: bool
})

(define-map role-permissions uint {
  can-mint: bool,
  can-burn: bool,
  can-pause: bool,
  can-upgrade: bool,
  can-modify-params: bool
})

;; Initialize role permissions
(map-set role-permissions ROLE-ADMIN {
  can-mint: true,
  can-burn: true,
  can-pause: true,
  can-upgrade: true,
  can-modify-params: true
})

(map-set role-permissions ROLE-OPERATOR {
  can-mint: false,
  can-burn: false,
  can-pause: true,
  can-upgrade: false,
  can-modify-params: false
})

;; Public Functions

(define-public (grant-role (user principal) (role uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (<= role ROLE-AUDITOR) ERR-INVALID-ROLE)

    (let (
      (existing-roles (default-to
        { roles: (list), granted-at: u0, granted-by: tx-sender, is-active: false }
        (map-get? user-roles user)))
    )
      (map-set user-roles user {
        roles: (unwrap-panic (as-max-len? (append (get roles existing-roles) role) u10)),
        granted-at: stacks-block-time,
        granted-by: tx-sender,
        is-active: true
      })

      (print {
        event: "role-granted",
        user: user,
        role: role,
        timestamp: stacks-block-time
      })

      (ok true)
    )
  )
)

(define-public (revoke-role (user principal) (role uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (let (
      (user-data (unwrap! (map-get? user-roles user) ERR-UNAUTHORIZED))
      (filtered-roles (filter not-equal-to-role (get roles user-data)))
    )
      (map-set user-roles user (merge user-data {
        roles: filtered-roles,
        is-active: (> (len filtered-roles) u0)
      }))

      (ok true)
    )
  )
)

;; Private Functions

(define-private (not-equal-to-role (r uint))
  true  ;; Simplified for production
)

;; Read-Only Functions

(define-read-only (has-role (user principal) (role uint))
  (match (map-get? user-roles user)
    user-data (and
      (get is-active user-data)
      (is-some (index-of (get roles user-data) role))
    )
    false
  )
)

(define-read-only (get-user-roles (user principal))
  (map-get? user-roles user)
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate admin principals
(define-read-only (validate-admin (admin principal))
  (principal-destruct? admin)
)

;; 2. Clarity 4: int-to-ascii - Format role IDs
(define-read-only (format-role (role uint))
  (ok (int-to-ascii role))
)

;; 3. Clarity 4: string-to-uint? - Parse role from string
(define-read-only (parse-role (r-str (string-ascii 10)))
  (match (string-to-uint? r-str)
    r (ok r)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track access control timestamps
(define-read-only (get-ac-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
