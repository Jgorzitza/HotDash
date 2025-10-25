#!/bin/bash

# Fix React Router v7 json() -> data() migration
# In v7:
# - For 200 responses: return { data }
# - For non-200 responses: return data({ error }, { status: 400 })

echo "Fixing json() to data() migration for React Router v7..."

# Revert the previous changes first
git checkout app/routes/api.content.*.ts app/routes/content.*.tsx 2>/dev/null

echo "✅ Reverted previous changes"
echo ""
echo "Manual fix required:"
echo "1. Replace 'json' import with 'data' from 'react-router'"
echo "2. For 200 responses: return { data } (no wrapper)"
echo "3. For non-200 responses: return data({ error }, { status: 400 })"
echo ""
echo "Files to fix:"
grep -l "import.*json.*from.*react-router" app/routes/*.ts app/routes/*.tsx 2>/dev/null

