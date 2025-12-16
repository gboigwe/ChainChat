/**
 * Chainhooks Webhook Server for ChainChat
 * Simple Express server to receive blockchain event webhooks
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for recent events (max 100)
const recentEvents = [];
const MAX_EVENTS = 100;

// Helper function to add event
function addEvent(event) {
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.pop();
  }
}

// Helper function to remove events from specific block (for reorgs)
function removeEventsFromBlock(blockHeight) {
  const index = recentEvents.findIndex(e => e.blockHeight === blockHeight);
  if (index !== -1) {
    recentEvents.splice(index, recentEvents.length - index);
  }
}

/**
 * Webhook receiver endpoint
 * POST /api/webhooks/chainhook
 */
app.post('/api/webhooks/chainhook', (req, res) => {
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CHAINHOOK_WEBHOOK_SECRET}`;

  // Verify webhook secret
  if (authHeader !== expectedAuth) {
    console.error('❌ Unauthorized webhook request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = req.body;
  const chainhookUuid = payload.chainhook?.uuid || 'unknown';
  const timestamp = new Date().toISOString();

  console.log('\n========== CHAINHOOK WEBHOOK RECEIVED ==========');
  console.log(`Chainhook UUID: ${chainhookUuid}`);
  console.log(`Timestamp: ${timestamp}`);

  let applyCount = 0;
  let rollbackCount = 0;

  // Process apply events (new blocks/transactions)
  if (payload.apply && payload.apply.length > 0) {
    console.log(`\n📥 APPLY: ${payload.apply.length} block(s)`);

    for (const block of payload.apply) {
      console.log(`\n  Block #${block.block_identifier.index}`);
      console.log(`    Hash: ${block.block_identifier.hash}`);
      console.log(`    Transactions: ${block.transactions.length}`);

      for (const tx of block.transactions) {
        console.log(`\n    📄 Transaction: ${tx.transaction_identifier.hash}`);
        console.log(`       Sender: ${tx.metadata.sender}`);
        console.log(`       Success: ${tx.metadata.success}`);

        if (tx.metadata.receipt?.events) {
          console.log(`       Events: ${tx.metadata.receipt.events.length}`);

          for (const event of tx.metadata.receipt.events) {
            console.log(`       🔔 Event Type: ${event.type}`);

            const eventData = {
              type: event.type,
              txHash: tx.transaction_identifier.hash,
              sender: tx.metadata.sender,
              blockHeight: block.block_identifier.index,
              timestamp: block.timestamp,
              success: tx.metadata.success,
              receivedAt: Date.now(),
            };

            // Extract print_event data
            if (event.type === 'print_event' && event.data?.value) {
              try {
                const printData = event.data.value;
                if (printData.event) {
                  eventData.topic = printData.event.value || printData.event;
                  console.log(`          Topic: ${eventData.topic}`);
                }
                eventData.value = printData;
              } catch (err) {
                console.error('Error parsing print event:', err);
              }
            }

            // Extract STX transfer data
            if (event.type === 'stx_transfer_event') {
              eventData.amount = event.data?.amount;
              eventData.recipient = event.data?.recipient;
              console.log(`          Amount: ${eventData.amount}`);
            }

            // Add to memory
            addEvent(eventData);
            applyCount++;
          }
        }
      }
    }
  }

  // Process rollback events (blockchain reorganization)
  if (payload.rollback && payload.rollback.length > 0) {
    console.log(`\n⏪ ROLLBACK: ${payload.rollback.length} block(s)`);

    for (const block of payload.rollback) {
      const blockHeight = block.block_identifier.index;
      console.log(`  Removing Block #${blockHeight}`);
      removeEventsFromBlock(blockHeight);
      rollbackCount++;
    }
  }

  console.log('\n===============================================\n');

  res.status(200).json({
    success: true,
    message: 'Webhook processed successfully',
    processed: {
      apply: applyCount,
      rollback: rollbackCount,
    },
  });
});

/**
 * Recent events endpoint for frontend polling
 * GET /api/events/recent?limit=50
 */
app.get('/api/events/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const events = recentEvents.slice(0, limit);

  res.status(200).json({
    success: true,
    events,
    count: events.length,
    timestamp: Date.now(),
  });
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ChainChat Chainhooks Server',
    uptime: process.uptime(),
    eventsStored: recentEvents.length,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   ChainChat Chainhooks Webhook Server     ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhooks/chainhook`);
  console.log(`📊 Events endpoint: http://localhost:${PORT}/api/events/recent`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
  console.log('Waiting for blockchain events...\n');
});

export default app;
