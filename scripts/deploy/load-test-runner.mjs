#!/usr/bin/env node

/**
 * Lightweight HTTP load test runner (k6 fallback)
 * Simulates staged concurrency against HotDash production endpoints.
 */

import { setTimeout as sleep } from 'node:timers/promises';

const BASE_URL = process.env.LOAD_TEST_BASE_URL || 'https://hotdash-production.fly.dev';

const defaultOutput = new URL(
  `../artifacts/devops/${new Date().toISOString().slice(0, 10)}/load-test-results.json`,
  import.meta.url,
);
const OUTPUT_PATH = process.env.LOAD_TEST_OUTPUT
  ? process.env.LOAD_TEST_OUTPUT
  : defaultOutput;

// Stage definition mirrors k6 script: duration (seconds) + target concurrency.
const STAGES = [
  { duration: 120, target: 100 },
  { duration: 180, target: 300 },
  { duration: 180, target: 600 },
  { duration: 120, target: 1000 },
  { duration: 300, target: 1000 },
  { duration: 120, target: 500 },
  { duration: 120, target: 0 },
];

const configuredStages = process.env.LOAD_TEST_STAGES
  ? JSON.parse(process.env.LOAD_TEST_STAGES)
  : STAGES;

const METRICS = {
  totalRequests: 0,
  failedRequests: 0,
  durations: [],
  stages: [],
  errors: {},
};

async function hitEndpoint(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const start = performance.now();

  try {
    const response = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
    const duration = performance.now() - start;
    METRICS.durations.push(duration);
    if (!response.ok) {
      METRICS.failedRequests += 1;
      const key = `http_${response.status}`;
      METRICS.errors[key] = (METRICS.errors[key] || 0) + 1;
    }
  } catch (error) {
    METRICS.failedRequests += 1;
    const key = error && error.name ? `${error.name}:${error.message ?? ''}` : 'unknown_error';
    METRICS.errors[key] = (METRICS.errors[key] || 0) + 1;
  } finally {
    clearTimeout(timeout);
    METRICS.totalRequests += 1;
  }
}

async function worker(endTime) {
  while (performance.now() < endTime) {
    await Promise.all([
      hitEndpoint('/health'),
      hitEndpoint('/api/monitoring/health'),
      hitEndpoint('/'),
    ]);
    // Allow event loop breathing room to prevent runaway memory usage.
    await sleep(1000);
  }
}

function pct(values, percentile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function runStage({ duration, target, timeout }) {
  const stageStart = performance.now();
  const stageTimeoutMs = timeout != null ? timeout * 1000 : duration * 1000 * 2;
  const stageDeadline = stageStart + stageTimeoutMs;
  const stageEnd = stageStart + duration * 1000;
  const baselineDurations = METRICS.durations.length;
  const baselineRequests = METRICS.totalRequests;
  const baselineFailures = METRICS.failedRequests;

  const workers = [];
  for (let i = 0; i < target; i += 1) {
    workers.push(worker(stageEnd));
  }

  await Promise.race([
    Promise.all(workers),
    (async () => {
      while (performance.now() < stageDeadline) {
        await sleep(250);
      }
      throw new Error(`stage_timeout`);
    })(),
  ]);

  const stageDurations = METRICS.durations.slice(baselineDurations);
  METRICS.stages.push({
    durationSeconds: duration,
    targetConcurrency: target,
    requests: METRICS.totalRequests - baselineRequests,
    failures: METRICS.failedRequests - baselineFailures,
    p95Ms: pct(stageDurations, 95),
  });
}

async function main() {
  console.log('⚙️  Running fallback load test');
  console.log(`   Target: ${BASE_URL}`);
  const outputPathString = typeof OUTPUT_PATH === 'string' ? OUTPUT_PATH : OUTPUT_PATH.pathname;
  console.log(`   Output: ${outputPathString}`);

  for (const stage of configuredStages) {
    console.log(`   Stage: ${stage.duration}s @ ${stage.target} users`);
    try {
      await runStage(stage);
    } catch (error) {
      console.error(`❌ Stage failed: ${error instanceof Error ? error.message : error}`);
      METRICS.errors.stage_failure = (METRICS.errors.stage_failure || 0) + 1;
      break;
    }
  }

  const summary = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    totalRequests: METRICS.totalRequests,
    failedRequests: METRICS.failedRequests,
    errorRate: METRICS.totalRequests === 0 ? 0 : METRICS.failedRequests / METRICS.totalRequests,
    p95: pct(METRICS.durations, 95),
    p99: pct(METRICS.durations, 99),
    durations: {
      average: METRICS.durations.length
        ? METRICS.durations.reduce((acc, val) => acc + val, 0) / METRICS.durations.length
        : 0,
      min: METRICS.durations.length ? Math.min(...METRICS.durations) : 0,
      max: METRICS.durations.length ? Math.max(...METRICS.durations) : 0,
    },
    stages: METRICS.stages,
    errors: METRICS.errors,
  };

  console.log('📊 Summary');
  console.log(JSON.stringify(summary, null, 2));

  const fs = await import('node:fs/promises');
  const outputPath = typeof OUTPUT_PATH === 'string' ? OUTPUT_PATH : OUTPUT_PATH.pathname;
  const outputDir = outputPath.substring(0, outputPath.lastIndexOf('/'));
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error('❌ Load test failed', error);
  process.exit(1);
});
