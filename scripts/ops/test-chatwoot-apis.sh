#!/bin/bash
#
# Chatwoot API Conversation Flow Testing Script
# Purpose: Test all Chatwoot API endpoints for Agent SDK integration
# Usage: ./scripts/ops/test-chatwoot-apis.sh
#
# Requirements:
# - Chatwoot API token in vault/occ/chatwoot/api_token_staging.env
# - curl and jq installed
# - Chatwoot app running on Fly.io

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts/chatwoot/api-tests-$(date -u +%Y%m%dT%H%M%SZ)"
VAULT_FILE="$PROJECT_ROOT/vault/occ/chatwoot/api_token_staging.env"

# Create artifacts directory
mkdir -p "$ARTIFACTS_DIR"

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Chatwoot API Testing Suite${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Load credentials
if [ ! -f "$VAULT_FILE" ]; then
    echo -e "${RED}Error: Vault file not found: $VAULT_FILE${NC}"
    exit 1
fi

source "$VAULT_FILE"

if [ -z "${CHATWOOT_API_TOKEN_STAGING:-}" ]; then
    echo -e "${RED}Error: CHATWOOT_API_TOKEN_STAGING not set${NC}"
    exit 1
fi

CHATWOOT_BASE_URL="https://hotdash-chatwoot.fly.dev"
API_TOKEN="$CHATWOOT_API_TOKEN_STAGING"
ACCOUNT_ID="${CHATWOOT_ACCOUNT_ID_STAGING:-1}"

echo -e "${GREEN}✓${NC} Configuration loaded"
echo -e "  Base URL: $CHATWOOT_BASE_URL"
echo -e "  Account ID: $ACCOUNT_ID"
echo -e "  Artifacts: $ARTIFACTS_DIR"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run API test
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="${4:-}"
    local expected_status="${5:-200}"
    
    echo -e "${BLUE}Testing:${NC} $test_name"
    
    local output_file="$ARTIFACTS_DIR/$(echo "$test_name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]').json"
    local headers_file="$ARTIFACTS_DIR/$(echo "$test_name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]').headers"
    
    local curl_cmd="curl -s -w '\n%{http_code}' -o '$output_file' -D '$headers_file'"
    curl_cmd="$curl_cmd -X $method"
    curl_cmd="$curl_cmd -H 'api_access_token: $API_TOKEN'"
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$CHATWOOT_BASE_URL/api/v1/accounts/$ACCOUNT_ID$endpoint'"
    
    # Execute curl
    local http_code
    http_code=$(eval "$curl_cmd" | tail -n1)
    
    # Check if successful
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASS${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Pretty print JSON if available
        if command -v jq &> /dev/null && [ -f "$output_file" ]; then
            jq -r '.' "$output_file" > "${output_file}.formatted" 2>/dev/null || true
        fi
    else
        echo -e "  ${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        
        # Show error response
        if [ -f "$output_file" ]; then
            echo -e "  ${YELLOW}Response:${NC}"
            cat "$output_file" | head -10
        fi
    fi
    
    echo ""
}

# Run API tests
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}1. Health & Status Tests${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

test_api "Health Check" "GET" "../../api" "" "200"

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}2. Conversation Management Tests${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

test_api "List Open Conversations" "GET" "/conversations?status=open&page=1" "" "200"
test_api "List All Conversations" "GET" "/conversations?page=1" "" "200"

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}3. Message API Tests${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Note: These tests require an actual conversation ID
# For now, we'll test the endpoint structure
echo -e "${YELLOW}⚠ Message tests require existing conversation ID${NC}"
echo -e "${YELLOW}  Run: test_api \"List Messages\" \"GET\" \"/conversations/{id}/messages\"${NC}"
echo ""

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}4. Private Note API Test (Structure)${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

echo -e "${YELLOW}⚠ Private note creation requires conversation ID${NC}"
echo -e "${YELLOW}  Endpoint: POST /conversations/{id}/messages${NC}"
echo -e "${YELLOW}  Payload: {\"content\": \"test\", \"message_type\": 0, \"private\": true}${NC}"
echo ""

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}5. Public Reply API Test (Structure)${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

echo -e "${YELLOW}⚠ Public reply requires conversation ID${NC}"
echo -e "${YELLOW}  Endpoint: POST /conversations/{id}/messages${NC}"
echo -e "${YELLOW}  Payload: {\"content\": \"test\", \"message_type\": 1}${NC}"
echo ""

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}6. Label/Tag API Tests${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

test_api "List Labels" "GET" "/labels" "" "200"

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}7. Agent Assignment API Test${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

echo -e "${YELLOW}⚠ Agent assignment requires conversation ID and agent ID${NC}"
echo -e "${YELLOW}  Endpoint: POST /conversations/{id}/assignments${NC}"
echo -e "${YELLOW}  Payload: {\"assignee_id\": <agent_id>}${NC}"
echo ""

# Summary
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo ""
echo -e "Artifacts saved to: $ARTIFACTS_DIR"
echo ""

# Generate test report
cat > "$ARTIFACTS_DIR/test-report.md" << EOF
# Chatwoot API Test Report

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Environment:** Staging (Fly.io)
**Base URL:** $CHATWOOT_BASE_URL

## Test Results

- **Tests Passed:** $TESTS_PASSED
- **Tests Failed:** $TESTS_FAILED
- **Total Tests:** $((TESTS_PASSED + TESTS_FAILED))

## Tests Executed

1. Health Check
2. List Open Conversations
3. List All Conversations
4. List Labels

## Tests Requiring Conversation ID

The following tests require an active conversation:
- List Messages (GET /conversations/{id}/messages)
- Create Private Note (POST /conversations/{id}/messages with private: true)
- Send Public Reply (POST /conversations/{id}/messages)
- Assign Agent (POST /conversations/{id}/assignments)
- Add Labels (POST /conversations/{id}/labels)

## Next Steps

1. Create test conversation in Chatwoot UI
2. Run conversation-specific tests with actual ID
3. Verify private note vs public message differentiation
4. Test agent assignment workflow
5. Document all API response formats

## Artifacts

All test outputs saved to: \`$ARTIFACTS_DIR\`

- Individual JSON responses
- HTTP headers
- Formatted outputs (if jq available)

EOF

echo -e "${GREEN}✓${NC} Test report generated: $ARTIFACTS_DIR/test-report.md"
echo ""

# Exit with failure if any tests failed
if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
fi

exit 0

