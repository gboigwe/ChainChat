;; title: math-library
;; version: 1.0.0
;; summary: Mathematical operations library
;; description: Safe math functions and calculations - Clarity 4

;; Constants
(define-constant ERR-DIVISION-BY-ZERO (err u6600))
(define-constant ERR-OVERFLOW (err u6601))

;; Precision multiplier (6 decimals)
(define-constant PRECISION u1000000)

;; Read-Only Functions

(define-read-only (safe-add (a uint) (b uint))
  (let ((result (+ a b)))
    (if (>= result a)
      (ok result)
      ERR-OVERFLOW
    )
  )
)

(define-read-only (safe-sub (a uint) (b uint))
  (if (>= a b)
    (ok (- a b))
    (err u400)
  )
)

(define-read-only (safe-mul (a uint) (b uint))
  (ok (* a b))
)

(define-read-only (safe-div (a uint) (b uint))
  (if (> b u0)
    (ok (/ a b))
    ERR-DIVISION-BY-ZERO
  )
)

(define-read-only (percentage-of (amount uint) (percent uint))
  ;; Percent in basis points (100 = 1%)
  (ok (/ (* amount percent) u10000))
)

(define-read-only (mul-down (a uint) (b uint))
  ;; Multiply with precision, round down
  (ok (/ (* a b) PRECISION))
)

(define-read-only (mul-up (a uint) (b uint))
  ;; Multiply with precision, round up
  (let ((product (* a b)))
    (ok (/ (+ product (- PRECISION u1)) PRECISION))
  )
)

(define-read-only (div-down (a uint) (b uint))
  ;; Divide with precision, round down
  (if (> b u0)
    (ok (/ (* a PRECISION) b))
    ERR-DIVISION-BY-ZERO
  )
)

(define-read-only (min (a uint) (b uint))
  (if (< a b) a b)
)

(define-read-only (max (a uint) (b uint))
  (if (> a b) a b)
)

(define-read-only (pow-10 (exponent uint))
  ;; Calculate 10^exponent
  (if (is-eq exponent u0)
    u1
    (if (is-eq exponent u1)
      u10
      (if (is-eq exponent u2)
        u100
        (if (is-eq exponent u3)
          u1000
          (if (is-eq exponent u6)
            PRECISION
            u1
          )
        )
      )
    )
  )
)

(define-read-only (sqrt-approx (n uint))
  ;; Simple square root approximation (Babylonian method, 5 iterations)
  (if (is-eq n u0)
    u0
    (let ((x (/ n u2)))
      (let ((x1 (/ (+ x (/ n x)) u2)))
        (let ((x2 (/ (+ x1 (/ n x1)) u2)))
          (let ((x3 (/ (+ x2 (/ n x2)) u2)))
            (let ((x4 (/ (+ x3 (/ n x3)) u2)))
              (/ (+ x4 (/ n x4)) u2)
            )
          )
        )
      )
    )
  )
)

(define-read-only (abs-diff (a uint) (b uint))
  (if (> a b)
    (- a b)
    (- b a)
  )
)

(define-read-only (weighted-average (value1 uint) (weight1 uint) (value2 uint) (weight2 uint))
  (let ((total-weight (+ weight1 weight2)))
    (if (> total-weight u0)
      (ok (/ (+ (* value1 weight1) (* value2 weight2)) total-weight))
      (err u400)
    )
  )
)
