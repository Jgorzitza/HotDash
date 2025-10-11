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

    console.log(`[Webhook] Processing conversation ${conversationId}: "${text.substring(0, 50)}..."`);

    // Kick off agent run with the raw user text
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

      return res.json({
        status: 'pending_approval',
        conversationId,
        interruptions: planned,
      });
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

    return res.json({
      status: 'draft_ready',
      conversationId,
      draft: result.finalOutput,
    });
  } catch (err: any) {
    console.error('[Webhook] Error:', err);
    return res.status(500).json({ error: err.message || 'webhook error' });
  }
});

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

    if (approve) {
      hydrated.approve(interruption);
    } else {
      hydrated.reject(interruption);
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

// Start HTTP server
const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`[Agent Service] Listening on :${port}`);
  console.log(`[Agent Service] Webhook: POST /webhooks/chatwoot`);
  console.log(`[Agent Service] Approvals: GET /approvals`);
  console.log(`[Agent Service] Approve/Reject: POST /approvals/:id/:idx/:action`);
});

