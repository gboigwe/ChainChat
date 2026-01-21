# WalletConnect & Reown Integration Guide for ChainChat

**Version 3.0.0** - Updated for `@stacks/connect v8+`

This guide covers the complete implementation of WalletConnect and Reown integration for ChainChat, enabling support for 600+ wallets including Leather, Xverse, and more.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup & Configuration](#setup--configuration)
3. [Wallet Connection](#wallet-connection)
4. [Transaction Operations](#transaction-operations)
5. [Post Conditions](#post-conditions)
6. [Examples](#examples)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Get Your Reown Project ID

1. Visit [https://cloud.reown.com/](https://cloud.reown.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Configure Environment

Add to your `.env` file:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_NETWORK=mainnet  # or testnet for development
```

### 3. Basic Usage

```javascript
import { useWallet } from './hooks/useWallet';

function App() {
  const { connect, address, isConnected, transferSTX } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      console.log('Connected!');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <p>Connected: {address}</p>
      )}
    </div>
  );
}
```

---

## Setup & Configuration

### Dependencies

All required dependencies are already installed in your `package.json`:

```json
{
  "@stacks/connect": "^8.2.2",
  "@stacks/network": "^7.3.1",
  "@stacks/transactions": "^6.12.0",
  "@walletconnect/sign-client": "^2.23.1",
  "@walletconnect/qrcode-modal": "^1.8.0",
  "@reown/appkit": "^1.8.15"
}
```

### Network Configuration

ChainChat supports both Mainnet and Testnet:

- **Mainnet**: Production network
- **Testnet**: Development and testing

Set `VITE_NETWORK=mainnet` or `VITE_NETWORK=testnet` in your `.env` file.

---

## Wallet Connection

### Using the `useWallet` Hook

The `useWallet` hook provides everything you need:

```javascript
import { useWallet } from './hooks/useWallet';

function WalletButton() {
  const {
    connect,
    disconnect,
    address,
    isConnected,
    isConnecting,
    error,
    formatAddress,
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  if (isConnecting) {
    return <button disabled>Connecting...</button>;
  }

  if (isConnected) {
    return (
      <div>
        <span>{formatAddress(address)}</span>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={handleConnect}>Connect Wallet</button>;
}
```

### Wallet Selection

Users can connect with:

1. **Leather Wallet** (Browser extension) - Official Hiro wallet
2. **Xverse** (Mobile & browser) - Bitcoin + Stacks wallet
3. **Asigna** (Multi-signature) - Team wallet
4. **600+ WalletConnect wallets** - Any WalletConnect-compatible wallet

### Auto-Reconnection

The hook automatically attempts to reconnect on page load if a session exists:

```javascript
useEffect(() => {
  // Auto-reconnection happens automatically
  // Session expires after 24 hours
}, []);
```

---

## Transaction Operations

All transaction operations use the modern `@stacks/connect v8+` API with the `request()` method.

### 1. STX Transfer

Transfer STX tokens with automatic post condition protection:

```javascript
import { useWallet } from './hooks/useWallet';

function SendSTX() {
  const { transferSTX, address, stxToMicroStx } = useWallet();

  const sendTokens = async () => {
    try {
      const result = await transferSTX(
        'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', // recipient
        stxToMicroStx(1), // 1 STX in micro-STX
        'Hello from ChainChat!' // optional memo
      );

      console.log('Transaction ID:', result.txId);
      alert(`Success! TX: ${result.txId}`);
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed');
    }
  };

  return <button onClick={sendTokens}>Send 1 STX</button>;
}
```

### 2. Contract Calls

Call smart contract functions with post conditions:

```javascript
import { useWallet } from './hooks/useWallet';

function CallVaultContract() {
  const {
    callContract,
    ClarityValues,
    createSTXPostCondition,
    address,
    stxToMicroStx,
  } = useWallet();

  const depositToVault = async () => {
    try {
      // Create post condition to protect 10 STX
      const postConditions = [
        createSTXPostCondition(
          address,
          'LessEqual',
          stxToMicroStx(10)
        ),
      ];

      const result = await callContract(
        'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', // contract address
        'vault-contract', // contract name
        'deposit', // function name
        [
          ClarityValues.uint(10000000), // amount: 10 STX in micro-STX
          ClarityValues.stringAscii('savings'), // vault type
        ],
        postConditions
      );

      console.log('Contract call successful:', result.txId);
    } catch (error) {
      console.error('Contract call failed:', error);
    }
  };

  return <button onClick={depositToVault}>Deposit to Vault</button>;
}
```

### 3. Message Signing

Sign messages for authentication or verification:

```javascript
import { useWallet } from './hooks/useWallet';

function SignMessageExample() {
  const { signMessage } = useWallet();

  const handleSign = async () => {
    try {
      const result = await signMessage('Hello from ChainChat!');

      console.log('Signature:', result.signature);
      console.log('Public Key:', result.publicKey);

      // Use signature for authentication
      verifySignature(result.signature, result.publicKey);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  return <button onClick={handleSign}>Sign Message</button>;
}
```

### 4. Structured Message Signing (SIP-018)

Sign structured messages for verifiable data:

```javascript
import { useWallet } from './hooks/useWallet';

function SignStructuredMessageExample() {
  const { signStructuredMessage, ClarityValues, address } = useWallet();

  const handleSignStructured = async () => {
    try {
      const message = ClarityValues.tuple({
        action: ClarityValues.stringAscii('login'),
        timestamp: ClarityValues.uint(Date.now()),
        user: ClarityValues.principal(address),
      });

      const domain = ClarityValues.tuple({
        name: ClarityValues.stringAscii('ChainChat'),
        version: ClarityValues.stringAscii('1.0.0'),
        chainId: ClarityValues.uint(1), // mainnet
      });

      const result = await signStructuredMessage(message, domain);
      console.log('Structured signature:', result);
    } catch (error) {
      console.error('Structured signing failed:', error);
    }
  };

  return <button onClick={handleSignStructured}>Sign Structured</button>;
}
```

---

## Post Conditions

Post conditions are **critical for security** on Stacks. They protect users from unexpected asset transfers.

### Why Post Conditions Matter

```
✅ With Post Conditions:
User only loses exactly what they expect

❌ Without Post Conditions:
Malicious contracts could drain user funds
```

### STX Post Conditions

```javascript
import { createSTXPostCondition, stxToMicroStx } from './utils/wallet';

// Protect sender from transferring more than 10 STX
const postCondition = createSTXPostCondition(
  senderAddress,
  'LessEqual',    // condition code
  stxToMicroStx(10)  // amount
);
```

### Fungible Token Post Conditions

```javascript
import { createFungiblePostCondition } from './utils/wallet';

// Protect token transfer
const tokenPostCondition = createFungiblePostCondition(
  senderAddress,
  'Equal',  // must be exactly this amount
  1000n,    // amount (BigInt)
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', // token contract address
  'my-token', // contract name
  'token'     // asset name
);
```

### NFT Post Conditions

```javascript
import { createNFTPostCondition, ClarityValues } from './utils/wallet';

// Protect NFT transfer
const nftPostCondition = createNFTPostCondition(
  senderAddress,
  'Sends',  // or 'DoesNotSend'
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', // NFT contract address
  'my-nft', // contract name
  'nft-token', // asset name
  ClarityValues.uint(42)  // token ID
);
```

### Condition Codes

**For Fungible Assets (STX, Tokens):**
- `Equal` - Exactly this amount
- `Greater` - More than this amount
- `GreaterEqual` - This amount or more
- `Less` - Less than this amount
- `LessEqual` - This amount or less (**RECOMMENDED for transfers**)

**For NFTs:**
- `Sends` - Asset must be sent
- `DoesNotSend` - Asset must NOT be sent

### Post Condition Modes

```javascript
import { PostConditionMode } from '@stacks/transactions';

// RECOMMENDED: Deny mode - only allow specified transfers
postConditionMode: PostConditionMode.Deny

// NOT RECOMMENDED: Allow mode - allows any transfer
postConditionMode: PostConditionMode.Allow
```

---

## Examples

### Complete Send STX Component

```javascript
import { useState } from 'react';
import { useWallet } from './hooks/useWallet';

export function SendSTXForm() {
  const {
    transferSTX,
    address,
    isConnected,
    stxToMicroStx,
    microStxToStx,
  } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTxId('');

    try {
      const amountInMicroStx = stxToMicroStx(amount);

      const result = await transferSTX(
        recipient,
        amountInMicroStx,
        memo
      );

      setTxId(result.txId);
      alert(`Success! Transaction ID: ${result.txId}`);

      // Reset form
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error) {
      console.error('Transfer failed:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet first</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Send STX</h2>

      <label>
        Recipient Address:
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
          required
        />
      </label>

      <label>
        Amount (STX):
        <input
          type="number"
          step="0.000001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.5"
          required
        />
      </label>

      <label>
        Memo (optional):
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Hello!"
          maxLength={34}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send STX'}
      </button>

      {txId && (
        <p>
          Success! View on explorer:
          <a
            href={`https://explorer.hiro.so/txid/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {txId}
          </a>
        </p>
      )}
    </form>
  );
}
```

### Complete Contract Call Example

```javascript
import { useState } from 'react';
import { useWallet } from './hooks/useWallet';

export function DepositToVault() {
  const {
    callContract,
    ClarityValues,
    createSTXPostCondition,
    address,
    isConnected,
    stxToMicroStx,
  } = useWallet();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);

    try {
      const vaultContract = import.meta.env.VITE_VAULT_CONTRACT;
      const [contractAddress, contractName] = vaultContract.split('.');

      const amountInMicroStx = stxToMicroStx(amount);

      // Create post condition
      const postConditions = [
        createSTXPostCondition(
          address,
          'LessEqual',
          amountInMicroStx
        ),
      ];

      const result = await callContract(
        contractAddress,
        contractName,
        'deposit',
        [ClarityValues.uint(amountInMicroStx)],
        postConditions
      );

      alert(`Deposit successful! TX: ${result.txId}`);
      setAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return <p>Connect wallet to deposit</p>;
  }

  return (
    <div>
      <h2>Deposit to Vault</h2>

      <input
        type="number"
        step="0.000001"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in STX"
      />

      <button onClick={handleDeposit} disabled={loading}>
        {loading ? 'Depositing...' : 'Deposit'}
      </button>
    </div>
  );
}
```

---

## API Reference

### useWallet Hook

```javascript
const {
  // State
  walletData,      // Full wallet data object
  isConnected,     // Boolean: is wallet connected
  isConnecting,    // Boolean: connection in progress
  error,           // Error message if any
  connectionType,  // 'auto' | 'walletconnect'
  address,         // Mainnet STX address
  testnetAddress,  // Testnet STX address
  btcAddress,      // Bitcoin address
  publicKey,       // Public key
  network,         // 'mainnet' | 'testnet'
  connectedAt,     // ISO timestamp
  lastActivity,    // Last wallet activity

  // Connection Actions
  connect,                  // Connect wallet (auto-detect)
  connectViaWalletConnect,  // Force WalletConnect
  disconnect,               // Disconnect wallet
  refresh,                  // Refresh wallet data
  reconnect,                // Reconnect from session
  checkExpiry,              // Check if session expired
  clearError,               // Clear error state

  // Transaction Operations
  transferSTX,              // Transfer STX tokens
  callContract,             // Call smart contract
  signMessage,              // Sign message
  signStructuredMessage,    // Sign structured message (SIP-018)
  deployContract,           // Deploy contract

  // Post Condition Helpers
  createSTXPostCondition,         // Create STX post condition
  createFungiblePostCondition,    // Create token post condition
  createNFTPostCondition,         // Create NFT post condition

  // Clarity Value Helpers
  ClarityValues,  // {uint, int, bool, principal, stringAscii, stringUtf8, buffer, tuple}

  // Utility Helpers
  formatAddress,   // Format address for display
  microStxToStx,   // Convert micro-STX to STX
  stxToMicroStx,   // Convert STX to micro-STX
} = useWallet();
```

### Clarity Value Helpers

```javascript
import { ClarityValues } from './utils/wallet';

// Create Clarity values for contract calls
ClarityValues.uint(42);                           // uint
ClarityValues.int(-10);                           // int
ClarityValues.bool(true);                         // bool
ClarityValues.principal(address);                 // principal
ClarityValues.stringAscii('hello');               // string-ascii
ClarityValues.stringUtf8('hello 世界');           // string-utf8
ClarityValues.buffer(Buffer.from('data'));        // buffer
ClarityValues.tuple({                             // tuple
  name: ClarityValues.stringAscii('Alice'),
  age: ClarityValues.uint(25),
});
```

---

## Troubleshooting

### Common Issues

#### 1. "WalletConnect Project ID not configured"

**Solution**: Add your Project ID to `.env`:

```bash
VITE_WALLETCONNECT_PROJECT_ID=abc123...
```

Get your ID from [https://cloud.reown.com/](https://cloud.reown.com/)

#### 2. "User cancelled authentication"

This is normal - user clicked "Cancel" in wallet. Handle gracefully:

```javascript
try {
  await connect();
} catch (error) {
  if (error.message.includes('cancelled')) {
    console.log('User cancelled connection');
  }
}
```

#### 3. Post condition error

**Solution**: Make sure you're using `PostConditionMode.Deny` and have defined all post conditions:

```javascript
const postConditions = [
  createSTXPostCondition(address, 'LessEqual', amount),
];

await callContract(..., postConditions, {
  postConditionMode: PostConditionMode.Deny
});
```

#### 4. "Connection already in progress"

**Solution**: Wait for current connection to complete or add a loading state:

```javascript
if (isConnecting) {
  return <button disabled>Connecting...</button>;
}
```

#### 5. Session expired

**Solution**: The hook handles this automatically. Users will need to reconnect after 24 hours.

### Debug Mode

Enable debug logging:

```javascript
// In your browser console
localStorage.setItem('debug', 'chainchat:*');
```

### Network Issues

Check your network configuration:

```javascript
import { getNetworkName } from './utils/wallet';

console.log('Current network:', getNetworkName());
// Should match your .env VITE_NETWORK setting
```

---

## Best Practices

### 1. Always Use Post Conditions

```javascript
// ❌ BAD: No post conditions
await callContract(..., []);

// ✅ GOOD: With post conditions
const postConditions = [
  createSTXPostCondition(address, 'LessEqual', amount),
];
await callContract(..., postConditions);
```

### 2. Handle Errors Gracefully

```javascript
try {
  await transferSTX(recipient, amount);
} catch (error) {
  if (error.message.includes('cancelled')) {
    // User cancelled - no alert needed
    return;
  }

  // Show user-friendly error
  alert('Transaction failed. Please try again.');
}
```

### 3. Use BigInt for Amounts

```javascript
// ❌ BAD: JavaScript numbers lose precision
const amount = 1000000;

// ✅ GOOD: Use BigInt or stxToMicroStx
const amount = BigInt(1000000);
// or
const amount = stxToMicroStx(1);
```

### 4. Validate Inputs

```javascript
const validateAddress = (addr) => {
  return addr.startsWith('SP') || addr.startsWith('ST');
};

if (!validateAddress(recipient)) {
  alert('Invalid Stacks address');
  return;
}
```

### 5. Show Transaction Status

```javascript
const [txId, setTxId] = useState('');

const result = await transferSTX(...);
setTxId(result.txId);

// Link to explorer
<a href={`https://explorer.hiro.so/txid/${txId}`}>
  View Transaction
</a>
```

---

## Additional Resources

- **Stacks Connect Docs**: https://docs.stacks.co/stacks-connect/
- **Stacks.js Reference**: https://stacks.js.org/
- **Reown/WalletConnect**: https://docs.reown.com/
- **Leather Wallet**: https://leather.io/
- **Xverse Wallet**: https://www.xverse.app/
- **Stacks Explorer**: https://explorer.hiro.so/

---

## Support

For issues or questions:

1. Check this guide
2. Review the examples
3. Check browser console for error messages
4. Visit Stacks Discord: https://discord.gg/stacks

---

**Built with ❤️ using @stacks/connect v8+, WalletConnect, and Reown**
