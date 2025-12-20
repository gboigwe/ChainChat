;; title: wrapped-token-manager
;; version: 1.0.0
;; summary: Wrapped token management
;; description: Manage wrapped assets (wBTC, wETH, etc) - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6400))
(define-constant ERR-INSUFFICIENT-BALANCE (err u6401))

;; Data Variables
(define-data-var total-wrapped uint u0)
(define-data-var total-unwrapped uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map wrapped-balances { user: principal, token: principal } {
  balance: uint,
  last-updated: uint  ;; Clarity 4: Unix timestamp
})

(define-map wrap-history uint {
  user: principal,
  token: principal,
  amount: uint,
  action: (string-ascii 10),  ;; "wrap" or "unwrap"
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

(define-map supported-tokens principal {
  is-supported: bool,
  wrap-fee: uint,  ;; Basis points
  unwrap-fee: uint,
  total-wrapped: uint
})

(define-data-var next-wrap-id uint u1)

;; Public Functions

(define-public (wrap-token (token principal) (amount uint))
  (let (
    (wrap-id (var-get next-wrap-id))
    (token-data (unwrap! (map-get? supported-tokens token) (err u404)))
    (current-balance (default-to
      { balance: u0, last-updated: u0 }
      (map-get? wrapped-balances { user: tx-sender, token: token })))
  )
    (asserts! (get is-supported token-data) (err u400))

    (map-set wrapped-balances { user: tx-sender, token: token } {
      balance: (+ (get balance current-balance) amount),
      last-updated: stacks-block-time
    })

    (map-set wrap-history wrap-id {
      user: tx-sender,
      token: token,
      amount: amount,
      action: "wrap",
      timestamp: stacks-block-time
    })

    (var-set next-wrap-id (+ wrap-id u1))
    (var-set total-wrapped (+ (var-get total-wrapped) amount))

    (print {
      event: "token-wrapped",
      wrap-id: wrap-id,
      token: token,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok wrap-id)
  )
)

(define-public (unwrap-token (token principal) (amount uint))
  (let (
    (wrap-id (var-get next-wrap-id))
    (current-balance (unwrap! (map-get? wrapped-balances { user: tx-sender, token: token }) ERR-INSUFFICIENT-BALANCE))
  )
    (asserts! (>= (get balance current-balance) amount) ERR-INSUFFICIENT-BALANCE)

    (map-set wrapped-balances { user: tx-sender, token: token } {
      balance: (- (get balance current-balance) amount),
      last-updated: stacks-block-time
    })

    (map-set wrap-history wrap-id {
      user: tx-sender,
      token: token,
      amount: amount,
      action: "unwrap",
      timestamp: stacks-block-time
    })

    (var-set next-wrap-id (+ wrap-id u1))
    (var-set total-unwrapped (+ (var-get total-unwrapped) amount))

    (ok wrap-id)
  )
)

(define-public (add-supported-token
  (token principal)
  (wrap-fee uint)
  (unwrap-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set supported-tokens token {
      is-supported: true,
      wrap-fee: wrap-fee,
      unwrap-fee: unwrap-fee,
      total-wrapped: u0
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-wrapped-balance (user principal) (token principal))
  (map-get? wrapped-balances { user: user, token: token })
)

(define-read-only (get-wrap-history (wrap-id uint))
  (map-get? wrap-history wrap-id)
)

(define-read-only (is-token-supported (token principal))
  (match (map-get? supported-tokens token)
    data (get is-supported data)
    false
  )
)
