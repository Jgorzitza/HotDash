#!/usr/bin/env node
// Sampling Guard Proof Script (dev -> staging):
// - Calls GA4 CLI stub
// - Writes evidence JSON under artifacts/analytics/YYYY-MM-DD/
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const pExecFile = promisify(execFile);

async function main() {
  const date = new Date().toISOString().slice(0,10);
  const outDir = path.join('artifacts','analytics',date);
  await fs.mkdir(outDir, { recursive: true });
  const { stdout } = await pExecFile('node', ['integrations/ga4-cli.js','sample']);
  const payload = JSON.parse(stdout);
  const evidence = {
    generated_at: new Date().toISOString(),
    source: 'ga4-cli-stub',
    payload
  };
  const evPath = path.join(outDir, `ga4_sample_${Date.now()}.json`);
  await fs.writeFile(evPath, JSON.stringify(evidence, null, 2));
  console.log(evPath);
}

main().catch(err => { console.error(err.message); process.exit(1); });
