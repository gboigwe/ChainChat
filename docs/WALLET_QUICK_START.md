# Wallet Integration Quick Start Guide

Get up and running with WalletConnect and Reown in ChainChat within 5 minutes.

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Reown Project ID

1. Visit [cloud.reown.com](https://cloud.reown.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### Step 2: Configure Environment

Create or update your `.env` file:

```env
# Paste your Project ID here
VITE_WALLETCONNECT_PROJECT_ID=abc123def456...

# Choose network
VITE_NETWORK=mainnet  # or testnet
```

### Step 3: Start Using!

```jsx
import { useWallet } from './hooks/useWallet';

function App() {
  const { connect, isConnected, address } = useWallet();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

That's it! You're ready to go. 🎉

---

## 📚 Implementation Methods

Choose the method that best fits your needs:

### Method 1: useWallet Hook (Easiest)

Perfect for React components. Handles all state management automatically.

```javascript
import { useWallet } from './hooks/useWallet';

const {
  connect,                  // Auto-detect wallet
  connectViaWalletConnect,  // WalletConnect modal (600+ wallets)
  disconnect,               // Disconnect wallet
  isConnected,              // Connection status
  address,                  // User's address
  error,                    // Error messages
} = useWallet();
```

### Method 2: Wallet Utilities (Flexible)

For vanilla JavaScript or when you need more control.

```javascript
import {
  connectWallet,
  connectWithWalletConnect,
  disconnectWallet,
  getWalletData,
} from './utils/wallet';

// Connect
const data = await connectWallet();
console.log('Connected:', data.address);

// Get current data
const walletData = getWalletData();

// Disconnect
disconnectWallet();
```

### Method 3: WalletConnect Client (Advanced)

Direct WalletConnect integration for advanced features.

```javascript
import { walletConnectClient } from './utils/walletConnectClient';

// Initialize
await walletConnectClient.initialize();

// Connect with QR code
const { address } = await walletConnectClient.connect();

// Sign message
const sig = await walletConnectClient.signMessage('Hello');

// Contract call
const tx = await walletConnectClient.contractCall({
  contractAddress: 'SP...',
  contractName: 'my-contract',
  functionName: 'my-function',
  functionArgs: [],
});
```

### Method 4: Reown AppKit (Modern UI)

Modern wallet modal with built-in UI components.

```javascript
import { reownAppKit } from './utils/reownAppKit';

// Connect with sleek UI
const { address } = await reownAppKit.connect();

// Transfer STX
await reownAppKit.transferSTX('ST1234...', 1000000n);
```

---

## 🔧 Common Use Cases

### Connect Wallet Button

```jsx
function ConnectButton() {
  const { connect, isConnecting, error } = useWallet();

  return (
    <div>
      <button onClick={connect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Show Connected Wallet

```jsx
function WalletInfo() {
  const { isConnected, address, formatAddress, disconnect } = useWallet();

  if (!isConnected) return null;

  return (
    <div>
      <span>{formatAddress(address)}</span>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### Contract Interaction

```javascript
import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { getNetwork } from './utils/wallet';

async function depositToVault(amount) {
  await openContractCall({
    contractAddress: 'SP...',
    contractName: 'strategy-vault',
    functionName: 'deposit',
    functionArgs: [uintCV(amount)],
    network: getNetwork(),
    onFinish: (data) => {
      console.log('TX:', data.txId);
    },
  });
}
```

### Auto-Reconnect on Page Load

```javascript
useEffect(() => {
  const walletData = reconnectWallet();
  if (walletData) {
    console.log('Reconnected!', walletData.address);
  }
}, []);
```

---

## 🎯 Supported Wallets

| Wallet | Type | Platform | Support Level |
|--------|------|----------|---------------|
| **Leather (Hiro)** | Browser Extension | Chrome, Firefox | ✅ Full Support |
| **Xverse** | Mobile & Desktop | iOS, Android, Chrome | ✅ Full Support |
| **Asigna** | Multi-Sig | Web | ✅ Full Support |
| **600+ Others** | WalletConnect | Various | ✅ Via WalletConnect |

---

## 🔒 Security Best Practices

1. ✅ **Never store private keys** - Always use wallet signing
2. ✅ **Use post-conditions** - Protect users from unexpected changes
3. ✅ **Validate addresses** - Check contract addresses before calling
4. ✅ **Handle errors** - Always wrap wallet calls in try/catch
5. ✅ **Check expiry** - Sessions expire after 24 hours

---

## 🐛 Troubleshooting

### "WalletConnect Project ID not configured"

**Fix:** Add `VITE_WALLETCONNECT_PROJECT_ID` to your `.env` file.

### "User cancelled authentication"

**Fix:** Normal behavior when user closes modal. Allow retry.

### Connection expired

**Fix:** Call `reconnectWallet()` or prompt user to connect again.

### Wallet doesn't appear

**Fix:** Ensure wallet supports Stacks and WalletConnect v2.

---

## 📖 Full Documentation

For complete API reference and advanced features, see:
- [Full Wallet Integration Guide](./WALLET_INTEGRATION.md)
- [TypeScript Types](../src/types/wallet.ts)
- [Example Components](../src/components/WalletConnect.jsx)

---

## 🆘 Need Help?

- **Documentation:** [docs.stacks.co/stacks-connect](https://docs.stacks.co/stacks-connect)
- **Discord:** [Stacks Community](https://discord.gg/stacks)
- **Issues:** [GitHub Issues](https://github.com/gboigwe/ChainChat/issues)

---

## 🎓 Next Steps

1. ✅ Connect your wallet
2. ⚡ Try the DeFi strategies
3. 📝 Read the [full documentation](./WALLET_INTEGRATION.md)
4. 🔧 Customize the integration for your needs
5. 🚀 Build amazing dApps!

---

**Happy Building!** 🎉
