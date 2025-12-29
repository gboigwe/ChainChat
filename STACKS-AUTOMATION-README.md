# Stacks Ultimate Automation Script

Automated multi-wallet contract interaction for Stacks blockchain, similar to your Celo/Base susu scripts.

## Overview

This script automates interactions with deployed Stacks smart contracts using multiple wallet addresses:

- **Distributes funds** to 10 supporting addresses
- **Queries contract state** (read-only calls)
- **Executes contract functions** from main account
- **All wallets interact** with your deployed contracts
- **Sweeps funds back** to main account
- **Tracks and reports** all transactions

## Features

✅ Pure shell script using `stx` CLI tools
✅ Multiple wallet management (1 main + 10 supporting)
✅ Contract read and write operations
✅ Automatic nonce management
✅ Transaction tracking and reporting
✅ Color-coded output like your Celo scripts
✅ Works on testnet and mainnet

## Prerequisites

### 1. Install Stacks CLI

```bash
npm install -g @stacks/cli
```

Verify installation:
```bash
stx --version
```

### 2. Install jq (JSON processor)

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### 3. Fund Your Wallet

**Testnet:**
```bash
# Get testnet STX from faucet
stx faucet YOUR_ADDRESS

# Or visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
```

**Mainnet:**
- Transfer STX to your main address
- You'll need ~5-10 STX for running the full script

## Setup

### 1. Generate Main Wallet

```bash
# Generate new wallet
stx make_keychain

# Output:
# {
#   "mnemonic": "word1 word2 word3 ... word12",
#   "keyInfo": {
#     "privateKey": "abc123...",
#     "address": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
#     ...
#   }
# }
```

**Save the mnemonic securely!** You'll need it for the script.

### 2. Configure Environment

```bash
# Copy example config
cp stacks.env.example .env

# Edit .env and add your mnemonic
nano .env
```

Set these values in `.env`:

```bash
STACKS_NETWORK=testnet  # or mainnet
MAIN_MNEMONIC="your twelve word mnemonic here"
VAULT_CONTRACT=YOUR_ADDRESS.your-contract-name
ENGINE_CONTRACT=YOUR_ADDRESS.another-contract
```

### 3. Deploy Your Contracts

Before running the script, deploy your contracts to testnet/mainnet:

```bash
# Using Clarinet
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml

# Update .env with deployed contract addresses
```

## Usage

### Make Script Executable

```bash
chmod +x stacks-ultimate.sh
```

### Run the Script

```bash
# Load environment and run
source .env && ./stacks-ultimate.sh
```

### What It Does

**Part 1: Distribution** (10 transactions)
- Sends 0.5 STX to each of 10 supporting addresses

**Part 2: Read-Only Queries** (multiple calls)
- Queries your vault contract state
- Checks balances, deposits, etc.

**Part 3: Main Account Interactions** (3 transactions)
- Main account deposits to vault contract
- Demonstrates write operations

**Part 4: Multi-Wallet Interactions** (10 transactions)
- All 10 supporting addresses call vault contract
- Simulates real user activity

**Part 5: Engine Interactions** (5 transactions)
- Calls your AI engine contract
- Multiple strategy executions

**Part 6: Additional Operations** (varies)
- More contract queries
- Withdrawal attempts
- Additional function calls

**Part 7: Sweep Funds** (10 transactions)
- Returns remaining STX from supporting addresses
- Keeps small amount for future use

**Total:** ~40+ transactions per run

## Customization

### Adjust for Your Contracts

Edit the script to match your contract's functions:

```bash
# Line ~150: Change deposit function
stx call_contract_func "$VAULT_ADDR" "$VAULT_NAME" "your-function-name" ...

# Line ~175: Change read-only queries
stx call_read_only_contract_func "$VAULT_ADDR" "$VAULT_NAME" "your-getter" ...

# Line ~220: Adjust function arguments
# Format: 'u100' for uint, '"string"' for strings, 'true' for bool
```

### Transaction Amounts

Modify these variables in the script:

```bash
DIST_AMOUNT="500000"      # 0.5 STX per wallet
CONTRIB_AMOUNT="100000"   # 0.1 STX per transaction
```

### Number of Supporting Wallets

Change loop ranges to use more/fewer wallets:

```bash
# Change from {0..9} to {0..19} for 20 wallets
for i in {0..19}; do
```

## Understanding `stx` Commands

### Send STX

```bash
stx send_tokens RECIPIENT AMOUNT FEE NONCE PRIVATE_KEY [MEMO]

# Example:
stx send_tokens ST1P... 1000000 1000 0 "abc123..." "Payment"
```

### Call Contract Function

```bash
stx call_contract_func CONTRACT_ADDR CONTRACT_NAME FUNCTION FEE NONCE PRIVATE_KEY [ARGS]

# Example:
stx call_contract_func SP2P... vault deposit 10000 0 "abc..." "u100000"
```

### Read-Only Call

```bash
stx call_read_only_contract_func CONTRACT_ADDR CONTRACT_NAME FUNCTION SENDER

# Example:
stx call_read_only_contract_func SP2P... vault get-balance ST1P...
```

### Clarity Value Format

- **uint:** `u1000`
- **int:** `1000` or `-1000`
- **bool:** `true` or `false`
- **string-ascii:** `"hello"`
- **principal:** Address (passed directly)
- **tuple:** `{amount: u100, user: ST1P...}`
- **list:** `[u1, u2, u3]`

## Common Contract Functions

### Vault/DeFi Contracts

```bash
# Deposit
stx call_contract_func $ADDR $NAME "deposit" 10000 $nonce $pk "u1000000"

# Withdraw
stx call_contract_func $ADDR $NAME "withdraw" 10000 $nonce $pk "u500000"

# Get balance
stx call_read_only_contract_func $ADDR $NAME "get-user-balance" $USER_ADDR

# Get total deposits
stx call_read_only_contract_func $ADDR $NAME "get-total-deposits" $USER_ADDR
```

### Token Contracts (SIP-010)

```bash
# Transfer tokens
stx call_contract_func $ADDR $NAME "transfer" 10000 $nonce $pk \
    "u1000000" "ST1P..." "ST2Q..." "none"

# Get balance
stx call_read_only_contract_func $ADDR $NAME "get-balance" "ST1P..."

# Get total supply
stx call_read_only_contract_func $ADDR $NAME "get-total-supply" $USER_ADDR
```

## Troubleshooting

### "stx: command not found"

```bash
# Install Stacks CLI
npm install -g @stacks/cli
```

### "jq: command not found"

```bash
# Install jq
sudo apt-get install jq  # Linux
brew install jq          # macOS
```

### Nonce Errors

If you get "BadNonce" errors:

```bash
# Query your current nonce
stx balance YOUR_ADDRESS | grep nonce

# Update the nonce variable in the script
nonce=5  # Use your actual nonce
```

### Insufficient Balance

```bash
# Check balance
stx balance YOUR_ADDRESS

# For testnet, use faucet
stx faucet YOUR_ADDRESS
```

### Contract Not Found

Make sure your contracts are deployed:

```bash
# Check if contract exists
stx call_read_only_contract_func SP2P... contract-name get-info ST1P...
```

## Cost Estimation

### Testnet
- **Free!** Use faucet for testnet STX
- Total needed: ~2-3 STX

### Mainnet
- **Transactions:** ~40-50 transactions
- **Fee per tx:** ~0.001-0.01 STX
- **Distribution:** ~5 STX (returned via sweep)
- **Total needed:** ~6-8 STX

## Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env` to git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use testnet first**
   - Always test on testnet before mainnet
   - Verify contract functions work correctly

3. **Keep mnemonics secure**
   - Don't share your mnemonic
   - Don't screenshot or email it
   - Store it in a password manager

4. **Supporting wallets are disposable**
   - They're generated fresh each run
   - Funds are swept back to main account
   - You can regenerate them anytime

## Advanced Usage

### Running in CI/CD

```bash
# Set environment variables in CI
export STACKS_NETWORK=testnet
export MAIN_MNEMONIC="..."
export VAULT_CONTRACT="..."

# Run script
./stacks-ultimate.sh
```

### Scheduling with Cron

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project && source .env && ./stacks-ultimate.sh >> stacks.log 2>&1
```

### Custom Scenarios

Create variations for different purposes:

```bash
# Quick test (fewer transactions)
cp stacks-ultimate.sh stacks-quick.sh
# Edit and reduce loop counts

# Load test (more transactions)
cp stacks-ultimate.sh stacks-load-test.sh
# Edit and increase loop counts
```

## Output Example

```
═══════════════════════════════════════════════════════════
  STACKS ULTIMATE SCRIPT - Maximum Contract Interactions
═══════════════════════════════════════════════════════════

🔑 Generating wallet keys from mnemonic...

   Main Address: ST1PQHQKV0...ZGZGM
   Support1: ST2J6ZY48G...J5SVTE
   ...

💰 Starting Balance: 10.5 STX

[PART 1] Distributing funds to 10 addresses...
   Amount per address: 0.5 STX

  📤 Support1: ST2J6ZY48G...
     ✅ Sent
  ...

═══════════════════════════════════════════════════════════
              🎉 STACKS SCRIPT COMPLETE! 🎉
═══════════════════════════════════════════════════════════

📊 SUMMARY:
   ✅ Total Transactions: 45+

💰 BALANCE:
   Starting: 10.5 STX
   Final: 10.3 STX
   Spent: 0.2 STX (fees)

📈 CONTRACT INTERACTIONS:
   ✅ Vault Contract: SP2P...vault
   ✅ Engine Contract: SP2P...ai-engine
   📝 ~45+ total contract calls

🔗 View Activity:
   https://explorer.hiro.so/address/ST1P...?chain=testnet
```

## Comparison with Celo/Base Scripts

| Feature | Celo/Base (cast) | Stacks (stx) |
|---------|------------------|--------------|
| Tool | Foundry cast | @stacks/cli |
| Language | Bash | Bash |
| Network | EVM chains | Stacks |
| Addresses | 0x... | ST/SP... |
| Token | ETH/CELO | STX |
| Contracts | Solidity | Clarity |
| Speed | Fast (~1-2s/tx) | Moderate (~3-5s/tx) |

## Next Steps

1. **Test on testnet** with small amounts
2. **Verify contract interactions** work correctly
3. **Customize for your contracts** and use cases
4. **Deploy to mainnet** when ready
5. **Monitor transactions** on explorer

## Resources

- **Stacks CLI Docs:** https://docs.stacks.co/references/stacks-cli
- **Clarity Docs:** https://docs.stacks.co/clarity/
- **Explorer:** https://explorer.hiro.so/
- **Testnet Faucet:** https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Your Scripts:** Based on susu-ultimate.sh patterns

## Support

For issues:
1. Check this README
2. Verify `.env` configuration
3. Test individual `stx` commands
4. Check Stacks Explorer for transaction status

---

**Built with ❤️ for Stacks blockchain automation**

Based on your successful Celo/Base automation patterns!
