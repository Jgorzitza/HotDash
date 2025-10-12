#!/usr/bin/env node
/**
 * Simple synthetic availability check used by deployment scripts.
 * Fetches the target URL, measures latency, and writes a JSON artifact.
 */

import { performance } from "node:perf_hooks";
import process from "node:process";
import { setDefaultResultOrder } from "node:dns";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

setDefaultResultOrder("ipv4first");

const now = () => new Date().toISOString();

function getTargetUrl() {
  const target =
    process.env.SYNTHETIC_CHECK_URL ??
    process.env.STAGING_SMOKE_TEST_URL ??
    process.env.PRODUCTION_SMOKE_TEST_URL;

  if (!target) {
    console.error("[synthetic-check] No target URL provided via SYNTHETIC_CHECK_URL / STAGING_SMOKE_TEST_URL / PRODUCTION_SMOKE_TEST_URL.");
    process.exitCode = 1;
  }
  return target;
}

function getBudget() {
  const rawBudget =
    process.env.SYNTHETIC_CHECK_BUDGET_MS ??
    (process.env.SHOPIFY_FLAG_ENVIRONMENT === "staging" ? "300" : undefined) ??
    "800";

  const parsed = Number(rawBudget);
  return Number.isFinite(parsed) ? parsed : 800;
}

async function writeArtifact(filePath, payload) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

async function main() {
  const target = getTargetUrl();
  if (!target) return;

  const budgetMs = getBudget();
  const startedAt = performance.now();

  let response;
  let error;

  try {
    response = await fetch(target, {
      method: "GET",
      headers: {
        "User-Agent":
          process.env.SYNTHETIC_CHECK_USER_AGENT ??
          "Shopify POS/HotDashSyntheticCheck",
        Accept: "text/html,application/json",
        "X-Hotdash-Synthetic": process.env.SYNTHETIC_CHECK_TOKEN ?? "staging",
      },
    });
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const finishedAt = performance.now();
  const durationMs = Number((finishedAt - startedAt).toFixed(2));

  const artifactPayload = {
    timestamp: now(),
    target,
    budgetMs,
    durationMs,
    status: response?.status ?? null,
    ok: Boolean(response?.ok),
    error: error ?? null,
  };

  const artifactPath =
    process.env.SYNTHETIC_CHECK_ARTIFACT ??
    path.join(
      "artifacts",
      "monitoring",
      `synthetic-check-${artifactPayload.timestamp.replace(/[:]/g, "-")}.json`,
    );

  await writeArtifact(artifactPath, artifactPayload);

  if (error) {
    console.error(`[synthetic-check] Failed: ${error}`);
    console.error(`[synthetic-check] Artifact: ${artifactPath}`);
    process.exit(1);
    return;
  }

  const statusLine = `[synthetic-check] ${target} status=${response.status} duration=${durationMs}ms budget=${budgetMs}ms artifact=${artifactPath}`;
  console.log(statusLine);

  if (!response.ok || durationMs > budgetMs) {
    console.error("[synthetic-check] Check failed (status or budget overrun).");
    process.exit(1);
    return;
  }
}

await main();
