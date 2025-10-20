#!/bin/bash
# Rollback script for HotDash deployments
# Usage: ./scripts/ops/rollback.sh <version> [app-name]
#
# Examples:
#   ./scripts/ops/rollback.sh v1.0.0                    # Rollback staging
#   ./scripts/ops/rollback.sh v1.0.0 hot-dash           # Rollback production
#   ./scripts/ops/rollback.sh v1.0.0 hotdash-staging    # Rollback staging (explicit)

set -e

VERSION=${1:-}
APP_NAME=${2:-hotdash-staging}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation
if [ -z "$VERSION" ]; then
  echo -e "${RED}❌ Error: Version is required${NC}"
  echo "Usage: $0 <version> [app-name]"
  echo ""
  echo "Examples:"
  echo "  $0 v1.0.0"
  echo "  $0 v1.0.0 hot-dash"
  exit 1
fi

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
  echo -e "${RED}❌ Error: flyctl is not installed${NC}"
  echo "Install: https://fly.io/docs/hands-on/install-flyctl/"
  exit 1
fi

# Verify app exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
  echo -e "${RED}❌ Error: App '$APP_NAME' not found${NC}"
  echo "Available apps:"
  flyctl apps list
  exit 1
fi

echo -e "${YELLOW}🔄 Rollback Initiated${NC}"
echo "  App: $APP_NAME"
echo "  Target version: $VERSION"
echo "  Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Confirm rollback for production
if [[ "$APP_NAME" == *"production"* ]] || [[ "$APP_NAME" == "hot-dash" ]]; then
  echo -e "${RED}⚠️  WARNING: This is a PRODUCTION rollback${NC}"
  read -p "Type 'rollback-production' to confirm: " CONFIRM
  if [ "$CONFIRM" != "rollback-production" ]; then
    echo -e "${RED}❌ Rollback cancelled${NC}"
    exit 1
  fi
fi

# Capture current state
echo -e "${YELLOW}📸 Capturing current state...${NC}"
CURRENT_VERSION=$(flyctl releases --app "$APP_NAME" --json | jq -r '.[0].version // "unknown"')
echo "  Current version: $CURRENT_VERSION"

# Check if target version exists in releases
if ! flyctl releases --app "$APP_NAME" | grep -q "$VERSION"; then
  echo -e "${RED}❌ Error: Version $VERSION not found in releases${NC}"
  echo ""
  echo "Recent releases:"
  flyctl releases --app "$APP_NAME" | head -10
  exit 1
fi

# Download release artifacts from GitHub (if available)
echo -e "${YELLOW}📦 Checking for release artifacts...${NC}"
if [ -f "hotdash-${VERSION#v}.tar.gz" ]; then
  echo "  Found local artifact: hotdash-${VERSION#v}.tar.gz"
  
  # Verify checksum if available
  if [ -f "hotdash-${VERSION#v}.tar.gz.sha256" ]; then
    echo -e "${YELLOW}🔐 Verifying checksum...${NC}"
    if sha256sum -c "hotdash-${VERSION#v}.tar.gz.sha256"; then
      echo -e "${GREEN}  ✅ Checksum verified${NC}"
    else
      echo -e "${RED}  ❌ Checksum verification failed${NC}"
      read -p "Continue anyway? (y/N): " CONTINUE
      if [ "$CONTINUE" != "y" ]; then
        exit 1
      fi
    fi
  fi
  
  # Extract and deploy
  echo -e "${YELLOW}📂 Extracting release...${NC}"
  tar -xzf "hotdash-${VERSION#v}.tar.gz"
  
  echo -e "${YELLOW}🚀 Deploying from artifact...${NC}"
  flyctl deploy --app "$APP_NAME"
else
  # Rollback using Fly.io release history
  echo -e "${YELLOW}🔙 Rolling back via Fly.io release history...${NC}"
  flyctl releases rollback --app "$APP_NAME" "$VERSION"
fi

# Wait for deployment
echo -e "${YELLOW}⏳ Waiting for deployment to stabilize...${NC}"
sleep 20

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
APP_URL="https://${APP_NAME}.fly.dev"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health" || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Health check passed (HTTP $HEALTH_STATUS)${NC}"
else
  echo -e "${YELLOW}⚠️  Health check returned HTTP $HEALTH_STATUS${NC}"
  ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/" || echo "000")
  if [ "$ROOT_STATUS" = "200" ] || [ "$ROOT_STATUS" = "302" ]; then
    echo -e "${GREEN}✅ Root endpoint accessible (HTTP $ROOT_STATUS)${NC}"
  else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "  Health endpoint: HTTP $HEALTH_STATUS"
    echo "  Root endpoint: HTTP $ROOT_STATUS"
    echo ""
    echo "Check logs: flyctl logs --app $APP_NAME"
    exit 1
  fi
fi

# Verify machine status
echo -e "${YELLOW}🖥️  Verifying machine status...${NC}"
flyctl status --app "$APP_NAME"

# Record rollback
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
mkdir -p artifacts/rollbacks
cat <<MD > "artifacts/rollbacks/${APP_NAME}-rollback-${TIMESTAMP}.md"
# Rollback Executed

- **App**: $APP_NAME
- **Target Version**: $VERSION
- **Previous Version**: $CURRENT_VERSION
- **Executed By**: $(whoami)
- **Timestamp**: $TIMESTAMP
- **Health Status**: $HEALTH_STATUS
- **Method**: ${1:+artifact}${1:-fly-release-history}

## Verification

- Health Check: HTTP $HEALTH_STATUS
- App URL: $APP_URL

## Rollback Command

\`\`\`bash
./scripts/ops/rollback.sh $VERSION $APP_NAME
\`\`\`

## Next Steps

1. Verify application functionality at $APP_URL
2. Monitor logs: \`flyctl logs --app $APP_NAME\`
3. Investigate root cause of issue that triggered rollback
4. Fix issue and create new release
MD

echo ""
echo -e "${GREEN}✅ Rollback Complete${NC}"
echo "  From: $CURRENT_VERSION"
echo "  To: $VERSION"
echo "  App URL: $APP_URL"
echo "  Health: HTTP $HEALTH_STATUS"
echo ""
echo "Rollback recorded: artifacts/rollbacks/${APP_NAME}-rollback-${TIMESTAMP}.md"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Verify app at $APP_URL"
echo "  2. Monitor: flyctl logs --app $APP_NAME"
echo "  3. Investigate root cause"


