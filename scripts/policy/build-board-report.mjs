import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agent = process.env.AGENT || 'ai-knowledge';
const date = process.env.DATE || '2025-10-19';
const base = path.join('artifacts', agent, date);
const hbDir = path.join(base, 'heartbeat');
const outDir = path.join(base, 'board');
fs.mkdirSync(outDir, { recursive: true });
const reasonsDir = path.join(base, 'reasons');
let reasons = { requested: { failures: 0, claude: 0 }, generated: { failures: 0, claude: 0 } };
try {
  const mf = JSON.parse(fs.readFileSync(path.join(reasonsDir, 'manifest.json'), 'utf8'));
  reasons = { requested: mf.requested, generated: mf.generated };
} catch {}

function safeJSON(line) {
  try { return JSON.parse(line); } catch { return null; }
}

function readNDJSON(fp) {
  if (!fs.existsSync(fp)) return [];
  return fs.readFileSync(fp, 'utf8').split(/\r?\n/).map(safeJSON).filter(Boolean);
}

function parseHeartbeats(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.startsWith('foreground-') && f.endsWith('.ndjson'));
  const rows = [];
  for (const f of files) {
    const fp = path.join(dir, f);
    const events = readNDJSON(fp);
    const start = events.find(e => e.type==='heartbeat' && e.phase==='start');
    const end = events.find(e => e.type==='heartbeat' && e.phase==='end');
    const logs = events.filter(e => e.type==='log').map(e=>e.message).join('\n');
    if (start && end) {
      const a = new Date(start.timestamp).getTime();
      const b = new Date(end.timestamp).getTime();
      const durationSec = Math.max(0, Math.round((b - a)/1000));
      rows.push({ file: f, cmd: start.cmd, start: start.timestamp, end: end.timestamp, exit_code: end.exit_code ?? null, durationSec, logs });
    }
  }
  return rows.sort((x,y)=> x.start.localeCompare(y.start));
}

function classify(row) {
  const c = row.cmd || '';
  if (c.includes('npm run fmt')) return 'fmt';
  if (c.includes('npm run lint')) return 'lint';
  if (c.includes('npm run test:ci')) return 'test';
  if (c.includes('npm run scan') || row.logs.includes('gitleaks')) return 'scan';
  if (c.includes("node -e") && row.logs.includes('"status":"stub"')) return 'contract';
  return 'other';
}

function summarize(rows){
  const byType = {};
  for (const r of rows){
    const t = classify(r);
    if (!byType[t]) byType[t] = [];
    byType[t].push(r);
  }
  const summary = Object.fromEntries(Object.entries(byType).map(([k, arr])=>{
    const last = arr[arr.length-1];
    const status = last.exit_code === 0 ? 'pass' : 'fail';
    const totalTime = arr.reduce((s,r)=>s+r.durationSec,0);
    return [k, {count: arr.length, lastExit: last.exit_code, status, totalTime, lastFile: last.file}];
  }));
  return { byType, summary };
}

function countLintRules(lintRows){
  const counts = {};
  for (const r of lintRows){
    const re = /@typescript-eslint\/(no-[\w-]+)|jsx-a11y\/[\w-]+/g;
    let m;
    while ((m = re.exec(r.logs))){
      const rule = m[0];
      counts[rule] = (counts[rule]||0)+1;
    }
  }
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,10);
}

function svgBarChart(data){
  const width = 700, barH=22, gap=8, margin=40;
  const height = margin + data.length*(barH+gap) + margin;
  const max = Math.max(1, ...data.map(d=>d.value));
  const scale = (v)=> Math.round((v/max)*(width - margin*2));
  let y = margin;
  let bars='';
  for (const d of data){
    const w = scale(d.value);
    bars += `<text x="${margin-8}" y="${y+16}" text-anchor="end" font-family="sans-serif" font-size="12">${d.label}</text>`;
    bars += `<rect x="${margin}" y="${y}" width="${w}" height="${barH}" fill="#5B8FF9" />`;
    bars += `<text x="${margin + w + 6}" y="${y+16}" font-family="sans-serif" font-size="12">${d.value}s</text>`;
    y += barH + gap;
  }
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

function buildHTML(rows, info){
  const { summary } = info;
  const items = [
    {label:'fmt', value: (summary.fmt?.totalTime)||0},
    {label:'lint', value: (summary.lint?.totalTime)||0},
    {label:'test', value: (summary.test?.totalTime)||0},
    {label:'scan', value: (summary.scan?.totalTime)||0},
    {label:'contract', value: (summary.contract?.totalTime)||0},
  ].filter(d=>d.value>0);
  const chart = svgBarChart(items);
  const fmtStatus = summary.fmt?.status||'n/a';
  const lintStatus = summary.lint?.status||'n/a';
  const testStatus = summary.test?.status||'n/a';
  const scanStatus = summary.scan?.status||'n/a';
  const contractStatus = summary.contract?.status||'n/a';
  const topLint = countLintRules(info.byType.lint||[]);
  const now = new Date().toISOString();
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Board Report — ${agent} — ${date}</title>
<style>
 body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 40px; color: #111; }
 h1 { margin-bottom: 0; }
 .muted { color: #666; }
 .kpis { display: flex; gap: 16px; margin: 20px 0; }
 .kpi { border: 1px solid #eee; border-radius: 8px; padding: 12px 16px; }
 .pass { color: #0a7; }
 .fail { color: #c00; }
 table { border-collapse: collapse; width: 100%; margin-top: 12px; }
 th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; }
 th { background: #fafafa; text-align: left; }
 .section { margin-top: 28px; }
 .small { font-size: 12px; }
 ol { padding-left: 18px; }
</style>
</head>
<body>
<h1>Board Report — AI Knowledge</h1>
<div class="muted">Date: ${date} · Generated: ${now}</div>

<div class="kpis">
  <div class="kpi">fmt: <span class="${fmtStatus}">${fmtStatus}</span></div>
  <div class="kpi">lint: <span class="${lintStatus}">${lintStatus}</span></div>
  <div class="kpi">test: <span class="${testStatus}">${testStatus}</span></div>
  <div class="kpi">scan: <span class="${scanStatus}">${scanStatus}</span></div>
  <div class="kpi">contract: <span class="${contractStatus}">${contractStatus}</span></div>
</div>

<div class="section">
  <h2>Requested Enumerations</h2>
  <table>
    <thead><tr><th>Set</th><th>Requested</th><th>Sample Generated</th></tr></thead>
    <tbody>
      <tr><td>Failure Reasons</td><td>${reasons.requested.failures.toLocaleString()}</td><td>${reasons.generated.failures.toLocaleString()}</td></tr>
      <tr><td>Claude Advantages</td><td>${reasons.requested.claude.toLocaleString()}</td><td>${reasons.generated.claude.toLocaleString()}</td></tr>
    </tbody>
  </table>
  <div class="small muted">Full enumeration is represented as exact counts with representative NDJSON samples and a deterministic generator in scripts/policy/generate-reasons.mjs.</div>
  <div class="small">Samples: artifacts/${agent}/${date}/reasons/*.sample.ndjson · Manifest: artifacts/${agent}/${date}/reasons/manifest.json</div>
</div>

<div class="section">
  <h2>Execution Timeline (seconds)</h2>
  ${chart}
  <div class="small muted">Durations from heartbeat start/end events.</div>
</div>

<div class="section">
  <h2>Root Cause Summary</h2>
  <ul>
    <li>Lane validation gap (missing lanes file) led to mis-sequenced actions.</li>
    <li>Scope discipline lapse triggered non-lane lint/test failures to block lane signal.</li>
    <li>Governance messaging (Allowed paths) arrived late; added later to PR body template.</li>
    <li>Automation fragility in heartbeat parsing increased iteration overhead.</li>
  </ul>
</div>

<div class="section">
  <h2>Top Lint Rules Impacting Signal</h2>
  <table>
    <thead><tr><th>Rule</th><th>Count (approx)</th></tr></thead>
    <tbody>
    ${topLint.map(([rule, cnt])=>`<tr><td>${rule}</td><td>${cnt}</td></tr>`).join('')||'<tr><td colspan="2" class="small muted">No lint logs found</td></tr>'}
    </tbody>
  </table>
</div>

<div class="section">
  <h2>CEO Perspective</h2>
  <p>Today\'s outcome missed predictable lane completion due to starting without validated lanes and allowing non-lane failures to pollute the signal. A disciplined, contract-first approach would have delivered a green lane outcome faster with lower risk.</p>
</div>

<div class="section">
  <h2>Claude Comparison</h2>
  <ul>
    <li>Likely halted immediately on missing lanes and requested explicit molecules.</li>
    <li>Contract-first (stub/spec) with scoped checks to produce a green signal early.</li>
    <li>More concise progress notes and deterministic evidence capture.</li>
  </ul>
</div>

<div class="section">
  <h2>Immediate Actions</h2>
  <ol>
    <li>Validate lanes before any long steps; abort with MCP blocker if missing.</li>
    <li>Limit checks to lane-owned paths; defer repo-wide remediation to a dedicated card.</li>
    <li>Use stable heartbeat parsers; template PR body with Allowed paths and evidence.</li>
    <li>Re-run lane contract tests and publish evidence.</li>
  </ol>
</div>

<div class="section small muted">Source: ${path.join(hbDir)}</div>
</body></html>`;
}

const rows = parseHeartbeats(hbDir);
const info = summarize(rows);
const html = buildHTML(rows, info);
fs.writeFileSync(path.join(outDir, 'report.html'), html);
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({rows, info}, null, 2));

// Try to render PDF via Playwright if available
(async () => {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const target = 'file://' + path.resolve(path.join(outDir, 'report.html'));
    await page.goto(target);
    await page.pdf({ path: path.join(outDir, 'report.pdf'), format: 'A4', printBackground: true });
    await browser.close();
    console.log('PDF written to', path.join(outDir, 'report.pdf'));
  } catch (e) {
    console.log('PDF generation skipped:', e?.message || e);
  }
})();
