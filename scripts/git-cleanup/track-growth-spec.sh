#!/bin/bash
# Track Growth Spec Implementation Progress
# Monitors commits related to growth spec items (A1-I8)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
OUTPUT_DIR="$REPO_ROOT/reports/git-cleanup"
REPORT_FILE="$OUTPUT_DIR/growth-spec-tracking-$(date +%Y-%m-%d).md"

mkdir -p "$OUTPUT_DIR"

# Growth spec sections and items
declare -A SECTIONS=(
    ["A"]="Data Rails & Signals (A1-A7)"
    ["B"]="Action Service & API (B1-B7)"
    ["C"]="Recommenders (C1-C5)"
    ["D"]="Storefront Shopify (D1-D5)"
    ["E"]="Front-End HotDash (E1-E3)"
    ["F"]="Learning Loop (F1-F3)"
    ["G"]="Experiments (G1-G2)"
    ["H"]="Security & Ops (H1-H4)"
    ["I"]="KPIs & SLOs (I1-I8)"
)

# Total items: A(7) + B(7) + C(5) + D(5) + E(3) + F(3) + G(2) + H(4) + I(8) = 44

# Search patterns for each section
declare -A PATTERNS=(
    ["A"]="ga|analytics|bigquery|gsc|search console|webhook|chatwoot|web vitals"
    ["B"]="action|approval|queue|diff|versioning"
    ["C"]="recommend|seo|ctr|metaobject|merchandising|guided selling|cwv"
    ["D"]="storefront|page factory|structured data|canonical|internal link|search synonym|performance budget"
    ["E"]="action dock|action detail|auto-publish|dashboard"
    ["F"]="learning|diff|outcome|confidence|tuning"
    ["G"]="experiment|variant|promotion|ab test"
    ["H"]="security|replay protection|hmac|rbac|rotation|backup|rollback"
    ["I"]="kpi|slo|throughput|approval rate|seo lift|content velocity|metrics"
)

# Generate report
{
    echo "# Growth Spec Implementation Tracking"
    echo "**Date**: $(date -Is)"
    echo "**Total Items**: 44"
    echo
    echo "## Progress Summary"
    echo
    
    total_commits=0
    items_with_commits=0
    
    for section in A B C D E F G H I; do
        pattern="${PATTERNS[$section]}"
        section_name="${SECTIONS[$section]}"
        
        # Count commits matching this section (last 30 days)
        count=$(git log --since="30 days ago" --all --grep="$pattern" -i --oneline 2>/dev/null | wc -l || echo 0)
        total_commits=$((total_commits + count))
        
        if [ "$count" -gt 0 ]; then
            items_with_commits=$((items_with_commits + 1))
        fi
        
        echo "### Section $section: $section_name"
        echo "- Commits (last 30 days): $count"
        
        if [ "$count" -gt 0 ]; then
            echo "- Recent commits:"
            git log --since="30 days ago" --all --grep="$pattern" -i --oneline --format="  - %h %s" | head -n 5
        else
            echo "- No recent commits found"
        fi
        echo
    done
    
    echo "## Overall Progress"
    echo "- **Sections with commits**: $items_with_commits/9"
    echo "- **Total commits tracked**: $total_commits"
    echo "- **Date range**: Last 30 days"
    echo
    
    echo "## Stale Branches Check"
    echo
    # List branches with no commits in >7 days
    git for-each-ref --format="%(refname:short) %(committerdate:relative)" refs/heads | \
        awk '$2 ~ /(weeks?|months?)/ {print "- " $1 " (last commit: " $2 " " $3 " " $4 ")"}' || echo "- No stale branches"
    
    echo
    echo "---"
    echo "**Generated**: $(date -Is)"
    echo "**Script**: scripts/git-cleanup/track-growth-spec.sh"
    
} > "$REPORT_FILE"

echo "Report generated: $REPORT_FILE"
cat "$REPORT_FILE"

