#!/usr/bin/env node
// Minimal checklist runner: reads a run_state file, opens the lanes result_path,
// and emits NDJSON events summarizing molecules per lane. No external deps.

import fs from 'fs/promises';
import path from 'path';
import crypto from 'node:crypto';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--resume') { args.resume = argv[++i]; continue; }
    if (a === '--mode') { args.mode = argv[++i]; continue; }
    if (a === '--noninteractive') { args.noninteractive = true; continue; }
    if (a.startsWith('--')) { const k = a.replace(/^--/, ''); args[k] = argv[++i] ?? true; continue; }
  }
  return args;
}

function nowISO() { return new Date().toISOString(); }

function emit(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

async function readJson(p) {
  const buf = await fs.readFile(p, 'utf8');
  return JSON.parse(buf);
}

async function main() {
  const args = parseArgs(process.argv);
  const request_id = (crypto?.randomUUID?.() ?? `r_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  const start = { type: 'start', timestamp: nowISO(), request_id, mode: args.mode || 'checklist' };
  emit(start);

  if (!args.resume) {
    emit({ type: 'error', timestamp: nowISO(), request_id, message: 'Missing --resume <run_state.json>' });
    process.exitCode = 2;
    return;
  }

  let runState;
  try {
    runState = await readJson(args.resume);
  } catch (e) {
    emit({ type: 'error', timestamp: nowISO(), request_id, message: `Failed to read run_state: ${e.message}`, path: args.resume });
    process.exitCode = 1;
    return;
  }

  const resultPath = runState.result_path;
  if (!resultPath) {
    emit({ type: 'error', timestamp: nowISO(), request_id, message: 'run_state missing result_path', run_state: runState });
    process.exitCode = 1;
    return;
  }

  let lanes;
  try {
    lanes = await readJson(resultPath);
  } catch (e) {
    emit({ type: 'error', timestamp: nowISO(), request_id, message: `Failed to read lanes: ${e.message}`, path: resultPath });
    process.exitCode = 1;
    return;
  }

  const lanesMap = lanes.lanes || {};
  let total = 0;
  const byLane = [];
  for (const [laneName, laneArr] of Object.entries(lanesMap)) {
    for (const lane of laneArr) {
      const spec_path = lane.spec_path || null;
      const molecules = lane.molecules || [];
      const laneSummary = { lane: laneName, lane_id: lane.id, title: lane.title, spec_path, molecules: [] };
      for (const mol of molecules) {
        total++;
        const m = {
          type: 'molecule',
          timestamp: nowISO(),
          request_id,
          lane: laneName,
          lane_id: lane.id,
          molecule_id: mol.id,
          desc: mol.desc,
          status: mol.status,
          allowed_paths: mol.allowed_paths || [],
          mcp_required: Boolean(mol.mcp_required),
          evidence: mol.evidence || {},
          dod: mol.dod || [],
          qa: mol.qa || {},
          spec_path
        };
        emit(m);
        laneSummary.molecules.push({ id: mol.id, desc: mol.desc, status: mol.status, allowed_paths: mol.allowed_paths || [], evidence: mol.evidence || {}, qa: mol.qa || {} });
      }
      byLane.push(laneSummary);
    }
  }

  const summary = { type: 'summary', timestamp: nowISO(), request_id, molecules: total, lanes: Object.keys(lanesMap).length, result_path: resultPath };
  emit(summary);

  // Optional compiled report writer (defaults on when --write-report present)
  if (args['write-report'] || args.writeReport || args.out) {
    const outPath = args.out || (() => {
      const today = new Date().toISOString().slice(0,10);
      return path.join('artifacts', 'manager', today, 'compiled_checklist.json');
    })();
    const outDir = path.dirname(outPath);
    await fs.mkdir(outDir, { recursive: true });
    const report = { generated_at: nowISO(), mode: args.mode || 'checklist', result_path: resultPath, lanes: byLane, summary: { molecules: total, lanes: Object.keys(lanesMap).length } };
    await fs.writeFile(outPath, JSON.stringify(report, null, 2));
    emit({ type: 'report', timestamp: nowISO(), request_id, path: outPath });
  }
}

main().catch(err => {
  emit({ type: 'error', timestamp: nowISO(), message: err.message, stack: err.stack });
  process.exitCode = 1;
});
