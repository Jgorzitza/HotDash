#!/usr/bin/env bash
#
# Chatwoot Health Check Script (Shell version)
#
# Verifies Chatwoot is operational by checking:
# 1. /rails/health endpoint (Chatwoot platform health)
# 2. Authenticated API access via /api/v1/profile
#
# Usage:
#   ./scripts/ops/check-chatwoot-health.sh
#
# Exit codes:
#   0 - All checks pass (healthy)
#   1 - Configuration missing
#   2 - Health endpoint failed
#   3 - Authenticated API failed
#   4 - Both checks failed

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

ARTIFACT_DIR="artifacts/ops/chatwoot-health"
TIMEOUT=10

# Logging functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $(date -u +"%Y-%m-%dT%H:%M:%SZ") $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $(date -u +"%Y-%m-%dT%H:%M:%SZ") $1"
}

log_error() {
  echo -e "${RED}✗${NC} $(date -u +"%Y-%m-%dT%H:%M:%SZ") $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $(date -u +"%Y-%m-%dT%H:%M:%SZ") $1"
}

# Check environment variables
check_env() {
  if [ -z "${CHATWOOT_BASE_URL:-}" ]; then
    log_error "CHATWOOT_BASE_URL environment variable not set"
    echo ""
    echo "Required environment variables:"
    echo "  - CHATWOOT_BASE_URL"
    echo "  - CHATWOOT_API_TOKEN or CHATWOOT_TOKEN"
    exit 1
  fi

  if [ -z "${CHATWOOT_API_TOKEN:-}" ] && [ -z "${CHATWOOT_TOKEN:-}" ]; then
    log_error "CHATWOOT_API_TOKEN or CHATWOOT_TOKEN environment variable not set"
    exit 1
  fi

  # Use CHATWOOT_API_TOKEN if set, otherwise fall back to CHATWOOT_TOKEN
  CHATWOOT_TOKEN="${CHATWOOT_API_TOKEN:-${CHATWOOT_TOKEN}}"
}

# Check /rails/health endpoint
check_rails_health() {
  local url="${CHATWOOT_BASE_URL}/rails/health"
  local start=$(date +%s%3N)
  
  log_info "Checking Rails health: ${url}"
  
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time "${TIMEOUT}" \
    "${url}" 2>&1) || http_code="000"
  
  local end=$(date +%s%3N)
  local duration=$((end - start))
  
  if [ "${http_code}" = "200" ]; then
    log_success "Rails Health: ${http_code} (${duration}ms)"
    echo "pass"
  else
    log_error "Rails Health: Failed with HTTP ${http_code} (${duration}ms)"
    echo "fail"
  fi
}

# Check authenticated API access
check_authenticated_api() {
  local url="${CHATWOOT_BASE_URL}/api/v1/profile"
  local start=$(date +%s%3N)
  
  log_info "Checking authenticated API: ${url}"
  
  local response
  local http_code
  response=$(curl -s -w "\n%{http_code}" \
    --max-time "${TIMEOUT}" \
    -H "api_access_token: ${CHATWOOT_TOKEN}" \
    -H "Content-Type: application/json" \
    "${url}" 2>&1) || http_code="000"
  
  # Split response and HTTP code
  http_code=$(echo "$response" | tail -n 1)
  local body=$(echo "$response" | sed '$d')
  
  local end=$(date +%s%3N)
  local duration=$((end - start))
  
  if [ "${http_code}" = "200" ]; then
    log_success "Authenticated API: ${http_code} (${duration}ms)"
    
    # Try to extract account info using jq if available
    if command -v jq &> /dev/null && [ -n "${body}" ]; then
      local account_id=$(echo "${body}" | jq -r '.id // empty' 2>/dev/null || echo "")
      local account_name=$(echo "${body}" | jq -r '.name // empty' 2>/dev/null || echo "")
      
      if [ -n "${account_id}" ]; then
        echo "  Account ID: ${account_id}"
      fi
      if [ -n "${account_name}" ]; then
        echo "  Account Name: ${account_name}"
      fi
    fi
    
    echo "pass"
  else
    log_error "Authenticated API: Failed with HTTP ${http_code} (${duration}ms)"
    echo "fail"
  fi
}

# Save results to artifact
save_artifact() {
  local rails_status=$1
  local api_status=$2
  
  mkdir -p "${ARTIFACT_DIR}"
  
  local timestamp=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
  local filename="${ARTIFACT_DIR}/health-check-${timestamp}.json"
  
  local passed=0
  [ "${rails_status}" = "pass" ] && ((passed++)) || true
  [ "${api_status}" = "pass" ] && ((passed++)) || true
  
  cat > "${filename}" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "baseUrl": "${CHATWOOT_BASE_URL}",
  "checks": [
    {
      "name": "rails_health",
      "status": "${rails_status}"
    },
    {
      "name": "authenticated_api",
      "status": "${api_status}"
    }
  ],
  "summary": {
    "total": 2,
    "passed": ${passed},
    "failed": $((2 - passed))
  }
}
EOF
  
  log_info "Artifact saved: ${filename}"
}

# Main function
main() {
  echo ""
  echo -e "${BOLD}${BLUE}Chatwoot Health Check${NC}"
  echo ""
  
  # Check environment
  check_env
  
  log_info "Checking Chatwoot instance: ${CHATWOOT_BASE_URL}"
  echo ""
  
  # Run health checks
  rails_status=$(check_rails_health)
  api_status=$(check_authenticated_api)
  
  echo ""
  echo -e "${BOLD}Summary:${NC}"
  
  # Save artifact
  save_artifact "${rails_status}" "${api_status}"
  
  local passed=0
  [ "${rails_status}" = "pass" ] && ((passed++)) || true
  [ "${api_status}" = "pass" ] && ((passed++)) || true
  
  echo "  Total checks: 2"
  echo -e "  Passed: ${GREEN}${passed}${NC}"
  echo -e "  Failed: $((2 - passed) > 0 && echo -n ${RED} || echo -n ${NC})$((2 - passed))${NC}"
  echo ""
  
  # Determine exit code
  if [ "${rails_status}" = "pass" ] && [ "${api_status}" = "pass" ]; then
    log_success "All Chatwoot health checks passed"
    exit 0
  elif [ "${rails_status}" = "fail" ] && [ "${api_status}" = "fail" ]; then
    log_error "All Chatwoot health checks failed"
    exit 4
  elif [ "${rails_status}" = "fail" ]; then
    log_error "Rails health check failed"
    exit 2
  else
    log_error "Authenticated API check failed"
    exit 3
  fi
}

# Run main function
main "$@"

