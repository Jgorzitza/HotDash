#!/usr/bin/env node
// Pilot sequence generator — creates/updates docs under docs/pilot/sequence/*
// JSON event logs only.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function log(event, data = {}) {
  const payload = { event, ts: new Date().toISOString(), ...data };
  process.stdout.write(JSON.stringify(payload) + "\n");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadLanes() {
  const buf = await readFile(new URL('../../reports/manager/lanes/2025-10-18.json', import.meta.url));
  return JSON.parse(String(buf));
}

function templateFor(key, ref) {
  const titleMap = {
    programmatic_seo_factory: 'Programmatic SEO — Pilot Planning',
    guided_selling: 'Guided Selling / Kit Composer — Pilot Planning',
    cwv_to_revenue: 'CWV → Revenue — Pilot Planning',
    ab_harness: 'A/B Harness — Pilot Planning'
  };
  const title = titleMap[key] || `${key} — Pilot Planning`;
  return `# ${title}\n\nScope\n\n- Pilot documents interfaces and guardrails only. No changes to production specs or code.\n\nRefs\n\n- Sequence key: \`${key}\`\n- Spec: \`${ref || 'n/a'}\`\n\nPlan (docs-only)\n\n- Capture scope, references, guardrails, proof command.\n- Autopublish: OFF; no runtime calls.\n\nProof (read-only)\n\n\`\`\`bash\nnode scripts/pilot/run.mjs seq:plan | jq -C .\n\`\`\`\n`;
}

async function ensureFile(filePath, content) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

async function main() {
  log('pilot.gen.start', {});
  const lanes = await loadLanes();
  const seq = lanes.sequence || [];
  const refs = {
    programmatic_seo_factory: lanes.agents?.seo?.lanes?.[0]?.specRef,
    guided_selling: lanes.agents?.engineer?.lanes?.[0]?.specRef,
    cwv_to_revenue: 'n/a',
    ab_harness: lanes.agents?.seo?.lanes?.find(l => /A\/B Harness/i.test(l.title))?.specRef
  };
  for (const key of seq) {
    const ref = refs[key];
    const fileName = key.replace(/[^a-z0-9_\-]/gi, '-').toLowerCase() + '.md';
    const out = join(__dirname, '../../docs/pilot/sequence/', fileName);
    const content = templateFor(key, ref);
    await ensureFile(out, content);
    log('pilot.gen.write', { key, file: `docs/pilot/sequence/${fileName}`, ref });
  }
  log('pilot.gen.done', { count: seq.length });
}

main().catch(err => {
  log('pilot.gen.error', { message: String(err?.message || err) });
  process.exitCode = 1;
});

