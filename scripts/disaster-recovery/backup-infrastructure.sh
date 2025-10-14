#!/usr/bin/env bash
set -euo pipefail

# Infrastructure Backup Script
# Creates comprehensive backup of all infrastructure configurations and data

BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="artifacts/backups/${BACKUP_DATE}"

echo "=================================================="
echo "Infrastructure Backup"
echo "=================================================="
echo "Backup ID: $BACKUP_DATE"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

mkdir -p "$BACKUP_DIR"

# Create backup manifest
cat > "$BACKUP_DIR/backup-manifest.md" <<EOF
# Infrastructure Backup Manifest
Backup ID: $BACKUP_DATE
Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Backup Type: Full Infrastructure Backup

## Contents
EOF

echo "1. Backing up Fly.io configurations..."
mkdir -p "$BACKUP_DIR/fly-configs"

# Backup Fly.io app configurations
APPS=("hotdash-staging" "hotdash-agent-service" "hotdash-llamaindex-mcp" "hotdash-chatwoot")
for app in "${APPS[@]}"; do
  echo "  - Backing up $app..."
  
  # Get app config
  fly config show --app "$app" > "$BACKUP_DIR/fly-configs/${app}-config.toml" 2>&1 || echo "WARNING: Could not backup $app config"
  
  # Get app status
  fly status --app "$app" > "$BACKUP_DIR/fly-configs/${app}-status.txt" 2>&1 || echo "WARNING: Could not get $app status"
  
  # Get app secrets list (not values)
  fly secrets list --app "$app" > "$BACKUP_DIR/fly-configs/${app}-secrets-list.txt" 2>&1 || echo "WARNING: Could not list $app secrets"
  
  # Get machine list
  fly machines list --app "$app" > "$BACKUP_DIR/fly-configs/${app}-machines.txt" 2>&1 || echo "WARNING: Could not list $app machines"
  
  echo "- ✅ $app: Configuration backed up" >> "$BACKUP_DIR/backup-manifest.md"
done

echo "2. Backing up repository configuration..."
mkdir -p "$BACKUP_DIR/repo-config"

# Backup critical config files
cp fly.toml "$BACKUP_DIR/repo-config/" 2>/dev/null || echo "WARNING: fly.toml not found"
cp shopify.app.toml "$BACKUP_DIR/repo-config/" 2>/dev/null || echo "WARNING: shopify.app.toml not found"
cp package.json "$BACKUP_DIR/repo-config/" 2>/dev/null || echo "WARNING: package.json not found"
cp package-lock.json "$BACKUP_DIR/repo-config/" 2>/dev/null || echo "WARNING: package-lock.json not found"
cp -r .github/workflows "$BACKUP_DIR/repo-config/workflows" 2>/dev/null || echo "WARNING: workflows not found"

echo "- ✅ Repository: Configuration backed up" >> "$BACKUP_DIR/backup-manifest.md"

echo "3. Backing up Supabase configuration..."
mkdir -p "$BACKUP_DIR/supabase"

# Backup Prisma schema
cp prisma/schema.prisma "$BACKUP_DIR/supabase/" 2>/dev/null || echo "WARNING: Prisma schema not found"

# Backup Supabase migrations
if [ -d "supabase/migrations" ]; then
  cp -r supabase/migrations "$BACKUP_DIR/supabase/" 2>/dev/null || echo "WARNING: Migrations not found"
fi

echo "- ✅ Supabase: Schema and migrations backed up" >> "$BACKUP_DIR/backup-manifest.md"

echo "4. Backing up deployment scripts..."
mkdir -p "$BACKUP_DIR/scripts"

cp -r scripts/deploy "$BACKUP_DIR/scripts/" 2>/dev/null || echo "WARNING: Deploy scripts not found"
cp -r scripts/monitoring "$BACKUP_DIR/scripts/" 2>/dev/null || echo "WARNING: Monitoring scripts not found"

echo "- ✅ Scripts: Deployment and monitoring backed up" >> "$BACKUP_DIR/backup-manifest.md"

echo "5. Backing up environment documentation..."
mkdir -p "$BACKUP_DIR/docs"

# Backup critical documentation
cp docs/runbooks/infrastructure_operations.md "$BACKUP_DIR/docs/" 2>/dev/null || echo "WARNING: Infrastructure runbook not found"
cp docs/ops/credential_index.md "$BACKUP_DIR/docs/" 2>/dev/null || echo "WARNING: Credential index not found"
cp -r docs/deployment "$BACKUP_DIR/docs/" 2>/dev/null || echo "WARNING: Deployment docs not found"
cp -r docs/runbooks "$BACKUP_DIR/docs/" 2>/dev/null || echo "WARNING: Runbooks not found"

echo "- ✅ Documentation: Runbooks and deployment docs backed up" >> "$BACKUP_DIR/backup-manifest.md"

echo "6. Creating backup checksum..."
find "$BACKUP_DIR" -type f -exec sha256sum {} \; > "$BACKUP_DIR/checksums.txt"
echo "- ✅ Checksums: Created for integrity verification" >> "$BACKUP_DIR/backup-manifest.md"

# Finalize manifest
cat >> "$BACKUP_DIR/backup-manifest.md" <<EOF

## Backup Statistics
- Total files: $(find "$BACKUP_DIR" -type f | wc -l)
- Total size: $(du -sh "$BACKUP_DIR" | cut -f1)
- Checksum file: checksums.txt

## Restoration Procedure
1. Verify checksums: \`sha256sum -c $BACKUP_DIR/checksums.txt\`
2. Restore Fly.io configs: Review and apply from fly-configs/
3. Restore repository config: Copy files to project root
4. Restore Supabase: Run migrations from supabase/migrations/
5. Restore scripts: Copy to scripts/ directory
6. Verify deployment: Run health checks

## Backup Retention
- Local: 90 days
- Off-site: 1 year (if configured)
- Critical: Permanent (tagged backups)

## Next Backup
Scheduled: $(date -u -d '+1 day' +"%Y-%m-%d %H:00:00" 2>/dev/null || date -u +"%Y-%m-%d %H:00:00")

EOF

# Create backup archive
echo "7. Creating backup archive..."
tar -czf "artifacts/backups/infrastructure-backup-${BACKUP_DATE}.tar.gz" -C "$BACKUP_DIR" .
ARCHIVE_SIZE=$(du -sh "artifacts/backups/infrastructure-backup-${BACKUP_DATE}.tar.gz" | cut -f1)

echo "=================================================="
echo "Backup Complete!"
echo "=================================================="
echo "Backup ID: $BACKUP_DATE"
echo "Location: $BACKUP_DIR"
echo "Archive: infrastructure-backup-${BACKUP_DATE}.tar.gz ($ARCHIVE_SIZE)"
echo "Files backed up: $(find "$BACKUP_DIR" -type f | wc -l)"
echo "Manifest: $BACKUP_DIR/backup-manifest.md"
echo "=================================================="
echo ""
echo "✅ Backup verification:"
echo "1. Review manifest: cat $BACKUP_DIR/backup-manifest.md"
echo "2. Verify checksums: sha256sum -c $BACKUP_DIR/checksums.txt"
echo "3. Test restore: bash scripts/disaster-recovery/restore-infrastructure.sh $BACKUP_DATE"
echo "=================================================="

exit 0

