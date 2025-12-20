;; title: collateral-manager
;; version: 1.0.0
;; summary: Multi-asset collateral management
;; description: Track and manage collateral types - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5500))
(define-constant ERR-INVALID-COLLATERAL (err u5501))

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map collateral-types principal {
  name: (string-ascii 20),
  ltv-ratio: uint,
  liquidation-threshold: uint,
  is-enabled: bool,
  added-at: uint  ;; Clarity 4: Unix timestamp
})

(define-map user-collateral {user: principal, asset: principal} {
  amount: uint,
  locked-at: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (add-collateral-type (asset principal) (name (string-ascii 20)) (ltv uint) (threshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set collateral-types asset {
      name: name,
      ltv-ratio: ltv,
      liquidation-threshold: threshold,
      is-enabled: true,
      added-at: stacks-block-time
    })

    (ok true)
  )
)

(define-public (deposit-collateral (asset principal) (amount uint))
  (let (
    (collateral-type (unwrap! (map-get? collateral-types asset) ERR-INVALID-COLLATERAL))
  )
    (asserts! (get is-enabled collateral-type) ERR-INVALID-COLLATERAL)

    (map-set user-collateral {user: tx-sender, asset: asset} {
      amount: amount,
      locked-at: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-collateral-type (asset principal))
  (map-get? collateral-types asset)
)

(define-read-only (get-user-collateral (user principal) (asset principal))
  (map-get? user-collateral {user: user, asset: asset})
)
