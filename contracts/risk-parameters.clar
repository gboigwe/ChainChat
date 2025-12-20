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
