// scripts/policy/check-docs.mjs
import { execSync } from 'node:child_process';

const allow = [
  /^README\.md$/, /^APPLY\.md$/,
  /^docs\/NORTH_STAR\.md$/, /^docs\/RULES\.md$/, /^docs\/ARCHIVE_INDEX\.md$/,
  /^docs\/OPERATING_MODEL\.md$/,
  /^docs\/runbooks\/(manager_|agent_|ai_agent_review_checklist|drift_checklist).*\.md$/,
  /^docs\/directions\/.+\.md$/,
  /^docs\/manager\/(PROJECT_PLAN|IMPLEMENTATION_PLAYBOOK)\.md$/,
  /^docs\/planning\/.+\.md$/,
  /^docs\/specs\/.+\.md$/, /^docs\/integrations\/.+\.md$/,
  /^feedback\/.+\.md$/,
  /^docs\/_archive\/.+/
];

function staged(pattern) {
  const out = execSync(`git diff --cached --name-only --diff-filter=ACMRTUXB -- ${pattern}`, { encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}

const changedMd = staged('*.md');
const violations = changedMd.filter(p => !allow.some(rx => rx.test(p)));

if (violations.length) {
  console.error('\n❌ Docs policy violation. Disallowed Markdown paths:');
  for (const v of violations) console.error('  -', v);
  console.error('\nAllowed Markdown paths are listed in docs/RULES.md.');
  process.exit(1);
} else {
  console.log('✅ Docs policy check passed.');
}