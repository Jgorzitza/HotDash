#!/bin/bash
# Agent SDK Seed Data Helper
# Purpose: Easy insertion of test data for Agent SDK tables
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

echo -e "${GREEN}Agent SDK Seed Data Helper${NC}"
echo "==============================="
echo ""
echo "Database: $DB_URL"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql not found. Please install PostgreSQL client.${NC}"
    exit 1
fi

# Check if seed file exists
SEED_FILE="$PROJECT_ROOT/supabase/sql/seed_agent_sdk_data.sql"
if [ ! -f "$SEED_FILE" ]; then
    echo -e "${RED}Error: Seed file not found at $SEED_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}This will insert test data into:${NC}"
echo "  - agent_approvals (12 rows)"
echo "  - agent_feedback (12 rows)"
echo "  - agent_queries (13 rows)"
echo ""
echo -e "${YELLOW}Existing test data will be removed first.${NC}"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Inserting seed data..."

# Run the seed script
psql "$DB_URL" -f "$SEED_FILE" 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Seed data inserted successfully!${NC}"
    echo ""
    echo "Seed data includes:"
    echo "  • Pending, approved, rejected, and expired approvals"
    echo "  • Safe, unsafe, and needs-improvement feedback"
    echo "  • Approved, pending, and edited queries with latency metrics"
    echo ""
    echo "To clean up test data later, run:"
    echo "  psql \$DATABASE_URL -f supabase/sql/cleanup_agent_sdk_data.sql"
else
    echo -e "${RED}❌ Error inserting seed data${NC}"
    exit 1
fi

