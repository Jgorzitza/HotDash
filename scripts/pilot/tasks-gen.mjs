#!/usr/bin/env node
// Generate today's task list from lanes JSON into artifacts/pilot/<date>/tasks.todo.{json,md}
// JSON events only; idempotent.
import { readFile, mkdir, writeFile } from 'node:fs/promises';

function log(event, data = {}) {
  process.stdout.write(JSON.stringify({ event, ts: new Date().toISOString(), ...data }) + "\n");
}

function mdEscape(s) {
  return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  log('pilot.tasks.start', {});
  const date = '2025-10-18';
  const agent = 'pilot';
  const lanesRaw = await readFile('reports/manager/lanes/2025-10-18.json', 'utf8');
  const lanes = JSON.parse(lanesRaw);

  const seo = lanes.agents?.seo?.lanes || [];
  const engineer = lanes.agents?.engineer?.lanes || [];

  const findLaneById = (id) =>
    [...seo, ...engineer].find((l) => l.id === id || l.title?.toLowerCase().includes(id.replace(/_/g, ' ')));

  const seq = lanes.sequence || [];
  const tasks = [];
  for (const key of seq) {
    let lane;
    if (key === 'programmatic_seo_factory') lane = seo.find(l => /Programmatic SEO Factory/i.test(l.title));
    else if (key === 'guided_selling') lane = engineer.find(l => /Guided Selling/i.test(l.title));
    else if (key === 'cwv_to_revenue') lane = seo.find(l => /CWV/i.test(l.title));
    else if (key === 'ab_harness') lane = seo.find(l => /A\/B Harness/i.test(l.title));
    const specRef = lane?.specRef || null;
    const evidence = lane?.evidence || null;
    const title = lane?.title || key;
    const baseSteps = {
      programmatic_seo_factory: [
        'Metaobject schema plan',
        'Page template plan',
        'Internal-link plan',
        'Rollback doc',
        'MCP evidence: Shopify metaobjects + Context7 docs'
      ],
      guided_selling: [
        'Rules graph outline',
        'UX skeleton proposal',
        'Rollback plan',
        'MCP evidence: Shopify Cart/Functions + Context7 docs'
      ],
      cwv_to_revenue: [
        'CWV metrics mapping to revenue',
        'Measurement harness plan',
        'Risk/guardrails + rollback',
        'MCP evidence: Context7 docs only'
      ],
      ab_harness: [
        'Experiment registry plan',
        'GA4 custom dimension mapping (adapter)',
        'Preview + rollback',
        'MCP evidence: Context7 docs only'
      ]
    }[key] || ['Plan', 'Evidence'];

    tasks.push({ key, title, specRef, evidencePath: evidence, steps: baseSteps.map(s => ({ title: s, status: 'pending' })), status: 'pending' });
  }

  const policy = { autopublish: lanes?.policy?.autopublish?.enabled ?? null, ga4_gsc_via_adapters: lanes?.policy?.mcp?.ga4_gsc_via_adapters ?? null };
  const jsonOut = { date, agent, policy, tasks };

  const outDir = `artifacts/${agent}/${date}`;
  await mkdir(outDir, { recursive: true });
  const jsonPath = `${outDir}/tasks.todo.json`;
  await writeFile(jsonPath, JSON.stringify(jsonOut, null, 2));

  // Markdown
  let md = `# ${agent.toUpperCase()} Tasks — ${date}\n\nPolicy: autopublish=${policy.autopublish} ga4_gsc_via_adapters=${policy.ga4_gsc_via_adapters}\n\n`;
  for (const t of tasks) {
    md += `- [ ] ${mdEscape(t.title)} — spec: \`${t.specRef || 'n/a'}\`\n`;
    for (const s of t.steps) md += `  - [ ] ${mdEscape(s.title)}\n`;
    if (t.evidencePath) md += `  - Evidence path: \`${t.evidencePath}\`\n`;
  }
  const mdPath = `${outDir}/tasks.todo.md`;
  await writeFile(mdPath, md);

  log('pilot.tasks.write', { json: jsonPath, md: mdPath, count: tasks.length });
  log('pilot.tasks.done', { ok: true });
}

main().catch(err => {
  log('pilot.tasks.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});

