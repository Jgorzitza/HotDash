/**
 * Chatwoot Webhook Retry Logic
 *
 * Exponential backoff retry policy for Agent SDK webhook forwarding
 * Max 3 attempts: 0s, 1s, 2s delay
 */

import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../facts.server";
import { ServiceError } from "../types";

export interface WebhookRetryResult {
  success: true;
  attempts: number;
  durationMs: number;
  agentStatus?: string;
  responseBody?: unknown;
}

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  backoffFactor?: number;
  agentSdkUrl?: string;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 1000; // 1 second
const DEFAULT_BACKOFF_FACTOR = 2;
const DEFAULT_AGENT_SDK_URL = "https://hotdash-agent-service.fly.dev";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number): boolean {
  return status >= 500 || status === 429;
}

async function recordRetryMetrics(data: {
  attempts: number;
  success: boolean;
  durationMs: number;
  finalStatus?: number;
}) {
  try {
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.webhook.retry",
      scope: "webhook_forwarding",
      value: {
        attempts: data.attempts,
        success: data.success,
        durationMs: data.durationMs,
        finalStatus: data.finalStatus,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.warn("[webhook-retry] Failed to record retry metrics", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendToDeadLetterQueue(data: {
  payload: unknown;
  attempts: number;
  lastError: string;
  timestamp: string;
}) {
  try {
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.webhook.dead_letter",
      scope: "failed_webhooks",
      value: {
        payload: data.payload,
        attempts: data.attempts,
        lastError: data.lastError,
      },
      metadata: {
        timestamp: data.timestamp,
        requires_manual_review: true,
      },
    });
    logger.error("[webhook-retry] Webhook sent to dead letter queue", {
      attempts: data.attempts,
      timestamp: data.timestamp,
    });
  } catch (error) {
    logger.error("[webhook-retry] Failed to write to dead letter queue", {
      cause: error instanceof Error ? error.message : String(error),
      originalError: data.lastError,
    });
  }
}

/**
 * Forward Chatwoot webhook to Agent SDK with exponential backoff retry
 *
 * Retry policy:
 * - Attempt 1: immediate
 * - Attempt 2: 1s delay
 * - Attempt 3: 2s delay
 *
 * @param payload - Webhook payload from Chatwoot
 * @param options - Retry configuration
 * @returns Result with success status and metadata
 * @throws ServiceError after exhausting retries
 */
export async function forwardChatwootWebhook(
  payload: unknown,
  options: RetryOptions = {},
): Promise<WebhookRetryResult> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const backoffFactor = options.backoffFactor ?? DEFAULT_BACKOFF_FACTOR;
  const agentSdkUrl =
    options.agentSdkUrl ?? process.env.AGENT_SDK_URL ?? DEFAULT_AGENT_SDK_URL;

  const endpoint = `${agentSdkUrl.replace(/\/$/, "")}/webhooks/chatwoot`;
  const body = JSON.stringify(payload);

  let attempt = 0;
  const startTime = Date.now();
  let lastError: unknown = null;

  while (attempt < maxAttempts) {
    attempt++;

    try {
      logger.info("[webhook-retry] Forwarding webhook", {
        attempt,
        endpoint,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-From": "hotdash-app",
        },
        body,
      });

      if (response.ok) {
        let parsed: unknown = undefined;
        try {
          parsed = await response.clone().json();
        } catch {
          parsed = undefined;
        }

        const duration = Date.now() - startTime;

        // Record success metrics
        await recordRetryMetrics({
          attempts: attempt,
          success: true,
          durationMs: duration,
          finalStatus: response.status,
        });

        logger.info("[webhook-retry] Webhook forwarded successfully", {
          duration,
          attempts: attempt,
        });

        return {
          success: true,
          attempts: attempt,
          durationMs: duration,
          agentStatus:
            typeof parsed === "object" && parsed && "status" in parsed
              ? (parsed as any).status
              : undefined,
          responseBody: parsed,
        };
      }

      // Non-2xx response
      const errorBody = await response.text();
      const retryable = shouldRetry(response.status);

      lastError = new ServiceError("Agent SDK returned non-success status", {
        scope: "webhook-retry",
        retryable,
        cause: {
          status: response.status,
          body: errorBody,
        },
      });

      logger.warn("[webhook-retry] Agent SDK returned non-success", {
        attempt,
        status: response.status,
        retryable,
      });

      if (!retryable || attempt >= maxAttempts) {
        throw lastError;
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        lastError = error;
        if (!error.retryable || attempt >= maxAttempts) {
          throw error;
        }
      } else {
        // Network/fetch errors are retryable
        lastError = error;
        if (attempt >= maxAttempts) {
          throw new ServiceError("Agent SDK request failed", {
            scope: "webhook-retry",
            retryable: true,
            cause: error,
          });
        }
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxAttempts) {
      const delay = Math.round(
        baseDelayMs * Math.pow(backoffFactor, attempt - 1),
      );
      logger.info("[webhook-retry] Retrying webhook forward", {
        nextAttempt: attempt + 1,
        delayMs: delay,
      });
      await wait(delay);
    }
  }

  // All retries exhausted
  const duration = Date.now() - startTime;

  await recordRetryMetrics({
    attempts: attempt,
    success: false,
    durationMs: duration,
  });

  await sendToDeadLetterQueue({
    payload,
    attempts: attempt,
    lastError:
      lastError instanceof Error ? lastError.message : String(lastError),
    timestamp: new Date().toISOString(),
  });

  throw lastError instanceof ServiceError
    ? lastError
    : new ServiceError("Agent SDK request failed after retries", {
        scope: "webhook-retry",
        retryable: true,
        cause: lastError,
      });
}
