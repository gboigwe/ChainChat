;; title: vault-timelock
;; version: 1.0.0
;; summary: Security timelock for critical operations
;; description: 24-48 hour delays on sensitive vault operations - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u400))
(define-constant ERR-OPERATION-NOT-FOUND (err u401))
(define-constant ERR-TIMELOCK-NOT-EXPIRED (err u402))
(define-constant ERR-OPERATION-EXPIRED (err u403))
(define-constant ERR-OPERATION-EXECUTED (err u404))
(define-constant ERR-OPERATION-CANCELLED (err u405))

;; Timelock Delays (in seconds)
(define-constant DELAY-SHORT u86400)   ;; 24 hours
(define-constant DELAY-MEDIUM u172800) ;; 48 hours
(define-constant DELAY-LONG u259200)   ;; 72 hours

;; Grace Period
(define-constant GRACE-PERIOD u604800) ;; 7 days to execute after timelock

;; Operation Types
(define-constant OP-FEE-CHANGE u1)
(define-constant OP-ADMIN-CHANGE u2)
(define-constant OP-PARAMETER-CHANGE u3)
(define-constant OP-UPGRADE u4)

;; Data Variables
(define-data-var next-operation-id uint u1)
(define-data-var timelock-paused bool false)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map timelocked-operations uint {
  operation-type: uint,
  initiator: principal,
  target-contract: principal,
  operation-data: (buff 256),
  delay-required: uint,
  scheduled-at: uint,  ;; Clarity 4: Unix timestamp
  executable-at: uint, ;; Clarity 4: Unix timestamp
  expires-at: uint,    ;; Clarity 4: Unix timestamp
  executed: bool,
  cancelled: bool
})

(define-map operation-metadata uint {
  title: (string-ascii 100),
  description: (string-ascii 300),
  impact-level: uint  ;; 1=low, 2=medium, 3=high
})

;; Public Functions

;; Schedule operation with timelock
(define-public (schedule-operation
  (operation-type uint)
  (target-contract principal)
  (operation-data (buff 256))
  (title (string-ascii 100))
  (description (string-ascii 300)))
  (let (
    (operation-id (var-get next-operation-id))
    (delay (get-required-delay operation-type))
    (impact (get-impact-level operation-type))
  )
    (asserts! (not (var-get timelock-paused)) ERR-UNAUTHORIZED)

    ;; Schedule operation
    (map-set timelocked-operations operation-id {
      operation-type: operation-type,
      initiator: tx-sender,
      target-contract: target-contract,
      operation-data: operation-data,
      delay-required: delay,
      scheduled-at: stacks-block-time,
      executable-at: (+ stacks-block-time delay),
      expires-at: (+ stacks-block-time (+ delay GRACE-PERIOD)),
      executed: false,
      cancelled: false
    })

    ;; Store metadata
    (map-set operation-metadata operation-id {
      title: title,
      description: description,
      impact-level: impact
    })

    ;; Increment ID
    (var-set next-operation-id (+ operation-id u1))

    ;; Emit event
    (print {
      event: "operation-scheduled",
      operation-id: operation-id,
      initiator: tx-sender,
      operation-type: operation-type,
      executable-at: (+ stacks-block-time delay),
      timestamp: stacks-block-time
    })

    (ok operation-id)
  )
)

;; Execute operation after timelock
(define-public (execute-operation (operation-id uint))
  (let (
    (operation (unwrap! (map-get? timelocked-operations operation-id) ERR-OPERATION-NOT-FOUND))
  )
    (asserts! (not (get cancelled operation)) ERR-OPERATION-CANCELLED)
    (asserts! (not (get executed operation)) ERR-OPERATION-EXECUTED)
    (asserts! (>= stacks-block-time (get executable-at operation)) ERR-TIMELOCK-NOT-EXPIRED)
    (asserts! (< stacks-block-time (get expires-at operation)) ERR-OPERATION-EXPIRED)

    ;; Mark as executed
    (map-set timelocked-operations operation-id
      (merge operation { executed: true }))

    ;; Emit event
    (print {
      event: "operation-executed",
      operation-id: operation-id,
      executor: tx-sender,
      operation-type: (get operation-type operation),
      timestamp: stacks-block-time
    })

    ;; In production, this would call the actual operation
    ;; For now, just return success
    (ok true)
  )
)

;; Cancel scheduled operation (only initiator or admin)
(define-public (cancel-operation (operation-id uint))
  (let (
    (operation (unwrap! (map-get? timelocked-operations operation-id) ERR-OPERATION-NOT-FOUND))
  )
    (asserts! (or
      (is-eq tx-sender (get initiator operation))
      (is-eq tx-sender CONTRACT-OWNER))
      ERR-UNAUTHORIZED)
    (asserts! (not (get executed operation)) ERR-OPERATION-EXECUTED)
    (asserts! (not (get cancelled operation)) ERR-OPERATION-CANCELLED)

    ;; Mark as cancelled
    (map-set timelocked-operations operation-id
      (merge operation { cancelled: true }))

    ;; Emit event
    (print {
      event: "operation-cancelled",
      operation-id: operation-id,
      cancelled-by: tx-sender,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Admin Functions

(define-public (pause-timelock)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set timelock-paused true)
    (print {
      event: "timelock-paused",
      timestamp: stacks-block-time
    })
    (ok true)
  )
)

(define-public (resume-timelock)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set timelock-paused false)
    (print {
      event: "timelock-resumed",
      timestamp: stacks-block-time
    })
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (get-operation (operation-id uint))
  (map-get? timelocked-operations operation-id)
)

(define-read-only (get-operation-metadata (operation-id uint))
  (map-get? operation-metadata operation-id)
)

(define-read-only (is-executable (operation-id uint))
  (match (map-get? timelocked-operations operation-id)
    operation (and
      (not (get executed operation))
      (not (get cancelled operation))
      (>= stacks-block-time (get executable-at operation))
      (< stacks-block-time (get expires-at operation)))
    false
  )
)

(define-read-only (is-expired (operation-id uint))
  (match (map-get? timelocked-operations operation-id)
    operation (and
      (not (get executed operation))
      (>= stacks-block-time (get expires-at operation)))
    false
  )
)

(define-read-only (get-time-remaining (operation-id uint))
  (match (map-get? timelocked-operations operation-id)
    operation (if (< stacks-block-time (get executable-at operation))
      (some (- (get executable-at operation) stacks-block-time))
      none)
    none
  )
)

(define-read-only (is-timelock-paused)
  (var-get timelock-paused)
)

;; Private Functions

(define-private (get-required-delay (operation-type uint))
  (if (is-eq operation-type OP-FEE-CHANGE)
    DELAY-SHORT
    (if (is-eq operation-type OP-PARAMETER-CHANGE)
      DELAY-MEDIUM
      (if (or (is-eq operation-type OP-ADMIN-CHANGE) (is-eq operation-type OP-UPGRADE))
        DELAY-LONG
        DELAY-MEDIUM)))
)

(define-private (get-impact-level (operation-type uint))
  (if (is-eq operation-type OP-FEE-CHANGE)
    u1  ;; Low impact
    (if (is-eq operation-type OP-PARAMETER-CHANGE)
      u2  ;; Medium impact
      u3  ;; High impact (admin change or upgrade)
    ))
)

;; Emergency override (use with extreme caution)
(define-public (emergency-execute (operation-id uint))
  (let (
    (operation (unwrap! (map-get? timelocked-operations operation-id) ERR-OPERATION-NOT-FOUND))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (asserts! (not (get executed operation)) ERR-OPERATION-EXECUTED)
    (asserts! (not (get cancelled operation)) ERR-OPERATION-CANCELLED)

    ;; Mark as executed (bypassing timelock)
    (map-set timelocked-operations operation-id
      (merge operation { executed: true }))

    ;; Emit warning event
    (print {
      event: "emergency-execution",
      operation-id: operation-id,
      executor: tx-sender,
      WARNING: "TIMELOCK BYPASSED",
      timestamp: stacks-block-time
    })

    (ok true)
  )
)
