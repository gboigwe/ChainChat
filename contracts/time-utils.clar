;; title: time-utils
;; version: 1.0.0
;; summary: Time and timestamp utilities
;; description: Time calculations and conversions - Clarity 4

;; Constants
(define-constant SECONDS-PER-MINUTE u60)
(define-constant SECONDS-PER-HOUR u3600)
(define-constant SECONDS-PER-DAY u86400)
(define-constant SECONDS-PER-WEEK u604800)
(define-constant SECONDS-PER-MONTH u2592000)  ;; 30 days
(define-constant SECONDS-PER-YEAR u31536000)  ;; 365 days

;; Read-Only Functions

(define-read-only (get-current-time)
  (ok stacks-block-time)
)

(define-read-only (add-seconds (timestamp uint) (seconds uint))
  (ok (+ timestamp seconds))
)

(define-read-only (add-minutes (timestamp uint) (minutes uint))
  (ok (+ timestamp (* minutes SECONDS-PER-MINUTE)))
)

(define-read-only (add-hours (timestamp uint) (hours uint))
  (ok (+ timestamp (* hours SECONDS-PER-HOUR)))
)

(define-read-only (add-days (timestamp uint) (days uint))
  (ok (+ timestamp (* days SECONDS-PER-DAY)))
)

(define-read-only (add-weeks (timestamp uint) (weeks uint))
  (ok (+ timestamp (* weeks SECONDS-PER-WEEK)))
)

(define-read-only (add-months (timestamp uint) (months uint))
  (ok (+ timestamp (* months SECONDS-PER-MONTH)))
)

(define-read-only (add-years (timestamp uint) (years uint))
  (ok (+ timestamp (* years SECONDS-PER-YEAR)))
)

(define-read-only (is-after (timestamp1 uint) (timestamp2 uint))
  (> timestamp1 timestamp2)
)

(define-read-only (is-before (timestamp1 uint) (timestamp2 uint))
  (< timestamp1 timestamp2)
)

(define-read-only (time-until (future-timestamp uint))
  (if (> future-timestamp stacks-block-time)
    (ok (- future-timestamp stacks-block-time))
    (ok u0)
  )
)

(define-read-only (time-since (past-timestamp uint))
  (if (< past-timestamp stacks-block-time)
    (ok (- stacks-block-time past-timestamp))
    (ok u0)
  )
)

(define-read-only (has-elapsed (timestamp uint) (duration uint))
  (>= stacks-block-time (+ timestamp duration))
)

(define-read-only (is-expired (expiry uint))
  (>= stacks-block-time expiry)
)

(define-read-only (is-valid (expiry uint))
  (< stacks-block-time expiry)
)

(define-read-only (days-between (timestamp1 uint) (timestamp2 uint))
  (let ((diff (if (> timestamp1 timestamp2)
                (- timestamp1 timestamp2)
                (- timestamp2 timestamp1))))
    (ok (/ diff SECONDS-PER-DAY))
  )
)

(define-read-only (weeks-between (timestamp1 uint) (timestamp2 uint))
  (let ((diff (if (> timestamp1 timestamp2)
                (- timestamp1 timestamp2)
                (- timestamp2 timestamp1))))
    (ok (/ diff SECONDS-PER-WEEK))
  )
)

(define-read-only (get-day-of-week (timestamp uint))
  ;; Simplified: returns 0-6 (Sunday=0)
  (ok (mod (/ timestamp SECONDS-PER-DAY) u7))
)

(define-read-only (is-same-day (timestamp1 uint) (timestamp2 uint))
  (is-eq
    (/ timestamp1 SECONDS-PER-DAY)
    (/ timestamp2 SECONDS-PER-DAY)
  )
)

(define-read-only (start-of-day (timestamp uint))
  (ok (* (/ timestamp SECONDS-PER-DAY) SECONDS-PER-DAY))
)

(define-read-only (end-of-day (timestamp uint))
  (ok (- (* (+ (/ timestamp SECONDS-PER-DAY) u1) SECONDS-PER-DAY) u1))
)
