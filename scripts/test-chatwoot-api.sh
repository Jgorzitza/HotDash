#!/bin/bash
#
# Chatwoot API Testing Suite
# 
# Purpose: Test all Chatwoot API endpoints for integration readiness
# Usage: ./scripts/test-chatwoot-api.sh [production|staging|local]
# 
# Created: 2025-10-12
# Owner: Chatwoot Agent
#

set -e

# Configuration
ENVIRONMENT=${1:-local}
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LOG_DIR="artifacts/chatwoot"
LOG_FILE="$LOG_DIR/api-test-$TIMESTAMP.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Environment-specific configuration
case $ENVIRONMENT in
  production)
    BASE_URL="https://hotdash-chatwoot.fly.dev/api/v1"
    API_TOKEN="${CHATWOOT_API_TOKEN_PROD}"
    ACCOUNT_ID="${CHATWOOT_ACCOUNT_ID_PROD:-1}"
    ;;
  staging)
    BASE_URL="https://hotdash-chatwoot-staging.fly.dev/api/v1"
    API_TOKEN="${CHATWOOT_API_TOKEN_STAGING}"
    ACCOUNT_ID="${CHATWOOT_ACCOUNT_ID_STAGING:-1}"
    ;;
  local)
    BASE_URL="http://localhost:3000/api/v1"
    API_TOKEN="${CHATWOOT_API_TOKEN_LOCAL:-test-token}"
    ACCOUNT_ID="1"
    ;;
  *)
    echo "Error: Unknown environment '$ENVIRONMENT'"
    echo "Usage: $0 [production|staging|local]"
    exit 1
    ;;
esac

# Check API token
if [ -z "$API_TOKEN" ]; then
  echo "Error: API token not found for environment '$ENVIRONMENT'"
  echo "Set CHATWOOT_API_TOKEN_${ENVIRONMENT^^} environment variable"
  exit 1
fi

# Logging function
log() {
  echo "$1" | tee -a "$LOG_FILE"
}

log "═══════════════════════════════════════════════════════════════"
log "🧪 Chatwoot API Testing Suite"
log "═══════════════════════════════════════════════════════════════"
log ""
log "Environment: $ENVIRONMENT"
log "Base URL: $BASE_URL"
log "Account ID: $ACCOUNT_ID"
log "Timestamp: $TIMESTAMP"
log "Log File: $LOG_FILE"
log ""

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper: Run API test
test_api() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="${5:-200}"
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  log "─────────────────────────────────────────────────────────────"
  log "Test $TESTS_RUN: $test_name"
  log "Method: $method $endpoint"
  
  local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
  curl_cmd="$curl_cmd -H 'api_access_token: $API_TOKEN'"
  curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
  
  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -d '$data'"
    log "Payload: $data"
  fi
  
  curl_cmd="$curl_cmd $BASE_URL$endpoint"
  
  # Execute request
  local response=$(eval $curl_cmd)
  local status_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)
  
  log "Status: $status_code (expected: $expected_status)"
  
  if [ "$status_code" = "$expected_status" ]; then
    log "✅ PASS"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Pretty print response if JSON
    if echo "$body" | jq . > /dev/null 2>&1; then
      log "Response:"
      echo "$body" | jq . | head -20 | tee -a "$LOG_FILE"
    else
      log "Response: $body"
    fi
  else
    log "❌ FAIL - Expected $expected_status, got $status_code"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    log "Response: $body"
  fi
  
  log ""
}

# ═══════════════════════════════════════════════════════════════
# TEST SUITE: Conversations API
# ═══════════════════════════════════════════════════════════════

log "═══════════════════════════════════════════════════════════════"
log "📬 CONVERSATIONS API TESTS"
log "═══════════════════════════════════════════════════════════════"
log ""

# Test 1: List conversations
test_api \
  "List Conversations" \
  "GET" \
  "/accounts/$ACCOUNT_ID/conversations" \
  "" \
  "200"

# Test 2: Get conversation metadata
# Note: Will fail if no conversations exist, that's expected
test_api \
  "Get Conversation Metadata" \
  "GET" \
  "/accounts/$ACCOUNT_ID/conversations/1" \
  "" \
  "200,404"

# ═══════════════════════════════════════════════════════════════
# TEST SUITE: Messages API
# ═══════════════════════════════════════════════════════════════

log "═══════════════════════════════════════════════════════════════"
log "💬 MESSAGES API TESTS"
log "═══════════════════════════════════════════════════════════════"
log ""

# Note: Creating test messages requires valid conversation ID
# These tests document expected formats and error responses

# Test 3: Create private note (will fail without valid conversation)
test_api \
  "Create Private Note (Expected to fail)" \
  "POST" \
  "/accounts/$ACCOUNT_ID/conversations/999/messages" \
  '{"content":"Test private note from API","message_type":0,"private":true}' \
  "404,422"

# Test 4: Create public reply (will fail without valid conversation)
test_api \
  "Create Public Reply (Expected to fail)" \
  "POST" \
  "/accounts/$ACCOUNT_ID/conversations/999/messages" \
  '{"content":"Test public reply","message_type":1,"private":false}' \
  "404,422"

# ═══════════════════════════════════════════════════════════════
# TEST SUITE: Contacts API
# ═══════════════════════════════════════════════════════════════

log "═══════════════════════════════════════════════════════════════"
log "👤 CONTACTS API TESTS"
log "═══════════════════════════════════════════════════════════════"
log ""

# Test 5: List contacts
test_api \
  "List Contacts" \
  "GET" \
  "/accounts/$ACCOUNT_ID/contacts" \
  "" \
  "200"

# Test 6: Search contact (will return empty if no matches)
test_api \
  "Search Contacts" \
  "GET" \
  "/accounts/$ACCOUNT_ID/contacts/search?q=test@example.com" \
  "" \
  "200"

# ═══════════════════════════════════════════════════════════════
# TEST SUITE: Inboxes API
# ═══════════════════════════════════════════════════════════════

log "═══════════════════════════════════════════════════════════════"
log "📥 INBOXES API TESTS"
log "═══════════════════════════════════════════════════════════════"
log ""

# Test 7: List inboxes
test_api \
  "List Inboxes" \
  "GET" \
  "/accounts/$ACCOUNT_ID/inboxes" \
  "" \
  "200"

# Test 8: Get inbox details (will fail if inbox 1 doesn't exist)
test_api \
  "Get Inbox Details" \
  "GET" \
  "/accounts/$ACCOUNT_ID/inboxes/1" \
  "" \
  "200,404"

# ═══════════════════════════════════════════════════════════════
# TEST SUITE: Agents API
# ═══════════════════════════════════════════════════════════════

log "═══════════════════════════════════════════════════════════════"
log "👨‍💼 AGENTS API TESTS"
log "═══════════════════════════════════════════════════════════════"
log ""

# Test 9: List agents
test_api \
  "List Agents" \
  "GET" \
  "/accounts/$ACCOUNT_ID/agents" \
  "" \
  "200"

# Test 10: Get current user
test_api \
  "Get Current User" \
  "GET" \
  "/profile" \
  "" \
  "200"

# ═══════════════════════════════════════════════════════════════
# TEST RESULTS SUMMARY
# ═══════════════════════════════════════════════════════════════

log "═══════════════════════════════════════════════════════════════"
log "📊 TEST RESULTS SUMMARY"
log "═══════════════════════════════════════════════════════════════"
log ""
log "Tests Run: $TESTS_RUN"
log "Tests Passed: $TESTS_PASSED"
log "Tests Failed: $TESTS_FAILED"
log "Pass Rate: $(awk "BEGIN {printf \"%.1f\", ($TESTS_PASSED/$TESTS_RUN)*100}")%"
log ""

if [ $TESTS_FAILED -eq 0 ]; then
  log "✅ ALL TESTS PASSED - Chatwoot API is ready!"
  log ""
  log "Full test log: $LOG_FILE"
  exit 0
else
  log "⚠️  SOME TESTS FAILED - Review failures above"
  log ""
  log "Full test log: $LOG_FILE"
  exit 1
fi

