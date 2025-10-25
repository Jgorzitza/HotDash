#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 \"<command>\"" >&2
  exit 2
fi

CMD="$1"

# Preflight gates
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

if [ -x scripts/policy/check-branch.sh ]; then scripts/policy/check-branch.sh || true; fi
if [ -x scripts/policy/check-diff-scope.sh ]; then scripts/policy/check-diff-scope.sh || true; fi
if [ -x scripts/policy/block-env-keys.sh ]; then scripts/policy/block-env-keys.sh || true; fi
if [ -x scripts/policy/check-docs.mjs ]; then node scripts/policy/check-docs.mjs || true; fi

# Execute under heartbeat if available for foreground proof
AGENT_NAME="content"
if [ -x scripts/policy/with-heartbeat.sh ]; then
  exec scripts/policy/with-heartbeat.sh "$AGENT_NAME" -- bash -lc "$CMD"
else
  exec bash -lc "$CMD"
fi

