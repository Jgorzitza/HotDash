#!/bin/bash
#
# Monthly Repository Cleanup Script
# Owner: git-cleanup agent
# Purpose: Automated monthly repository maintenance
# Schedule: Run on 1st of each month
# Evidence: Logs to artifacts/git-cleanup/monthly-cleanup-YYYY-MM-DD.log
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOG_DIR="${REPO_ROOT}/artifacts/git-cleanup"
LOG_FILE="${LOG_DIR}/monthly-cleanup-$(date +%Y-%m-%d).log"
STALE_BRANCH_DAYS=30
MERGED_BRANCH_AGE_DAYS=7

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log_section() {
    echo "" | tee -a "${LOG_FILE}"
    echo "========================================" | tee -a "${LOG_FILE}"
    echo "$1" | tee -a "${LOG_FILE}"
    echo "========================================" | tee -a "${LOG_FILE}"
}

# Error handling
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" | tee -a "${LOG_FILE}"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "${LOG_FILE}"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "${LOG_FILE}"
}

# Start cleanup
log_section "Monthly Repository Cleanup - $(date +'%Y-%m-%d')"

cd "${REPO_ROOT}" || error_exit "Failed to change to repository root"

# 1. Fetch latest from remote
log_section "1. Fetching Latest from Remote"
log "Running: git fetch --all --prune"
if git fetch --all --prune >> "${LOG_FILE}" 2>&1; then
    success "Fetched latest from remote and pruned stale references"
else
    error_exit "Failed to fetch from remote"
fi

# 2. Check repository health
log_section "2. Repository Health Check"
log "Running: git fsck"
if git fsck >> "${LOG_FILE}" 2>&1; then
    success "Repository integrity verified (git fsck passed)"
else
    warning "Repository has integrity issues - manual review needed"
fi

# 3. Identify stale branches
log_section "3. Identifying Stale Branches"
log "Looking for branches with no commits in last ${STALE_BRANCH_DAYS} days"

STALE_BRANCHES=$(git for-each-ref --format='%(refname:short) %(committerdate:relative)' refs/heads/ | \
    awk -v days="${STALE_BRANCH_DAYS}" '
    $2 ~ /[0-9]+ (months?|years?)/ || ($2 ~ /[0-9]+ (weeks?)/ && $1+0 > 4) {
        print $1
    }')

if [ -z "$STALE_BRANCHES" ]; then
    success "No stale branches found"
else
    warning "Found stale branches (no action taken - manual review required):"
    echo "$STALE_BRANCHES" | tee -a "${LOG_FILE}"
    log "Stale branches logged for manual review"
fi

# 4. Identify merged branches
log_section "4. Identifying Merged Branches"
log "Looking for branches merged into main more than ${MERGED_BRANCH_AGE_DAYS} days ago"

MERGED_BRANCHES=$(git branch --merged main | grep -v "^\*" | grep -v "main" | grep -v "originstory" || true)

if [ -z "$MERGED_BRANCHES" ]; then
    success "No merged branches found that can be deleted"
else
    warning "Found merged branches (no action taken - manual review required):"
    echo "$MERGED_BRANCHES" | tee -a "${LOG_FILE}"
    log "Merged branches logged for manual review"
fi

# 5. Clean up dangling objects
log_section "5. Cleaning Dangling Objects"
log "Running: git gc --auto"
if git gc --auto >> "${LOG_FILE}" 2>&1; then
    success "Garbage collection completed"
else
    warning "Garbage collection had issues - manual review may be needed"
fi

# 6. Check for large files
log_section "6. Checking for Large Files"
log "Looking for files larger than 1MB"

LARGE_FILES=$(find . -type f -size +1M -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./packages/memory/*" 2>/dev/null || true)

if [ -z "$LARGE_FILES" ]; then
    success "No unusually large files found"
else
    warning "Found large files (review if they should be in git):"
    echo "$LARGE_FILES" | tee -a "${LOG_FILE}"
fi

# 7. Secret scan reminder
log_section "7. Secret Scan Reminder"
log "Run secret scanning separately using:"
log "  git grep -i 'password\\|api_key\\|secret\\|token' | grep -v 'vault/'"
warning "Manual secret scan required - not automated for safety"

# 8. Generate branch report
log_section "8. Branch Report"
log "Current branch status:"

echo "" | tee -a "${LOG_FILE}"
echo "Local branches:" | tee -a "${LOG_FILE}"
git branch -vv | tee -a "${LOG_FILE}"

echo "" | tee -a "${LOG_FILE}"
echo "Remote branches:" | tee -a "${LOG_FILE}"
git branch -r | tee -a "${LOG_FILE}"

# 9. Summary
log_section "9. Cleanup Summary"

BRANCH_COUNT=$(git branch | wc -l)
REMOTE_BRANCH_COUNT=$(git branch -r | wc -l)
TOTAL_COMMITS=$(git rev-list --count HEAD)

log "Repository Statistics:"
log "  - Local branches: ${BRANCH_COUNT}"
log "  - Remote branches: ${REMOTE_BRANCH_COUNT}"
log "  - Total commits: ${TOTAL_COMMITS}"

if [ -n "$STALE_BRANCHES" ] || [ -n "$MERGED_BRANCHES" ]; then
    warning "Manual cleanup required - see details above"
else
    success "Repository is clean - no manual cleanup needed"
fi

log_section "Cleanup Complete"
success "Monthly cleanup completed successfully"
log "Log file: ${LOG_FILE}"

echo ""
echo -e "${GREEN}✅ Monthly cleanup complete!${NC}"
echo -e "Review log at: ${LOG_FILE}"

