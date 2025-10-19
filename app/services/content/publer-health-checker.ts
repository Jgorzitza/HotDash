/**
 * Publer Account Health Checker
 *
 * Verifies Publer integration health before allowing posts:
 * - Account connectivity
 * - Token validity
 * - Rate limit status
 * - Workspace access
 *
 * Similar to Chatwoot health checks in CX workflow.
 *
 * @see app/adapters/publer/client.mock.ts
 * @see docs/integrations/publer-oauth-setup.md
 */

import { getPublerClient } from "~/adapters/publer/client.mock";
import type { PublerConnectedAccount } from "~/adapters/publer/types";

/**
 * Health Check Result
 */
export interface PublerHealthCheck {
  healthy: boolean;
  checks: {
    authentication: HealthCheckItem;
    accounts_connected: HealthCheckItem;
    rate_limits: HealthCheckItem;
    workspace_access: HealthCheckItem;
  };
  timestamp: string; // ISO 8601
  next_check: string; // ISO 8601
}

interface HealthCheckItem {
  status: "pass" | "warn" | "fail";
  message: string;
  details?: any;
}

/**
 * Run Complete Health Check
 *
 * Verifies all Publer integration components.
 * Should be run before allowing content posts.
 *
 * @returns Health check results
 */
export async function runPublerHealthCheck(): Promise<PublerHealthCheck> {
  const results: PublerHealthCheck = {
    healthy: true,
    checks: {
      authentication: await checkAuthentication(),
      accounts_connected: await checkConnectedAccounts(),
      rate_limits: await checkRateLimits(),
      workspace_access: await checkWorkspaceAccess(),
    },
    timestamp: new Date().toISOString(),
    next_check: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  };

  // Overall health = all checks pass
  results.healthy = Object.values(results.checks).every(
    (check) => check.status === "pass",
  );

  return results;
}

/**
 * Check Authentication Status
 */
async function checkAuthentication(): Promise<HealthCheckItem> {
  try {
    const publer = getPublerClient();

    // Mock client always passes (no real auth)
    // In production, would verify token validity

    return {
      status: "pass",
      message: "Mock client active (no real authentication)",
      details: { mode: "mock", live_posting: false },
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Authentication failed",
      details: { error: String(error) },
    };
  }
}

/**
 * Check Connected Accounts
 */
async function checkConnectedAccounts(): Promise<HealthCheckItem> {
  try {
    const publer = getPublerClient();
    const accounts = await publer.listConnectedAccounts();

    // Verify required accounts
    const requiredPlatforms = ["instagram", "facebook"];
    const connectedPlatforms = accounts.map((a) => a.platform);
    const missing = requiredPlatforms.filter(
      (p) => !connectedPlatforms.includes(p as any),
    );

    if (missing.length > 0) {
      return {
        status: "warn",
        message: `Missing accounts: ${missing.join(", ")}`,
        details: { connected: connectedPlatforms, missing },
      };
    }

    // Check for accounts requiring reauth
    const needsReauth = accounts.filter((a) => a.requires_reauth);
    if (needsReauth.length > 0) {
      return {
        status: "fail",
        message: `${needsReauth.length} account(s) need reauthorization`,
        details: { accounts: needsReauth.map((a) => a.platform) },
      };
    }

    return {
      status: "pass",
      message: `${accounts.length} accounts connected and active`,
      details: { accounts: accounts.map((a) => a.platform) },
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Failed to check accounts",
      details: { error: String(error) },
    };
  }
}

/**
 * Check Rate Limits
 */
async function checkRateLimits(): Promise<HealthCheckItem> {
  // TODO: Fetch actual rate limit headers from Publer API
  // X-RateLimit-Remaining, X-RateLimit-Reset

  return {
    status: "pass",
    message: "Rate limits OK (mock - no real limits)",
    details: {
      requests_remaining: 1000,
      posts_remaining: 100,
      resets_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Check Workspace Access
 */
async function checkWorkspaceAccess(): Promise<HealthCheckItem> {
  try {
    const publer = getPublerClient();

    // Mock client always has access
    // In production, would verify workspace permissions

    return {
      status: "pass",
      message: "Workspace access verified (mock)",
      details: { workspace_id: "mock-workspace-id" },
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Workspace access failed",
      details: { error: String(error) },
    };
  }
}

/**
 * Export Health Check Report
 *
 * Formats health check for logging/display.
 *
 * @param health - Health check results
 * @returns Markdown report
 */
export function exportHealthReport(health: PublerHealthCheck): string {
  const statusEmoji = (status: string) => {
    return status === "pass" ? "✅" : status === "warn" ? "⚠️" : "❌";
  };

  return `# Publer Health Check

**Timestamp:** ${health.timestamp}
**Overall:** ${health.healthy ? "✅ HEALTHY" : "❌ UNHEALTHY"}

## Checks

${statusEmoji(health.checks.authentication.status)} **Authentication:** ${health.checks.authentication.message}

${statusEmoji(health.checks.accounts_connected.status)} **Accounts:** ${health.checks.accounts_connected.message}

${statusEmoji(health.checks.rate_limits.status)} **Rate Limits:** ${health.checks.rate_limits.message}

${statusEmoji(health.checks.workspace_access.status)} **Workspace:** ${health.checks.workspace_access.message}

**Next Check:** ${health.next_check}
`;
}
