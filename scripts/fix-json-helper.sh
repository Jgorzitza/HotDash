#!/bin/bash

# Fix React Router v7 json() deprecation
# In v7, you should return raw objects instead of json()

echo "Fixing json() helper usage in React Router v7..."

# Find all files that import json from react-router or @react-router/node
files=$(grep -rl "import.*json.*from.*react-router" app/ --include="*.ts" --include="*.tsx")

for file in $files; do
  echo "Processing: $file"
  
  # Remove json from imports (but keep other imports)
  # This handles: import { json, type LoaderFunctionArgs } from 'react-router';
  # Becomes: import { type LoaderFunctionArgs } from 'react-router';
  sed -i 's/import { json, /import { /g' "$file"
  sed -i 's/import { json }/\/\/ json removed/g' "$file"
  sed -i 's/, json,/, /g' "$file"
  sed -i 's/, json }/}/g' "$file"
  
  # Replace return json(...) with return ...
  # This handles: return json({ data });
  # Becomes: return { data };
  sed -i 's/return json(/return (/g' "$file"
  
  echo "  ✓ Fixed $file"
done

echo ""
echo "✅ Done! Fixed $(echo "$files" | wc -l) files"
echo ""
echo "Note: You may need to manually review files that had complex json() usage"

