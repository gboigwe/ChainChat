;; title: test-token-a
;; version: 1.0.0
;; summary: Test Token A for testing pairs
;; description: SIP-010 test token - Clarity 4

;; Implements SIP-010 trait

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u7600))
(define-constant ERR-NOT-TOKEN-OWNER (err u7601))

;; Token definition
(define-fungible-token token-a u1000000000000000)  ;; 1 billion with 6 decimals

;; Data Variables
(define-data-var token-name (string-ascii 32) "Test Token A")
(define-data-var token-symbol (string-ascii 10) "TKA")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

;; SIP-010 Functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR-NOT-TOKEN-OWNER)
    (try! (ft-transfer? token-a amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance token-a who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply token-a))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Public Functions

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (ft-mint? token-a amount recipient)
  )
)
