#!/bin/bash
# Secret Scanner - Automated secret detection for CI/CD
# Usage: ./scripts/security/scan-secrets.sh
# Exit code: 0 = clean, 1 = secrets found

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Scanning for secrets..."

# Load whitelist if exists
WHITELIST_FILE="scripts/security/secret-whitelist.txt"
if [ -f "$WHITELIST_FILE" ]; then
  echo "📋 Loading whitelist from $WHITELIST_FILE"
fi

# Secret patterns to detect
declare -a patterns=(
  "api[_-]?key"
  "api[_-]?secret"
  "service[_-]?account"
  "private[_-]?key"
  "password"
  "token"
  "sk_live"
  "sk_test"
  "ghp_"
  "gho_"
  "github_pat_"
  "glpat-"
  "AKIA"
  "-----BEGIN.*PRIVATE KEY-----"
  "bearer.*['\"]?[a-zA-Z0-9_\-\.]{20,}['\"]?"
)

# Directories to exclude
EXCLUDE_DIRS=(
  "node_modules"
  ".git"
  "dist"
  "build"
  ".next"
  "coverage"
  ".turbo"
  ".vercel"
)

# Build exclude args for grep
EXCLUDE_ARGS=""
for dir in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$dir"
done

# Track violations
violations_found=0
violation_details=""

# Scan for each pattern
for pattern in "${patterns[@]}"; do
  # Skip if in whitelist
  if [ -f "$WHITELIST_FILE" ] && grep -qF "$pattern" "$WHITELIST_FILE" 2>/dev/null; then
    echo "  ⏭️  Skipping whitelisted pattern: $pattern"
    continue
  fi
  
  # Search for pattern
  matches=$(grep -r -i -n "$pattern" $EXCLUDE_ARGS . 2>/dev/null || true)
  
  if [ -n "$matches" ]; then
    # Filter out false positives from whitelist
    if [ -f "$WHITELIST_FILE" ]; then
      filtered_matches=""
      while IFS= read -r line; do
        is_whitelisted=false
        while IFS= read -r whitelist_entry; do
          if echo "$line" | grep -qF "$whitelist_entry"; then
            is_whitelisted=true
            break
          fi
        done < "$WHITELIST_FILE"
        
        if [ "$is_whitelisted" = false ]; then
          filtered_matches="${filtered_matches}${line}\n"
        fi
      done <<< "$matches"
      matches="$filtered_matches"
    fi
    
    if [ -n "$matches" ]; then
      violations_found=$((violations_found + 1))
      violation_details="${violation_details}\n${RED}🚨 Pattern found: ${pattern}${NC}\n${matches}\n"
    fi
  fi
done

# Report results
echo ""
echo "============================================"
if [ $violations_found -eq 0 ]; then
  echo -e "${GREEN}✅ No secrets detected - scan passed!${NC}"
  echo "============================================"
  exit 0
else
  echo -e "${RED}❌ SECRETS DETECTED - Scan failed!${NC}"
  echo "============================================"
  echo -e "$violation_details"
  echo ""
  echo -e "${YELLOW}📝 To whitelist false positives, add them to:${NC}"
  echo "   $WHITELIST_FILE"
  echo ""
  echo -e "${YELLOW}⚠️  NEVER commit real secrets. Use environment variables instead.${NC}"
  echo "============================================"
  exit 1
fi

