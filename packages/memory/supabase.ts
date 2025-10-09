import { createClient } from "@supabase/supabase-js";
import type { DecisionLog, Fact, Memory } from "./index";

type SupabaseError = {
  message?: string;
  code?: string | number;
  status?: number;
};

type SupabaseResponse<T = unknown> = {
  data?: T | null;
  error?: SupabaseError | null;
};

const RETRYABLE_ERROR_CODES = new Set(["408", "425", "429", "500", "502", "503", "504"]);
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_MESSAGE_TOKENS = ["ETIMEDOUT", "timeout", "ECONNRESET", "fetch failed"];

const MAX_RETRIES = 2;
const INITIAL_DELAY_MS = 250;

function isRetryable(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return RETRYABLE_MESSAGE_TOKENS.some((token) => message.includes(token.toLowerCase()));
  }

  if (typeof error === "string") {
    const lower = error.toLowerCase();
    return RETRYABLE_MESSAGE_TOKENS.some((token) => lower.includes(token.toLowerCase()));
  }

  if (typeof error === "object") {
    const { code, status, message } = error as SupabaseError;

    if (code && RETRYABLE_ERROR_CODES.has(String(code))) {
      return true;
    }

    if (typeof status === "number" && RETRYABLE_STATUS.has(status)) {
      return true;
    }

    if (typeof message === "string") {
      const lower = message.toLowerCase();
      return RETRYABLE_MESSAGE_TOKENS.some((token) => lower.includes(token.toLowerCase()));
    }
  }

  return false;
}

async function wait(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

let sleepImpl: (ms: number) => Promise<void> = wait;

async function executeWithRetry<T>(operation: () => Promise<T | SupabaseResponse>): Promise<T | SupabaseResponse> {
  let attempt = 0;
  let delay = INITIAL_DELAY_MS;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    try {
      const result = await operation();

      if (result && typeof result === "object" && "error" in result) {
        const { error } = result as SupabaseResponse;

        if (error) {
          if (attempt === MAX_RETRIES || !isRetryable(error)) {
            throw error;
          }

          lastError = error;
        } else {
          return result;
        }
      } else {
        return result;
      }
    } catch (error) {
      if (attempt === MAX_RETRIES || !isRetryable(error)) {
        throw error;
      }
      lastError = error;
    }

    attempt += 1;
    await sleepImpl(delay);
    delay *= 2;
  }

  throw lastError ?? new Error("Supabase operation failed after retries");
}

function setWaitImplementation(fn: typeof wait) {
  sleepImpl = fn;
}

function resetWaitImplementation() {
  sleepImpl = wait;
}

export function supabaseMemory(url: string, key: string): Memory {
  const sb = createClient(url, key);

  return {
    async putDecision(decision: DecisionLog) {
      await executeWithRetry(() =>
        sb.from("decision_log").insert({
          scope: decision.scope,
          who: decision.who,
          what: decision.what,
          why: decision.why,
          sha: decision.sha,
          evidence_url: decision.evidenceUrl,
          created_at: decision.createdAt,
        }),
      );
    },

    async listDecisions(scope) {
      const query = scope
        ? sb.from("decision_log").select("*").eq("scope", scope)
        : sb.from("decision_log").select("*");

      const { data, error } = (await query.order("created_at", { ascending: false })) as SupabaseResponse<
        Array<Record<string, unknown>>
      >;

      if (error) {
        throw error;
      }

      return (data || []).map((row) => ({
        id: String(row?.id ?? ""),
        scope: row?.scope as DecisionLog["scope"],
        who: String(row?.who ?? ""),
        what: String(row?.what ?? ""),
        why: String(row?.why ?? ""),
        sha: row?.sha ? String(row.sha) : undefined,
        evidenceUrl: row?.evidence_url ? String(row.evidence_url) : undefined,
        createdAt: String(row?.created_at ?? ""),
      }));
    },

    async putFact(fact: Fact) {
      await executeWithRetry(() =>
        sb.from("facts").insert({
          project: fact.project,
          topic: fact.topic,
          key: fact.key,
          value: fact.value,
          created_at: fact.createdAt,
        }),
      );
    },

    async getFacts(topic?: string, key?: string) {
      let query = sb.from("facts").select("*");
      if (topic) {
        query = query.eq("topic", topic);
      }
      if (key) {
        query = query.eq("key", key);
      }

      const { data, error } = (await query.order("created_at", { ascending: false })) as SupabaseResponse<
        Array<Record<string, unknown>>
      >;

      if (error) {
        throw error;
      }

      return (data || []).map((row) => ({
        project: String(row?.project ?? ""),
        topic: String(row?.topic ?? ""),
        key: String(row?.key ?? ""),
        value: String(row?.value ?? ""),
        createdAt: String(row?.created_at ?? ""),
      }));
    },
  };
}

export const __internal = {
  executeWithRetry,
  isRetryable,
  setWaitForTests: setWaitImplementation,
  resetWaitForTests: resetWaitImplementation,
};
