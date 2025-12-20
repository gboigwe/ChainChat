;; title: mock-token
;; version: 1.0.0
;; summary: Mock SIP-010 token for testing
;; description: Test token implementation - Clarity 4

;; Implements SIP-010 trait

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u7300))
(define-constant ERR-NOT-TOKEN-OWNER (err u7301))

;; Token definition
(define-fungible-token mock-token u1000000000000000)  ;; 1 billion with 6 decimals

;; Data Variables
(define-data-var token-name (string-ascii 32) "Mock Token")
(define-data-var token-symbol (string-ascii 10) "MOCK")
(define-data-var token-decimals uint u6)
(define-data-var token-uri (optional (string-utf8 256)) none)

;; SIP-010 Functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR-NOT-TOKEN-OWNER)
    (try! (ft-transfer? mock-token amount sender recipient))
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
  (ok (ft-get-balance mock-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Public Functions

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (ft-mint? mock-token amount recipient)
  )
)

(define-public (burn (amount uint))
  (ft-burn? mock-token amount tx-sender)
)

(define-public (set-token-uri (new-uri (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (var-set token-uri (some new-uri))
    (ok true)
  )
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate token holders
(define-read-only (validate-holder (holder principal))
  (principal-destruct? holder)
)

;; 2. Clarity 4: int-to-utf8 - Format token balances
(define-read-only (format-balance (holder principal))
  (ok (int-to-utf8 (ft-get-balance mock-token holder)))
)

;; 3. Clarity 4: string-to-uint? - Parse token amounts
(define-read-only (parse-amount (amount-str (string-ascii 30)))
  (match (string-to-uint? amount-str)
    amount (ok amount)
    (err u998)
  )
)

;; 4. Clarity 4: burn-block-height - Track token operations
(define-read-only (get-token-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height
  })
)
