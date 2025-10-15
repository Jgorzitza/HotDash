#!/bin/bash
#
# Chatwoot Integration Testing Suite
# Purpose: End-to-end testing of Chatwoot APIs and Agent SDK integration
# Usage: ./scripts/ops/test-chatwoot-integration.sh [--create-test-data]
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts/chatwoot/integration-tests-$(date -u +%Y%m%dT%H%M%SZ)"
VAULT_FILE="$PROJECT_ROOT/vault/occ/chatwoot/api_token_staging.env"

# Create artifacts
mkdir -p "$ARTIFACTS_DIR"/{payloads,responses,screenshots}

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Chatwoot Integration Testing Suite${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

# Load credentials
if [ ! -f "$VAULT_FILE" ]; then
    echo -e "${RED}Error: Vault file not found: $VAULT_FILE${NC}"
    exit 1
fi

source "$VAULT_FILE"

CHATWOOT_BASE_URL="https://hotdash-chatwoot.fly.dev"
API_TOKEN="$CHATWOOT_API_TOKEN_STAGING"
ACCOUNT_ID="${CHATWOOT_ACCOUNT_ID_STAGING:-1}"

echo -e "${GREEN}✓${NC} Configuration loaded"
echo -e "  Base URL: $CHATWOOT_BASE_URL"
echo -e "  Account ID: $ACCOUNT_ID"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Helper: API call with timing
api_call() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="${4:-}"
  local expected="${5:-200}"
  
  local output="$ARTIFACTS_DIR/responses/$(echo "$name" | tr ' ' '_').json"
  local start=$(date +%s%3N)
  
  local curl_cmd="curl -s -w '\n%{http_code}' -o '$output'"
  curl_cmd="$curl_cmd -X $method"
  curl_cmd="$curl_cmd -H 'api_access_token: $API_TOKEN'"
  curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
  
  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -d '$data'"
  fi
  
  curl_cmd="$curl_cmd '$CHATWOOT_BASE_URL/api/v1/accounts/$ACCOUNT_ID$endpoint'"
  
  local http_code
  http_code=$(eval "$curl_cmd" | tail -n1)
  local end=$(date +%s%3N)
  local duration=$((end - start))
  
  if [ "$http_code" = "$expected" ]; then
    echo -e "  ${GREEN}✓${NC} $name (${duration}ms)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo -e "  ${RED}✗${NC} $name (HTTP $http_code, expected $expected)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Test Suite
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Test Suite 1: Basic API Connectivity${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

api_call "Health Check" "GET" "../../api" "" "200"
api_call "List Conversations" "GET" "/conversations" "" "200"
api_call "List Labels" "GET" "/labels" "" "200"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Test Suite 2: Agent SDK Requirements${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""

echo -e "${YELLOW}Note: The following tests require an existing conversation ID${NC}"
echo -e "${YELLOW}      Run with --create-test-data to create test conversation${NC}"
echo ""

if [ "${1:-}" = "--create-test-data" ]; then
  echo -e "${BLUE}Creating test conversation...${NC}"
  
  # Note: Conversation creation typically happens via webhook or UI
  # For API testing, we'll check if any conversations exist
  
  CONV_RESPONSE=$(curl -s -H "api_access_token: $API_TOKEN" \
    "$CHATWOOT_BASE_URL/api/v1/accounts/$ACCOUNT_ID/conversations" 2>/dev/null)
  
  CONV_ID=$(echo "$CONV_RESPONSE" | jq -r '.data.payload[0].id // empty' 2>/dev/null)
  
  if [ -n "$CONV_ID" ]; then
    echo -e "${GREEN}✓${NC} Found existing conversation: $CONV_ID"
    
    # Test with real conversation
    api_call "Get Conversation Details" "GET" "/conversations/$CONV_ID" "" "200"
    api_call "List Messages" "GET" "/conversations/$CONV_ID/messages" "" "200"
    
    # Test private note (Agent SDK draft)
    PRIVATE_NOTE_DATA='{
      "content": "🤖 TEST DRAFT (Agent SDK)\n\nThis is a test draft response for integration testing.\n\n📚 Sources: Test Knowledge Base\n🎯 Action: APPROVE",
      "message_type": 0,
      "private": true
    }'
    
    api_call "Create Private Note (Draft)" "POST" "/conversations/$CONV_ID/messages" "$PRIVATE_NOTE_DATA" "200"
    
    # Test labeling (tagging)
    LABEL_DATA='{"labels": ["agent_sdk_test"]}'
    api_call "Add Label" "POST" "/conversations/$CONV_ID/labels" "$LABEL_DATA" "200"
    
  else
    echo -e "${YELLOW}⚠${NC}  No existing conversations found"
    echo -e "${YELLOW}   Create a test conversation in Chatwoot UI first${NC}"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 4))
  fi
else
  echo -e "${YELLOW}⚠${NC}  Skipping conversation-specific tests"
  echo -e "${YELLOW}   Run with --create-test-data to test with existing conversation${NC}"
  TESTS_SKIPPED=$((TESTS_SKIPPED + 4))
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Test Suite 3: Webhook Payloads${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Generate test webhook payloads
cat > "$ARTIFACTS_DIR/payloads/message_created.json" << 'EOF'
{
  "event": "message_created",
  "account": {
    "id": 1,
    "name": "HotDash"
  },
  "conversation": {
    "id": 999,
    "status": "open",
    "contact": {
      "name": "Test Customer",
      "email": "test@example.com"
    }
  },
  "message": {
    "id": 1001,
    "content": "Test message for integration testing",
    "message_type": 0,
    "sender": { "type": "contact" }
  }
}
EOF

echo -e "${GREEN}✓${NC} Generated test webhook payload: message_created.json"

# Test signature generation
if [ -f "$PROJECT_ROOT/scripts/ops/verify-chatwoot-webhook.ts" ]; then
  echo -e "${BLUE}Testing HMAC signature generation...${NC}"
  
  SIGNATURE_OUTPUT=$(npx ts-node --esm \
    "$PROJECT_ROOT/scripts/ops/verify-chatwoot-webhook.ts" \
    --generate "$ARTIFACTS_DIR/payloads/message_created.json" \
    "test-secret-12345" 2>&1 || echo "FAILED")
  
  if echo "$SIGNATURE_OUTPUT" | grep -q "Signature Generated Successfully"; then
    echo -e "${GREEN}✓${NC} HMAC signature generation working"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗${NC} HMAC signature generation failed"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo -e "Tests Skipped: ${YELLOW}$TESTS_SKIPPED${NC}"
echo -e "Total Tests:   $((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))"
echo ""

# Generate test report
cat > "$ARTIFACTS_DIR/integration-test-report.md" << EOF
# Chatwoot Integration Test Report

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Environment:** Staging (Fly.io)
**Base URL:** $CHATWOOT_BASE_URL

## Results

- **Tests Passed:** $TESTS_PASSED
- **Tests Failed:** $TESTS_FAILED
- **Tests Skipped:** $TESTS_SKIPPED
- **Total Tests:** $((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))

## Test Suites Executed

1. Basic API Connectivity (3 tests)
2. Agent SDK Requirements (0-4 tests, depends on test data)
3. Webhook Payloads (1 test)

## Artifacts

- Test Responses: \`$ARTIFACTS_DIR/responses/\`
- Test Payloads: \`$ARTIFACTS_DIR/payloads/\`
- Screenshots: \`$ARTIFACTS_DIR/screenshots/\` (manual)

## Status

$(if [ $TESTS_FAILED -eq 0 ]; then echo "✅ All tests passed"; else echo "❌ Some tests failed - review artifacts"; fi)

## Next Steps

1. Review failed tests (if any)
2. Create test conversation in Chatwoot UI
3. Run with --create-test-data flag
4. Verify all Agent SDK APIs working
5. Test webhook integration when endpoint deployed

EOF

echo -e "${GREEN}✓${NC} Integration test report: $ARTIFACTS_DIR/integration-test-report.md"
echo ""

# Exit code
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "${RED}Integration tests completed with failures${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All integration tests passed${NC}"
  exit 0
fi
