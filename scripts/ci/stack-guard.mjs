#!/usr/bin/env node
import { execSync } from 'child_process';

function fail(msg){ console.error(msg); process.exit(1); }

// Disallow alternate databases or redis usage in app code.
// Allowed redis usage only under deploy/chatwoot/** and docs/**
const disallowPatterns = [
  { pattern: 'mysql', paths: ['app/', 'packages/', 'scripts/'] },
  { pattern: 'mongodb', paths: ['app/', 'packages/', 'scripts/'] },
  { pattern: 'sqlite', paths: ['app/', 'packages/', 'scripts/'] },
  { pattern: 'fly.*postgres', paths: ['app/', 'packages/', 'scripts/', 'docs/'] },
  { pattern: 'redis://', paths: ['app/', 'packages/'] },
];

const exceptions = [
  'deploy/chatwoot/',
  'docs/',
  'artifacts/',
  'staging/',
];

function grep(pattern, path){
  try {
    const out = execSync(`grep -RInE "${pattern}" ${path}`, { stdio: ['ignore','pipe','pipe'] }).toString().trim();
    return out ? out.split('\n') : [];
  } catch {
    return [];
  }
}

let violations = [];
disallowPatterns.forEach(({pattern, paths}) => {
  paths.forEach(p => {
    const hits = grep(pattern, p);
    hits.forEach(h => {
      const file = h.split(':')[0];
      if (!exceptions.some(ex => file.startsWith(ex))) {
        violations.push(h);
      }
    });
  });
});

if (violations.length) {
  fail(`Canonical toolkit violations detected:\n${violations.map(v => '- ' + v).join('\n')}\n\nUse Supabase Postgres only. Redis is only permitted for Chatwoot under deploy/chatwoot/.`);
}

console.log('Canonical toolkit guard passed.');