#!/usr/bin/env tsx
/**
 * Nightly CSV export for Product (brand filter join) — dev stub
 */
import fs from 'node:fs/promises';
import path from 'node:path';

function nowISO() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0,10); }

async function main() {
  const outDir = path.join('artifacts','analytics',today(),'exports');
  await fs.mkdir(outDir, { recursive: true });
  const ts = Date.now();
  const outPath = path.join(outDir, `telemetry_${ts}.csv`);
  const header = ['date','brand','sessions','users','pageviews','conversions','revenue'].join(',');
  const rows = [
    ['2025-10-18','hotdash',1200,980,3400,36,4521.75],
    ['2025-10-19','hotdash',1285,1002,3519,41,4899.10]
  ];
  const body = rows.map(r => r.join(',')).join('\n');
  const csv = header + '\n' + body + '\n';
  await fs.writeFile(outPath, csv);
  console.log(outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
