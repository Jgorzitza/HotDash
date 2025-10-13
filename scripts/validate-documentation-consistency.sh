#!/bin/bash

echo "=== DOCUMENTATION CONSISTENCY VALIDATION ==="
echo ""

# Check for web_search MCP references (should be 0)
WEB_SEARCH_COUNT=$(grep -r "web_search" docs/ --include="*.md" 2>/dev/null | wc -l)
echo "1. Web Search MCP References: $WEB_SEARCH_COUNT (should be 0)"

# Check for fly CLI references (should be 0)
FLY_CLI_COUNT=$(grep -r "fly cli\|fly --" docs/ --include="*.md" 2>/dev/null | wc -l)
echo "2. Fly CLI References: $FLY_CLI_COUNT (should be 0)"

# Check for psql references in non-backup contexts (backup files are OK)
PSQL_NON_BACKUP=$(grep -r "psql" docs/ --include="*.md" 2>/dev/null | grep -v "backup\|restore" | wc -l)
echo "3. PSQL References (non-backup): $PSQL_NON_BACKUP (should be 0)"

# Check for direction source confusion
DIRECTION_CONFUSION=$(grep -r "feedback.*direction\|direction.*feedback" docs/ --include="*.md" 2>/dev/null | wc -l)
echo "4. Direction Source Confusion: $DIRECTION_CONFUSION (should be 0)"

# Check for START HERE NOW sections in direction files
START_HERE_COUNT=$(grep -r "START HERE NOW" docs/directions/ --include="*.md" 2>/dev/null | wc -l)
echo "5. START HERE NOW Sections: $START_HERE_COUNT (should be 18)"

# Check for MCP tool references in direction files
MCP_REFERENCES=$(grep -r "mcp_" docs/directions/ --include="*.md" 2>/dev/null | wc -l)
echo "6. MCP Tool References: $MCP_REFERENCES (should be >18)"

# Check for timeline estimates
TIMELINE_REFERENCES=$(grep -r "timeline\|hour\|minute" docs/directions/ --include="*.md" 2>/dev/null | wc -l)
echo "7. Timeline Estimates: $TIMELINE_REFERENCES (should be >18)"

echo ""
echo "=== VALIDATION SUMMARY ==="
echo "✅ Web Search MCP: $WEB_SEARCH_COUNT/0"
echo "✅ Fly CLI: $FLY_CLI_COUNT/0"  
echo "✅ PSQL (non-backup): $PSQL_NON_BACKUP/0"
echo "✅ Direction Confusion: $DIRECTION_CONFUSION/0"
echo "✅ START HERE NOW: $START_HERE_COUNT/18"
echo "✅ MCP References: $MCP_REFERENCES/>18"
echo "✅ Timeline Estimates: $TIMELINE_REFERENCES/>18"

if [ "$WEB_SEARCH_COUNT" -eq 0 ] && [ "$FLY_CLI_COUNT" -eq 0 ] && [ "$PSQL_NON_BACKUP" -eq 0 ] && [ "$DIRECTION_CONFUSION" -eq 0 ] && [ "$START_HERE_COUNT" -eq 18 ]; then
    echo ""
    echo "🎉 DOCUMENTATION CONSISTENCY: EXCELLENT"
    echo "✅ All validation checks passed"
    echo "✅ All agents have proper direction"
    echo "✅ No conflicting references found"
    echo "🚀 Ready for deployment"
else
    echo ""
    echo "⚠️ DOCUMENTATION ISSUES FOUND"
    echo "❌ Some validation checks failed"
    echo "📋 Review and fix issues above"
fi
