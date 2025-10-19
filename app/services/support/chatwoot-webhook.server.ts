type FetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  },
) => Promise<ResponseLike>;

interface ResponseLike {
  ok: boolean;
  status: number;
  statusText?: string;
  headers: {
    get(name: string): string | null;
  };
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
}

type SleepFn = (delayMs: number) => Promise<void>;

export interface ForwardChatwootWebhookOptions {
  payload: string;
  agentSdkUrl: string;
  fetchImpl?: FetchLike;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
  sleep?: SleepFn;
  timeoutMs?: number;
}

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_BASE_DELAY_MS = 500;
const DEFAULT_TIMEOUT_MS = 5000;

const RETRY_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const defaultFetch: FetchLike = (input, init) => fetch(input, init);

const defaultSleep: SleepFn = (delayMs) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) return null;

  const seconds = Number(headerValue);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const date = new Date(headerValue);
  if (!Number.isNaN(date.getTime())) {
    const now = Date.now();
    const delta = date.getTime() - now;
    return delta > 0 ? delta : 0;
  }

  return null;
}

function computeBackoffDelay(attempt: number, baseDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * baseDelayMs);
  return exponential + jitter;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) return promise;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Agent SDK request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function shouldRetry(
  response: ResponseLike,
  attempt: number,
  maxAttempts: number,
) {
  if (attempt >= maxAttempts) return false;
  if (response.ok) return false;
  return RETRY_STATUS_CODES.has(response.status);
}

export async function forwardChatwootWebhook(
  options: ForwardChatwootWebhookOptions,
): Promise<{ response: ResponseLike; attempts: number }> {
  const {
    payload,
    agentSdkUrl,
    fetchImpl = defaultFetch,
    retryAttempts = DEFAULT_RETRY_ATTEMPTS,
    retryBaseDelayMs = DEFAULT_RETRY_BASE_DELAY_MS,
    sleep = defaultSleep,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  let lastError: unknown = new Error("Chatwoot webhook forwarding failed");

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const response = await withTimeout(
        fetchImpl(`${agentSdkUrl}/webhooks/chatwoot`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-From": "hotdash-app",
          },
          body: payload,
        }),
        timeoutMs,
      );

      if (!shouldRetry(response, attempt, retryAttempts)) {
        return { response, attempts: attempt };
      }

      const retryAfterHeader = parseRetryAfter(
        response.headers.get("Retry-After"),
      );
      const delay =
        retryAfterHeader ?? computeBackoffDelay(attempt, retryBaseDelayMs);
      await sleep(delay);
      continue;
    } catch (error) {
      lastError = error;
      if (attempt >= retryAttempts) {
        throw error;
      }
      const delay = computeBackoffDelay(attempt, retryBaseDelayMs);
      await sleep(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Chatwoot webhook forwarding failed");
}

export function __test__parseRetryAfter(headerValue: string | null) {
  return parseRetryAfter(headerValue);
}
