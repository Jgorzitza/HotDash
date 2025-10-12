#!/usr/bin/env bash
set -euo pipefail

# Write a standardized feedback entry to a role feedback file.
# Usage: scripts/ops/feedback-log.sh <role> <timestamp> <command> <evidence_path>
role="${1:-}"
ts="${2:-}"
cmd="${3:-}"
evidence="${4:-}"

if [[ -z "$role" || -z "$ts" || -z "$cmd" || -z "$evidence" ]]; then
  echo "Usage: $0 <role> <timestamp> <command> <evidence_path>" >&2
  exit 2
fi

file="feedback/${role}.md"
if [[ ! -f "$file" ]]; then
  echo "Feedback file $file does not exist." >&2
  exit 1
fi

{
  echo ""
  echo "## ${ts} — Automated Feedback Entry"
  echo "- Command: \\\`$cmd\\\`"
  echo "- Evidence: $evidence"
} >> "$file"

echo "Logged feedback to $file"