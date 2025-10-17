# Performance Testing Framework

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Status**: Ready for Implementation

---

## Executive Summary

This document defines the performance testing framework for HotDash, with specific focus on the Agent SDK approval queue and MCP integrations. The framework establishes performance budgets, load test scenarios, benchmarking scripts, and Lighthouse CI integration.

**Performance Philosophy**: Operator-first means sub-100ms perceived latency for UI interactions and <500ms for MCP integrations.

---

## Performance Budgets

### Route Performance Targets

| Route Category    | Target P50 | Target P95 | Target P99 | Budget     |
| ----------------- | ---------- | ---------- | ---------- | ---------- |
| Static pages      | <50ms      | <100ms     | <200ms     | Core UX    |
| Dashboard tiles   | <100ms     | <200ms     | <500ms     | Critical   |
| Approval queue    | <150ms     | <300ms     | <600ms     | Critical   |
| Settings/admin    | <200ms     | <400ms     | <800ms     | Standard   |
| Reports/analytics | <500ms     | <1000ms    | <2000ms    | Acceptable |

### API Performance Targets

| Endpoint                    | Target P50 | Target P95 | Target P99 | Budget     |
| --------------------------- | ---------- | ---------- | ---------- | ---------- |
| GET /api/approvals/queue    | <50ms      | <100ms     | <200ms     | Critical   |
| POST /api/approvals/approve | <100ms     | <200ms     | <400ms     | Critical   |
| POST /api/approvals/reject  | <100ms     | <200ms     | <400ms     | Critical   |
| GET /api/dashboard/facts    | <150ms     | <300ms     | <600ms     | Important  |
| POST /api/analytics/ingest  | <500ms     | <1000ms    | <2000ms    | Acceptable |

### MCP Service Performance Targets

| Service              | Operation       | Target P50 | Target P95 | Budget    |
| -------------------- | --------------- | ---------- | ---------- | --------- |
| LlamaIndex MCP       | Query knowledge | <300ms     | <500ms     | Critical  |
| Agent SDK            | Generate draft  | <1000ms    | <1500ms    | Critical  |
| Google Analytics MCP | Fetch sessions  | <500ms     | <1000ms    | Important |
| Chatwoot API         | Send reply      | <300ms     | <600ms     | Critical  |

### Webhook Flow Performance

| Flow Stage             | Target      | Critical Path |
| ---------------------- | ----------- | ------------- |
| Signature verification | <10ms       | Yes           |
| Event filtering        | <5ms        | Yes           |
| LlamaIndex query       | <500ms      | Yes           |
| Agent SDK draft        | <1500ms     | Yes           |
| Private note creation  | <300ms      | Yes           |
| Queue insertion        | <50ms       | Yes           |
| **Total Webhook Flow** | **<3000ms** | **Yes**       |

### Frontend Performance (Lighthouse)

| Metric                         | Target | Minimum |
| ------------------------------ | ------ | ------- |
| Performance                    | ≥90    | ≥80     |
| Accessibility                  | ≥95    | ≥90     |
| Best Practices                 | ≥90    | ≥85     |
| SEO                            | ≥90    | ≥85     |
| First Contentful Paint (FCP)   | <1.5s  | <2.0s   |
| Largest Contentful Paint (LCP) | <2.0s  | <2.5s   |
| Time to Interactive (TTI)      | <3.0s  | <4.0s   |
| Total Blocking Time (TBT)      | <200ms | <300ms  |
| Cumulative Layout Shift (CLS)  | <0.1   | <0.25   |

---

## Load Test Scenarios

### Scenario 1: Baseline Load (Normal Operations)

**Profile**: Standard weekday traffic

```yaml
Name: baseline_load
Duration: 10 minutes
Users: 5 concurrent operators
Request Pattern:
  - View queue: 60 requests/min
  - Approve draft: 20 requests/min
  - Edit & approve: 5 requests/min
  - Escalate: 3 requests/min
  - Reject: 2 requests/min

Expected:
  - P95 latency: <300ms
  - Error rate: <0.1%
  - CPU usage: <50%
  - Memory usage: <512MB
```

**Implementation**:

```typescript
// scripts/performance/load-tests/baseline.ts
import { loadTest } from "../lib/load-tester";

export async function baselineLoad() {
  const config = {
    duration: 600, // 10 minutes
    concurrency: 5,
    scenarios: [
      { action: "viewQueue", weight: 60 },
      { action: "approveDraft", weight: 20 },
      { action: "editAndApprove", weight: 5 },
      { action: "escalate", weight: 3 },
      { action: "reject", weight: 2 },
    ],
  };

  return await loadTest("baseline", config);
}
```

### Scenario 2: Peak Load (High Traffic)

**Profile**: Black Friday or marketing campaign traffic surge

```yaml
Name: peak_load
Duration: 15 minutes
Users: 25 concurrent operators
Request Pattern:
  - View queue: 300 requests/min
  - Approve draft: 100 requests/min
  - Edit & approve: 25 requests/min
  - Escalate: 15 requests/min
  - Reject: 10 requests/min

Expected:
  - P95 latency: <500ms
  - Error rate: <1%
  - CPU usage: <80%
  - Memory usage: <1GB
```

### Scenario 3: Webhook Burst (Viral Event)

**Profile**: Sudden influx of customer messages (e.g., shipping delay announcement)

```yaml
Name: webhook_burst
Duration: 5 minutes
Webhooks: 100 messages in 60 seconds
Pattern:
  - First 30s: 5 webhooks/sec
  - Next 30s: 10 webhooks/sec (ramp up)
  - Peak: 15 webhooks/sec for 30s
  - Cooldown: 2 webhooks/sec for remaining time

Expected:
  - Webhook processing: <3s each
  - Queue insertions: No failures
  - LlamaIndex: <500ms P95
  - Agent SDK: <1.5s P95
  - No dropped webhooks
```

### Scenario 4: Database Stress (Large Queue)

**Profile**: Approval queue backlog (overnight accumulation)

```yaml
Name: database_stress
Duration: 20 minutes
Setup: 1,000 pending queue items pre-seeded
Users: 10 concurrent operators
Pattern:
  - Continuous queue polling: 100 requests/min
  - Batch approvals: 50 approvals/min
  - Filter operations: 30 requests/min

Expected:
  - Queue query: <100ms P95
  - Index performance maintained
  - No query timeouts
  - No connection pool exhaustion
```

### Scenario 5: Real-Time Subscription Load

**Profile**: Many operators watching queue in real-time

```yaml
Name: realtime_load
Duration: 10 minutes
Concurrent Subscriptions: 50 operators
Events: 200 queue insertions over 10 minutes
Pattern:
  - New item inserted every 3 seconds
  - All 50 subscriptions receive notification
  - Operators randomly approve/reject/escalate

Expected:
  - Notification delivery: <500ms
  - No missed events
  - WebSocket connections stable
  - CPU usage: <70%
```

---

## Performance Benchmarking Scripts

### Script 1: Route Latency Benchmark

**File**: `scripts/performance/benchmark-routes.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Benchmark all application routes and log P50/P95/P99 latencies
 *
 * Usage:
 *   npm run perf:benchmark-routes
 *
 * Output:
 *   artifacts/performance/route-benchmarks-{timestamp}.json
 */

import { performance } from "perf_hooks";
import { writeFile } from "fs/promises";

const ROUTES = [
  { path: "/app", name: "Dashboard Home" },
  { path: "/app/approvals", name: "Approval Queue" },
  { path: "/app/settings", name: "Settings" },
  { path: "/app/analytics", name: "Analytics" },
];

const ITERATIONS = 100;

interface BenchmarkResult {
  route: string;
  iterations: number;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
}

async function benchmarkRoute(path: string): Promise<number[]> {
  const latencies: number[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    const response = await fetch(`http://localhost:3000${path}`, {
      headers: {
        Cookie: "shopify_session=test-session", // TODO: Real session
      },
    });

    await response.text();
    const end = performance.now();

    latencies.push(end - start);

    // Wait 100ms between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return latencies;
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

function calculateStats(
  latencies: number[],
): Omit<BenchmarkResult, "route" | "iterations"> {
  const sorted = latencies.slice().sort((a, b) => a - b);
  const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const variance =
    latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    latencies.length;

  return {
    p50: calculatePercentile(sorted, 50),
    p95: calculatePercentile(sorted, 95),
    p99: calculatePercentile(sorted, 99),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean,
    stdDev: Math.sqrt(variance),
  };
}

async function main() {
  console.log("🚀 Starting route latency benchmark...");
  console.log(`📊 Iterations per route: ${ITERATIONS}\n`);

  const results: BenchmarkResult[] = [];

  for (const route of ROUTES) {
    console.log(`⏱️  Benchmarking ${route.name} (${route.path})...`);

    const latencies = await benchmarkRoute(route.path);
    const stats = calculateStats(latencies);

    const result: BenchmarkResult = {
      route: route.path,
      iterations: ITERATIONS,
      ...stats,
    };

    results.push(result);

    console.log(`   P50: ${result.p50.toFixed(2)}ms`);
    console.log(`   P95: ${result.p95.toFixed(2)}ms`);
    console.log(`   P99: ${result.p99.toFixed(2)}ms\n`);
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const outputPath = `artifacts/performance/route-benchmarks-${timestamp}.json`;

  await writeFile(
    outputPath,
    JSON.stringify(
      {
        timestamp,
        results,
        summary: {
          totalRoutes: results.length,
          totalRequests: results.length * ITERATIONS,
          averageP95:
            results.reduce((sum, r) => sum + r.p95, 0) / results.length,
        },
      },
      null,
      2,
    ),
  );

  console.log(`✅ Benchmark complete. Results saved to ${outputPath}`);

  // Check against budgets
  const violations = results.filter((r) => r.p95 > 300);
  if (violations.length > 0) {
    console.log(
      `\n⚠️  WARNING: ${violations.length} routes exceed P95 budget (300ms):`,
    );
    violations.forEach((v) => {
      console.log(`   ${v.route}: ${v.p95.toFixed(2)}ms`);
    });
    process.exit(1);
  }
}

main().catch(console.error);
```

### Script 2: MCP Service Latency Benchmark

**File**: `scripts/performance/benchmark-mcp.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Benchmark MCP service latencies (LlamaIndex, Agent SDK, Analytics)
 *
 * Usage:
 *   npm run perf:benchmark-mcp
 *
 * Output:
 *   artifacts/performance/mcp-benchmarks-{timestamp}.json
 */

import { performance } from "perf_hooks";
import { writeFile } from "fs/promises";

const MCP_SERVICES = [
  {
    name: "LlamaIndex Query",
    url: "http://localhost:8005/api/llamaindex/query",
    payload: { query: "What is your return policy?", top_k: 5 },
    budget: 500, // ms
  },
  {
    name: "Agent SDK Draft Generation",
    url: "http://localhost:8006/api/agentsdk/draft",
    payload: {
      customer_message: "I want a refund",
      knowledge_context: [],
    },
    budget: 1500, // ms
  },
  {
    name: "Google Analytics MCP",
    url: "http://localhost:8780/mcp",
    payload: { method: "fetch_sessions", params: { days: 7 } },
    budget: 1000, // ms
  },
];

const ITERATIONS = 50;

async function benchmarkMCPService(
  service: (typeof MCP_SERVICES)[0],
): Promise<number[]> {
  const latencies: number[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();

    try {
      const response = await fetch(service.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service.payload),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      await response.json();
      const end = performance.now();

      latencies.push(end - start);
    } catch (error) {
      console.error(`   ❌ Request ${i + 1} failed:`, error.message);
      latencies.push(-1); // Mark failure
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return latencies.filter((l) => l > 0); // Remove failures
}

async function main() {
  console.log("🔌 Starting MCP service benchmark...\n");

  const results: any[] = [];

  for (const service of MCP_SERVICES) {
    console.log(`⏱️  Benchmarking ${service.name}...`);

    const latencies = await benchmarkMCPService(service);

    if (latencies.length === 0) {
      console.log(`   ❌ All requests failed! Service may be offline.\n`);
      continue;
    }

    const sorted = latencies.slice().sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    const result = {
      service: service.name,
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      budget: service.budget,
      successRate: (latencies.length / ITERATIONS) * 100,
      withinBudget: p95 <= service.budget,
    };

    results.push(result);

    console.log(`   P50: ${result.p50}ms`);
    console.log(
      `   P95: ${result.p95}ms ${result.withinBudget ? "✅" : "❌"} (budget: ${service.budget}ms)`,
    );
    console.log(`   Success Rate: ${result.successRate.toFixed(1)}%\n`);
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const outputPath = `artifacts/performance/mcp-benchmarks-${timestamp}.json`;

  await writeFile(outputPath, JSON.stringify({ timestamp, results }, null, 2));

  console.log(`✅ Benchmark complete. Results saved to ${outputPath}`);

  // Check budgets
  const violations = results.filter((r) => !r.withinBudget);
  if (violations.length > 0) {
    console.log(`\n⚠️  WARNING: ${violations.length} services exceed budget:`);
    violations.forEach((v) => {
      console.log(`   ${v.service}: ${v.p95}ms > ${v.budget}ms budget`);
    });
    process.exit(1);
  }
}

main().catch(console.error);
```

### Script 3: Approval Queue Load Test

**File**: `scripts/performance/load-test-approval-queue.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Load test the approval queue with concurrent operator actions
 *
 * Simulates multiple operators working the queue simultaneously:
 * - Viewing queue
 * - Approving drafts
 * - Editing responses
 * - Escalating cases
 *
 * Usage:
 *   npm run perf:load-test-queue
 *
 * Output:
 *   artifacts/performance/queue-load-test-{timestamp}.json
 */

import { performance } from "perf_hooks";
import { writeFile } from "fs/promises";
import { supabase } from "~/config/supabase.server";

interface LoadTestConfig {
  concurrentOperators: number;
  durationMinutes: number;
  queueSize: number;
}

interface LoadTestResult {
  timestamp: string;
  config: LoadTestConfig;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    throughput: number; // requests/second
    errorRate: number; // percentage
  };
  violations: string[];
}

async function seedQueueForLoad(size: number) {
  console.log(`📋 Seeding ${size} queue items...`);

  const items = Array.from({ length: size }, (_, i) => ({
    conversation_id: 10000 + i,
    customer_name: `Load Test Customer ${i}`,
    customer_email: `customer${i}@loadtest.com`,
    customer_message: `Load test message ${i}`,
    draft_response: `Load test draft response ${i}`,
    confidence_score: 70 + Math.floor(Math.random() * 30),
    priority: i % 10 === 0 ? "urgent" : "normal",
    status: "pending",
  }));

  const { error } = await supabase
    .from("agent_sdk_approval_queue")
    .insert(items);

  if (error) throw error;
  console.log(`✅ Queue seeded\n`);
}

async function simulateOperator(
  operatorId: number,
  durationMs: number,
): Promise<number[]> {
  const latencies: number[] = [];
  const startTime = Date.now();

  while (Date.now() - startTime < durationMs) {
    const actionType = Math.random();
    const start = performance.now();

    try {
      if (actionType < 0.6) {
        // 60%: View queue
        await fetch("http://localhost:3000/api/approvals/queue");
      } else if (actionType < 0.85) {
        // 25%: Approve action
        const queueItem = await getRandomPendingItem();
        if (queueItem) {
          await fetch("http://localhost:3000/api/approvals/approve", {
            method: "POST",
            body: JSON.stringify({ queueItemId: queueItem.id }),
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        // 15%: Other actions (edit, escalate, reject)
        const queueItem = await getRandomPendingItem();
        if (queueItem) {
          const action = Math.random() < 0.5 ? "reject" : "escalate";
          await fetch(`http://localhost:3000/api/approvals/${action}`, {
            method: "POST",
            body: JSON.stringify({ queueItemId: queueItem.id }),
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      const end = performance.now();
      latencies.push(end - start);
    } catch (error) {
      console.error(`Operator ${operatorId} error:`, error.message);
    }

    // Random think time (500ms - 2000ms)
    const thinkTime = 500 + Math.random() * 1500;
    await new Promise((resolve) => setTimeout(resolve, thinkTime));
  }

  return latencies;
}

async function getRandomPendingItem() {
  const { data } = await supabase
    .from("agent_sdk_approval_queue")
    .select("id")
    .eq("status", "pending")
    .limit(10);

  if (!data || data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)];
}

async function runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
  console.log(`🔥 Starting load test...`);
  console.log(`   Operators: ${config.concurrentOperators}`);
  console.log(`   Duration: ${config.durationMinutes} minutes`);
  console.log(`   Queue Size: ${config.queueSize}\n`);

  // Seed queue
  await seedQueueForLoad(config.queueSize);

  // Run concurrent operators
  const durationMs = config.durationMinutes * 60 * 1000;
  const operatorPromises = Array.from(
    { length: config.concurrentOperators },
    (_, i) => simulateOperator(i, durationMs),
  );

  const allLatencies = (await Promise.all(operatorPromises)).flat();

  // Calculate metrics
  const sorted = allLatencies.slice().sort((a, b) => a - b);
  const successCount = allLatencies.filter((l) => l > 0).length;
  const failCount = allLatencies.filter((l) => l < 0).length;

  const metrics = {
    totalRequests: allLatencies.length,
    successfulRequests: successCount,
    failedRequests: failCount,
    averageLatency: Math.round(
      allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length,
    ),
    p50Latency: Math.round(sorted[Math.floor(sorted.length * 0.5)]),
    p95Latency: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
    p99Latency: Math.round(sorted[Math.floor(sorted.length * 0.99)]),
    throughput: successCount / (durationMs / 1000),
    errorRate: (failCount / allLatencies.length) * 100,
  };

  // Check violations
  const violations: string[] = [];
  if (metrics.p95Latency > 300)
    violations.push(`P95 latency ${metrics.p95Latency}ms > 300ms budget`);
  if (metrics.errorRate > 1)
    violations.push(`Error rate ${metrics.errorRate.toFixed(2)}% > 1% budget`);

  return {
    timestamp: new Date().toISOString(),
    config,
    metrics,
    violations,
  };
}

// Execute load test
const config: LoadTestConfig = {
  concurrentOperators: 10,
  durationMinutes: 5,
  queueSize: 100,
};

runLoadTest(config)
  .then(async (result) => {
    console.log("\n📊 Load Test Results:");
    console.log(`   Total Requests: ${result.metrics.totalRequests}`);
    console.log(
      `   Success Rate: ${((result.metrics.successfulRequests / result.metrics.totalRequests) * 100).toFixed(2)}%`,
    );
    console.log(`   P50 Latency: ${result.metrics.p50Latency}ms`);
    console.log(`   P95 Latency: ${result.metrics.p95Latency}ms`);
    console.log(`   P99 Latency: ${result.metrics.p99Latency}ms`);
    console.log(`   Throughput: ${result.metrics.throughput.toFixed(2)} req/s`);

    const timestamp = result.timestamp.replace(/:/g, "-");
    const outputPath = `artifacts/performance/queue-load-test-${timestamp}.json`;
    await writeFile(outputPath, JSON.stringify(result, null, 2));

    console.log(`\n✅ Results saved to ${outputPath}`);

    if (result.violations.length > 0) {
      console.log(`\n❌ VIOLATIONS DETECTED:`);
      result.violations.forEach((v) => console.log(`   - ${v}`));
      process.exit(1);
    }
  })
  .catch(console.error);
```

### Script 4: Webhook Processing Benchmark

**File**: `scripts/performance/benchmark-webhook.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Benchmark end-to-end webhook processing time
 * Tests the complete flow: webhook → LlamaIndex → Agent SDK → queue
 *
 * Usage:
 *   npm run perf:benchmark-webhook
 */

import { performance } from "perf_hooks";

async function benchmarkWebhookProcessing(iterations: number = 20) {
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const payload = {
      event: "message_created",
      message: { content: `Benchmark message ${i}` },
      conversation: { id: 50000 + i, status: "open" },
      sender: { type: "contact", name: "Benchmark User" },
    };

    const start = performance.now();

    const response = await fetch(
      "http://localhost:54321/functions/v1/chatwoot-webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Chatwoot-Signature": generateSignature(payload),
        },
        body: JSON.stringify(payload),
      },
    );

    await response.json();
    const end = performance.now();

    latencies.push(end - start);

    console.log(`   Iteration ${i + 1}: ${(end - start).toFixed(2)}ms`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const sorted = latencies.slice().sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  console.log(`\n📊 Webhook Processing Results:`);
  console.log(
    `   P50: ${sorted[Math.floor(sorted.length * 0.5)].toFixed(2)}ms`,
  );
  console.log(`   P95: ${p95.toFixed(2)}ms`);
  console.log(`   Budget: 3000ms`);
  console.log(`   ${p95 < 3000 ? "✅" : "❌"} Within budget\n`);

  return p95 < 3000;
}

benchmarkWebhookProcessing().then((success) => {
  process.exit(success ? 0 : 1);
});

function generateSignature(payload: any): string {
  // TODO: Implement HMAC-SHA256
  return "test-signature";
}
```

---

## Lighthouse CI Configuration

### File: `.lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/app",
        "http://localhost:3000/app/approvals",
        "http://localhost:3000/app/settings",
        "http://localhost:3000/app/analytics"
      ],
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        },
        "onlyCategories": [
          "performance",
          "accessibility",
          "best-practices",
          "seo"
        ]
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "interactive": ["error", { "maxNumericValue": 4000 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": {
      "target": "filesystem",
      "outputDir": "./artifacts/performance/lighthouse-ci"
    }
  }
}
```

### Lighthouse CI GitHub Action

**File**: `.github/workflows/lighthouse-ci.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Start test server
        run: |
          npm run build
          npm start &
          sleep 10

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.13.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-results
          path: artifacts/performance/lighthouse-ci/
          retention-days: 30
```

---

## Performance Monitoring Dashboards

### Script 5: Performance Dashboard Generator

**File**: `scripts/performance/generate-dashboard.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Generate performance dashboard from benchmark results
 *
 * Aggregates route, MCP, and webhook benchmarks into a single HTML dashboard
 */

import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

async function generateDashboard() {
  const benchmarkDir = "artifacts/performance";
  const files = await readdir(benchmarkDir);

  const routeBenchmarks = files.filter((f) => f.startsWith("route-benchmarks"));
  const mcpBenchmarks = files.filter((f) => f.startsWith("mcp-benchmarks"));
  const queueLoadTests = files.filter((f) => f.startsWith("queue-load-test"));

  // Read latest of each type
  const latestRoute = routeBenchmarks.sort().reverse()[0];
  const latestMcp = mcpBenchmarks.sort().reverse()[0];
  const latestQueue = queueLoadTests.sort().reverse()[0];

  const routeData = JSON.parse(
    await readFile(join(benchmarkDir, latestRoute), "utf-8"),
  );
  const mcpData = JSON.parse(
    await readFile(join(benchmarkDir, latestMcp), "utf-8"),
  );
  const queueData = JSON.parse(
    await readFile(join(benchmarkDir, latestQueue), "utf-8"),
  );

  // Generate HTML dashboard
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>HotDash Performance Dashboard</title>
  <style>
    body { font-family: system-ui; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f8f8; font-weight: 600; }
    .pass { color: #22c55e; font-weight: bold; }
    .fail { color: #ef4444; font-weight: bold; }
    .metric { font-size: 24px; font-weight: bold; color: #333; }
    .label { font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 HotDash Performance Dashboard</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    
    <div class="card">
      <h2>Route Latencies</h2>
      <table>
        <tr><th>Route</th><th>P50</th><th>P95</th><th>P99</th><th>Status</th></tr>
        ${routeData.results
          .map(
            (r: any) => `
        <tr>
          <td>${r.route}</td>
          <td>${r.p50.toFixed(2)}ms</td>
          <td>${r.p95.toFixed(2)}ms</td>
          <td>${r.p99.toFixed(2)}ms</td>
          <td class="${r.p95 < 300 ? "pass" : "fail"}">${r.p95 < 300 ? "✅" : "❌"}</td>
        </tr>
        `,
          )
          .join("")}
      </table>
    </div>
    
    <div class="card">
      <h2>MCP Service Performance</h2>
      <table>
        <tr><th>Service</th><th>P50</th><th>P95</th><th>Budget</th><th>Status</th></tr>
        ${mcpData.results
          .map(
            (r: any) => `
        <tr>
          <td>${r.service}</td>
          <td>${r.p50}ms</td>
          <td>${r.p95}ms</td>
          <td>${r.budget}ms</td>
          <td class="${r.withinBudget ? "pass" : "fail"}">${r.withinBudget ? "✅" : "❌"}</td>
        </tr>
        `,
          )
          .join("")}
      </table>
    </div>
    
    <div class="card">
      <h2>Approval Queue Load Test</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        <div>
          <div class="label">Throughput</div>
          <div class="metric">${queueData.metrics.throughput.toFixed(1)} req/s</div>
        </div>
        <div>
          <div class="label">P95 Latency</div>
          <div class="metric">${queueData.metrics.p95Latency}ms</div>
        </div>
        <div>
          <div class="label">Error Rate</div>
          <div class="metric">${queueData.metrics.errorRate.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await writeFile("artifacts/performance/dashboard.html", html);
  console.log("✅ Dashboard generated: artifacts/performance/dashboard.html");
}

generateDashboard().catch(console.error);
```

---

## Performance Budget Enforcement

### NPM Scripts (package.json)

```json
{
  "scripts": {
    "perf:benchmark-routes": "tsx scripts/performance/benchmark-routes.ts",
    "perf:benchmark-mcp": "tsx scripts/performance/benchmark-mcp.ts",
    "perf:load-test-queue": "tsx scripts/performance/load-test-approval-queue.ts",
    "perf:benchmark-webhook": "tsx scripts/performance/benchmark-webhook.ts",
    "perf:dashboard": "tsx scripts/performance/generate-dashboard.ts",
    "perf:all": "npm run perf:benchmark-routes && npm run perf:benchmark-mcp && npm run perf:load-test-queue && npm run perf:dashboard"
  }
}
```

### CI Integration

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget Check

on:
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci

      - name: Start services
        run: |
          npm run build
          npm start &
          npx supabase start

      - name: Run performance benchmarks
        run: npm run perf:all

      - name: Upload performance artifacts
        uses: actions/upload-artifact@v4
        with:
          name: performance-results
          path: artifacts/performance/
```

---

## Success Criteria

### Performance Gates (CI Must Pass)

- ✅ All routes P95 < 300ms
- ✅ MCP services P95 within budget
- ✅ Webhook flow P95 < 3000ms
- ✅ Lighthouse Performance score ≥80
- ✅ No error rate >1% under load

### Load Testing Benchmarks

- ✅ 10 concurrent operators: Stable
- ✅ 100 queue items: No degradation
- ✅ 50 realtime subscriptions: No dropped events

### Monitoring & Alerting

- [ ] Latency dashboard (live)
- [ ] P95 tracking over time
- [ ] Budget violation alerts
- [ ] Performance regression detection

---

**End of Performance Testing Framework**

**Implementation Timeline**:

- Week 1: Benchmark scripts (2 days)
- Week 1: Lighthouse CI (1 day)
- Week 2: Load tests (2 days)
- Week 2: Dashboard (1 day)

**Coordination**: Tag @engineer when ready to integrate into CI pipeline
