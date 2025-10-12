#!/bin/bash
# Pollution Check - Prevent files/dirs outside canonical repo
# Run hourly by Manager

CANONICAL_REPO="/home/justin/HotDash/hot-dash"
ARCHIVE_DIR="/home/justin/archive-pollution-$(date +%Y-%m-%d-%H%M)"

echo "=== Pollution Check - $(date -u +"%Y-%m-%dT%H:%M:%SZ") ==="

# Check 1: .md files in /home/justin/
MD_FILES=$(find /home/justin -maxdepth 1 -name "*.md" -type f 2>/dev/null)
if [ -n "$MD_FILES" ]; then
    echo "❌ VIOLATION: Found .md files in /home/justin/"
    echo "$MD_FILES"
    mkdir -p "$ARCHIVE_DIR"
    mv /home/justin/*.md "$ARCHIVE_DIR/"
    echo "✅ Archived to: $ARCHIVE_DIR"
    echo "VIOLATION: .md files in home directory" >> "$CANONICAL_REPO/feedback/manager.md"
else
    echo "✅ No .md files in /home/justin/"
fi

# Check 2: /home/justin/docs/ directory
if [ -d "/home/justin/docs" ]; then
    echo "❌ VIOLATION: Found /home/justin/docs/ directory"
    mkdir -p "$ARCHIVE_DIR"
    mv /home/justin/docs "$ARCHIVE_DIR/"
    echo "✅ Archived to: $ARCHIVE_DIR"
    echo "VIOLATION: docs/ directory recreated" >> "$CANONICAL_REPO/feedback/manager.md"
else
    echo "✅ No /home/justin/docs/ directory"
fi

# Check 3: Extra directories in /home/justin/HotDash/
EXTRA_DIRS=$(find /home/justin/HotDash -maxdepth 1 -type d ! -name "." ! -name ".." ! -name ".git" ! -name "hot-dash" 2>/dev/null)
if [ -n "$EXTRA_DIRS" ]; then
    echo "❌ VIOLATION: Found extra directories in /home/justin/HotDash/"
    echo "$EXTRA_DIRS"
    echo "WARNING: Extra worktrees detected" >> "$CANONICAL_REPO/feedback/manager.md"
else
    echo "✅ No extra directories in /home/justin/HotDash/"
fi

# Check 4: Files in /home/justin/HotDash/ (should only be hot-dash/)
EXTRA_FILES=$(find /home/justin/HotDash -maxdepth 1 -type f 2>/dev/null)
if [ -n "$EXTRA_FILES" ]; then
    echo "⚠️  WARNING: Found files in /home/justin/HotDash/"
    echo "$EXTRA_FILES"
fi

echo ""
echo "=== Single Source of Truth: $CANONICAL_REPO ONLY ==="
echo ""

