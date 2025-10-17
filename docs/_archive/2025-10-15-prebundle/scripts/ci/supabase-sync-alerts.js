#!/usr/bin/env node
/**
 * Supabase decision sync monitor.
 * Reads decision sync telemetry (NDJSON file or Supabase table),
 * produces a structured summary artifact, and exits non-zero when thresholds fail.
 */

import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";

const SUCCESS_STATUSES = new Set(["success", "ok", "completed", "synced"]);

const FAILURE_STATUSES = new Set([
  "failure",
  "failed",
  "error",
  "timeout",
  "timed_out",
  "fatal",
  "rejected",
]);

const DEFAULT_FAILURE_RATE = 0.1; // 10%
const DEFAULT_P95_THRESHOLD_MS = 1000;
const DEFAULT_MIN_SAMPLES = 5;
const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function parseArgs(argv) {
  const options = new Map();
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const [rawKey, rawValue] = arg.split("=", 2);
    const key = rawKey.slice(2);
    if (rawValue !== undefined) {
      options.set(key, rawValue);
    } else {
      options.set(key, "true");
    }
  }
  return options;
}

function toNumber(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toIsoString(value) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

function determineClassification(record) {
  const rawStatus =
    record.status ?? record.state ?? record.outcome ?? record.result ?? null;

  const status = typeof rawStatus === "string" ? rawStatus.toLowerCase() : null;

  const explicitSuccess =
    record.success === true ||
    record.ok === true ||
    (typeof record.successFlag === "boolean" && record.successFlag);
  const explicitFailure =
    record.success === false ||
    record.ok === false ||
    record.retryable === false ||
    (typeof record.successFlag === "boolean" && !record.successFlag);

  if (explicitSuccess) return "success";
  if (explicitFailure) return "failure";
  if (status && SUCCESS_STATUSES.has(status)) return "success";
  if (status && FAILURE_STATUSES.has(status)) return "failure";
  if (record.errorCode || record.error_message || record.errorMessage) {
    return "failure";
  }
  return "unknown";
}

function computePercentile(sortedValues, percentile) {
  if (!sortedValues.length) return null;
  if (sortedValues.length === 1) return sortedValues[0];
  const index = (sortedValues.length - 1) * (percentile / 100);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  const lowerValue = sortedValues[lower];
  const upperValue = sortedValues[upper];
  return Number((lowerValue + (upperValue - lowerValue) * weight).toFixed(2));
}

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((total, item) => total + item, 0);
  return Number((sum / values.length).toFixed(2));
}

async function readNdjsonLines(filePath) {
  await stat(filePath);
  const input = createReadStream(filePath, { encoding: "utf8" });
  const reader = readline.createInterface({ input, crlfDelay: Infinity });

  const records = [];
  for await (const line of reader) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      records.push(JSON.parse(trimmed));
    } catch (error) {
      records.push({
        _raw: trimmed,
        _error: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
  return records;
}

async function fetchSupabaseRecords(options) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const table = process.env.SUPABASE_SYNC_TABLE ?? "decision_sync_events";
  const scope = process.env.SUPABASE_SYNC_SCOPE ?? "ops";

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_KEY are required to fetch Supabase records.",
    );
  }

  const minutes = toNumber(
    options.get("since-minutes") ?? process.env.SUPABASE_SYNC_SINCE_MINUTES,
    90,
  );

  const since = new Date(Date.now() - minutes * 60_000);
  const sinceIso = since.toISOString();

  const query = new URL(`${url.replace(/\/$/, "")}/rest/v1/${table}`);

  const params = [
    "select=decisionId,status,durationMs,errorCode,attempt,timestamp,scope",
    "order=timestamp.desc",
    `timestamp=gte.${encodeURIComponent(sinceIso)}`,
    scope ? `scope=eq.${encodeURIComponent(scope)}` : null,
  ].filter(Boolean);

  if (params.length) {
    query.search = params.join("&");
  }

  const response = await fetch(query, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Supabase request failed (${response.status} ${response.statusText}): ${text}`,
    );
  }

  const records = await response.json();
  if (!Array.isArray(records)) {
    throw new Error("Supabase response was not an array.");
  }

  return records;
}

async function loadRecords(options) {
  const inputPath =
    options.get("input") ?? process.env.SUPABASE_DECISION_SYNC_LOG_PATH ?? null;

  if (inputPath) {
    return readNdjsonLines(inputPath);
  }

  return fetchSupabaseRecords(options);
}

function summarise(records) {
  const summary = {
    total: 0,
    success: 0,
    failure: 0,
    unknown: 0,
    failures: [],
    statuses: {},
    errorCodes: {},
    durations: [],
    timestamps: [],
    parseErrors: [],
  };

  for (const record of records) {
    if (record?._error) {
      summary.parseErrors.push({
        error: record._error,
        raw: record._raw,
      });
      summary.unknown += 1;
      summary.total += 1;
      continue;
    }

    if (!record || typeof record !== "object") {
      summary.unknown += 1;
      summary.total += 1;
      continue;
    }

    summary.total += 1;

    const classification = determineClassification(record);
    summary[classification] += 1;

    if (record.status) {
      const normalized = String(record.status).toLowerCase();
      summary.statuses[normalized] = (summary.statuses[normalized] ?? 0) + 1;
    }

    if (record.errorCode) {
      const code = String(record.errorCode).toLowerCase();
      summary.errorCodes[code] = (summary.errorCodes[code] ?? 0) + 1;
    }

    const timestamp = toIsoString(
      record.timestamp ?? record.loggedAt ?? record.time,
    );
    if (timestamp) {
      summary.timestamps.push(timestamp);
    }

    const duration = Number(record.durationMs ?? record.duration_ms ?? 0);
    if (Number.isFinite(duration) && duration > 0) {
      summary.durations.push(Number(duration.toFixed(2)));
    }

    if (classification === "failure") {
      summary.failures.push({
        decisionId: record.decisionId ?? record.id ?? null,
        status: record.status ?? null,
        errorCode: record.errorCode ?? null,
        errorMessage: record.errorMessage ?? record.error_message ?? null,
        durationMs: Number.isFinite(duration) ? duration : null,
        attempt: record.attempt ?? record.retryCount ?? null,
        timestamp,
      });
    }
  }

  summary.durationStats = (() => {
    if (!summary.durations.length) {
      return null;
    }
    const sorted = [...summary.durations].sort((a, b) => a - b);
    return {
      count: sorted.length,
      averageMs: average(sorted),
      p50Ms: computePercentile(sorted, 50),
      p95Ms: computePercentile(sorted, 95),
      maxMs: sorted[sorted.length - 1],
    };
  })();

  summary.failureRate = summary.total
    ? Number((summary.failure / summary.total).toFixed(4))
    : 0;

  summary.window = (() => {
    if (!summary.timestamps.length) {
      return null;
    }
    const sorted = [...summary.timestamps].sort();
    return {
      start: sorted[0],
      end: sorted[sorted.length - 1],
    };
  })();

  summary.parseErrorCount = summary.parseErrors.length;
  if (summary.failures.length > 10) {
    summary.failures = summary.failures.slice(0, 10);
  }

  return summary;
}

async function writeArtifact(summary, options) {
  const artifactPath =
    options.get("artifact") ??
    process.env.SUPABASE_SYNC_ALERT_ARTIFACT ??
    path.join(
      "artifacts",
      "monitoring",
      `supabase-sync-alert-${summary.generatedAt.replace(/[:]/g, "-")}.json`,
    );

  await mkdir(path.dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, JSON.stringify(summary, null, 2), {
    encoding: "utf8",
  });
  summary.artifactPath = artifactPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const failureThreshold = toNumber(
    options.get("max-failure-rate") ??
      process.env.SUPABASE_SYNC_MAX_FAILURE_RATE,
    DEFAULT_FAILURE_RATE,
  );
  const p95Threshold = toNumber(
    options.get("max-p95-ms") ?? process.env.SUPABASE_SYNC_MAX_P95_MS,
    DEFAULT_P95_THRESHOLD_MS,
  );
  const minSamples = Math.max(
    0,
    Math.floor(
      toNumber(
        options.get("min-samples") ?? process.env.SUPABASE_SYNC_MIN_SAMPLES,
        DEFAULT_MIN_SAMPLES,
      ),
    ),
  );

  const records = await loadRecords(options);
  const summary = summarise(records);
  summary.generatedAt = new Date().toISOString();
  summary.thresholds = {
    failureRate: failureThreshold,
    p95Ms: p95Threshold,
    minSamples,
  };

  const alerts = [];
  let exitCode = 0;

  if (summary.total < minSamples) {
    summary.status = "insufficient-data";
    summary.alertReasons = ["Insufficient samples"];
    console.warn(
      `[supabase-sync-alerts] Only ${summary.total} samples available (< ${minSamples}).`,
    );
  } else {
    if (summary.failureRate > failureThreshold) {
      alerts.push(
        `Failure rate ${summary.failureRate} exceeds threshold ${failureThreshold}`,
      );
    }

    if (summary.durationStats?.p95Ms) {
      if (summary.durationStats.p95Ms > p95Threshold) {
        alerts.push(
          `p95 ${summary.durationStats.p95Ms}ms exceeds threshold ${p95Threshold}ms`,
        );
      }
    } else {
      alerts.push("Missing duration data");
    }

    if (alerts.length) {
      exitCode = 1;
      summary.status = "alert";
    } else {
      summary.status = "ok";
    }
    summary.alertReasons = alerts;
  }

  if (alerts.length) {
    console.error("[supabase-sync-alerts] Alerts triggered:");
    for (const reason of alerts) {
      console.error(` - ${reason}`);
    }
  }

  await writeArtifact(summary, options);
  console.log(JSON.stringify(summary, null, 2));
  process.exit(exitCode);
}

main().catch((error) => {
  console.error("[supabase-sync-alerts] Unexpected failure:", error);
  process.exit(1);
});
