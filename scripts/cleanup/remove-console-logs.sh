#!/bin/bash
# Console Log Cleanup Script
# Removes console.log statements from production code
# Refs: ENG-CONSOLE-LOG-CLEANUP

set -e

echo "🧹 Console Log Cleanup Script"
echo "=============================="
echo ""

# Count current console statements
TOTAL=$(grep -r "console\." app/ --include="*.ts" --include="*.tsx" | wc -l)
echo "📊 Current console statements in app/: $TOTAL"
echo ""

# Find high-risk console.log statements (those that might leak sensitive data)
echo "🔍 Scanning for high-risk console statements..."
HIGH_RISK=$(grep -r "console\.log.*\(token\|key\|secret\|password\|credential\|auth\|bearer\)" app/ --include="*.ts" --include="*.tsx" -i -n || true)

if [ -n "$HIGH_RISK" ]; then
  echo "⚠️  HIGH RISK console statements found:"
  echo "$HIGH_RISK"
  echo ""
else
  echo "✅ No high-risk console statements found"
  echo ""
fi

# Find files with most console usage
echo "📁 Files with most console usage:"
grep -r "console\." app/ --include="*.ts" --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
echo ""

# Strategy:
# 1. Keep console.error for actual errors
# 2. Remove console.log from production code
# 3. Replace with structured logger where needed
# 4. Keep console.log in test files

echo "📋 Cleanup Strategy:"
echo "  1. Keep console.error for actual errors"
echo "  2. Remove console.log from production code"
echo "  3. Replace with structured logger where needed"
echo "  4. Keep console.log in test files"
echo ""

# Create backup
echo "💾 Creating backup..."
BACKUP_DIR="backups/console-cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r app/ "$BACKUP_DIR/"
echo "✅ Backup created: $BACKUP_DIR"
echo ""

# Remove console.log statements (but keep console.error and console.warn)
echo "🧹 Removing console.log and console.debug statements..."

# Find all TypeScript files in app/
find app/ -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Skip if file doesn't contain console
  if ! grep -q "console\." "$file"; then
    continue
  fi
  
  # Count console statements before
  BEFORE=$(grep -c "console\." "$file" 2>/dev/null || echo "0")

  # Remove console.log and console.debug (but keep console.error and console.warn)
  # This is a simple approach - removes entire lines with console.log or console.debug
  sed -i '/console\.log(/d' "$file" 2>/dev/null || true
  sed -i '/console\.debug(/d' "$file" 2>/dev/null || true

  # Count console statements after
  AFTER=$(grep -c "console\." "$file" 2>/dev/null || echo "0")

  # Only calculate if both are valid numbers and different
  if [ -n "$BEFORE" ] && [ -n "$AFTER" ] && [ "$BEFORE" != "0" ] && [ "$BEFORE" != "$AFTER" ]; then
    REMOVED=$((BEFORE - AFTER))
    if [ "$REMOVED" -gt 0 ]; then
      echo "  ✓ $file: removed $REMOVED statements"
    fi
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""

# Count remaining console statements
REMAINING=$(grep -r "console\." app/ --include="*.ts" --include="*.tsx" | wc -l)
REMOVED=$((TOTAL - REMAINING))

echo "📊 Summary:"
echo "  Before: $TOTAL console statements"
echo "  After:  $REMAINING console statements"
echo "  Removed: $REMOVED statements"
echo ""

# Show what's left (should be mostly console.error and console.warn)
echo "📋 Remaining console statements by type:"
echo "  console.error: $(grep -r "console\.error" app/ --include="*.ts" --include="*.tsx" | wc -l)"
echo "  console.warn:  $(grep -r "console\.warn" app/ --include="*.tsx" --include="*.ts" | wc -l)"
echo "  console.info:  $(grep -r "console\.info" app/ --include="*.ts" --include="*.tsx" | wc -l)"
echo "  Other:         $(grep -r "console\." app/ --include="*.ts" --include="*.tsx" | grep -v "console\.error\|console\.warn\|console\.info" | wc -l)"
echo ""

echo "💡 Next steps:"
echo "  1. Review the changes: git diff app/"
echo "  2. Run tests: npm test"
echo "  3. If everything looks good: git add app/ && git commit"
echo "  4. Restore from backup if needed: cp -r $BACKUP_DIR/app/ ."
echo ""

