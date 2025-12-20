;; title: vault-emergency
;; version: 1.0.0
;; summary: Emergency pause mechanism for vaults
;; description: Circuit breaker and emergency controls - Clarity 4

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u500))
(define-constant ERR-ALREADY-PAUSED (err u501))
(define-constant ERR-NOT-PAUSED (err u502))
(define-constant ERR-COOLDOWN-ACTIVE (err u503))

;; Cooldown period (prevent rapid pause/unpause)
(define-constant PAUSE-COOLDOWN u3600) ;; 1 hour

;; Data Variables
(define-data-var emergency-active bool false)
(define-data-var last-pause-time uint u0)
(define-data-var pause-count uint u0)
(define-data-var emergency-admin (optional principal) none)

;; Data Maps - Using stacks-block-time for Clarity 4
(define-map paused-vaults principal {
  paused-at: uint,  ;; Clarity 4: Unix timestamp
  paused-by: principal,
  reason: (string-ascii 200),
  is-paused: bool
})

(define-map emergency-guardians principal bool)

;; Initialize emergency guardians
(map-set emergency-guardians CONTRACT-OWNER true)

;; Public Functions

;; Pause specific vault
(define-public (pause-vault (vault principal) (reason (string-ascii 200)))
  (begin
    (asserts! (is-guardian tx-sender) ERR-UNAUTHORIZED)
    (asserts! (is-none (map-get? paused-vaults vault)) ERR-ALREADY-PAUSED)

    (map-set paused-vaults vault {
      paused-at: stacks-block-time,
      paused-by: tx-sender,
      reason: reason,
      is-paused: true
    })

    (print {
      event: "vault-paused",
      vault: vault,
      paused-by: tx-sender,
      reason: reason,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Resume specific vault
(define-public (resume-vault (vault principal))
  (let (
    (vault-status (unwrap! (map-get? paused-vaults vault) ERR-NOT-PAUSED))
  )
    (asserts! (is-guardian tx-sender) ERR-UNAUTHORIZED)
    (asserts! (get is-paused vault-status) ERR-NOT-PAUSED)

    (map-set paused-vaults vault
      (merge vault-status { is-paused: false }))

    (print {
      event: "vault-resumed",
      vault: vault,
      resumed-by: tx-sender,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Global emergency pause
(define-public (activate-emergency (reason (string-ascii 200)))
  (begin
    (asserts! (is-guardian tx-sender) ERR-UNAUTHORIZED)
    (asserts! (not (var-get emergency-active)) ERR-ALREADY-PAUSED)
    (asserts! (> (- stacks-block-time (var-get last-pause-time)) PAUSE-COOLDOWN) ERR-COOLDOWN-ACTIVE)

    (var-set emergency-active true)
    (var-set last-pause-time stacks-block-time)
    (var-set pause-count (+ (var-get pause-count) u1))

    (print {
      event: "emergency-activated",
      activated-by: tx-sender,
      reason: reason,
      pause-count: (var-get pause-count),
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Deactivate emergency
(define-public (deactivate-emergency)
  (begin
    (asserts! (is-guardian tx-sender) ERR-UNAUTHORIZED)
    (asserts! (var-get emergency-active) ERR-NOT-PAUSED)

    (var-set emergency-active false)

    (print {
      event: "emergency-deactivated",
      deactivated-by: tx-sender,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Add emergency guardian
(define-public (add-guardian (guardian principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-set emergency-guardians guardian true)
    (print {
      event: "guardian-added",
      guardian: guardian,
      timestamp: stacks-block-time
    })
    (ok true)
  )
)

;; Remove emergency guardian
(define-public (remove-guardian (guardian principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (map-delete emergency-guardians guardian)
    (print {
      event: "guardian-removed",
      guardian: guardian,
      timestamp: stacks-block-time
    })
    (ok true)
  )
)

;; Read-Only Functions

(define-read-only (is-vault-paused (vault principal))
  (match (map-get? paused-vaults vault)
    status (get is-paused status)
    false
  )
)

(define-read-only (is-emergency-active)
  (var-get emergency-active)
)

(define-read-only (is-guardian (user principal))
  (default-to false (map-get? emergency-guardians user))
)

(define-read-only (get-pause-info (vault principal))
  (map-get? paused-vaults vault)
)

(define-read-only (get-pause-count)
  (var-get pause-count)
)

(define-read-only (get-last-pause-time)
  (var-get last-pause-time)
)

(define-read-only (can-pause)
  (> (- stacks-block-time (var-get last-pause-time)) PAUSE-COOLDOWN)
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate guardian addresses
(define-read-only (validate-guardian (guardian principal))
  (principal-destruct? guardian)
)

;; 2. Clarity 4: int-to-ascii - Format pause times
(define-read-only (format-last-pause-time)
  (ok (int-to-ascii (var-get last-pause-time)))
)

;; 3. Clarity 4: string-to-uint? - Parse cooldown periods
(define-read-only (parse-cooldown (cooldown-str (string-ascii 20)))
  (match (string-to-uint? cooldown-str)
    cooldown (ok cooldown)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track emergency actions
(define-read-only (get-emergency-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height,
    last-pause: (var-get last-pause-time),
    can-pause-now: (can-pause)
  })
)
