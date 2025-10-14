import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { run, RunState, setDefaultOpenAIKey, setTracingExportApiKey } from '@openai/agents';
import { triageAgent } from './agents/index.js';
import { 
  saveFeedbackSample, 
  saveApprovalState, 
  loadApprovalState, 
  listPendingApprovals 
} from './feedback/store.js';
import { ceoLearning } from './quality/ceo-approval-learning.js';
import { sentimentAnalyzer } from './quality/sentiment-analyzer.js';
import { autoEscalation } from './quality/auto-escalation.js';
import { conversationManager } from './context/conversation-manager.js';
import { webhookQueue } from './queue/webhook-queue.js';

// Initialize OpenAI
setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);
if (process.env.OPENAI_TRACING_API_KEY) {
  setTracingExportApiKey(process.env.OPENAI_TRACING_API_KEY);
}

const app = express();
app.use(bodyParser.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'agent-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Chatwoot webhook (subscribe at least to message_created).
 * We only respond to new incoming customer messages (not agent messages).
 * 
 * Task 2: Queue-based processing with replay protection
 */
app.post('/webhooks/chatwoot', async (req, res) => {
  try {
    const event = req.body;
    
    // Only handle message_created events
    if (event?.event !== 'message_created') {
      return res.json({ ignored: true, reason: 'Not a message_created event' });
    }

    const conversationId: number = event?.conversation?.id;
    const text: string | undefined = event?.content;
    const isIncoming: boolean = event?.message_type === 0 || event?.sender?.type === 'contact';
    
    if (!conversationId || !text || !isIncoming) {
      return res.json({ ignored: true, reason: 'Missing data or not incoming message' });
    }

    // Enqueue for processing (Task 2 - queue-based with replay protection)
    const queueItem = webhookQueue.enqueue(event);
    
    if (!queueItem) {
      // Already processed (replay protection)
      return res.json({ 
        success: true, 
        duplicate: true,
        message: 'Webhook already processed (idempotency)' 
      });
    }

    // Return immediately - processing happens in background
    res.json({
      success: true,
      queued: true,
      queueId: queueItem.id,
      conversationId,
    });

    // Process asynchronously (don't block webhook response)
    setImmediate(() => processWebhookItem(queueItem, text, conversationId));
    
  } catch (err: any) {
    console.error('[Webhook] Error:', err);
    return res.status(500).json({ error: err.message || 'webhook error' });
  }
});

/**
 * Process webhook item (async handler)
 */
async function processWebhookItem(queueItem: any, text: string, conversationId: number) {
  try {
    console.log(`[Webhook] Processing conversation ${conversationId}: "${text.substring(0, 50)}..."`);

    // Step 1: Analyze sentiment (Task 4)
    const sentiment = sentimentAnalyzer.analyze(text);
    sentimentAnalyzer.trackSentiment(conversationId, sentiment);
    
    // Step 2: Update conversation context (Task 3)
    conversationManager.addMessage(conversationId, {
      role: 'user',
      content: text,
      metadata: { sentiment, source: 'chatwoot_webhook' },
    });
    conversationManager.setSentiment(conversationId, sentiment.sentiment);
    conversationManager.setUrgency(conversationId, sentiment.urgency);

    // Step 3: Check for auto-escalation (Task 5)
    const escalation = autoEscalation.evaluate({
      message: text,
      sentiment,
      confidence: 0.5, // Will update after agent runs
      intent: 'unknown', // Will update after agent classifies
      conversationHistory: conversationManager.getRecentMessages(conversationId),
    });

    // Step 4: If critical escalation, skip AI and escalate immediately
    if (escalation.shouldEscalate && escalation.priority === 'urgent') {
      autoEscalation.trackEscalation(conversationId, escalation);
      
      console.log(`[Webhook] Auto-escalating conversation ${conversationId}:`, {
        priority: escalation.priority,
        triggers: escalation.triggers.map(t => t.type),
      });

      // Alert if needed
      if (sentiment.shouldEscalate) {
        const alert = sentimentAnalyzer.getAlertMessage(sentiment, conversationId);
        if (alert) {
          console.warn('[Sentiment Alert]', alert);
        }
      }

      // Log escalation (no return needed - async processing)
      console.log('[Webhook] Escalated - no AI processing needed');
      return; // Exit early for escalations
    }

    // Step 5: Run AI agent (Task 1 - with CEO approval via needsApproval)
    const result = await run(triageAgent, text);

    // If tools need approval, the SDK interrupts and returns pending items
    if (result.interruptions?.length) {
      // Persist state for later
      await saveApprovalState(conversationId, result.state);
      
      // Summarize what's proposed
      const planned = result.interruptions.map(i => ({
        agent: i.agent.name,
        tool: i.rawItem.name,
        args: i.rawItem.arguments,
      }));

      console.log(`[Webhook] Approval required for conversation ${conversationId}:`, planned);
      return; // Exit - waiting for CEO approval
    }

    // If there were no approval-gated tools, we likely just have a draft text as finalOutput
    // Save a feedback seed so a human can grade it later
    await saveFeedbackSample({
      conversationId,
      inputText: text,
      modelDraft: String(result.finalOutput ?? ''),
      safeToSend: false,
      labels: [],
    });

    console.log(`[Webhook] Draft ready for conversation ${conversationId}`);
    
  } catch (err: any) {
    console.error('[Webhook Processing] Error:', err);
    // Error logged, queue will retry based on item.attempts
  }
}

/**
 * Your dashboard calls this to fetch all pending approvals (cross-conversation).
 */
app.get('/approvals', async (_req, res) => {
  try {
    const rows = await listPendingApprovals();
    res.json(rows.map(r => ({
      id: r.id,
      conversationId: r.conversationId,
      createdAt: r.createdAt,
      pending: r.lastInterruptions,
    })));
  } catch (err: any) {
    console.error('[Approvals] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Approve or reject a specific interruption item by index (0..N-1).
 * The UI should show details and collect a reason for audit.
 */
app.post('/approvals/:id/:idx/:action', async (req, res) => {
  try {
    const { id, idx, action } = req.params;
    const approve = action === 'approve';
    
    const state = await loadApprovalState(id);
    if (!state) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    // Rehydrate RunState and apply decision
    const hydrated = await RunState.fromString(triageAgent, state.serialized);
    const interruption = state.lastInterruptions[Number(idx)];
    
    if (!interruption) {
      return res.status(400).json({ error: 'Invalid interruption index' });
    }

    // Track CEO approval for learning (Task 1 - CEO learning loop)
    const proposedArgs = interruption.rawItem.arguments as any;
    const editedContent = req.body.editedContent; // Optional: CEO can edit before approving
    
    if (approve) {
      hydrated.approve(interruption);
      
      // Track CEO approval for learning
      if (interruption.rawItem.name === 'chatwoot_send_public_reply') {
        await ceoLearning.trackApproval({
          conversationId: state.conversationId,
          proposedMessage: proposedArgs.content || '',
          approvedMessage: editedContent || proposedArgs.content || '',
          intent: state.lastInput?.substring(0, 50) || 'unknown',
          originalConfidence: 0.8, // TODO: Track from agent
          timeToApproval: Date.now() - new Date(state.createdAt || Date.now()).getTime(),
        });
      }
    } else {
      hydrated.reject(interruption);
      
      // Track rejection for learning
      console.log('[CEO Learning] Response rejected:', {
        conversationId: state.conversationId,
        tool: interruption.rawItem.name,
        reason: req.body.rejectionReason || 'Not specified',
      });
    }

    // Resume run
    const result = await run(triageAgent, hydrated);

    // Loop until clear (in case multiple approvals are needed)
    if (result.interruptions?.length) {
      // Persist the new pending set and exit; UI can approve the next set
      await saveApprovalState(state.conversationId, result.state);
      return res.json({
        status: 'more_pending',
        pending: result.interruptions.map(i => ({
          agent: i.agent.name,
          tool: i.rawItem.name,
          args: i.rawItem.arguments,
        })),
      });
    }

    // Finished. Either we produced a final draft or executed tools.
    const finalText = String(result.finalOutput ?? '');
    await saveFeedbackSample({
      conversationId: state.conversationId,
      inputText: state.lastInput ?? '',
      modelDraft: finalText,
      safeToSend: true,
      labels: ['approved'],
    });

    return res.json({
      status: 'complete',
      finalOutput: finalText,
    });
  } catch (err: any) {
    console.error('[Approval] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get webhook queue statistics
 */
app.get('/queue/stats', (_req, res) => {
  try {
    const stats = webhookQueue.getStats();
    res.json(stats);
  } catch (err: any) {
    console.error('[Queue Stats] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get CEO learning insights
 * Shows how CEO approvals are training the AI
 */
app.get('/analytics/ceo-learning', (_req, res) => {
  try {
    const insights = ceoLearning.getInsights();
    const stats = ceoLearning.getStats();
    
    res.json({
      insights,
      stats,
      promptEnhancement: ceoLearning.buildPromptEnhancement(),
    });
  } catch (err: any) {
    console.error('[CEO Learning Analytics] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get sentiment analysis trends
 * Real-time customer sentiment monitoring
 */
app.get('/analytics/sentiment', (_req, res) => {
  try {
    const trends = sentimentAnalyzer.getTrends();
    
    res.json({
      trends,
      last24hours: trends,
    });
  } catch (err: any) {
    console.error('[Sentiment Analytics] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get escalation statistics
 * Monitor auto-escalation effectiveness
 */
app.get('/analytics/escalations', (_req, res) => {
  try {
    const stats = autoEscalation.getStats();
    
    res.json(stats);
  } catch (err: any) {
    console.error('[Escalation Analytics] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get conversation context
 * Debugging endpoint to see what context AI has
 */
app.get('/context/:conversationId', (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const context = conversationManager.getContext(conversationId);
    const summary = conversationManager.getSummary(conversationId);
    
    res.json({
      context,
      summary,
      recentMessages: conversationManager.getRecentMessages(conversationId, 10),
    });
  } catch (err: any) {
    console.error('[Context] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start HTTP server
const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[Agent Service] Listening on :${port}`);
  console.log(`[Agent Service] Webhook: POST /webhooks/chatwoot`);
  console.log(`[Agent Service] Approvals: GET /approvals`);
  console.log(`[Agent Service] Approve/Reject: POST /approvals/:id/:idx/:action`);
  console.log(`[Agent Service] CEO Learning: GET /analytics/ceo-learning`);
  console.log(`[Agent Service] Sentiment: GET /analytics/sentiment`);
  console.log(`[Agent Service] Escalations: GET /analytics/escalations`);
  console.log(`[Agent Service] Context: GET /context/:conversationId`);
});

