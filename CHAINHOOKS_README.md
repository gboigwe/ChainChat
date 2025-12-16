# Chainhooks Integration Guide - ChainChat

This document explains the Chainhooks integration for ChainChat, enabling real-time blockchain event notifications for DeFi strategy execution.

## 📋 Overview

ChainChat uses **Hiro Chainhooks** to receive real-time notifications when smart contract events occur on the Stacks blockchain. This eliminates the need for constant polling and enables instant user notifications for strategy execution.

### What Are Chainhooks?

Chainhooks are reorg-aware webhook services that monitor blockchain activity and send HTTP POST requests to your endpoint when specific events occur.

**Key Benefits:**
- ✅ Real-time event delivery (no polling needed)
- ✅ Automatic blockchain reorganization handling
- ✅ Reduced API calls and rate limiting
- ✅ Event-driven architecture (IFTTT logic)
- ✅ Lightweight (only indexes what you need)

---

## 🏗️ Architecture

```
Stacks Blockchain
      ↓
Contract Event Occurs (e.g., deposit, start-strategy)
      ↓
Chainhook Service (Hiro Platform)
      ↓
HTTP POST to Webhook URL
      ↓
Express Server (/api/webhooks/chainhook)
      ↓
Event Processing & In-Memory Storage
      ↓
Frontend Polls /api/events/recent
      ↓
Real-time UI Updates
```

---

## 📁 File Structure

```
ChainChat/
├── chainhooks/                    # Chainhook configurations
│   ├── 1-strategy-vault.json     # Vault contract events
│   └── 2-strategy-engine.json    # Engine contract events
│
├── server/
│   └── index.js                   # Express webhook server
│
├── scripts/
│   └── register-chainhooks.js    # Registration utility
│
├── src/
│   ├── hooks/
│   │   └── useChainhookEvents.js # React hook for events
│   └── components/
│       └── RealtimeActivityFeed.jsx # Activity feed component
│
└── .env.example                   # Environment variables template
```

---

## 🔧 Setup Instructions

### Step 1: Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update your `.env` file with:

```env
# Hiro Platform API Key (from https://platform.hiro.so)
HIRO_API_KEY=71b40c8f84889a88cbcf2fc6b8393723

# Webhook Secret (for authentication)
CHAINHOOK_WEBHOOK_SECRET=chainchat_webhook_secret_2025_xyz

# Webhook Server Port
PORT=3001
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Servers

```bash
# Start both frontend and webhook server
npm run dev:all

# Or run them separately:
# Terminal 1: Frontend
npm run dev

# Terminal 2: Webhook Server
npm run server
```

Your servers will run at:
- Frontend: `http://localhost:3000`
- Webhook Server: `http://localhost:3001`

### Step 4: Expose Webhook Endpoint (Development)

Since Chainhooks need a publicly accessible URL, use **ngrok** for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose your webhook server
ngrok http 3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Step 5: Update Chainhook Configurations

Update both files in `chainhooks/` directory, replacing the URL:

**chainhooks/1-strategy-vault.json:**
```json
{
  "then_that": {
    "http_post": {
      "url": "https://YOUR-NGROK-URL.ngrok.io/api/webhooks/chainhook",
      "authorization_header": "Bearer chainchat_webhook_secret_2025_xyz"
    }
  }
}
```

**chainhooks/2-strategy-engine.json:**
```json
{
  "then_that": {
    "http_post": {
      "url": "https://YOUR-NGROK-URL.ngrok.io/api/webhooks/chainhook",
      "authorization_header": "Bearer chainchat_webhook_secret_2025_xyz"
    }
  }
}
```

### Step 6: Register Chainhooks

```bash
node scripts/register-chainhooks.js
```

This will register both Chainhooks with the Hiro Platform.

---

## 🎯 Registered Chainhooks

| # | Contract | Events Monitored |
|---|----------|------------------|
| 1 | strategy-vault | `deposit`, `withdraw`, `allocate-funds`, `return-funds`, `emergency-withdraw` |
| 2 | strategy-engine | `start-strategy`, `stop-strategy`, `set-risk-level` |

---

## 📡 API Endpoints

### POST /api/webhooks/chainhook

**Description**: Receives webhook POST requests from Chainhook service

**Authentication**: Bearer token (CHAINHOOK_WEBHOOK_SECRET)

**Request Body**: Chainhook payload with apply/rollback blocks

**Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "processed": {
    "apply": 1,
    "rollback": 0
  }
}
```

### GET /api/events/recent?limit=50

**Description**: Fetches recent blockchain events for frontend

**Query Parameters**:
- `limit` (optional): Number of events to return (default: 50)

**Response**:
```json
{
  "success": true,
  "events": [
    {
      "type": "print_event",
      "txHash": "0x123...",
      "sender": "SP3BX...",
      "blockHeight": 150523,
      "timestamp": 1711553905,
      "success": true,
      "topic": "deposit",
      "value": {...},
      "receivedAt": 1735689123456
    }
  ],
  "count": 10,
  "timestamp": 1735689123456
}
```

### GET /api/health

**Description**: Health check endpoint for webhook server

**Response**:
```json
{
  "status": "ok",
  "service": "ChainChat Chainhooks Server",
  "uptime": 3600,
  "eventsStored": 25
}
```

---

## 🧪 Testing

### Test Webhook Locally

1. **Make a test transaction** on the blockchain (e.g., deposit STX)
2. **Watch the webhook server console**
3. **Check for webhook logs**:
   ```
   ========== CHAINHOOK WEBHOOK RECEIVED ==========
   Chainhook UUID: abc-123-def
   Timestamp: 2025-12-16T23:30:00.000Z

   📥 APPLY: 1 block(s)

   Block #150523
     Hash: 0xabc123...
     Transactions: 1

     📄 Transaction: 0x456def...
        Sender: SP3BXJENEWVNCFYGJF75DFS478H1BZJXNZPT84EAD
        Success: true
        Events: 1
        🔔 Event Type: print_event
           Topic: deposit
   ```

4. **Query recent events**:
   ```bash
   curl http://localhost:3001/api/events/recent?limit=10
   ```

### Manage Chainhooks

```bash
# List all registered chainhooks
node scripts/register-chainhooks.js list

# Delete a specific chainhook
node scripts/register-chainhooks.js delete <uuid>

# Re-register all chainhooks
node scripts/register-chainhooks.js
```

---

## 🚀 Production Deployment

### Step 1: Deploy to Vercel/Netlify

For the **frontend**:
```bash
npm run build
# Deploy the dist/ folder
```

For the **webhook server**, deploy to a service that supports Node.js servers:
- Render
- Railway
- Heroku
- AWS EC2/Lambda

### Step 2: Update Chainhook URLs

Update both `chainhooks/*.json` files with your production webhook URL:

```json
{
  "then_that": {
    "http_post": {
      "url": "https://your-server.com/api/webhooks/chainhook",
      "authorization_header": "Bearer chainchat_webhook_secret_2025_xyz"
    }
  }
}
```

### Step 3: Update Environment Variables

Set these in your production environment:
- `HIRO_API_KEY`
- `CHAINHOOK_WEBHOOK_SECRET`
- `PORT`

### Step 4: Re-register Chainhooks

```bash
HIRO_API_KEY=your_key node scripts/register-chainhooks.js
```

---

## 🔐 Security Best Practices

1. **Rotate webhook secret regularly** (every 90 days)
2. **Use HTTPS only** for webhook endpoints
3. **Validate authorization header** on every request
4. **Implement rate limiting** on webhook endpoint
5. **Log all webhook deliveries** for audit trail
6. **Handle reorg events properly** to avoid data inconsistencies

---

## 🐛 Troubleshooting

### Webhooks not arriving

**Check**:
1. Ngrok/production URL is accessible
2. Authorization header matches env secret
3. Chainhooks are enabled (check Platform UI)
4. Network is correct (testnet vs mainnet)
5. Contract addresses match deployed contracts

**Debug**:
```bash
# Test webhook endpoint manually
curl -X POST http://localhost:3001/api/webhooks/chainhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer chainchat_webhook_secret_2025_xyz" \
  -d '{"apply":[],"rollback":[],"chainhook":{"uuid":"test"}}'
```

### Events not showing in frontend

**Check**:
1. `/api/events/recent` endpoint returns data
2. Events are being stored in memory (check server logs)
3. Frontend is polling the correct server URL
4. CORS is configured properly

**Debug**:
```bash
curl http://localhost:3001/api/events/recent
curl http://localhost:3001/api/health
```

---

## 📚 Resources

- **Hiro Chainhooks Docs**: https://docs.hiro.so/stacks/chainhook
- **Platform Dashboard**: https://platform.hiro.so
- **API Reference**: https://docs.hiro.so/stacks/platform-api
- **Discord Support**: #chainhooks channel on Stacks Discord

---

## 🎯 Usage in ChainChat

### Add to Your Dashboard

Import and use the RealtimeActivityFeed component:

```jsx
import { RealtimeActivityFeed } from './components/RealtimeActivityFeed';

function Dashboard() {
  return (
    <div>
      <h1>ChainChat Dashboard</h1>

      {/* Real-time activity feed */}
      <RealtimeActivityFeed
        limit={10}
        showNotifications={true}
        serverUrl="http://localhost:3001"
      />
    </div>
  );
}
```

### Use the Hook Directly

```jsx
import { useChainhookEvents, getEventDescription } from './hooks/useChainhookEvents';

function CustomComponent() {
  const { events, isLoading, error } = useChainhookEvents({
    limit: 20,
    pollInterval: 3000, // 3 seconds
    serverUrl: 'http://localhost:3001',
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {events.map(event => (
        <li key={event.txHash}>
          {getEventDescription(event)}
        </li>
      ))}
    </ul>
  );
}
```

---

## 📝 Notes

- **In-Memory Storage**: Current implementation stores events in memory (max 100). For production, consider using a database (PostgreSQL, MongoDB, Redis).
- **Reorg Handling**: The webhook receiver automatically handles blockchain reorganizations by filtering out rolled-back events.
- **Rate Limiting**: Consider implementing rate limiting if you expect high transaction volume.
- **Beta Status**: Chainhooks 2.0 is in beta. Report issues to beta@hiro.so

---

**Last Updated**: December 16, 2025
**Version**: 1.0.0
**Author**: ChainChat Team
