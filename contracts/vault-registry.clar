;; title: vault-registry
;; version: 1.0.0
;; summary: Central registry for all vault contracts
;; description: Tracks and validates all deployed vault contracts - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u200))
(define-constant ERR-VAULT-NOT-REGISTERED (err u201))
(define-constant ERR-VAULT-ALREADY-REGISTERED (err u202))
(define-constant ERR-INVALID-STATUS (err u203))

;; Vault Status Constants
(define-constant STATUS-ACTIVE u1)
(define-constant STATUS-PAUSED u2)
(define-constant STATUS-DEPRECATED u3)
(define-constant STATUS-MIGRATED u4)

;; Data Variables
(define-data-var total-vaults-registered uint u0)
(define-data-var registry-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map vault-registry principal {
  vault-name: (string-ascii 50),
  vault-owner: principal,
  vault-type: (string-ascii 20),
  status: uint,
  registered-at: uint,  ;; Clarity 4: Unix timestamp
  last-updated: uint,   ;; Clarity 4: Unix timestamp
  total-value-locked: uint,
  total-users: uint,
  version: (string-ascii 10)
})

(define-map vault-metadata principal {
  description: (string-ascii 256),
  website-url: (string-ascii 100),
  audit-report-hash: (optional (buff 32)),
  risk-score: uint,  ;; 0-100 scale
  is-verified: bool
})

(define-map vault-stats principal {
  deposits-count: uint,
  withdrawals-count: uint,
  total-fees-collected: uint,
  last-activity: uint  ;; Clarity 4: Unix timestamp
})

;; List tracking
(define-map vault-list-by-type (string-ascii 20) (list 200 principal))
(define-map vault-list-by-owner principal (list 50 principal))

;; Public Functions

;; Register new vault
(define-public (register-vault
  (vault-contract principal)
  (vault-name (string-ascii 50))
  (vault-type (string-ascii 20))
  (version (string-ascii 10)))
  (begin
    (asserts! (not (var-get registry-paused)) ERR-UNAUTHORIZED)
    (asserts! (is-none (map-get? vault-registry vault-contract)) ERR-VAULT-ALREADY-REGISTERED)

    ;; Register vault
    (map-set vault-registry vault-contract {
      vault-name: vault-name,
      vault-owner: tx-sender,
      vault-type: vault-type,
      status: STATUS-ACTIVE,
      registered-at: stacks-block-time,
      last-updated: stacks-block-time,
      total-value-locked: u0,
      total-users: u0,
      version: version
    })

    ;; Initialize metadata
    (map-set vault-metadata vault-contract {
      description: "",
      website-url: "",
      audit-report-hash: none,
      risk-score: u50,  ;; Default medium risk
      is-verified: false
    })

    ;; Initialize stats
    (map-set vault-stats vault-contract {
      deposits-count: u0,
      withdrawals-count: u0,
      total-fees-collected: u0,
      last-activity: stacks-block-time
    })

    ;; Add to lists
    (add-to-type-list vault-type vault-contract)
    (add-to-owner-list tx-sender vault-contract)

    ;; Increment total
    (var-set total-vaults-registered (+ (var-get total-vaults-registered) u1))

    ;; Emit event
    (print {
      event: "vault-registered",
      vault: vault-contract,
      name: vault-name,
      owner: tx-sender,
      type: vault-type,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Update vault status
(define-public (update-vault-status (vault-contract principal) (new-status uint))
  (let (
    (vault (unwrap! (map-get? vault-registry vault-contract) ERR-VAULT-NOT-REGISTERED))
  )
    (asserts! (is-eq (get vault-owner vault) tx-sender) ERR-UNAUTHORIZED)
    (asserts! (<= new-status STATUS-MIGRATED) ERR-INVALID-STATUS)

    (map-set vault-registry vault-contract
      (merge vault {
        status: new-status,
        last-updated: stacks-block-time
      }))

    (print {
      event: "vault-status-updated",
      vault: vault-contract,
      new-status: new-status,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Update vault TVL
(define-public (update-tvl (vault-contract principal) (new-tvl uint))
  (let (
    (vault (unwrap! (map-get? vault-registry vault-contract) ERR-VAULT-NOT-REGISTERED))
  )
    ;; In production, verify caller is the vault contract
    (map-set vault-registry vault-contract
      (merge vault {
        total-value-locked: new-tvl,
        last-updated: stacks-block-time
      }))
    (ok true)
  )
)

;; Update vault metadata
(define-public (update-metadata
  (vault-contract principal)
  (description (string-ascii 256))
  (website (string-ascii 100)))
  (let (
    (vault (unwrap! (map-get? vault-registry vault-contract) ERR-VAULT-NOT-REGISTERED))
    (metadata (unwrap! (map-get? vault-metadata vault-contract) ERR-VAULT-NOT-REGISTERED))
  )
    (asserts! (is-eq (get vault-owner vault) tx-sender) ERR-UNAUTHORIZED)

    (map-set vault-metadata vault-contract
      (merge metadata {
        description: description,
        website-url: website
      }))

    (ok true)
  )
)

;; Record vault activity
(define-public (record-activity
  (vault-contract principal)
  (activity-type (string-ascii 20))
  (amount uint))
  (let (
    (stats (default-to
      { deposits-count: u0, withdrawals-count: u0, total-fees-collected: u0, last-activity: u0 }
      (map-get? vault-stats vault-contract)))
  )
    (map-set vault-stats vault-contract
      (if (is-eq activity-type "deposit")
        (merge stats {
          deposits-count: (+ (get deposits-count stats) u1),
          last-activity: stacks-block-time
        })
        (if (is-eq activity-type "withdraw")
          (merge stats {
            withdrawals-count: (+ (get withdrawals-count stats) u1),
            last-activity: stacks-block-time
          })
          (merge stats {
            total-fees-collected: (+ (get total-fees-collected stats) amount),
            last-activity: stacks-block-time
          })
        )
      ))
    (ok true)
  )
)

;; Admin Functions

(define-public (verify-vault (vault-contract principal) (verified bool))
  (let (
    (metadata (unwrap! (map-get? vault-metadata vault-contract) ERR-VAULT-NOT-REGISTERED))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set vault-metadata vault-contract
      (merge metadata { is-verified: verified }))
    (ok true)
  )
)

(define-public (pause-registry)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set registry-paused true)
    (ok true)
  )
)

(define-public (resume-registry)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set registry-paused false)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-vault-info (vault-contract principal))
  (map-get? vault-registry vault-contract)
)

(define-read-only (get-vault-metadata (vault-contract principal))
  (map-get? vault-metadata vault-contract)
)

(define-read-only (get-vault-stats (vault-contract principal))
  (map-get? vault-stats vault-contract)
)

(define-read-only (get-vaults-by-type (vault-type (string-ascii 20)))
  (default-to (list) (map-get? vault-list-by-type vault-type))
)

(define-read-only (get-vaults-by-owner (owner principal))
  (default-to (list) (map-get? vault-list-by-owner owner))
)

(define-read-only (get-total-vaults)
  (var-get total-vaults-registered)
)

(define-read-only (is-vault-registered (vault-contract principal))
  (is-some (map-get? vault-registry vault-contract))
)

(define-read-only (is-vault-active (vault-contract principal))
  (match (map-get? vault-registry vault-contract)
    vault (is-eq (get status vault) STATUS-ACTIVE)
    false
  )
)

;; Private Functions

(define-private (add-to-type-list (vault-type (string-ascii 20)) (vault principal))
  (match (map-get? vault-list-by-type vault-type)
    current-list (map-set vault-list-by-type vault-type
      (unwrap-panic (as-max-len? (append current-list vault) u200)))
    (map-set vault-list-by-type vault-type (list vault))
  )
)

(define-private (add-to-owner-list (owner principal) (vault principal))
  (match (map-get? vault-list-by-owner owner)
    current-list (map-set vault-list-by-owner owner
      (unwrap-panic (as-max-len? (append current-list vault) u50)))
    (map-set vault-list-by-owner owner (list vault))
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Decompose vault contract addresses
(define-read-only (get-vault-address-components (vault-contract principal))
  (principal-destruct? vault-contract)
)

;; 2. Clarity 4: int-to-utf8 - Format TVL and user counts for display
(define-read-only (format-vault-tvl (vault-contract principal))
  (match (map-get? vault-registry vault-contract)
    vault-info (ok (int-to-utf8 (get total-value-locked vault-info)))
    (err ERR-VAULT-NOT-REGISTERED)
  )
)

;; 3. Clarity 4: string-to-uint? - Parse risk score from string input
(define-read-only (parse-risk-score (score-str (string-ascii 10)))
  (match (string-to-uint? score-str)
    score (if (<= score u100)
            (ok score)
            (err u998))
    (err u997)
  )
)

;; 4. Clarity 4: burn-block-height - Get Bitcoin block time for vault registration
(define-read-only (get-vault-registration-burn-time)
  (ok burn-block-height)
)

;; Clarity 4: Combine features - Comprehensive vault analytics
(define-read-only (get-vault-analytics (vault-contract principal))
  (match (map-get? vault-registry vault-contract)
    vault-data (ok {
      tvl-formatted: (int-to-utf8 (get total-value-locked vault-data)),
      age-seconds: (- stacks-block-time (get registered-at vault-data)),
      burn-time: burn-block-height
    })
    (err ERR-VAULT-NOT-REGISTERED)
  )
)
