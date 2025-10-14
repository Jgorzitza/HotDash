#!/usr/bin/env bash
set -euo pipefail

# Rollback Production Deployment
# Reverts the production environment to a previous version
# REQUIRES: Manager + Reliability approval

echo "=================================================="
echo "ROLLBACK: Production Environment"
echo "=================================================="
echo "Target version: ${TARGET_VERSION:-auto}"
echo "Reason: ${ROLLBACK_REASON:-manual rollback}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

# Verify required environment variables
if [ -z "${SHOPIFY_CLI_AUTH_TOKEN_PROD:-}" ]; then
  echo "ERROR: SHOPIFY_CLI_AUTH_TOKEN_PROD not set"
  exit 1
fi

if [ -z "${PRODUCTION_APP_URL:-}" ]; then
  echo "ERROR: PRODUCTION_APP_URL not set"
  exit 1
fi

# Create rollback artifact directory
mkdir -p artifacts/rollback
ROLLBACK_LOG="artifacts/rollback/production-rollback-$(date +%Y%m%d-%H%M%S).log"

# Log rollback details
cat > "$ROLLBACK_LOG" <<EOF
Production Rollback Metadata
============================
Environment: production
Target Version: ${TARGET_VERSION:-auto}
Reason: ${ROLLBACK_REASON:-manual rollback}
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Executed By: ${GITHUB_ACTOR:-local}
Git Commit: $(git rev-parse HEAD)
Git Branch: $(git branch --show-current)

⚠️ PRODUCTION ROLLBACK IN PROGRESS ⚠️

Deployment Steps
================
EOF

echo "1. Taking pre-rollback snapshot..."
curl -f "${PRODUCTION_APP_URL}/health" > artifacts/rollback/pre-rollback-health-prod.json 2>&1 || {
  echo "WARNING: Could not fetch pre-rollback health status"
}

echo "2. Backing up current production state..."
git rev-parse HEAD > artifacts/rollback/previous-prod-commit.txt

echo "3. Deploying rollback version to Shopify Production..."
npm run deploy:production 2>&1 | tee -a "$ROLLBACK_LOG"

echo "4. Waiting for deployment to stabilize (60 seconds)..."
sleep 60

echo "5. Verifying rollback health..."
for i in {1..3}; do
  if curl -f "${PRODUCTION_APP_URL}/health" > artifacts/rollback/post-rollback-health-prod.json 2>&1; then
    echo "Health check passed (attempt $i/3)"
    break
  else
    if [ $i -eq 3 ]; then
      echo "ERROR: Health check failed after rollback (all attempts failed)!"
      exit 1
    fi
    echo "Health check failed, retrying in 10 seconds..."
    sleep 10
  fi
done

echo "6. Running production smoke tests..."
curl -f "${PRODUCTION_APP_URL}/" > /dev/null 2>&1 || {
  echo "ERROR: Production smoke test failed - app not responding!"
  exit 1
}

echo "7. Verifying critical endpoints..."
curl -f "${PRODUCTION_APP_URL}/app" > /dev/null 2>&1 || {
  echo "WARNING: /app endpoint check failed"
}

echo "=================================================="
echo "PRODUCTION ROLLBACK COMPLETE"
echo "=================================================="
echo "Environment: production"
echo "Status: SUCCESS"
echo "Health: OK"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Log: $ROLLBACK_LOG"
echo "=================================================="
echo ""
echo "⚠️ POST-ROLLBACK ACTIONS REQUIRED:"
echo "1. Notify all stakeholders of rollback"
echo "2. Create incident report"
echo "3. Schedule post-mortem"
echo "4. Update status page"
echo "=================================================="

# Record success
echo "Status: SUCCESS" >> "$ROLLBACK_LOG"
echo "Completed: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$ROLLBACK_LOG"

exit 0

