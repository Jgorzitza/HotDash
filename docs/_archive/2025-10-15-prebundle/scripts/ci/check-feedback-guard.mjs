#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

function getChangedFiles() {
  const base = process.env.GITHUB_BASE_REF || 'origin/main';
  try {
    const out = execSync(`git --no-pager diff --name-status ${base}...HEAD`, { stdio: ['ignore','pipe','pipe']}).toString().trim();
    return out ? out.split('\n').map(line => ({status: line.split('\t')[0], path: line.split('\t')[1]})) : [];
  } catch (e) {
    const mb = execSync('git merge-base HEAD origin/main').toString().trim();
    const out = execSync(`git --no-pager diff --name-status ${mb}...HEAD`, { stdio: ['ignore','pipe','pipe']}).toString().trim();
    return out ? out.split('\n').map(line => ({status: line.split('\t')[0], path: line.split('\t')[1]})) : [];
  }
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const allowedFeedbackFiles = new Set([
  'feedback/ai.md',
  'feedback/compliance.md',
  'feedback/data.md',
  'feedback/data_to_integrations_coordination.md',
  'feedback/data_to_reliability_coordination.md',
  'feedback/deployment.md',
  'feedback/designer.md',
  'feedback/enablement.md',
  'feedback/engineer.md',
  'feedback/integrations.md',
  'feedback/localization.md',
  'feedback/manager.md',
  'feedback/marketing.md',
  'feedback/product.md',
  'feedback/qa.md',
  'feedback/reliability.md',
  'feedback/reliability_to_data_coordination.md',
  'feedback/reliability_to_engineer_coordination.md',
  'feedback/support.md',
  'feedback/chatwoot.md',
]);

function main() {
  const changed = getChangedFiles();
  const fbChanges = changed.filter(c => c.path && c.path.startsWith('feedback/'));
  if (!fbChanges.length) {
    console.log('No feedback changes.');
    return;
  }
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return fail('GITHUB_EVENT_PATH not set');
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const author = event.pull_request?.user?.login || '';
  const labels = (event.pull_request?.labels || []).map(l => l.name.toLowerCase());
  const hasManagerLabel = labels.includes('approved-by-manager');
  const allowedManagers = new Set(['manager-team','hotdash-manager','justin']); // adjust as needed

  // 1) Block ad-hoc files in feedback/ (must be in allowlist or under alerts/ or archive/)
  const badNew = fbChanges.filter(c => (c.status === 'A' || c.status === 'AM' || c.status === 'R') &&
    !allowedFeedbackFiles.has(c.path) &&
    !c.path.startsWith('feedback/alerts/') &&
    !c.path.startsWith('feedback/archive/'));
  if (badNew.length) {
    const list = badNew.map(b => `- ${b.path}`).join('\n');
    return fail(`Unexpected feedback file(s) detected. Use role files only.\n${list}`);
  }

  // 2) feedback/manager.md may only be edited by manager or with approved-by-manager label
  const mgrTouched = fbChanges.find(c => c.path === 'feedback/manager.md');
  if (mgrTouched && !allowedManagers.has(author) && !hasManagerLabel) {
    return fail("feedback/manager.md may only be edited by the Manager. Add 'approved-by-manager' label or have Manager author the PR.");
  }

  console.log('Feedback Guard passed.');
}

main();
