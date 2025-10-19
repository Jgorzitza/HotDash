#!/usr/bin/env bash
set -euo pipefail

echo "== preflight checks =="
node scripts/policy/check-docs.mjs
node scripts/policy/check-ai-config.mjs
gitleaks detect --source . --redact >/dev/null || true

echo "== execute task =="
bash -lc "$1"

echo "== verify =="
git diff --quiet && git diff --cached --quiet || { echo "Dirty tree"; exit 1; }
[ -f ".github/workflows/guard-mcp.yml" ] || { echo "Missing guard-mcp"; exit 1; }
[ -f ".github/workflows/idle-guard.yml" ] || { echo "Missing idle-guard"; exit 1; }
node scripts/policy/check-docs.mjs >/dev/null
node scripts/policy/check-ai-config.mjs >/dev/null
gitleaks detect --source . --redact >/dev/null || true
echo "PASS"

