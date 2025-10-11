#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

function getChangedFiles() {
  // Compare against base ref if available, else use origin/main as fallback
  const base = process.env.GITHUB_BASE_REF || 'origin/main';
  try {
    const diff = execSync(`git --no-pager diff --name-only ${base}...HEAD`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    return diff ? diff.split('\n') : [];
  } catch (e) {
    // Fallback to last merge base with main
    const mb = execSync('git merge-base HEAD origin/main').toString().trim();
    const diff = execSync(`git --no-pager diff --name-only ${mb}...HEAD`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    return diff ? diff.split('\n') : [];
  }
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function main() {
  const changed = getChangedFiles();
  const directionChanges = changed.filter(p => p.startsWith('docs/directions/') && p.endsWith('.md'));
  if (!directionChanges.length) {
    console.log('No direction docs modified.');
    return;
  }

  // Enforce: only manager may modify direction docs. PR must be authored by manager team or labeled approved-by-manager.
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return fail('GITHUB_EVENT_PATH not set.');
  }
  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const author = event.pull_request && event.pull_request.user && event.pull_request.user.login || '';
  const labels = (event.pull_request && event.pull_request.labels || []).map(l => l.name.toLowerCase());

  const allowedAuthors = ['manager-team', 'hotdash-manager', 'justin']; // adjust as needed
  const hasManagerLabel = labels.includes('approved-by-manager') || labels.includes('manager-change');

  if (!allowedAuthors.includes(author) && !hasManagerLabel) {
    const list = directionChanges.map(p => `- ${p}`).join('\n');
    return fail(`Direction docs may only be modified by the manager.\nChanged files:\n${list}\nAdd the 'approved-by-manager' label or have the manager author the PR.`);
  }
  console.log('Direction change allowed by policy.');
}

main();
