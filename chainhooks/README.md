# Chainhooks Configuration for ChainChat

This directory contains Chainhook configurations to monitor events from deployed ChainChat contracts on Stacks mainnet.

## What are Chainhooks?

Chainhooks allow you to listen to on-chain events and trigger webhooks when specific contract events occur. This is useful for:
- Building event-driven applications
- Indexing blockchain data
- Triggering notifications
- Automating responses to on-chain activity

## Available Chainhooks

1. **vault-events.json** - Monitors vault creation events
2. **staking-events.json** - Monitors token staking events
3. **rewards-events.json** - Monitors reward claim events
4. **emergency-events.json** - Monitors emergency activation events
5. **liquidation-events.json** - Monitors liquidation events

## Installation

### 1. Install Chainhook CLI

```bash
# Using Cargo
cargo install chainhook

# Or download from releases
# https://github.com/hirosystems/chainhook/releases
```

### 2. Configure Chainhook

Create a `Chainhook.toml` configuration file:

```toml
[storage]
working_dir = "chainhooks"

[http_api]
http_port = 20456
database_uri = "redis://localhost:6379/"

[network]
mode = "mainnet"
bitcoind_rpc_url = "http://localhost:8332"
bitcoind_rpc_username = "bitcoin"
bitcoind_rpc_password = "bitcoin"
stacks_node_rpc_url = "https://api.hiro.so"

[limits]
max_number_of_bitcoin_predicates = 100
max_number_of_concurrent_bitcoin_scans = 100
max_number_of_stacks_predicates = 10
max_number_of_concurrent_stacks_scans = 10
max_number_of_processing_threads = 16
max_number_of_networking_threads = 16
max_caching_memory_size_mb = 32000

[logs]
chainhook_internals = true
```

### 3. Start Chainhook Service

```bash
# Start the Chainhook service
chainhook service start --config-path=Chainhook.toml
```

### 4. Register Chainhooks

```bash
# Register vault events hook
chainhook predicates scan chainhooks/vault-events.json --config-path=Chainhook.toml

# Register staking events hook
chainhook predicates scan chainhooks/staking-events.json --config-path=Chainhook.toml

# Register rewards events hook
chainhook predicates scan chainhooks/rewards-events.json --config-path=Chainhook.toml

# Register emergency events hook
chainhook predicates scan chainhooks/emergency-events.json --config-path=Chainhook.toml

# Register liquidation events hook
chainhook predicates scan chainhooks/liquidation-events.json --config-path=Chainhook.toml
```

### 5. List Active Chainhooks

```bash
chainhook predicates list --config-path=Chainhook.toml
```

## Webhook Endpoint Setup

Your webhook endpoints should handle POST requests with the following structure:

```typescript
interface ChainhookPayload {
  apply: Array<{
    block_identifier: {
      hash: string;
      index: number;
    };
    parent_block_identifier: {
      hash: string;
      index: number;
    };
    timestamp: number;
    transactions: Array<{
      transaction_identifier: {
        hash: string;
      };
      operations: any[];
      metadata: {
        success: boolean;
        result: string;
        events: Array<{
          type: string;
          data: any;
        }>;
      };
    }>;
    metadata: any;
  }>;
  rollback: Array<any>;
  chainhook: {
    uuid: string;
    predicate: any;
  };
}
```

### Example Webhook Handler (Node.js/Express)

```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/vault-created', (req, res) => {
  const payload = req.body as ChainhookPayload;

  console.log('Vault created event:', payload);

  // Process the event
  payload.apply.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.metadata.success) {
        tx.metadata.events.forEach(event => {
          if (event.type === 'print_event') {
            console.log('Event data:', event.data);
            // Handle vault creation
          }
        });
      }
    });
  });

  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

## Customization

To modify the chainhooks:

1. Edit the JSON files to change:
   - `contract_identifier`: Target different contracts
   - `contains`: Match different event types
   - `url`: Point to your webhook endpoint
   - `authorization_header`: Add your API key

2. Re-register the chainhook:
   ```bash
   chainhook predicates scan chainhooks/your-hook.json --config-path=Chainhook.toml
   ```

## Monitoring Events

You can monitor specific events from your contracts:

- **Vault Events**: `vault-created`, `vault-deactivated`
- **Staking Events**: `tokens-staked`, `tokens-unstaked`, `lock-extended`
- **Rewards Events**: `rewards-claimed`, `pool-created`, `pool-ended`
- **Emergency Events**: `emergency-activated`, `emergency-deactivated`, `vault-paused`, `vault-resumed`
- **Liquidation Events**: `position-liquidated`, `liquidation-queued`

## Troubleshooting

### Chainhook not triggering

1. Check if the service is running:
   ```bash
   curl http://localhost:20456/ping
   ```

2. Verify the chainhook is registered:
   ```bash
   chainhook predicates list --config-path=Chainhook.toml
   ```

3. Check logs for errors:
   ```bash
   tail -f chainhooks/chainhook.log
   ```

### Webhook endpoint not receiving events

1. Verify your endpoint is accessible
2. Check the authorization header is correct
3. Ensure your server can receive POST requests
4. Check firewall/network settings

## Resources

- [Chainhook Documentation](https://github.com/hirosystems/chainhook)
- [Stacks API Documentation](https://docs.hiro.so/api)
- [ChainChat Contract Repository](https://github.com/gboigwe/ChainChat)
