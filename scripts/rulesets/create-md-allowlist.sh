#!/usr/bin/env bash
# scripts/rulesets/create-md-allowlist.sh
# Creates a GitHub push ruleset that blocks unauthorized .md file pushes
# Usage: ./scripts/rulesets/create-md-allowlist.sh <owner/repo>

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <owner/repo>"
  echo "Example: $0 Jgorzitza/HotDash"
  exit 1
fi

REPO="$1"
RULESET_NAME="Markdown Allowlist (Push Protection)"

# Allowlist patterns (must match check-docs.mjs allowlist)
ALLOWED_PATTERNS=(
  "README.md"
  "APPLY.md"
  "docs/NORTH_STAR.md"
  "docs/RULES.md"
  "docs/ARCHIVE_INDEX.md"
  "docs/OPERATING_MODEL.md"
  "docs/runbooks/**/*.md"
  "docs/directions/**/*.md"
  "docs/manager/PROJECT_PLAN.md"
  "docs/manager/IMPLEMENTATION_PLAYBOOK.md"
  "docs/planning/**/*.md"
  "docs/specs/**/*.md"
  "docs/integrations/**/*.md"
  "feedback/**/*.md"
  "docs/_archive/**/*"
  "mcp/**/*.md"
)

echo "🔒 Creating Markdown allowlist push ruleset for ${REPO}..."
echo ""
echo "This ruleset will:"
echo "  - Block pushes of .md files NOT in the allowlist"
echo "  - Apply to all branches (including main)"
echo "  - Enforce at push time (before commits reach GitHub)"
echo ""

# Build the ruleset JSON
# Note: GitHub rulesets use the "file_path_restriction" condition
# We need to BLOCK *.md EXCEPT the allowed patterns

cat > /tmp/ruleset.json <<EOF
{
  "name": "${RULESET_NAME}",
  "target": "push",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["~ALL"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "file_path_restriction",
      "parameters": {
        "restricted_file_paths": ["*.md"],
        "exempt_file_paths": $(printf '%s\n' "${ALLOWED_PATTERNS[@]}" | jq -R . | jq -s .)
      }
    }
  ],
  "bypass_actors": []
}
EOF

echo "📋 Ruleset configuration:"
cat /tmp/ruleset.json | jq .
echo ""

# Create the ruleset via GitHub API
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/${REPO}/rulesets" \
  --input /tmp/ruleset.json

echo ""
echo "✅ Ruleset '${RULESET_NAME}' created successfully!"
echo ""
echo "To view/edit: https://github.com/${REPO}/settings/rules"
echo "To delete: gh api --method DELETE /repos/${REPO}/rulesets/{id}"

rm /tmp/ruleset.json
