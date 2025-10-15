#\!/bin/bash
# Update all agent directions with NO NEW MD FILES rule

agents="integrations devops data qa ai-customer analytics seo ads content support ai-knowledge inventory designer product"

for agent in $agents; do
  file="docs/directions/${agent}.md"
  if [ -f "$file" ]; then
    echo "Updating $file..."
    # This will be done manually for each agent
  fi
done
