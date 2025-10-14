#!/usr/bin/env bash
set -euo pipefail

# Rollback Staging Deployment
# Reverts the staging environment to a previous version

echo "=================================================="
echo "ROLLBACK: Staging Environment"
echo "=================================================="
echo "Target version: ${TARGET_VERSION:-auto}"
echo "Reason: ${ROLLBACK_REASON:-manual rollback}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

# Verify required environment variables
if [ -z "${SHOPIFY_CLI_AUTH_TOKEN:-}" ]; then
  echo "ERROR: SHOPIFY_CLI_AUTH_TOKEN not set"
  exit 1
fi

if [ -z "${STAGING_APP_URL:-}" ]; then
  echo "ERROR: STAGING_APP_URL not set"
  exit 1
fi

# Create rollback artifact directory
mkdir -p artifacts/rollback
ROLLBACK_LOG="artifacts/rollback/staging-rollback-$(date +%Y%m%d-%H%M%S).log"

# Log rollback details
cat > "$ROLLBACK_LOG" <<EOF
Rollback Metadata
=================
Environment: staging
Target Version: ${TARGET_VERSION:-auto}
Reason: ${ROLLBACK_REASON:-manual rollback}
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Executed By: ${GITHUB_ACTOR:-local}
Git Commit: $(git rev-parse HEAD)
Git Branch: $(git branch --show-current)

Deployment Steps
================
EOF

echo "1. Taking pre-rollback snapshot..."
curl -f "${STAGING_APP_URL}/health" > artifacts/rollback/pre-rollback-health.json 2>&1 || {
  echo "WARNING: Could not fetch pre-rollback health status"
}

echo "2. Deploying rollback version to Shopify..."
npm run deploy 2>&1 | tee -a "$ROLLBACK_LOG"

echo "3. Waiting for deployment to stabilize (30 seconds)..."
sleep 30

echo "4. Verifying rollback health..."
curl -f "${STAGING_APP_URL}/health" > artifacts/rollback/post-rollback-health.json 2>&1 || {
  echo "ERROR: Health check failed after rollback!"
  exit 1
}

echo "5. Running smoke tests..."
curl -f "${STAGING_APP_URL}/" > /dev/null 2>&1 || {
  echo "ERROR: Smoke test failed - app not responding!"
  exit 1
}

echo "=================================================="
echo "ROLLBACK COMPLETE"
echo "=================================================="
echo "Environment: staging"
echo "Status: SUCCESS"
echo "Health: OK"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Log: $ROLLBACK_LOG"
echo "=================================================="

# Record success
echo "Status: SUCCESS" >> "$ROLLBACK_LOG"
echo "Completed: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$ROLLBACK_LOG"

exit 0

