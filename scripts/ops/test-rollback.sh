#!/usr/bin/env bash
# Test rollback procedure (non-destructive)
set -euo pipefail

APP_NAME="${FLY_APP_NAME:-hotdash-staging}"
VERIFY_ONLY="${VERIFY_ONLY:-true}"

echo "🔄 Testing rollback procedure..."
echo "App: $APP_NAME"
echo "Mode: $([ "$VERIFY_ONLY" = "true" ] && echo "VERIFY ONLY" || echo "EXECUTE ROLLBACK")"
echo ""

# Check 1: Verify fly CLI installed
if ! command -v fly &> /dev/null; then
  echo "❌ fly CLI not installed"
  exit 1
fi
echo "✅ fly CLI: installed"

# Check 2: Verify authentication
if ! fly auth whoami &> /dev/null; then
  echo "❌ Not authenticated to Fly.io"
  echo "Run: fly auth login"
  exit 1
fi
echo "✅ Fly.io: authenticated"

# Check 3: List recent releases
echo ""
echo "📋 Recent releases:"
fly releases -a "$APP_NAME" | head -6

# Check 4: Verify rollback command syntax
echo ""
echo "🔍 Rollback command (dry-run):"
echo "  fly releases rollback -a $APP_NAME"

if [ "$VERIFY_ONLY" = "true" ]; then
  echo ""
  echo "✅ Rollback procedure verified (dry-run only)"
  echo ""
  echo "To execute actual rollback:"
  echo "  VERIFY_ONLY=false FLY_APP_NAME=$APP_NAME ./scripts/ops/test-rollback.sh"
  exit 0
fi

# Execute rollback (if VERIFY_ONLY=false)
echo ""
echo "⚠️  Executing rollback to previous release..."
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

fly releases rollback -a "$APP_NAME"

echo ""
echo "✅ Rollback completed"
echo ""
echo "Verification steps:"
echo "1. Check health: curl -f https://$APP_NAME.fly.dev/health"
echo "2. View status: fly status -a $APP_NAME"
echo "3. View logs: fly logs -a $APP_NAME"

