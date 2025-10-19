#!/usr/bin/env node
// Fast-fail check: verify referenced contract test/script paths in directions exist.
// Scans docs/directions/*.md for lines containing "Contract Test" and "Command:" and
// extracts likely file paths from the command snippets to assert presence on disk.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'docs', 'directions');

function listDirectionFiles() {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    // Ignore template file which contains placeholder commands/paths
    .filter((f) => f !== 'agenttemplate.md')
    .map((f) => path.join(DIR, f));
}

function extractCommandSnippets(md) {
  const lines = md.split(/\r?\n/);
  const snippets = [];
  for (const line of lines) {
    if (/\bCommand\b/i.test(line)) {
      // Try to extract content between backticks first
      const backticked = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      if (backticked.length) {
        snippets.push(...backticked);
        continue;
      }
      // Else push the raw line after the colon
      const parts = line.split(':');
      if (parts.length > 1) snippets.push(parts.slice(1).join(':').trim());
    }
  }
  return snippets;
}

function candidatePathsFromCommand(cmd) {
  // Capture tokens that look like repo paths (contain '/' and end with known suffixes)
  const tokens = cmd
    .split(/\s+/)
    .map((t) => t.replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
  const suffixes = [
    '.spec.ts',
    '.spec.tsx',
    '.test.ts',
    '.test.tsx',
    '.ts',
    '.tsx',
    '.js',
    '.mjs',
    '.sql',
    '.md',
    '.sh',
  ];
  const deny = new Set(['npm', 'npx', 'node', 'rg', 'psql']);
  const results = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const bare = t.replace(/^["']|["']$/g, '');
    if (!bare.includes('/') && !bare.startsWith('supabase/')) continue;
    if (bare.startsWith('$') || bare.includes('$')) continue; // env var
    if (deny.has(bare)) continue;
    const hasSuffix = suffixes.some((s) => bare.endsWith(s));
    if (hasSuffix) results.push(bare);
    // Special handling for -f supabase/rls_tests.sql
    if (bare === '-f' && tokens[i + 1]) {
      const next = tokens[i + 1];
      if (suffixes.some((s) => next.endsWith(s))) results.push(next);
    }
  }
  return results;
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function main() {
  const files = listDirectionFiles();
  const missing = [];
  for (const file of files) {
    const md = fs.readFileSync(file, 'utf8');
    const cmds = extractCommandSnippets(md);
    for (const cmd of cmds) {
      const paths = candidatePathsFromCommand(cmd);
      for (const p of paths) {
        if (!exists(p)) {
          missing.push({ from: path.relative(ROOT, file), path: p, cmd });
        }
      }
    }
  }

  if (missing.length) {
    console.error('\n❌ Contract path check failed. Missing referenced paths:');
    for (const m of missing) {
      console.error(`  - ${m.path}  (from ${m.from})`);
      console.error(`    command: ${m.cmd}`);
    }
    process.exit(1);
  }
  console.log('✅ Contract paths check passed.');
}

try {
  main();
} catch (e) {
  console.error('❌ Error running contract path check:', e?.message || e);
  process.exit(1);
}
