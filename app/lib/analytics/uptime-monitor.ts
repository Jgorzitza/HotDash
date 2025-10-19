/**
 * Uptime Monitoring Integration
 *
 * Tracks analytics endpoint uptime and availability.
 */

export interface UptimeCheck {
  endpoint: string;
  status: "up" | "down" | "degraded";
  responseTime: number;
  lastCheck: string;
  upSince?: string;
  downtime24h: number; // minutes
}

/**
 * Perform uptime check
 */
export async function checkUptime(endpoint: string): Promise<UptimeCheck> {
  const startTime = Date.now();

  try {
    const response = await fetch(`http://localhost:5173${endpoint}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;

    return {
      endpoint,
      status: response.ok ? (responseTime < 3000 ? "up" : "degraded") : "down",
      responseTime,
      lastCheck: new Date().toISOString(),
      downtime24h: 0,
    };
  } catch (error) {
    return {
      endpoint,
      status: "down",
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      downtime24h: 0,
    };
  }
}

/**
 * Check all analytics endpoints
 */
export async function checkAllEndpoints(): Promise<UptimeCheck[]> {
  const endpoints = [
    "/api/analytics/health",
    "/api/analytics/revenue",
    "/api/analytics/conversion-rate",
    "/api/analytics/traffic",
    "/api/analytics/idea-pool",
  ];

  return await Promise.all(endpoints.map(checkUptime));
}
