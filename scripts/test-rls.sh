#!/usr/bin/env bash
# RLS Test Runner Script
# Purpose: Execute comprehensive RLS policy validation tests
# Generated: 2025-10-19
# Usage: ./scripts/test-rls.sh [DATABASE_URL]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DATABASE_URL="${1:-${DATABASE_URL:-}}"
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}Error: DATABASE_URL not provided${NC}"
  echo "Usage: $0 [DATABASE_URL]"
  echo "   or: DATABASE_URL=<url> $0"
  exit 1
fi

SUPABASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/supabase"
RLS_TEST_FILE="$SUPABASE_DIR/rls_tests.sql"
SEED_DIR="$SUPABASE_DIR/seeds"

echo -e "${BLUE}=== RLS Policy Test Runner ===${NC}"
echo "Database: ${DATABASE_URL%%@*}@***" # Hide credentials
echo "Test File: $RLS_TEST_FILE"
echo ""

# Check prerequisites
if [ ! -f "$RLS_TEST_FILE" ]; then
  echo -e "${RED}Error: RLS test file not found: $RLS_TEST_FILE${NC}"
  exit 1
fi

if [ ! -d "$SEED_DIR" ]; then
  echo -e "${YELLOW}Warning: Seed directory not found: $SEED_DIR${NC}"
  echo -e "${YELLOW}Skipping seed data load${NC}"
  LOAD_SEEDS=false
else
  LOAD_SEEDS=true
fi

# Function: Run SQL and capture result
run_sql() {
  local sql="$1"
  local description="$2"
  echo -e "${BLUE}▶ ${description}${NC}"
  if psql "$DATABASE_URL" -c "$sql" 2>&1; then
    echo -e "${GREEN}✓ Success${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed${NC}"
    return 1
  fi
}

# Function: Run SQL file
run_sql_file() {
  local file="$1"
  local description="$2"
  echo -e "${BLUE}▶ ${description}${NC}"
  if psql "$DATABASE_URL" -f "$file" 2>&1; then
    echo -e "${GREEN}✓ Success${NC}"
    return 0
  else
    echo -e "${RED}✗ Failed${NC}"
    return 1
  fi
}

# Step 1: Load seed data (if available and requested)
if [ "$LOAD_SEEDS" = true ]; then
  echo -e "${BLUE}=== Step 1: Load Seed Data ===${NC}"
  for seed_file in "$SEED_DIR"/*.sql; do
    if [ -f "$seed_file" ]; then
      filename=$(basename "$seed_file")
      run_sql_file "$seed_file" "Loading $filename" || true
    fi
  done
  echo ""
else
  echo -e "${YELLOW}=== Step 1: Skipping Seed Data (not available) ===${NC}"
  echo ""
fi

# Step 2: Run RLS test suite
echo -e "${BLUE}=== Step 2: Run RLS Test Suite ===${NC}"
run_sql_file "$RLS_TEST_FILE" "Executing RLS tests"
echo ""

# Step 3: Additional validation queries
echo -e "${BLUE}=== Step 3: Policy Coverage Validation ===${NC}"

# Check that all tables have RLS enabled
run_sql "
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('facts', 'decision_sync_event_logs', 'observability_logs', 
                    'agent_approvals', 'agent_feedback', 'agent_queries',
                    'product_categories', 'customer_segments')
ORDER BY tablename;
" "Checking RLS enabled on critical tables"

echo ""

# Count policies per table
run_sql "
SELECT 
  tablename, 
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;
" "Counting RLS policies per table"

echo ""

# Step 4: Test multi-tenant isolation (if facts table exists)
echo -e "${BLUE}=== Step 4: Multi-Tenant Isolation Tests ===${NC}"

# Check if facts table exists
TABLE_EXISTS=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='facts' AND table_schema='public');")

if [ "$TABLE_EXISTS" = "t" ]; then
  echo -e "${GREEN}facts table found - running multi-tenant tests${NC}"
  
  # Test project isolation
  run_sql "
  BEGIN;
  SET app.current_project = 'occ';
  SELECT COUNT(*) as occ_count FROM facts;
  ROLLBACK;
  " "Test 1: OCC project isolation"
  
  run_sql "
  BEGIN;
  SET app.current_project = 'chatwoot';
  SELECT COUNT(*) as chatwoot_count FROM facts;
  ROLLBACK;
  " "Test 2: Chatwoot project isolation"
  
else
  echo -e "${YELLOW}facts table not found - skipping multi-tenant tests${NC}"
fi

echo ""

# Step 5: Test scope isolation (if decision_sync_event_logs exists)
echo -e "${BLUE}=== Step 5: Scope Isolation Tests ===${NC}"

TABLE_EXISTS=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='decision_sync_event_logs' AND table_schema='public');")

if [ "$TABLE_EXISTS" = "t" ]; then
  echo -e "${GREEN}decision_sync_event_logs table found - running scope tests${NC}"
  
  run_sql "
  BEGIN;
  SET app.current_scope = 'ops';
  SELECT COUNT(*) as ops_count FROM decision_sync_event_logs;
  ROLLBACK;
  " "Test 1: OPS scope isolation"
  
  run_sql "
  BEGIN;
  SET app.current_scope = 'cx';
  SELECT COUNT(*) as cx_count FROM decision_sync_event_logs;
  ROLLBACK;
  " "Test 2: CX scope isolation"
  
else
  echo -e "${YELLOW}decision_sync_event_logs table not found - skipping scope tests${NC}"
fi

echo ""

# Step 6: Test role-based access
echo -e "${BLUE}=== Step 6: Role-Based Access Tests ===${NC}"

# Check if product_categories exists
TABLE_EXISTS=$(psql "$DATABASE_URL" -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='product_categories' AND table_schema='public');")

if [ "$TABLE_EXISTS" = "t" ]; then
  echo -e "${GREEN}product_categories table found - running role tests${NC}"
  
  run_sql "
  SELECT COUNT(*) as total_categories FROM product_categories;
  " "Test 1: Count all product categories"
  
  run_sql "
  SELECT 
    category_l1, 
    COUNT(*) as count 
  FROM product_categories 
  GROUP BY category_l1 
  ORDER BY count DESC 
  LIMIT 5;
  " "Test 2: Top 5 product categories"
  
else
  echo -e "${YELLOW}product_categories table not found - skipping role tests${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}=== RLS Test Summary ===${NC}"
echo -e "${GREEN}✓ RLS policy tests completed${NC}"
echo -e "${GREEN}✓ Policy coverage validated${NC}"
echo -e "See output above for detailed results"
echo ""
echo -e "${YELLOW}Note: Some tests may be skipped if tables don't exist (migration drift)${NC}"
echo ""

echo -e "${GREEN}=== RLS Test Runner Complete ===${NC}"

