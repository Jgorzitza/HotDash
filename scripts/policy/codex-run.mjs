#!/usr/bin/env node
/**
 * Codex Continuous Runner
 *
 * Runs required preflight + CI steps sequentially with Foreground Proof heartbeats
 * so Codex agents never appear idle. Outputs JSONL telemetry under artifacts/<agent>/<date>/logs.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const agent = process.argv[2];
const extra = process.argv.slice(3);
if (!agent) {
  console.error('usage: node scripts/policy/codex-run.mjs <agent> [-- <extra shell command> ...]');
  process.exit(2);
}

const date = new Date().toISOString().slice(0, 10);
const outDir = join(process.cwd(), 'artifacts', agent, date, 'logs');
mkdirSync(outDir, { recursive: true });
const telemetryFile = join(outDir, 'codex-run.jsonl');

const steps = [
  'npm run policy:contracts',
  'node scripts/policy/check-docs.mjs',
  'node scripts/policy/check-ai-config.mjs',
  'npm run fmt',
  'npm run lint',
  'npm run test:ci',
  'npm run scan',
  ...extra,
].filter(Boolean);

function log(event) {
  appendFileSync(telemetryFile, JSON.stringify({ ts: new Date().toISOString(), agent, ...event }) + '\n');
}

function runStep(cmd) {
  return new Promise((resolve) => {
    log({ type: 'start', cmd });
    const sh = spawn('bash', ['-lc', `scripts/policy/with-heartbeat.sh ${agent} -- ${cmd}`], {
      stdio: 'inherit',
      env: process.env,
    });
    sh.on('close', (code) => {
      log({ type: 'end', cmd, code });
      resolve(code || 0);
    });
  });
}

(async () => {
  let failed = 0;
  for (const cmd of steps) {
    const code = await runStep(cmd);
    if (code !== 0) {
      failed++;
      // keep going to avoid idle/stop; record failure
    }
  }
  process.exit(failed ? 1 : 0);
})();

