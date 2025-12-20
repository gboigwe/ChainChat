;; title: health-factor-monitor
;; version: 1.0.0
;; summary: Monitor position health factors
;; description: Track and alert on position health - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5900))

;; Health factor thresholds
(define-constant HEALTHY-THRESHOLD u12000)  ;; 1.2
(define-constant WARNING-THRESHOLD u11000)  ;; 1.1
(define-constant CRITICAL-THRESHOLD u10500) ;; 1.05

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map position-health principal {
  health-factor: uint,
  status: uint,
  last-check: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (update-health-factor (position principal) (collateral uint) (debt uint))
  (let (
    (health-factor (/ (* collateral u10000) debt))
    (status (determine-health-status health-factor))
  )
    (map-set position-health position {
      health-factor: health-factor,
      status: status,
      last-check: stacks-block-time
    })

    (print {
      event: "health-factor-updated",
      position: position,
      health-factor: health-factor,
      status: status,
      timestamp: stacks-block-time
    })

    (ok health-factor)
  )
)

;; Private Functions

(define-private (determine-health-status (health-factor uint))
  (if (>= health-factor HEALTHY-THRESHOLD)
    u1  ;; Healthy
    (if (>= health-factor WARNING-THRESHOLD)
      u2  ;; Warning
      (if (>= health-factor CRITICAL-THRESHOLD)
        u3  ;; Critical
        u4  ;; Liquidatable
      )
    )
  )
)

;; Read-Only Functions

(define-read-only (get-health-factor (position principal))
  (map-get? position-health position)
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate position principals
(define-read-only (validate-pos (p principal))
  (principal-destruct? p)
)

;; 2. Clarity 4: int-to-ascii - Format health factor
(define-read-only (format-health (h uint))
  (ok (int-to-ascii h))
)

;; 3. Clarity 4: string-to-uint? - Parse health from string
(define-read-only (parse-health-str (h-str (string-ascii 10)))
  (match (string-to-uint? h-str)
    h (ok h)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track health timestamps
(define-read-only (get-hfm-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
