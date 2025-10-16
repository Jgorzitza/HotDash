#!/bin/bash
#
# One-Click Staging Deploy Script
#
# Deploys the current branch to staging with safety checks.
# For manager use only.
#
# Usage:
#   ./scripts/ops/one-click-staging-deploy.sh
#

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Configuration
APP_NAME="hotdash-staging"
CURRENT_BRANCH=$(git branch --show-current)

log_section "One-Click Staging Deploy"
echo "Branch: $CURRENT_BRANCH"
echo "Target: $APP_NAME"
echo ""

# Safety checks
log_section "Safety Checks"

# Check 1: Git status
log_info "Checking git status..."
if ! git diff-index --quiet HEAD --; then
    log_error "Uncommitted changes detected"
    echo "Please commit or stash your changes before deploying."
    exit 1
fi
log_info "✅ No uncommitted changes"

# Check 2: CI status
log_info "Checking CI status..."
if command -v gh &> /dev/null; then
    CI_STATUS=$(gh run list --branch "$CURRENT_BRANCH" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null || echo "unknown")
    if [ "$CI_STATUS" = "success" ]; then
        log_info "✅ CI checks passed"
    elif [ "$CI_STATUS" = "unknown" ]; then
        log_warn "⚠️ Could not verify CI status"
    else
        log_error "CI checks failed or pending"
        echo "Please ensure CI checks pass before deploying."
        exit 1
    fi
else
    log_warn "⚠️ GitHub CLI not installed, skipping CI check"
fi

# Check 3: Secrets scan
log_info "Running Gitleaks scan..."
if command -v gitleaks &> /dev/null; then
    if gitleaks detect --source . --redact --no-git; then
        log_info "✅ No secrets detected"
    else
        log_error "Secrets detected in code"
        echo "Please remove secrets before deploying."
        exit 1
    fi
else
    log_warn "⚠️ Gitleaks not installed, skipping secret scan"
fi

# Deployment
log_section "Deployment"

log_info "Deploying to $APP_NAME..."
fly deploy --app "$APP_NAME" --config fly.toml

if [ $? -eq 0 ]; then
    log_info "✅ Deployment successful"
else
    log_error "Deployment failed"
    exit 1
fi

# Health check
log_section "Health Check"

log_info "Waiting for deployment to stabilize..."
sleep 10

log_info "Checking health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://hotdash-staging.fly.dev/health || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    log_info "✅ Health check passed (HTTP $HEALTH_STATUS)"
elif [ "$HEALTH_STATUS" = "000" ]; then
    # Try root endpoint
    ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://hotdash-staging.fly.dev/ || echo "000")
    if [ "$ROOT_STATUS" = "200" ] || [ "$ROOT_STATUS" = "302" ]; then
        log_info "✅ Root endpoint healthy (HTTP $ROOT_STATUS)"
    else
        log_error "Health check failed (HTTP $ROOT_STATUS)"
        echo "Deployment may have issues. Check logs:"
        echo "  fly logs -a $APP_NAME"
        exit 1
    fi
else
    log_warn "⚠️ Health endpoint returned HTTP $HEALTH_STATUS"
fi

# Summary
log_section "Deployment Summary"

DEPLOYMENT_INFO=$(fly status -a "$APP_NAME" --json 2>/dev/null || echo "{}")
VERSION=$(echo "$DEPLOYMENT_INFO" | jq -r '.Machines[0].image_ref' 2>/dev/null || echo "unknown")

echo "✅ Deployment complete"
echo ""
echo "App: $APP_NAME"
echo "Branch: $CURRENT_BRANCH"
echo "Image: $VERSION"
echo "URL: https://hotdash-staging.fly.dev"
echo ""
echo "Next steps:"
echo "  - Test the deployment"
echo "  - Check logs: fly logs -a $APP_NAME"
echo "  - Monitor health: https://hotdash-staging.fly.dev/health"

exit 0

