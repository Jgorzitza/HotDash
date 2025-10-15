import fs from 'node:fs';
const path = 'app/agents/config/agents.json';
if (!fs.existsSync(path)) { console.error(`❌ Missing ${path}`); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(path,'utf8'));
const cust = (cfg.agents||[]).find(a=>a.id==='ai-customer');
if (!cust || !cust.human_review) { console.error('❌ ai-customer must have human_review: true'); process.exit(1); }
if (!Array.isArray(cust.reviewers)||cust.reviewers.length===0){ console.error('❌ reviewers required for ai-customer'); process.exit(1); }
console.log('✅ AI config ok');
