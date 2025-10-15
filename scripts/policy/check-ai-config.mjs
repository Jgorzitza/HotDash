// scripts/policy/check-ai-config.mjs
import fs from 'node:fs';

const path = 'app/agents/config/agents.json';

if (!fs.existsSync(path)) {
  console.error(`❌ Missing ${path}. Create it to declare all agents and flags.`);
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));

// Enforce HITL for customer-facing agent
const cust = (cfg.agents || []).find(a => a.id === 'ai-customer');
if (!cust) {
  console.error('❌ Agent "ai-customer" not declared in app/agents/config/agents.json');
  process.exit(1);
}
if (!cust.human_review) {
  console.error('❌ "ai-customer" must have `"human_review": true` (HITL).');
  process.exit(1);
}
if (!Array.isArray(cust.reviewers) || cust.reviewers.length === 0) {
  console.error('❌ "ai-customer" must specify `reviewers: ["<github handle or email>"]`.');
  process.exit(1);
}

console.log('✅ AI config check passed.');