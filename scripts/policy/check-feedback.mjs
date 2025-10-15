#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const agents = [
  'engineer','integrations','data','ai-customer','devops','qa','designer','inventory','product','analytics','seo','ads','content','support','ai-knowledge'
];

const DATE = process.argv.includes('--date')
  ? process.argv[process.argv.indexOf('--date')+1]
  : new Date().toISOString().slice(0,10);

let ok = true;
for (const agent of agents) {
  const dir = path.join('feedback', agent);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.startsWith(DATE)) : [];
  const canonical = path.join(dir, `${DATE}.md`);
  if (!fs.existsSync(canonical)) {
    console.log(`❌ ${agent}: missing ${canonical}`);
    ok = false;
    continue;
  }
  const extras = files.filter(f => f !== `${DATE}.md`);
  if (extras.length) {
    console.log(`❌ ${agent}: stray same-day files: ${extras.join(', ')}`);
    ok = false;
  }
  const txt = fs.readFileSync(canonical, 'utf8');
  if (!/WORK COMPLETE - READY FOR PR/.test(txt)) {
    console.log(`⚠️  ${agent}: no completion block yet (may be in progress)`);
  } else {
    console.log(`✅ ${agent}: completion signal present`);
  }
}

process.exit(ok ? 0 : 1);

