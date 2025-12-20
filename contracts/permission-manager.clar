;; title: permission-manager
;; version: 1.0.0
;; summary: Granular permission management
;; description: Fine-grained access control - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5000))
(define-constant ERR-NO-PERMISSION (err u5001))

;; Permission types
(define-constant PERM-TRANSFER u1)
(define-constant PERM-MINT u2)
(define-constant PERM-BURN u3)
(define-constant PERM-PAUSE u4)
(define-constant PERM-UPGRADE u5)
(define-constant PERM-ADMIN u6)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map user-permissions { user: principal, permission: uint } {
  granted: bool,
  granted-at: uint,  ;; Clarity 4: Unix timestamp
  granted-by: principal,
  expires-at: uint
})

(define-map resource-access { resource: (string-ascii 50), user: principal } {
  can-read: bool,
  can-write: bool,
  can-execute: bool,
  granted-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (grant-permission (user principal) (permission uint) (expires-at uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set user-permissions { user: user, permission: permission } {
      granted: true,
      granted-at: stacks-block-time,
      granted-by: tx-sender,
      expires-at: expires-at
    })

    (print {
      event: "permission-granted",
      user: user,
      permission: permission,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (revoke-permission (user principal) (permission uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-delete user-permissions { user: user, permission: permission })

    (ok true)
  )
)

(define-public (grant-resource-access
  (resource (string-ascii 50))
  (user principal)
  (can-read bool)
  (can-write bool)
  (can-execute bool))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set resource-access { resource: resource, user: user } {
      can-read: can-read,
      can-write: can-write,
      can-execute: can-execute,
      granted-at: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (has-permission (user principal) (permission uint))
  (match (map-get? user-permissions { user: user, permission: permission })
    perm-data (and
      (get granted perm-data)
      (or
        (is-eq (get expires-at perm-data) u0)
        (> (get expires-at perm-data) stacks-block-time)
      )
    )
    false
  )
)

(define-read-only (get-permission (user principal) (permission uint))
  (map-get? user-permissions { user: user, permission: permission })
)

(define-read-only (can-access-resource
  (resource (string-ascii 50))
  (user principal)
  (access-type (string-ascii 10)))
  (match (map-get? resource-access { resource: resource, user: user })
    access-data (if (is-eq access-type "read")
      (get can-read access-data)
      (if (is-eq access-type "write")
        (get can-write access-data)
        (get can-execute access-data)
      )
    )
    false
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate user principals
(define-read-only (validate-user-principal (user principal))
  (principal-destruct? user)
)

;; 2. Clarity 4: int-to-ascii - Format permission levels
(define-read-only (format-permission-level (level uint))
  (ok (int-to-ascii level))
)

;; 3. Clarity 4: string-to-uint? - Parse permission values
(define-read-only (parse-permission-string (perm-str (string-ascii 10)))
  (match (string-to-uint? perm-str)
    perm (ok perm)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track permission changes
(define-read-only (get-permission-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
