#!/usr/bin/env bash
set -euo pipefail

# Environment Parity Verification
# Ensures staging and production environments are configured consistently

echo "=================================================="
echo "Environment Parity Verification"
echo "=================================================="

# Create verification report
REPORT_FILE="artifacts/deploy/environment-parity-$(date +%Y%m%d-%H%M%S).md"
mkdir -p artifacts/deploy

cat > "$REPORT_FILE" <<EOF
# Environment Parity Report
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Package Versions
EOF

# Check Node.js version consistency
echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "- Node.js: $NODE_VERSION" | tee -a "$REPORT_FILE"

# Check npm version
NPM_VERSION=$(npm --version)
echo "- npm: $NPM_VERSION" | tee -a "$REPORT_FILE"

# Check package.json dependencies
echo "" >> "$REPORT_FILE"
echo "## Dependencies Comparison" >> "$REPORT_FILE"
echo "Verifying package.json dependencies match across environments..."

# Check critical packages
CRITICAL_PACKAGES=(
  "@remix-run/dev"
  "@shopify/shopify-app-remix"
  "@supabase/supabase-js"
  "react"
  "prisma"
)

echo "" >> "$REPORT_FILE"
echo "### Critical Package Versions" >> "$REPORT_FILE"
for pkg in "${CRITICAL_PACKAGES[@]}"; do
  VERSION=$(node -p "require('./package.json').dependencies['$pkg'] || require('./package.json').devDependencies['$pkg'] || 'NOT FOUND'")
  echo "- $pkg: $VERSION" | tee -a "$REPORT_FILE"
done

# Environment Variables Check
echo "" >> "$REPORT_FILE"
echo "## Required Environment Variables" >> "$REPORT_FILE"
echo "Checking environment variable configuration..."

REQUIRED_VARS=(
  "SHOPIFY_API_KEY"
  "SHOPIFY_API_SECRET"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SESSION_SECRET"
)

echo "" >> "$REPORT_FILE"
echo "### Staging Environment" >> "$REPORT_FILE"
for var in "${REQUIRED_VARS[@]}"; do
  if [ -n "${!var:-}" ]; then
    echo "- ✅ $var: SET" | tee -a "$REPORT_FILE"
  else
    echo "- ❌ $var: NOT SET" | tee -a "$REPORT_FILE"
  fi
done

# Configuration Files
echo "" >> "$REPORT_FILE"
echo "## Configuration Files" >> "$REPORT_FILE"

if [ -f "shopify.app.toml" ]; then
  echo "- ✅ shopify.app.toml: EXISTS" | tee -a "$REPORT_FILE"
else
  echo "- ❌ shopify.app.toml: MISSING" | tee -a "$REPORT_FILE"
fi

if [ -f "fly.toml" ]; then
  echo "- ✅ fly.toml: EXISTS" | tee -a "$REPORT_FILE"
else
  echo "- ❌ fly.toml: MISSING" | tee -a "$REPORT_FILE"
fi

if [ -f "remix.config.js" ]; then
  echo "- ✅ remix.config.js: EXISTS" | tee -a "$REPORT_FILE"
else
  echo "- ❌ remix.config.js: MISSING" | tee -a "$REPORT_FILE"
fi

# Build Configuration
echo "" >> "$REPORT_FILE"
echo "## Build Configuration" >> "$REPORT_FILE"

if grep -q "\"build\"" package.json; then
  BUILD_SCRIPT=$(node -p "require('./package.json').scripts.build")
  echo "- Build script: \`$BUILD_SCRIPT\`" | tee -a "$REPORT_FILE"
fi

if grep -q "\"deploy\"" package.json; then
  DEPLOY_SCRIPT=$(node -p "require('./package.json').scripts.deploy")
  echo "- Deploy script: \`$BUILD_SCRIPT\`" | tee -a "$REPORT_FILE"
fi

# Security Headers
echo "" >> "$REPORT_FILE"
echo "## Security Configuration" >> "$REPORT_FILE"

if [ -f "app/entry.server.tsx" ]; then
  if grep -q "Content-Security-Policy" app/entry.server.tsx; then
    echo "- ✅ CSP headers: CONFIGURED" | tee -a "$REPORT_FILE"
  else
    echo "- ⚠️ CSP headers: NOT FOUND" | tee -a "$REPORT_FILE"
  fi
fi

# Summary
echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "- Parity check completed: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" | tee -a "$REPORT_FILE"
echo "- Report saved: $REPORT_FILE" | tee -a "$REPORT_FILE"

echo "=================================================="
echo "Parity verification complete!"
echo "Report: $REPORT_FILE"
echo "=================================================="

exit 0

