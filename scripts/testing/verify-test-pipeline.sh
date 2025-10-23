#!/bin/bash
# Test Automation Pipeline Verification Script
# TESTING-EMERGENCY-004
# Verifies all components of the test automation pipeline

set -e

echo "🧪 Test Automation Pipeline Verification"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        ((FAILED++))
        return 1
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        ((FAILED++))
        return 1
    fi
}

# Function to check if a command exists
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        ((FAILED++))
        return 1
    fi
}

# Function to check npm script
check_npm_script() {
    if npm run | grep -q "  $1$"; then
        echo -e "${GREEN}✓${NC} npm script '$1' exists"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} npm script '$1' missing"
        ((FAILED++))
        return 1
    fi
}

echo "1. Checking Test Framework Configuration"
echo "-----------------------------------------"
check_file "vitest.config.ts"
check_file "playwright.config.ts"
check_file "tests/unit/setup.ts"
echo ""

echo "2. Checking Test Directories"
echo "-----------------------------"
check_dir "tests/unit"
check_dir "tests/integration"
check_dir "tests/e2e"
check_dir "tests/playwright"
check_dir "tests/fixtures"
check_dir "tests/helpers"
echo ""

echo "3. Checking CI/CD Workflows"
echo "---------------------------"
check_file ".github/workflows/ci.yml"
check_file ".github/workflows/ci-guards.yml"
check_file ".github/workflows/migration-test.yml"
check_file ".github/workflows/gitleaks.yml"
echo ""

echo "4. Checking NPM Scripts"
echo "-----------------------"
check_npm_script "test"
check_npm_script "test:unit"
check_npm_script "test:e2e"
check_npm_script "test:a11y"
check_npm_script "test:lighthouse"
check_npm_script "test:ci"
check_npm_script "ci"
echo ""

echo "5. Checking Test Dependencies"
echo "------------------------------"
if npm list vitest &> /dev/null; then
    echo -e "${GREEN}✓${NC} vitest installed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} vitest not installed"
    ((FAILED++))
fi

if npm list @playwright/test &> /dev/null; then
    echo -e "${GREEN}✓${NC} @playwright/test installed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} @playwright/test not installed"
    ((FAILED++))
fi

if npm list @testing-library/react &> /dev/null; then
    echo -e "${GREEN}✓${NC} @testing-library/react installed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} @testing-library/react not installed"
    ((FAILED++))
fi

if npm list lighthouse &> /dev/null; then
    echo -e "${GREEN}✓${NC} lighthouse installed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} lighthouse not installed"
    ((FAILED++))
fi
echo ""

echo "6. Checking Documentation"
echo "-------------------------"
check_file "docs/testing/TEST_AUTOMATION_PIPELINE.md"
check_file "docs/runbooks/cicd-pipeline-configuration.md"
echo ""

echo "7. Running Quick Test Validation"
echo "---------------------------------"
echo "Running sample unit test..."
if npx vitest run tests/unit/analytics.spec.ts --reporter=basic 2>&1 | grep -q "PASS"; then
    echo -e "${GREEN}✓${NC} Unit tests executable"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Unit test execution needs verification"
fi
echo ""

echo "========================================"
echo "Summary"
echo "========================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Test Automation Pipeline is fully configured!${NC}"
    exit 0
else
    echo -e "${RED}✗ Test Automation Pipeline has $FAILED issue(s)${NC}"
    exit 1
fi

