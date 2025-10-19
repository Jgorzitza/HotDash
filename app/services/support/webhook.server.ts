import { ServiceError } from "../types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../facts.server";

export interface ForwardWebhookOptions {
  agentSdkUrl?: string;
  maxAttempts?: number;
  baseDelayMs?: number;
  backoffFactor?: number;
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
  wait?: (ms: number) => Promise<void>;
}

export interface ForwardWebhookResult {
  success: true;
  attempts: number;
  durationMs: number;
  agentStatus?: string;
  responseBody?: unknown;
}

export interface DeadLetterQueueEntry {
  payload: unknown;
  attempts: number;
  lastError: string;
  timestamp: string;
  agentEndpoint: string;
}

const DEFAULT_AGENT_SDK_URL = "https://hotdash-agent-service.fly.dev";
const DEFAULT_MAX_ATTEMPTS = Number.parseInt(
  process.env.CHATWOOT_WEBHOOK_MAX_ATTEMPTS ?? "3",
  10,
);
const DEFAULT_BASE_DELAY_MS = Number.parseInt(
  process.env.CHATWOOT_WEBHOOK_BASE_DELAY_MS ?? "200",
  10,
);
const DEFAULT_BACKOFF_FACTOR = Number.parseFloat(
  process.env.CHATWOOT_WEBHOOK_BACKOFF_FACTOR ?? "2",
);

function defaultWait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function recordRetryMetrics(data: {
  attempts: number;
  success: boolean;
  durationMs: number;
  finalStatus?: number;
  shopDomain?: string;
}) {
  try {
    await recordDashboardFact({
      shopDomain: data.shopDomain ?? "system",
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
    logger.warn("[support.webhook] Failed to record retry metrics", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendToDeadLetterQueue(entry: DeadLetterQueueEntry) {
  try {
    await recordDashboardFact({
      shopDomain: "system",
      factType: "support.webhook.dead_letter",
      scope: "failed_webhooks",
      value: {
        payload: entry.payload,
        attempts: entry.attempts,
        lastError: entry.lastError,
        agentEndpoint: entry.agentEndpoint,
      },
      metadata: {
        timestamp: entry.timestamp,
        requires_manual_review: true,
      },
    });
    logger.error("[support.webhook] Webhook sent to dead letter queue", {
      attempts: entry.attempts,
      timestamp: entry.timestamp,
    });
  } catch (error) {
    logger.error("[support.webhook] Failed to write to dead letter queue", {
      cause: error instanceof Error ? error.message : String(error),
      originalError: entry.lastError,
    });
  }
}

function resolveAgentEndpoint(baseUrl?: string) {
  const providedUrl = baseUrl ?? process.env.AGENT_SDK_URL;
  const normalised =
    (providedUrl && providedUrl.trim()) ?? DEFAULT_AGENT_SDK_URL;
  return `${normalised.replace(/\/$/, "")}/webhooks/chatwoot`;
}

function shouldRetry(status: number) {
  return status >= 500 || status === 429;
}

async function readResponseBody(response: Response): Promise<string | null> {
  try {
    return await response.text();
  } catch (error) {
    logger.warn("[support.webhook] Unable to read response body", {
      status: response.status,
      cause: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function forwardChatwootWebhook(
  payload: unknown,
  options: ForwardWebhookOptions = {},
): Promise<ForwardWebhookResult> {
  const attempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  if (!Number.isFinite(attempts) || attempts < 1) {
    throw new ServiceError("Invalid retry attempt configuration", {
      scope: "support.webhook",
      retryable: false,
    });
  }

  const baseDelay = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const backoffFactor = options.backoffFactor ?? DEFAULT_BACKOFF_FACTOR;
  const fetchImpl = options.fetchImpl ?? fetch;
  const wait = options.wait ?? defaultWait;
  const agentEndpoint = resolveAgentEndpoint(options.agentSdkUrl);

  const headers = {
    "Content-Type": "application/json",
    "X-Forwarded-From": "hotdash-app",
    ...options.headers,
  };

  const body =
    typeof payload === "string" ? payload : JSON.stringify(payload ?? {});

  let attempt = 0;
  const start = Date.now();
  let lastError: unknown = null;

  while (attempt < attempts) {
    attempt += 1;
    try {
      logger.info("[support.webhook] Forwarding Chatwoot webhook", {
        attempt,
        agentEndpoint,
      });

      const response = await fetchImpl(agentEndpoint, {
        method: "POST",
        headers,
        body,
      });

      if (response.ok) {
        let parsed: unknown = undefined;
        try {
          parsed = await response.clone().json();
        } catch {
          parsed = undefined;
        }

        const duration = Date.now() - start;
        logger.info("[support.webhook] Webhook forwarded successfully", {
          duration,
          attempts: attempt,
        });

        // Record success metrics
        await recordRetryMetrics({
          attempts: attempt,
          success: true,
          durationMs: duration,
          finalStatus: response.status,
        });

        return {
          success: true,
          attempts: attempt,
          durationMs: duration,
          agentStatus:
            typeof parsed === "object" && parsed && "status" in parsed
              ? (parsed as Record<string, any>).status
              : undefined,
          responseBody: parsed,
        };
      }

      const responseBody = await readResponseBody(response);
      const retryable = shouldRetry(response.status);
      lastError = new ServiceError("Agent SDK processing failed", {
        scope: "support.webhook",
        retryable,
        cause: {
          status: response.status,
          body: responseBody,
        },
      });

      logger.warn("[support.webhook] Agent SDK returned non-success", {
        attempt,
        status: response.status,
        retryable,
      });

      if (!retryable || attempt >= attempts) {
        throw lastError;
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        lastError = error;
      } else {
        lastError = error;
      }

      const retryable = error instanceof ServiceError ? error.retryable : true;
      if (!retryable || attempt >= attempts) {
        throw error instanceof ServiceError
          ? error
          : new ServiceError("Agent SDK request failed", {
              scope: "support.webhook",
              retryable: true,
              cause: error,
            });
      }
    }

    const delay = Math.round(baseDelay * Math.pow(backoffFactor, attempt - 1));
    logger.info("[support.webhook] Retrying Agent SDK request", {
      attempt: attempt + 1,
      delay,
    });
    await wait(delay);
  }

  // All retries exhausted - record failure metrics and send to DLQ
  const duration = Date.now() - start;
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
    agentEndpoint,
  });

  throw lastError instanceof ServiceError
    ? lastError
    : new ServiceError("Agent SDK request failed", {
        scope: "support.webhook",
        retryable: true,
        cause: lastError,
      });
}
