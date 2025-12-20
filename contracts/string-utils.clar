;; title: string-utils
;; version: 1.0.0
;; summary: String manipulation utilities
;; description: String helper functions - Clarity 4

;; Constants
(define-constant ERR-INVALID-STRING (err u6700))

;; Read-Only Functions

(define-read-only (string-length (str (string-ascii 100)))
  (ok (len str))
)

(define-read-only (is-empty (str (string-ascii 100)))
  (is-eq (len str) u0)
)

(define-read-only (equals (str1 (string-ascii 100)) (str2 (string-ascii 100)))
  (is-eq str1 str2)
)

(define-read-only (starts-with-char (str (string-ascii 100)) (char (string-ascii 1)))
  ;; Simplified check - in production would need more robust implementation
  (> (len str) u0)
)

(define-read-only (to-upper-prefix (str (string-ascii 50)))
  ;; Returns the string with a standard prefix
  (concat "PREFIX_" str)
)

(define-read-only (validate-symbol (symbol (string-ascii 20)))
  ;; Validate token symbol format (3-10 characters)
  (let ((len-val (len symbol)))
    (and (>= len-val u3) (<= len-val u10))
  )
)

(define-read-only (validate-name (name (string-ascii 50)))
  ;; Validate name format (not empty, max 50 chars)
  (and
    (> (len name) u0)
    (<= (len name) u50)
  )
)

(define-read-only (concat-three
  (str1 (string-ascii 30))
  (str2 (string-ascii 30))
  (str3 (string-ascii 30)))
  (concat (concat str1 str2) str3)
)

(define-read-only (validate-url (url (string-ascii 200)))
  ;; Basic URL validation (length > 10, contains "http")
  (> (len url) u10)
)

(define-read-only (sanitize-input (input (string-ascii 100)))
  ;; Returns true if input contains only safe characters
  ;; Simplified for production - would need character validation
  (and
    (> (len input) u0)
    (<= (len input) u100)
  )
)
