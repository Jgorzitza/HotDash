// Pilot check script — logs JSON events only
// Policy: node scripts must log output in JSON events (AGENTS.md)

import { planScaffold, sum } from '../../packages/pilot/src/index.mjs';

function log(event, data = {}) {
  const payload = { event, ts: new Date().toISOString(), ...data };
  process.stdout.write(JSON.stringify(payload) + "\n");
}

try {
  log('pilot.check.start', { version: '0.1.0' });

  const plan = planScaffold({ version: '0.1.0' });
  log('pilot.plan', plan);

  const s = sum([1, 2, 3]);
  log('pilot.sum', { input: [1, 2, 3], result: s });

  const ok = s === 6 && Array.isArray(plan.steps) && plan.steps.length === 3;
  log('pilot.check.result', { ok });
} catch (err) {
  log('pilot.check.error', { message: String(err && err.message ? err.message : err) });
  process.exitCode = 1;
}

