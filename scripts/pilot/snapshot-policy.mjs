#!/usr/bin/env node
// Snapshot lanes policy to artifacts for audit (JSON events only)
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({ event, ts: new Date().toISOString(), ...data }) + "\n");
}

async function main() {
  log('pilot.policy.start', {});
  const raw = await readFile('reports/manager/lanes/2025-10-18.json', 'utf8');
  const lanes = JSON.parse(raw);
  const outDir = 'artifacts/pilot/2025-10-18';
  await mkdir(outDir + '/mcp', { recursive: true });
  const snapshot = {
    autopublish: lanes?.policy?.autopublish?.enabled ?? null,
    ga4_gsc_via_adapters: lanes?.policy?.mcp?.ga4_gsc_via_adapters ?? null,
    sequence: lanes?.sequence ?? [],
  };
  const outFile = join(outDir, 'policy.json');
  await writeFile(outFile, JSON.stringify(snapshot, null, 2));
  log('pilot.policy.write', { file: outFile, snapshot });
  log('pilot.policy.done', { ok: true });
}

main().catch(err => {
  log('pilot.policy.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});

