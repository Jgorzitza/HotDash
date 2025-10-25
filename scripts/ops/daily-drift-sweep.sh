#!/usr/bin/env bash
set -euo pipefail

REPORT_DIR="reports/status"
REPORT_FILE="$REPORT_DIR/gaps.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "Daily Drift Sweep - $TIMESTAMP"
mkdir -p "$REPORT_DIR"

# Initialize report
echo "# Drift & Security Gaps Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Generated:** $TIMESTAMP" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking docs policy..."
if node scripts/policy/check-docs.mjs > /tmp/policy-check.log 2>&1; then
    echo "## ✅ Docs Policy" >> "$REPORT_FILE"
    echo "All markdown files comply with allow-list." >> "$REPORT_FILE"
else
    echo "## ❌ Docs Policy FAILED" >> "$REPORT_FILE"
    tail -10 /tmp/policy-check.log >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

echo "Running secrets scan..."
if npm run scan > /tmp/gitleaks-scan.log 2>&1; then
    echo "## ✅ Secrets Scan" >> "$REPORT_FILE"
    echo "No secrets detected." >> "$REPORT_FILE"
else
    echo "## ❌ Secrets Scan FAILED" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

POLICY_STATUS=$(grep -q "✅ Docs Policy" "$REPORT_FILE" && echo "PASS" || echo "FAIL")
SECRETS_STATUS=$(grep -q "✅ Secrets Scan" "$REPORT_FILE" && echo "PASS" || echo "FAIL")

echo "## Summary" >> "$REPORT_FILE"
echo "- Docs Policy: $POLICY_STATUS" >> "$REPORT_FILE"
echo "- Secrets Scan: $SECRETS_STATUS" >> "$REPORT_FILE"

echo "Drift sweep complete: $REPORT_FILE"

