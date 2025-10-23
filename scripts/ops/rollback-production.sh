#!/bin/bash
# Production Rollback Script
# Automated rollback with health verification and notifications
#
# Usage: ./scripts/ops/rollback-production.sh [version]
#
# If version is not specified, rolls back to previous version
#
# @see DEVOPS-018

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="hotdash-production"
HEALTH_ENDPOINT="https://hotdash-production.fly.dev/health"
MONITORING_ENDPOINT="https://hotdash-production.fly.dev/api/monitoring/health"
ROLLBACK_DIR="artifacts/rollback/$(date +%Y-%m-%d-%H%M%S)"

# Create rollback directory
mkdir -p "$ROLLBACK_DIR"

echo -e "${BLUE}=== Production Rollback Script ===${NC}"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "App: $APP_NAME"
echo ""

# Check if flyctl is available
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl not found. Please install Fly CLI.${NC}"
    exit 1
fi

# Check if FLY_API_TOKEN is set
if [ -z "$FLY_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ FLY_API_TOKEN not set. Attempting to use local auth...${NC}"
fi

# Function to check health
check_health() {
    local endpoint=$1
    local max_attempts=${2:-10}
    local attempt=1
    
    echo "Checking health at $endpoint..."
    
    while [ $attempt -le $max_attempts ]; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" || echo "000")
        
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ]; then
            echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_CODE)${NC}"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: HTTP $HTTP_CODE"
        sleep 10
        ((attempt++))
    done
    
    echo -e "${RED}❌ Health check failed after $max_attempts attempts${NC}"
    return 1
}

# Capture pre-rollback state
echo "1. Capturing pre-rollback state..."
flyctl status --app "$APP_NAME" > "$ROLLBACK_DIR/pre-rollback-status.txt" 2>&1 || true
flyctl releases --app "$APP_NAME" --json > "$ROLLBACK_DIR/pre-rollback-releases.json" 2>&1 || true
flyctl releases --app "$APP_NAME" > "$ROLLBACK_DIR/pre-rollback-releases.txt" 2>&1 || true

# Get current version
CURRENT_VERSION=$(flyctl releases --app "$APP_NAME" --json 2>/dev/null | jq -r '.[0].version' || echo "unknown")
echo "Current version: v$CURRENT_VERSION"

# Determine target version
if [ -n "$1" ]; then
    TARGET_VERSION="$1"
    echo "Target version specified: v$TARGET_VERSION"
else
    # Get previous version
    TARGET_VERSION=$(flyctl releases --app "$APP_NAME" --json 2>/dev/null | jq -r '.[1].version' || echo "")
    
    if [ -z "$TARGET_VERSION" ] || [ "$TARGET_VERSION" = "null" ]; then
        echo -e "${RED}❌ Could not determine previous version${NC}"
        echo "Available releases:"
        flyctl releases --app "$APP_NAME"
        exit 1
    fi
    
    echo "Rolling back to previous version: v$TARGET_VERSION"
fi

# Confirm rollback
echo ""
echo -e "${YELLOW}⚠️ WARNING: About to rollback production${NC}"
echo "From: v$CURRENT_VERSION"
echo "To:   v$TARGET_VERSION"
echo ""
read -p "Continue with rollback? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Execute rollback
echo ""
echo "2. Executing rollback..."
START_TIME=$(date +%s)

if flyctl releases rollback "$TARGET_VERSION" --app "$APP_NAME" --yes; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo -e "${GREEN}✅ Rollback command completed in ${DURATION}s${NC}"
else
    echo -e "${RED}❌ Rollback command failed${NC}"
    exit 1
fi

# Wait for rollback to propagate
echo ""
echo "3. Waiting for rollback to propagate (30s)..."
sleep 30

# Capture post-rollback state
echo ""
echo "4. Capturing post-rollback state..."
flyctl status --app "$APP_NAME" > "$ROLLBACK_DIR/post-rollback-status.txt" 2>&1 || true
flyctl releases --app "$APP_NAME" --json > "$ROLLBACK_DIR/post-rollback-releases.json" 2>&1 || true
flyctl releases --app "$APP_NAME" > "$ROLLBACK_DIR/post-rollback-releases.txt" 2>&1 || true

# Verify rollback
NEW_VERSION=$(flyctl releases --app "$APP_NAME" --json 2>/dev/null | jq -r '.[0].version' || echo "unknown")
echo "New version: v$NEW_VERSION"

if [ "$NEW_VERSION" = "$TARGET_VERSION" ]; then
    echo -e "${GREEN}✅ Rollback version confirmed${NC}"
else
    echo -e "${YELLOW}⚠️ Version mismatch: expected v$TARGET_VERSION, got v$NEW_VERSION${NC}"
fi

# Health checks
echo ""
echo "5. Verifying application health..."

if check_health "$HEALTH_ENDPOINT" 10; then
    echo -e "${GREEN}✅ Basic health check passed${NC}"
else
    echo -e "${RED}❌ Basic health check failed${NC}"
    echo "Rollback may have failed. Check application logs:"
    echo "  flyctl logs --app $APP_NAME"
    exit 1
fi

echo ""
if check_health "$MONITORING_ENDPOINT" 5; then
    echo -e "${GREEN}✅ Monitoring health check passed${NC}"
else
    echo -e "${YELLOW}⚠️ Monitoring health check failed (non-critical)${NC}"
fi

# Get machine status
echo ""
echo "6. Machine status:"
flyctl status --app "$APP_NAME" 2>&1 || true

# Summary
echo ""
echo -e "${GREEN}=== Rollback Complete ===${NC}"
echo "Rolled back from v$CURRENT_VERSION to v$NEW_VERSION"
echo "Duration: ${DURATION}s"
echo "Artifacts saved to: $ROLLBACK_DIR"
echo ""
echo "Next steps:"
echo "1. Monitor application: flyctl logs --app $APP_NAME"
echo "2. Check metrics: https://hotdash-production.fly.dev/api/monitoring/dashboard"
echo "3. Verify functionality manually"
echo "4. Document incident and root cause"
echo ""

# Save rollback summary
cat > "$ROLLBACK_DIR/rollback-summary.txt" << EOF
Production Rollback Summary
===========================

Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
App: $APP_NAME

Versions:
- Previous: v$CURRENT_VERSION
- Target: v$TARGET_VERSION
- Current: v$NEW_VERSION

Duration: ${DURATION}s

Health Checks:
- Basic: PASSED
- Monitoring: $([ $? -eq 0 ] && echo "PASSED" || echo "WARNING")

Artifacts: $ROLLBACK_DIR

Executed by: $(whoami)
EOF

echo "Rollback summary saved to: $ROLLBACK_DIR/rollback-summary.txt"

