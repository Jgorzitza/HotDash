#!/usr/bin/env node
// CI stub for pilot — JSON logs; exit 0 on success
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({ event, ts: new Date().toISOString(), ...data }) + "\n");
}

async function main() {
  log('pilot.ci.start', {});
  const status = await execFileAsync(process.execPath, ['scripts/pilot/run.mjs', 'status:summary']);
  log('pilot.ci.status', { stdout: status.stdout.trim() });
  const test = await execFileAsync(process.execPath, ['scripts/pilot/test.mjs']);
  log('pilot.ci.test', { stdout: test.stdout.trim() });
  log('pilot.ci.done', { ok: true });
}

main().catch(err => {
  log('pilot.ci.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});

