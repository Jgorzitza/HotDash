#!/usr/bin/env bash
set -euo pipefail
since="${SINCE_MINUTES:-10} minutes ago"
last_feedback_ts=$(git log --since="$since" --format="%ct" -- feedback/*.md || true)
if [[ -z "$last_feedback_ts" ]]; then
  echo "::warning::No feedback updates in the last ${SINCE_MINUTES:-10} minutes."
  exit 1
fi
echo "Feedback updated recently."
