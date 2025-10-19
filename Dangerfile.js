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
  const patterns = allowedMatch[1]
    .split(/[\s,]+/).map(s=>s.trim()).filter(Boolean)
    .map(s=>s.replace(/\./g,'\\.').replace(/\*\*/g,'.*').replace(/\*/g,'[^/]*').replace(/\?/g,'.'));
  const regs = patterns.map(p=>new RegExp('^'+p+'$'));
  const code = changed.filter(f=>!f.endsWith('.md'));
  const bad = code.filter(f=>!regs.some(r=>r.test(f)));
  if (bad.length) fail('Files outside Allowed paths:\n' + bad.map(f=>'- '+f).join('\n'));
} else {
  warn('Add "Allowed paths: app/** packages/**" line in PR body');
}

// Require MCP evidence when code changes
const codeChanged = changed.some(f => /^(app|apps|packages|scripts|supabase|prisma)\//.test(f));
if (codeChanged) {
  const body = pr.body || '';
  const hasMcpSection = /MCP Evidence:/i.test(body);
  const hasMcpArtifact = /artifacts\/[a-z0-9_-]+\/[0-9]{4}-[0-9]{2}-[0-9]{2}\/mcp\/.+\.jsonl/i.test(body);
  if (!hasMcpSection || !hasMcpArtifact) {
    fail('MCP Evidence missing. Add a section like:\n\nMCP Evidence:\n- artifacts/<agent>/<YYYY-MM-DD>/mcp/<tool>_*.jsonl');
  }

  // Foreground Proof: require heartbeat log path and validate content
  const hasFgSection = /Foreground Proof:/i.test(body);
  const fgLogMatch = body && body.match(/artifacts\/[a-z0-9_-]+\/[0-9]{4}-[0-9]{2}-[0-9]{2}\/logs\/heartbeat\.(log|ndjson)/i);
  if (!hasFgSection || !fgLogMatch) {
    fail('Foreground Proof missing. Add a section with a path like:\n\nForeground Proof:\n- artifacts/<agent>/<YYYY-MM-DD>/logs/heartbeat.ndjson');
  } else {
    const hbPath = fgLogMatch[0];
    const touched = changed.includes(hbPath);
    if (!touched) {
      fail(`Foreground heartbeat file not included in PR changes: ${hbPath}`);
    } else {
      try {
        const content = fs.readFileSync(hbPath, 'utf8');
        const lines = content.split(/\r?\n/).filter(Boolean);
        const isoCount = lines.filter(l => /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(l)).length;
        if (isoCount < 2) {
          fail(`Foreground heartbeat log at ${hbPath} lacks sufficient ISO timestamps (found ${isoCount}).`);
        }
      } catch (e) {
        fail(`Cannot read heartbeat log at ${hbPath}: ${e?.message || e}`);
      }
    }
  }
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
