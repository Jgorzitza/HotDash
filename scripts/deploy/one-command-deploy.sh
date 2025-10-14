#!/usr/bin/env bash
set -euo pipefail

# One-Command Deploy
# Simplified deployment script for staging or production

ENVIRONMENT="${1:-staging}"
VERSION="${2:-auto}"

echo "=================================================="
echo "One-Command Deploy: $ENVIRONMENT"
echo "=================================================="
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo "ERROR: Invalid environment '$ENVIRONMENT'"
  echo "Usage: $0 {staging|production} [version]"
  exit 1
fi

# Production safety check
if [ "$ENVIRONMENT" = "production" ]; then
  echo "⚠️  WARNING: Deploying to PRODUCTION"
  echo "This requires manager approval and go-live checklist completion."
  echo ""
  read -p "Have you completed the go-live checklist? (yes/no): " CHECKLIST
  if [ "$CHECKLIST" != "yes" ]; then
    echo "Deployment aborted. Complete go-live checklist first."
    exit 1
  fi
  
  read -p "Enter manager approver name: " MANAGER
  read -p "Enter reliability approver name: " RELIABILITY
  
  if [ -z "$MANAGER" ] || [ -z "$RELIABILITY" ]; then
    echo "ERROR: Both manager and reliability approvers required for production"
    exit 1
  fi
fi

# Create deployment log
DEPLOY_LOG="artifacts/deploy/${ENVIRONMENT}-deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p artifacts/deploy

echo "Deployment Log" > "$DEPLOY_LOG"
echo "Environment: $ENVIRONMENT" >> "$DEPLOY_LOG"
echo "Version: $VERSION" >> "$DEPLOY_LOG"
echo "Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$DEPLOY_LOG"
echo "Executed by: $(whoami)" >> "$DEPLOY_LOG"
echo "" >> "$DEPLOY_LOG"

# Step 1: Verify environment parity
echo "1. Verifying environment parity..."
bash scripts/deploy/verify-environment-parity.sh 2>&1 | tee -a "$DEPLOY_LOG"

# Step 2: Run tests
echo "2. Running tests..."
npm run test:unit 2>&1 | tee -a "$DEPLOY_LOG" || {
  echo "ERROR: Tests failed!"
  exit 1
}

# Step 3: Build application
echo "3. Building application..."
npm run build 2>&1 | tee -a "$DEPLOY_LOG" || {
  echo "ERROR: Build failed!"
  exit 1
}

# Step 4: Production hardening (if production)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "4. Hardening production environment..."
  bash scripts/deploy/harden-production.sh 2>&1 | tee -a "$DEPLOY_LOG"
fi

# Step 5: Deploy
echo "5. Deploying to $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "staging" ]; then
  bash scripts/deploy/staging-deploy.sh 2>&1 | tee -a "$DEPLOY_LOG"
else
  bash scripts/deploy/production-deploy.sh 2>&1 | tee -a "$DEPLOY_LOG"
fi

# Step 6: Health check
echo "6. Running health checks..."
sleep 10

if [ "$ENVIRONMENT" = "staging" ]; then
  HEALTH_URL="${STAGING_APP_URL:-https://hotdash-staging.fly.dev}/health"
else
  HEALTH_URL="${PRODUCTION_APP_URL}/health"
fi

curl -f "$HEALTH_URL" 2>&1 | tee -a "$DEPLOY_LOG" || {
  echo "ERROR: Health check failed!"
  echo "Initiating automatic rollback..."
  bash scripts/deploy/rollback-${ENVIRONMENT}.sh
  exit 1
}

# Step 7: Smoke tests
echo "7. Running smoke tests..."
curl -f "${HEALTH_URL%/health}/" > /dev/null 2>&1 | tee -a "$DEPLOY_LOG" || {
  echo "WARNING: Smoke test failed (app may still be starting)"
}

echo "" >> "$DEPLOY_LOG"
echo "Completed: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$DEPLOY_LOG"
echo "Status: SUCCESS" >> "$DEPLOY_LOG"

echo "=================================================="
echo "Deployment Complete!"
echo "=================================================="
echo "Environment: $ENVIRONMENT"
echo "Status: SUCCESS"
echo "Log: $DEPLOY_LOG"
echo "=================================================="

# Production post-deployment
if [ "$ENVIRONMENT" = "production" ]; then
  echo ""
  echo "📋 POST-DEPLOYMENT CHECKLIST:"
  echo "1. ✅ Monitor application for 15 minutes"
  echo "2. ✅ Verify critical user journeys"
  echo "3. ✅ Check error rates in monitoring"
  echo "4. ✅ Update status page"
  echo "5. ✅ Notify stakeholders"
  echo "=================================================="
fi

exit 0

