/**
 * Audit Logging Middleware
 * Owner: integrations agent
 * Date: 2025-10-16
 */

import { logger } from "../utils/logger.server";
import { SupabaseRPC } from "../lib/supabase/client";

export interface AuditLogEntry {
  scope: string;
  actor: string;
  action: string;
  rationale?: string;
  evidenceUrl?: string;
  shopDomain?: string;
  externalRef?: string;
  payload?: any;
  request?: { method: string; url: string; headers?: Record<string, string>; body?: any };
  response?: { status: number; headers?: Record<string, string>; body?: any };
  timing?: { startTime: number; endTime: number; durationMs: number };
  error?: { message: string; stack?: string };
}

export async function logAPICall(entry: AuditLogEntry): Promise<void> {
  try {
    logger.info("API call audit", {
      scope: entry.scope,
      actor: entry.actor,
      action: entry.action,
      durationMs: entry.timing?.durationMs,
      success: !entry.error,
    });

    await SupabaseRPC.logAuditEntry({
      scope: entry.scope,
      actor: entry.actor,
      action: entry.action,
      rationale: entry.rationale,
      evidenceUrl: entry.evidenceUrl,
      shopDomain: entry.shopDomain,
      externalRef: entry.externalRef,
      payload: {
        request: entry.request,
        response: entry.response,
        timing: entry.timing,
        error: entry.error,
        ...entry.payload,
      },
    });
  } catch (error) {
    logger.error("Failed to log audit entry", {
      error: error instanceof Error ? error.message : String(error),
      scope: entry.scope,
    });
  }
}

export function withAudit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    scope: string;
    action: string;
    getActor?: (...args: Parameters<T>) => string;
    getRationale?: (...args: Parameters<T>) => string;
    getShopDomain?: (...args: Parameters<T>) => string;
  },
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    let error: Error | null = null;
    let result: any = null;

    try {
      result = await fn(...args);
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw error;
    } finally {
      const endTime = Date.now();
      await logAPICall({
        scope: options.scope,
        actor: options.getActor?.(...args) || "system",
        action: options.action,
        rationale: options.getRationale?.(...args),
        shopDomain: options.getShopDomain?.(...args),
        timing: { startTime, endTime, durationMs: endTime - startTime },
        error: error ? { message: error.message, stack: error.stack } : undefined,
        payload: {
          args: args.map(arg => {
            if (typeof arg === "object" && arg !== null) {
              const sanitized = { ...arg };
              delete sanitized.password;
              delete sanitized.token;
              delete sanitized.apiKey;
              return sanitized;
            }
            return arg;
          }),
          result: error ? undefined : result,
        },
      });
    }
  }) as T;
}
