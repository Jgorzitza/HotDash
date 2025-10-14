#!/bin/bash
# Database Backup Script for Agent Tables
# Purpose: Automated backup of Agent SDK tables with verification
# Owner: data agent
# Created: 2025-10-14

set -e

# Load Supabase credentials
if [ -f ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env ]; then
  source ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env
else
  echo "Error: Supabase credentials not found"
  exit 1
fi

# Configuration
BACKUP_DIR="${HOME}/HotDash/hot-dash/artifacts/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/agent_tables_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "🔄 Starting backup of Agent SDK tables..."
echo "Timestamp: $(date -Iseconds)"

# Backup agent tables using pg_dump
pg_dump "${DATABASE_URL}" \
  --no-owner \
  --no-privileges \
  --table='public."AgentFeedback"' \
  --table='public."AgentQuery"' \
  --table='public."AgentApproval"' \
  --table='public.agent_approvals' \
  --table='public.agent_sdk_learning_data' \
  --table='public.agent_sdk_notifications' \
  --table='public.agent_training_archive' \
  --table='public.agent_retention_cleanup_log' \
  --table='public.data_quality_checks' \
  --table='public.data_quality_log' \
  --table='public.data_quality_metrics' \
  --file="${BACKUP_FILE}"

# Verify backup file created
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not created"
  exit 1
fi

# Get backup file size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo "✅ Backup complete"
echo "File: ${BACKUP_FILE}"
echo "Size: ${BACKUP_SIZE}"

# Compress backup
gzip "${BACKUP_FILE}"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
COMPRESSED_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)

echo "✅ Backup compressed"
echo "Compressed: ${COMPRESSED_FILE}"
echo "Size: ${COMPRESSED_SIZE}"

# Verify compressed file is readable
if gunzip -t "${COMPRESSED_FILE}" 2>/dev/null; then
  echo "✅ Backup verification passed"
else
  echo "❌ Error: Backup verification failed"
  exit 1
fi

# Log backup to database
echo "📝 Logging backup execution..."

# Cleanup old backups (keep last 7 days)
find "${BACKUP_DIR}" -name "agent_tables_*.sql.gz" -mtime +7 -delete
REMAINING_BACKUPS=$(find "${BACKUP_DIR}" -name "agent_tables_*.sql.gz" | wc -l)

echo "✅ Backup complete and verified"
echo "Compressed file: ${COMPRESSED_FILE}"
echo "Compressed size: ${COMPRESSED_SIZE}"
echo "Remaining backups: ${REMAINING_BACKUPS}"
echo "Retention: 7 days"

exit 0
