/**
 * Chatwoot Webhook Endpoint
 * 
 * Receives webhooks from Chatwoot and routes them to the Agent SDK service.
 * Implements signature verification for security.
 * 
 * P0 Launch Gate #5
 */

import { type ActionFunction } from 'react-router';
import { createHmac } from 'crypto';

/**
 * Verify Chatwoot webhook signature
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    console.warn('[Chatwoot Webhook] Missing signature header');
    return false;
  }

  const webhookSecret = process.env.CHATWOOT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Chatwoot Webhook] CHATWOOT_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * POST /api/webhooks/chatwoot
 * 
 * Receives Chatwoot webhooks and forwards to Agent SDK service.
 */
export const action: ActionFunction = async ({ request }) => {
  const startTime = Date.now();

  try {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify signature (skip in development)
    const signature = request.headers.get('X-Chatwoot-Signature');
    if (process.env.NODE_ENV === 'production') {
      if (!verifySignature(rawBody, signature)) {
        console.error('[Chatwoot Webhook] Invalid signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    console.log('[Chatwoot Webhook] Received:', {
      event: payload.event,
      conversationId: payload.conversation?.id,
      messageType: payload.message_type,
    });

    // Forward to Agent SDK service
    const agentSdkUrl = process.env.AGENT_SDK_URL || 'https://hotdash-agent-service.fly.dev';
    const response = await fetch(`${agentSdkUrl}/webhooks/chatwoot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-From': 'hotdash-app',
      },
      body: rawBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chatwoot Webhook] Agent SDK error:', {
        status: response.status,
        error: errorText,
      });
      return new Response(
        JSON.stringify({ error: 'Agent SDK processing failed', details: errorText }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    const duration = Date.now() - startTime;

    console.log('[Chatwoot Webhook] Processed successfully', {
      duration: `${duration}ms`,
      status: result.status,
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: true,
        duration: `${duration}ms`,
        agentStatus: result.status,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[Chatwoot Webhook] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Webhook processing failed',
        message: error.message,
        duration: `${duration}ms`,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

