#!/bin/bash
# Agent SDK Data Retention Cleanup
# Purpose: Automated 30-day retention enforcement with backup
# Owner: data
# Date: 2025-10-11
# Ref: docs/directions/data.md Task B (Data Retention Automation)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
BACKUP_DIR="${PROJECT_ROOT}/artifacts/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DRY_RUN="${DRY_RUN:-false}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Agent SDK Data Retention Cleanup (30-day)               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Database: $DB_URL"
echo "Backup Dir: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo "Dry Run: $DRY_RUN"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check for data to delete
echo -e "${YELLOW}Checking for expired data...${NC}"
echo ""

COUNTS=$(psql "$DB_URL" -t << 'EOF'
SELECT 
  'agent_feedback' as table_name,
  COUNT(*) as expired_rows,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_expired
FROM agent_feedback
WHERE created_at < NOW() - INTERVAL '30 days'
  AND (safe_to_send IS NULL OR safe_to_send = true)
UNION ALL
SELECT 
  'agent_approvals',
  COUNT(*),
  MIN(created_at),
  MAX(created_at)
FROM agent_approvals
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status != 'pending'
UNION ALL
SELECT 
  'agent_queries',
  COUNT(*),
  MIN(created_at),
  MAX(created_at)
FROM agent_queries
WHERE created_at < NOW() - INTERVAL '60 days'
  AND (latency_ms IS NULL OR latency_ms < 200);
EOF
)

echo "$COUNTS" | column -t -s '|'
echo ""

# Extract counts for decision making
FEEDBACK_COUNT=$(echo "$COUNTS" | grep agent_feedback | awk '{print $2}' | tr -d ' ' | grep -E '^[0-9]+$' || echo "0")
APPROVALS_COUNT=$(echo "$COUNTS" | grep agent_approvals | awk '{print $2}' | tr -d ' ' | grep -E '^[0-9]+$' || echo "0")
QUERIES_COUNT=$(echo "$COUNTS" | grep agent_queries | awk '{print $2}' | tr -d ' ' | grep -E '^[0-9]+$' || echo "0")

# Default to 0 if empty
FEEDBACK_COUNT=${FEEDBACK_COUNT:-0}
APPROVALS_COUNT=${APPROVALS_COUNT:-0}
QUERIES_COUNT=${QUERIES_COUNT:-0}

TOTAL_COUNT=$((FEEDBACK_COUNT + APPROVALS_COUNT + QUERIES_COUNT))

if [ "$TOTAL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ No data to clean up.${NC}"
    exit 0
fi

echo -e "${YELLOW}Total rows to delete: $TOTAL_COUNT${NC}"
echo "  • agent_feedback: $FEEDBACK_COUNT (30-day retention)"
echo "  • agent_approvals: $APPROVALS_COUNT (90-day retention)"
echo "  • agent_queries: $QUERIES_COUNT (60-day retention)"
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo -e "${BLUE}DRY RUN MODE - No data will be deleted${NC}"
    exit 0
fi

# Confirmation prompt
echo -e "${RED}WARNING: This will permanently delete $TOTAL_COUNT rows${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Step 1: Backup expired data before deletion
echo ""
echo -e "${BLUE}Step 1: Backing up expired data...${NC}"

BACKUP_FILE="$BACKUP_DIR/retention_cleanup_$TIMESTAMP.sql"

psql "$DB_URL" << EOF > "$BACKUP_FILE"
-- Retention Cleanup Backup: $TIMESTAMP
-- Total rows: $TOTAL_COUNT

\echo '-- agent_feedback (30-day expired)'
COPY (
  SELECT * FROM agent_feedback
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND (safe_to_send IS NULL OR safe_to_send = true)
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

\echo ''
\echo '-- agent_approvals (90-day expired)'
COPY (
  SELECT * FROM agent_approvals
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status != 'pending'
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

\echo ''
\echo '-- agent_queries (60-day expired)'
COPY (
  SELECT * FROM agent_queries
  WHERE created_at < NOW() - INTERVAL '60 days'
    AND (latency_ms IS NULL OR latency_ms < 200)
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER;
EOF

if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Step 2: Delete expired data
echo ""
echo -e "${BLUE}Step 2: Deleting expired data...${NC}"

DELETION_RESULT=$(psql "$DB_URL" -t << 'EOF'
BEGIN;

-- Delete expired agent_feedback (30-day retention)
WITH deleted_feedback AS (
  DELETE FROM agent_feedback
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND (safe_to_send IS NULL OR safe_to_send = true)
  RETURNING *
)
SELECT 'agent_feedback', COUNT(*) FROM deleted_feedback;

-- Delete expired agent_approvals (90-day retention)
WITH deleted_approvals AS (
  DELETE FROM agent_approvals
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status != 'pending'
  RETURNING *
)
SELECT 'agent_approvals', COUNT(*) FROM deleted_approvals;

-- Delete expired agent_queries (60-day retention)
WITH deleted_queries AS (
  DELETE FROM agent_queries
  WHERE created_at < NOW() - INTERVAL '60 days'
    AND (latency_ms IS NULL OR latency_ms < 200)
  RETURNING *
)
SELECT 'agent_queries', COUNT(*) FROM deleted_queries;

COMMIT;
EOF
)

echo "$DELETION_RESULT" | column -t -s '|'

# Step 3: Log cleanup event
echo ""
echo -e "${BLUE}Step 3: Logging cleanup event...${NC}"

psql "$DB_URL" -c "
INSERT INTO observability_logs (level, message, metadata)
VALUES (
  'INFO',
  'Agent SDK retention cleanup completed',
  jsonb_build_object(
    'timestamp', '$TIMESTAMP',
    'total_deleted', $TOTAL_COUNT,
    'agent_feedback_deleted', $FEEDBACK_COUNT,
    'agent_approvals_deleted', $APPROVALS_COUNT,
    'agent_queries_deleted', $QUERIES_COUNT,
    'backup_file', '$BACKUP_FILE'
  )
);
" > /dev/null

echo -e "${GREEN}✅ Cleanup logged to observability_logs${NC}"

# Step 4: Verify deletion
echo ""
echo -e "${BLUE}Step 4: Verifying cleanup...${NC}"

VERIFICATION=$(psql "$DB_URL" -t << 'EOF'
SELECT 
  'agent_feedback' as table_name,
  COUNT(*) as remaining_expired
FROM agent_feedback
WHERE created_at < NOW() - INTERVAL '30 days'
  AND (safe_to_send IS NULL OR safe_to_send = true)
UNION ALL
SELECT 
  'agent_approvals',
  COUNT(*)
FROM agent_approvals
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status != 'pending'
UNION ALL
SELECT 
  'agent_queries',
  COUNT(*)
FROM agent_queries
WHERE created_at < NOW() - INTERVAL '60 days'
  AND (latency_ms IS NULL OR latency_ms < 200);
EOF
)

echo "$VERIFICATION" | column -t -s '|'

REMAINING=$(echo "$VERIFICATION" | awk '{sum += $2} END {print sum}')

if [ "$REMAINING" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Retention cleanup completed successfully!${NC}"
    echo ""
    echo "Summary:"
    echo "  • Deleted: $TOTAL_COUNT rows"
    echo "  • Backup: $BACKUP_FILE"
    echo "  • Remaining expired: 0 rows"
else
    echo ""
    echo -e "${RED}⚠️  Warning: $REMAINING expired rows remain${NC}"
    echo "Check logs for details."
fi

echo ""
echo "Next run: Schedule via cron or run manually as needed"
echo "Dry run: DRY_RUN=true ./scripts/data/retention-cleanup.sh"

