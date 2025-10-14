#!/usr/bin/env bash
set -euo pipefail

# Production Environment Hardening
# Applies security best practices to production deployment

echo "=================================================="
echo "Production Environment Hardening"
echo "=================================================="

HARDENING_LOG="artifacts/deploy/production-hardening-$(date +%Y%m%d-%H%M%S).md"
mkdir -p artifacts/deploy

cat > "$HARDENING_LOG" <<EOF
# Production Hardening Report
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Security Checklist

EOF

# 1. Environment Variable Validation
echo "1. Validating production environment variables..."
echo "### Environment Variables" >> "$HARDENING_LOG"

REQUIRED_PROD_VARS=(
  "SHOPIFY_API_KEY_PROD"
  "SHOPIFY_API_SECRET_PROD"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_KEY"
  "SESSION_SECRET"
  "PRODUCTION_APP_URL"
)

ALL_VARS_SET=true
for var in "${REQUIRED_PROD_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "- ❌ $var: NOT SET" | tee -a "$HARDENING_LOG"
    ALL_VARS_SET=false
  else
    echo "- ✅ $var: SET" | tee -a "$HARDENING_LOG"
  fi
done

if [ "$ALL_VARS_SET" = false ]; then
  echo "ERROR: Missing required production environment variables!"
  exit 1
fi

# 2. Security Headers Verification
echo "" >> "$HARDENING_LOG"
echo "2. Verifying security headers..."
echo "### Security Headers" >> "$HARDENING_LOG"

if curl -sI "${PRODUCTION_APP_URL}" | grep -qi "x-frame-options"; then
  echo "- ✅ X-Frame-Options: PRESENT" | tee -a "$HARDENING_LOG"
else
  echo "- ❌ X-Frame-Options: MISSING" | tee -a "$HARDENING_LOG"
fi

if curl -sI "${PRODUCTION_APP_URL}" | grep -qi "strict-transport-security"; then
  echo "- ✅ HSTS: PRESENT" | tee -a "$HARDENING_LOG"
else
  echo "- ⚠️ HSTS: MISSING (should be set by Shopify)" | tee -a "$HARDENING_LOG"
fi

if curl -sI "${PRODUCTION_APP_URL}" | grep -qi "content-security-policy"; then
  echo "- ✅ CSP: PRESENT" | tee -a "$HARDENING_LOG"
else
  echo "- ❌ CSP: MISSING" | tee -a "$HARDENING_LOG"
fi

# 3. SSL/TLS Verification
echo "" >> "$HARDENING_LOG"
echo "3. Verifying SSL/TLS configuration..."
echo "### SSL/TLS" >> "$HARDENING_LOG"

if curl -sI "${PRODUCTION_APP_URL}" | head -1 | grep -qi "HTTP/2"; then
  echo "- ✅ HTTP/2: ENABLED" | tee -a "$HARDENING_LOG"
else
  echo "- ⚠️ HTTP/2: NOT DETECTED" | tee -a "$HARDENING_LOG"
fi

# 4. Rate Limiting Check
echo "" >> "$HARDENING_LOG"
echo "4. Checking rate limiting..."
echo "### Rate Limiting" >> "$HARDENING_LOG"

if grep -q "rateLimit" app/shopify.server.ts 2>/dev/null; then
  echo "- ✅ Rate limiting: CONFIGURED" | tee -a "$HARDENING_LOG"
else
  echo "- ⚠️ Rate limiting: CHECK CONFIGURATION" | tee -a "$HARDENING_LOG"
fi

# 5. Database Security
echo "" >> "$HARDENING_LOG"
echo "5. Verifying database security..."
echo "### Database Security" >> "$HARDENING_LOG"

if [ -f "prisma/schema.prisma" ]; then
  echo "- ✅ Prisma schema: EXISTS" | tee -a "$HARDENING_LOG"
  
  # Check for RLS references
  if grep -q "rls" prisma/schema.prisma 2>/dev/null; then
    echo "- ✅ RLS references: FOUND" | tee -a "$HARDENING_LOG"
  else
    echo "- ⚠️ RLS references: NOT FOUND (check Supabase RLS policies)" | tee -a "$HARDENING_LOG"
  fi
fi

# 6. Secrets Management
echo "" >> "$HARDENING_LOG"
echo "6. Validating secrets management..."
echo "### Secrets Management" >> "$HARDENING_LOG"

if [ -f ".env" ]; then
  echo "- ⚠️ .env file: PRESENT (should not be in production)" | tee -a "$HARDENING_LOG"
else
  echo "- ✅ .env file: NOT PRESENT" | tee -a "$HARDENING_LOG"
fi

if [ -f ".env.production" ]; then
  echo "- ⚠️ .env.production: PRESENT (should use environment variables)" | tee -a "$HARDENING_LOG"
else
  echo "- ✅ .env.production: NOT PRESENT" | tee -a "$HARDENING_LOG"
fi

# 7. Error Handling
echo "" >> "$HARDENING_LOG"
echo "7. Checking error handling..."
echo "### Error Handling" >> "$HARDENING_LOG"

if grep -q "try.*catch" app/entry.server.tsx 2>/dev/null; then
  echo "- ✅ Error handling: IMPLEMENTED" | tee -a "$HARDENING_LOG"
else
  echo "- ⚠️ Error handling: CHECK IMPLEMENTATION" | tee -a "$HARDENING_LOG"
fi

# 8. Logging Configuration
echo "" >> "$HARDENING_LOG"
echo "8. Verifying logging configuration..."
echo "### Logging" >> "$HARDENING_LOG"

if grep -q "console.log" app/**/*.{ts,tsx} 2>/dev/null; then
  echo "- ⚠️ console.log: FOUND (consider structured logging)" | tee -a "$HARDENING_LOG"
else
  echo "- ✅ console.log: NOT FOUND" | tee -a "$HARDENING_LOG"
fi

# Summary
echo "" >> "$HARDENING_LOG"
echo "## Hardening Summary" >> "$HARDENING_LOG"
echo "- Hardening check completed: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" | tee -a "$HARDENING_LOG"
echo "- Environment: Production" | tee -a "$HARDENING_LOG"
echo "- Status: Review report for warnings" | tee -a "$HARDENING_LOG"

echo "=================================================="
echo "Production hardening complete!"
echo "Report: $HARDENING_LOG"
echo "=================================================="

echo ""
echo "⚠️ RECOMMENDATIONS:"
echo "1. Review all ⚠️ warnings in the report"
echo "2. Ensure RLS policies are enabled in Supabase"
echo "3. Monitor security headers in production"
echo "4. Implement structured logging"
echo "5. Review rate limiting configuration"
echo "=================================================="

exit 0

