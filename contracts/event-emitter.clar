;; title: event-emitter
;; version: 1.0.0
;; summary: Centralized event emitter
;; description: Emit and log protocol events - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u5500))

;; Event categories
(define-constant CATEGORY-VAULT u1)
(define-constant CATEGORY-GOVERNANCE u2)
(define-constant CATEGORY-SECURITY u3)
(define-constant CATEGORY-ORACLE u4)
(define-constant CATEGORY-DEFI u5)

;; Data Variables
(define-data-var total-events-emitted uint u0)
(define-data-var next-event-log-id uint u1)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map event-logs uint {
  category: uint,
  event-name: (string-ascii 50),
  emitter: principal,
  data: (string-ascii 500),
  timestamp: uint,  ;; Clarity 4: Unix timestamp
  severity: uint  ;; 1=Info, 2=Warning, 3=Error, 4=Critical
})

(define-map category-stats uint {
  total-events: uint,
  last-event: uint  ;; Clarity 4: Unix timestamp
})

;; Public Functions

(define-public (emit-event
  (category uint)
  (event-name (string-ascii 50))
  (data (string-ascii 500))
  (severity uint))
  (let (
    (event-id (var-get next-event-log-id))
    (stats (default-to
      { total-events: u0, last-event: u0 }
      (map-get? category-stats category)))
  )
    (map-set event-logs event-id {
      category: category,
      event-name: event-name,
      emitter: tx-sender,
      data: data,
      timestamp: stacks-block-time,
      severity: severity
    })

    (map-set category-stats category {
      total-events: (+ (get total-events stats) u1),
      last-event: stacks-block-time
    })

    (var-set next-event-log-id (+ event-id u1))
    (var-set total-events-emitted (+ (var-get total-events-emitted) u1))

    (print {
      event: "event-emitted",
      event-id: event-id,
      category: category,
      name: event-name,
      severity: severity,
      timestamp: stacks-block-time
    })

    (ok event-id)
  )
)

(define-public (emit-vault-event
  (event-name (string-ascii 50))
  (data (string-ascii 500)))
  (emit-event CATEGORY-VAULT event-name data u1)
)

(define-public (emit-security-alert
  (event-name (string-ascii 50))
  (data (string-ascii 500)))
  (emit-event CATEGORY-SECURITY event-name data u4)
)

;; Read-Only Functions

(define-read-only (get-event-log (event-id uint))
  (map-get? event-logs event-id)
)

(define-read-only (get-category-stats (category uint))
  (map-get? category-stats category)
)

(define-read-only (get-total-events)
  (var-get total-events-emitted)
)
;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate emitter principals
(define-read-only (validate-emitter (em principal))
  (principal-destruct? em)
)

;; 2. Clarity 4: int-to-ascii - Format event count
(define-read-only (format-event-count)
  (ok (int-to-ascii (var-get total-events-emitted)))
)

;; 3. Clarity 4: string-to-uint? - Parse event ID from string
(define-read-only (parse-event-id (e-str (string-ascii 20)))
  (match (string-to-uint? e-str)
    e (ok e)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track event timestamps
(define-read-only (get-ee-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
