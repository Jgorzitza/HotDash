#!/bin/bash
# MCP Server Health Check Dashboard
# Tests all 7 MCP servers for connectivity and response times
# Usage: ./scripts/ops/mcp-health-check.sh [--json]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Output format flag
OUTPUT_JSON=false
if [[ "${1:-}" == "--json" ]]; then
  OUTPUT_JSON=true
fi

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Results array for JSON output
declare -a RESULTS=()

# Function to test HTTP endpoint
test_http_endpoint() {
  local name="$1"
  local url="$2"
  local start_time=$(date +%s%N)
  
  if curl -s -f -m 5 "$url" > /dev/null 2>&1; then
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to ms
    echo "PASS|$duration"
  else
    echo "FAIL|0"
  fi
}

# Function to test Docker container
test_docker_container() {
  local name="$1"
  local container="$2"
  
  if docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
    echo "PASS|0"
  else
    echo "FAIL|0"
  fi
}

# Function to test npm package availability
test_npm_package() {
  local name="$1"
  local package="$2"
  local start_time=$(date +%s%N)
  
  if npx -y "$package" --help > /dev/null 2>&1; then
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    echo "PASS|$duration"
  else
    echo "FAIL|0"
  fi
}

# Function to add result
add_result() {
  local name="$1"
  local status="$2"
  local response_time="$3"
  local type="$4"
  local notes="$5"
  
  if $OUTPUT_JSON; then
    RESULTS+=("{\"name\":\"$name\",\"status\":\"$status\",\"response_time_ms\":$response_time,\"type\":\"$type\",\"notes\":\"$notes\"}")
  else
    if [[ "$status" == "PASS" ]]; then
      echo -e "  ${GREEN}✅ PASS${NC} - ${response_time}ms - $notes"
    else
      echo -e "  ${RED}❌ FAIL${NC} - $notes"
    fi
  fi
}

# Print header
if ! $OUTPUT_JSON; then
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  MCP Server Health Check Dashboard${NC}"
  echo -e "${BLUE}  Timestamp: $TIMESTAMP${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo ""
fi

# Test 1: Shopify Dev MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[1/7]${NC} Testing Shopify Dev MCP..."
fi
result=$(test_npm_package "shopify" "@shopify/dev-mcp@latest" || echo "FAIL|0")
status=$(echo "$result" | cut -d'|' -f1)
time=$(echo "$result" | cut -d'|' -f2)
add_result "shopify" "$status" "$time" "npm" "Official Shopify API documentation"

# Test 2: Context7 MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[2/7]${NC} Testing Context7 MCP..."
fi
result=$(test_http_endpoint "context7" "http://localhost:3001/mcp" || echo "FAIL|0")
status=$(echo "$result" | cut -d'|' -f1)
time=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "FAIL" ]]; then
  result=$(test_docker_container "context7" "context7-mcp" || echo "FAIL|0")
  status=$(echo "$result" | cut -d'|' -f1)
  notes="Docker container not running - run ./scripts/ops/start-context7.sh"
else
  notes="Codebase semantic search"
fi
add_result "context7" "$status" "$time" "http" "$notes"

# Test 3: GitHub MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[3/7]${NC} Testing GitHub MCP..."
fi
# GitHub MCP runs via Docker on demand, check if Docker is available
if docker info > /dev/null 2>&1; then
  status="PASS"
  time="0"
  notes="Docker available, MCP runs on-demand"
else
  status="FAIL"
  time="0"
  notes="Docker not available"
fi
add_result "github-official" "$status" "$time" "docker" "$notes"

# Test 4: Supabase MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[4/7]${NC} Testing Supabase MCP..."
fi
result=$(test_npm_package "supabase" "@supabase/mcp-server-supabase" || echo "FAIL|0")
status=$(echo "$result" | cut -d'|' -f1)
time=$(echo "$result" | cut -d'|' -f2)
add_result "supabase" "$status" "$time" "npm" "Database management and migrations"

# Test 5: Fly.io MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[5/7]${NC} Testing Fly.io MCP..."
fi
result=$(test_http_endpoint "fly" "http://127.0.0.1:8080/mcp" || echo "FAIL|0")
status=$(echo "$result" | cut -d'|' -f1)
time=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "FAIL" ]]; then
  notes="HTTP server not running (optional)"
else
  notes="Deployment and infrastructure management"
fi
add_result "fly" "$status" "$time" "http" "$notes"

# Test 6: Google Analytics MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[6/7]${NC} Testing Google Analytics MCP..."
fi
# Check if pipx is available and analytics-mcp can be found
if command -v pipx > /dev/null 2>&1; then
  if pipx list 2>/dev/null | grep -q "analytics-mcp" || pipx run --help analytics-mcp > /dev/null 2>&1; then
    status="PASS"
    time="0"
    notes="Dev tools only - not used in app"
  else
    status="FAIL"
    time="0"
    notes="pipx package not installed"
  fi
else
  status="FAIL"
  time="0"
  notes="pipx not available"
fi
add_result "google-analytics" "$status" "$time" "pipx" "$notes"

# Test 7: LlamaIndex RAG MCP
if ! $OUTPUT_JSON; then
  echo -e "${YELLOW}[7/7]${NC} Testing LlamaIndex RAG MCP..."
fi
result=$(test_http_endpoint "llamaindex-rag" "https://hotdash-llamaindex-mcp.fly.dev/health" || echo "FAIL|0")
status=$(echo "$result" | cut -d'|' -f1)
time=$(echo "$result" | cut -d'|' -f2)
if [[ "$status" == "FAIL" ]]; then
  notes="Deployed service not responding"
else
  notes="Knowledge base queries and support insights"
fi
add_result "llamaindex-rag" "$status" "$time" "http" "$notes"

# Print summary
if $OUTPUT_JSON; then
  echo "{"
  echo "  \"timestamp\": \"$TIMESTAMP\","
  echo "  \"total_servers\": 7,"
  echo "  \"results\": ["
  echo "    ${RESULTS[0]}"
  for i in "${!RESULTS[@]}"; do
    if [[ $i -gt 0 ]]; then
      echo "    ,${RESULTS[$i]}"
    fi
  done
  echo "  ]"
  echo "}"
else
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Health Check Complete${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  
  # Count passing/failing
  passing=0
  failing=0
  for result in "${RESULTS[@]}"; do
    if echo "$result" | grep -q '"status":"PASS"'; then
      ((passing++))
    else
      ((failing++))
    fi
  done
  
  echo ""
  echo -e "  Total Servers: 7"
  echo -e "  ${GREEN}Passing: $passing${NC}"
  echo -e "  ${RED}Failing: $failing${NC}"
  echo ""
  
  if [[ $failing -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  Some MCP servers are not available${NC}"
    echo -e "${YELLOW}   This may impact certain AI agent capabilities${NC}"
    echo ""
  else
    echo -e "${GREEN}✅ All MCP servers are healthy${NC}"
    echo ""
  fi
fi
