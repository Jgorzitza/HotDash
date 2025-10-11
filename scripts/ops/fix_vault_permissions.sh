#!/bin/bash
# File: scripts/ops/fix_vault_permissions.sh
# Purpose: Remediate vault file and directory permissions per compliance audit
# Owner: Deployment + Reliability
# Date: 2025-10-11

set -euo pipefail

VAULT_ROOT="vault"

echo "🔒 Starting vault permission remediation..."

# Check if vault directory exists
if [[ ! -d "$VAULT_ROOT" ]]; then
    echo "❌ Error: $VAULT_ROOT directory not found"
    exit 1
fi

# Fix directory permissions first
echo "📁 Fixing directory permissions..."
find "$VAULT_ROOT" -type d -exec chmod 700 {} \;

# Fix file permissions
echo "📄 Fixing file permissions..."
find "$VAULT_ROOT" -type f -exec chmod 600 {} \;

# Verify results
echo ""
echo "✅ Verification:"
echo ""

# Check for any files that don't have 600 permissions
BAD_FILES=$(find "$VAULT_ROOT" -type f ! -perm 600 | wc -l)
if [[ "$BAD_FILES" -gt 0 ]]; then
    echo "❌ Warning: $BAD_FILES files still have incorrect permissions:"
    find "$VAULT_ROOT" -type f ! -perm 600 -ls
else
    echo "✅ All files have correct permissions (600)"
fi

# Check for any directories that don't have 700 permissions
BAD_DIRS=$(find "$VAULT_ROOT" -type d ! -perm 700 | wc -l)
if [[ "$BAD_DIRS" -gt 0 ]]; then
    echo "❌ Warning: $BAD_DIRS directories still have incorrect permissions:"
    find "$VAULT_ROOT" -type d ! -perm 700 -ls
else
    echo "✅ All directories have correct permissions (700)"
fi

echo ""
echo "🔒 Vault permission remediation complete!"
echo ""
echo "📊 Summary:"
find "$VAULT_ROOT" -type f | wc -l | xargs echo "  Files secured:"
find "$VAULT_ROOT" -type d | wc -l | xargs echo "  Directories secured:"

# Log remediation for audit trail
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
mkdir -p artifacts/compliance
cat > "artifacts/compliance/vault_permissions_fix_$TIMESTAMP.log" <<EOF
Vault Permission Remediation Log
Date: $TIMESTAMP
Script: $0
User: $(whoami)
Host: $(hostname)

Files secured: $(find "$VAULT_ROOT" -type f | wc -l)
Directories secured: $(find "$VAULT_ROOT" -type d | wc -l)

Status: $(if [[ "$BAD_FILES" -eq 0 && "$BAD_DIRS" -eq 0 ]]; then echo "SUCCESS"; else echo "PARTIAL (review warnings above)"; fi)
EOF

echo ""
echo "📝 Audit log created: artifacts/compliance/vault_permissions_fix_$TIMESTAMP.log"

