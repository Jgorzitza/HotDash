#!/usr/bin/env bash
set -euo pipefail

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" == "HEAD" || "$branch" == "main" || "$branch" == "manager/sprint-lock-sync" ]]; then
  exit 0
fi

if [[ "$branch" =~ ^(guardrails|manager-batch|batch)-[0-9]{8}T[0-9]{6}Z(/.+)?$ ]]; then
  exit 0
fi

echo "✖ Branch '$branch' does not follow naming policy" >&2
echo "   Expected guardrails-<BATCH_ID>, manager-batch-<BATCH_ID>, or batch-<BATCH_ID>/<slug>" >&2
exit 1
