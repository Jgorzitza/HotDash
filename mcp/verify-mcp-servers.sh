#!/bin/bash

# MCP Servers Verification Script
# This script checks the status of all configured MCP servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MCP Servers Verification${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print test result
print_result() {
    local name=$1
    local status=$2
    local message=$3

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $name: ${GREEN}PASSED${NC} - $message"
        ((PASSED++))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $name: ${RED}FAILED${NC} - $message"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠${NC} $name: ${YELLOW}WARNING${NC} - $message"
        ((WARNINGS++))
    fi
}

# Test 1: Docker (for GitHub MCP)
echo -e "\n${BLUE}[1/6] Testing Docker (GitHub MCP)${NC}"
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        print_result "Docker" "PASS" "Docker is installed and running"

        # Test GitHub MCP server image
        if docker pull ghcr.io/github/github-mcp-server &> /dev/null; then
            print_result "GitHub MCP Image" "PASS" "Image pulled successfully"
        else
            print_result "GitHub MCP Image" "WARN" "Could not pull image (may already exist)"
        fi
    else
        print_result "Docker" "FAIL" "Docker is installed but not running"
    fi
else
    print_result "Docker" "FAIL" "Docker is not installed"
fi

# Test 2: Node.js and NPX (for Supabase and Shopify)
echo -e "\n${BLUE}[2/6] Testing Node.js and NPX${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_result "Node.js" "PASS" "Version $NODE_VERSION"

    if command -v npx &> /dev/null; then
        NPX_VERSION=$(npx --version)
        print_result "NPX" "PASS" "Version $NPX_VERSION"
    else
        print_result "NPX" "FAIL" "NPX is not installed"
    fi
else
    print_result "Node.js" "FAIL" "Node.js is not installed"
    print_result "NPX" "FAIL" "Cannot test NPX without Node.js"
fi

# Test 3: Python and Pipx (for Google Analytics)
echo -e "\n${BLUE}[3/6] Testing Python and Pipx${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_result "Python" "PASS" "$PYTHON_VERSION"

    if command -v pipx &> /dev/null; then
        PIPX_VERSION=$(pipx --version)
        print_result "Pipx" "PASS" "Version $PIPX_VERSION"
    else
        print_result "Pipx" "FAIL" "Pipx is not installed"
    fi
else
    print_result "Python" "FAIL" "Python3 is not installed"
    print_result "Pipx" "FAIL" "Cannot test Pipx without Python"
fi

# Test 4: Context7 HTTP Server
echo -e "\n${BLUE}[4/6] Testing Context7 HTTP Server${NC}"
if curl -s -f -m 5 http://localhost:3001/mcp &> /dev/null; then
    print_result "Context7" "PASS" "Server is running on port 3001"
elif curl -s -f -m 5 http://localhost:3001 &> /dev/null; then
    print_result "Context7" "WARN" "Server running but /mcp endpoint not found"
else
    print_result "Context7" "FAIL" "Server is not running on port 3001"
fi

# Test 5: Fly MCP HTTP Server
echo -e "\n${BLUE}[5/6] Testing Fly MCP HTTP Server${NC}"
if curl -s -f -m 5 http://127.0.0.1:8080/mcp &> /dev/null; then
    print_result "Fly MCP" "PASS" "Server is running on port 8080"
elif curl -s -f -m 5 http://127.0.0.1:8080 &> /dev/null; then
    print_result "Fly MCP" "WARN" "Server running but /mcp endpoint not found"
else
    print_result "Fly MCP" "FAIL" "Server is not running on port 8080"
fi

# Test 6: LlamaIndex HTTP Server
echo -e "\n${BLUE}[6/7] Testing LlamaIndex HTTP Server${NC}"
if curl -s -f -m 5 http://localhost:4000/health &> /dev/null; then
    print_result "LlamaIndex MCP" "PASS" "Health endpoint OK on port 4000"
elif curl -s -f -m 5 http://localhost:4000/mcp &> /dev/null; then
    print_result "LlamaIndex MCP" "PASS" "MCP endpoint OK on port 4000"
elif curl -s -f -m 5 http://localhost:4000 &> /dev/null; then
    print_result "LlamaIndex MCP" "WARN" "Server running but MCP/health endpoints not found"
else
    print_result "LlamaIndex MCP" "FAIL" "Server is not running on port 4000"
fi

# Test 7: Credentials and Configuration Files
echo -e "\n${BLUE}[7/7] Testing Credentials and Configuration${NC}"

# Check Google Analytics service account
GA_CREDS="/home/justin/HotDash/hot-dash/vault/occ/google/analytics-service-account.json"
if [ -f "$GA_CREDS" ]; then
    if [ -r "$GA_CREDS" ]; then
        print_result "Google Analytics Credentials" "PASS" "Service account file exists and is readable"
    else
        print_result "Google Analytics Credentials" "FAIL" "Service account file exists but is not readable"
    fi
else
    print_result "Google Analytics Credentials" "FAIL" "Service account file not found"
fi

# Check Cursor MCP config
CURSOR_CONFIG="$HOME/.cursor/mcp.json"
if [ -f "$CURSOR_CONFIG" ]; then
    print_result "Cursor MCP Config" "PASS" "Configuration file exists"
else
    print_result "Cursor MCP Config" "WARN" "Configuration file not found at $CURSOR_CONFIG"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All critical tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi

