;; title: signature-verifier
;; version: 1.0.0
;; summary: Signature verification utilities
;; description: Verify cryptographic signatures - Clarity 4

;; Constants
(define-constant ERR-INVALID-SIGNATURE (err u7200))
(define-constant ERR-SIGNATURE-EXPIRED (err u7201))
(define-constant ERR-INVALID-SIGNER (err u7202))

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map signature-nonces principal uint)

(define-map verified-signatures (buff 65) {
  signer: principal,
  verified-at: uint,  ;; Clarity 4: Unix timestamp
  is-valid: bool
})

;; Public Functions

(define-public (verify-secp256k1-signature
  (message (buff 32))
  (signature (buff 65))
  (public-key (buff 33)))
  (let (
    (recovered-key (secp256k1-recover? message signature))
  )
    (match recovered-key
      success-key (begin
        (map-set verified-signatures signature {
          signer: tx-sender,
          verified-at: stacks-block-time,
          is-valid: true
        })
        (ok true)
      )
      error-val (err ERR-INVALID-SIGNATURE)
    )
  )
)

(define-public (increment-nonce)
  (let (
    (current-nonce (default-to u0 (map-get? signature-nonces tx-sender)))
  )
    (map-set signature-nonces tx-sender (+ current-nonce u1))
    (ok (+ current-nonce u1))
  )
)

;; Read-Only Functions

(define-read-only (get-nonce (user principal))
  (default-to u0 (map-get? signature-nonces user))
)

(define-read-only (is-signature-verified (signature (buff 65)))
  (match (map-get? verified-signatures signature)
    sig-data (get is-valid sig-data)
    false
  )
)

(define-read-only (verify-message-hash
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

(define-read-only (create-permit-message
  (spender principal)
  (value uint)
  (nonce uint)
  (deadline uint))
  (if (<= stacks-block-time deadline)
    (ok (keccak256 (unwrap-panic (to-consensus-buff? {
      spender: spender,
      value: value,
      nonce: nonce,
      deadline: deadline
    }))))
    (err ERR-SIGNATURE-EXPIRED)
  )
)

(define-read-only (verify-permit-deadline (deadline uint))
  (<= stacks-block-time deadline)
)

(define-read-only (hash-typed-data
  (domain-separator (buff 32))
  (struct-hash (buff 32)))
  (ok (keccak256 (concat
    (unwrap-panic (to-consensus-buff? 0x1901))
    (concat domain-separator struct-hash)
  )))
)

(define-read-only (create-domain-separator
  (name (string-ascii 50))
  (version (string-ascii 10))
  (network-id uint)
  (verifying-contract principal))
  (ok (keccak256 (unwrap-panic (to-consensus-buff? {
    name: name,
    version: version,
    network-id: network-id,
    verifying-contract: verifying-contract
  }))))
)

(define-read-only (verify-signed-amount
  (amount uint)
  (min-amount uint)
  (max-amount uint))
  (and
    (>= amount min-amount)
    (<= amount max-amount)
  )
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate signer principals
(define-read-only (validate-signer-sv (s principal))
  (principal-destruct? s)
)

;; 2. Clarity 4: int-to-ascii - Format nonce value
(define-read-only (format-nonce (n uint))
  (ok (int-to-ascii n))
)

;; 3. Clarity 4: string-to-uint? - Parse deadline from string
(define-read-only (parse-deadline (d-str (string-ascii 20)))
  (match (string-to-uint? d-str)
    d (ok d)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track signature timestamps
(define-read-only (get-sv-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
