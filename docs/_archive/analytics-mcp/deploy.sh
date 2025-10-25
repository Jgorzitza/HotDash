#!/bin/bash
# Deployment script for Google Analytics MCP on Fly.io

set -e

APP_NAME="hotdash-analytics-mcp"
ORG="personal"

echo "🚀 Deploying Google Analytics MCP to Fly.io"
echo ""

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo "❌ flyctl not found. Install from: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Run: fly auth login"
    exit 1
fi

# Check if app exists
if fly apps list | grep -q "$APP_NAME"; then
    echo "✅ App $APP_NAME already exists"
else
    echo "📦 Creating new app: $APP_NAME"
    fly apps create "$APP_NAME" --org "$ORG"
fi

# Check for required secrets
echo ""
echo "🔐 Checking secrets..."
if ! fly secrets list -a "$APP_NAME" | grep -q "GOOGLE_PROJECT_ID"; then
    echo ""
    echo "⚠️  GOOGLE_PROJECT_ID not set."
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    fly secrets set GOOGLE_PROJECT_ID="$PROJECT_ID" -a "$APP_NAME"
fi

if ! fly secrets list -a "$APP_NAME" | grep -q "GOOGLE_APPLICATION_CREDENTIALS_JSON"; then
    echo ""
    echo "⚠️  GOOGLE_APPLICATION_CREDENTIALS_JSON not set."
    read -p "Enter path to service account JSON file: " KEY_PATH

    if [ -f "$KEY_PATH" ]; then
        echo "📤 Uploading service account credentials..."
        fly secrets set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat "$KEY_PATH" | base64 -w 0)" -a "$APP_NAME"
    else
        echo "❌ File not found: $KEY_PATH"
        exit 1
    fi
fi

if ! fly secrets list -a "$APP_NAME" | grep -q "MCP_AUTH_TOKEN"; then
    echo ""
    echo "🔑 Generating MCP authentication token..."
    AUTH_TOKEN=$(openssl rand -hex 32)
    fly secrets set MCP_AUTH_TOKEN="$AUTH_TOKEN" -a "$APP_NAME"
    echo ""
    echo "⚠️  Save this token - you'll need it to connect clients:"
    echo "    $AUTH_TOKEN"
    echo ""
fi

# Deploy
echo ""
echo "🚢 Deploying to Fly.io..."
fly deploy -a "$APP_NAME"

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
fly status -a "$APP_NAME"

echo ""
echo "📍 Your MCP server is available at:"
echo "   https://$APP_NAME.fly.dev/mcp"
echo ""
echo "🔍 To view logs:"
echo "   fly logs -a $APP_NAME"
echo ""
echo "📖 See README.md for client configuration instructions"
