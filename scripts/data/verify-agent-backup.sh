#!/bin/bash
# Backup Verification Script for Agent Tables
# Purpose: Verify backup integrity without restoring
# Owner: data agent
# Created: 2025-10-14

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "🔍 Verifying backup: ${BACKUP_FILE}"

# Check 1: File is readable
if [ ! -r "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not readable"
  exit 1
fi
echo "✅ File is readable"

# Check 2: Gzip integrity
if gunzip -t "${BACKUP_FILE}" 2>/dev/null; then
  echo "✅ Gzip integrity valid"
else
  echo "❌ Error: Corrupted gzip file"
  exit 1
fi

# Check 3: SQL content verification
TEMP_SQL="/tmp/verify_$(date +%s).sql"
gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"

# Check for expected tables
EXPECTED_TABLES=("AgentFeedback" "AgentQuery" "agent_approvals")
for table in "${EXPECTED_TABLES[@]}"; do
  if grep -q "${table}" "${TEMP_SQL}"; then
    echo "✅ Table found: ${table}"
  else
    echo "⚠️  Warning: Table not found in backup: ${table}"
  fi
done

# Get backup stats
FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
SQL_SIZE=$(du -h "${TEMP_SQL}" | cut -f1)
SQL_LINES=$(wc -l < "${TEMP_SQL}")

echo ""
echo "📊 Backup Statistics:"
echo "  Compressed: ${FILE_SIZE}"
echo "  Uncompressed: ${SQL_SIZE}"
echo "  SQL Lines: ${SQL_LINES}"
echo ""
echo "✅ Backup verification passed"

# Cleanup
rm "${TEMP_SQL}"

exit 0
