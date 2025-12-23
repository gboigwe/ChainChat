# ChainChat Wallet Integration Guide

Comprehensive guide for WalletConnect and Reown integration in the ChainChat project.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Implementation Methods](#implementation-methods)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

ChainChat integrates **Reown (formerly WalletConnect)** to provide seamless wallet connectivity for the Stacks blockchain. This integration supports **600+ wallets** including:

- **Leather (Hiro Wallet)** - Official Hiro wallet for Stacks
- **Xverse** - Bitcoin & Stacks wallet
- **Asigna** - Multi-signature wallet for teams
- **600+ other wallets** via WalletConnect protocol

### Key Features

✅ Multiple integration methods (@stacks/connect + Direct WalletConnect + Reown AppKit)
✅ Auto-reconnection on page load
✅ Session persistence (24-hour expiry)
✅ Event-driven architecture
✅ TypeScript support
✅ Enhanced error handling
✅ Connection state management
✅ Network switching (Mainnet/Testnet)

---

## Getting Started

### Prerequisites

1. **Node.js** 18+ installed
2. **Reown Project ID** from [cloud.reown.com](https://cloud.reown.com/)
3. **Stacks wallet** (Leather, Xverse, etc.)

### Installation

Dependencies are already installed in the project:

```bash
# Core Stacks libraries
@stacks/connect@8.2.2
@stacks/transactions@6.12.0
@stacks/network@7.3.1

# WalletConnect libraries
@walletconnect/sign-client@latest
@walletconnect/qrcode-modal@latest

# Reown AppKit
@reown/appkit@latest
@reown/appkit-core@latest
```

### Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Add your Reown Project ID:

```env
# Get from https://cloud.reown.com/
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Network (mainnet or testnet)
VITE_NETWORK=mainnet
```

---

## Implementation Methods

ChainChat provides **three different wallet integration approaches**:

### Method 1: @stacks/connect (Recommended)

Best for most use cases. Provides a familiar Stacks Connect experience with WalletConnect support.

**File**: `src/utils/wallet.js`

```javascript
import { connectWallet, connectWithWalletConnect } from '../utils/wallet';

// Auto-detect wallet (browser extensions first)
const walletData = await connectWallet();

// Force WalletConnect modal (600+ wallets)
const walletData = await connectWithWalletConnect();
```

### Method 2: Direct WalletConnect Client

For advanced use cases requiring direct control over WalletConnect sessions.

**File**: `src/utils/walletConnectClient.js`

```javascript
import { walletConnectClient } from '../utils/walletConnectClient';

// Initialize and connect
await walletConnectClient.initialize();
const { address, session } = await walletConnectClient.connect();

// Sign message
const signature = await walletConnectClient.signMessage('Hello World');

// Transfer STX
const tx = await walletConnectClient.transferSTX(
  'ST1234...',
  1000000n, // microSTX
  'memo'
);
```

### Method 3: Reown AppKit

Modern UI-first approach with built-in wallet modals (experimental for Stacks).

**File**: `src/utils/reownAppKit.js`

```javascript
import { reownAppKit } from '../utils/reownAppKit';

// Connect with modern UI
const { address } = await reownAppKit.connect();

// Contract call
const result = await reownAppKit.contractCall({
  contractAddress: 'SP1234...',
  contractName: 'my-contract',
  functionName: 'transfer',
  functionArgs: [...],
});
```

---

## Configuration

### Network Selection

Set the network in your `.env` file:

```env
# For production
VITE_NETWORK=mainnet

# For development
VITE_NETWORK=testnet
```

### Contract Addresses

Configure deployed contract addresses:

```env
# Mainnet contracts
VITE_VAULT_CONTRACT=SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.strategy-vaultx
VITE_ENGINE_CONTRACT=SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.strategy-enginex
```

### Connection Options

Customize wallet connection behavior:

```javascript
const walletData = await connectWallet({
  forceWalletSelect: true,      // Force wallet selection modal
  persistWalletSelect: true,    // Remember user's wallet choice
  enableOverrides: true,        // Enable compatibility fixes
  enableLocalStorage: true,     // Store address in localStorage
});
```

---

## Usage Examples

### Basic Wallet Connection (React)

```jsx
import { useWallet } from '../hooks/useWallet';

function MyComponent() {
  const {
    isConnected,
    address,
    connect,
    connectViaWalletConnect,
    disconnect,
  } = useWallet();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {formatAddress(address)}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={connect}>Auto-Detect Wallet</button>
      <button onClick={connectViaWalletConnect}>
        WalletConnect (600+ wallets)
      </button>
    </div>
  );
}
```

### Contract Interaction

```javascript
import { openContractCall } from '@stacks/connect';
import { userSession } from '../utils/wallet';
import {
  uintCV,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from '@stacks/transactions';

// Call vault deposit function
const depositSTX = async (amount) => {
  const postConditions = [
    makeStandardSTXPostCondition(
      userSession.loadUserData().profile.stxAddress.mainnet,
      FungibleConditionCode.Equal,
      amount
    ),
  ];

  await openContractCall({
    contractAddress: process.env.VITE_VAULT_CONTRACT.split('.')[0],
    contractName: process.env.VITE_VAULT_CONTRACT.split('.')[1],
    functionName: 'deposit',
    functionArgs: [uintCV(amount)],
    postConditions,
    network: getNetwork(),
    onFinish: (data) => {
      console.log('Transaction broadcast:', data.txId);
    },
  });
};
```

### Event Listeners

```javascript
// Listen for wallet connection events
window.addEventListener('chainchat:wallet:connected', (event) => {
  console.log('Wallet connected:', event.detail.address);
});

window.addEventListener('chainchat:wallet:disconnected', (event) => {
  console.log('Wallet disconnected:', event.detail.address);
});

window.addEventListener('chainchat:wallet:reconnected', (event) => {
  console.log('Wallet reconnected:', event.detail.address);
});
```

### Session Management

```javascript
import {
  reconnectWallet,
  isConnectionExpired,
  getWalletMetadata,
} from '../utils/wallet';

// Check for existing session on app load
useEffect(() => {
  if (!isConnectionExpired()) {
    const walletData = reconnectWallet();
    if (walletData) {
      console.log('Reconnected to:', walletData.address);
    }
  }
}, []);

// Get connection metadata
const metadata = getWalletMetadata();
console.log('Connected at:', metadata.connectedAt);
console.log('Connection type:', metadata.connectionType);
```

---

## API Reference

### Wallet Utilities (`src/utils/wallet.js`)

#### `connectWallet(options?): Promise<WalletData>`

Connect wallet using auto-detection (browser extensions first, then WalletConnect).

**Parameters:**
- `options` (optional): Connection options
  - `forceWalletSelect: boolean` - Force wallet selection modal
  - `persistWalletSelect: boolean` - Remember wallet choice
  - `enableOverrides: boolean` - Enable compatibility fixes
  - `enableLocalStorage: boolean` - Store address in localStorage

**Returns:** Promise resolving to wallet data

```javascript
const walletData = await connectWallet();
// {
//   address: 'SP1234...',
//   testnetAddress: 'ST1234...',
//   profile: {...},
//   connectionType: 'auto',
//   connectedAt: '2025-12-23T...',
//   network: 'mainnet'
// }
```

#### `connectWithWalletConnect(options?): Promise<WalletData>`

Connect explicitly via WalletConnect (shows modal with 600+ wallets).

#### `disconnectWallet(): boolean`

Disconnect current wallet session. Returns `true` if successful.

#### `getWalletData(): WalletData | null`

Get current wallet connection data.

#### `isWalletConnected(): boolean`

Check if wallet is currently connected.

#### `reconnectWallet(): WalletData | null`

Attempt to reconnect from existing session.

#### `isConnectionExpired(): boolean`

Check if connection is expired (24 hours).

#### `formatAddress(address, prefixLength?, suffixLength?): string`

Format address for display (e.g., "SP1234...ABCD").

#### `getSupportedWallets(): Array<SupportedWallet>`

Get list of supported wallet providers.

### useWallet Hook (`src/hooks/useWallet.js`)

React hook for wallet management.

**Returns:**

```typescript
{
  // State
  walletData: WalletData | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionType: ConnectionType;
  address: string | null;
  testnetAddress: string | null;
  network: string | null;
  connectedAt: string | null;
  lastActivity: Date | null;

  // Actions
  connect: (options?) => Promise<WalletData>;
  connectViaWalletConnect: (options?) => Promise<WalletData>;
  disconnect: () => boolean;
  refresh: () => void;
  reconnect: () => WalletData | null;
  checkExpiry: () => boolean;
  clearError: () => void;

  // Utilities
  formatAddress: (address: string) => string;
}
```

### WalletConnect Client (`src/utils/walletConnectClient.js`)

Direct WalletConnect client for advanced use cases.

#### Methods:

- `initialize(): Promise<Client>` - Initialize WalletConnect client
- `connect(): Promise<{address, session, network}>` - Connect wallet with QR modal
- `disconnect(): Promise<boolean>` - Disconnect session
- `getAddress(): string | null` - Get current address
- `signMessage(message): Promise<Signature>` - Sign a message
- `transferSTX(recipient, amount, memo?): Promise<TxResult>` - Transfer STX
- `contractCall(params): Promise<TxResult>` - Call smart contract
- `deployContract(name, code): Promise<TxResult>` - Deploy contract
- `isConnected(): boolean` - Check connection status

### TypeScript Types (`src/types/wallet.ts`)

Complete type definitions for TypeScript projects.

```typescript
import {
  WalletData,
  ConnectionType,
  StacksNetwork,
  UseWalletReturn,
} from '../types/wallet';
```

---

## Best Practices

### 1. Early Initialization

Initialize WalletConnect as soon as possible:

```javascript
useEffect(() => {
  validateWalletConnectSetup();
  reconnectWallet(); // Try to reconnect from existing session
}, []);
```

### 2. Provider Compatibility

Always enable `enableOverrides` for compatibility across wallets:

```javascript
await connectWallet({ enableOverrides: true });
```

### 3. Error Handling

Handle all connection errors gracefully:

```javascript
try {
  await connectWallet();
} catch (error) {
  if (error.message.includes('cancelled')) {
    console.log('User cancelled connection');
  } else {
    console.error('Connection failed:', error);
    // Show error to user
  }
}
```

### 4. Post-Conditions

Always use post-conditions for STX transfers and token operations:

```javascript
import {
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from '@stacks/transactions';

const postConditions = [
  makeStandardSTXPostCondition(
    address,
    FungibleConditionCode.Equal,
    amount
  ),
];
```

### 5. BigInt Serialization

WalletConnect requires BigInt values to be serializable:

```javascript
// Already implemented in walletConnectClient.js
BigInt.prototype.toJSON = function () {
  return this.toString();
};
```

### 6. Session Validation

Check session validity before making requests:

```javascript
if (!isWalletConnected() || isConnectionExpired()) {
  await connectWallet();
}
```

### 7. Event-Driven Updates

Use custom events for app-wide state synchronization:

```javascript
window.addEventListener('chainchat:wallet:connected', handleConnect);
window.addEventListener('chainchat:wallet:disconnected', handleDisconnect);
```

---

## Troubleshooting

### Issue: "WalletConnect Project ID not configured"

**Solution:** Set `VITE_WALLETCONNECT_PROJECT_ID` in your `.env` file.

```env
VITE_WALLETCONNECT_PROJECT_ID=abc123def456...
```

Get your project ID from [cloud.reown.com](https://cloud.reown.com/)

### Issue: "User cancelled authentication"

**Cause:** User closed the wallet connection modal.

**Solution:** This is expected behavior. Allow users to retry connection.

### Issue: Connection expired after 24 hours

**Cause:** Security measure to prevent stale sessions.

**Solution:** Prompt user to reconnect:

```javascript
if (isConnectionExpired()) {
  // Show reconnection prompt
  await connectWallet();
}
```

### Issue: Wallet not appearing in modal

**Cause:** Wallet may not support Stacks or WalletConnect v2.

**Solution:** Use recommended wallets (Leather, Xverse) or file an issue with the wallet provider.

### Issue: Transaction fails silently

**Cause:** Missing post-conditions or incorrect function arguments.

**Solution:**
1. Add proper post-conditions
2. Validate function arguments match contract expectations
3. Check network configuration (mainnet vs testnet)

### Issue: QR Code modal doesn't close

**Cause:** Session approval timeout or network issues.

**Solution:**

```javascript
import QRCodeModal from '@walletconnect/qrcode-modal';

// Manually close modal
QRCodeModal.close();
```

### Debug Mode

Enable debug logging in development:

```javascript
// In walletConnectClient.js
logger: import.meta.env.DEV ? 'debug' : 'error'
```

---

## Additional Resources

- **Official Docs:**
  - [Stacks Connect](https://docs.stacks.co/stacks-connect)
  - [Reown Docs](https://docs.reown.com/)
  - [WalletConnect for Stacks](https://docs.xverse.app/wallet-connect)

- **Support:**
  - [ChainChat GitHub Issues](https://github.com/gboigwe/ChainChat/issues)
  - [Stacks Discord](https://discord.gg/stacks)
  - [Reown Community](https://discord.gg/reown)

- **Wallet Downloads:**
  - [Leather Wallet](https://leather.io/)
  - [Xverse Wallet](https://www.xverse.app/)
  - [Asigna](https://asigna.io/)

---

## Security Considerations

1. **Never expose private keys** - All signing happens in the user's wallet
2. **Validate all inputs** - Sanitize contract call parameters
3. **Use post-conditions** - Protect users from unexpected state changes
4. **Verify contract addresses** - Ensure you're calling the correct contracts
5. **Implement rate limiting** - Prevent spam transactions
6. **Monitor for suspicious activity** - Log all wallet interactions
7. **Keep dependencies updated** - Regularly update wallet libraries

---

## License

MIT License - See [LICENSE](../LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

**Version:** 2.0.0
**Last Updated:** December 23, 2025
**Maintainer:** ChainChat Team
