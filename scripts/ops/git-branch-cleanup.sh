#!/bin/bash
# Git Branch Cleanup Automation
# Created: 2025-10-12 by Git Cleanup Agent
# Purpose: Automated cleanup of merged and stale branches
# Usage: ./scripts/ops/git-branch-cleanup.sh [--dry-run]

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No changes will be made"
fi

echo "=== Git Branch Cleanup Automation ==="
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Standard branch format
STANDARD_PATTERN="^(compliance|data|engineer|git-cleanup|integrations|localization|marketing)/work$"

# Special branches to never delete
PROTECTED_BRANCHES="main|originstory|backup/.*"

echo "📊 Current Repository State:"
TOTAL_LOCAL=$(git branch | wc -l)
TOTAL_REMOTE=$(git branch -r | grep -v HEAD | wc -l)
echo "- Local branches: $TOTAL_LOCAL"
echo "- Remote branches: $TOTAL_REMOTE"
echo ""

# Function to check if branch is compliant
is_compliant() {
    local branch=$1
    if echo "$branch" | grep -E "$STANDARD_PATTERN" > /dev/null; then
        return 0
    fi
    if echo "$branch" | grep -E "$PROTECTED_BRANCHES" > /dev/null; then
        return 0
    fi
    return 1
}

# Clean local branches that are merged into main
echo "🔍 Checking for merged branches..."
MERGED_BRANCHES=$(git branch --merged main | grep -v "^\*" | grep -v "main" | sed 's/^[ *]*//' || true)

if [ -n "$MERGED_BRANCHES" ]; then
    echo "Found merged branches:"
    echo "$MERGED_BRANCHES" | while read branch; do
        if is_compliant "$branch"; then
            echo "  ✅ $branch (compliant, keeping)"
        else
            echo "  ❌ $branch (non-compliant, will delete)"
            if [ "$DRY_RUN" = false ]; then
                git branch -d "$branch" 2>&1 | grep -E "Deleted|error" || true
            fi
        fi
    done
else
    echo "  ✅ No merged branches to clean"
fi
echo ""

# Check for stale branches (no commits in 30 days)
echo "🔍 Checking for stale branches (>30 days inactive)..."
STALE_COUNT=0

git for-each-ref --format='%(refname:short) %(committerdate:relative)' refs/heads/ | while read branch date rest; do
    # Skip current branch and protected branches
    if [ "$branch" = "$(git branch --show-current)" ]; then
        continue
    fi
    
    if echo "$branch" | grep -E "$PROTECTED_BRANCHES" > /dev/null; then
        continue
    fi
    
    # Check if branch hasn't been updated in 30 days
    DAYS_OLD=$(git log -1 --format=%ar "$branch" 2>/dev/null || echo "unknown")
    
    if echo "$DAYS_OLD" | grep -E "(month|year)" > /dev/null; then
        if is_compliant "$branch"; then
            echo "  ⚠️  $branch (stale: $DAYS_OLD, but compliant)"
        else
            echo "  ❌ $branch (stale: $DAYS_OLD, non-compliant)"
            STALE_COUNT=$((STALE_COUNT + 1))
            
            if [ "$DRY_RUN" = false ]; then
                echo "     Consider manual review before deletion"
            fi
        fi
    fi
done

if [ $STALE_COUNT -eq 0 ]; then
    echo "  ✅ No stale branches found"
fi
echo ""

# Check for non-standard branches
echo "🔍 Checking for non-standard branch names..."
NON_STANDARD_COUNT=0

git branch | sed 's/^[ *]*//' | while read branch; do
    if ! is_compliant "$branch"; then
        echo "  ❌ $branch (does not follow {agent}/work format)"
        NON_STANDARD_COUNT=$((NON_STANDARD_COUNT + 1))
    fi
done

if [ $NON_STANDARD_COUNT -eq 0 ]; then
    echo "  ✅ All branches follow standard format"
fi
echo ""

# Clean remote tracking branches that no longer exist
echo "🔍 Cleaning remote tracking branches..."
if [ "$DRY_RUN" = false ]; then
    git fetch --prune
    echo "  ✅ Pruned stale remote tracking branches"
else
    echo "  🔍 Would prune stale remote tracking branches"
fi
echo ""

# Summary
echo "📋 Cleanup Summary:"
FINAL_LOCAL=$(git branch | wc -l)
FINAL_REMOTE=$(git branch -r | grep -v HEAD | wc -l)
COMPLIANT=$(git branch | sed 's/^[ *]*//' | grep -E "$STANDARD_PATTERN" | wc -l)

echo "- Local branches: $FINAL_LOCAL"
echo "- Remote branches: $FINAL_REMOTE"
echo "- Compliant branches: $COMPLIANT"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN COMPLETE - No changes made"
    echo "Run without --dry-run to apply changes"
else
    echo "✅ CLEANUP COMPLETE"
fi

# Log to file
LOG_DIR="artifacts/git-cleanup"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/cleanup-$(date -u +"%Y%m%dT%H%M%SZ").log"

{
    echo "=== Git Branch Cleanup Log ==="
    echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo "Mode: $([ "$DRY_RUN" = true ] && echo "DRY RUN" || echo "LIVE")"
    echo ""
    echo "Before: $TOTAL_LOCAL local, $TOTAL_REMOTE remote"
    echo "After: $FINAL_LOCAL local, $FINAL_REMOTE remote"
    echo "Compliant: $COMPLIANT branches"
    echo ""
    echo "Cleaned: $((TOTAL_LOCAL - FINAL_LOCAL)) local branches"
} > "$LOG_FILE"

echo ""
echo "📝 Log saved to: $LOG_FILE"

