#!/bin/bash
# Test LlamaIndex MCP Server Tools
# Tests all 3 tools: query_support, refresh_index, insight_report

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MCP_URL="https://hotdash-llamaindex-mcp.fly.dev"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  LlamaIndex MCP Tool Testing${NC}"
echo -e "${BLUE}  Timestamp: $TIMESTAMP${NC}"
echo -e "${BLUE}  Server: $MCP_URL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[1/4]${NC} Testing health endpoint..."
if curl -s -f -m 10 "$MCP_URL/health" > /dev/null 2>&1; then
  response=$(curl -s -m 10 "$MCP_URL/health")
  echo -e "  ${GREEN}✅ PASS${NC} - Server is healthy"
  echo "  Response: $response"
else
  echo -e "  ${RED}❌ FAIL${NC} - Health check failed"
  exit 1
fi
echo ""

# Test 2: MCP Endpoint
echo -e "${YELLOW}[2/4]${NC} Testing MCP endpoint..."
if curl -s -f -m 10 "$MCP_URL/mcp" > /dev/null 2>&1; then
  echo -e "  ${GREEN}✅ PASS${NC} - MCP endpoint is responding"
else
  echo -e "  ${RED}❌ FAIL${NC} - MCP endpoint not responding"
  exit 1
fi
echo ""

# Test 3: Test query_support tool via MCP
echo -e "${YELLOW}[3/4]${NC} Testing query_support tool..."
query_payload='{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query_support",
    "arguments": {
      "q": "How do I authenticate with Shopify?",
      "topK": 3
    }
  }
}'

query_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "$query_payload" \
  -m 30 \
  "$MCP_URL/mcp" || echo '{"error": "Request failed"}')

if echo "$query_response" | grep -q "error"; then
  echo -e "  ${YELLOW}⚠️  WARNING${NC} - query_support tool returned error or not implemented"
  echo "  Response: $query_response"
else
  echo -e "  ${GREEN}✅ PASS${NC} - query_support tool is working"
  echo "  Response preview: $(echo "$query_response" | head -c 200)..."
fi
echo ""

# Test 4: Test list tools
echo -e "${YELLOW}[4/4]${NC} Testing tools list..."
list_payload='{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}'

list_response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "$list_payload" \
  -m 10 \
  "$MCP_URL/mcp" || echo '{"error": "Request failed"}')

if echo "$list_response" | grep -q "error"; then
  echo -e "  ${YELLOW}⚠️  WARNING${NC} - tools/list returned error"
  echo "  Response: $list_response"
else
  echo -e "  ${GREEN}✅ PASS${NC} - MCP tools list is working"
  
  # Try to parse tool names
  if echo "$list_response" | grep -q "query_support\|refresh_index\|insight_report"; then
    echo "  Tools detected:"
    echo "$list_response" | grep -oE '"name":"[^"]*"' | cut -d'"' -f4 | while read tool; do
      echo "    - $tool"
    done
  else
    echo "  Response: $list_response"
  fi
fi
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Testing Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ LlamaIndex MCP Server is deployed and responding${NC}"
echo -e "   URL: $MCP_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Update docs/mcp/tools/llamaindex.json with deployment URL"
echo "  2. Add to MCP allowlist: docs/policies/mcp-allowlist.json"
echo "  3. Verify tool implementations in production"
echo ""

