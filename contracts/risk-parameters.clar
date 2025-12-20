;; title: risk-parameters
;; version: 1.0.0
;; summary: Global risk parameters
;; description: Manage protocol risk settings - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u6100))

;; Data Variables
(define-data-var max-ltv uint u7500)  ;; 75%
(define-data-var liquidation-threshold uint u8500)  ;; 85%
(define-data-var liquidation-penalty uint u1000)  ;; 10%
(define-data-var min-health-factor uint u11000)  ;; 1.1

;; Public Functions

(define-public (update-max-ltv (new-ltv uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set max-ltv new-ltv)
    (ok true)
  )
)

(define-public (update-liquidation-threshold (new-threshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set liquidation-threshold new-threshold)
    (ok true)
  )
)

(define-public (update-liquidation-penalty (new-penalty uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set liquidation-penalty new-penalty)
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-risk-parameters)
  {
    max-ltv: (var-get max-ltv),
    liquidation-threshold: (var-get liquidation-threshold),
    liquidation-penalty: (var-get liquidation-penalty),
    min-health-factor: (var-get min-health-factor)
  }
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate admin principals
(define-read-only (validate-admin-rp (a principal))
  (principal-destruct? a)
)

;; 2. Clarity 4: int-to-ascii - Format LTV ratio
(define-read-only (format-ltv (ltv uint))
  (ok (int-to-ascii ltv))
)

;; 3. Clarity 4: string-to-uint? - Parse parameter from string
(define-read-only (parse-param (p-str (string-ascii 10)))
  (match (string-to-uint? p-str)
    p (ok p)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track risk parameter timestamps
(define-read-only (get-rp-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
