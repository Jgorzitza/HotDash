#!/usr/bin/env bash
# Monthly security audit script
set -euo pipefail

REPORT_FILE="artifacts/security/audit-$(date +%Y-%m-%d).md"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p artifacts/security

cat > "$REPORT_FILE" << EOF
# Security Audit Report

**Date**: $TIMESTAMP  
**Conducted by**: DevOps Automation  
**Script**: scripts/ops/security-audit.sh

## Summary

EOF

ISSUES=0

# Check 1: Gitleaks scan
echo "🔍 Running Gitleaks secrets scan..." >&2
if gitleaks detect --source . --config .gitleaks.toml --redact --no-git 2>&1 | tee -a "$REPORT_FILE"; then
  echo "✅ Gitleaks: No secrets detected" >> "$REPORT_FILE"
else
  echo "❌ Gitleaks: Secrets detected - IMMEDIATE ACTION REQUIRED" >> "$REPORT_FILE"
  ((ISSUES++))
fi
echo "" >> "$REPORT_FILE"

# Check 2: npm audit
echo "🔍 Running npm audit..." >&2
NPM_AUDIT=$(npm audit --json 2>/dev/null || true)
HIGH_VULNS=$(echo "$NPM_AUDIT" | jq '.metadata.vulnerabilities.high // 0')
CRITICAL_VULNS=$(echo "$NPM_AUDIT" | jq '.metadata.vulnerabilities.critical // 0')

echo "### npm Audit" >> "$REPORT_FILE"
echo "- High vulnerabilities: $HIGH_VULNS" >> "$REPORT_FILE"
echo "- Critical vulnerabilities: $CRITICAL_VULNS" >> "$REPORT_FILE"

if [ "$HIGH_VULNS" -gt 0 ] || [ "$CRITICAL_VULNS" -gt 0 ]; then
  echo "❌ Action required: Run \`npm audit fix\`" >> "$REPORT_FILE"
  ((ISSUES++))
else
  echo "✅ No high/critical vulnerabilities" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# Check 3: GitHub Security Features
echo "🔍 Checking GitHub security features..." >&2
echo "### GitHub Security Features" >> "$REPORT_FILE"

# Secret scanning (via gh CLI)
SECRET_ALERTS=$(gh api repos/Jgorzitza/HotDash/secret-scanning/alerts --jq 'length' 2>/dev/null || echo "unknown")
echo "- Secret scanning alerts: $SECRET_ALERTS" >> "$REPORT_FILE"

if [ "$SECRET_ALERTS" != "0" ] && [ "$SECRET_ALERTS" != "unknown" ]; then
  echo "⚠️  Secrets detected in repository" >> "$REPORT_FILE"
  ((ISSUES++))
fi
echo "" >> "$REPORT_FILE"

# Check 4: Environment variables
echo "🔍 Checking for .env files in git..." >&2
ENV_FILES=$(git ls-files | grep -E "\.env$|\.env\.[^.]+$" || true)

echo "### Environment Files in Git" >> "$REPORT_FILE"
if [ -z "$ENV_FILES" ]; then
  echo "✅ No .env files in repository" >> "$REPORT_FILE"
else
  echo "❌ .env files found in git:" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo "$ENV_FILES" >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo "**Action**: Remove from git, add to .gitignore" >> "$REPORT_FILE"
  ((ISSUES++))
fi
echo "" >> "$REPORT_FILE"

# Check 5: Outdated dependencies
echo "🔍 Checking for outdated dependencies..." >&2
OUTDATED=$(npm outdated --json 2>/dev/null | jq 'length' || echo "0")
echo "### Outdated Dependencies" >> "$REPORT_FILE"
echo "- Packages with updates available: $OUTDATED" >> "$REPORT_FILE"
echo "- Review: Run \`npm outdated\` for details" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Summary
echo "## Result" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$ISSUES" -eq 0 ]; then
  echo "✅ **PASS** - No critical security issues detected" >> "$REPORT_FILE"
  echo "✅ Security audit: PASS ($TIMESTAMP)" >&2
  exit 0
else
  echo "❌ **FAIL** - $ISSUES critical issue(s) detected" >> "$REPORT_FILE"
  echo "❌ Security audit: $ISSUES issue(s) ($TIMESTAMP)" >&2
  exit 1
fi

