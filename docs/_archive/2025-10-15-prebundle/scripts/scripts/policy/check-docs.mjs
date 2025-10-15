import { execSync } from 'node:child_process';
const allow = [
  /^README\.md$/, /^APPLY\.md$/, /^docs\/NORTH_STAR\.md$/, /^docs\/RULES\.md$/,
  /^docs\/ARCHIVE_INDEX\.md$/, /^docs\/growthengine\/(GOALS|PIPELINE|METRICS)\.md$/,
  /^docs\/runbooks\/(manager_|agent_|ai_agent_review_checklist|drift_checklist).*\.md$/,
  /^docs\/directions\/.+\.md$/, /^docs\/manager\/(PROJECT_PLAN|IMPLEMENTATION_PLAYBOOK)\.md$/,
  /^docs\/planning\/.+\.md$/, /^docs\/specs\/.+\.md$/, /^docs\/integrations\/.+\.md$/,
  /^feedback\/.+\.md$/, /^docs\/_archive\/.+/
];
const staged = p => execSync(`git diff --cached --name-only --diff-filter=ACMRTUXB -- ${p}`, {encoding:'utf8'}).split('\n').filter(Boolean);
const md = staged('*.md');
const violations = md.filter(f => !allow.some(rx => rx.test(f)));
if (violations.length) { console.error('❌ Disallowed Markdown paths:\n' + violations.map(v=>'- '+v).join('\n')); process.exit(1); }
console.log('✅ Docs policy ok');
