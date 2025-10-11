#!/bin/bash
# All Integrations Test Suite
# Purpose: Run all integration tests and generate summary report
# Usage: ./scripts/ops/test-all-integrations.sh

set -eo pipefail

TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
LOG_DIR="artifacts/integrations/integration-tests"
SUMMARY_FILE="${LOG_DIR}/test-summary-${TIMESTAMP}.md"

mkdir -p "${LOG_DIR}"

echo "=== Running All Integration Tests ===" | tee "${SUMMARY_FILE}"
echo "Timestamp: $(date -u)" | tee -a "${SUMMARY_FILE}"
echo "" | tee -a "${SUMMARY_FILE}"

# Track results
TOTAL_TESTS=3
PASSED=0
FAILED=0

# Helper to run test
run_test() {
    local name=$1
    local script=$2
    
    echo "Running ${name}..." | tee -a "${SUMMARY_FILE}"
    
    if bash "$script" >/dev/null 2>&1; then
        echo "✅ ${name}: PASSED" | tee -a "${SUMMARY_FILE}"
        ((PASSED++))
    else
        echo "❌ ${name}: FAILED" | tee -a "${SUMMARY_FILE}"
        ((FAILED++))
    fi
}

# Run all tests
run_test "Shopify Integration" "scripts/ops/test-shopify-integration.sh"
run_test "Chatwoot Integration" "scripts/ops/test-chatwoot-integration.sh"
run_test "Google Analytics Integration" "scripts/ops/test-ga-integration.sh"

echo "" | tee -a "${SUMMARY_FILE}"
echo "--- Summary ---" | tee -a "${SUMMARY_FILE}"
echo "Total Tests: ${TOTAL_TESTS}" | tee -a "${SUMMARY_FILE}"
echo "Passed: ${PASSED}" | tee -a "${SUMMARY_FILE}"
echo "Failed: ${FAILED}" | tee -a "${SUMMARY_FILE}"
echo "" | tee -a "${SUMMARY_FILE}"

# Individual test logs
echo "--- Test Logs ---" | tee -a "${SUMMARY_FILE}"
ls -1 "${LOG_DIR}"/*-test-${TIMESTAMP:0:10}* 2>/dev/null | while read -r logfile; do
    echo "- $(basename "$logfile")" | tee -a "${SUMMARY_FILE}"
done
echo "" | tee -a "${SUMMARY_FILE}"

if [ "$FAILED" -gt 0 ]; then
    echo "❌ Integration tests FAILED: $FAILED test(s)" | tee -a "${SUMMARY_FILE}"
    exit 1
else
    echo "✅ All integration tests PASSED" | tee -a "${SUMMARY_FILE}"
    exit 0
fi

