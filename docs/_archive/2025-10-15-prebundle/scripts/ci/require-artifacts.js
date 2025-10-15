#!/usr/bin/env node
const fs = require('fs');
const args = process.argv.slice(2);
const reqIndex = args.indexOf('--required');
const optIndex = args.indexOf('--optional');
const required = reqIndex !== -1 ? args.slice(reqIndex + 1, optIndex === -1 ? undefined : optIndex) : [];
const optional = optIndex !== -1 ? args.slice(optIndex + 1) : [];
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) { console.error('GITHUB_EVENT_PATH not set'); process.exit(2); }
const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const body = (event.pull_request && (event.pull_request.body || '')) || '';
const missing = required.filter(k => !new RegExp(k, 'i').test(body));
if (missing.length) {
  console.error('Missing required artifact references in PR body:', missing.join(', '));
  process.exit(1);
}
console.log('All required artifacts referenced.');
