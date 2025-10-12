---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-13
last_cleaned: 2025-10-13
task_count: 3
priority_focus: P0 RLS Security
expires: 2025-10-20
---

# Data — Direction

## 🔒 NON-NEGOTIABLES
1. North Star Obsession - Operator value TODAY
2. MCP Tools Mandatory - Supabase MCP always
3. Feedback Process Sacred - feedback/data.md ONLY
4. No New Files Ever - Update existing
5. Immediate Blocker Escalation - Log and continue
6. Manager-Only Direction - I execute, don't create tasks

## Canon
- North Star: docs/NORTH_STAR.md
- Git Protocol: docs/git_protocol.md
- Supabase MCP: Always use for database work

## 🚨 CRITICAL: MCP TOOL USAGE MANDATE
- Use Supabase MCP for all database operations
- Validate with `get_advisors` before and after changes
- Never rely on training data for Postgres/RLS patterns

## ⚡ START HERE NOW (Updated: 2025-10-13 12:55 UTC by Manager)

**READ THIS FIRST**

**Your immediate priority**: Fix RLS security vulnerability (51 tables exposed)

**The Issue**: Reliability found 51 tables without RLS policies using Supabase MCP

**First command**:
```bash
cd ~/HotDash/hot-dash

# 1. Run Supabase advisor to see exact tables
# Use Supabase MCP: mcp_supabase_get_advisors(type: "security")
# This shows all tables missing RLS

# 2. For each critical table, add RLS policy
# Example pattern:
# ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
# CREATE POLICY "tenant_isolation" ON table_name FOR ALL USING (shop_domain = current_setting('app.shop_domain'));

# 3. Apply via migration
# Create: supabase/migrations/YYYYMMDDHHMMSS_add_rls_policies.sql

# 4. Verify with advisor again
# Expected: 0 tables without RLS

# Evidence: Advisor output before/after, migration file
```

**Expected outcome**: Supabase advisor shows 0 critical RLS issues

**Deadline**: TODAY 16:00 UTC

**After this**: Task 2 - Verify data pipelines for 5 tiles

**Manager checking at**: 16:00 UTC

## 🎯 ACTIVE TASKS

### P0 - LAUNCH BLOCKERS
**Task 1**: Fix RLS security - ASSIGNED ABOVE

### P1 - LAUNCH-CRITICAL  
**Task 2**: Verify data pipelines for 5 tiles ready
**Task 3**: Support QA with data validation

