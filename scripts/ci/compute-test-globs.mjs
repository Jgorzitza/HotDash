#!/usr/bin/env node
// Compute targeted test globs from changed files; fallback to all
import { readFileSync } from 'node:fs';

function compute(changed) {
  const globs = new Set();
  const add = (g) => g && globs.add(g);

  for (const f of changed) {
    if (/^app\/lib\/seo\//.test(f) || /^app\/routes\/api\.seo\./.test(f) || /^docs\/specs\/hitl\/seo-telemetry/.test(f)) {
      add('tests/unit/seo.*');
      add('tests/unit/services/anomalies.test.ts');
    }
    if (/^app\/lib\/analytics\//.test(f) || /^app\/routes\/api\.analytics\./.test(f)) {
      add('tests/integration/idea-pool.api.spec.ts');
    }
    if (/^app\/routes\/approvals\//.test(f) || /^app\/components\/approvals\//.test(f)) {
      add('tests/unit/components/approvals/*');
      add('tests/unit/approvals.drawer.spec.ts');
    }
    if (/^app\/lib\/ads\//.test(f) || /^app\/routes\/api\.ads\.slice-/.test(f)) {
      add('tests/unit/ads/*.spec.ts');
      add('tests/integration/api.ads.*.spec.ts');
    }
  }
  // If we matched nothing meaningful, return wildcard
  return globs.size ? Array.from(globs) : ['.'];
}

try {
  const changedTxt = readFileSync('changed.txt', 'utf8').trim().split('\n').filter(Boolean);
  const globs = compute(changedTxt);
  console.log(globs.join('\n'));
} catch (e) {
  // On any error, default to wildcard
  console.log('.');
}

