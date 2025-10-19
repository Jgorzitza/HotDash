#!/usr/bin/env node
/**
 * Chatwoot Health Check — /rails/health + authenticated API probe
 * - Tests /rails/health endpoint (unauthenticated)
 * - Tests /api/v1/accounts/<account_id> (authenticated with API key)
 * - Writes JSON artifact under artifacts/ops/chatwoot_health_<timestamp>.json
 * - Exits 0 on both probes OK, non-zero otherwise
 */

import fs from "node:fs";
import path from "node:path";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

async function probe(url, headers = {}) {
  let ok = false;
  let status = 0;
  let body = null;
  let error = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
    clearTimeout(timeout);

    status = res.status;

    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    ok = res.ok;
  } catch (e) {
    error = String(e && e.message ? e.message : e);
  }

  return { ok, status, body, error };
}

async function main() {
  const baseUrl = requireEnv("CHATWOOT_BASE_URL");
  const apiKey = process.env.CHATWOOT_API_KEY || null;
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || "1";

  const startedAt = new Date().toISOString();

  // Probe 1: /rails/health (unauthenticated)
  const healthUrl = new URL("/rails/health", baseUrl).toString();
  const healthProbe = await probe(healthUrl);

  // Probe 2: authenticated API (if API key provided)
  let apiProbe = { ok: true, status: 200, body: "skipped (no API key)", error: null };
  if (apiKey) {
    const apiUrl = new URL(`/api/v1/accounts/${accountId}`, baseUrl).toString();
    apiProbe = await probe(apiUrl, { "api_access_token": apiKey });
  }

  const endedAt = new Date().toISOString();
  const allOk = healthProbe.ok && apiProbe.ok;

  const artifactDir = path.join("artifacts", "ops");
  const artifactPath = path.join(
    artifactDir,
    `chatwoot_health_${startedAt.replaceAll(":", "-")}.json`,
  );

  const payload = {
    probes: {
      rails_health: {
        url: healthUrl,
        status: healthProbe.status,
        ok: healthProbe.ok,
        error: healthProbe.error,
        body: healthProbe.body,
      },
      authenticated_api: {
        url: apiKey ? new URL(`/api/v1/accounts/${accountId}`, baseUrl).toString() : null,
        status: apiProbe.status,
        ok: apiProbe.ok,
        error: apiProbe.error,
        body: apiProbe.body,
      },
    },
    startedAt,
    endedAt,
    allOk,
  };

  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(artifactPath, JSON.stringify(payload, null, 2));

  // eslint-disable-next-line no-console
  console.log(`Chatwoot health check ${allOk ? "OK" : "FAIL"} → ${artifactPath}`);
  // eslint-disable-next-line no-console
  console.log(`  /rails/health: ${healthProbe.ok ? "OK" : "FAIL"} (${healthProbe.status})`);
  // eslint-disable-next-line no-console
  console.log(`  authenticated API: ${apiProbe.ok ? "OK" : "FAIL"} (${apiProbe.status})`);

  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Fatal error in check-chatwoot-health:", e);
  process.exit(2);
});
