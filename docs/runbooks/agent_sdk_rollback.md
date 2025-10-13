---
title: Agent SDK Tables Rollback Procedure
created: 2025-10-12
owner: data
---

# Agent SDK Tables Rollback Procedure

## Tables Created
- `AgentApproval` - Approval queue
- `AgentFeedback` - Training data
- `AgentQuery` - Query logs

## Rollback SQL

```sql
-- Drop tables in reverse order (no foreign keys, so order doesn't matter)
DROP TABLE IF EXISTS "AgentQuery" CASCADE;
DROP TABLE IF EXISTS "AgentFeedback" CASCADE;
DROP TABLE IF EXISTS "AgentApproval" CASCADE;
```

## Verification After Rollback

```bash
# Use Supabase MCP to verify tables are gone
# mcp_supabase_list_tables(schemas: ["public"])
# Should not show AgentApproval, AgentFeedback, AgentQuery
```

## Data Backup Before Rollback

```sql
-- Export data before rollback (if needed)
COPY (SELECT * FROM "AgentApproval") TO '/tmp/agent_approval_backup.csv' CSV HEADER;
COPY (SELECT * FROM "AgentFeedback") TO '/tmp/agent_feedback_backup.csv' CSV HEADER;
COPY (SELECT * FROM "AgentQuery") TO '/tmp/agent_query_backup.csv' CSV HEADER;
```

## Re-apply If Needed

Use Supabase MCP:
```
mcp_supabase_apply_migration(
  name: "agent_sdk_tables",
  query: "... [full migration SQL] ..."
)
```

