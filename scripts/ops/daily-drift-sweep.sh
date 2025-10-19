#!/usr/bin/env bash
# Daily drift sweep - detects stray files, planning TTL violations, policy issues
set -euo pipefail

REPORT_FILE="${REPORT_FILE:-reports/status/gaps.md}"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$(dirname "$REPORT_FILE")"

# Initialize report
cat > "$REPORT_FILE" << EOF
# Drift Sweep Report

**Generated**: $TIMESTAMP  
**Script**: scripts/ops/daily-drift-sweep.sh

## Summary

EOF

VIOLATIONS=0

# Check 1: Docs policy
echo "🔍 Running docs policy check..." >&2
if node scripts/policy/check-docs.mjs 2>&1 | tee -a "$REPORT_FILE"; then
  echo "✅ Docs policy: PASS" >> "$REPORT_FILE"
else
  echo "❌ Docs policy: VIOLATIONS FOUND" >> "$REPORT_FILE"
  ((VIOLATIONS++))
fi

echo "" >> "$REPORT_FILE"

# Check 2: Stray markdown files in feedback/
echo "🔍 Checking for stray .md files in feedback/..." >&2
STRAY_FILES=$(find feedback/ -maxdepth 1 -name "*.md" -not -name "README.md" 2>/dev/null || true)

if [ -z "$STRAY_FILES" ]; then
  echo "✅ No stray markdown files in feedback/" >> "$REPORT_FILE"
else
  echo "❌ Stray markdown files found in feedback/:" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo "$STRAY_FILES" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "**Action**: Archive to feedback/archive/<DATE>/" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  ((VIOLATIONS++))
fi

# Check 3: Planning files older than 7 days
echo "🔍 Checking for expired planning files (>7 days)..." >&2
if [ -d "docs/planning" ]; then
  OLD_PLANNING=$(find docs/planning -name "*.md" -type f -mtime +7 2>/dev/null || true)
  
  if [ -z "$OLD_PLANNING" ]; then
    echo "✅ No expired planning files (>7 days)" >> "$REPORT_FILE"
  else
    echo "❌ Expired planning files found (>7 days old):" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "$OLD_PLANNING" | while read -r file; do
      AGE_DAYS=$(( ($(date +%s) - $(stat -c %Y "$file")) / 86400 ))
      echo "$file (${AGE_DAYS} days old)"
    done >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Action**: Archive to docs/_archive/<DATE>/planning/" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((VIOLATIONS++))
  fi
else
  echo "ℹ️  No docs/planning directory found" >> "$REPORT_FILE"
fi

# Check 4: Large feedback files (>5000 lines)
echo "🔍 Checking for oversized feedback files..." >&2
LARGE_FEEDBACK=""
for agent_dir in feedback/*/; do
  if [ -d "$agent_dir" ]; then
    for feedback_file in "$agent_dir"/*.md; do
      if [ -f "$feedback_file" ] && [ "$(basename "$feedback_file")" != "README.md" ]; then
        LINES=$(wc -l < "$feedback_file")
        if [ "$LINES" -gt 5000 ]; then
          LARGE_FEEDBACK="${LARGE_FEEDBACK}${feedback_file} (${LINES} lines)\n"
        fi
      fi
    done
  fi
done

if [ -z "$LARGE_FEEDBACK" ]; then
  echo "✅ No oversized feedback files (all <5000 lines)" >> "$REPORT_FILE"
else
  echo "❌ Oversized feedback files found (>5000 lines):" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo -e "$LARGE_FEEDBACK" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "**Action**: Review and summarize or archive old entries" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  ((VIOLATIONS++))
fi

# Summary
echo "" >> "$REPORT_FILE"
echo "## Result" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$VIOLATIONS" -eq 0 ]; then
  echo "✅ **PASS** - No drift violations detected" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "All checks passed. Repository is clean." >> "$REPORT_FILE"
  echo "✅ Drift sweep: PASS ($TIMESTAMP)" >&2
  exit 0
else
  echo "❌ **FAIL** - $VIOLATIONS violation(s) detected" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "Review violations above and take corrective action." >> "$REPORT_FILE"
  echo "❌ Drift sweep: $VIOLATIONS violation(s) ($TIMESTAMP)" >&2
  exit 1
fi

