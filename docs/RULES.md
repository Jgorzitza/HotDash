# RULES — Docs, Tasks, Secrets, and Agents

## Allowed Markdown (CI-enforced)

```
README.md
APPLY.md
docs/NORTH_STAR.md
docs/RULES.md
docs/OPERATING_MODEL.md
docs/ARCHIVE_INDEX.md
docs/README.md
docs/roadmap.md
docs/runbooks/{manager_*,agent_*,ai_agent_review_checklist.md,drift_checklist.md}
docs/directions/<agent|role>.md
docs/directions/agenttemplate.md
docs/manager/{PROJECT_PLAN.md,IMPLEMENTATION_PLAYBOOK.md}
docs/planning/<agent>-<task>-<YYYYMMDD>.md  # TTL 2 days
docs/specs/**
docs/integrations/**
docs/_archive/**
mcp/**  # MCP tools documentation (critical infrastructure - DO NOT REMOVE)
```

## No Ad-Hoc Files (STRICT - Effective 2025-10-20)

**All agents and Manager: NEVER create new .md files without 3-Question Test**

### The 3-Question Test (MANDATORY)

Before creating ANY new .md file:

1. **Can this go in the database?**
   - YES → Use `logDecision()` and STOP
   - NO → Continue to Q2

2. **Is this in DOCS_INDEX.md Tier 1-3?**
   - YES → Proceed (only if CEO approved)
   - NO → Continue to Q3

3. **Did CEO explicitly request this file?**
   - YES → Get written approval, update DOCS_INDEX.md first
   - NO → **DO NOT CREATE** (use feedback file)

### Forbidden Patterns

**NEVER create**:

- ❌ Status/incident: `STATUS_*.md`, `URGENT_*.md`, `FIX_*.md`, `P0_*.md`, `CRITICAL_*.md`
- ❌ Checklists/plans: `*_CHECKLIST.md`, `DEPLOY_*.md`, `*_PLAN.md`
- ❌ Analysis/reports: `*_ANALYSIS.md`, `*_GAP.md`, `*_FINDINGS.md`, `*_REPORT.md`
- ❌ Coordination: `*_to_*_coordination.md`, `HANDOFF_*.md`
- ❌ Any root .md beyond 6 allowed

### Enforcement

- **Daily audit**: Manager finds root .md files (must be ≤ 6)
- **Immediate archive**: Violations → `docs/archive/YYYY-MM-DD/`
- **3 strikes**: Escalation to CEO

### Root .md Files (6 Maximum)

**Allowed**:

1. README.md
2. SECURITY.md
3. CONTRIBUTING.md
4. DOCS_INDEX.md
5. AGENT_LAUNCH_PROMPT_OCT20.md (temp)
6. COMPLETE_VISION_OVERVIEW.md (temp)

---

## Process [DATABASE-DRIVEN]

- **Task Management**: Manager assigns via `assignTask()` database (instant, 10+ times/day). Agents query via `getMyTasks()` (real-time, no git pull).
- **Feedback**: Agents report via `logDecision()` (database, IMMEDIATE on status changes).
- **GitHub Issues**: Still used for detailed context and PR tracking. PR must state `Fixes #<issue>`, satisfy DoD, and pass checks. Danger enforces.
- Manager owns NORTH_STAR, RULES, Operating Model, and PROJECT_PLAN.
- **Direction files archived** (2025-10-22) - markdown too slow for hourly updates.

## KB Integration (OPTIONAL - Available When Needed)

**KB tool is available for searching existing solutions and documentation.**

### KB Search Workflow (Optional)

**When to use KB**:
- Looking for existing solutions or similar implementations
- Need context on common issues and their solutions
- Want to review security considerations
- Understanding integration points with other systems

### KB Search Commands

```bash
# Manager or Agent: Search when context needed
npx tsx scripts/agent/kb-search.ts <TASK-ID> "<TASK-TITLE>" <AGENT-NAME>

# Quick query
npm run dev-kb:query -- "Your question here"
```

### KB Search Logging (Optional)

```typescript
await logDecision({
  scope: "build",
  actor: "<agent>",
  action: "kb_search_completed",
  rationale: "KB search completed for additional context",
  taskId: "<TASK-ID>",
  payload: {
    searchResults: "Found existing solutions",
    recommendations: ["Review security considerations", "Check integration points"],
    sources: ["docs/example.md", "docs/patterns.md"]
  }
});
```

### KB Integration Benefits

- **Prevents Redoing Work**: Find existing solutions before implementing
- **Context Recovery**: Access documentation and past decisions
- **Issue Prevention**: Identify common problems and their solutions
- **Security Awareness**: Review security considerations
- **Integration Planning**: Understand system connections

### Usage

- **KB search is OPTIONAL** - use when you need additional context
- **Available to all agents** for searching documentation and solutions
- **Helpful when**: Looking for existing patterns, understanding past decisions, or needing security context

## Security

- Enable GitHub **push protection** & secret scanning.
- **Gitleaks** runs on every PR & push; SARIF to Security tab.
- No secrets in code or docs; store in GitHub Environments/Secrets, Local Vault, and Fly.io secrets (as needed).

## Git Strategy: Daily Branch Model (MANDATORY - Effective 2025-10-20)

**Manager owns ALL git operations. Agents commit to daily branch, Manager merges to main.**

### Daily Branch Workflow

**Morning (Manager)**:

```bash
# Manager creates/checks out daily branch
git checkout -b daily/2025-10-20  # or use existing manager-reopen-YYYYMMDD
git push origin daily/2025-10-20
```

**All Day (All Agents)**:

```bash
# Agents commit to same branch (no branching per agent)
git add app/routes/my-work.ts
git commit -m "feat(engineer): add modal component"
git push origin daily/2025-10-20
```

**Evening (Manager)**:

```bash
# Manager reviews all commits
git log daily/2025-10-20 --oneline
# Manager creates PR: daily/2025-10-20 → main
# Manager merges after review
# Tomorrow: New daily branch from main
```

### File Ownership (Prevents Conflicts)

**Each agent has exclusive directories** - if you need a file owned by another agent, report to Manager:

| Agent                    | Owns These Directories/Files                                             |
| ------------------------ | ------------------------------------------------------------------------ |
| Data                     | `prisma/`, `supabase/migrations/`                                        |
| Engineer                 | `app/routes/`, `app/components/`, `app/lib/` (excluding specialist libs) |
| Designer                 | `docs/design/`, design review comments                                   |
| DevOps                   | `fly.toml`, `Dockerfile`, `scripts/ops/`, deployment configs             |
| Content                  | `data/support/`, microcopy (coordinates with Engineer for components)    |
| Analytics                | `app/lib/analytics/`, `scripts/analytics/`                               |
| SEO                      | `app/lib/seo/`                                                           |
| Ads                      | `app/lib/ads/`                                                           |
| Integrations             | `packages/integrations/`, `app/lib/integrations/`                        |
| Support                  | `docs/support/`                                                          |
| AI-Customer/AI-Knowledge | `packages/agents/`, `packages/memory/`                                   |
| Product                  | `docs/specs/`, feature flags                                             |
| Inventory                | `app/lib/inventory/`                                                     |
| QA                       | `tests/`, review comments                                                |
| Pilot                    | `tests/e2e/`, smoke tests                                                |
| Manager                  | `docs/directions/`, database coordination, git coordination              |

**If Conflict**: Report via `logDecision()` with `status: 'blocked'` and `blockedBy: 'Agent Y'` → Manager sees instantly

### Commit Style (Conventional Commits)

```bash
feat(agent-name): add feature
fix(agent-name): fix bug
docs(agent-name): update docs
test(agent-name): add tests
```

**Manager Reviews Before Merge**: Ensures no conflicts, all tests pass, follows rules

---

## Database Safety (MANDATORY - Effective 2025-10-20)

**CRITICAL: All deployment paths are READ-ONLY for database schema**

### Production Configuration (Verified Safe)

**✅ fly.toml**:

```toml
[deploy]
  release_command = "npx prisma generate"
```

- **SAFE**: Only generates Prisma client
- **NO**: migrations, db push, db pull, schema modifications

**✅ package.json**:

```json
"setup": "prisma generate"
```

- **SAFE**: Only generates Prisma client
- **NO**: migrations, db push, schema modifications

**✅ docker-entrypoint.sh**:

- **SAFE**: Only handles Google Analytics credentials
- **NO**: database operations of any kind

### What This Means

**Database schema is FIXED** - deployments will NOT:

- ❌ Modify tables (no `prisma migrate deploy`)
- ❌ Push schema changes (no `prisma db push`)
- ❌ Drop columns (no `--accept-data-loss`)
- ❌ Delete data (no reset operations)

**Agent data is PRESERVED** - deployments will NOT affect:

- ✅ Session records (Shopify OAuth sessions)
- ✅ DashboardFact records (analytics, usage data)
- ✅ DecisionLog records (audit trail)
- ✅ ANY existing database records

### Schema Changes Require CEO Approval

**If schema modification is needed**:

1. Engineer creates migration file locally
2. Documents changes in PR with impact analysis
3. Manager reviews for safety
4. **CEO approves** before merge
5. Manager applies migration manually using SSH console
6. Evidence logged via `logDecision()` and in manager feedback (optional)

**NEVER**:

- ❌ Add `prisma migrate deploy` to fly.toml
- ❌ Add `prisma db push` to package.json
- ❌ Run migrations in release_command
- ❌ Use `--accept-data-loss` flag

**Enforcement**: Manager REJECTS PRs that add database modification commands to deployment paths.

## Agents & HITL

- **Dev agents** (Cursor/Codex/Claude): follow runbooks & directions; no Agent SDK.
- **In‑app agents** (OpenAI Agents SDK): HITL enforced for `ai-customer` using built‑in interruptions.

## MCP Tools (MANDATORY - Updated 2025-10-24)

**🚨 CRITICAL (2025-10-24)**: Engineer nearly reversed production fixes by not using MCP tools. See `docs/runbooks/CRITICAL_MCP_ENFORCEMENT.md` for full enforcement details.

**ALL agents (including Manager) MUST use MCP tools BEFORE writing code** - non-negotiable

**BEFORE ANY CODE CHANGE**:
1. ✅ Pull MCP docs (Shopify Dev → Context7 → Web)
2. ✅ Use codebase-retrieval to understand current state
3. ✅ Use view tool to read existing files
4. ✅ Verify change won't break existing fixes
5. ✅ Validate with appropriate MCP tool

**MCP TOOL PRIORITY** (Effective 2025-10-21):

1. **Shopify Dev MCP** → FIRST for Polaris + Shopify APIs
2. **Context7 MCP** → For other libraries (React Router, Prisma, etc.)
3. **Web Search** → LAST RESORT ONLY

---

### 1. Shopify Dev MCP: FIRST FOR POLARIS + SHOPIFY (STRICT)

**Rule**: MANDATORY for ALL Shopify/Polaris code - pull docs FIRST, validate ALWAYS

**Required for**:

- **Polaris components** (Card, Banner, Button, DataTable, Modal, Layout, etc.)
- **Shopify Admin API** (GraphQL queries + mutations)
- **Shopify Storefront API** (GraphQL queries)
- **Shopify metafields** (metafieldDefinitionCreate, productUpdate)
- **Shopify inventory** (inventoryItemUpdate, inventoryAdjustQuantities)

**Process**:

1. Learn API: `mcp_shopify_learn_shopify_api(api: "polaris-app-home")` or `api: "admin"`
2. Search docs: `mcp_shopify_search_docs_chunks(conversationId, "your question")`
3. **VALIDATE**: `validate_graphql_codeblocks` (GraphQL) or `validate_component_codeblocks` (Polaris)

**Evidence Format**:

```md
## HH:MM - Shopify Dev MCP: Polaris Card

- Topic: [what I'm implementing]
- Key Learning: [specific requirement from docs]
- Applied to: [files changed]
- Validation: ✅ Passed validate_component_codeblocks
```

**Example**:

```md
## 14:30 - Shopify Dev MCP: Polaris Banner

- Topic: Warning banner for PII Card
- Key Learning: Use tone="warning" for alerts, role="alert" for accessibility
- Applied to: app/components/PIICard.tsx
- Validation: ✅ Passed validate_component_codeblocks
```

---

### 2. Context7 MCP: FOR NON-SHOPIFY LIBRARIES (SECOND)

**Rule**: NEVER write code without pulling official documentation first

**Required for**:

- Prisma (`/prisma/docs`) - multi-schema, migrations, types
- React Router 7 (`/react-router/react-router`) - routes, loaders, actions
- TypeScript (`/microsoft/TypeScript`) - types, generics, patterns
- Google Analytics (`/websites/developers_google_analytics...`) - API, authentication
- OpenAI SDK (`/openai/openai-node`) - agents, completions
- LlamaIndex (`/run-llama/LlamaIndexTS`) - indexes, queries
- **ANY npm package** you're modifying (NOT Shopify/Polaris)

**Evidence Format**:

```md
## HH:MM - Context7: [Library]

- Topic: [what I'm implementing]
- Key Learning: [specific requirement from docs]
- Applied to: [files changed]
```

**Example** (from 2025-10-20 P0 fix):

```md
## 17:15 - Context7: Prisma

- Topic: multi-schema support @@schema attribute
- Key Learning: ALL models need @@schema("public") when datasource has schemas array
- Applied to: prisma/schema.prisma (Session, DashboardFact, DecisionLog)
```

---

### 3. Web Search: LAST RESORT ONLY

**Rule**: Use `web_search` for official docs if NEITHER MCP has the library

**When to Use**:

- Shopify Dev MCP doesn't have it (rare for Shopify/Polaris)
- Context7 doesn't have it (less common libraries)
- Need current 2025 info (API changes, new features)

**Example**: `web_search("GA4 Data API custom dimensions query Node.js official docs")`

**Always**:

- Include "official docs" or "documentation" in search
- Log search results via `logDecision()` or in feedback markdown

### 4. Chrome DevTools MCP: Required for UI Testing

**Rule**: Designer, Pilot, QA agents MUST use for production testing

- Take snapshots before claiming "tested"
- Log screenshot/snapshot evidence in artifacts/ (referenced in logDecision evidenceUrl)

### QA-Specific: Code Verification Protocol

**When reviewing any agent's code, QA MUST validate using tools**:

- Prisma code? → Pull `/prisma/docs` and verify patterns
- React Router 7? → Pull `/react-router/react-router` and verify
- Shopify integration? → Use Shopify Dev MCP validation
- TypeScript? → Pull `/microsoft/TypeScript` and verify types
- Any API? → Pull library docs and verify implementation

**Evidence Format**:

```md
## Code Review: [Feature]

- Verified using: Context7 `/library/path` - topic: [what I checked]
- Official docs say: [requirement]
- Code matches: ✅ / ❌
- Recommendation: [pass / request changes]
```

### Enforcement (ALL Agents Including Manager)

**🚨 CRITICAL**: See `docs/runbooks/CRITICAL_MCP_ENFORCEMENT.md` for full enforcement details and consequences.

**MUST DO**:

- ✅ Pull docs BEFORE writing code (not after)
- ✅ Use codebase-retrieval to understand current state
- ✅ Use view tool to read existing files
- ✅ Verify change won't break existing fixes
- ✅ Log tool usage via MCP Evidence JSONL (artifacts/) or in feedback markdown
- ✅ Quote specific requirement from docs
- ✅ Apply official patterns (not training data)
- ✅ Validate with appropriate MCP tool

**MUST NOT**:

- ❌ Guess library behavior from training data (it's 6-12 months old)
- ❌ Assume you know current codebase state from memory
- ❌ Make changes without verifying against current code
- ❌ Skip MCP tools to "save time" (costs more in failed deploys)
- ❌ Deploy without verifying against docs

**RED FLAGS** (Auto-reject):

- ❌ "Fixed based on experience"
- ❌ "Applied standard pattern"
- ❌ "Cleaned up code"
- ❌ No MCP evidence for code changes
- ❌ No codebase-retrieval for understanding current state

---

## Growth Engine Rules (MANDATORY - Effective 2025-10-21)

### Agent Evidence & Heartbeat (CI Merge Blockers)

**MCP Evidence JSONL** (required for ALL code changes):

- **Location**: `artifacts/<agent>/<YYYY-MM-DD>/mcp/<topic_or_tool>.jsonl`
- **Format**: `{"tool":"storefront|context7|…","doc_ref":"<url>","request_id":"<id>","timestamp":"ISO","purpose":"<why>"}`
- **PR Template**: Must include "MCP Evidence:" section listing JSONL paths
- **OR State**: "No MCP usage - non-code change" (for docs-only PRs)

**Heartbeat** (required for tasks >2 hours):

- **Location**: `artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson`
- **Format**: JSON lines appended every 15min max
- **PR Template**: Confirm heartbeat present OR task <2h (single session)
- **Staleness Check**: CI fails if last heartbeat >15min old during 'doing' status

**CI Guards** (REQUIRED on main):

- **guard-mcp**: Verify MCP evidence JSONL files exist and are valid
- **idle-guard**: Verify heartbeat not stale (if task >2h)
- **dev-mcp-ban**: FAIL build if Dev MCP imports found in `app/` (production safety)

**Enforcement**:

- ✅ PR cannot merge without MCP Evidence OR "non-code change" statement
- ✅ PR cannot merge if heartbeat stale (>15min) for long-running tasks
- ✅ Production builds MUST FAIL if Dev MCP detected in runtime bundles

### Dev MCP Ban (Production Safety)

**Rule**: Dev MCP servers (Shopify Dev, Context7, Chrome DevTools, etc.) are for **development & staging ONLY**

**Forbidden in Production**:

- ❌ `import { ... } from '@shopify/mcp-server-dev'`
- ❌ `import { ... } from 'context7-mcp'`
- ❌ Any Dev MCP imports in `app/` directory (runtime code)

**CI Check**:

```bash
# Fail if Dev MCP found in production code
if grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i; then
  echo "❌ Dev MCP imports detected in production code"
  exit 1
fi
```

**Allowed**:

- ✅ Dev MCP in `scripts/`, `tests/`, `.cursor/` (non-runtime)
- ✅ Production MCP (Supabase, Fly.io, GitHub) in `app/` (if needed)

### Store Switch Safety

**Rule**: Canonical Shopify domain after cutover is `fm8vte-ex.myshopify.com`

**Requirements**:

- ✅ ALL Shopify URLs parameterized via `process.env.SHOPIFY_SHOP_DOMAIN`
- ✅ OAuth redirects use env var (no literals)
- ✅ Telemetry IDs (GA4, Bing) parameterized via env
- ❌ NO hardcoded `*.myshopify.com` domains in code

**Enforcement**: CI fails if hardcoded Shopify domains found in `app/`

### Telemetry Configuration

**GA4 Property**: 339826228  
**Bing Webmaster**: Verified domain  
**Search Console**: Direct API (no BigQuery) - stored in Supabase for historical trends

**Action Attribution**:

- **Custom Dimension**: `hd_action_key` (event scope)
- **Format**: `{type}-{target_slug}-{YYYY-MM-DD}` (e.g., `seo-fix-powder-board-2025-10-21`)
- **Tracking**: Client emits `hd_action_key` on page_view, add_to_cart, begin_checkout, purchase
- **ROI Windows**: 7d, 14d, 28d after action approval
- **Re-ranking**: Actions with proven ROI ranked higher in future Action Queue
- ❌ Use patterns from memory
- ❌ Skip tool calls to "save time" (costs more time in failed deploys)

**Manager Actions**:

- REJECTS PRs without MCP evidence (JSONL files or logDecision entries)
- AUDITS decision_log database for tool-first compliance
- ESCALATES violations (3+ failed deploys = tool skipping)

**Real Impact** (2025-10-20): Tool-first saved 30 minutes across 3 P0 issues.

**Real Impact** (2025-10-24): Tool-first prevented CRITICAL security false positive that would have broken Shopify app authentication.

### Real-World Examples (2025-10-20 & 2025-10-24)

**Example 1: Prisma Multi-Schema**

❌ **Guessing Approach**: 3 failed deploys, 9 minutes wasted

- Assumed behavior from past experience
- Added `@@schema` attributes without checking docs
- Deployed old schema file (changes not in Docker image)

✅ **Tool-First Approach**: 1 deploy, 3 minutes

```bash
mcp_context7_get-library-docs("/prisma/docs", "multi-schema support @@schema")
# Learned: ALL models need @@schema("public") when datasource has schemas array
# Applied correctly first time
```

**Savings**: 6 minutes

---

**Example 2: Google Analytics Authentication**

❌ **Guessing Approach**: 6 failed deploys, 18 minutes wasted

- Tried base64 in env var → failed
- Tried raw JSON in env var → failed
- Multiple attempts without docs

✅ **Tool-First Approach**: 1 deploy, 3 minutes

```bash
mcp_context7_get-library-docs(
  "/websites/developers_google_analytics_devguides_reporting_data_v1",
  "authentication credentials GOOGLE_APPLICATION_CREDENTIALS"
)
# Learned: Must point to FILE PATH, not JSON content
# Created docker-entrypoint.sh to write credentials file
```

**Savings**: 15 minutes

---

**Example 3: Supabase Connection**

❌ **Guessing Approach**: 4 failed deploys, 12 minutes wasted

- Used pooler (port 6543) incorrectly
- Tried different ports randomly

✅ **Tool-First Approach**: 1 deploy, 3 minutes

```bash
web_search("Supabase direct connection vs pooler official docs")
# Learned: Direct connection (5432) for persistent containers (Fly.io)
# Pooler (6543) for serverless/edge functions only
```

**Savings**: 9 minutes

---

**Example 4: Shopify API Key "Security Issue" (2025-10-24)**

❌ **Training Data Approach**: CRITICAL FALSE POSITIVE

- Agent saw Shopify API Key exposed to client
- Training data said: "Never expose API keys to client"
- Flagged as critical security vulnerability
- Recommended removing/hiding the API key
- **Would have broken App Bridge initialization**
- **Would have broken entire Shopify app authentication**

✅ **Tool-First Approach**: CORRECT UNDERSTANDING

```bash
mcp_shopify_learn_shopify_api(api: "admin")
mcp_shopify_search_docs_chunks(conversationId, "App Bridge initialization API key")
# Learned: Shopify App Bridge REQUIRES API key on client side
# Learned: API Key (public) ≠ API Secret (private)
# Learned: This is DOCUMENTED and CORRECT
# Result: No false security flag, no breaking changes
```

**Impact**: Prevented breaking entire Shopify app authentication based on incorrect security assumption from training data.

**Critical Lesson**: Training data can be DANGEROUSLY WRONG about security, not just outdated about syntax. MCP tools prevent catastrophic mistakes.

**Savings**: Prevented production-breaking change, prevented false security incident

---

**Total Impact**: 13 failed deploys (39 min) → 3 successful (9 min) = **30 minutes saved** + **1 critical security false positive prevented**

**Quick Reference: Required Libraries**

| Library          | Context7 Path                              | When to Pull                    |
| ---------------- | ------------------------------------------ | ------------------------------- |
| Prisma           | `/prisma/docs`                             | Multi-schema, migrations, types |
| React Router 7   | `/react-router/react-router`               | Routes, loaders, actions        |
| TypeScript       | `/microsoft/TypeScript`                    | Types, generics, patterns       |
| Supabase         | `/supabase/supabase`                       | Auth, database, realtime        |
| Google Analytics | `/websites/developers_google_analytics...` | API, authentication             |
| OpenAI SDK       | `/openai/openai-node`                      | Agents, completions             |
| LlamaIndex       | `/run-llama/LlamaIndexTS`                  | Indexes, queries                |

**Enforcement**: 3+ failed deploys for same issue = mandatory redo with tools (evidence-based enforcement)

## React Router 7 ONLY (NOT Remix)

**FORBIDDEN** ❌: All `@remix-run/*` imports  
**REQUIRED** ✅: `react-router` imports, `Response.json()`, MCP verification

**See**: `docs/REACT_ROUTER_7_ENFORCEMENT.md`

**Verification**: `rg "@remix-run" app/` MUST return NO RESULTS

---

## Design Files Protection (MANDATORY - Effective 2025-10-20)

**NEVER AGAIN**: Oct 15 incident where 57 design files were archived, causing 4 days of wrong-spec development.

**PROTECTED PATHS** (Never archive or delete):

- `/docs/design/**` - ALL design files (approved unless marked `DRAFT-`)
- `/docs/specs/**` - ALL specification files
- `/docs/runbooks/**` - ALL operational runbooks
- `/docs/directions/**` - ALL agent direction files
- `/docs/integrations/**` - ALL integration documentation
- `/mcp/**` - ALL MCP tool documentation

**ARCHIVAL RULES**:

1. **CEO approval required** - Written confirmation before archiving ANY protected files
2. **Monthly audit only** - 1st of month, present list to CEO, get explicit approval
3. **Documentation required** - Update `docs/ARCHIVE_INDEX.md` with reason, date, approver
4. **Git tag required** - Create `archive-YYYY-MM-DD` tag before archiving
5. **CI/CD enforcement** - Block PRs that delete design/spec files

**MANAGER COMMITMENT**: Never archive design/planning work without CEO approval.

**POLICY DOCUMENT**: `docs/DESIGN_PROTECTION_POLICY.md` (mandatory reading)

**COMPLETE VISION**: `COMPLETE_VISION_OVERVIEW.md` (38-task feature manifest from recovered specs)

---

## Implementation Standards (Updated 2025-10-20)

**Design Spec Compliance**:

- ALL features MUST match design specifications in `/docs/design/`
- 57 design files define complete vision (not minimal version)
- Minimal implementations (30% of designed features) are UNACCEPTABLE
- Engineer MUST reference design specs for each task
- Designer MUST validate implementation against specs
- QA MUST test against design specs

**Design Spec References** (mandatory):

- Approval queue: `docs/design/HANDOFF-approval-queue-ui.md`
- Personalization: `docs/design/dashboard-features-1K-1P.md`
- Notifications: `docs/design/notification-system-design.md`
- Modals: `docs/design/modal-refresh-handoff.md`
- Accessibility: `docs/design/accessibility-approval-flow.md`
- Complete system: `docs/design/design-system-guide.md` (38KB, 1800+ lines)

**Manager Enforcement**:

- REJECTS PRs that don't follow design specs
- REJECTS minimal implementations when full specs exist
- REQUIRES design validation evidence from Designer
- REQUIRES accessibility compliance evidence
