/**
 * Supabase RPC Client (singleton; env-driven)
 * Owner: integrations agent
 * Date: 2025-10-16
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "../../utils/logger.server";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

let serviceRoleClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

interface ClientMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  retriedRequests: number;
  totalLatencyMs: number;
}

const metrics: ClientMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  retriedRequests: 0,
  totalLatencyMs: 0,
};

export function getClientMetrics(): Readonly<ClientMetrics> {
  return { ...metrics };
}

export function resetClientMetrics(): void {
  Object.assign(metrics, {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    totalLatencyMs: 0,
  });
}

function isRetryableError(error: any): boolean {
  if (!error) return false;
  if (error.message?.includes("fetch failed")) return true;
  if (error.message?.includes("network")) return true;
  if (error.message?.includes("timeout")) return true;
  if (error.code && error.code >= 500) return true;
  return false;
}

async function executeRPCWithRetry<T>(
  rpcFn: () => Promise<{ data: T | null; error: any }>,
  rpcName: string,
): Promise<{ data: T | null; error: any }> {
  let lastResult: { data: T | null; error: any } | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const startTime = Date.now();
      lastResult = await rpcFn();
      const latency = Date.now() - startTime;
      metrics.totalLatencyMs += latency;

      if (!lastResult.error || !isRetryableError(lastResult.error)) {
        if (!lastResult.error) metrics.successfulRequests++;
        else metrics.failedRequests++;
        return lastResult;
      }

      if (attempt === MAX_RETRIES) {
        metrics.failedRequests++;
        return lastResult;
      }

      metrics.retriedRequests++;
      const baseDelay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * baseDelay * 0.1));
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        metrics.failedRequests++;
        return { data: null, error };
      }
      metrics.retriedRequests++;
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt)));
    }
  }

  return lastResult!;
}

function getServiceRoleClient(): SupabaseClient {
  if (serviceRoleClient) return serviceRoleClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY required");
  }

  serviceRoleClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return serviceRoleClient;
}

function getAnonClient(): SupabaseClient {
  if (anonClient) return anonClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY required");
  }

  anonClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return anonClient;
}

export interface SupabaseRPCClient {
  rpc<T = any>(functionName: string, params?: Record<string, any>): Promise<T>;
  from<T = any>(table: string): any;
  getClient(): SupabaseClient;
}

export function createSupabaseClient(useServiceRole = true): SupabaseRPCClient {
  const client = useServiceRole ? getServiceRoleClient() : getAnonClient();
  metrics.totalRequests++;

  return {
    async rpc<T = any>(functionName: string, params?: Record<string, any>): Promise<T> {
      const result = await executeRPCWithRetry(() => client.rpc(functionName, params), functionName);
      if (result.error) {
        throw new Error('RPC ' + functionName + ' failed: ' + result.error.message);
      }
      return result.data as T;
    },

    from<T = any>(table: string) {
      return client.from(table);
    },

    getClient(): SupabaseClient {
      return client;
    },
  };
}

export const SupabaseRPC = {
  async getApprovalQueue(params: { limit?: number; offset?: number; status?: string }): Promise<any[]> {
    const client = createSupabaseClient();
    return client.rpc("get_approval_queue", {
      p_limit: params.limit ?? 50,
      p_offset: params.offset ?? 0,
      p_status: params.status ?? "pending",
    });
  },

  async logAuditEntry(params: {
    scope: string;
    actor: string;
    action: string;
    rationale?: string;
    evidenceUrl?: string;
    shopDomain?: string;
    externalRef?: string;
    payload?: any;
  }): Promise<number> {
    const client = createSupabaseClient();
    return client.rpc("log_audit_entry", {
      p_scope: params.scope,
      p_actor: params.actor,
      p_action: params.action,
      p_rationale: params.rationale,
      p_evidence_url: params.evidenceUrl,
      p_shop_domain: params.shopDomain,
      p_external_ref: params.externalRef,
      p_payload: params.payload,
    });
  },

  async getDashboardMetricsHistory(params: {
    shopDomain: string;
    factType?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const client = createSupabaseClient();
    return client.rpc("get_dashboard_metrics_history", {
      p_shop_domain: params.shopDomain,
      p_fact_type: params.factType ?? "shopify.dashboard.metrics",
      p_limit: params.limit ?? 30,
      p_offset: params.offset ?? 0,
    });
  },
};
