;; title: metrics-aggregator
;; version: 1.0.0
;; summary: Protocol metrics aggregation
;; description: Aggregate metrics across protocol - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5600))

;; Data Variables
(define-data-var protocol-tvl uint u0)
(define-data-var total-users uint u0)
(define-data-var total-transactions uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map protocol-metrics uint {
  total-tvl: uint,
  active-vaults: uint,
  active-users: uint,
  total-volume: uint,
  avg-apy: uint,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

(define-map vault-aggregates principal {
  tvl: uint,
  user-count: uint,
  transaction-count: uint,
  total-fees: uint,
  last-updated: uint  ;; Clarity 4: Unix timestamp
})

(define-map time-series-metrics { period: uint, metric-type: uint } {
  value: uint,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (update-protocol-metrics
  (snapshot-id uint)
  (total-tvl uint)
  (active-vaults uint)
  (active-users uint)
  (total-volume uint)
  (avg-apy uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set protocol-metrics snapshot-id {
      total-tvl: total-tvl,
      active-vaults: active-vaults,
      active-users: active-users,
      total-volume: total-volume,
      avg-apy: avg-apy,
      timestamp: stacks-block-time
    })

    (var-set protocol-tvl total-tvl)
    (var-set total-users active-users)

    (print {
      event: "metrics-updated",
      tvl: total-tvl,
      users: active-users,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (update-vault-aggregates
  (vault principal)
  (tvl uint)
  (user-count uint)
  (transaction-count uint)
  (total-fees uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set vault-aggregates vault {
      tvl: tvl,
      user-count: user-count,
      transaction-count: transaction-count,
      total-fees: total-fees,
      last-updated: stacks-block-time
    })

    (ok true)
  )
)

(define-public (record-time-series
  (period uint)
  (metric-type uint)
  (value uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set time-series-metrics { period: period, metric-type: metric-type } {
      value: value,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-protocol-metrics (snapshot-id uint))
  (map-get? protocol-metrics snapshot-id)
)

(define-read-only (get-vault-aggregates (vault principal))
  (map-get? vault-aggregates vault)
)

(define-read-only (get-time-series (period uint) (metric-type uint))
  (map-get? time-series-metrics { period: period, metric-type: metric-type })
)

(define-read-only (get-current-tvl)
  (var-get protocol-tvl)
)

(define-read-only (get-total-users)
  (var-get total-users)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: int-to-ascii - Format metrics for display
(define-read-only (format-total-users)
  (ok (int-to-ascii (var-get total-users)))
)

(define-read-only (format-total-transactions)
  (ok (int-to-ascii (var-get total-transactions)))
)

;; 2. Clarity 4: string-to-uint? - Parse metric values
(define-read-only (parse-metric-value (value-str (string-ascii 30)))
  (match (string-to-uint? value-str)
    value (ok value)
    (err u998)
  )
)

;; 3. Clarity 4: buff-to-uint-le - Decode metrics from buffers
(define-read-only (decode-metric-buffer (metric-buff (buff 16)))
  (ok (buff-to-uint-le metric-buff))
)

;; 4. Clarity 4: burn-block-height - Track metrics aggregation
(define-read-only (get-metrics-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
