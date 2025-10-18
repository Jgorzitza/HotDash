#!/usr/bin/env node
// scripts/ops/qa-app-usability.mjs
// Lightweight app usability smoke: start SSR server, hit root route, report PASS/FAIL.
// Writes logs to artifacts/qa/<date>/app_usability/ and mirrors summary to artifacts/manager/<date>/startup_app_usability.log

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const DATE = process.env.QA_SMOKE_DATE || new Date().toISOString().slice(0, 10);
const qaDir = join('artifacts', 'qa', DATE, 'app_usability');
mkdirSync(qaDir, { recursive: true });
const qaLog = join(qaDir, 'smoke.log');
const managerDir = join('artifacts', 'manager', DATE);
mkdirSync(managerDir, { recursive: true });
const startupLog = join(managerDir, 'startup_app_usability.log');

function log(line) {
  appendFileSync(qaLog, line + '\n');
  appendFileSync(startupLog, line + '\n');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  let lastErr = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status < 500) return true;
      lastErr = new Error('HTTP ' + res.status);
    } catch (e) {
      lastErr = e;
    }
    await sleep(500);
  }
  if (lastErr) throw lastErr; else throw new Error('timeout waiting for ' + url);
}

async function main() {
  writeFileSync(qaLog, `# App Usability Smoke — ${DATE}\n`);
  writeFileSync(startupLog, `# App Usability Smoke — ${DATE}\n`);

  if (!existsSync('build/server/index.js')) {
    log('FAIL: build not found at build/server/index.js. Run `npm run build` first.');
    process.exit(1);
  }

  const port = process.env.QA_SMOKE_PORT || '4077';
  let url = `http://127.0.0.1:${port}/`;

  // Try local bin first, fallback to npx
  const tryCmds = [
    { cmd: 'node_modules/.bin/react-router-serve', args: ['build/server/index.js'] },
    { cmd: 'npx', args: ['-y', 'react-router-serve', 'build/server/index.js'] }
  ];

  let server;
  let started = false;
  for (const t of tryCmds) {
    try {
      server = spawn(t.cmd, t.args, { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: String(port) } });
      let buffered = '';
      server.stdout.on('data', d => {
        appendFileSync(qaLog, d);
        buffered += d.toString();
        const m = buffered.match(/http:\/\/localhost:(\d+)/);
        if (m) {
          url = `http://127.0.0.1:${m[1]}/`;
        }
      });
      server.stderr.on('data', d => appendFileSync(qaLog, d));
      // Wait briefly to allow port to be printed then wait for readiness
      await sleep(500);
      await waitForServer(url, 30000);
      started = true;
      log(`Server started via ${t.cmd} on ${url}`);
      break;
    } catch (e) {
      if (server && !server.killed) server.kill('SIGKILL');
      log(`Attempt with ${t.cmd} failed: ${e?.message || e}`);
    }
  }

  if (!started) {
    log('FAIL: could not start SSR server. See log for details.');
    process.exit(1);
  }

  try {
    const res = await fetch(url);
    const text = await res.text();
    const snippet = text.slice(0, 200).replace(/\s+/g, ' ').trim();
    log(`GET / → ${res.status} ${res.ok ? 'OK' : ''} — snippet: ${snippet}`);

    if (!res.ok) {
      log('FAIL: root route did not return 200');
      process.exitCode = 1;
    } else {
      log('PASS: basic SSR render OK');
      process.exitCode = 0;
    }
  } catch (e) {
    log('FAIL: request failed: ' + (e?.message || e));
    process.exitCode = 1;
  }
  finally {
    if (server && !server.killed) server.kill('SIGKILL');
  }
}

main().catch(err => {
  log('FATAL: ' + (err?.message || err));
  process.exit(1);
});
