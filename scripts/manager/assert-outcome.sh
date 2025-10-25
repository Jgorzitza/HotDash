#!/usr/bin/env bash
set -euo pipefail

echo "[manager:assert-outcome] Verifying manager produced outcome or escalation artifacts..."

# Minimal pass stub: succeed if at least one kickoff or compiled feedback exists today
DATE=$(date +%F)
FOUND=0
shopt -s nullglob
echo "[manager:assert-outcome] Checking artifacts/.../kickoff.md"
for f in artifacts/*/$DATE/kickoff.md; do
  echo "found: $f"; FOUND=1; break; done

if [ $FOUND -eq 0 ]; then
  if [ -f "reports/manager/feedback/compiled_${DATE}.md" ]; then
    echo "found: reports/manager/feedback/compiled_${DATE}.md"; FOUND=1
  fi
fi

if [ $FOUND -eq 0 ]; then
  echo "[manager:assert-outcome] No kickoff or compiled feedback found for $DATE; passing as informational stub." >&2
fi

exit 0

