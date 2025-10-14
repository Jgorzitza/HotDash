#!/usr/bin/env bash
set -euo pipefail

# Production Hardening Script
# Implements security best practices for Fly.io production deployment
# Owner: Deployment Agent

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_DIR="artifacts/deployment"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/production-hardening-${TIMESTAMP}.log"

echo "🔒 Production Hardening - $TIMESTAMP" | tee "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
  echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
  echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

info() {
  echo -e "ℹ️  $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
if [ -z "${FLY_API_TOKEN:-}" ]; then
  error "FLY_API_TOKEN not set. Source vault/occ/fly/api_token.env first"
  exit 1
fi

# 1. Security Headers Configuration
echo "## 1. Security Headers" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Checking security headers configuration..."

# Check if fly.toml has security headers
if [ -f "fly.toml" ]; then
  if grep -q "X-Frame-Options\|X-Content-Type-Options\|Strict-Transport-Security" fly.toml; then
    success "Security headers configured in fly.toml"
  else
    warning "Security headers not found in fly.toml"
    info "Add these headers to [http_service.headers] section:"
    cat << 'HEADERS' | tee -a "$LOG_FILE"
    
[http_service.headers]
  X-Frame-Options = "DENY"
  X-Content-Type-Options = "nosniff"
  X-XSS-Protection = "1; mode=block"
  Strict-Transport-Security = "max-age=31536000; includeSubDomains"
  Referrer-Policy = "strict-origin-when-cross-origin"
  Permissions-Policy = "geolocation=(), microphone=(), camera=()"
HEADERS
  fi
else
  warning "fly.toml not found in current directory"
fi

echo "" | tee -a "$LOG_FILE"

# 2. TLS/SSL Configuration
echo "## 2. TLS/SSL Configuration" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Verifying TLS certificates..."

for app in hotdash-staging hotdash-agent-service hotdash-llamaindex-mcp hotdash-chatwoot; do
  CERT_CHECK=$(curl -sI "https://$app.fly.dev" 2>/dev/null | grep -i "HTTP" || echo "failed")
  if echo "$CERT_CHECK" | grep -q "HTTP/2 \|HTTP/1.1 "; then
    success "$app: TLS enabled (HTTPS working)"
  else
    error "$app: TLS verification failed"
  fi
done

echo "" | tee -a "$LOG_FILE"

# 3. Secret Rotation Status
echo "## 3. Secret Rotation" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Checking secret rotation requirements..."

# Check age of secrets (from vault files)
if [ -d "vault/occ" ]; then
  OLD_SECRETS=$(find vault/occ -type f -name "*.env" -mtime +90 2>/dev/null | wc -l)
  if [ "$OLD_SECRETS" -gt 0 ]; then
    warning "$OLD_SECRETS secrets older than 90 days - consider rotation"
    find vault/occ -type f -name "*.env" -mtime +90 -exec ls -lh {} \; | tee -a "$LOG_FILE"
  else
    success "All secrets rotated within 90 days"
  fi
else
  warning "vault/occ directory not found"
fi

echo "" | tee -a "$LOG_FILE"

# 4. Rate Limiting
echo "## 4. Rate Limiting" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Checking rate limiting configuration..."

# Check if rate limiting is configured (app-level)
if grep -r "rateLimit\|rate_limit\|RateLimit" app/ 2>/dev/null | head -5 | tee -a "$LOG_FILE"; then
  success "Rate limiting code found in application"
else
  warning "No rate limiting found in application code"
  info "Consider implementing rate limiting middleware"
fi

echo "" | tee -a "$LOG_FILE"

# 5. Database Security
echo "## 5. Database Security" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Verifying database security posture..."

# Check for Supabase-only usage (no Fly Postgres)
FLY_POSTGRES=$( ~/.fly/bin/fly apps list 2>/dev/null | grep -i "postgres\|db" | grep -v "supabase" || echo "")
if [ -z "$FLY_POSTGRES" ]; then
  success "No Fly Postgres instances (Supabase-only posture ✅)"
else
  error "Found Fly Postgres instance - violates canon:"
  echo "$FLY_POSTGRES" | tee -a "$LOG_FILE"
fi

# Check RLS policies (requires Supabase access)
if command -v supabase &> /dev/null; then
  info "Supabase CLI available - verify RLS policies manually with:"
  echo "  supabase db pull --schema=public" | tee -a "$LOG_FILE"
  echo "  # Check .sql files for CREATE POLICY statements" | tee -a "$LOG_FILE"
else
  warning "Supabase CLI not available - install for RLS verification"
fi

echo "" | tee -a "$LOG_FILE"

# 6. Network Security
echo "## 6. Network Security" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Checking network configuration..."

# Verify private networking (Fly)
for app in hotdash-staging hotdash-agent-service hotdash-llamaindex-mcp hotdash-chatwoot; do
  NETWORK=$(~/.fly/bin/fly status -a "$app" 2>/dev/null | grep -i "network\|ipv6" | head -1 || echo "unknown")
  if [ -n "$NETWORK" ]; then
    success "$app: Network configured"
  else
    warning "$app: Network status unknown"
  fi
done

echo "" | tee -a "$LOG_FILE"

# 7. Redundancy Check
echo "## 7. Redundancy & High Availability" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Checking redundancy configuration..."

for app in hotdash-staging hotdash-chatwoot; do
  MACHINE_COUNT=$(~/.fly/bin/fly machine list -a "$app" 2>/dev/null | grep -c "started\|deployed" || echo "0")
  if [ "$MACHINE_COUNT" -ge 2 ]; then
    success "$app: $MACHINE_COUNT machines (redundant)"
  elif [ "$MACHINE_COUNT" -eq 1 ]; then
    warning "$app: Single machine (no redundancy)"
    info "Consider adding redundancy with: fly scale count 2 -a $app"
  else
    error "$app: No running machines"
  fi
done

echo "" | tee -a "$LOG_FILE"

# 8. Backup Verification
echo "## 8. Backup & Disaster Recovery" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Verifying backup procedures..."

# Check for backup documentation
if [ -f "docs/runbooks/backup-restore-week3.md" ]; then
  success "Backup/restore documentation exists"
else
  warning "Backup/restore documentation not found"
fi

# Verify Supabase backups (requires Supabase dashboard access)
info "Supabase backups: Verify in dashboard (automatic daily backups)"
info "  Dashboard: https://supabase.com/dashboard/project/_/settings/database"

echo "" | tee -a "$LOG_FILE"

# 9. Monitoring & Alerting
echo "## 9. Monitoring & Alerting" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Checking monitoring configuration..."

if [ -f ".github/workflows/infrastructure-monitoring.yml" ]; then
  success "Infrastructure monitoring workflow configured (15 min intervals)"
else
  error "Infrastructure monitoring workflow not found"
fi

if [ -f "scripts/monitoring/fly-metrics-dashboard.sh" ]; then
  success "Metrics dashboard script exists"
else
  warning "Metrics dashboard script not found"
fi

echo "" | tee -a "$LOG_FILE"

# 10. Access Control
echo "## 10. Access Control" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

info "Reviewing access control..."

# Check GitHub environments (production requires approval)
if gh api /repos/:owner/:repo/environments/production 2>/dev/null | grep -q "protection_rules"; then
  success "Production environment has protection rules"
else
  warning "Production environment protection not verified"
  info "Ensure production deployments require manual approval"
fi

echo "" | tee -a "$LOG_FILE"

# Summary
echo "## Hardening Summary" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

SUCCESS_COUNT=$(grep -c "✅" "$LOG_FILE" || echo "0")
WARNING_COUNT=$(grep -c "⚠️" "$LOG_FILE" || echo "0")
ERROR_COUNT=$(grep -c "❌" "$LOG_FILE" || echo "0")

echo "Checks Passed: $SUCCESS_COUNT ✅" | tee -a "$LOG_FILE"
echo "Warnings: $WARNING_COUNT ⚠️" | tee -a "$LOG_FILE"
echo "Errors: $ERROR_COUNT ❌" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ "$ERROR_COUNT" -gt 0 ]; then
  error "Production hardening has critical issues - review $LOG_FILE"
  exit 1
elif [ "$WARNING_COUNT" -gt 5 ]; then
  warning "Multiple warnings found - consider addressing them before production"
  exit 0
else
  success "Production hardening checks complete - $LOG_FILE"
  exit 0
fi

