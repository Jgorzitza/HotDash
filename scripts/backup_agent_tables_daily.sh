#!/bin/bash
# =====================================================
# Agent SDK Daily Backup Script
# Purpose: Full backup of all Agent SDK tables
# Schedule: Daily at 2:00 AM UTC
# Retention: 7 days
# =====================================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups/agent_sdk}"
DATE=$(date +%Y%m%d)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/agent-backup-$DATE.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Agent SDK Daily Backup Started ==="
log "Backup directory: $BACKUP_DIR/$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Tables to backup
TABLES=(
  "agent_approvals"
  "AgentApproval"
  "AgentFeedback"
  "AgentQuery"
  "agent_sdk_learning_data"
  "agent_sdk_notifications"
  "agent_training_archive"
  "data_quality_log"
)

# Backup each table
for table in "${TABLES[@]}"; do
  log "Backing up table: $table"
  
  # CSV backup
  psql "$DATABASE_URL" -c "\COPY (SELECT * FROM \"$table\") TO '$BACKUP_DIR/$DATE/${table}_$TIMESTAMP.csv' CSV HEADER;" 2>> "$LOG_FILE"
  
  if [ $? -eq 0 ]; then
    # Get row count
    row_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";")
    log "✓ $table backed up ($row_count rows)"
  else
    log "❌ ERROR: Failed to backup $table"
    exit 1
  fi
  
  # JSON backup (for easier restore)
  psql "$DATABASE_URL" -c "COPY (SELECT jsonb_agg(row_to_json(t.*)) FROM \"$table\" t) TO '$BACKUP_DIR/$DATE/${table}_$TIMESTAMP.json';" 2>> "$LOG_FILE"
done

# Compress backups
log "Compressing backups..."
cd "$BACKUP_DIR"
tar -czf "agent_sdk_backup_$DATE.tar.gz" "$DATE/" 2>> "$LOG_FILE"

BACKUP_SIZE=$(du -h "agent_sdk_backup_$DATE.tar.gz" | cut -f1)
log "✓ Backup compressed: agent_sdk_backup_$DATE.tar.gz ($BACKUP_SIZE)"

# Cleanup old backups (keep 7 days)
log "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete 2>> "$LOG_FILE"
find "$BACKUP_DIR" -type d -mtime +7 -exec rm -rf {} + 2>> "$LOG_FILE" || true

log "✓ Old backups cleaned up (retained 7 days)"

# Generate backup metadata
cat > "$BACKUP_DIR/metadata_$DATE.json" <<EOF
{
  "backup_date": "$DATE",
  "timestamp": "$TIMESTAMP",
  "tables_backed_up": ${#TABLES[@]},
  "backup_file": "agent_sdk_backup_$DATE.tar.gz",
  "backup_size": "$BACKUP_SIZE",
  "retention_days": 7,
  "status": "success"
}
EOF

log "=== Backup Complete ==="
log "Backup file: $BACKUP_DIR/agent_sdk_backup_$DATE.tar.gz"
log "Log file: $LOG_FILE"

# Exit with success
exit 0

