#!/usr/bin/env bash
set -euo pipefail

# Automated Smoke Test
# Verifies critical application functionality after deployment

ENVIRONMENT="${1:-staging}"
BASE_URL="${TARGET_URL:-${2:-}}"

if [ -z "$BASE_URL" ]; then
  if [ "$ENVIRONMENT" = "staging" ]; then
    BASE_URL="https://hotdash-staging.fly.dev"
  else
    BASE_URL="${PRODUCTION_APP_URL:-}"
  fi
fi

if [ -z "$BASE_URL" ]; then
  echo "ERROR: BASE_URL not provided and could not be determined"
  echo "Usage: $0 [environment] [base_url]"
  echo "Or set TARGET_URL environment variable"
  exit 1
fi

echo "=================================================="
echo "Automated Smoke Test: $ENVIRONMENT"
echo "=================================================="
echo "Base URL: $BASE_URL"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

SMOKE_TEST_LOG="artifacts/deploy/smoke-test-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S).md"
mkdir -p artifacts/deploy

cat > "$SMOKE_TEST_LOG" <<EOF
# Smoke Test Report
Environment: $ENVIRONMENT
Base URL: $BASE_URL
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Test Results

EOF

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
  local test_name="$1"
  local test_command="$2"
  local expected_status="${3:-200}"
  
  echo "Testing: $test_name"
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$test_command" || echo "000")
  
  if [ "$HTTP_STATUS" = "$expected_status" ]; then
    echo "- ✅ $test_name: PASS (HTTP $HTTP_STATUS)" | tee -a "$SMOKE_TEST_LOG"
    ((TESTS_PASSED++))
  else
    echo "- ❌ $test_name: FAIL (HTTP $HTTP_STATUS, expected $expected_status)" | tee -a "$SMOKE_TEST_LOG"
    ((TESTS_FAILED++))
  fi
}

# Test 1: Health endpoint
run_test "Health Endpoint" "$BASE_URL/health"

# Test 2: Root page
run_test "Root Page" "$BASE_URL/"

# Test 3: App route
run_test "App Route" "$BASE_URL/app"

# Test 4: Auth callback (should redirect)
run_test "Auth Callback" "$BASE_URL/auth/callback" "302"

# Test 5: API health
run_test "API Health" "$BASE_URL/api/health" "200"

# Test 6: Static assets (favicon)
run_test "Static Assets" "$BASE_URL/favicon.ico" "200"

# Test 7: Response time check
echo "" | tee -a "$SMOKE_TEST_LOG"
echo "### Performance" >> "$SMOKE_TEST_LOG"

RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "$BASE_URL/health")
echo "- Health endpoint response time: ${RESPONSE_TIME}s" | tee -a "$SMOKE_TEST_LOG"

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
  echo "- ✅ Response time: GOOD (<2s)" | tee -a "$SMOKE_TEST_LOG"
  ((TESTS_PASSED++))
else
  echo "- ⚠️ Response time: SLOW (>2s)" | tee -a "$SMOKE_TEST_LOG"
  ((TESTS_FAILED++))
fi

# Summary
echo "" | tee -a "$SMOKE_TEST_LOG"
echo "## Summary" >> "$SMOKE_TEST_LOG"
echo "- Tests passed: $TESTS_PASSED" | tee -a "$SMOKE_TEST_LOG"
echo "- Tests failed: $TESTS_FAILED" | tee -a "$SMOKE_TEST_LOG"
echo "- Total tests: $((TESTS_PASSED + TESTS_FAILED))" | tee -a "$SMOKE_TEST_LOG"
echo "- Success rate: $(( TESTS_PASSED * 100 / (TESTS_PASSED + TESTS_FAILED) ))%" | tee -a "$SMOKE_TEST_LOG"

echo "=================================================="
echo "Smoke Test Complete"
echo "=================================================="
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
echo "Log: $SMOKE_TEST_LOG"
echo "=================================================="

# Exit with failure if any tests failed
if [ $TESTS_FAILED -gt 0 ]; then
  echo "ERROR: Some smoke tests failed!"
  exit 1
fi

echo "✅ All smoke tests passed!"
exit 0

