#!/usr/bin/env tsx
/**
 * Performance Benchmarks (QA-HELPER)
 *
 * Quick, local micro-benchmarks for critical loaders/routes.
 * Non-network and safe to run; uses mock mode where available.
 */

import { performance } from 'node:perf_hooks';

async function benchAppIndexMock() {
  const { loader } = await import('../../app/routes/app._index');
  const url = 'http://localhost:3000/app?mock=1';
  const request = new Request(url, { method: 'GET' });

  const t0 = performance.now();
  const resp = await loader({ request } as any);
  const t1 = performance.now();

  return {
    name: 'app/_index loader (mock) ',
    durationMs: +(t1 - t0).toFixed(2),
    status: (resp as Response).status || 200,
  };
}

async function main() {
  const results: Array<{ name: string; durationMs: number; status: number }> = [];

  try {
    results.push(await benchAppIndexMock());
  } catch (err: any) {
    results.push({ name: 'app/_index loader (mock)', durationMs: -1, status: 0 });
    console.error('Benchmark error:', err?.message || err);
  }

  // Pretty print
  console.log('\nPerformance Benchmarks');
  console.log('=======================');
  for (const r of results) {
    console.log(`• ${r.name} → ${r.durationMs} ms (status ${r.status})`);
  }
}

main();

