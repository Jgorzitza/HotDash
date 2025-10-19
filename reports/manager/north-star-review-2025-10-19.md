# North Star Review — 2025-10-19

## Purpose
Verify alignment of NORTH_STAR.md, README.md, RULES.md, OPERATING_MODEL.md after potential reversion.

## Review Date
2025-10-19T21:00:00Z

## Documents Reviewed
- `docs/NORTH_STAR.md`
- `README.md`
- `docs/RULES.md`
- `docs/OPERATING_MODEL.md`

## Findings

### ✅ ALIGNED - Correct Content

**1. Framework References** ✅
- NORTH_STAR.md: "React Router 7 template" (line 47)
- README.md: "React Router 7" (line 69, 110)
- OPERATING_MODEL.md: No Remix references found
- **Status**: CORRECT - React Router 7 explicitly stated

**2. Manager Git Ownership** ✅
- RULES.md: "Manager owns NORTH_STAR, RULES, Operating Model, directions, and PROJECT_PLAN" (line 31)
- RULES.md: "Agents write **only** to their daily feedback file and code paths" (line 30)
- **Status**: CORRECT - Agents never touch git per governance

**3. MCP Infrastructure Documentation** ✅
- README.md: MCP documentation in `mcp/` directory is protected (lines 141-156)
- RULES.md: `mcp/**` in allowed markdown list (line 23)
- **Status**: CORRECT - MCP docs are protected infrastructure

**4. Approvals & HITL** ✅
- NORTH_STAR.md: "Human-in-the-Loop by Default" (line 11)
- NORTH_STAR.md: "ai-customer has `human_review: true`" (line 141)
- OPERATING_MODEL.md: "HITL enforced for `ai-customer`" (line 42)
- **Status**: CORRECT - HITL enforced per governance

### ❌ DISCREPANCIES - Need Correction

**1. Google Analytics MCP - DEPRECATED** ❌
- **NORTH_STAR.md line 50**: Lists "Google Analytics" as active MCP server
- **README.md line 132**: Lists "google-analytics" as ✅ Active
- **README.md line 331**: Shows "google-analytics" tool
- **REALITY**: Built-in GA4 API connectors exist in app/services/analytics/
- **IMPACT**: Agents may attempt to use deprecated MCP instead of built-in connectors
- **ACTION REQUIRED**: Remove GA4 MCP from North Star and README

**2. Supabase MCP - DEPRECATED** ❌
- **NORTH_STAR.md line 50**: Lists "Supabase" as active MCP server
- **README.md line 132**: Lists "supabase" as ✅ Active
- **OPERATING_MODEL.md line 40**: Lists "Supabase" in MCP servers
- **REALITY**: Supabase CLI is the correct tool (confirmed by user, Data agent uses CLI successfully)
- **IMPACT**: Agents may attempt MCP calls instead of CLI commands
- **ACTION REQUIRED**: Remove Supabase MCP from North Star, README, Operating Model; add CLI guidance

**3. MCP Server Count Mismatch** ⚠️
- **NORTH_STAR.md line 50**: Claims "6 servers" (GitHub, Context7, Supabase, Fly.io, Shopify, Google Analytics)
- **REALITY**: Only 4 valid servers (GitHub Official, Context7, Fly.io, Shopify Dev)
- **ACTION REQUIRED**: Update count to "4 MCP servers" everywhere

**4. README.md MCP Tool Table** ❌
- **README.md lines 130-139**: Shows 6 tools with GA4 and Supabase marked active
- **ACTION REQUIRED**: Remove google-analytics and supabase rows, update count to 4

## Recommended Corrections

### NORTH_STAR.md Changes

**Line 50** (Architecture section):
```diff
-- **Dev:** Cursor/Codex/Claude with **MCP** (6 servers: GitHub, Context7, Supabase, Fly.io, Shopify, Google Analytics). Full setup in `mcp/` directory. Constrained by runbooks/directions + CI.
+- **Dev:** Cursor/Codex/Claude with **MCP** (4 servers: GitHub Official, Context7, Fly.io, Shopify Dev). Full setup in `mcp/` directory. Use Supabase CLI and built-in GA4 API for those integrations. Constrained by runbooks/directions + CI.
```

### README.md Changes

**Lines 130-139** (MCP Tools table):
```diff
-| **supabase**         | Database & edge functions            | ✅ Active             |
-| **google-analytics** | GA data queries (dev tools only)     | ✅ Active             |
 | **llamaindex-rag**   | Knowledge base RAG queries           | 🚧 In development     |
```

**Line 127** (intro paragraph):
```diff
-HotDash provides **6 MCP servers** to help AI agents work effectively:
+HotDash provides **4 MCP servers** to help AI agents work effectively:
```

**Add after line 139**:
```markdown
### Tools NOT Using MCP

- **Supabase**: Use `supabase` CLI directly (migrations, queries, edge functions)
- **Google Analytics**: Use built-in API connectors in `app/services/analytics/`
```

### OPERATING_MODEL.md Changes

**Line 40**:
```diff
-- **MCP‑first in dev** (Cursor/Codex/Claude) with 6 active servers (GitHub, Context7, Supabase, Fly.io, Shopify, Google Analytics). Full documentation in `mcp/` directory. **Agents SDK in‑app** (TS) with HITL.
+- **MCP‑first in dev** (Cursor/Codex/Claude) with 4 active servers (GitHub Official, Context7, Fly.io, Shopify Dev). Use Supabase CLI and built-in GA4 API. Full documentation in `mcp/` directory. **Agents SDK in‑app** (TS) with HITL.
```

## Priority

**P0 - CRITICAL**: Fix before updating agent directions (prevents agents from attempting deprecated MCP calls)

## Next Steps

1. Manager applies corrections to NORTH_STAR.md, README.md, OPERATING_MODEL.md
2. Verify no agent direction files reference Supabase MCP or GA4 MCP
3. Update direction files to use "Supabase CLI" and "built-in GA4 API connectors"
4. Commit changes to manager's direction update PR

## Evidence

- NORTH_STAR.md read: 102 lines
- README.md read: 510 lines
- RULES.md read: 43 lines
- OPERATING_MODEL.md read: 142 lines
- Total review time: 15 minutes
- Discrepancies found: 4 critical MCP deprecations

**STATUS**: COMPLETE - Corrections documented, ready for Manager to apply

