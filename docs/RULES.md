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

## Process

- **Single ledger**: GitHub Issues (Task form) with `Agent`, `Definition of Done`, `Acceptance checks`, and **Allowed paths**.
- PR must state `Fixes #<issue>`, satisfy DoD, and pass checks. Danger enforces.
- Agents write **only** to their daily feedback file and code paths.
- Manager owns NORTH_STAR, RULES, Operating Model, directions, and PROJECT_PLAN.

## Security

- Enable GitHub **push protection** & secret scanning.
- **Gitleaks** runs on every PR & push; SARIF to Security tab.
- No secrets in code or docs; store in GitHub Environments/Secrets, Local Vault, and Fly.io secrets (as needed).

## Agents & HITL

- **Dev agents** (Cursor/Codex/Claude): follow runbooks & directions; no Agent SDK.
- **In‑app agents** (OpenAI Agents SDK): HITL enforced for `ai-customer` using built‑in interruptions.

## MCP Tools (MANDATORY - Effective 2025-10-19)

**All dev agents MUST use MCP tools** - non-negotiable:

1. **Shopify Dev MCP**: MANDATORY for ALL Shopify GraphQL code
   - Validate ALL queries with `validate_graphql_codeblocks`
   - Log conversation IDs in feedback
   - NO Shopify code without MCP validation

2. **Context7 MCP**: MANDATORY for ALL library usage
   - Verify patterns for React Router 7, Prisma, Polaris
   - Get official documentation before coding
   - NO library code without MCP verification

3. **Chrome DevTools MCP**: Required for UI testing
   - Designer, Pilot, QA agents MUST use for production testing

**Evidence**: Log MCP conversation IDs in all feedback entries

**Enforcement**: Manager REJECTS PRs without MCP evidence

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
