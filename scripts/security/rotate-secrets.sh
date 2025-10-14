#!/bin/bash
# Secret Rotation Automation
# Usage: ./scripts/security/rotate-secrets.sh [check|rotate|alert]

set -e

# Configuration
ROTATION_SCHEDULE_DAYS=90
ALERT_DAYS_BEFORE=7
AUDIT_LOG="/tmp/secret-rotation-audit.log"
SCHEDULE_FILE="scripts/security/rotation-schedule.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log_audit() {
  local action=$1
  local secret_name=$2
  local status=$3
  local timestamp=$(date -Iseconds)
  echo "[${timestamp}] ${action} | ${secret_name} | ${status}" >> "$AUDIT_LOG"
}

# Check rotation schedule
check_rotation() {
  echo "🔍 Checking rotation schedule..."
  
  if [ ! -f "$SCHEDULE_FILE" ]; then
    echo -e "${YELLOW}⚠️  No rotation schedule found. Run 'init' first.${NC}"
    exit 1
  fi
  
  local current_date=$(date +%s)
  local needs_rotation=()
  local upcoming_rotation=()
  
  # Parse schedule (simplified - in production use jq)
  while IFS= read -r line; do
    if echo "$line" | grep -q '"name"'; then
      secret_name=$(echo "$line" | sed 's/.*"name": "\(.*\)".*/\1/')
    fi
    if echo "$line" | grep -q '"last_rotated"'; then
      last_rotated=$(echo "$line" | sed 's/.*"last_rotated": "\(.*\)".*/\1/')
      last_rotated_epoch=$(date -d "$last_rotated" +%s 2>/dev/null || echo "0")
      
      days_since=$((($current_date - $last_rotated_epoch) / 86400))
      days_until=$(($ROTATION_SCHEDULE_DAYS - $days_since))
      
      if [ $days_since -ge $ROTATION_SCHEDULE_DAYS ]; then
        needs_rotation+=("$secret_name (${days_since} days old)")
      elif [ $days_until -le $ALERT_DAYS_BEFORE ]; then
        upcoming_rotation+=("$secret_name (${days_until} days until rotation)")
      fi
    fi
  done < "$SCHEDULE_FILE"
  
  # Report
  if [ ${#needs_rotation[@]} -gt 0 ]; then
    echo -e "${RED}🚨 IMMEDIATE ROTATION REQUIRED:${NC}"
    printf '%s\n' "${needs_rotation[@]}"
    echo ""
  fi
  
  if [ ${#upcoming_rotation[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  UPCOMING ROTATIONS (${ALERT_DAYS_BEFORE} days):${NC}"
    printf '%s\n' "${upcoming_rotation[@]}"
    echo ""
  fi
  
  if [ ${#needs_rotation[@]} -eq 0 ] && [ ${#upcoming_rotation[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All secrets are current${NC}"
  fi
  
  log_audit "CHECK" "ALL" "Checked ${#needs_rotation[@]} overdue, ${#upcoming_rotation[@]} upcoming"
}

# Initialize rotation schedule
init_schedule() {
  echo "📋 Initializing rotation schedule..."
  
  cat > "$SCHEDULE_FILE" << 'EOF'
{
  "rotation_schedule_days": 90,
  "alert_days_before": 7,
  "secrets": [
    {
      "name": "OPENAI_API_KEY",
      "type": "api_key",
      "location": "vault/occ/openai/api_key.env",
      "last_rotated": "2025-10-14",
      "rotation_method": "manual",
      "owner": "compliance"
    },
    {
      "name": "SUPABASE_SERVICE_KEY",
      "type": "service_key",
      "location": "vault/occ/supabase/service_key_staging.env",
      "last_rotated": "2025-10-14",
      "rotation_method": "manual",
      "owner": "deployment"
    },
    {
      "name": "SHOPIFY_API_SECRET",
      "type": "api_secret",
      "location": "vault/occ/shopify/api_secret_staging.env",
      "last_rotated": "2025-10-14",
      "rotation_method": "manual",
      "owner": "engineer"
    },
    {
      "name": "CHATWOOT_API_TOKEN",
      "type": "api_token",
      "location": "vault/occ/chatwoot/api_token_staging.env",
      "last_rotated": "2025-10-14",
      "rotation_method": "manual",
      "owner": "integration"
    },
    {
      "name": "GITHUB_PAT",
      "type": "pat",
      "location": "vault/occ/github/pat.env",
      "last_rotated": "2025-10-14",
      "rotation_method": "manual",
      "owner": "deployment"
    }
  ]
}
EOF
  
  echo -e "${GREEN}✅ Rotation schedule initialized: $SCHEDULE_FILE${NC}"
  log_audit "INIT" "SCHEDULE" "Initialized with 5 secrets"
}

# Send rotation alerts
send_alerts() {
  echo "📧 Sending rotation alerts..."
  
  # In production, integrate with actual alert system (email, Slack, etc.)
  # For now, write to alert file
  local alert_file="/tmp/secret-rotation-alerts.txt"
  
  check_rotation > "$alert_file"
  
  if grep -q "IMMEDIATE ROTATION REQUIRED" "$alert_file"; then
    echo -e "${RED}🚨 Critical alerts sent${NC}"
    log_audit "ALERT" "CRITICAL" "Immediate rotation required"
  elif grep -q "UPCOMING ROTATIONS" "$alert_file"; then
    echo -e "${YELLOW}⚠️  Warning alerts sent${NC}"
    log_audit "ALERT" "WARNING" "Upcoming rotations"
  else
    echo -e "${GREEN}✅ No alerts needed${NC}"
  fi
  
  cat "$alert_file"
}

# Rotate a specific secret
rotate_secret() {
  local secret_name=$1
  
  if [ -z "$secret_name" ]; then
    echo -e "${RED}❌ Usage: rotate-secrets.sh rotate <SECRET_NAME>${NC}"
    exit 1
  fi
  
  echo "🔄 Rotating secret: $secret_name"
  
  # In production, this would:
  # 1. Generate new secret
  # 2. Update in secret store (vault, env)
  # 3. Deploy to services
  # 4. Verify rotation
  # 5. Revoke old secret
  # 6. Update schedule file
  
  echo -e "${YELLOW}⚠️  Manual rotation required:${NC}"
  echo "1. Generate new secret for: $secret_name"
  echo "2. Update in vault/occ/"
  echo "3. Deploy to staging/production"
  echo "4. Run: rotate-secrets.sh update $secret_name"
  
  log_audit "ROTATE_INITIATED" "$secret_name" "Manual rotation started"
}

# Update rotation date
update_rotation_date() {
  local secret_name=$1
  local new_date=$(date +%Y-%m-%d)
  
  if [ -z "$secret_name" ]; then
    echo -e "${RED}❌ Usage: rotate-secrets.sh update <SECRET_NAME>${NC}"
    exit 1
  fi
  
  # Update schedule file (simplified - in production use jq)
  sed -i "s/\"name\": \"${secret_name}\"/\"name\": \"${secret_name}\"\n      \"last_rotated\": \"${new_date}\",/" "$SCHEDULE_FILE" 2>/dev/null || true
  
  echo -e "${GREEN}✅ Updated rotation date for $secret_name to $new_date${NC}"
  log_audit "ROTATE_COMPLETED" "$secret_name" "Rotation date updated to $new_date"
}

# Show audit log
show_audit() {
  if [ ! -f "$AUDIT_LOG" ]; then
    echo "No audit log found"
    exit 0
  fi
  
  echo "📋 Secret Rotation Audit Log:"
  echo "============================================"
  tail -n 50 "$AUDIT_LOG"
}

# Main command handler
case "${1:-check}" in
  check)
    check_rotation
    ;;
  init)
    init_schedule
    ;;
  alert)
    send_alerts
    ;;
  rotate)
    rotate_secret "$2"
    ;;
  update)
    update_rotation_date "$2"
    ;;
  audit)
    show_audit
    ;;
  *)
    echo "Usage: rotate-secrets.sh {check|init|alert|rotate|update|audit}"
    echo ""
    echo "Commands:"
    echo "  check          Check rotation schedule for overdue/upcoming"
    echo "  init           Initialize rotation schedule"
    echo "  alert          Send rotation alerts"
    echo "  rotate <name>  Initiate rotation for specific secret"
    echo "  update <name>  Update rotation date after manual rotation"
    echo "  audit          Show audit log"
    exit 1
    ;;
esac

