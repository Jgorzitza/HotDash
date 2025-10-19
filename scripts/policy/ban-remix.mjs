#!/usr/bin/env node
import { globby } from 'globby';
import fs from 'node:fs';

const files = await globby([
  'app/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'src/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'server/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'packages/**/*.{ts,tsx,js,jsx,mjs,cjs}',
]);

const bad = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  if (/@remix-run|import\s+.*remix/i.test(s)) bad.push(f);
}

if (bad.length) {
  console.error('Remix usage found. Project uses React Router 7:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('RR7 check passed (no Remix imports).');
