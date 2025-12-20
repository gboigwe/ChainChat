;; title: governance-token
;; version: 1.0.0
;; summary: ChainChat governance token
;; description: SIP-010 fungible token for governance - Clarity 4

;; Implement SIP-010 trait

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED (err u4000))
(define-constant ERR-NOT-TOKEN-OWNER (err u4001))
(define-constant ERR-INSUFFICIENT-BALANCE (err u4002))

;; Token definitions
(define-fungible-token chainchat-token u1000000000000000)  ;; 1B tokens with 6 decimals

;; Data Variables
(define-data-var token-name (string-ascii 32) "ChainChat")
(define-data-var token-symbol (string-ascii 10) "CHAT")
(define-data-var token-uri (optional (string-utf8 256)) none)
(define-data-var token-decimals uint u6)

;; SIP-010 Functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq tx-sender sender) (is-eq contract-caller sender)) ERR-UNAUTHORIZED)
    (try! (ft-transfer? chainchat-token amount sender recipient))
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
  (ok (ft-get-balance chainchat-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply chainchat-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Mint function (only contract owner)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-UNAUTHORIZED)
    (ft-mint? chainchat-token amount recipient)
  )
)

;; Burn function
(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (or (is-eq tx-sender owner) (is-eq tx-sender CONTRACT-OWNER)) ERR-NOT-TOKEN-OWNER)
    (ft-burn? chainchat-token amount owner)
  )
)

;; Delegation Functions

(define-map delegations principal principal)  ;; delegator -> delegatee
(define-map delegation-amounts principal uint)  ;; delegator -> amount delegated

(define-public (delegate (delegatee principal) (amount uint))
  (let (
    (delegator-balance (ft-get-balance chainchat-token tx-sender))
  )
    (asserts! (>= delegator-balance amount) ERR-INSUFFICIENT-BALANCE)

    (map-set delegations tx-sender delegatee)
    (map-set delegation-amounts tx-sender amount)

    (print {
      event: "voting-power-delegated",
      delegator: tx-sender,
      delegatee: delegatee,
      amount: amount,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

(define-public (undelegate)
  (begin
    (map-delete delegations tx-sender)
    (map-delete delegation-amounts tx-sender)

    (print {
      event: "voting-power-undelegated",
      delegator: tx-sender,
      timestamp: stacks-block-time
    })

    (ok true)
  )
)

;; Voting Power Functions

(define-read-only (get-voting-power (user principal))
  (let (
    (balance (ft-get-balance chainchat-token user))
    (delegated-away-amount (default-to u0 (map-get? delegation-amounts user)))
  )
    ;; Balance minus what user delegated away
    (ok (- balance delegated-away-amount))
  )
)

(define-read-only (get-total-voting-power-with-delegations (user principal))
  (let (
    (own-power (ft-get-balance chainchat-token user))
    (delegated-away (default-to u0 (map-get? delegation-amounts user)))
  )
    ;; Own power minus delegated away
    ;; Note: Receiving delegations would be tracked separately in a real implementation
    (ok (- own-power delegated-away))
  )
)

(define-read-only (get-delegatee (delegator principal))
  (map-get? delegations delegator)
)

(define-read-only (get-delegation-amount (delegator principal))
  (default-to u0 (map-get? delegation-amounts delegator))
)

;; Clarity 4 Enhanced Functions

;; 1. Clarity 4: principal-destruct? - Validate token holder addresses
(define-read-only (validate-token-holder (holder principal))
  (principal-destruct? holder)
)

;; 2. Clarity 4: int-to-utf8 - Format token amounts for display
(define-read-only (format-balance (holder principal))
  (ok (int-to-utf8 (ft-get-balance chainchat-token holder)))
)

(define-read-only (format-total-supply)
  (ok (int-to-utf8 (ft-get-supply chainchat-token)))
)

;; 3. Clarity 4: string-to-uint? - Parse token amounts from strings
(define-read-only (parse-token-amount (amount-str (string-ascii 30)))
  (match (string-to-uint? amount-str)
    amount (ok amount)
    (err u998)
  )
)

;; 4. Clarity 4: buff-to-uint-be - Decode token amount from buffer (big-endian)
(define-read-only (decode-amount-buffer (amount-buff (buff 16)))
  (ok (buff-to-uint-be amount-buff))
)

;; 5. Clarity 4: burn-block-height - Track delegation with Bitcoin time
(define-read-only (get-token-timestamps)
  (ok {
    stacks-time: stacks-block-time,
    burn-time: burn-block-height,
    timestamp-diff: (- stacks-block-time burn-block-height)
  })
)
