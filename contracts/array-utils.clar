;; title: array-utils
;; version: 1.0.0
;; summary: Array/list utilities
;; description: Helper functions for lists - Clarity 4

;; Constants
(define-constant ERR-EMPTY-LIST (err u6800))

;; Read-Only Functions

(define-read-only (sum-list (numbers (list 100 uint)))
  (ok (fold + numbers u0))
)

(define-read-only (list-length (items (list 100 uint)))
  (len items)
)

(define-read-only (contains-uint (items (list 100 uint)) (value uint))
  (is-some (index-of items value))
)

(define-read-only (get-first (items (list 100 uint)))
  (if (> (len items) u0)
    (ok (unwrap-panic (element-at items u0)))
    ERR-EMPTY-LIST
  )
)

(define-read-only (get-last (items (list 100 uint)))
  (let ((length (len items)))
    (if (> length u0)
      (ok (unwrap-panic (element-at items (- length u1))))
      ERR-EMPTY-LIST
    )
  )
)

(define-read-only (max-in-list (numbers (list 100 uint)))
  (if (> (len numbers) u0)
    (ok (fold find-max numbers u0))
    ERR-EMPTY-LIST
  )
)

(define-read-only (min-in-list (numbers (list 100 uint)))
  (if (> (len numbers) u0)
    (ok (fold find-min numbers u340282366920938463463374607431768211455))  ;; Max uint
    ERR-EMPTY-LIST
  )
)

(define-read-only (average (numbers (list 100 uint)))
  (let (
    (total (fold + numbers u0))
    (count (len numbers))
  )
    (if (> count u0)
      (ok (/ total count))
      ERR-EMPTY-LIST
    )
  )
)

(define-read-only (median (numbers (list 100 uint)))
  ;; Simplified median (returns middle element)
  (let ((length (len numbers)))
    (if (> length u0)
      (ok (unwrap-panic (element-at numbers (/ length u2))))
      ERR-EMPTY-LIST
    )
  )
)

(define-read-only (count-greater-than (numbers (list 100 uint)) (threshold uint))
  (len (filter is-greater numbers))
)

;; Private Functions

(define-private (find-max (a uint) (b uint))
  (if (> a b) a b)
)

(define-private (find-min (a uint) (b uint))
  (if (< a b) a b)
)

(define-private (is-greater (n uint))
  (> n u0)
)
