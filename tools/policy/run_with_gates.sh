#!/usr/bin/env bash
# Policy Gate Wrapper
# Enforces branch naming, docs policy, AI config before execution
set -euo pipefail

echo "🚦 Running policy gates..."

# Gate 1: Branch naming
BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [[ ! $BRANCH =~ ^(agent|batch|hotfix)/.+ ]] && [[ $BRANCH != "main" ]]; then
  echo "❌ Branch name must start with agent/, batch/, or hotfix/ (current: $BRANCH)"
  exit 1
fi
echo "✅ Branch naming: $BRANCH"

# Gate 2: Docs policy
if ! node scripts/policy/check-docs.mjs >/dev/null 2>&1; then
  echo "❌ Docs policy check failed"
  node scripts/policy/check-docs.mjs
  exit 1
fi
echo "✅ Docs policy"

# Gate 3: AI config
if ! node scripts/policy/check-ai-config.mjs >/dev/null 2>&1; then
  echo "❌ AI config check failed"
  node scripts/policy/check-ai-config.mjs
  exit 1
fi
echo "✅ AI config"

echo "🎯 All gates passed. Executing command..."
echo ""

# Execute wrapped command
"$@"
