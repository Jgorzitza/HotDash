import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Classification = "success" | "failure" | "unknown";

interface NormalizedEntry {
  lineNumber: number;
  timestamp?: string;
  status?: string;
  statusCode?: number;
  successFlag?: boolean;
  errorCode?: string;
  errorMessage?: string;
  durationMs?: number;
  retryCount?: number;
  scope?: string;
  decisionId?: string;
}

interface ClassifiedEntry extends NormalizedEntry {
  classification: Classification;
}

interface ParseError {
  lineNumber: number;
  error: string;
  rawPreview: string;
}

interface AnalyzerSummary {
  generatedAt: string;
  source: string;
  timeWindow: {
    start: string;
    end: string;
  } | null;
  totals: {
    records: number;
    success: number;
    failure: number;
    unknown: number;
    failureRate: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  scopeBreakdown: Array<{ scope: string; count: number }>;
  durationsMs: {
    count: number;
    average: number;
    p50: number;
    p95: number;
    max: number;
  } | null;
  retries: {
    count: number;
    average: number;
    max: number;
    distribution: Record<string, number>;
  } | null;
  errors: {
    byCode: Array<{
      code: string;
      count: number;
      percentage: number;
      sampleMessages: string[];
    }>;
  };
  hourlyBuckets: Array<{
    hour: string;
    total: number;
    success: number;
    failure: number;
  }>;
  failureSamples: Array<{
    lineNumber: number;
    timestamp?: string;
    decisionId?: string;
    errorCode?: string;
    errorMessage?: string;
    retryCount?: number;
    durationMs?: number;
  }>;
  parse: {
    skippedLines: number;
    samples: ParseError[];
  };
  notes: string;
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNestedValue(
  source: Record<string, unknown>,
  pathKey: string,
): unknown {
  const parts = pathKey.split(".");
  let current: unknown = source;
  for (const part of parts) {
    if (!isRecord(current) || !(part in current)) {
      return undefined;
    }
    current = current[part as keyof typeof current];
  }
  return current;
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toString();
  }
  return undefined;
}

function toBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const lowered = value.toLowerCase();
    if (["true", "yes", "1", "success", "ok"].includes(lowered)) return true;
    if (["false", "no", "0", "fail", "failed", "error"].includes(lowered))
      return false;
  }
  return undefined;
}

function toNumberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    const parsed = Number.parseFloat(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function normalizeTimestamp(value: unknown): string | undefined {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(millis);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return undefined;
}

function normalizeRecord(
  record: Record<string, unknown>,
  lineNumber: number,
): NormalizedEntry {
  const timestamp =
    normalizeTimestamp(getNestedValue(record, "timestamp")) ??
    normalizeTimestamp(getNestedValue(record, "time")) ??
    normalizeTimestamp(getNestedValue(record, "loggedAt")) ??
    normalizeTimestamp(getNestedValue(record, "generatedAt")) ??
    normalizeTimestamp(getNestedValue(record, "createdAt")) ??
    normalizeTimestamp(getNestedValue(record, "metadata.generatedAt"));

  const status =
    toStringValue(getNestedValue(record, "status")) ??
    toStringValue(getNestedValue(record, "state")) ??
    toStringValue(getNestedValue(record, "outcome"));

  const statusCode =
    toNumberValue(getNestedValue(record, "statusCode")) ??
    toNumberValue(getNestedValue(record, "httpStatus")) ??
    toNumberValue(getNestedValue(record, "response.status"));

  const successFlag =
    toBooleanValue(getNestedValue(record, "success")) ??
    toBooleanValue(getNestedValue(record, "ok"));

  const errorCode =
    toStringValue(getNestedValue(record, "errorCode")) ??
    toStringValue(getNestedValue(record, "error_code")) ??
    toStringValue(getNestedValue(record, "error.code")) ??
    toStringValue(getNestedValue(record, "response.errorCode"));

  const errorMessageRaw =
    getNestedValue(record, "errorMessage") ??
    getNestedValue(record, "error_message") ??
    getNestedValue(record, "error") ??
    getNestedValue(record, "message") ??
    getNestedValue(record, "response.errorMessage");

  let errorMessage = toStringValue(errorMessageRaw);
  if (!errorMessage && isRecord(errorMessageRaw)) {
    try {
      errorMessage = JSON.stringify(errorMessageRaw);
    } catch {
      errorMessage = "[unserializable error payload]";
    }
  }

  const durationCandidate =
    toNumberValue(getNestedValue(record, "durationMs")) ??
    toNumberValue(getNestedValue(record, "duration_ms")) ??
    toNumberValue(getNestedValue(record, "duration")) ??
    toNumberValue(getNestedValue(record, "latencyMs")) ??
    toNumberValue(getNestedValue(record, "metrics.durationMs"));

  const durationMs =
    typeof durationCandidate === "number" && durationCandidate < 10
      ? durationCandidate * 1000
      : durationCandidate;

  let retryCount =
    toNumberValue(getNestedValue(record, "retryCount")) ??
    toNumberValue(getNestedValue(record, "retry_count")) ??
    toNumberValue(getNestedValue(record, "retries"));

  if (retryCount === undefined) {
    const attemptValue =
      toNumberValue(getNestedValue(record, "attempt")) ??
      toNumberValue(getNestedValue(record, "attemptCount"));
    if (typeof attemptValue === "number" && Number.isFinite(attemptValue)) {
      retryCount = Math.max(0, attemptValue - 1);
    }
  }

  const scope =
    toStringValue(getNestedValue(record, "scope")) ??
    toStringValue(getNestedValue(record, "context.scope"));

  const decisionId =
    toStringValue(getNestedValue(record, "decisionId")) ??
    toStringValue(getNestedValue(record, "decision_id")) ??
    toStringValue(getNestedValue(record, "id"));

  return {
    lineNumber,
    timestamp,
    status,
    statusCode,
    successFlag,
    errorCode,
    errorMessage,
    durationMs:
      typeof durationMs === "number" && Number.isFinite(durationMs)
        ? durationMs
        : undefined,
    retryCount:
      typeof retryCount === "number" && Number.isFinite(retryCount)
        ? retryCount
        : undefined,
    scope,
    decisionId,
  };
}

function classify(entry: NormalizedEntry): Classification {
  if (typeof entry.successFlag === "boolean") {
    return entry.successFlag ? "success" : "failure";
  }

  const status = entry.status?.toLowerCase();
  if (status) {
    if (SUCCESS_STATUSES.has(status)) return "success";
    if (FAILURE_STATUSES.has(status)) return "failure";
  }

  if (typeof entry.statusCode === "number") {
    if (entry.statusCode >= 200 && entry.statusCode < 400) return "success";
    if (entry.statusCode >= 400) return "failure";
  }

  if (entry.errorCode || entry.errorMessage) {
    return "failure";
  }

  if (status) {
    return "unknown";
  }

  return "unknown";
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[index];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function hourBucket(timestamp: string): string | undefined {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return undefined;
  const hour = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
    ),
  );
  return hour.toISOString();
}

function parseArgs(): { inputPath: string; outputPath?: string } {
  const args = process.argv.slice(2);
  let inputPath: string | undefined;
  let outputPath: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--input" || arg === "-i") {
      inputPath = args[index + 1];
      index += 1;
    } else if (arg === "--output" || arg === "-o") {
      outputPath = args[index + 1];
      index += 1;
    } else if (!inputPath) {
      inputPath = arg;
    } else {
      throw new Error(`Unrecognized argument "${arg}"`);
    }
  }

  if (!inputPath) {
    throw new Error(
      "Missing input path. Use --input <path> or provide as a positional argument.",
    );
  }

  return { inputPath, outputPath };
}

function buildSummary(
  entries: ClassifiedEntry[],
  parseErrors: ParseError[],
  sourcePath: string,
): AnalyzerSummary {
  const statusBreakdown = new Map<string, number>();
  const scopeBreakdown = new Map<string, number>();
  const durations: number[] = [];
  const retryValues: number[] = [];
  const retryDistribution = new Map<number, number>();
  const errorBuckets = new Map<
    string,
    { count: number; messages: Set<string> }
  >();
  const hourly = new Map<
    string,
    { total: number; success: number; failure: number }
  >();

  let successCount = 0;
  let failureCount = 0;
  let unknownCount = 0;
  let earliest: string | undefined;
  let latest: string | undefined;

  for (const entry of entries) {
    if (entry.timestamp) {
      if (!earliest || entry.timestamp < earliest) earliest = entry.timestamp;
      if (!latest || entry.timestamp > latest) latest = entry.timestamp;
      const bucket = hourBucket(entry.timestamp);
      if (bucket) {
        const current = hourly.get(bucket) ?? {
          total: 0,
          success: 0,
          failure: 0,
        };
        current.total += 1;
        if (entry.classification === "success") current.success += 1;
        if (entry.classification === "failure") current.failure += 1;
        hourly.set(bucket, current);
      }
    }

    if (entry.status) {
      const count = statusBreakdown.get(entry.status) ?? 0;
      statusBreakdown.set(entry.status, count + 1);
    }

    if (entry.scope) {
      const count = scopeBreakdown.get(entry.scope) ?? 0;
      scopeBreakdown.set(entry.scope, count + 1);
    }

    if (typeof entry.durationMs === "number") {
      durations.push(entry.durationMs);
    }

    if (typeof entry.retryCount === "number") {
      retryValues.push(entry.retryCount);
      const rounded = Math.max(0, Math.round(entry.retryCount));
      const count = retryDistribution.get(rounded) ?? 0;
      retryDistribution.set(rounded, count + 1);
    }

    if (entry.classification === "success") {
      successCount += 1;
    } else if (entry.classification === "failure") {
      failureCount += 1;
      const bucketKey =
        entry.errorCode ?? entry.errorMessage ?? entry.status ?? "unknown";
      const bucket = errorBuckets.get(bucketKey) ?? {
        count: 0,
        messages: new Set<string>(),
      };
      bucket.count += 1;
      if (entry.errorMessage) {
        bucket.messages.add(entry.errorMessage);
      }
      errorBuckets.set(bucketKey, bucket);
    } else {
      unknownCount += 1;
    }
  }

  const totalRecords = entries.length;
  const knownTotal = successCount + failureCount;
  const failureRate = knownTotal === 0 ? 0 : failureCount / knownTotal;

  const durationsSummary =
    durations.length === 0
      ? null
      : {
          count: durations.length,
          average: round(average(durations)),
          p50: round(percentile(durations, 50)),
          p95: round(percentile(durations, 95)),
          max: round(Math.max(...durations)),
        };

  const retriesSummary =
    retryValues.length === 0
      ? null
      : {
          count: retryValues.length,
          average: round(average(retryValues)),
          max: Math.max(...retryValues),
          distribution: Object.fromEntries(
            [...retryDistribution.entries()]
              .sort((a, b) => a[0] - b[0])
              .map(([key, value]) => [key.toString(), value]),
          ),
        };

  const errorsByCode = [...errorBuckets.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([code, bucket]) => ({
      code,
      count: bucket.count,
      percentage:
        failureCount === 0 ? 0 : round((bucket.count / failureCount) * 100),
      sampleMessages: [...bucket.messages].slice(0, 5),
    }));

  const hourlyBuckets = [...hourly.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hour, bucket]) => ({
      hour,
      total: bucket.total,
      success: bucket.success,
      failure: bucket.failure,
    }));

  return {
    generatedAt: new Date().toISOString(),
    source: path.resolve(sourcePath),
    timeWindow: earliest && latest ? { start: earliest, end: latest } : null,
    totals: {
      records: totalRecords,
      success: successCount,
      failure: failureCount,
      unknown: unknownCount,
      failureRate: round(failureRate, 4),
    },
    statusBreakdown: [...statusBreakdown.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({ status, count })),
    scopeBreakdown: [...scopeBreakdown.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([scope, count]) => ({ scope, count })),
    durationsMs: durationsSummary,
    retries: retriesSummary,
    errors: { byCode: errorsByCode },
    hourlyBuckets,
    failureSamples: entries
      .filter((entry) => entry.classification === "failure")
      .slice(0, 10)
      .map((entry) => ({
        lineNumber: entry.lineNumber,
        timestamp: entry.timestamp,
        decisionId: entry.decisionId,
        errorCode: entry.errorCode,
        errorMessage: entry.errorMessage,
        retryCount: entry.retryCount,
        durationMs: entry.durationMs,
      })),
    parse: {
      skippedLines: parseErrors.length,
      samples: parseErrors.slice(0, 5),
    },
    notes: "Generated by scripts/ops/analyze-supabase-logs.ts",
  };
}

async function main() {
  const { inputPath, outputPath } = parseArgs();
  const resolvedInput = path.resolve(inputPath);

  const raw = await readFile(resolvedInput, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");

  const entries: ClassifiedEntry[] = [];
  const parseErrors: ParseError[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      parseErrors.push({
        lineNumber,
        error: error instanceof Error ? error.message : "Unknown parse error",
        rawPreview: line.slice(0, 200),
      });
      return;
    }

    if (!isRecord(parsed)) {
      parseErrors.push({
        lineNumber,
        error: "Line is not a JSON object",
        rawPreview: line.slice(0, 200),
      });
      return;
    }

    const normalized = normalizeRecord(parsed, lineNumber);
    const classification = classify(normalized);
    entries.push({ ...normalized, classification });
  });

  const summary = buildSummary(entries, parseErrors, resolvedInput);

  const artifactsDir = path.resolve("artifacts/monitoring");
  await mkdir(artifactsDir, { recursive: true });

  const summaryJson = `${JSON.stringify(summary, null, 2)}\n`;

  const latestPath = path.join(
    artifactsDir,
    "supabase-sync-summary-latest.json",
  );
  await writeFile(latestPath, summaryJson, "utf8");

  if (outputPath) {
    const resolvedOutput = path.resolve(outputPath);
    await mkdir(path.dirname(resolvedOutput), { recursive: true });
    await writeFile(resolvedOutput, summaryJson, "utf8");
  } else {
    const slug = summary.generatedAt.replace(/[:.]/g, "-");
    const timestampedPath = path.join(
      artifactsDir,
      `supabase-sync-summary-${slug}.json`,
    );
    await writeFile(timestampedPath, summaryJson, "utf8");
  }

  console.log(summaryJson);

  if (summary.parse.skippedLines > 0) {
    console.warn(
      `Skipped ${summary.parse.skippedLines} line(s); inspect summary.parse.samples for details.`,
    );
  }
}

main().catch((error) => {
  console.error("Supabase log analysis failed", error);
  process.exitCode = 1;
});
