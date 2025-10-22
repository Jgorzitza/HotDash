# CI Guards Setup & Troubleshooting — Hot Rod AN

**Version**: 1.0  
**Created**: 2025-10-21  
**Owner**: Support Agent (supporting DevOps)  
**Audience**: All Agents, DevOps, Manager

---

## Table of Contents

1. [Overview](#overview)
2. [MCP Evidence JSONL](#mcp-evidence-jsonl)
3. [Heartbeat NDJSON](#heartbeat-ndjson)
4. [Dev MCP Ban](#dev-mcp-ban)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Quick Reference](#quick-reference)

---

## Overview

### What are CI Guards?

**CI Guards** are automated checks that run on every pull request to ensure Growth Engine compliance. They are **merge blockers** - PRs cannot merge to `main` until all guards pass.

### Three Guard Types

1. **guard-mcp**: Verifies MCP evidence JSONL files exist and are valid
2. **idle-guard**: Verifies heartbeat not stale for long-running tasks (>2h)
3. **dev-mcp-ban**: Verifies NO Dev MCP imports in production code (`app/` directory)

### Why CI Guards Matter

**Without guards**:

- ❌ Agents ship code without MCP verification (outdated patterns)
- ❌ Long tasks appear "stuck" (no heartbeat)
- ❌ Dev MCP tools leak into production (performance/security risk)

**With guards**:

- ✅ All code changes verified against official docs
- ✅ Task progress visible (15-minute heartbeat)
- ✅ Production builds clean (no dev dependencies)

---

## MCP Evidence JSONL

### What is MCP Evidence?

**MCP Evidence** = Proof that you pulled official documentation BEFORE writing code

**Required for**: ALL code changes (new features, bug fixes, refactors)

**Not required for**: Docs-only changes, README updates, config changes (non-code)

---

### When is MCP Evidence Required?

| Change Type                  | MCP Required? | Reason                                                   |
| ---------------------------- | ------------- | -------------------------------------------------------- |
| **New React component**      | ✅ YES        | Context7 for React patterns, Shopify Dev for Polaris     |
| **Shopify GraphQL query**    | ✅ YES        | Shopify Dev MCP validation (validate_graphql_codeblocks) |
| **Prisma schema change**     | ✅ YES        | Context7 `/prisma/docs` for multi-schema rules           |
| **API integration**          | ✅ YES        | Context7 for library docs (OpenAI SDK, etc.)             |
| **Bug fix in existing code** | ✅ YES        | Verify fix against official docs                         |
| **Documentation update**     | ❌ NO         | Docs-only (no code)                                      |
| **README edit**              | ❌ NO         | Docs-only (no code)                                      |
| **Config change**            | ❌ NO         | `.env`, `.gitignore`, etc. (no code logic)               |

---

### How to Create MCP Evidence JSONL

#### Step 1: Create Directory

```bash
# Create evidence directory for today
mkdir -p artifacts/<your-agent>/2025-10-21/mcp
```

#### Step 2: Create JSONL File

**File naming**: `artifacts/<agent>/<date>/mcp/<topic_or_tool>.jsonl`

**Examples**:

- `artifacts/engineer/2025-10-21/mcp/polaris-card.jsonl`
- `artifacts/qa/2025-10-21/mcp/react-router-patterns.jsonl`
- `artifacts/support/2025-10-21/mcp/shopify-graphql.jsonl`

#### Step 3: Append Evidence After Each MCP Call

**After calling Shopify Dev MCP**:

```bash
echo '{"tool":"shopify-dev","doc_ref":"https://shopify.dev/docs/api/admin-graphql","request_id":"abc123","timestamp":"2025-10-21T14:30:00Z","purpose":"Validate PII Card GraphQL query"}' >> artifacts/engineer/2025-10-21/mcp/polaris-card.jsonl
```

**After calling Context7 MCP**:

```bash
echo '{"tool":"context7","doc_ref":"/react-router/react-router","request_id":"xyz789","timestamp":"2025-10-21T14:35:00Z","purpose":"Verify loader pattern for dashboard route"}' >> artifacts/engineer/2025-10-21/mcp/react-router-patterns.jsonl
```

**After web search (last resort)**:

```bash
echo '{"tool":"web-search","doc_ref":"https://supabase.com/docs/guides/database/extensions","request_id":"def456","timestamp":"2025-10-21T14:40:00Z","purpose":"Research Supabase pgvector extension"}' >> artifacts/data/2025-10-21/mcp/supabase-extensions.jsonl
```

---

### JSONL Format

**Required fields**:

```json
{
  "tool": "shopify-dev|context7|web-search",
  "doc_ref": "URL or library path",
  "request_id": "unique ID for this MCP call",
  "timestamp": "ISO 8601 timestamp",
  "purpose": "Why you needed this documentation"
}
```

**Field descriptions**:

| Field        | Type   | Description              | Example                                                    |
| ------------ | ------ | ------------------------ | ---------------------------------------------------------- |
| `tool`       | string | MCP tool used            | `"shopify-dev"`, `"context7"`, `"web-search"`              |
| `doc_ref`    | string | URL or library path      | `"/prisma/docs"`, `"https://shopify.dev/..."`              |
| `request_id` | string | Unique ID (UUID or hash) | `"abc123"`, `"conv-xyz-789"`                               |
| `timestamp`  | string | ISO 8601 timestamp       | `"2025-10-21T14:30:00Z"`                                   |
| `purpose`    | string | Why you needed docs      | `"Validate GraphQL query"`, `"Check Prisma schema syntax"` |

---

### Validation Rules

**guard-mcp checks**:

1. ✅ At least ONE `.jsonl` file exists in `artifacts/<agent>/<date>/mcp/`
2. ✅ All lines are valid JSON (no syntax errors)
3. ✅ All required fields present (`tool`, `doc_ref`, `request_id`, `timestamp`, `purpose`)
4. ✅ Timestamps within last 24 hours (evidence is fresh)

**Common errors**:

- ❌ No `.jsonl` files found → PR template missing "MCP Evidence:" section
- ❌ Invalid JSON → Syntax error (missing quote, comma, bracket)
- ❌ Missing field → Incomplete evidence entry
- ❌ Stale timestamp → Evidence >24h old (re-verify docs)

---

### Example JSONL File

**File**: `artifacts/engineer/2025-10-21/mcp/pii-card.jsonl`

```json
{"tool":"shopify-dev","doc_ref":"https://shopify.dev/docs/api/admin-graphql","request_id":"conv-123","timestamp":"2025-10-21T14:30:00Z","purpose":"Validate Customer Accounts API query for order lookup"}
{"tool":"context7","doc_ref":"/react-router/react-router","request_id":"route-456","timestamp":"2025-10-21T14:35:00Z","purpose":"Verify loader pattern for PII Card route"}
{"tool":"shopify-dev","doc_ref":"https://shopify.dev/docs/apps/tools/polaris","request_id":"polaris-789","timestamp":"2025-10-21T14:40:00Z","purpose":"Learn Polaris Card component props"}
{"tool":"context7","doc_ref":"/microsoft/TypeScript","request_id":"ts-101","timestamp":"2025-10-21T14:45:00Z","purpose":"Check TypeScript generic type constraints"}
```

**Analysis**:

- ✅ 4 MCP tool calls logged
- ✅ All fields present
- ✅ Timestamps within 24h
- ✅ Clear purpose for each call
- ✅ Valid JSON format

---

### PR Template Integration

**In your PR description, add**:

```markdown
## MCP Evidence

**Evidence Files**:

- `artifacts/engineer/2025-10-21/mcp/pii-card.jsonl` (4 calls)
- `artifacts/engineer/2025-10-21/mcp/routing.jsonl` (2 calls)

**Total MCP Calls**: 6

**Tools Used**:

- Shopify Dev MCP: 3 calls (GraphQL validation, Polaris components)
- Context7 MCP: 3 calls (React Router, TypeScript, Prisma)

**OR** (if docs-only change):

## MCP Evidence

Not required - documentation-only change (no code modified)
```

---

## Heartbeat NDJSON

### What is Heartbeat?

**Heartbeat** = Proof that you're actively working on a long-running task (>2 hours)

**Required for**: Tasks estimated >2 hours

**Not required for**: Tasks <2 hours (single session)

**Why**: Prevents tasks appearing "stuck" or "idle"

---

### When is Heartbeat Required?

| Task Duration | Heartbeat Required? | Frequency                               |
| ------------- | ------------------- | --------------------------------------- |
| < 2 hours     | ❌ NO               | N/A                                     |
| 2-4 hours     | ✅ YES              | Every 15 min                            |
| 4-8 hours     | ✅ YES              | Every 15 min                            |
| > 8 hours     | ✅ YES              | Every 15 min (split into multiple days) |

---

### How to Create Heartbeat NDJSON

#### Step 1: Create File

```bash
# Create heartbeat file for today
mkdir -p artifacts/<your-agent>/2025-10-21
touch artifacts/<your-agent>/2025-10-21/heartbeat.ndjson
```

#### Step 2: Append Heartbeat Every 15 Minutes

**Format**: Newline-delimited JSON (each line is valid JSON)

```bash
# At 14:00 (start)
echo '{"timestamp":"2025-10-21T14:00:00Z","task":"ENG-029","status":"doing","progress":"0%","file":"app/components/PIICard.tsx"}' >> artifacts/engineer/2025-10-21/heartbeat.ndjson

# At 14:15 (+15 min)
echo '{"timestamp":"2025-10-21T14:15:00Z","task":"ENG-029","status":"doing","progress":"25%","file":"app/components/PIICard.tsx"}' >> artifacts/engineer/2025-10-21/heartbeat.ndjson

# At 14:30 (+15 min)
echo '{"timestamp":"2025-10-21T14:30:00Z","task":"ENG-029","status":"doing","progress":"50%","file":"app/services/pii-broker.ts"}' >> artifacts/engineer/2025-10-21/heartbeat.ndjson

# At 14:45 (+15 min)
echo '{"timestamp":"2025-10-21T14:45:00Z","task":"ENG-029","status":"doing","progress":"75%","file":"tests/integration/pii-card.spec.ts"}' >> artifacts/engineer/2025-10-21/heartbeat.ndjson

# At 15:00 (complete)
echo '{"timestamp":"2025-10-21T15:00:00Z","task":"ENG-029","status":"done","progress":"100%","file":"app/components/PIICard.tsx"}' >> artifacts/engineer/2025-10-21/heartbeat.ndjson
```

---

### NDJSON Format

**Required fields**:

```json
{
  "timestamp": "ISO 8601 timestamp",
  "task": "Task ID (e.g., ENG-029, SUPPORT-010)",
  "status": "doing|done|blocked",
  "progress": "Percentage (0-100%) or milestone",
  "file": "Current file being worked on"
}
```

**Field descriptions**:

| Field       | Type   | Description            | Example                          |
| ----------- | ------ | ---------------------- | -------------------------------- |
| `timestamp` | string | ISO 8601 timestamp     | `"2025-10-21T14:00:00Z"`         |
| `task`      | string | Task ID from direction | `"ENG-029"`, `"SUPPORT-010"`     |
| `status`    | string | Current status         | `"doing"`, `"done"`, `"blocked"` |
| `progress`  | string | % or milestone         | `"50%"`, `"Component complete"`  |
| `file`      | string | File being worked on   | `"app/components/PIICard.tsx"`   |

---

### Validation Rules

**idle-guard checks**:

1. ✅ Heartbeat file exists (`artifacts/<agent>/<date>/heartbeat.ndjson`)
2. ✅ All lines are valid JSON
3. ✅ Last heartbeat is NOT stale (timestamp <15 minutes old during 'doing' status)
4. ✅ All required fields present

**Staleness check**:

- If `status: "doing"` AND `timestamp` >15 minutes ago → ❌ FAIL (stale heartbeat)
- If `status: "done"` → ✅ PASS (task complete, staleness OK)
- If `status: "blocked"` → ✅ PASS (waiting for dependency, staleness OK)

**Common errors**:

- ❌ No heartbeat file → PR template missing "Heartbeat:" section
- ❌ Stale heartbeat → Last update >15 min ago while status "doing"
- ❌ Invalid JSON → Syntax error
- ❌ Missing field → Incomplete heartbeat entry

---

### Example Heartbeat File

**File**: `artifacts/engineer/2025-10-21/heartbeat.ndjson`

```json
{"timestamp":"2025-10-21T14:00:00Z","task":"ENG-029","status":"doing","progress":"0%","file":"app/components/PIICard.tsx"}
{"timestamp":"2025-10-21T14:15:00Z","task":"ENG-029","status":"doing","progress":"20%","file":"app/components/PIICard.tsx"}
{"timestamp":"2025-10-21T14:30:00Z","task":"ENG-029","status":"doing","progress":"40%","file":"app/components/PIICard.tsx"}
{"timestamp":"2025-10-21T14:45:00Z","task":"ENG-029","status":"doing","progress":"60%","file":"app/services/pii-broker.ts"}
{"timestamp":"2025-10-21T15:00:00Z","task":"ENG-029","status":"doing","progress":"80%","file":"tests/integration/pii-card.spec.ts"}
{"timestamp":"2025-10-21T15:15:00Z","task":"ENG-029","status":"done","progress":"100%","file":"app/components/PIICard.tsx"}
```

**Analysis**:

- ✅ 6 heartbeats logged (15-minute intervals)
- ✅ All fields present
- ✅ Final status "done" (task complete)
- ✅ Valid NDJSON format
- ✅ Not stale (final timestamp shows completion)

---

### PR Template Integration

**In your PR description, add**:

```markdown
## Heartbeat

**Heartbeat File**: `artifacts/engineer/2025-10-21/heartbeat.ndjson`

**Task Duration**: 3.5 hours  
**Heartbeat Entries**: 14 (every 15 minutes)  
**Final Status**: done

**OR** (if task <2h):

## Heartbeat

Not required - task completed in single session (<2 hours)
```

---

## Dev MCP Ban

### What is Dev MCP Ban?

**Dev MCP Ban** = Prohibition on Dev MCP tools in production code

**Why**: Dev MCP tools (Shopify Dev MCP, Context7 MCP, Chrome DevTools MCP) are for **development only**. They should NOT be imported or bundled in production runtime code.

---

### Allowed vs Forbidden

#### ✅ ALLOWED (Development Tools)

**These directories CAN import Dev MCP**:

- `scripts/` - Build scripts, dev tools
- `tests/` - Test files
- `.cursor/` - Cursor IDE config
- `docs/` - Documentation generators

**Example** (OK):

```typescript
// scripts/verify-docs.ts
import { ShopifyDevMCP } from "@shopify/mcp-server-dev";

// This is OK - script is dev-only
```

---

#### ❌ FORBIDDEN (Production Code)

**These directories CANNOT import Dev MCP**:

- `app/` - All runtime application code
- `packages/` - Published packages
- `build/` - Production builds

**Example** (NOT OK):

```typescript
// app/routes/dashboard.tsx
import { ShopifyDevMCP } from "@shopify/mcp-server-dev";

// ❌ FAIL - Dev MCP in production code
```

---

### Why Dev MCP is Banned in Production

**Security**:

- Dev MCP tools have elevated permissions
- Not designed for production environments
- Potential security vulnerabilities

**Performance**:

- Dev MCP tools are large (bundle size)
- Slow down runtime performance
- Unnecessary in production (docs already verified during dev)

**Best Practice**:

- **Development**: Use MCP to verify code against official docs
- **Production**: Ship verified code WITHOUT MCP dependencies

---

### Validation Rules

**dev-mcp-ban checks**:

1. ✅ No imports of Dev MCP packages in `app/` directory
2. ✅ No references to Dev MCP tools in production code
3. ✅ Build passes without Dev MCP dependencies

**Forbidden patterns**:

```typescript
// ❌ Direct imports
import { ShopifyDevMCP } from "@shopify/mcp-server-dev";
import { Context7 } from "context7-mcp";
import { ChromeDevTools } from "chrome-devtools-mcp";

// ❌ Dynamic imports
const mcp = await import("@shopify/mcp-server-dev");

// ❌ Require statements
const mcp = require("@shopify/mcp-server-dev");
```

---

### How CI Checks

**Script**: `scripts/ci/check-dev-mcp-ban.sh`

```bash
#!/bin/bash

# Check for Dev MCP imports in app/ directory
if grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
  echo "❌ Dev MCP imports detected in production code (app/)"
  exit 1
fi

echo "✅ No Dev MCP imports found in production code"
exit 0
```

**What it checks**:

- Searches `app/` directory recursively
- Looks for patterns: `mcp.*dev`, `dev.*mcp` (case-insensitive)
- Checks `.ts` and `.tsx` files only
- Fails if ANY match found

---

### Common Errors

#### Error 1: Dev MCP Import in app/

**Symptom**:

```
❌ Dev MCP imports detected in production code (app/)
app/routes/dashboard.tsx:5:import { ShopifyDevMCP } from '@shopify/mcp-server-dev';
```

**Fix**:

1. Remove the import from `app/routes/dashboard.tsx`
2. Move code verification to development/testing phase
3. Ship verified code without MCP dependency

**Before** (❌):

```typescript
// app/routes/dashboard.tsx
import { ShopifyDevMCP } from "@shopify/mcp-server-dev";

export async function loader() {
  // Using MCP at runtime (BAD)
  const mcp = new ShopifyDevMCP();
  const docs = await mcp.getDocs();
  // ...
}
```

**After** (✅):

```typescript
// app/routes/dashboard.tsx
// No MCP imports - code already verified during dev

export async function loader() {
  // Use verified patterns from official docs
  // MCP was used during development, not runtime
  // ...
}
```

---

## Troubleshooting Guide

### Issue 1: MCP Evidence Missing

**Error Message**:

```
❌ CI Guard Failed: guard-mcp
Reason: No MCP evidence JSONL files found in artifacts/<agent>/<date>/mcp/
```

**Diagnosis**:

1. Check if `artifacts/<agent>/<date>/mcp/` directory exists
2. Check if any `.jsonl` files in that directory
3. Check PR template has "MCP Evidence:" section

**Solution**:

**Step 1**: Create evidence directory

```bash
mkdir -p artifacts/<your-agent>/2025-10-21/mcp
```

**Step 2**: Create JSONL file and add evidence

```bash
# Example: You used Shopify Dev MCP
echo '{"tool":"shopify-dev","doc_ref":"https://shopify.dev/docs/api/admin-graphql","request_id":"abc123","timestamp":"2025-10-21T14:30:00Z","purpose":"Validate GraphQL query"}' > artifacts/<agent>/2025-10-21/mcp/shopify-validation.jsonl
```

**Step 3**: Update PR template

```markdown
## MCP Evidence

**Evidence Files**:

- `artifacts/<agent>/2025-10-21/mcp/shopify-validation.jsonl` (1 call)
```

**Step 4**: Commit and push

```bash
git add artifacts/<agent>/2025-10-21/mcp/
git commit -m "docs: add MCP evidence for CI guard"
git push
```

---

### Issue 2: Heartbeat Stale

**Error Message**:

```
❌ CI Guard Failed: idle-guard
Reason: Heartbeat stale (last update: 2025-10-21T14:00:00Z, >15 minutes ago)
Current status: doing (task not complete)
```

**Diagnosis**:

1. Check last line of `artifacts/<agent>/<date>/heartbeat.ndjson`
2. Check timestamp vs current time
3. Check status (if "doing", must be <15 min old)

**Solution**:

**Step 1**: Append new heartbeat entry

```bash
# Current time: 2025-10-21T15:30:00Z
echo '{"timestamp":"2025-10-21T15:30:00Z","task":"ENG-029","status":"doing","progress":"90%","file":"tests/integration/pii-card.spec.ts"}' >> artifacts/<agent>/2025-10-21/heartbeat.ndjson
```

**Step 2**: If task complete, mark as done

```bash
echo '{"timestamp":"2025-10-21T15:30:00Z","task":"ENG-029","status":"done","progress":"100%","file":"app/components/PIICard.tsx"}' >> artifacts/<agent>/2025-10-21/heartbeat.ndjson
```

**Step 3**: Commit and push

```bash
git add artifacts/<agent>/2025-10-21/heartbeat.ndjson
git commit -m "docs: update heartbeat (task progress 90%)"
git push
```

---

### Issue 3: Dev MCP Detected in app/

**Error Message**:

```
❌ CI Guard Failed: dev-mcp-ban
Reason: Dev MCP imports detected in production code
File: app/routes/dashboard.tsx:5
Line: import { ShopifyDevMCP } from '@shopify/mcp-server-dev';
```

**Diagnosis**:

1. Search for MCP imports: `grep -r "mcp" app/ --include="*.ts" --include="*.tsx"`
2. Identify which files import Dev MCP
3. Determine if import is necessary (usually NOT)

**Solution**:

**Step 1**: Remove Dev MCP import

```typescript
// app/routes/dashboard.tsx

// ❌ Remove this
// import { ShopifyDevMCP } from '@shopify/mcp-server-dev';

// ✅ Use verified code without MCP dependency
export async function loader() {
  // Code already verified during development
  // No runtime MCP needed
}
```

**Step 2**: Move verification to development phase

```bash
# Create dev script (if needed for future verification)
mkdir -p scripts/verify/
cat > scripts/verify/dashboard-route.ts << 'EOF'
import { ShopifyDevMCP } from '@shopify/mcp-server-dev';

// Verification script (dev-only)
async function verifyDashboardRoute() {
  const mcp = new ShopifyDevMCP();
  // Verify patterns...
}
EOF
```

**Step 3**: Commit and push

```bash
git add app/routes/dashboard.tsx scripts/verify/dashboard-route.ts
git commit -m "fix: remove Dev MCP from production code, move to dev scripts"
git push
```

---

### Issue 4: Invalid JSON in Evidence

**Error Message**:

```
❌ CI Guard Failed: guard-mcp
Reason: Invalid JSON in artifacts/engineer/2025-10-21/mcp/polaris.jsonl:3
Error: Unexpected token } in JSON at position 45
```

**Diagnosis**:

1. Open the JSONL file
2. Check line 3 for syntax errors
3. Validate JSON: `cat file.jsonl | jq .` (each line separately)

**Common JSON errors**:

```json
// ❌ Missing quote
{"tool":"shopify-dev,"doc_ref":"..."}

// ❌ Trailing comma
{"tool":"shopify-dev","doc_ref":"...",}

// ❌ Missing bracket
{"tool":"shopify-dev","doc_ref":"..."

// ❌ Wrong quote type
{'tool':'shopify-dev','doc_ref':'...'}
```

**Solution**:

**Step 1**: Fix the JSON syntax

```bash
# Open file and fix line 3
nano artifacts/engineer/2025-10-21/mcp/polaris.jsonl

# Correct format:
{"tool":"shopify-dev","doc_ref":"https://shopify.dev/...","request_id":"abc","timestamp":"2025-10-21T14:30:00Z","purpose":"Validate"}
```

**Step 2**: Validate each line

```bash
cat artifacts/engineer/2025-10-21/mcp/polaris.jsonl | while read line; do
  echo "$line" | jq . || echo "Invalid JSON: $line"
done
```

**Step 3**: Commit and push

```bash
git add artifacts/engineer/2025-10-21/mcp/polaris.jsonl
git commit -m "fix: correct JSON syntax in MCP evidence"
git push
```

---

### Issue 5: Missing Required Field

**Error Message**:

```
❌ CI Guard Failed: guard-mcp
Reason: Missing required field 'purpose' in artifacts/qa/2025-10-21/mcp/testing.jsonl:2
```

**Diagnosis**:

1. Open JSONL file
2. Check line 2 for missing field
3. Verify all required fields: `tool`, `doc_ref`, `request_id`, `timestamp`, `purpose`

**Solution**:

**Step 1**: Add missing field

```bash
# Before (❌):
{"tool":"context7","doc_ref":"/react-router/react-router","request_id":"xyz","timestamp":"2025-10-21T14:30:00Z"}

# After (✅):
{"tool":"context7","doc_ref":"/react-router/react-router","request_id":"xyz","timestamp":"2025-10-21T14:30:00Z","purpose":"Verify loader pattern"}
```

**Step 2**: Update file

```bash
nano artifacts/qa/2025-10-21/mcp/testing.jsonl
# Fix line 2 by adding "purpose" field
```

**Step 3**: Commit and push

```bash
git add artifacts/qa/2025-10-21/mcp/testing.jsonl
git commit -m "fix: add missing 'purpose' field to MCP evidence"
git push
```

---

## Quick Reference

### CI Guards Checklist

Before opening PR, verify:

- [ ] **MCP Evidence** (if code changes):
  - [ ] Directory exists: `artifacts/<agent>/<date>/mcp/`
  - [ ] At least one `.jsonl` file created
  - [ ] All lines are valid JSON
  - [ ] All required fields present
  - [ ] PR template includes "MCP Evidence:" section

- [ ] **Heartbeat** (if task >2h):
  - [ ] File exists: `artifacts/<agent>/<date>/heartbeat.ndjson`
  - [ ] Heartbeat every 15 minutes
  - [ ] Latest heartbeat <15 min old (if status "doing")
  - [ ] Final heartbeat status "done" (task complete)
  - [ ] PR template includes "Heartbeat:" section

- [ ] **Dev MCP Ban**:
  - [ ] No Dev MCP imports in `app/` directory
  - [ ] Run: `grep -r "mcp.*dev" app/ --include="*.ts"` → 0 results
  - [ ] Dev MCP only in `scripts/`, `tests/`, `.cursor/`

---

### Command Cheat Sheet

**Create MCP Evidence**:

```bash
mkdir -p artifacts/<agent>/$(date +%Y-%m-%d)/mcp
echo '{"tool":"<tool>","doc_ref":"<url>","request_id":"<id>","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","purpose":"<why>"}' >> artifacts/<agent>/$(date +%Y-%m-%d)/mcp/<topic>.jsonl
```

**Create Heartbeat**:

```bash
mkdir -p artifacts/<agent>/$(date +%Y-%m-%d)
echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","task":"<task-id>","status":"doing","progress":"<percent>","file":"<current-file>"}' >> artifacts/<agent>/$(date +%Y-%m-%d)/heartbeat.ndjson
```

**Check Dev MCP Ban**:

```bash
grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i
```

**Validate JSON**:

```bash
cat <file>.jsonl | while read line; do echo "$line" | jq .; done
```

---

### PR Template Sections

```markdown
## MCP Evidence

**Evidence Files**:

- `artifacts/<agent>/<date>/mcp/<topic>.jsonl` (X calls)

**Total MCP Calls**: X

**Tools Used**:

- Shopify Dev MCP: X calls
- Context7 MCP: X calls

## Heartbeat

**Heartbeat File**: `artifacts/<agent>/<date>/heartbeat.ndjson`

**Task Duration**: Xh  
**Heartbeat Entries**: X (every 15 minutes)  
**Final Status**: done

## Dev MCP Check

✅ No Dev MCP imports in production code (`app/` directory)

Verified with: `grep -r "mcp.*dev" app/ --include="*.ts"` → 0 results
```

---

### Error Quick Fixes

| Error                    | Quick Fix                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **MCP evidence missing** | `mkdir -p artifacts/<agent>/<date>/mcp && echo '{...}' > <file>.jsonl`                                            |
| **Heartbeat stale**      | `echo '{"timestamp":"<now>","task":"<id>","status":"doing","progress":"X%","file":"<file>"}' >> heartbeat.ndjson` |
| **Dev MCP detected**     | Remove import from `app/` files, move to `scripts/` if needed                                                     |
| **Invalid JSON**         | Validate with `jq`, fix syntax (quotes, commas, brackets)                                                         |
| **Missing field**        | Add required field: `tool`, `doc_ref`, `request_id`, `timestamp`, `purpose`                                       |

---

### File Locations Reference

| Item                  | Location                                     | Example                                                |
| --------------------- | -------------------------------------------- | ------------------------------------------------------ |
| **MCP Evidence**      | `artifacts/<agent>/<date>/mcp/<topic>.jsonl` | `artifacts/engineer/2025-10-21/mcp/polaris-card.jsonl` |
| **Heartbeat**         | `artifacts/<agent>/<date>/heartbeat.ndjson`  | `artifacts/engineer/2025-10-21/heartbeat.ndjson`       |
| **CI Scripts**        | `scripts/ci/`                                | `scripts/ci/check-dev-mcp-ban.sh`                      |
| **Dev MCP OK**        | `scripts/`, `tests/`, `.cursor/`             | `scripts/verify/dashboard.ts`                          |
| **Dev MCP FORBIDDEN** | `app/`, `packages/`, `build/`                | `app/routes/dashboard.tsx`                             |

---

## Document History

| Version | Date       | Author        | Changes                        |
| ------- | ---------- | ------------- | ------------------------------ |
| 1.0     | 2025-10-21 | Support Agent | Initial creation (SUPPORT-010) |

---

**END OF DOCUMENT**
