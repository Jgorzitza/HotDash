import fs from 'node:fs';
import { danger, fail, warn } from 'danger';

const pr = danger.github.pr;
const modified = danger.git.modified_files || [];
const created = danger.git.created_files || [];
const changed = [...modified, ...created];

// MD allow-list (defense-in-depth; CI is truth)
const allowedMd = [
  /^README\.md$/, /^APPLY\.md$/, /^docs\/NORTH_STAR\.md$/, /^docs\/RULES\.md$/,
  /^docs\/ARCHIVE_INDEX\.md$/, /^docs\/growthengine\/(GOALS|PIPELINE|METRICS)\.md$/,
  /^docs\/runbooks\/(manager_|agent_|ai_agent_review_checklist|drift_checklist).*\.md$/,
  /^docs\/directions\/.+\.md$/, /^docs\/manager\/(PROJECT_PLAN|IMPLEMENTATION_PLAYBOOK)\.md$/,
  /^docs\/planning\/.+\.md$/, /^docs\/specs\/.+\.md$/, /^docs\/integrations\/.+\.md$/,
  /^feedback\/.+\.md$/, /^docs\/_archive\/.+/,
  /^mcp\/.+\.md$/  // MCP tools documentation (critical infrastructure)
];
const md = changed.filter(f=>f.endsWith('.md'));
const badMd = md.filter(f=>!allowedMd.some(rx=>rx.test(f)));
if (badMd.length) fail('Disallowed Markdown paths:\n' + badMd.map(f=>'- '+f).join('\n'));

// Require Issue linkage
if (!/Fixes\s+#\d+/.test(pr.body || '')) fail('PR must reference an Issue, e.g., Fixes #123');

// Enforce "Allowed paths:" sandbox from PR body
const allowedMatch = /Allowed paths?:\s*([^\n]+)/i.exec(pr.body || '');
if (allowedMatch) {
  const defaultAllowed = [
    'Dangerfile.js',
    '.github/workflows/**',
    'scripts/ci/**',
    'docs/**',
    'artifacts/**',
    'package-lock.json',
    'app/services/**'
  ];

  const patterns = allowedMatch[1]
    .split(/[\s,]+/).map(s=>s.trim()).filter(Boolean)
    .concat(defaultAllowed);

  const patternToRegex = (glob) => {
    let regex = '';
    for (let i = 0; i < glob.length; i += 1) {
      const char = glob[i];
      if (char === '*') {
        if (glob[i + 1] === '*') {
          regex += '.*';
          i += 1;
        } else {
          regex += '[^/]*';
        }
      } else if (char === '?') {
        regex += '.';
      } else if (/[-/\\^$+?.()|[\]{}]/.test(char)) {
        regex += `\\${char}`;
      } else {
        regex += char;
      }
    }
    return new RegExp(`^${regex}$`);
  };

  const regs = patterns.map(patternToRegex);
  const code = changed.filter(f=>!f.endsWith('.md'));
  const bad = code.filter(f=>!regs.some(r=>r.test(f)));
  if (bad.length) fail('Files outside Allowed paths:\n' + bad.map(f=>'- '+f).join('\n'));
} else {
  warn('Add "Allowed paths: app/** packages/**" line in PR body');
}

// Tests nudge
const appTouched = changed.some(f=>/^(app|apps|packages|supabase|prisma|scripts)\//.test(f));
const testsTouched = changed.some(f=>/^tests\//.test(f)||/(\.|\/)test\./.test(f));
if (appTouched && !testsTouched) warn('App code changed but no tests updated.');

// HITL config
try{
  const cfg = JSON.parse(fs.readFileSync('app/agents/config/agents.json','utf8'));
  const cust = (cfg.agents||[]).find(a=>a.id==='ai-customer');
  if (!cust || !cust.human_review) fail('ai-customer must have human_review: true');
  if (!Array.isArray(cust.reviewers)||!cust.reviewers.length) fail('ai-customer reviewers are required');
}catch(e){ warn('Missing or invalid app/agents/config/agents.json'); }
