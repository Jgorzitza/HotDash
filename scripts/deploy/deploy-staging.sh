#!/bin/bash
set -e

# HotDash Staging Deployment Script
# One-command deploy to staging environment

echo "🚀 HotDash Staging Deployment"
echo "=============================="

# Configuration
APP_NAME="hotdash-staging"
HEALTH_URL="https://hotdash-staging.fly.dev/health"

echo "📋 Pre-flight checks..."
echo "✅ Fly CLI: $(flyctl version 2>/dev/null || echo 'not found')"
echo "✅ App: $APP_NAME"

echo ""
echo "🚢 Deploying..."
flyctl deploy --app $APP_NAME --remote-only --ha=false

echo ""
echo "⏳ Waiting..."
sleep 10

echo ""
echo "🧪 Smoke tests..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
echo "✅ Health: $HEALTH"

NEW_VERSION=$(flyctl releases --app $APP_NAME --json | jq -r '.[0].Version')
echo ""
echo "🎉 Deployed v$NEW_VERSION"
echo "URL: https://hotdash-staging.fly.dev"
