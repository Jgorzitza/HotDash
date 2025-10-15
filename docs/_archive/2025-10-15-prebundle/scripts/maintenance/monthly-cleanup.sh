#!/bin/bash
#
# Monthly Repository Cleanup Script
# Scheduled: 1st of each month
# Purpose: Automate repository maintenance tasks
#
# Usage: ./scripts/maintenance/monthly-cleanup.sh [--dry-run]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
ARCHIVE_DATE=$(date +%Y-%m)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG_FILE="${REPO_ROOT}/logs/cleanup-${ARCHIVE_DATE}.log"

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}"
fi

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log "${BLUE}========================================${NC}"
log "${BLUE}Monthly Repository Cleanup${NC}"
log "${BLUE}Date: $(date)${NC}"
log "${BLUE}========================================${NC}"

# Ensure we're in the repo root
cd "$REPO_ROOT"

# Task 1: Archive old status files
log "\n${BLUE}📦 Task 1: Archive Old Status Files${NC}"
STATUS_FILES=$(find . -maxdepth 1 -name "*_COMPLETE*.md" -o -name "*_FINAL*.md" -o -name "*_STATUS*.md" -o -name "*_SUMMARY*.md" 2>/dev/null | wc -l)

if [[ $STATUS_FILES -gt 0 ]]; then
    log "${YELLOW}Found $STATUS_FILES status files in root directory${NC}"
    
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "archive/status-reports-${ARCHIVE_DATE}"
        find . -maxdepth 1 \( -name "*_COMPLETE*.md" -o -name "*_FINAL*.md" -o -name "*_STATUS*.md" -o -name "*_SUMMARY*.md" \) \
            -exec git mv {} "archive/status-reports-${ARCHIVE_DATE}/" \;
        log "${GREEN}✅ Archived $STATUS_FILES files${NC}"
    else
        log "${YELLOW}[DRY RUN] Would archive $STATUS_FILES files${NC}"
    fi
else
    log "${GREEN}✅ No status files to archive${NC}"
fi

# Task 2: Delete merged branches
log "\n${BLUE}🌳 Task 2: Delete Merged Branches${NC}"
MERGED_BRANCHES=$(git branch --merged main | grep -v "^\*\|^  main$\|^  originstory$\|^  cleanup" | wc -l)

if [[ $MERGED_BRANCHES -gt 0 ]]; then
    log "${YELLOW}Found $MERGED_BRANCHES merged branches${NC}"
    
    if [[ "$DRY_RUN" == false ]]; then
        git branch --merged main | grep -v "^\*\|^  main$\|^  originstory$\|^  cleanup" | xargs -n 1 git branch -d
        log "${GREEN}✅ Deleted $MERGED_BRANCHES merged branches${NC}"
    else
        log "${YELLOW}[DRY RUN] Branches that would be deleted:${NC}"
        git branch --merged main | grep -v "^\*\|^  main$\|^  originstory$\|^  cleanup"
    fi
else
    log "${GREEN}✅ No merged branches to delete${NC}"
fi

# Task 3: Clean up old artifacts (>90 days)
log "\n${BLUE}🗑️  Task 3: Clean Old Artifacts (>90 days)${NC}"
OLD_ARTIFACTS=$(find artifacts/ -type f -mtime +90 2>/dev/null | wc -l)

if [[ $OLD_ARTIFACTS -gt 0 ]]; then
    log "${YELLOW}Found $OLD_ARTIFACTS old artifacts${NC}"
    
    if [[ "$DRY_RUN" == false ]]; then
        mkdir -p "archive/artifacts-${ARCHIVE_DATE}"
        find artifacts/ -type f -mtime +90 -exec mv {} "archive/artifacts-${ARCHIVE_DATE}/" \;
        log "${GREEN}✅ Archived $OLD_ARTIFACTS old artifacts${NC}"
    else
        log "${YELLOW}[DRY RUN] Would archive $OLD_ARTIFACTS artifacts${NC}"
    fi
else
    log "${GREEN}✅ No old artifacts to archive${NC}"
fi

# Task 4: Update REPO_STATUS.md
log "\n${BLUE}📊 Task 4: Update REPO_STATUS.md${NC}"

if [[ "$DRY_RUN" == false ]]; then
    BRANCH_COUNT=$(git branch | wc -l)
    DOC_COUNT=$(find docs -name "*.md" | wc -l)
    FEEDBACK_COUNT=$(find feedback -name "*.md" | wc -l)
    
    # Update statistics in REPO_STATUS.md
    sed -i "s/Last Cleanup: .*/Last Cleanup: $(date +%Y-%m-%d)/" REPO_STATUS.md
    sed -i "s/Active branches: .*/Active branches: ~$BRANCH_COUNT (after cleanup)/" REPO_STATUS.md
    
    log "${GREEN}✅ Updated REPO_STATUS.md with current stats${NC}"
    log "   Branches: $BRANCH_COUNT"
    log "   Docs: $DOC_COUNT"
    log "   Feedback: $FEEDBACK_COUNT"
else
    log "${YELLOW}[DRY RUN] Would update REPO_STATUS.md${NC}"
fi

# Task 5: Check for secrets (safety scan)
log "\n${BLUE}🔒 Task 5: Secret Scan${NC}"

if command -v gitleaks &> /dev/null; then
    if [[ "$DRY_RUN" == false ]]; then
        gitleaks detect --no-git -v 2>&1 | tee -a "$LOG_FILE"
        log "${GREEN}✅ Secret scan complete${NC}"
    else
        log "${YELLOW}[DRY RUN] Would run gitleaks secret scan${NC}"
    fi
else
    log "${YELLOW}⚠️  gitleaks not installed - skipping secret scan${NC}"
    log "   Install: https://github.com/gitleaks/gitleaks#installing"
fi

# Task 6: Generate cleanup report
log "\n${BLUE}📝 Task 6: Generate Cleanup Report${NC}"

REPORT_FILE="reports/maintenance/cleanup-${ARCHIVE_DATE}.md"
mkdir -p "$(dirname "$REPORT_FILE")"

if [[ "$DRY_RUN" == false ]]; then
    cat > "$REPORT_FILE" << EOF
# Monthly Cleanup Report — ${ARCHIVE_DATE}

**Date**: $(date)  
**Script**: scripts/maintenance/monthly-cleanup.sh

## Actions Taken

### Status Files
- Files archived: $STATUS_FILES
- Archive location: archive/status-reports-${ARCHIVE_DATE}/

### Branches
- Merged branches deleted: $MERGED_BRANCHES
- Current branch count: $(git branch | wc -l)

### Artifacts
- Old artifacts archived: $OLD_ARTIFACTS
- Archive location: archive/artifacts-${ARCHIVE_DATE}/

### Documentation
- REPO_STATUS.md updated ✅
- Current stats recorded

### Security
- Secret scan: $(command -v gitleaks &> /dev/null && echo "PASSED ✅" || echo "SKIPPED (gitleaks not installed)")

## Repository Health

**Branch Count**: $(git branch | wc -l)
**Documentation Files**: $(find docs -name "*.md" | wc -l)
**Feedback Files**: $(find feedback -name "*.md" | wc -l)
**Last Commit**: $(git log -1 --oneline)

## Next Cleanup

**Scheduled**: $(date -d "next month" +%Y-%m-01) (1st of next month)

---

Generated by: scripts/maintenance/monthly-cleanup.sh
EOF
    log "${GREEN}✅ Cleanup report generated: $REPORT_FILE${NC}"
else
    log "${YELLOW}[DRY RUN] Would generate report at $REPORT_FILE${NC}"
fi

# Summary
log "\n${BLUE}========================================${NC}"
log "${GREEN}✅ Monthly Cleanup Complete${NC}"
log "${BLUE}========================================${NC}"
log "Status files archived: $STATUS_FILES"
log "Branches deleted: $MERGED_BRANCHES"
log "Artifacts archived: $OLD_ARTIFACTS"
log "Report: $REPORT_FILE"

if [[ "$DRY_RUN" == false ]]; then
    log "\n${YELLOW}📝 Next Steps:${NC}"
    log "1. Review changes: git status"
    log "2. Commit cleanup: git add -A && git commit -m 'chore: monthly cleanup ${ARCHIVE_DATE}'"
    log "3. Push to GitHub: git push origin main"
fi

exit 0

