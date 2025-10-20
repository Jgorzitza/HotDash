#!/usr/bin/env node
/**
 * Chatwoot Health Check Script
 *
 * Verifies Chatwoot is operational by checking:
 * 1. /rails/health endpoint (Chatwoot platform health)
 * 2. Authenticated API access via /api/v1/profile
 *
 * Usage:
 *   npm run ops:check-chatwoot-health
 *   or: ./scripts/ops/check-chatwoot-health.mjs
 *
 * Exit codes:
 *   0 - All checks pass (healthy)
 *   1 - Configuration missing
 *   2 - Health endpoint failed
 *   3 - Authenticated API failed
 *   4 - Both checks failed
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ARTIFACT_DIR = "artifacts/ops/chatwoot-health";
const TIMEOUT_MS = 10000;

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    warn: `${colors.yellow}⚠${colors.reset}`,
  }[level] || "•";

  console.log(`${prefix} ${timestamp} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function checkRailsHealth(baseUrl) {
  const url = `${baseUrl}/rails/health`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    return {
      name: "rails_health",
      url,
      status: response.ok ? "pass" : "fail",
      httpStatus: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      name: "rails_health",
      url,
      status: "fail",
      error: error.message,
      errorType: error.name,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkAuthenticatedAPI(baseUrl, token) {
  const url = `${baseUrl}/api/v1/profile`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        api_access_token: token,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    let responseData = null;
    if (response.ok) {
      try {
        responseData = await response.json();
      } catch {
        // Ignore JSON parse errors
      }
    }

    return {
      name: "authenticated_api",
      url,
      status: response.ok ? "pass" : "fail",
      httpStatus: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      accountId: responseData?.id || null,
      accountName: responseData?.name || null,
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      name: "authenticated_api",
      url,
      status: "fail",
      error: error.message,
      errorType: error.name,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function saveArtifact(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `health-check-${timestamp}.json`;

  try {
    await mkdir(ARTIFACT_DIR, { recursive: true });
    const filepath = join(ARTIFACT_DIR, filename);
    await writeFile(filepath, JSON.stringify(results, null, 2));
    log("info", `Artifact saved: ${filepath}`);
  } catch (error) {
    log("warn", `Failed to save artifact: ${error.message}`);
  }
}

async function main() {
  console.log(`\n${colors.bold}${colors.blue}Chatwoot Health Check${colors.reset}\n`);

  // Check environment variables
  const baseUrl = process.env.CHATWOOT_BASE_URL;
  const token = process.env.CHATWOOT_API_TOKEN || process.env.CHATWOOT_TOKEN;

  if (!baseUrl) {
    log("error", "CHATWOOT_BASE_URL environment variable not set");
    console.log("\nRequired environment variables:");
    console.log("  - CHATWOOT_BASE_URL");
    console.log("  - CHATWOOT_API_TOKEN or CHATWOOT_TOKEN");
    process.exit(1);
  }

  if (!token) {
    log("error", "CHATWOOT_API_TOKEN or CHATWOOT_TOKEN environment variable not set");
    process.exit(1);
  }

  log("info", `Checking Chatwoot instance: ${baseUrl}`);

  // Run health checks
  const railsHealth = await checkRailsHealth(baseUrl);
  const apiHealth = await checkAuthenticatedAPI(baseUrl, token);

  // Display results
  console.log(`\n${colors.bold}Results:${colors.reset}\n`);

  // Rails Health Check
  if (railsHealth.status === "pass") {
    log("success", `Rails Health: ${railsHealth.httpStatus} (${railsHealth.duration})`);
  } else {
    log("error", `Rails Health: Failed (${railsHealth.duration})`, {
      httpStatus: railsHealth.httpStatus,
      error: railsHealth.error,
    });
  }

  // Authenticated API Check
  if (apiHealth.status === "pass") {
    log("success", `Authenticated API: ${apiHealth.httpStatus} (${apiHealth.duration})`);
    if (apiHealth.accountId) {
      console.log(`  Account ID: ${apiHealth.accountId}`);
    }
    if (apiHealth.accountName) {
      console.log(`  Account Name: ${apiHealth.accountName}`);
    }
  } else {
    log("error", `Authenticated API: Failed (${apiHealth.duration})`, {
      httpStatus: apiHealth.httpStatus,
      error: apiHealth.error,
    });
  }

  // Save results
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl,
    checks: [railsHealth, apiHealth],
    summary: {
      total: 2,
      passed: [railsHealth, apiHealth].filter((c) => c.status === "pass").length,
      failed: [railsHealth, apiHealth].filter((c) => c.status === "fail").length,
    },
  };

  await saveArtifact(results);

  // Determine exit code
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Total checks: ${results.summary.total}`);
  console.log(`  Passed: ${colors.green}${results.summary.passed}${colors.reset}`);
  console.log(`  Failed: ${results.summary.failed > 0 ? colors.red : colors.reset}${results.summary.failed}${colors.reset}\n`);

  if (railsHealth.status === "pass" && apiHealth.status === "pass") {
    log("success", "All Chatwoot health checks passed");
    process.exit(0);
  } else if (railsHealth.status === "fail" && apiHealth.status === "fail") {
    log("error", "All Chatwoot health checks failed");
    process.exit(4);
  } else if (railsHealth.status === "fail") {
    log("error", "Rails health check failed");
    process.exit(2);
  } else {
    log("error", "Authenticated API check failed");
    process.exit(3);
  }
}

main().catch((error) => {
  log("error", "Unexpected error", { error: error.message, stack: error.stack });
  process.exit(1);
});

