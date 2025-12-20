;; title: vault-factory
;; version: 1.0.0
;; summary: Vault Factory for deploying multiple vault instances
;; description: Factory contract to create and manage multiple vault instances - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-VAULT-EXISTS (err u101))
(define-constant ERR-VAULT-NOT-FOUND (err u102))
(define-constant ERR-INVALID-FEE (err u103))

;; Data Variables
(define-data-var next-vault-id uint u1)
(define-data-var deployment-fee uint u1000000) ;; 1 STX deployment fee
(define-data-var factory-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map vaults uint {
  owner: principal,
  vault-contract: principal,
  vault-type: (string-ascii 20),
  created-at: uint,  ;; Clarity 4: Unix timestamp
  is-active: bool,
  total-deposits: uint
})

(define-map user-vaults principal (list 100 uint))

(define-map vault-templates (string-ascii 20) {
  template-name: (string-ascii 50),
  description: (string-ascii 200),
  is-enabled: bool,
  deployment-count: uint
})

;; Initialize vault templates
(map-set vault-templates "standard" {
  template-name: "Standard Vault",
  description: "Basic STX vault with deposit/withdraw functionality",
  is-enabled: true,
  deployment-count: u0
})

(map-set vault-templates "yield" {
  template-name: "Yield Vault",
  description: "Auto-compounding yield optimization vault",
  is-enabled: true,
  deployment-count: u0
})

(map-set vault-templates "insurance" {
  template-name: "Insurance Vault",
  description: "Protected vault with insurance coverage",
  is-enabled: true,
  deployment-count: u0
})

;; Public Functions

;; Create new vault instance
(define-public (create-vault (vault-type (string-ascii 20)))
  (let (
    (vault-id (var-get next-vault-id))
    (template (unwrap! (map-get? vault-templates vault-type) ERR-VAULT-NOT-FOUND))
    (deployer tx-sender)
  )
    (asserts! (not (var-get factory-paused)) ERR-UNAUTHORIZED)
    (asserts! (get is-enabled template) ERR-UNAUTHORIZED)

    ;; Charge deployment fee
    (try! (stx-transfer? (var-get deployment-fee) tx-sender CONTRACT-OWNER))

    ;; Register vault
    (map-set vaults vault-id {
      owner: deployer,
      vault-contract: deployer, ;; In production, this would be the deployed contract principal
      vault-type: vault-type,
      created-at: stacks-block-time,  ;; Clarity 4: Unix timestamp
      is-active: true,
      total-deposits: u0
    })

    ;; Add to user's vault list
    (match (map-get? user-vaults deployer)
      user-vault-list (map-set user-vaults deployer (unwrap-panic (as-max-len? (append user-vault-list vault-id) u100)))
      (map-set user-vaults deployer (list vault-id))
    )

    ;; Update template deployment count
    (map-set vault-templates vault-type
      (merge template { deployment-count: (+ (get deployment-count template) u1) }))

    ;; Increment vault ID
    (var-set next-vault-id (+ vault-id u1))

    ;; Emit event with native print (Clarity 4)
    (print {
      event: "vault-created",
      vault-id: vault-id,
      owner: deployer,
      vault-type: vault-type,
      timestamp: stacks-block-time
    })

    (ok vault-id)
  )
)

;; Deactivate vault
(define-public (deactivate-vault (vault-id uint))
  (let (
    (vault (unwrap! (map-get? vaults vault-id) ERR-VAULT-NOT-FOUND))
  )
    (asserts! (is-eq (get owner vault) tx-sender) ERR-UNAUTHORIZED)
    (asserts! (get is-active vault) ERR-VAULT-NOT-FOUND)

    (map-set vaults vault-id
      (merge vault { is-active: false }))

    (print {
      event: "vault-deactivated",
      vault-id: vault-id,
      owner: tx-sender,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Update vault deposits (called by vault contracts)
(define-public (update-vault-deposits (vault-id uint) (new-total uint))
  (let (
    (vault (unwrap! (map-get? vaults vault-id) ERR-VAULT-NOT-FOUND))
  )
    ;; In production, verify caller is the vault contract
    (map-set vaults vault-id
      (merge vault { total-deposits: new-total }))
    (ok true)
  )
)

;; Admin Functions

(define-public (set-deployment-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (> new-fee u0) ERR-INVALID-FEE)
    (var-set deployment-fee new-fee)
    (ok true)
  )
)

(define-public (pause-factory)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set factory-paused true)
    (ok true)
  )
)

(define-public (resume-factory)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set factory-paused false)
    (ok true)
  )
)

(define-public (add-vault-template
  (template-id (string-ascii 20))
  (name (string-ascii 50))
  (description (string-ascii 200)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set vault-templates template-id {
      template-name: name,
      description: description,
      is-enabled: true,
      deployment-count: u0
    })
    (ok true)
  )
)

(define-public (toggle-template (template-id (string-ascii 20)) (enabled bool))
  (let (
    (template (unwrap! (map-get? vault-templates template-id) ERR-VAULT-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set vault-templates template-id
      (merge template { is-enabled: enabled }))
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-vault (vault-id uint))
  (map-get? vaults vault-id)
)

(define-read-only (get-user-vaults (user principal))
  (default-to (list) (map-get? user-vaults user))
)

(define-read-only (get-vault-template (template-id (string-ascii 20)))
  (map-get? vault-templates template-id)
)

(define-read-only (get-deployment-fee)
  (var-get deployment-fee)
)

(define-read-only (get-next-vault-id)
  (var-get next-vault-id)
)

(define-read-only (is-factory-paused)
  (var-get factory-paused)
)

(define-read-only (get-total-vaults)
  (- (var-get next-vault-id) u1)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate and decompose principal addresses
(define-read-only (validate-vault-owner (owner principal))
  (principal-destruct? owner)
)

;; 2. Clarity 4: int-to-ascii - Format vault ID and fees for display
(define-read-only (format-vault-id (vault-id uint))
  (ok (int-to-ascii vault-id))
)

(define-read-only (format-deployment-fee)
  (ok (int-to-ascii (var-get deployment-fee)))
)

;; 3. Clarity 4: string-to-uint? - Parse string input to vault ID
(define-read-only (parse-vault-id (id-str (string-ascii 20)))
  (match (string-to-uint? id-str)
    parsed-id (ok parsed-id)
    (err u998)
  )
)

;; 4. Clarity 4: buff-to-int-le - Convert buffer to vault identifier
(define-read-only (buffer-to-vault-id (vault-buff (buff 16)))
  (ok (buff-to-uint-le vault-buff))
)

;; Clarity 4: Combine features - Get vault owner info
(define-read-only (get-vault-owner-info (vault-id uint))
  (match (map-get? vaults vault-id)
    vault-data (ok {
      vault-id-str: (int-to-ascii vault-id),
      owner: (get owner vault-data),
      created-timestamp: (get created-at vault-data)
    })
    (err ERR-VAULT-NOT-FOUND)
  )
)
