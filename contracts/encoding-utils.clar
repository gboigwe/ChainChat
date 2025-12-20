;; title: encoding-utils
;; version: 1.0.0
;; summary: Encoding and hashing utilities
;; description: Hash functions and encoding - Clarity 4

;; Constants
(define-constant ERR-INVALID-INPUT (err u7100))

;; Read-Only Functions

(define-read-only (hash-uint (value uint))
  (ok (keccak256 value))
)

(define-read-only (hash-string (str (string-ascii 200)))
  (ok (keccak256 (unwrap-panic (to-consensus-buff? str))))
)

(define-read-only (hash-principal (address principal))
  (ok (keccak256 (unwrap-panic (to-consensus-buff? address))))
)

(define-read-only (hash-two-uints (a uint) (b uint))
  (ok (keccak256 (concat
    (unwrap-panic (to-consensus-buff? a))
    (unwrap-panic (to-consensus-buff? b))
  )))
)

(define-read-only (hash-tuple (data { amount: uint, recipient: principal }))
  (ok (keccak256 (unwrap-panic (to-consensus-buff? data))))
)

(define-read-only (create-message-hash
  (sender principal)
  (recipient principal)
  (amount uint)
  (nonce uint))
  (ok (keccak256 (unwrap-panic (to-consensus-buff? {
    sender: sender,
    recipient: recipient,
    amount: amount,
    nonce: nonce
  }))))
)

(define-read-only (sha256-uint (value uint))
  (ok (sha256 value))
)

(define-read-only (sha256-string (str (string-ascii 200)))
  (ok (sha256 (unwrap-panic (to-consensus-buff? str))))
)

(define-read-only (sha512-uint (value uint))
  (ok (sha512 value))
)

(define-read-only (sha512-string (str (string-ascii 200)))
  (ok (sha512 (unwrap-panic (to-consensus-buff? str))))
)

(define-read-only (sha512-256-uint (value uint))
  (ok (sha512/256 value))
)

(define-read-only (hash-list (items (list 10 uint)))
  (ok (keccak256 (unwrap-panic (to-consensus-buff? items))))
)

(define-read-only (create-commitment (secret uint))
  ;; Create commitment hash for commit-reveal schemes
  (ok (keccak256 (concat
    (unwrap-panic (to-consensus-buff? secret))
    (unwrap-panic (to-consensus-buff? stacks-block-time))
  )))
)

(define-read-only (verify-commitment (commitment (buff 32)) (secret uint) (timestamp uint))
  (is-eq
    commitment
    (keccak256 (concat
      (unwrap-panic (to-consensus-buff? secret))
      (unwrap-panic (to-consensus-buff? timestamp))
    ))
  )
)

(define-read-only (hash-password (password (string-ascii 100)) (salt (buff 16)))
  ;; Simple password hashing (production would use better KDF)
  (ok (sha512 (concat
    (unwrap-panic (to-consensus-buff? password))
    salt
  )))
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate address principals
(define-read-only (validate-addr (addr principal))
  (principal-destruct? addr)
)

;; 2. Clarity 4: Format hash buffer
(define-read-only (format-hash (h (buff 32)))
  (ok h)
)

;; 3. Clarity 4: string-to-uint? - Parse number from string
(define-read-only (parse-num (n-str (string-ascii 20)))
  (match (string-to-uint? n-str)
    n (ok n)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track encoding timestamps
(define-read-only (get-enc-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
