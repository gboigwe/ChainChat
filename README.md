# ChainChat AN AI DeFi Strategy Engine

## 🎯 What This Does
Control DeFi strategies on Stacks using simple English commands like "start safe strategy" or "exit all positions".

## 💡 The Problem
DeFi is complicated. Users need to:
- Understand multiple protocols
- Monitor positions constantly
- Make complex decisions about when to enter/exit
- Manage risk manually

## ✨ The Solution
Type simple commands and let the system handle the complexity:
- `"start safe strategy"` → Automatically starts low-risk yield farming
- `"exit all positions"` → Closes everything safely
- `"set risk high"` → Switches to higher-yield strategies
- `"show portfolio"` → Displays current positions and performance

## 🏗️ How It Works

### 1. Smart Contracts (Clarity)
- **strategy-vault.clar**: Safely holds your STX
- **strategy-engine.clar**: Executes strategies based on commands
- **alex-connector.clar**: Connects to ALEX DeFi protocol

### 2. AI Command Parser
Converts English to strategy actions:
```
"start safe strategy" → strategy_id: 1, risk: low, protocol: alex
"exit everything" → action: close_all_positions
```

### 3. Simple Frontend
- Command input box (type what you want)
- Portfolio dashboard (see your positions)
- Performance tracking (see how you're doing)

## 🚀 Supported Commands (MVP)

### Strategy Commands
- `"start safe strategy"` - Low-risk ALEX yield farming
- `"start growth strategy"` - Higher-yield ALEX strategies  
- `"exit all positions"` - Close all strategies safely

### Risk Management
- `"set risk low"` - Conservative approach
- `"set risk medium"` - Balanced approach
- `"set risk high"` - Aggressive approach

### Information
- `"show portfolio"` - Current positions and balance
- `"show performance"` - Strategy performance metrics

## 🔒 Safety Features
- **Maximum Position Limits**: Can't risk more than you set
- **Stop Loss**: Automatically exits if losses exceed threshold
- **Emergency Stop**: Pause everything with one command
- **Secure Vault**: Your funds stay in your control

## 💰 How It Makes Money
- Earns yield through ALEX DeFi protocols
- Automatically compounds returns
- Manages risk to protect your principal
- Saves time by automating strategy execution

## 🎮 Getting Started

### 1. Prerequisites
- Node.js 18+ and npm installed
- A Reown (WalletConnect) Project ID from [cloud.reown.com](https://cloud.reown.com/)
- A Stacks wallet (Xverse, Leather, or any WalletConnect-compatible wallet)

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/gboigwe/ChainChat.git
cd ChainChat

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your VITE_WALLETCONNECT_PROJECT_ID
```

### 3. Configure Reown (WalletConnect)

Create a `.env` file with your Reown Project ID:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_from_reown
VITE_NETWORK=testnet
```

Get your Project ID:
1. Visit [https://cloud.reown.com/](https://cloud.reown.com/)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env` file

### 4. Run the Application

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 5. Connect Your Wallet

The app will open at `http://localhost:3000`. You can connect using:
- **WalletConnect (Recommended)**: Access 600+ wallets including mobile wallets
- **Auto-Detect**: Browser extension wallets like Leather (Hiro Wallet)

### 6. Using the Dashboard

Once connected:
1. **Deposit STX** to the strategy vault
2. **Select a strategy** command from the dropdown
3. **Execute commands** like:
   - "start safe strategy" - Low-risk yield farming
   - "start growth strategy" - Higher-yield strategies
   - "exit all positions" - Close all strategies
4. **Monitor** your active strategies and balance

## 🛠️ Technical Stack
- **Smart Contracts**: Clarity (Stacks blockchain)
- **Frontend**: React + Vite
- **Wallet Connection**: Reown (WalletConnect) - 600+ wallets supported
- **Stacks Integration**: @stacks/connect, @stacks/transactions
- **Protocol Integration**: ALEX DeFi
- **Real-Time Events**: Hiro Chainhooks for blockchain event notifications
- **Backend**: Express.js webhook server
- **AI**: Rule-based command parsing (simple but effective)

## 🔗 Reown (WalletConnect) Integration

ChainChat uses **Reown** (formerly WalletConnect) to provide seamless wallet connectivity:

### Features
- ✅ **600+ Wallet Support**: Connect from desktop, mobile, and hardware wallets
- ✅ **Multi-Platform**: Works on web, mobile browsers, and dApps
- ✅ **Secure**: Industry-standard wallet connection protocol
- ✅ **User-Friendly**: QR code scanning for mobile wallets

### Supported Wallets
- **Xverse** (Stacks native, WalletConnect enabled)
- **Leather** (Hiro Wallet)
- **Asigna**
- **600+ more** via WalletConnect protocol

### Integration Details

The integration uses `@stacks/connect` with the `walletConnectProjectId` parameter:

```javascript
import { showConnect } from '@stacks/connect';

await showConnect({
  appDetails: {
    name: 'ChainChat',
    icon: window.location.origin + '/logo.png',
  },
  // Reown (WalletConnect) integration
  walletConnectProjectId: 'YOUR_PROJECT_ID',
  onFinish: () => {
    // Handle successful connection
  },
});
```

### Key Files
- `src/utils/wallet.js` - Wallet connection utilities with Reown support
- `src/hooks/useWallet.js` - React hook for wallet state management
- `src/components/WalletConnect.jsx` - Wallet connection UI

### Announcement
In November 2025, **WalletConnect and Stacks Foundation announced expanded support** for the Stacks ecosystem, making it easier than ever to integrate wallet connectivity and access Bitcoin DeFi features.

## 📡 Real-Time Event System (Chainhooks)

ChainChat integrates **Hiro Chainhooks** for real-time blockchain event notifications, enabling instant updates when strategies are executed or vault transactions occur.

### What are Chainhooks?

Chainhooks are reorg-aware webhook services that monitor blockchain activity and send HTTP POST requests when specific events occur.

**Benefits:**
- ✅ Real-time event delivery (no polling)
- ✅ Automatic blockchain reorganization handling
- ✅ Reduced API calls and rate limiting
- ✅ Event-driven architecture
- ✅ Lightweight data indexing

### Monitored Events

The system monitors both smart contracts:

1. **strategy-vault**: Deposit, withdraw, fund allocation, emergency withdrawals
2. **strategy-engine**: Strategy execution, risk level changes

### Architecture

```
Blockchain Event → Chainhook → Webhook → Express Server → Frontend (Real-time)
```

### Setup

1. Add Hiro API key to `.env`:
```env
HIRO_API_KEY=your_api_key_here
CHAINHOOK_WEBHOOK_SECRET=your_secret_here
PORT=3001
```

2. Start both servers:
```bash
npm run dev:all
```

3. Register Chainhooks:
```bash
node scripts/register-chainhooks.js
```

4. View live events using the `RealtimeActivityFeed` component

For detailed documentation, see `CHAINHOOKS_README.md`

## 📊 MVP Strategy Options

### Safe Strategy (Target: 5-8% APY)
- ALEX liquidity provision for stable pairs
- Low impermanent loss risk
- Conservative position sizing

### Growth Strategy (Target: 10-15% APY)
- ALEX yield farming with higher rewards
- Moderate risk tolerance
- Dynamic position adjustment

### Custom Strategy
- Set your own parameters
- Choose risk level
- Define exit conditions

## 🔮 Why This Project Matters

### For Users:
- Makes DeFi accessible to everyone
- Reduces complexity to simple commands
- Automates tedious strategy management
- Provides professional-level risk management

### For Stacks:
- Increases TVL through automated strategies
- Attracts users who find DeFi too complex
- Showcases Bitcoin DeFi capabilities
- Creates sticky user engagement

### For Code for Stacks:
- Meaningful integration with Stacks ecosystem
- Cannot work without Stacks/ALEX protocols
- Drives actual usage and TVL growth
- Demonstrates innovation in DeFi UX

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/gboigwe/ChainChat
cd ChainChat

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your Reown Project ID to .env

# Run development server
npm run dev

# Build for production
npm run build
```

## 📱 Available Strategy Commands

Once your wallet is connected via Reown:

1. **Deposit funds** to the vault
2. **Execute strategy commands**:
   - "start safe strategy" - 5-8% APY, low risk
   - "start growth strategy" - 10-15% APY, moderate risk
   - "exit all positions" - Close all active strategies
   - "set risk low/medium/high" - Adjust risk tolerance
3. **Monitor** your portfolio in real-time

## 📈 Success Metrics
- **Functionality**: Strategies execute and generate yield
- **Usability**: Non-DeFi users can operate it
- **Safety**: No major losses from bugs or exploits
- **Performance**: Competitive yields vs manual strategies

---

**Built for Code for Stacks** - Leveraging Stacks' Bitcoin security and ALEX DeFi ecosystem to make sophisticated strategies accessible through natural language
