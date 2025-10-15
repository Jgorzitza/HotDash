#!/usr/bin/env node
import fs from 'fs';

function todayUTC() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function fail(msg){ console.error(msg); process.exit(1); }

const path = 'feedback/manager.md';
if (!fs.existsSync(path)) fail(`Missing ${path}`);
const body = fs.readFileSync(path, 'utf8');
const date = todayUTC();
const header = `## ${date} Stand-up — Manager`;

if (!body.includes(header)) {
  fail(`Manager stand-up missing for ${date}. Expected section: "${header}"`);
}

console.log('Manager stand-up present for today.');
