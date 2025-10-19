#!/usr/bin/env node
// Pilot lint/status check — JSON logs only
import { access } from 'node:fs/promises';

const mustExist = [
  'packages/pilot/package.json',
  'packages/pilot/src/index.mjs',
  'packages/pilot/types/index.d.ts',
  'scripts/pilot/run.mjs',
  'scripts/pilot/check.mjs',
  'scripts/pilot/test.mjs',
  'scripts/pilot/generate-sequence.mjs',
  'docs/pilot/README.md',
];

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({ event, ts: new Date().toISOString(), ...data }) + "\n");
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  log('pilot.lint.start', {});
  const results = [];
  for (const p of mustExist) {
    results.push({ path: p, exists: await exists(p) });
  }
  const ok = results.every(r => r.exists);
  log('pilot.lint.results', { ok, results });
  if (!ok) process.exitCode = 1;
}

main().catch(err => {
  log('pilot.lint.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});

