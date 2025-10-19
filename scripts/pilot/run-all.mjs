#!/usr/bin/env node
// Aggregates pilot checks; writes a summary artifact. JSON events only.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
const execFileAsync = promisify(execFile);

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({ event, ts: new Date().toISOString(), ...data }) + "\n");
}

async function run(nodeArgs) {
  const { stdout } = await execFileAsync(process.execPath, nodeArgs);
  return stdout.trim();
}

async function main() {
  log('pilot.runall.start', {});
  const outDir = 'artifacts/pilot/2025-10-18';
  await mkdir(outDir, { recursive: true });

  const lint = await run(['scripts/pilot/lint.mjs']);
  const status = await run(['scripts/pilot/run.mjs', 'status']);
  const summary = await run(['scripts/pilot/run.mjs', 'status:summary']);
  const seq = await run(['scripts/pilot/run.mjs', 'seq:plan']);
  const test = await run(['scripts/pilot/test.mjs']);
  const gen = await run(['scripts/pilot/generate-sequence.mjs']);
  const policy = await run(['scripts/pilot/snapshot-policy.mjs']);

  const out = { lint, status, summary, seq, test, gen, policy };
  await writeFile(outDir + '/summary.json', JSON.stringify(out, null, 2));
  log('pilot.runall.write', { file: outDir + '/summary.json' });
  log('pilot.runall.done', { ok: true });
}

main().catch(err => {
  log('pilot.runall.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});

