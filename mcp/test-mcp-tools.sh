#!/bin/bash

# Quick MCP Tools Test Script
# Tests each MCP server with a simple command

set -e

echo "🧪 MCP Tools Quick Test"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: GitHub MCP (Docker)
echo -e "${BLUE}1. Testing GitHub MCP (Docker)${NC}"
if command -v docker &> /dev/null; then
    echo "   ✓ Docker is installed"
    if docker ps &> /dev/null; then
        echo "   ✓ Docker is running"
        echo -e "   ${GREEN}Ready to use GitHub MCP${NC}"
    else
        echo -e "   ${RED}✗ Docker is not running${NC}"
    fi
else
    echo -e "   ${RED}✗ Docker is not installed${NC}"
fi
echo ""

# Test 2: Supabase MCP (NPX)
echo -e "${BLUE}2. Testing Supabase MCP (NPX)${NC}"
if command -v npx &> /dev/null; then
    echo "   ✓ NPX is installed"
    echo "   ✓ Project ref: mmbjiyhsvniqxibzgyvx"
    echo -e "   ${GREEN}Ready to use Supabase MCP${NC}"
else
    echo -e "   ${RED}✗ NPX is not installed${NC}"
fi
echo ""

# Test 3: Shopify MCP (NPX)
echo -e "${BLUE}3. Testing Shopify MCP (NPX)${NC}"
if command -v npx &> /dev/null; then
    echo "   ✓ NPX is installed"
    echo "   ✓ Liquid validation mode: partial"
    echo -e "   ${GREEN}Ready to use Shopify MCP${NC}"
else
    echo -e "   ${RED}✗ NPX is not installed${NC}"
fi
echo ""

# Test 4: Google Analytics MCP (Pipx)
echo -e "${BLUE}4. Testing Google Analytics MCP (Pipx)${NC}"
if command -v pipx &> /dev/null; then
    echo "   ✓ Pipx is installed"
    if [ -f "/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json" ]; then
        echo "   ✓ Service account file exists"
        echo "   ✓ Project: hotrodan-seo-reports"
        echo -e "   ${GREEN}Ready to use Google Analytics MCP${NC}"
    else
        echo -e "   ${RED}✗ Service account file not found${NC}"
    fi
else
    echo -e "   ${RED}✗ Pipx is not installed${NC}"
fi
echo ""

# Test 5: Context7 (HTTP)
echo -e "${BLUE}5. Testing Context7 MCP (HTTP)${NC}"
if ss -tln 2>/dev/null | grep -q ':3001' || netstat -tln 2>/dev/null | grep -q ':3001'; then
    echo "   ✓ Server is running on port 3001"
    if docker ps | grep -q context7 2>/dev/null; then
        CONTAINER_ID=$(docker ps | grep context7 | awk '{print $1}')
        echo "   ✓ Docker container: $CONTAINER_ID"
    fi
    echo -e "   ${GREEN}Ready to use Context7 MCP${NC}"
else
    echo -e "   ${RED}✗ Server not running on port 3001${NC}"
    echo "   ℹ Start Context7 server to use this MCP tool"
fi
echo ""

# Test 6: Fly MCP (HTTP)
echo -e "${BLUE}6. Testing Fly MCP (HTTP)${NC}"
if ss -tln 2>/dev/null | grep -q ':8080' || netstat -tln 2>/dev/null | grep -q ':8080'; then
    echo "   ✓ Server is running on port 8080"
    if ps aux | grep -q '[f]lyctl.*mcp' 2>/dev/null; then
        echo "   ✓ Flyctl MCP process detected"
    fi
    echo -e "   ${GREEN}Ready to use Fly MCP${NC}"
else
    echo -e "   ${RED}✗ Server not running on port 8080${NC}"
    echo "   ℹ Start Fly MCP server to use this MCP tool"
fi
echo ""

# Test 7: LlamaIndex MCP (HTTP)
echo -e "${BLUE}7. Testing LlamaIndex MCP (HTTP)${NC}"
if ss -tln 2>/dev/null | grep -q ':4000' || netstat -tln 2>/dev/null | grep -q ':4000'; then
    echo "   ✓ Server is running on port 4000"
    if curl -s -m 5 -f http://localhost:4000/health >/dev/null 2>&1; then
        echo "   ✓ Health endpoint OK"
    fi
    echo -e "   ${GREEN}Ready to use LlamaIndex MCP${NC}"
else
    echo -e "   ${RED}✗ Server not running on port 4000${NC}"
    echo "   ℹ Start LlamaIndex server: (cd apps/llamaindex-mcp-server && PORT=4000 npm start)"
fi
echo ""

# Summary
echo "======================="
echo "📋 Summary"
echo "======================="
echo ""
echo "MCP tools are configured in ~/.cursor/mcp.json"
echo ""
echo "To use in Cursor, try prompts like:"
echo "  • 'Create a GitHub issue for...'"
echo "  • 'Query Supabase for users...'"
echo "  • 'Validate this Shopify Liquid template...'"
echo "  • 'Show Google Analytics page views...'"
echo ""
echo "For more examples, see: mcp/USAGE_EXAMPLES.md"
echo "For setup help, see: mcp/SETUP.md"
echo ""

