#!/usr/bin/env node
// Pilot CLI — JSON events only
// Subcommands: check | seq:plan

import { readFile } from 'node:fs/promises';
import { planScaffold, sum, validatePlan } from '../../packages/pilot/src/index.mjs';

function log(event, data = {}) {
  const payload = { event, ts: new Date().toISOString(), ...data };
  process.stdout.write(JSON.stringify(payload) + "\n");
}

async function loadLanes() {
  const buf = await readFile(new URL('../../reports/manager/lanes/2025-10-18.json', import.meta.url));
  return JSON.parse(String(buf));
}

async function main() {
  const cmd = process.argv[2] || 'check';
  if (cmd === 'check') {
    log('pilot.cli.start', { cmd });
    const plan = planScaffold({ version: '0.1.0' });
    log('pilot.cli.plan', plan);
    log('pilot.cli.sum', { input: [2, 3, 5], result: sum([2, 3, 5]) });
    log('pilot.cli.done', { ok: true });
    return;
  }
  if (cmd === 'seq:plan') {
    log('pilot.cli.start', { cmd });
    const lanes = await loadLanes();
    const seq = lanes.sequence || [];
    const seo = lanes.agents?.seo?.lanes?.[0];
    const engineer = lanes.agents?.engineer?.lanes?.[0];
    const ab = lanes.agents?.seo?.lanes?.find(l => /A\/B Harness/i.test(l.title));
    const media = lanes.agents?.seo?.lanes?.find(l => /Media Pipeline/i.test(l.title));
    log('pilot.sequence', { sequence: seq });
    log('pilot.sequence.refs', {
      programmatic_seo: seo?.specRef,
      guided_selling: engineer?.specRef,
      ab_harness: ab?.specRef,
      media_pipeline: media?.specRef
    });
    log('pilot.cli.done', { ok: true });
    return;
  }
  if (cmd === 'status') {
    log('pilot.cli.start', { cmd });
    const plan = planScaffold({ version: '0.1.0' });
    const val = validatePlan(plan);
    const s = sum([10, -4, 0, 3]);
    const lanes = await loadLanes();
    const policy = {
      autopublish: lanes?.policy?.autopublish?.enabled ?? null,
      ga4_gsc_via_adapters: lanes?.policy?.mcp?.ga4_gsc_via_adapters ?? null
    };
    log('pilot.status.plan', { valid: val.ok, errors: val.errors, steps: plan.steps?.length });
    log('pilot.status.sum', { result: s });
    log('pilot.status.policy', policy);
    log('pilot.cli.done', { ok: val.ok && typeof s === 'number' });
    return;
  }
  if (cmd === 'status:summary') {
    const plan = planScaffold({ version: '0.1.0' });
    const val = validatePlan(plan);
    const lanes = await loadLanes();
    const policy = {
      autopublish: lanes?.policy?.autopublish?.enabled ?? null,
      ga4_gsc_via_adapters: lanes?.policy?.mcp?.ga4_gsc_via_adapters ?? null
    };
    const ok = !!(val.ok && policy.autopublish === false && policy.ga4_gsc_via_adapters === true);
    // single-line summary suitable for CI logs
    process.stdout.write(JSON.stringify({ event: 'pilot.summary', ok, policy, steps: plan.steps?.length ?? 0 }) + "\n");
    return;
  }
  log('pilot.cli.unknown', { cmd });
  process.exitCode = 1;
}

main().catch(err => {
  log('pilot.cli.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});
