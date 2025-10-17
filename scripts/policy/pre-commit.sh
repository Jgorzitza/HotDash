#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

./scripts/policy/check-branch.sh
./scripts/policy/block-env-keys.sh
./scripts/policy/check-diff-scope.sh

FILES=$(git diff --cached --name-only)

MAX_BYTES=$((1024 * 1024)) # 1 MiB
for file in $FILES; do
  if [[ -f "$file" ]]; then
    if stat --version >/dev/null 2>&1; then
      size=$(stat -c%s "$file")
    else
      size=$(stat -f%z "$file")
    fi
    if (( size > MAX_BYTES )); then
      echo "✖ Pre-commit blocked: $file is larger than 1MiB" >&2
      exit 1
    fi
    if git diff --cached -- "$file" | grep -E "(API_KEY|SECRET|BEGIN RSA PRIVATE KEY|PUBLER_|SHOPIFY_|SUPABASE_)" >/dev/null 2>&1; then
      echo "✖ Potential secret detected in $file" >&2
      exit 1
    fi
  fi
done

echo "ℹ Running secrets scan"
./scripts/security/scan-secrets.sh

echo "ℹ Running lint"
npm run lint

echo "ℹ Running unit tests"
npm run test:unit -- --runInBand
