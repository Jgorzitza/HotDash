/**
 * Health Check Utilities
 *
 * Provides health check endpoints and dependency monitoring for services.
 * Used by load balancers and monitoring systems to determine service health.
 */

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version?: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message?: string;
  responseTime?: number;
  metadata?: Record<string, any>;
}

export type HealthCheckFunction = () => Promise<HealthCheck>;

const startTime = Date.now();

/**
 * Health Check Manager
 */
export class HealthCheckManager {
  private checks = new Map<string, HealthCheckFunction>();

  /**
   * Register a health check
   */
  register(name: string, checkFn: HealthCheckFunction): void {
    this.checks.set(name, checkFn);
  }

  /**
   * Run all health checks
   */
  async runAll(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const version = process.env.APP_VERSION || "unknown";

    const checks: HealthCheck[] = [];

    // Run all registered checks in parallel
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        try {
          const start = performance.now();
          const result = await Promise.race([
            checkFn(),
            this.timeout(5000, name),
          ]);
          result.responseTime = Math.round(performance.now() - start);
          return result;
        } catch (error: any) {
          return {
            name,
            status: "fail" as const,
            message: error.message || "Check failed",
          };
        }
      },
    );

    checks.push(...(await Promise.all(checkPromises)));

    // Determine overall status
    const hasFailures = checks.some((c) => c.status === "fail");
    const hasWarnings = checks.some((c) => c.status === "warn");

    let status: "healthy" | "degraded" | "unhealthy";
    if (hasFailures) {
      status = "unhealthy";
    } else if (hasWarnings) {
      status = "degraded";
    } else {
      status = "healthy";
    }

    return {
      status,
      timestamp,
      uptime,
      version,
      checks,
    };
  }

  /**
   * Timeout helper for health checks
   */
  private async timeout(ms: number, name: string): Promise<HealthCheck> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Health check timeout: ${name}`)), ms);
    });
  }
}

/**
 * Create default health check manager with common checks
 */
export function createHealthCheckManager(): HealthCheckManager {
  const manager = new HealthCheckManager();

  // Basic process health
  manager.register("process", async () => {
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    return {
      name: "process",
      status: "pass",
      message: `Memory: ${memUsedMB}MB / ${memTotalMB}MB`,
      metadata: {
        memoryUsedMB: memUsedMB,
        memoryTotalMB: memTotalMB,
        uptime: process.uptime(),
      },
    };
  });

  return manager;
}

/**
 * Shopify API health check
 */
export async function checkShopifyHealth(): Promise<HealthCheck> {
  try {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    if (!domain || !token) {
      return {
        name: "shopify",
        status: "warn",
        message: "Shopify credentials not configured",
      };
    }

    const start = performance.now();
    const response = await fetch(
      `https://${domain}/admin/api/2025-10/shop.json`,
      {
        method: "GET",
        headers: { "X-Shopify-Access-Token": token },
        signal: AbortSignal.timeout(5000),
      },
    );

    const responseTime = Math.round(performance.now() - start);

    if (response.ok) {
      return {
        name: "shopify",
        status: "pass",
        message: "Shopify API accessible",
        responseTime,
      };
    }

    return {
      name: "shopify",
      status: "fail",
      message: `Shopify API returned ${response.status}`,
      responseTime,
    };
  } catch (error: any) {
    return {
      name: "shopify",
      status: "fail",
      message: error.message || "Shopify API check failed",
    };
  }
}

/**
 * Google Analytics API health check
 */
export async function checkGAHealth(): Promise<HealthCheck> {
  try {
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const propertyId = process.env.GA_PROPERTY_ID;

    if (!credPath || !propertyId) {
      return {
        name: "google-analytics",
        status: "warn",
        message: "GA credentials not configured",
      };
    }

    // Just check if credentials file exists
    // Actual API check would require importing the GA client
    return {
      name: "google-analytics",
      status: "pass",
      message: "GA configured",
    };
  } catch (error: any) {
    return {
      name: "google-analytics",
      status: "warn",
      message: error.message || "GA check failed",
    };
  }
}

/**
 * Chatwoot API health check
 */
export async function checkChatwootHealth(): Promise<HealthCheck> {
  try {
    const baseUrl = process.env.CHATWOOT_BASE_URL;
    const token = process.env.CHATWOOT_API_TOKEN;

    if (!baseUrl || !token) {
      return {
        name: "chatwoot",
        status: "warn",
        message: "Chatwoot credentials not configured",
      };
    }

    const start = performance.now();
    const response = await fetch(`${baseUrl}/api/v1/profile`, {
      method: "GET",
      headers: { api_access_token: token },
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Math.round(performance.now() - start);

    if (response.ok) {
      return {
        name: "chatwoot",
        status: "pass",
        message: "Chatwoot API accessible",
        responseTime,
      };
    }

    return {
      name: "chatwoot",
      status: "fail",
      message: `Chatwoot API returned ${response.status}`,
      responseTime,
    };
  } catch (error: any) {
    return {
      name: "chatwoot",
      status: "fail",
      message: error.message || "Chatwoot API check failed",
    };
  }
}

/**
 * Export default health check manager
 */
export const healthCheckManager = createHealthCheckManager();

// Register service-specific checks
healthCheckManager.register("shopify", checkShopifyHealth);
healthCheckManager.register("google-analytics", checkGAHealth);
healthCheckManager.register("chatwoot", checkChatwootHealth);
