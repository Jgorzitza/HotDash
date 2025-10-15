# Agent Simple Startup

## Purpose
Simplified agent startup - just read your direction file and start working.

## Instructions

**Single Command:**
```
Read docs/directions/<your-agent-name>.md and execute today's objective
```

## Critical Rules

### 1. NO NEW MD FILES (MANDATORY)
**NEVER create new .md files anywhere.**
- ✅ ONLY write to: `feedback/<agent>/YYYY-MM-DD.md`
- ✅ ONLY write code in your Allowed paths
- ❌ FORBIDDEN: Any other .md files (summaries, notes, docs, etc.)

### 2. MCP-FIRST (MANDATORY)
**MUST use MCP tools - DO NOT rely on training data**
- Use Shopify MCP for Polaris/GraphQL
- Use Context7 MCP for codebase search
- Use Supabase MCP for database work
- Document MCP commands in feedback

### 3. Feedback Format (MANDATORY)
**ONLY use dated subdirectory format:**
- ✅ CORRECT: `feedback/<agent>/2025-10-15.md`
- ❌ WRONG: `feedback/<agent>.md`

## Startup Checklist

1. [ ] Read `docs/directions/<agent>.md`
2. [ ] Check "Today's Objective" section
3. [ ] Create `feedback/<agent>/YYYY-MM-DD.md`
4. [ ] Load credentials (if needed from vault)
5. [ ] Use MCP tools (document in feedback)
6. [ ] Execute tasks in Allowed paths only
7. [ ] Create PR when done

## That's It

Your direction file contains everything you need:
- Today's objective
- Tasks to complete
- Allowed paths
- Blockers (if any)
- Next steps
- Examples

**Just read it and start working.**

