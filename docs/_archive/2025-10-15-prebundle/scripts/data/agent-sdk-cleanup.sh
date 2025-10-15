#!/bin/bash
# Agent SDK Data Cleanup Helper
# Purpose: Easy removal of test data from Agent SDK tables
# Owner: data
# Date: 2025-10-11

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default to local Supabase
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

echo -e "${GREEN}Agent SDK Data Cleanup Helper${NC}"
echo "================================"
echo ""
echo "Database: $DB_URL"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Check current test data count
echo "Checking for test/demo data..."
echo ""

COUNTS=$(psql "$DB_URL" -t -c "
SELECT 
  COUNT(*) 
FROM agent_approvals 
WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT COUNT(*) FROM agent_feedback WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%'
UNION ALL
SELECT COUNT(*) FROM agent_queries WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';
")

APPROVALS=$(echo "$COUNTS" | sed -n '1p' | tr -d ' ')
FEEDBACK=$(echo "$COUNTS" | sed -n '2p' | tr -d ' ')
QUERIES=$(echo "$COUNTS" | sed -n '3p' | tr -d ' ')

echo "Test data found:"
echo "  • agent_approvals: $APPROVALS rows"
echo "  • agent_feedback: $FEEDBACK rows"
echo "  • agent_queries: $QUERIES rows"
echo ""

TOTAL=$((APPROVALS + FEEDBACK + QUERIES))

if [ "$TOTAL" -eq 0 ]; then
    echo -e "${GREEN}No test data to clean up.${NC}"
    exit 0
fi

echo -e "${YELLOW}This will DELETE all test/demo data (conversation_id LIKE 'test-%' OR 'demo-%')${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Deleting test data..."

# Delete test data
psql "$DB_URL" << 'EOF'
BEGIN;

DELETE FROM agent_queries WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';
DELETE FROM agent_feedback WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';
DELETE FROM agent_approvals WHERE conversation_id LIKE 'test-%' OR conversation_id LIKE 'demo-%';

COMMIT;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Test data cleaned up successfully!${NC}"
    echo ""
    echo "To re-insert seed data, run:"
    echo "  ./scripts/data/agent-sdk-seed.sh"
else
    echo -e "${RED}❌ Error cleaning up test data${NC}"
    exit 1
fi

