#!/usr/bin/env node
import { spawn } from 'node:child_process';

function usage() {
  console.log('Usage: node scripts/ops/run-with-timeout.mjs <ms> -- <command...>');
  console.log('Example: node scripts/ops/run-with-timeout.mjs 120000 -- npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts');
}

const idx = process.argv.indexOf('--');
if (idx < 0) {
  usage();
  process.exit(2);
}
const msArg = process.argv[2];
const ms = Number.isFinite(Number(msArg)) ? Number(msArg) : Number(process.env.TIMEOUT_MS || 300000);
const cmd = process.argv.slice(idx + 1).join(' ');
if (!cmd) {
  usage();
  process.exit(2);
}

const child = spawn(cmd, { stdio: 'inherit', shell: true });
let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  console.error(`\n⏱️ Timeout: killing process after ${ms}ms`);
  try { child.kill('SIGTERM'); } catch {}
  setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 2000);
}, ms);

child.on('exit', (code, signal) => {
  clearTimeout(timer);
  if (timedOut) {
    process.exitCode = 124;
  } else if (signal) {
    console.error(`Process terminated by signal: ${signal}`);
    process.exitCode = 128;
  } else {
    process.exitCode = code ?? 0;
  }
});

