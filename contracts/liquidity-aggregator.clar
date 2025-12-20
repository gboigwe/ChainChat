;; title: liquidity-aggregator
;; version: 1.0.0
;; summary: Liquidity aggregator
;; description: Aggregate liquidity across DEXes - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6300))

;; Data Variables
(define-data-var total-aggregated-volume uint u0)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map aggregated-liquidity (string-ascii 40) {
  alex-liquidity: uint,
  stackswap-liquidity: uint,
  velar-liquidity: uint,
  arkadiko-liquidity: uint,
  total-liquidity: uint,
  last-updated: uint  ;; Clarity 4: Unix timestamp
})

(define-map liquidity-snapshots uint {
  pair: (string-ascii 40),
  total-liquidity: uint,
  dex-count: uint,
  avg-depth: uint,
  timestamp: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (update-aggregated-liquidity
  (pair (string-ascii 40))
  (alex-liq uint)
  (stackswap-liq uint)
  (velar-liq uint)
  (arkadiko-liq uint))
  (let (
    (total (+ (+ alex-liq stackswap-liq) (+ velar-liq arkadiko-liq)))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set aggregated-liquidity pair {
      alex-liquidity: alex-liq,
      stackswap-liquidity: stackswap-liq,
      velar-liquidity: velar-liq,
      arkadiko-liquidity: arkadiko-liq,
      total-liquidity: total,
      last-updated: stacks-block-time
    })

    (print {
      event: "liquidity-updated",
      pair: pair,
      total: total,
      timestamp: stacks-block-time
    })

    (ok total)
  )
)

(define-public (take-snapshot
  (snapshot-id uint)
  (pair (string-ascii 40))
  (total-liquidity uint)
  (dex-count uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)

    (map-set liquidity-snapshots snapshot-id {
      pair: pair,
      total-liquidity: total-liquidity,
      dex-count: dex-count,
      avg-depth: (/ total-liquidity dex-count),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-aggregated-liquidity (pair (string-ascii 40)))
  (map-get? aggregated-liquidity pair)
)

(define-read-only (get-snapshot (snapshot-id uint))
  (map-get? liquidity-snapshots snapshot-id)
)

(define-read-only (get-total-liquidity (pair (string-ascii 40)))
  (match (map-get? aggregated-liquidity pair)
    data (some (get total-liquidity data))
    none
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate liquidity pool addresses
(define-read-only (validate-pool-principal (pool principal))
  (principal-destruct? pool)
)

;; 2. Clarity 4: int-to-utf8 - Format liquidity amounts
(define-read-only (format-liquidity-amount (amount uint))
  (ok (int-to-utf8 amount))
)

;; 3. Clarity 4: string-to-uint? - Parse pool IDs
(define-read-only (parse-pool-id (id-str (string-ascii 20)))
  (match (string-to-uint? id-str)
    pool-id (ok pool-id)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track liquidity aggregation
(define-read-only (get-liquidity-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
