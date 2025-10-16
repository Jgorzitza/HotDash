#!/bin/bash
# Database Restore Script
# Owner: data
# Date: 2025-10-15
# Task: Backlog 17 - Backup/restore scripts (local)

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups/db}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

# Check arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file> [--schema-only|--data-only]"
  echo ""
  echo "Examples:"
  echo "  $0 backups/db/full_backup_20251015_120000.sql.gz"
  echo "  $0 backups/db/schema_backup_20251015_120000.sql.gz --schema-only"
  echo "  $0 backups/db/data_backup_20251015_120000.sql.gz --data-only"
  echo ""
  echo "Available backups:"
  ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  No backups found in $BACKUP_DIR"
  exit 1
fi

BACKUP_FILE="$1"
RESTORE_MODE="${2:---full}"

# Validate backup file
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will restore the database from backup!"
echo "Backup file: $BACKUP_FILE"
echo "Restore mode: $RESTORE_MODE"
echo "Database: ${DB_URL%%@*}@***"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Restore cancelled"
  exit 0
fi

echo ""
echo "🔄 Starting database restore..."

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Decompressing backup file..."
  TEMP_FILE=$(mktemp)
  gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
  RESTORE_FILE="$TEMP_FILE"
else
  RESTORE_FILE="$BACKUP_FILE"
fi

# Restore based on mode
case "$RESTORE_MODE" in
  --schema-only)
    echo "Restoring schema only..."
    psql "$DB_URL" < "$RESTORE_FILE"
    ;;
  --data-only)
    echo "Restoring data only..."
    psql "$DB_URL" < "$RESTORE_FILE"
    ;;
  --full|*)
    echo "Restoring full database..."
    # Drop existing database objects (careful!)
    echo "⚠️  Dropping existing database objects..."
    psql "$DB_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    psql "$DB_URL" < "$RESTORE_FILE"
    ;;
esac

# Cleanup temp file
if [ -n "$TEMP_FILE" ]; then
  rm -f "$TEMP_FILE"
fi

echo ""
echo "✅ Restore complete!"
echo ""
echo "🔍 Verifying restore..."
psql "$DB_URL" -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
echo ""
echo "✅ Database restored successfully!"

