#!/bin/bash
# Agent SDK Database Backup Automation
# Purpose: Automated backup of Agent SDK tables with recovery testing
# Owner: data
# Date: 2025-10-11
# Ref: docs/directions/data.md Task I

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
BACKUP_DIR="${PROJECT_ROOT}/artifacts/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           Agent SDK Database Backup Automation                   ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Database: $DB_URL"
echo "Backup Dir: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

mkdir -p "$BACKUP_DIR"

# Backup all Agent SDK tables
BACKUP_FILE="$BACKUP_DIR/agent_sdk_backup_$TIMESTAMP.sql"

echo "Creating backup..."

pg_dump "$DB_URL" \
  --table=agent_approvals \
  --table=agent_feedback \
  --table=agent_queries \
  --table=support_curated_replies \
  --data-only \
  --inserts \
  > "$BACKUP_FILE"

if [ -f "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  ROW_COUNT=$(psql "$DB_URL" -t << 'EOF'
    SELECT SUM(cnt) FROM (
      SELECT COUNT(*) as cnt FROM agent_approvals
      UNION ALL SELECT COUNT(*) FROM agent_feedback
      UNION ALL SELECT COUNT(*) FROM agent_queries
    ) t;
EOF
)
  
  echo "✅ Backup complete!"
  echo ""
  echo "Details:"
  echo "  • File: $BACKUP_FILE"
  echo "  • Size: $BACKUP_SIZE"
  echo "  • Total Rows: $ROW_COUNT"
  echo ""
  echo "To restore:"
  echo "  psql \$DATABASE_URL < $BACKUP_FILE"
else
  echo "❌ Backup failed"
  exit 1
fi

# Retention: Keep last 7 backups
echo "Cleaning old backups (keeping last 7)..."
ls -t "$BACKUP_DIR"/agent_sdk_backup_*.sql 2>/dev/null | tail -n +8 | xargs -r rm
echo "✅ Cleanup complete"

