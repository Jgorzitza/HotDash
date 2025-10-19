// Pilot tests (minimal, Node-only, JSON logs)
import { planScaffold, sum, validatePlan, normalizeSlug } from '../../packages/pilot/src/index.mjs';

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({ event, ts: new Date().toISOString(), ...data }) + "\n");
}

try {
  log('pilot.test.start', {});
  const plan = planScaffold({ version: '0.1.0' });
  const v = validatePlan(plan);
  const s = sum([1, 2, 3, -1]);
  const slug = normalizeSlug('  Héllø, Wørld! Pilot   ');

  const assertions = [];
  assertions.push(v.ok === true);
  assertions.push(Array.isArray(plan.steps) && plan.steps.length === 3);
  assertions.push(s === 5);
  assertions.push(slug === 'hello-world-pilot');

  const ok = assertions.every(Boolean);
  log('pilot.test.result', { ok, details: { validPlan: v.ok, steps: plan.steps.length, sum: s, slug } });
  if (!ok) process.exitCode = 1;
} catch (err) {
  log('pilot.test.error', { message: String(err?.message || err) });
  process.exitCode = 1;
}

