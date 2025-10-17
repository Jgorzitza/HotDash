#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
MERGE_FILE="$ROOT/reports/manager/merge.md"
ESCALATION_FILE="$ROOT/reports/manager/ESCALATION.md"

if [[ -f "$MERGE_FILE" ]]; then
  if grep -q '✅' "$MERGE_FILE"; then
    echo "Manager merge report shows successful lane completion"
    exit 0
  fi
  if grep -E '\|https?://github.com/.+/pull/' "$MERGE_FILE" >/dev/null 2>&1; then
    echo "Found PR reference in merge report"
    exit 0
  fi
fi

if [[ -f "$ESCALATION_FILE" ]]; then
  if ! grep -qi 'no active escalations' "$ESCALATION_FILE"; then
    echo "Escalation present; manager may proceed after unblock"
    exit 0
  fi
fi

echo "Manager did not produce a PR or an escalation. Update reports/manager/merge.md or reports/manager/ESCALATION.md." >&2
exit 1
