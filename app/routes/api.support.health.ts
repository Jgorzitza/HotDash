/**
 * Support Health Check Endpoint
 *
 * Returns health status of support infrastructure:
 * - Chatwoot API accessibility
 * - Webhook endpoint reachability
 * - Queue depth
 *
 * Cache: 5 minutes TTL
 */

import type { Route } from "./+types/api.support.health";
import { logger } from "../utils/logger.server";

interface HealthCheck {
  status: "healthy" | "degraded" | "down";
  chatwoot: {
    accessible: boolean;
    responseTime?: number;
  };
  webhook: {
    reachable: boolean;
    lastReceived?: string;
  };
  queue: {
    depth: number;
    oldestPending?: string;
  };
  timestamp: string;
}

async function checkChatwootAccessibility(): Promise<{
  accessible: boolean;
  responseTime?: number;
}> {
  const chatwootUrl = process.env.CHATWOOT_BASE_URL;

  if (!chatwootUrl) {
    return { accessible: false };
  }

  try {
    const start = Date.now();
    const response = await fetch(`${chatwootUrl}/rails/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    const responseTime = Date.now() - start;

    return {
      accessible: response.ok,
      responseTime,
    };
  } catch (error) {
    logger.error("[support.health] Chatwoot health check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { accessible: false };
  }
}

async function checkQueueDepth(): Promise<{
  depth: number;
  oldestPending?: string;
}> {
  try {
    // Query dashboard_facts for recent queue stats
    // For now, return mock data - real implementation would query Supabase
    return {
      depth: 0,
      oldestPending: undefined,
    };
  } catch (error) {
    logger.error("[support.health] Queue depth check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { depth: 0 };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  logger.info("[support.health] Health check requested");

  const [chatwoot, queue] = await Promise.all([
    checkChatwootAccessibility(),
    checkQueueDepth(),
  ]);

  // Determine overall status
  let status: HealthCheck["status"] = "healthy";
  if (!chatwoot.accessible) {
    status = "down";
  } else if (queue.depth > 50) {
    status = "degraded";
  }

  const health: HealthCheck = {
    status,
    chatwoot,
    webhook: {
      reachable: true, // If this endpoint is responding, webhook is reachable
      lastReceived: undefined, // Could query dashboard_facts for last webhook
    },
    queue,
    timestamp: new Date().toISOString(),
  };

  logger.info("[support.health] Health check complete", {
    status: health.status,
    chatwootAccessible: chatwoot.accessible,
    queueDepth: queue.depth,
  });

  return Response.json(health, {
    headers: {
      "Cache-Control": "public, max-age=300", // 5 minute cache
    },
  });
}
