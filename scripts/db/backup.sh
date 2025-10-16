#!/bin/bash
# Database Backup Script
# Owner: data
# Date: 2025-10-15
# Task: Backlog 17 - Backup/restore scripts (local)

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting database backup..."
echo "Timestamp: $TIMESTAMP"
echo "Backup directory: $BACKUP_DIR"

# Full database backup
BACKUP_FILE="$BACKUP_DIR/full_backup_$TIMESTAMP.sql"
echo "Creating full backup: $BACKUP_FILE"
pg_dump "$DB_URL" > "$BACKUP_FILE"
gzip "$BACKUP_FILE"
echo "✅ Full backup created: ${BACKUP_FILE}.gz"

# Schema-only backup
SCHEMA_FILE="$BACKUP_DIR/schema_backup_$TIMESTAMP.sql"
echo "Creating schema backup: $SCHEMA_FILE"
pg_dump "$DB_URL" --schema-only > "$SCHEMA_FILE"
gzip "$SCHEMA_FILE"
echo "✅ Schema backup created: ${SCHEMA_FILE}.gz"

# Data-only backup for critical tables
DATA_FILE="$BACKUP_DIR/data_backup_$TIMESTAMP.sql"
echo "Creating data backup (critical tables): $DATA_FILE"
pg_dump "$DB_URL" \
  --data-only \
  --table=approvals \
  --table=approval_grades \
  --table=audit_logs \
  --table=picker_payouts \
  --table=cx_metrics_daily \
  --table=growth_metrics_daily \
  > "$DATA_FILE"
gzip "$DATA_FILE"
echo "✅ Data backup created: ${DATA_FILE}.gz"

# Cleanup old backups
echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Cleanup complete"

# Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/manifest_$TIMESTAMP.json"
cat > "$MANIFEST_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "files": {
    "full": "${BACKUP_FILE}.gz",
    "schema": "${SCHEMA_FILE}.gz",
    "data": "${DATA_FILE}.gz"
  },
  "database_url": "${DB_URL%%@*}@***",
  "retention_days": $RETENTION_DAYS
}
EOF
echo "✅ Manifest created: $MANIFEST_FILE"

# Calculate sizes
FULL_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
SCHEMA_SIZE=$(du -h "${SCHEMA_FILE}.gz" | cut -f1)
DATA_SIZE=$(du -h "${DATA_FILE}.gz" | cut -f1)

echo ""
echo "📊 Backup Summary:"
echo "  Full backup:   $FULL_SIZE"
echo "  Schema backup: $SCHEMA_SIZE"
echo "  Data backup:   $DATA_SIZE"
echo "  Manifest:      $MANIFEST_FILE"
echo ""
echo "✅ Backup complete!"

