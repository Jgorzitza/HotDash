# ALL AGENTS - CLI-FIRST MANDATE

**Effective**: IMMEDIATELY
**Replaces**: All MCP credential blocker references

## ✅ CEO CONFIRMED: USE CLI TOOLS

**Supabase**: Use `supabase` CLI with vault credentials (NOT Supabase MCP)
**GitHub**: Use `gh` CLI (already authenticated via browser)
**Shopify**: Use `shopify` CLI v3.85.4
**Fly.io**: Use `fly` CLI if deployment needed

**NO WAITING FOR MCP CREDENTIALS** - Everything works via CLI!

---

## CLI Command Examples

### Supabase Operations

```bash
# List migrations
supabase migration list

# Create migration
supabase migration new <name>

# Apply migrations
supabase db push

# Run SQL
psql $DATABASE_URL -f migration.sql

# Check database status
supabase status
```

### GitHub Operations

```bash
# List issues
gh issue list

# View issue
gh issue view 109

# Create PR
gh pr create --title "..." --body "Fixes #109"

# List PRs
gh pr list

# Merge PR
gh pr merge 90
```

### Shopify Operations

```bash
# Check version
shopify version

# App dev mode
shopify app dev

# Theme check
shopify theme check

# GraphQL query (use Admin API directly via HTTP or GraphQL client)
```

---

## STOP WAITING FOR MCP CREDENTIALS

**If your direction says**:

- ❌ "Waiting for SUPABASE_ACCESS_TOKEN"
- ❌ "Blocked by GitHub MCP credentials"
- ❌ "Cannot proceed without MCP tools"

**Do this instead**:

- ✅ Use `supabase` CLI
- ✅ Use `gh` CLI
- ✅ Use `psql` for direct database access
- ✅ Execute your tasks NOW

---

**All agents**: Read this, update your approach, resume work immediately.
