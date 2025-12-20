;; title: conversion-utils
;; version: 1.0.0
;; summary: Type conversion utilities
;; description: Convert between types and units - Clarity 4

;; Constants
(define-constant ERR-CONVERSION-FAILED (err u6900))

;; Decimal places
(define-constant DECIMALS-6 u1000000)
(define-constant DECIMALS-8 u100000000)
(define-constant DECIMALS-18 u1000000000000000000)

;; Read-Only Functions

(define-read-only (stx-to-micro-stx (stx uint))
  ;; Convert STX to micro-STX (6 decimals)
  (ok (* stx DECIMALS-6))
)

(define-read-only (micro-stx-to-stx (micro-stx uint))
  ;; Convert micro-STX to STX
  (ok (/ micro-stx DECIMALS-6))
)

(define-read-only (btc-to-satoshi (btc uint))
  ;; Convert BTC to satoshis (8 decimals)
  (ok (* btc DECIMALS-8))
)

(define-read-only (satoshi-to-btc (satoshi uint))
  ;; Convert satoshis to BTC
  (ok (/ satoshi DECIMALS-8))
)

(define-read-only (to-fixed-point (value uint) (decimals uint))
  ;; Convert integer to fixed point
  (if (is-eq decimals u6)
    (ok (* value DECIMALS-6))
    (if (is-eq decimals u8)
      (ok (* value DECIMALS-8))
      (ok value)
    )
  )
)

(define-read-only (from-fixed-point (value uint) (decimals uint))
  ;; Convert fixed point to integer
  (if (is-eq decimals u6)
    (ok (/ value DECIMALS-6))
    (if (is-eq decimals u8)
      (ok (/ value DECIMALS-8))
      (ok value)
    )
  )
)

(define-read-only (basis-points-to-percentage (bp uint))
  ;; Convert basis points to percentage (10000 bp = 100%)
  (ok (/ bp u100))
)

(define-read-only (percentage-to-basis-points (percent uint))
  ;; Convert percentage to basis points
  (ok (* percent u100))
)

(define-read-only (scale-amount (amount uint) (from-decimals uint) (to-decimals uint))
  ;; Scale amount from one decimal precision to another
  (if (> from-decimals to-decimals)
    (ok (/ amount (pow u10 (- from-decimals to-decimals))))
    (ok (* amount (pow u10 (- to-decimals from-decimals))))
  )
)

(define-read-only (normalize-to-6-decimals (amount uint) (current-decimals uint))
  ;; Normalize any amount to 6 decimals
  (if (> current-decimals u6)
    (ok (/ amount (pow u10 (- current-decimals u6))))
    (if (< current-decimals u6)
      (ok (* amount (pow u10 (- u6 current-decimals))))
      (ok amount)
    )
  )
)

(define-read-only (seconds-to-blocks (seconds uint))
  ;; Assuming 10-minute blocks (Bitcoin)
  (ok (/ seconds u600))
)

(define-read-only (blocks-to-seconds (blocks uint))
  ;; Assuming 10-minute blocks
  (ok (* blocks u600))
)

(define-read-only (days-to-seconds (days uint))
  (ok (* days u86400))
)

(define-read-only (seconds-to-days (seconds uint))
  (ok (/ seconds u86400))
)

;; Private helper
(define-private (pow (base uint) (exponent uint))
  (if (is-eq exponent u0)
    u1
    (if (is-eq exponent u1)
      base
      (* base (pow base (- exponent u1)))
    )
  )
)
