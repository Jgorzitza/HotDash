#!/bin/bash
# Database Restore Script for Agent Tables
# Purpose: Restore Agent SDK tables from backup
# Owner: data agent
# Created: 2025-10-14

set -e

# Check for backup file argument
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh ~/HotDash/hot-dash/artifacts/data/backups/agent_tables_*.sql.gz 2>/dev/null | tail -5
  exit 1
fi

BACKUP_FILE="$1"

# Verify backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# Load Supabase credentials
if [ -f ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env ]; then
  source ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env
else
  echo "Error: Supabase credentials not found"
  exit 1
fi

echo "⚠️  WARNING: This will restore agent tables from backup"
echo "Backup file: ${BACKUP_FILE}"
echo "Database: ${DATABASE_URL%%@*}@[REDACTED]"
echo ""
echo "This operation will:"
echo "1. Decompress backup file"
echo "2. Restore table data (may overwrite existing data)"
echo ""

# Decompress backup to temp file
TEMP_SQL="/tmp/agent_restore_$(date +%s).sql"
gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"

echo "✅ Backup decompressed to ${TEMP_SQL}"
echo "🔄 Restoring tables..."

# Restore from backup
psql "${DATABASE_URL}" -f "${TEMP_SQL}" --quiet

echo "✅ Restore complete"

# Cleanup temp file
rm "${TEMP_SQL}"

# Verify restored data
echo "🔍 Verifying restored data..."
psql "${DATABASE_URL}" -c "SELECT 'AgentFeedback' as table_name, COUNT(*) as row_count FROM \"AgentFeedback\"
UNION ALL SELECT 'AgentQuery', COUNT(*) FROM \"AgentQuery\"
UNION ALL SELECT 'agent_approvals', COUNT(*) FROM agent_approvals;" --quiet

echo "✅ Restore verification complete"
echo "Timestamp: $(date -Iseconds)"

exit 0
