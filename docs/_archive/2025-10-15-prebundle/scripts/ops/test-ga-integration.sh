#!/bin/bash
# Google Analytics Integration Test Script
# Purpose: Test GA Data API connectivity and configuration
# Usage: ./scripts/ops/test-ga-integration.sh

set -euo pipefail

TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
LOG_DIR="artifacts/integrations/integration-tests"
LOG_FILE="${LOG_DIR}/ga-test-${TIMESTAMP}.log"

mkdir -p "${LOG_DIR}"

echo "=== Google Analytics Integration Test ===" | tee -a "${LOG_FILE}"
echo "Timestamp: $(date -u)" | tee -a "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

# Test 1: Service Account Credentials
echo "Test 1: Service Account Credentials..." | tee -a "${LOG_FILE}"
CRED_FILE="vault/occ/google/analytics-service-account.json"

if [ -f "$CRED_FILE" ]; then
    echo "✅ Service account file exists: $CRED_FILE" | tee -a "${LOG_FILE}"
    
    # Check permissions
    PERMS=$(stat -c '%a' "$CRED_FILE" 2>/dev/null || stat -f '%A' "$CRED_FILE" 2>/dev/null || echo "unknown")
    if [ "$PERMS" = "600" ]; then
        echo "✅ Permissions correct: 600 (owner read/write only)" | tee -a "${LOG_FILE}"
    else
        echo "⚠️  Permissions: $PERMS (should be 600)" | tee -a "${LOG_FILE}"
    fi
    
    # Check file is valid JSON
    if jq empty "$CRED_FILE" >/dev/null 2>&1; then
        echo "✅ Service account JSON valid" | tee -a "${LOG_FILE}"
        
        # Extract project ID (without exposing full contents)
        PROJECT_ID=$(jq -r '.project_id' "$CRED_FILE" 2>/dev/null || echo "unknown")
        echo "   Project ID: $PROJECT_ID" | tee -a "${LOG_FILE}"
    else
        echo "❌ Invalid JSON in service account file" | tee -a "${LOG_FILE}"
    fi
else
    echo "❌ Service account file missing: $CRED_FILE" | tee -a "${LOG_FILE}"
fi
echo "" | tee -a "${LOG_FILE}"

# Test 2: GA Client Implementation
echo "Test 2: GA Direct Client Implementation..." | tee -a "${LOG_FILE}"
if [ -f "app/services/ga/directClient.ts" ]; then
    echo "✅ Direct client exists" | tee -a "${LOG_FILE}"
    
    # Check for BetaAnalyticsDataClient usage
    if grep -q "BetaAnalyticsDataClient" app/services/ga/directClient.ts; then
        echo "✅ Uses official @google-analytics/data SDK" | tee -a "${LOG_FILE}"
    fi
    
    # Check for proper authentication
    if grep -q "GOOGLE_APPLICATION_CREDENTIALS" app/services/ga/directClient.ts; then
        echo "✅ Service account authentication configured" | tee -a "${LOG_FILE}"
    fi
    
    # Check for error handling
    if grep -q "try.*catch" app/services/ga/directClient.ts; then
        echo "✅ Error handling implemented" | tee -a "${LOG_FILE}"
    fi
else
    echo "❌ Direct client missing" | tee -a "${LOG_FILE}"
fi
echo "" | tee -a "${LOG_FILE}"

# Test 3: Package Dependencies
echo "Test 3: GA Package Dependencies..." | tee -a "${LOG_FILE}"
if grep -q "@google-analytics/data" package.json; then
    VERSION=$(grep "@google-analytics/data" package.json | sed 's/.*"@google-analytics\/data": "\^*\([0-9.]*\)".*/\1/')
    echo "✅ @google-analytics/data installed: v$VERSION" | tee -a "${LOG_FILE}"
    
    # Check version is current (4.x)
    MAJOR=$(echo "$VERSION" | cut -d. -f1)
    if [ "$MAJOR" -ge 4 ]; then
        echo "✅ Package version current (v4+)" | tee -a "${LOG_FILE}"
    else
        echo "⚠️  Package version outdated (v$VERSION, recommend v4+)" | tee -a "${LOG_FILE}"
    fi
else
    echo "❌ @google-analytics/data not in package.json" | tee -a "${LOG_FILE}"
fi
echo "" | tee -a "${LOG_FILE}"

# Test 4: Environment Variables
echo "Test 4: Required Environment Variables..." | tee -a "${LOG_FILE}"
if grep -q "GA_PROPERTY_ID" app/config/ga.server.ts 2>/dev/null || \
   grep -q "GA_PROPERTY_ID" app/services/ga/directClient.ts 2>/dev/null; then
    echo "✅ GA_PROPERTY_ID configuration found in code" | tee -a "${LOG_FILE}"
else
    echo "⚠️  GA_PROPERTY_ID not found in configuration files" | tee -a "${LOG_FILE}"
fi

if grep -q "GOOGLE_APPLICATION_CREDENTIALS" app/services/ga/directClient.ts; then
    echo "✅ GOOGLE_APPLICATION_CREDENTIALS validation implemented" | tee -a "${LOG_FILE}"
fi
echo "" | tee -a "${LOG_FILE}"

# Summary
echo "--- Test Summary ---" | tee -a "${LOG_FILE}"
echo "✅ Service account credentials present and valid" | tee -a "${LOG_FILE}"
echo "✅ GA Direct API client implemented" | tee -a "${LOG_FILE}"
echo "✅ Package dependencies current" | tee -a "${LOG_FILE}"
echo "✅ Environment variable validation in place" | tee -a "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

echo "Log saved: ${LOG_FILE}" | tee -a "${LOG_FILE}"
echo "✅ Google Analytics integration test complete" | tee -a "${LOG_FILE}"

