/**
 * Integration Health Monitoring
 *
 * Monitors health of all external integrations:
 * - Publer API
 * - Shopify Admin API
 * - Chatwoot API
 */

import { createPublerClient } from "~/services/publer/client";

export interface HealthCheckResult {
  service: string;
  healthy: boolean;
  latencyMs?: number;
  error?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface AllHealthChecksResult {
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
}

export async function checkPublerHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    if (!process.env.PUBLER_API_KEY || !process.env.PUBLER_WORKSPACE_ID) {
      return {
        service: "publer",
        healthy: false,
        error: "Credentials not configured",
        timestamp: new Date().toISOString(),
      };
    }
    const client = createPublerClient();
    const result = await client.listWorkspaces();
    const latency = Date.now() - startTime;
    if (!result.success) {
      return {
        service: "publer",
        healthy: false,
        latencyMs: latency,
        error: result.error?.message || "API request failed",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      service: "publer",
      healthy: true,
      latencyMs: latency,
      details: {
        workspaceCount: result.data?.length || 0,
        rateLimitInfo: result.rateLimitInfo,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: "publer",
      healthy: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function checkShopifyHealth(
  adminGraphqlClient?: any,
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    if (!adminGraphqlClient) {
      return {
        service: "shopify",
        healthy: false,
        error: "Shopify client not available",
        timestamp: new Date().toISOString(),
      };
    }
    const response = await adminGraphqlClient.query({
      data: { query: `query { shop { id name } }` },
    });
    const json = await response.json();
    const latency = Date.now() - startTime;
    if (json.errors) {
      return {
        service: "shopify",
        healthy: false,
        latencyMs: latency,
        error: json.errors[0]?.message || "GraphQL error",
        timestamp: new Date().toISOString(),
      };
    }
    return {
      service: "shopify",
      healthy: true,
      latencyMs: latency,
      details: { shop: json.data?.shop?.name },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: "shopify",
      healthy: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function checkChatwootHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const accountId = process.env.CHATWOOT_ACCOUNT_ID;
    const apiToken = process.env.CHATWOOT_API_TOKEN;
    const baseUrl = process.env.CHATWOOT_BASE_URL || "https://app.chatwoot.com";
    if (!accountId || !apiToken) {
      return {
        service: "chatwoot",
        healthy: false,
        error: "Credentials not configured",
        timestamp: new Date().toISOString(),
      };
    }
    const healthResponse = await fetch(`${baseUrl}/rails/health`);
    if (!healthResponse.ok) {
      return {
        service: "chatwoot",
        healthy: false,
        latencyMs: Date.now() - startTime,
        error: `Health check failed: ${healthResponse.status}`,
        timestamp: new Date().toISOString(),
      };
    }
    const apiResponse = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/conversations`,
      {
        headers: {
          api_access_token: apiToken,
          "Content-Type": "application/json",
        },
      },
    );
    const latency = Date.now() - startTime;
    if (!apiResponse.ok) {
      return {
        service: "chatwoot",
        healthy: false,
        latencyMs: latency,
        error: `API request failed: ${apiResponse.status}`,
        timestamp: new Date().toISOString(),
      };
    }
    const data = await apiResponse.json();
    return {
      service: "chatwoot",
      healthy: true,
      latencyMs: latency,
      details: { conversationCount: data.data?.meta?.count || 0 },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      service: "chatwoot",
      healthy: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export async function checkAllIntegrations(
  adminGraphqlClient?: any,
): Promise<AllHealthChecksResult> {
  const checks = await Promise.all([
    checkPublerHealth(),
    checkShopifyHealth(adminGraphqlClient),
    checkChatwootHealth(),
  ]);
  const healthyCount = checks.filter((c) => c.healthy).length;
  const unhealthyCount = checks.filter((c) => !c.healthy).length;
  let overall: "healthy" | "degraded" | "unhealthy";
  if (unhealthyCount === 0) {
    overall = "healthy";
  } else if (healthyCount > 0) {
    overall = "degraded";
  } else {
    overall = "unhealthy";
  }
  return {
    overall,
    checks,
    summary: {
      total: checks.length,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
    },
  };
}
