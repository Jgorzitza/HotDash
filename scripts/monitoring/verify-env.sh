#!/bin/bash
# HotDash Environment Configuration Verification
# Version: 1.0
# Last Updated: October 12, 2025

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Environment Configuration Verification                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

ALL_OK=true

# Function to verify secret exists
verify_secret() {
    local app_name=$1
    local secret_name=$2
    local secrets_list=$3
    
    if echo "$secrets_list" | grep -q "^$secret_name"; then
        echo -e "${GREEN}✅${NC} $secret_name"
        return 0
    else
        echo -e "${RED}❌${NC} $secret_name - MISSING"
        ALL_OK=false
        return 1
    fi
}

# Check Agent SDK secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Agent SDK (hotdash-agent-service) Secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

AGENT_SECRETS=$(fly secrets list -a hotdash-agent-service 2>&1 | tail -n +2 | awk '{print $1}')

# Required Agent SDK secrets
verify_secret "hotdash-agent-service" "OPENAI_API_KEY" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "LLAMAINDEX_MCP_URL" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "CHATWOOT_BASE_URL" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "CHATWOOT_API_TOKEN" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "CHATWOOT_ACCOUNT_ID" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "SHOPIFY_STORE_DOMAIN" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "SHOPIFY_ADMIN_TOKEN" "$AGENT_SECRETS"
verify_secret "hotdash-agent-service" "PG_URL" "$AGENT_SECRETS"

echo ""

# Check LlamaIndex MCP secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "LlamaIndex MCP (hotdash-llamaindex-mcp) Secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MCP_SECRETS=$(fly secrets list -a hotdash-llamaindex-mcp 2>&1 | tail -n +2 | awk '{print $1}')

verify_secret "hotdash-llamaindex-mcp" "OPENAI_API_KEY" "$MCP_SECRETS"

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verification Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ All required secrets configured${NC}"
    echo ""
    echo "Next steps:"
    echo "  • Run health check: ./scripts/monitoring/health-check.sh"
    exit 0
else
    echo -e "${RED}❌ Missing required secrets${NC}"
    echo ""
    echo "Action required:"
    echo "  • Set missing secrets using: fly secrets set SECRET_NAME=value -a app-name"
    echo "  • Re-run this verification after setting secrets"
    exit 1
fi

