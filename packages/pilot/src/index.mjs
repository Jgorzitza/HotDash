// Minimal, side-effect-free pilot API
// Keep pure functions and JSON-serializable inputs/outputs only.

/**
 * Returns a scaffold plan with deterministic timestamps.
 * @param {object} options
 * @param {string} options.version - Version string for the scaffold plan.
 */
export function planScaffold(options = {}) {
  const version = typeof options.version === 'string' ? options.version : '0.1.0';
  return {
    version,
    steps: [
      { id: 'init-structure', path: 'packages/pilot/', status: 'pending' },
      { id: 'init-script', path: 'scripts/pilot/', status: 'pending' },
      { id: 'docs-note', path: 'docs/pilot/', status: 'pending' }
    ]
  };
}

/**
 * Validate scaffold plan shape minimally.
 * @param {any} plan
 * @returns {{ok:boolean, errors:string[]}}
 */
export function validatePlan(plan) {
  const errors = [];
  if (!plan || typeof plan !== 'object') errors.push('plan must be object');
  if (!('version' in (plan || {}))) errors.push('missing version');
  if (!Array.isArray(plan?.steps)) errors.push('steps must be an array');
  const stepsOk = Array.isArray(plan?.steps) && plan.steps.every(s => s && s.id && s.path);
  if (!stepsOk) errors.push('each step must include id and path');
  return { ok: errors.length === 0, errors };
}

/**
 * A tiny pure utility to demonstrate testability.
 * @param {number[]} nums
 */
export function sum(nums = []) {
  if (!Array.isArray(nums)) return 0;
  return nums.reduce((a, b) => (Number.isFinite(b) ? a + b : a), 0);
}

/**
 * Normalize a string into a URL-safe slug.
 * @param {string} input
 */
export function normalizeSlug(input = '') {
  let s = String(input).toLowerCase();
  // common approximations before stripping
  s = s.replace(/[øœ]/g, 'o').replace(/[ß]/g, 'ss').replace(/[æ]/g, 'ae').replace(/[ł]/g, 'l');
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
