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
feedback/<agent>/<YYYY-MM-DD>.md
docs/_archive/**
mcp/**  # MCP tools documentation (critical infrastructure - DO NOT REMOVE)
```

## No Ad-Hoc Files (STRICT - Effective 2025-10-20)

**All agents and Manager: NEVER create new .md files without 3-Question Test**

### The 3-Question Test (MANDATORY)

Before creating ANY new .md file:

1. **Can this go in my feedback file?**  
   - YES → Use `feedback/{agent}.md` and STOP
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

## Process

- **Single ledger**: GitHub Issues (Task form) with `Agent`, `Definition of Done`, `Acceptance checks`, and **Allowed paths**.
- PR must state `Fixes #<issue>`, satisfy DoD, and pass checks. Danger enforces.
- Agents write **only** to their daily feedback file and code paths.
- Manager owns NORTH_STAR, RULES, Operating Model, directions, and PROJECT_PLAN.

## Security

- Enable GitHub **push protection** & secret scanning.
- **Gitleaks** runs on every PR & push; SARIF to Security tab.
- No secrets in code or docs; store in GitHub Environments/Secrets, Local Vault, and Fly.io secrets (as needed).

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
6. Evidence logged in manager feedback

**NEVER**:
- ❌ Add `prisma migrate deploy` to fly.toml
- ❌ Add `prisma db push` to package.json
- ❌ Run migrations in release_command
- ❌ Use `--accept-data-loss` flag

**Enforcement**: Manager REJECTS PRs that add database modification commands to deployment paths.

## Agents & HITL

- **Dev agents** (Cursor/Codex/Claude): follow runbooks & directions; no Agent SDK.
- **In‑app agents** (OpenAI Agents SDK): HITL enforced for `ai-customer` using built‑in interruptions.

## MCP Tools (MANDATORY - Effective 2025-10-20)

**ALL agents (including Manager) MUST use MCP tools BEFORE writing code** - non-negotiable:

### 1. Context7 MCP: PULL DOCS BEFORE CODE (STRICT)

**Rule**: NEVER write code without pulling official documentation first

**Required for**:
- Prisma (`/prisma/docs`) - multi-schema, migrations, types
- React Router 7 (`/react-router/react-router`) - routes, loaders, actions  
- TypeScript (`/microsoft/TypeScript`) - types, generics, patterns
- Supabase (`/supabase/supabase`) - auth, database, realtime
- Google Analytics (`/websites/developers_google_analytics...`) - API, authentication
- OpenAI SDK (`/openai/openai-node`) - agents, completions
- LlamaIndex (`/run-llama/LlamaIndexTS`) - indexes, queries
- **ANY npm package** you're modifying

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

### 2. Shopify Dev MCP: VALIDATE ALL GraphQL

**Rule**: MANDATORY for ALL Shopify GraphQL code
- Validate ALL queries with `validate_graphql_codeblocks`
- Validate ALL components with `validate_component_codeblocks`
- Log conversation IDs in feedback
- NO Shopify code without MCP validation

### 3. Web Search: When Context7 Doesn't Have Library

**Rule**: Use `web_search` for official docs if library not in Context7
- Example: `web_search("Supabase direct connection vs pooler official docs")`
- Always include "official docs" or "documentation" in search
- Log search results in feedback

### 4. Chrome DevTools MCP: Required for UI Testing

**Rule**: Designer, Pilot, QA agents MUST use for production testing
- Take snapshots before claiming "tested"
- Log screenshot/snapshot evidence in feedback

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

**MUST DO**:
- ✅ Pull docs BEFORE writing code (not after)
- ✅ Log tool usage with timestamp in feedback
- ✅ Quote specific requirement from docs
- ✅ Apply official patterns (not training data)

**MUST NOT**:
- ❌ Guess library behavior from training data (it's 6-12 months old)
- ❌ Deploy without verifying against docs
- ❌ Use patterns from memory
- ❌ Skip tool calls to "save time" (costs more time in failed deploys)

**Manager Actions**:
- REJECTS PRs without MCP evidence in feedback
- AUDITS feedback for tool-first compliance
- ESCALATES violations (3+ failed deploys = tool skipping)

**Real Impact** (2025-10-20): Tool-first saved 30 minutes across 3 P0 issues.

### Real-World Examples (2025-10-20 P0 Fixes)

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

**Total Impact Today**: 13 failed deploys (39 min) → 3 successful (9 min) = **30 minutes saved**

**Quick Reference: Required Libraries**

| Library | Context7 Path | When to Pull |
|---------|---------------|--------------|
| Prisma | `/prisma/docs` | Multi-schema, migrations, types |
| React Router 7 | `/react-router/react-router` | Routes, loaders, actions |
| TypeScript | `/microsoft/TypeScript` | Types, generics, patterns |
| Supabase | `/supabase/supabase` | Auth, database, realtime |
| Google Analytics | `/websites/developers_google_analytics...` | API, authentication |
| OpenAI SDK | `/openai/openai-node` | Agents, completions |
| LlamaIndex | `/run-llama/LlamaIndexTS` | Indexes, queries |

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

