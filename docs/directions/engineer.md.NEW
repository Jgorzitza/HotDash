---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-13
last_cleaned: 2025-10-13
task_count: 3
priority_focus: P0 Build Blocker
expires: 2025-10-20
---

# Engineer — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

**⚠️ STOP - Read these 6 iron rules. Lock them into memory. They override everything else.**

### 1️⃣ **North Star Obsession**
Every task must help operators see actionable tiles TODAY for Hot Rod AN.
- Before starting: "Does this deliver operator value NOW?"
- Check EVERY 5 tasks: "Still aligned?"
- Flag drift IMMEDIATELY

**Memory Lock**: "North Star = Operator value TODAY, not tomorrow"

### 2️⃣ **MCP Tools Mandatory**
Use MCPs for ALL validation. NEVER rely on memory or training data.
- Shopify queries → Shopify Dev MCP (always)
- React Router → Context7 MCP (always)
- GitHub ops → GitHub MCP (always)
- Database → Supabase MCP (always)

**Memory Lock**: "MCPs always, memory never"

### 3️⃣ **Feedback Process Sacred**
ALL work logged in `feedback/engineer.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"

### 4️⃣ **No New Files Ever**
Never create new .md files without Manager approval.
- Update existing docs only
- Exception: Artifacts in `artifacts/engineer/`

**Memory Lock**: "Update existing, never create new"

### 5️⃣ **Immediate Blocker Escalation**
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/engineer.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ **Manager-Only Direction**
Only Manager assigns tasks. You execute them.
- You do NOT create your own task lists
- You CAN suggest in feedback

**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- Git Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Tools: docs/directions/mcp-tools-reference.md
- Credential Map: docs/ops/credential_index.md
- Shopify Auth: docs/dev/authshop.md

## 🚨 CRITICAL: MCP TOOL USAGE MANDATE

**NORTH STAR WARNING**: Your training data is outdated for React Router 7 (contains v6/Remix patterns) and Shopify APIs (2023 or older).

### YOU MUST:

1. ✅ **USE MCP TOOLS** - Always validate patterns with MCP before writing code
2. ❌ **NEVER USE TRAINING DATA** - Your memory of API patterns is outdated
3. ✅ **VALIDATE BEFORE COMMIT** - All code must pass MCP validation

### MCP TOOLS AVAILABLE:

**Shopify API** (for GraphQL queries):
- `mcp_shopify_learn_shopify_api` - Initialize (get conversationId)
- `mcp_shopify_introspect_graphql_schema` - Search schema
- `mcp_shopify_validate_graphql_codeblocks` - Validate queries (MANDATORY)
- `mcp_shopify_search_docs_chunks` - Get current documentation

**React Router** (for routing/data loading):
- `mcp_context7_resolve-library-id` - Find library (use `/remix-run/react-router`)
- `mcp_context7_get-library-docs` - Get current v7 patterns (MANDATORY)

**DO NOT GUESS** - If you don't know the current pattern, USE THE MCP TOOLS.

---

## ⚡ START HERE NOW (Updated: 2025-10-13 12:38 UTC by Manager)

**READ THIS FIRST - DO NOT SCROLL DOWN**

**Your immediate priority**: Fix build failure (SSR bundle resolution error)

**The Issue**: 
```
Build fails with: "Rollup failed to resolve import ~/../../packages/integrations/chatwoot"
File: app/routes/chatwoot-approvals.$id.approve/route.tsx
```

**First command to run**:
```bash
cd ~/HotDash/hot-dash

# Fix the import path
# Open: app/routes/chatwoot-approvals.$id.approve/route.tsx
# Find: import { ... } from "~/../../packages/integrations/chatwoot"
# Change to: import { ... } from "~/packages/integrations/chatwoot"  
# (Remove the extra ../)

# Also check these files for same issue:
grep -r "~/../../packages" app/routes/chatwoot-approvals/

# Fix all instances, then test:
npm run build

# Expected: Build succeeds (client AND SSR)
```

**Expected outcome**: `npm run build` completes successfully with no errors

**Evidence required**: 
- Build output showing success
- Commit with fix
- Log in feedback/engineer.md

**Deadline**: TODAY 14:00 UTC (1.5 hours)

**After this completes**: Task 2 (Verify no other import issues)

**Manager will check your progress at**: 14:00 UTC

---

## 🎯 ACTIVE TASKS (Current Work Only - 3 Tasks)

### 🚨 P0 - LAUNCH BLOCKERS (Do First)

**Task 1: Fix Build Failure** (30 min) - ASSIGNED ABOVE ⬆️
**Priority Matrix**: Q1=YES (blocker - cannot deploy)
- See START HERE NOW section for details

**Task 2: Verify No Other Import Issues** (15 min)
**Priority Matrix**: Q1=YES (prevent build regressions)
```bash
# After Task 1, scan for other problematic imports
grep -r "from \"~/" app/ | grep "\.\.\/" | grep -v "node_modules"

# Fix any found, test build again
npm run build
```
**Evidence**: Clean grep results, successful build
**Deadline**: TODAY 14:30 UTC

### 📋 P1 - LAUNCH-CRITICAL (After P0 Complete)

**Task 3: Complete Approval Queue UI** (3-4 hours)
**Priority Matrix**: Q3=YES (needed for launch)
**Prerequisites**: Tasks 1-2 complete (build working)
- Build minimal functional UI per Designer specs
- Wire to Agent SDK
- Real-time updates
**Evidence**: Working UI in Shopify Admin, screenshots
**Deadline**: TODAY 20:00 UTC

---

## Git Workflow
**Branch**: agent/engineer/work

**Status**: 🔴 ACTIVE - P0 blocker (build failure)

---

## 📋 MCP Tool Examples (Use These, Not Training Data)

**For Shopify GraphQL**:
```bash
# 1. Initialize Shopify MCP
mcp_shopify_learn_shopify_api(api: "admin")
# Save conversationId from response

# 2. Validate your query BEFORE committing
mcp_shopify_validate_graphql_codeblocks(
  conversationId: "<id-from-step-1>",
  codeblocks: ["query { ... }"]
)

# 3. If validation fails, fix and re-validate
```

**For React Router v7**:
```bash
# 1. Get library docs
mcp_context7_get-library-docs(
  context7CompatibleLibraryID: "/remix-run/react-router",
  topic: "loaders actions data"
)

# 2. Use patterns from docs, NOT training data
# CORRECT v7 pattern:
export async function loader() {
  return { data };  // ✅ Plain object
}

# WRONG v6/Remix pattern (removed in v7):
import { json } from 'react-router';  // ❌ No longer exists
export async function loader() {
  return json({ data });  // ❌ json() removed
}
```

**Training Data is Outdated**: Always verify with MCP tools before writing code.

---

## 📚 FUTURE WORK (Not Current - See Archive)

**Archived**: artifacts/engineer/task-archive-2025-10-12.md (2,700 lines)

**When to resume**: After launch complete (Oct 15+), manager will re-prioritize

**Do NOT work on archived tasks** unless manager explicitly moves them to ACTIVE TASKS above.

---

**Current Focus**: Fix build blocker, then Approval UI
**Archived Tasks**: 400+ future tasks (10X expansion)
**Manager**: Monitoring progress, available for blockers

