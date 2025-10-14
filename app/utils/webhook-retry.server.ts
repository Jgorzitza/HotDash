/**
 * Webhook retry mechanism with dead letter queue
 * 
 * Handles failed webhook deliveries with exponential backoff
 * and moves permanently failed webhooks to dead letter queue.
 */

import { createClient } from "@supabase/supabase-js";

interface WebhookPayload {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: Date;
  createdAt: Date;
  lastError?: string;
}

interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelayMs: 1000, // 1 second
  maxDelayMs: 60 * 60 * 1000, // 1 hour
  backoffMultiplier: 2,
};

/**
 * Calculate next retry delay using exponential backoff
 */
function calculateRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Attempt to deliver a webhook
 */
async function deliverWebhook(payload: WebhookPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(payload.url, {
      method: payload.method,
      headers: payload.headers,
      body: JSON.stringify(payload.body),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Queue a webhook for delivery with retry support
 */
export async function queueWebhook(
  url: string,
  method: string,
  body: unknown,
  headers: Record<string, string> = {},
  config: Partial<RetryConfig> = {},
): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  const webhookId = `webhook-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const { error } = await supabase.from("webhook_queue").insert({
    id: webhookId,
    url,
    method,
    headers,
    body,
    attempts: 0,
    max_attempts: fullConfig.maxAttempts,
    next_retry_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to queue webhook: ${error.message}`);
  }

  return webhookId;
}

/**
 * Process pending webhooks (called by background job)
 */
export async function processWebhookQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  deadLettered: number;
}> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get webhooks ready for retry
  const { data: webhooks, error: fetchError } = await supabase
    .from("webhook_queue")
    .select("*")
    .lte("next_retry_at", new Date().toISOString())
    .lt("attempts", "max_attempts")
    .limit(100);

  if (fetchError || !webhooks) {
    console.error("Error fetching webhook queue:", fetchError);
    return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  }

  let succeeded = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const webhook of webhooks) {
    const result = await deliverWebhook(webhook as unknown as WebhookPayload);

    if (result.success) {
      // Remove from queue on success
      await supabase.from("webhook_queue").delete().eq("id", webhook.id);
      succeeded++;
    } else {
      const newAttempts = webhook.attempts + 1;

      if (newAttempts >= webhook.max_attempts) {
        // Move to dead letter queue
        await supabase.from("webhook_dead_letter").insert({
          ...webhook,
          final_error: result.error,
          dead_lettered_at: new Date().toISOString(),
        });

        await supabase.from("webhook_queue").delete().eq("id", webhook.id);
        deadLettered++;
      } else {
        // Schedule retry with exponential backoff
        const delay = calculateRetryDelay(newAttempts, DEFAULT_RETRY_CONFIG);
        const nextRetryAt = new Date(Date.now() + delay);

        await supabase
          .from("webhook_queue")
          .update({
            attempts: newAttempts,
            next_retry_at: nextRetryAt.toISOString(),
            last_error: result.error,
          })
          .eq("id", webhook.id);

        failed++;
      }
    }
  }

  return {
    processed: webhooks.length,
    succeeded,
    failed,
    deadLettered,
  };
}

/**
 * Get dead letter queue entries for manual review
 */
export async function getDeadLetterQueue(limit = 50): Promise<WebhookPayload[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("webhook_dead_letter")
    .select("*")
    .order("dead_lettered_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch dead letter queue: ${error.message}`);
  }

  return (data || []) as unknown as WebhookPayload[];
}

