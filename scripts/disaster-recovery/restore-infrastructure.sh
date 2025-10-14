#!/usr/bin/env bash
set -euo pipefail

# Infrastructure Restore Script
# Restores infrastructure from backup

BACKUP_ID="${1:-}"

if [ -z "$BACKUP_ID" ]; then
  echo "ERROR: Backup ID required"
  echo "Usage: $0 <backup-id>"
  echo ""
  echo "Available backups:"
  ls -1 artifacts/backups/ | grep -E "^[0-9]{8}-[0-9]{6}$" | head -10
  exit 1
fi

BACKUP_DIR="artifacts/backups/${BACKUP_ID}"
RESTORE_LOG="artifacts/restore/restore-${BACKUP_ID}-$(date +%Y%m%d-%H%M%S).log"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "ERROR: Backup not found: $BACKUP_DIR"
  exit 1
fi

echo "=================================================="
echo "Infrastructure Restore"
echo "=================================================="
echo "Backup ID: $BACKUP_ID"
echo "Restore Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

mkdir -p artifacts/restore

# Start logging
exec > >(tee -a "$RESTORE_LOG") 2>&1

echo "Restore Log" > "$RESTORE_LOG"
echo "Backup ID: $BACKUP_ID" >> "$RESTORE_LOG"
echo "Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$RESTORE_LOG"
echo "" >> "$RESTORE_LOG"

# Verify backup integrity
echo "1. Verifying backup integrity..."
if [ -f "$BACKUP_DIR/checksums.txt" ]; then
  cd "$BACKUP_DIR"
  if sha256sum -c checksums.txt > /dev/null 2>&1; then
    echo "✅ Checksum verification passed"
  else
    echo "❌ WARNING: Checksum verification failed!"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
      echo "Restore aborted."
      exit 1
    fi
  fi
  cd - > /dev/null
else
  echo "⚠️ No checksums found, skipping verification"
fi

# Review backup manifest
echo ""
echo "2. Reviewing backup manifest..."
if [ -f "$BACKUP_DIR/backup-manifest.md" ]; then
  cat "$BACKUP_DIR/backup-manifest.md"
  echo ""
  read -p "Proceed with restore? (yes/no): " PROCEED
  if [ "$PROCEED" != "yes" ]; then
    echo "Restore cancelled by user."
    exit 0
  fi
else
  echo "⚠️ WARNING: No manifest found!"
  read -p "Continue without manifest? (yes/no): " CONTINUE
  if [ "$CONTINUE" != "yes" ]; then
    echo "Restore aborted."
    exit 1
  fi
fi

echo ""
echo "3. Restoring repository configuration..."
if [ -d "$BACKUP_DIR/repo-config" ]; then
  # Backup current configs first
  mkdir -p artifacts/restore/pre-restore-backup
  cp fly.toml artifacts/restore/pre-restore-backup/ 2>/dev/null || true
  cp shopify.app.toml artifacts/restore/pre-restore-backup/ 2>/dev/null || true
  
  # Restore configs
  cp "$BACKUP_DIR/repo-config/fly.toml" . 2>/dev/null && echo "✅ fly.toml restored" || echo "⚠️ fly.toml not in backup"
  cp "$BACKUP_DIR/repo-config/shopify.app.toml" . 2>/dev/null && echo "✅ shopify.app.toml restored" || echo "⚠️ shopify.app.toml not in backup"
  
  # Restore GitHub workflows
  if [ -d "$BACKUP_DIR/repo-config/workflows" ]; then
    cp -r "$BACKUP_DIR/repo-config/workflows/"* .github/workflows/ 2>/dev/null && echo "✅ GitHub workflows restored" || echo "⚠️ Workflows not in backup"
  fi
else
  echo "⚠️ No repo config in backup"
fi

echo ""
echo "4. Restoring Supabase configuration..."
if [ -d "$BACKUP_DIR/supabase" ]; then
  # Backup current Prisma schema
  cp prisma/schema.prisma artifacts/restore/pre-restore-backup/ 2>/dev/null || true
  
  # Restore Prisma schema
  cp "$BACKUP_DIR/supabase/schema.prisma" prisma/ 2>/dev/null && echo "✅ Prisma schema restored" || echo "⚠️ Prisma schema not in backup"
  
  # Restore migrations
  if [ -d "$BACKUP_DIR/supabase/migrations" ]; then
    cp -r "$BACKUP_DIR/supabase/migrations/"* supabase/migrations/ 2>/dev/null && echo "✅ Migrations restored" || echo "⚠️ Migrations not in backup"
  fi
else
  echo "⚠️ No Supabase config in backup"
fi

echo ""
echo "5. Restoring deployment scripts..."
if [ -d "$BACKUP_DIR/scripts" ]; then
  # Backup current scripts
  cp -r scripts/deploy artifacts/restore/pre-restore-backup/ 2>/dev/null || true
  cp -r scripts/monitoring artifacts/restore/pre-restore-backup/ 2>/dev/null || true
  
  # Restore scripts
  cp -r "$BACKUP_DIR/scripts/deploy/"* scripts/deploy/ 2>/dev/null && echo "✅ Deploy scripts restored" || echo "⚠️ Deploy scripts not in backup"
  cp -r "$BACKUP_DIR/scripts/monitoring/"* scripts/monitoring/ 2>/dev/null && echo "✅ Monitoring scripts restored" || echo "⚠️ Monitoring scripts not in backup"
  
  # Ensure scripts are executable
  chmod +x scripts/deploy/*.sh 2>/dev/null || true
  chmod +x scripts/monitoring/*.sh 2>/dev/null || true
fi

echo ""
echo "6. Restoring documentation..."
if [ -d "$BACKUP_DIR/docs" ]; then
  cp -r "$BACKUP_DIR/docs/"* docs/ 2>/dev/null && echo "✅ Documentation restored" || echo "⚠️ Documentation not in backup"
fi

echo ""
echo "7. Fly.io configuration review..."
echo "⚠️ MANUAL STEP REQUIRED:"
echo "   Fly.io app configurations are in: $BACKUP_DIR/fly-configs/"
echo "   Review each app's config and apply manually if needed:"
echo ""
for app in hotdash-staging hotdash-agent-service hotdash-llamaindex-mcp hotdash-chatwoot; do
  if [ -f "$BACKUP_DIR/fly-configs/${app}-config.toml" ]; then
    echo "   - $app: cat $BACKUP_DIR/fly-configs/${app}-config.toml"
  fi
done

echo ""
echo "8. Post-restore verification..."
echo "Run these commands to verify restore:"
echo "  1. npm install  # Restore dependencies"
echo "  2. npm run typecheck  # Verify TypeScript"
echo "  3. npm run test:unit  # Run tests"
echo "  4. bash scripts/deploy/verify-environment-parity.sh  # Verify parity"
echo ""

# Create restore summary
cat > "artifacts/restore/restore-summary-$(date +%Y%m%d-%H%M%S).md" <<EOF
# Infrastructure Restore Summary
Backup ID: $BACKUP_ID
Restore Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Log: $RESTORE_LOG

## Restored Components
- ✅ Repository configuration
- ✅ Supabase configuration
- ✅ Deployment scripts
- ✅ Documentation
- ⚠️ Fly.io configs (manual review required)

## Pre-Restore Backup
Current configs backed up to: artifacts/restore/pre-restore-backup/

## Post-Restore Actions Required
1. Review Fly.io configs in: $BACKUP_DIR/fly-configs/
2. Apply Fly.io configs manually if needed
3. Run verification commands:
   - npm install
   - npm run typecheck
   - npm run test:unit
   - bash scripts/deploy/verify-environment-parity.sh
4. Test deployment to staging
5. Verify all services healthy

## Rollback Procedure
If restore causes issues:
1. Restore from pre-restore backup: artifacts/restore/pre-restore-backup/
2. Or use git to revert changes: git checkout HEAD -- <files>
3. Redeploy previous working version

EOF

echo "=================================================="
echo "Restore Complete!"
echo "=================================================="
echo "Backup ID: $BACKUP_ID"
echo "Restore Log: $RESTORE_LOG"
echo "Pre-restore backup: artifacts/restore/pre-restore-backup/"
echo ""
echo "⚠️ IMPORTANT POST-RESTORE STEPS:"
echo "1. Review Fly.io configs (manual)"
echo "2. Run verification: npm install && npm run test:unit"
echo "3. Test staging deployment"
echo "4. Verify all services"
echo "=================================================="

exit 0

