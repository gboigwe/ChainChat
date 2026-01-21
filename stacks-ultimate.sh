#!/bin/bash

# ULTIMATE STACKS SCRIPT
# Maximum interactions with deployed Stacks contracts
# Similar to susu-ultimate.sh but for Stacks blockchain

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Load environment variables
source .env

# Configuration
NETWORK="${STACKS_NETWORK:-mainnet}"  # mainnet or testnet
MAIN_MNEMONIC="$MAIN_MNEMONIC"

# Deployed AdStack metrics-engine contract on mainnet
METRICS_CONTRACT="${METRICS_CONTRACT:-SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.metrics-engine}"
TOKEN_CONTRACT="${TOKEN_CONTRACT:-}"  # Optional

# Parse contract address
METRICS_ADDR=$(echo $METRICS_CONTRACT | cut -d'.' -f1)
METRICS_NAME=$(echo $METRICS_CONTRACT | cut -d'.' -f2)

# Transaction amounts (in micro-STX: 1 STX = 1,000,000 micro-STX)
DIST_AMOUNT="500000"      # 0.5 STX distribution per wallet
CONTRIB_AMOUNT="100000"   # 0.1 STX contribution per transaction

# Generate supporting wallet keys from main mnemonic (using BIP44 derivation)
# We'll derive accounts at indices 1-10 from the same mnemonic
generate_support_keys() {
    echo -e "${CYAN}🔑 Generating wallet keys from mnemonic...${NC}\n"

    # Get main account (index 0)
    KEYCHAIN=$(stx make_keychain "$MAIN_MNEMONIC" 2>/dev/null)
    MAIN_PK=$(echo "$KEYCHAIN" | jq -r '.keyInfo.privateKey')
    MAIN_ADDR=$(echo "$KEYCHAIN" | jq -r '.keyInfo.address')

    echo -e "   Main Address: ${MAIN_ADDR:0:10}...${MAIN_ADDR: -4}"

    # Generate supporting accounts (indices 1-10)
    # Note: stx make_keychain doesn't support account indices directly
    # So we'll use a workaround: generate different mnemonics or use the same keys
    # For this demo, we'll create 10 different wallets

    SUPPORT_PKS=()
    SUPPORT_ADDRS=()

    for i in {1..10}; do
        # Generate new keychain for each support wallet
        SUPPORT_CHAIN=$(stx make_keychain 2>/dev/null)
        PK=$(echo "$SUPPORT_CHAIN" | jq -r '.keyInfo.privateKey')
        ADDR=$(echo "$SUPPORT_CHAIN" | jq -r '.keyInfo.address')

        SUPPORT_PKS+=("$PK")
        SUPPORT_ADDRS+=("$ADDR")

        echo -e "   Support$i: ${ADDR:0:10}...${ADDR: -4}"
    done

    echo ""
}

# Get STX balance
get_balance() {
    local address=$1
    stx balance "$address" 2>/dev/null | grep -oP '(?<=balance: )\d+' || echo "0"
}

# Wait between transactions to avoid nonce issues
wait_tx() {
    sleep 3
}

echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  STACKS ULTIMATE SCRIPT - Maximum Contract Interactions${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}\n"

# Generate wallets
generate_support_keys

# Get initial balance
initial_balance=$(get_balance "$MAIN_ADDR")
initial_stx=$(echo "scale=6; $initial_balance / 1000000" | bc)
echo -e "${BLUE}💰 Starting Balance: $initial_stx STX${NC}\n"

tx_count=0
nonce=0

# Get current nonce
get_nonce() {
    local addr=$1
    # In production, query Stacks API for nonce
    # For now, we track it locally
    echo $nonce
}

# ═══════════════════════════════════════════════════════════
# PART 1: DISTRIBUTE FUNDS TO SUPPORTING ADDRESSES
# ═══════════════════════════════════════════════════════════

echo -e "${GREEN}[PART 1] Distributing funds to 10 addresses...${NC}\n"
echo -e "   Amount per address: 0.5 STX\n"

for i in {0..9}; do
    recipient="${SUPPORT_ADDRS[$i]}"
    echo -e "  📤 Support$((i+1)): ${recipient:0:10}..."

    # Send STX using stx send_tokens
    # stx send_tokens RECIPIENT AMOUNT FEE NONCE PRIVATE_KEY [MEMO]
    result=$(stx send_tokens "$recipient" "$DIST_AMOUNT" 1000 $nonce "$MAIN_PK" "Distribution $((i+1))" 2>&1)

    if [[ $result == *"error"* ]]; then
        echo -e "     ${RED}❌ Failed${NC}"
    else
        echo -e "     ${GREEN}✅ Sent${NC}"
        ((tx_count++))
        ((nonce++))
    fi

    wait_tx
done

echo -e "\n  ${GREEN}✅ Distributed to 10 addresses${NC}\n"

# ═══════════════════════════════════════════════════════════
# PART 2: READ-ONLY CONTRACT QUERIES
# ═══════════════════════════════════════════════════════════

echo -e "${CYAN}[PART 2] Querying metrics-engine contract (read-only)...${NC}\n"

echo -e "  📊 Metrics Contract: $METRICS_ADDR.$METRICS_NAME"

# Call read-only functions using stx call_read_only_contract_func
# stx call_read_only_contract_func CONTRACT_ADDRESS CONTRACT_NAME FUNCTION_NAME SENDER_ADDRESS [ARGS]

# Query campaign #1 metrics
echo -e "     Checking get-campaign-roi for campaign 1..."
stx call_read_only_contract_func "$METRICS_ADDR" "$METRICS_NAME" "get-campaign-roi" "$MAIN_ADDR" "u1" 2>/dev/null | head -3
wait_tx

echo -e "     Checking get-conversion-count for campaign 1..."
stx call_read_only_contract_func "$METRICS_ADDR" "$METRICS_NAME" "get-conversion-count" "$MAIN_ADDR" "u1" 2>/dev/null | head -3
wait_tx

echo -e "     Checking get-fraud-score for campaign 1..."
stx call_read_only_contract_func "$METRICS_ADDR" "$METRICS_NAME" "get-fraud-score" "$MAIN_ADDR" "u1" 2>/dev/null | head -3
wait_tx

echo -e "     Checking get-retention-metrics for campaign 1..."
stx call_read_only_contract_func "$METRICS_ADDR" "$METRICS_NAME" "get-retention-metrics" "$MAIN_ADDR" "u1" 2>/dev/null | head -3
wait_tx

echo -e "\n  ${CYAN}✅ Contract queries complete${NC}\n"

# ═══════════════════════════════════════════════════════════
# PART 3: MAIN ACCOUNT CONTRACT INTERACTIONS
# ═══════════════════════════════════════════════════════════

echo -e "${YELLOW}[PART 3] Main account interacting with metrics-engine...${NC}\n"

# Call contract function using stx call_contract_func
# stx call_contract_func CONTRACT_ADDRESS CONTRACT_NAME FUNCTION_NAME FEE NONCE PRIVATE_KEY [ARGS]

# Record conversions for campaign 1
for i in {1..3}; do
    echo -e "  📈 Recording conversion #$i for campaign 1..."

    # record-conversion (campaign-id, user, value, conversion-type, attributed-view-id)
    result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "record-conversion" 10000 $nonce "$MAIN_PK" \
        "u1" "$MAIN_ADDR" "u50000" '"purchase"' "u$i" 2>&1)

    if [[ $result == *"error"* ]]; then
        echo -e "     ${RED}❌ Failed${NC}"
    else
        echo -e "     ${GREEN}✅ Recorded${NC}"
        ((tx_count++))
        ((nonce++))
    fi

    wait_tx
done

# Update campaign ROI
echo -e "  💰 Updating campaign ROI..."
result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "update-campaign-roi" 10000 $nonce "$MAIN_PK" \
    "u1" "u1000000" "u1500000" "u3" 2>&1)

if [[ $result == *"error"* ]]; then
    echo -e "     ${RED}❌ Failed${NC}"
else
    echo -e "     ${GREEN}✅ Updated${NC}"
    ((tx_count++))
    ((nonce++))
fi

wait_tx

# Track hourly performance
echo -e "  ⏰ Tracking hourly performance..."
result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "track-hourly-performance" 10000 $nonce "$MAIN_PK" \
    "u1" "u1000" "u50" "u3" "u150000" 2>&1)

if [[ $result == *"error"* ]]; then
    echo -e "     ${RED}❌ Failed${NC}"
else
    echo -e "     ${GREEN}✅ Tracked${NC}"
    ((tx_count++))
    ((nonce++))
fi

wait_tx

echo -e "\n  ${YELLOW}✅ Main account interactions complete${NC}\n"

# ═══════════════════════════════════════════════════════════
# PART 4: ALL SUPPORTING ACCOUNTS INTERACT WITH METRICS-ENGINE
# ═══════════════════════════════════════════════════════════

echo -e "${BLUE}[PART 4] All 10 addresses tracking user engagement...${NC}\n"

support_nonces=(0 0 0 0 0 0 0 0 0 0)  # Track nonce for each support wallet

for i in {0..9}; do
    addr="${SUPPORT_ADDRS[$i]}"
    pk="${SUPPORT_PKS[$i]}"
    support_nonce=${support_nonces[$i]}

    echo -e "  👤 Support$((i+1)): ${addr:0:10}... tracking engagement..."

    # Each supporting address tracks user engagement
    # track-user-engagement (user, campaign-id, views, clicks, time-spent)
    views=$((100 + RANDOM % 100))
    clicks=$((5 + RANDOM % 20))
    time_spent=$((300 + RANDOM % 500))

    result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "track-user-engagement" 10000 $support_nonce "$pk" \
        "$addr" "u1" "u$views" "u$clicks" "u$time_spent" 2>&1)

    if [[ $result == *"error"* ]]; then
        echo -e "     ${RED}❌ Failed${NC}"
    else
        echo -e "     ${GREEN}✅ Tracked ($views views, $clicks clicks)${NC}"
        ((tx_count++))
        support_nonces[$i]=$((support_nonce + 1))
    fi

    wait_tx
done

echo -e "\n  ${BLUE}✅ All supporting accounts interacted${NC}\n"

# ═══════════════════════════════════════════════════════════
# PART 5: FRAUD DETECTION & RETENTION TRACKING
# ═══════════════════════════════════════════════════════════

echo -e "${CYAN}[PART 5] Fraud detection and retention tracking...${NC}\n"

# Calculate fraud score for campaign 1
echo -e "  🔍 Calculating fraud score for campaign 1..."
result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "calculate-fraud-score" 10000 $nonce "$MAIN_PK" \
    "u1" "u10" "u1000" "u2" 2>&1)

if [[ $result == *"error"* ]]; then
    echo -e "     ${RED}❌ Failed${NC}"
else
    echo -e "     ${GREEN}✅ Fraud score calculated${NC}"
    ((tx_count++))
    ((nonce++))
fi

wait_tx

# Update retention rate
echo -e "  📊 Updating retention metrics..."
result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "update-retention-rate" 10000 $nonce "$MAIN_PK" \
    "u1" "u800" "u350" "u1200" 2>&1)

if [[ $result == *"error"* ]]; then
    echo -e "     ${RED}❌ Failed${NC}"
else
    echo -e "     ${GREEN}✅ Retention updated${NC}"
    ((tx_count++))
    ((nonce++))
fi

wait_tx

# Generate publisher reports for some supporting addresses
echo -e "  📈 Generating publisher reports..."
for i in {0..2}; do
    addr="${SUPPORT_ADDRS[$i]}"
    pk="${SUPPORT_PKS[$i]}"
    support_nonce=${support_nonces[$i]}

    result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "generate-publisher-report" 10000 $support_nonce "$pk" \
        "$addr" "u1" "u5000" "u250000" "u3" 2>&1)

    if [[ $result == *"error"* ]]; then
        echo -e "     ${RED}❌ Failed for Support$((i+1))${NC}"
    else
        echo -e "     ${GREEN}✅ Report generated for Support$((i+1))${NC}"
        ((tx_count++))
        support_nonces[$i]=$((support_nonce + 1))
    fi

    wait_tx
done

echo -e "\n  ${CYAN}✅ Fraud detection and retention complete${NC}\n"

# ═══════════════════════════════════════════════════════════
# PART 6: BATCH UPDATES & MORE QUERIES
# ═══════════════════════════════════════════════════════════

echo -e "${PURPLE}[PART 6] Batch updates and additional queries...${NC}\n"

# Batch update metrics for campaign 1
echo -e "  📦 Batch updating metrics for campaign 1..."
result=$(stx call_contract_func "$METRICS_ADDR" "$METRICS_NAME" "batch-update-metrics" 10000 $nonce "$MAIN_PK" \
    "u1" "u2000000" "u3000000" "u15" "u1000" "u400" 2>&1)

if [[ $result == *"error"* ]]; then
    echo -e "     ${RED}❌ Failed${NC}"
else
    echo -e "     ${GREEN}✅ Batch update complete${NC}"
    ((tx_count++))
    ((nonce++))
fi

wait_tx

# Query multiple metrics
echo -e "\n  📊 Querying updated metrics..."
functions=("get-campaign-roi" "get-fraud-score" "get-retention-metrics")

for func in "${functions[@]}"; do
    echo -e "     Calling $func for campaign 1..."
    stx call_read_only_contract_func "$METRICS_ADDR" "$METRICS_NAME" "$func" "$MAIN_ADDR" "u1" 2>/dev/null | head -2
    sleep 1
done

# Query user engagement for some addresses
echo -e "\n  👥 Checking user engagement..."
for i in {0..2}; do
    addr="${SUPPORT_ADDRS[$i]}"
    echo -e "     Support$((i+1)) engagement..."
    stx call_read_only_contract_func "$METRICS_ADDR" "$METRICS_NAME" "get-user-engagement" "$MAIN_ADDR" "$addr" "u1" 2>/dev/null | head -2
    sleep 1
done

echo -e "\n  ${PURPLE}✅ Batch updates and queries complete${NC}\n"

# ═══════════════════════════════════════════════════════════
# PART 7: SWEEP FUNDS BACK TO MAIN ACCOUNT
# ═══════════════════════════════════════════════════════════

echo -e "${YELLOW}[PART 7] Sweeping funds from 10 addresses...${NC}\n"

for i in {0..9}; do
    addr="${SUPPORT_ADDRS[$i]}"
    pk="${SUPPORT_PKS[$i]}"
    support_nonce=${support_nonces[$i]}

    balance=$(get_balance "$addr")

    # Keep 0.01 STX (10000 micro-STX) for future transactions
    if [ $balance -gt 15000 ]; then
        to_send=$((balance - 11000))  # Keep 0.011 STX (buffer for fees)

        echo -e "  💸 Sweeping from Support$((i+1)): ${addr:0:10}..."

        result=$(stx send_tokens "$MAIN_ADDR" "$to_send" 1000 $support_nonce "$pk" "Sweep" 2>&1)

        if [[ $result == *"error"* ]]; then
            echo -e "     ${RED}❌ Failed${NC}"
        else
            swept_stx=$(echo "scale=6; $to_send / 1000000" | bc)
            echo -e "     ${GREEN}✅ Swept $swept_stx STX${NC}"
        fi

        sleep 2
    fi
done

echo -e "\n  ${YELLOW}✅ Sweep complete${NC}\n"

# ═══════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════

final_balance=$(get_balance "$MAIN_ADDR")
final_stx=$(echo "scale=6; $final_balance / 1000000" | bc)
spent=$((initial_balance - final_balance))
spent_stx=$(echo "scale=6; $spent / 1000000" | bc)

echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}              🎉 STACKS SCRIPT COMPLETE! 🎉${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${CYAN}📊 SUMMARY:${NC}"
echo -e "   ${GREEN}✅ Total Transactions: $tx_count+${NC}"
echo -e ""
echo -e "${CYAN}💰 BALANCE:${NC}"
echo -e "   Starting: $initial_stx STX"
echo -e "   Final: $final_stx STX"
echo -e "   Spent: $spent_stx STX (fees)"
echo -e ""
echo -e "${CYAN}📈 CONTRACT INTERACTIONS:${NC}"
echo -e "   ${GREEN}✅ Metrics Contract: $METRICS_ADDR.$METRICS_NAME${NC}"
echo -e "   ${BLUE}📝 Campaign tracking, user engagement, fraud detection${NC}"
echo -e "   ${BLUE}📝 ~$tx_count+ total contract calls${NC}"
echo -e ""
echo -e "${CYAN}🔗 View Activity:${NC}"
if [ "$NETWORK" = "mainnet" ]; then
    echo -e "   https://explorer.hiro.so/address/$MAIN_ADDR"
else
    echo -e "   https://explorer.hiro.so/address/$MAIN_ADDR?chain=testnet"
fi
echo -e ""
echo -e "${CYAN}👥 Supporting Addresses Created:${NC}"
for i in {0..9}; do
    echo -e "   Support$((i+1)): ${SUPPORT_ADDRS[$i]}"
done
echo -e ""
