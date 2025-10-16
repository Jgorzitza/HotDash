#!/bin/bash
#
# Environment Variable Sanity Check Script
#
# Verifies that all required environment variables are set
# and have valid values.
#
# Usage:
#   ./scripts/ops/env-var-sanity-check.sh [staging|production]
#

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Configuration
ENVIRONMENT="${1:-staging}"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

APP_NAME="hotdash-$ENVIRONMENT"

log_info "Checking environment variables for $APP_NAME..."

# Required secrets
REQUIRED_SECRETS=(
    "DATABASE_URL"
    "SESSION_SECRET"
    "SHOPIFY_API_KEY"
    "SHOPIFY_API_SECRET"
    "SHOP_DOMAIN"
    "SHOPIFY_APP_URL"
    "SCOPES"
)

# Optional but recommended secrets
OPTIONAL_SECRETS=(
    "CHATWOOT_ACCESS_TOKEN"
    "CHATWOOT_ACCOUNT_ID"
    "CHATWOOT_BASE_URL"
    "GA_PROPERTY_ID"
    "GOOGLE_APPLICATION_CREDENTIALS_JSON"
)

# Get secrets list
SECRETS_LIST=$(fly secrets list -a "$APP_NAME" 2>/dev/null | tail -n +2 | awk '{print $1}')

MISSING_REQUIRED=()
MISSING_OPTIONAL=()

# Check required secrets
for secret in "${REQUIRED_SECRETS[@]}"; do
    if echo "$SECRETS_LIST" | grep -q "^$secret$"; then
        log_info "✅ $secret is set"
    else
        log_error "❌ $secret is MISSING (required)"
        MISSING_REQUIRED+=("$secret")
    fi
done

# Check optional secrets
for secret in "${OPTIONAL_SECRETS[@]}"; do
    if echo "$SECRETS_LIST" | grep -q "^$secret$"; then
        log_info "✅ $secret is set"
    else
        log_warn "⚠️ $secret is not set (optional)"
        MISSING_OPTIONAL+=("$secret")
    fi
done

# Summary
echo ""
echo "=== Summary ==="
echo ""

if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    log_info "All required secrets are set"
else
    log_error "Missing ${#MISSING_REQUIRED[@]} required secret(s):"
    for secret in "${MISSING_REQUIRED[@]}"; do
        echo "  - $secret"
    done
    echo ""
    echo "Set missing secrets with:"
    echo "  fly secrets set SECRET_NAME=value -a $APP_NAME"
    exit 1
fi

if [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
    log_warn "Missing ${#MISSING_OPTIONAL[@]} optional secret(s):"
    for secret in "${MISSING_OPTIONAL[@]}"; do
        echo "  - $secret"
    done
    echo ""
    echo "These are optional but may be needed for full functionality."
fi

echo ""
log_info "Environment variable sanity check passed"

exit 0

