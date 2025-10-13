#!/bin/bash
# =====================================================
# Agent SDK Restore Script
# Purpose: Restore Agent SDK tables from backup
# Usage: ./restore_agent_tables.sh <backup_file.tar.gz>
# =====================================================

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_tar_gz_file>"
  echo "Example: $0 /var/backups/agent_sdk/agent_sdk_backup_20251012.tar.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "=== Agent SDK Restore Procedure ==="
echo "Backup file: $BACKUP_FILE"
echo ""
echo "⚠️  WARNING: This will REPLACE current data in Agent SDK tables!"
echo "⚠️  Make sure you have a recent backup before proceeding."
echo ""
read -p "Type 'RESTORE' to confirm: " confirm

if [ "$confirm" != "RESTORE" ]; then
  echo "Restore cancelled"
  exit 0
fi

LOG_FILE="/tmp/agent-restore-$(date +%Y%m%d_%H%M%S).log"
TEMP_DIR="/tmp/agent_restore_$$"

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Starting Restore ==="

# Extract backup
log "Extracting backup..."
mkdir -p "$TEMP_DIR"
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR/"

# Find CSV files
CSV_DIR=$(find "$TEMP_DIR" -type d -name "202*" | head -1)

if [ -z "$CSV_DIR" ]; then
  log "❌ ERROR: No backup directory found in archive"
  rm -rf "$TEMP_DIR"
  exit 1
fi

log "Backup extracted to: $CSV_DIR"

# Restore each table
for csv_file in "$CSV_DIR"/agent_*.csv; do
  if [ ! -f "$csv_file" ]; then
    continue
  fi
  
  table=$(basename "$csv_file" | sed 's/_[0-9_]*\.csv$//')
  log "Restoring table: $table"
  
  # Count rows before
  before_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";")
  log "  Current rows: $before_count"
  
  # Truncate table (CAREFUL!)
  log "  Truncating table..."
  psql "$DATABASE_URL" -c "TRUNCATE TABLE \"$table\" CASCADE;" 2>> "$LOG_FILE"
  
  # Import CSV
  log "  Importing data..."
  psql "$DATABASE_URL" -c "\COPY \"$table\" FROM '$csv_file' CSV HEADER;" 2>> "$LOG_FILE"
  
  if [ $? -eq 0 ]; then
    # Count rows after
    after_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"$table\";")
    log "  ✓ $table restored ($after_count rows)"
  else
    log "  ❌ ERROR: Failed to restore $table"
    rm -rf "$TEMP_DIR"
    exit 1
  fi
done

# Cleanup temp files
log "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

# Refresh materialized views
log "Refreshing materialized views..."
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW mv_agent_queue_realtime;" 2>> "$LOG_FILE"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW mv_agent_accuracy_rolling;" 2>> "$LOG_FILE"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW mv_query_performance_live;" 2>> "$LOG_FILE"

log "✓ Materialized views refreshed"

# Run quality checks
log "Running data quality checks..."
psql "$DATABASE_URL" -c "SELECT * FROM run_all_quality_checks();" >> "$LOG_FILE" 2>&1

log "=== Restore Complete ==="
log "Log file: $LOG_FILE"
log ""
log "Next steps:"
log "1. Review log file for any errors"
log "2. Verify data quality checks passed"
log "3. Test application functionality"
log "4. Monitor for 24 hours"

exit 0

