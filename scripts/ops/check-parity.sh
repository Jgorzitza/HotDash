#!/bin/bash
#
# Staging/Production Parity Check Script
#
# Verifies that staging and production environments are in sync
# regarding configuration, secrets, and deployment versions.
#
# Usage:
#   ./scripts/ops/check-parity.sh
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Track issues
ISSUES=0

log_section "Staging/Production Parity Check"
echo "Checking configuration parity between staging and production..."
echo ""

# Check 1: Fly.io App Status
log_section "1. Fly.io App Status"

log_info "Checking staging app..."
STAGING_STATUS=$(fly status -a hotdash-staging --json 2>/dev/null || echo "{}")
STAGING_MACHINES=$(echo "$STAGING_STATUS" | jq -r '.Machines | length' 2>/dev/null || echo "0")
STAGING_REGION=$(echo "$STAGING_STATUS" | jq -r '.Machines[0].region' 2>/dev/null || echo "unknown")

log_info "Checking production app..."
PROD_STATUS=$(fly status -a hotdash-production --json 2>/dev/null || echo "{}")
PROD_MACHINES=$(echo "$PROD_STATUS" | jq -r '.Machines | length' 2>/dev/null || echo "0")
PROD_REGION=$(echo "$PROD_STATUS" | jq -r '.Machines[0].region' 2>/dev/null || echo "unknown")

echo "Staging:    $STAGING_MACHINES machine(s) in $STAGING_REGION"
echo "Production: $PROD_MACHINES machine(s) in $PROD_REGION"

if [ "$STAGING_REGION" != "$PROD_REGION" ]; then
    log_warn "Regions differ: staging=$STAGING_REGION, production=$PROD_REGION"
    ((ISSUES++))
fi

# Check 2: Secrets Parity
log_section "2. Secrets Configuration"

log_info "Fetching staging secrets..."
STAGING_SECRETS=$(fly secrets list -a hotdash-staging 2>/dev/null | tail -n +2 | awk '{print $1}' | sort)

log_info "Fetching production secrets..."
PROD_SECRETS=$(fly secrets list -a hotdash-production 2>/dev/null | tail -n +2 | awk '{print $1}' | sort)

# Compare secret names
STAGING_ONLY=$(comm -23 <(echo "$STAGING_SECRETS") <(echo "$PROD_SECRETS"))
PROD_ONLY=$(comm -13 <(echo "$STAGING_SECRETS") <(echo "$PROD_SECRETS"))
COMMON=$(comm -12 <(echo "$STAGING_SECRETS") <(echo "$PROD_SECRETS"))

COMMON_COUNT=$(echo "$COMMON" | grep -c . || echo "0")
echo "Common secrets: $COMMON_COUNT"

if [ -n "$STAGING_ONLY" ]; then
    log_warn "Secrets only in staging:"
    echo "$STAGING_ONLY" | sed 's/^/  - /'
    ((ISSUES++))
fi

if [ -n "$PROD_ONLY" ]; then
    log_warn "Secrets only in production:"
    echo "$PROD_ONLY" | sed 's/^/  - /'
    ((ISSUES++))
fi

if [ -z "$STAGING_ONLY" ] && [ -z "$PROD_ONLY" ]; then
    log_info "✅ Secret names match"
fi

# Check 3: Resource Configuration
log_section "3. Resource Configuration"

STAGING_MEMORY=$(echo "$STAGING_STATUS" | jq -r '.Machines[0].config.guest.memory_mb' 2>/dev/null || echo "unknown")
STAGING_CPU=$(echo "$STAGING_STATUS" | jq -r '.Machines[0].config.guest.cpus' 2>/dev/null || echo "unknown")

PROD_MEMORY=$(echo "$PROD_STATUS" | jq -r '.Machines[0].config.guest.memory_mb' 2>/dev/null || echo "unknown")
PROD_CPU=$(echo "$PROD_STATUS" | jq -r '.Machines[0].config.guest.cpus' 2>/dev/null || echo "unknown")

echo "Staging:    ${STAGING_MEMORY}MB RAM, ${STAGING_CPU} CPU(s)"
echo "Production: ${PROD_MEMORY}MB RAM, ${PROD_CPU} CPU(s)"

if [ "$STAGING_MEMORY" != "$PROD_MEMORY" ]; then
    log_warn "Memory differs: staging=${STAGING_MEMORY}MB, production=${PROD_MEMORY}MB"
    ((ISSUES++))
fi

if [ "$STAGING_CPU" != "$PROD_CPU" ]; then
    log_warn "CPU differs: staging=${STAGING_CPU}, production=${PROD_CPU}"
    ((ISSUES++))
fi

# Check 4: Deployment Versions
log_section "4. Deployment Versions"

log_info "Checking staging version..."
STAGING_VERSION=$(fly releases -a hotdash-staging --json 2>/dev/null | jq -r '.[0].version' || echo "unknown")
STAGING_IMAGE=$(fly releases -a hotdash-staging --json 2>/dev/null | jq -r '.[0].image_ref' || echo "unknown")

log_info "Checking production version..."
PROD_VERSION=$(fly releases -a hotdash-production --json 2>/dev/null | jq -r '.[0].version' || echo "unknown")
PROD_IMAGE=$(fly releases -a hotdash-production --json 2>/dev/null | jq -r '.[0].image_ref' || echo "unknown")

echo "Staging:    v$STAGING_VERSION"
echo "Production: v$PROD_VERSION"

if [ "$STAGING_IMAGE" = "$PROD_IMAGE" ]; then
    log_info "✅ Same Docker image deployed"
else
    log_warn "Different Docker images deployed"
    echo "  Staging:    $STAGING_IMAGE"
    echo "  Production: $PROD_IMAGE"
    # This is expected - staging usually ahead of production
fi

# Check 5: Health Status
log_section "5. Health Status"

log_info "Checking staging health..."
STAGING_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://hotdash-staging.fly.dev/health || echo "000")

log_info "Checking production health..."
PROD_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://hotdash-production.fly.dev/health || echo "000")

echo "Staging:    HTTP $STAGING_HEALTH"
echo "Production: HTTP $PROD_HEALTH"

if [ "$STAGING_HEALTH" != "200" ]; then
    log_error "Staging health check failed"
    ((ISSUES++))
fi

if [ "$PROD_HEALTH" != "200" ] && [ "$PROD_HEALTH" != "000" ]; then
    log_error "Production health check failed"
    ((ISSUES++))
fi

# Check 6: Environment Variables (from fly.toml)
log_section "6. Environment Variables"

if [ -f "fly.toml" ]; then
    log_info "Checking fly.toml configuration..."
    
    # Check if app name matches staging
    APP_NAME=$(grep "^app = " fly.toml | cut -d'"' -f2)
    if [ "$APP_NAME" = "hotdash-staging" ]; then
        log_info "✅ fly.toml configured for staging"
    elif [ "$APP_NAME" = "hotdash-production" ]; then
        log_warn "fly.toml configured for production (should be staging for development)"
        ((ISSUES++))
    else
        log_warn "fly.toml app name: $APP_NAME"
    fi
else
    log_warn "fly.toml not found"
    ((ISSUES++))
fi

# Check 7: Database Configuration
log_section "7. Database Configuration"

log_info "Checking database connectivity..."

# Get DATABASE_URL from secrets (masked)
STAGING_DB_SET=$(fly secrets list -a hotdash-staging 2>/dev/null | grep -c "DATABASE_URL" || echo "0")
PROD_DB_SET=$(fly secrets list -a hotdash-production 2>/dev/null | grep -c "DATABASE_URL" || echo "0")

if [ "$STAGING_DB_SET" = "1" ]; then
    log_info "✅ Staging DATABASE_URL configured"
else
    log_error "Staging DATABASE_URL not configured"
    ((ISSUES++))
fi

if [ "$PROD_DB_SET" = "1" ]; then
    log_info "✅ Production DATABASE_URL configured"
else
    log_error "Production DATABASE_URL not configured"
    ((ISSUES++))
fi

# Check 8: Node.js Version
log_section "8. Node.js Version"

if [ -f "package.json" ]; then
    NODE_VERSION=$(jq -r '.engines.node // "not specified"' package.json)
    echo "Required Node.js version: $NODE_VERSION"
    
    if [ "$NODE_VERSION" = "not specified" ]; then
        log_warn "Node.js version not specified in package.json"
        ((ISSUES++))
    fi
else
    log_warn "package.json not found"
    ((ISSUES++))
fi

# Summary
log_section "Summary"

if [ $ISSUES -eq 0 ]; then
    log_info "✅ No parity issues found"
    echo ""
    echo "Staging and production environments are in sync."
    exit 0
else
    log_warn "⚠️  Found $ISSUES parity issue(s)"
    echo ""
    echo "Review the warnings above and address any configuration differences."
    echo ""
    echo "Common fixes:"
    echo "  - Sync secrets: fly secrets set SECRET_NAME=value -a <app>"
    echo "  - Sync resources: fly scale memory <MB> -a <app>"
    echo "  - Deploy to production: Use deploy-production workflow"
    exit 1
fi

