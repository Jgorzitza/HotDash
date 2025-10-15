---
epoch: 2025.10.E1
doc: docs/data/autodoc_generation.md
owner: data
last_reviewed: 2025-10-11
---

# Automated Data Documentation Generation

## Overview
Auto-generate comprehensive data documentation from database metadata, comments, and usage patterns.

## Documentation Types

### 1. Schema Documentation
- Table definitions with column descriptions
- Relationship diagrams
- Index documentation
- RLS policy descriptions

### 2. Data Dictionary
- Column-level metadata
- Data types and constraints
- Sample values
- Usage statistics

### 3. Lineage Documentation
- Upstream/downstream dependencies
- Transformation logic
- Impact analysis

## Auto-Doc Script
```bash
#!/bin/bash
# Generate data documentation from database metadata

psql $DB_URL << 'EOF' > docs/data/GENERATED_SCHEMA_DOCS.md
# Agent SDK Database Schema (Auto-Generated)

## Tables
SELECT format('### %s\n%s\n\n**Columns:**\n%s', 
  tablename,
  obj_description(format('%s.%s', schemaname, tablename)::regclass),
  string_agg(format('- `%s` (%s): %s', column_name, data_type, col_description), E'\n')
)
FROM information_schema.tables t
JOIN information_schema.columns c USING (table_schema, table_name)
WHERE table_schema = 'public' AND tablename LIKE 'agent_%'
GROUP BY tablename, schemaname;
EOF
```

**Status:** Auto-documentation framework designed

