# HotDash — Hot Rod AN Operator Control Center

**Shopify-embedded admin app** providing real-time operational intelligence with Human-in-the-Loop (HITL) approval workflow powered by intelligent agent orchestration.

**Live App**: https://admin.shopify.com/store/hotroddash/apps/hotdash  
**Status**: 8/13 phases complete (building Growth Engine to 10× sales)

---

## 🎯 Growth Engine Vision

**Goal**: Enable a single operator to 10× sales at hotrodan.com

**Reference**: `docs/agent-design/` (read-only, canonical architecture)

### How It Works

**Customer Path**:
- Customer message → Chatwoot webhook → Customer-Front Agent
- Customer-Front detects intent → hands off to ONE specialist sub-agent
- Sub-agent (Accounts or Storefront) queries MCP → returns evidence
- Customer-Front reassembles redacted reply + PII card
- Operator approves → sent to customer

**Operator Path**:
- Specialist Agents (Analytics, Inventory, SEO/Perf, Risk) run on schedules/events
- Each emits Action cards (evidence + impact + rollback) → Action Queue
- CEO-Front Agent surfaces Top-10 opportunities (Revenue × Confidence × Ease)
- Operator approves best actions → executed with audit trail

**Security**:
- PII Broker fronts Customer Accounts MCP (OAuth, redaction, audit)
- ABAC Policy: Only Accounts Sub-agent can access Customer Accounts MCP
- MCP Separation: Storefront (public) vs Customer Accounts (PII, OAuth)
- Redaction: Public replies NO PII; PII card (operator-only) has full details

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Access app
# Visit: http://localhost:3000
# Or: https://admin.shopify.com/store/hotroddash/apps/hotdash
```

---

## 🏗️ Architecture

### Core Stack
- **Frontend**: React Router 7 + Shopify Polaris + Vite
- **Backend**: Node/TypeScript + Supabase (PostgreSQL + RLS)
- **Deployment**: Fly.io
- **Database**: Supabase (managed PostgreSQL)
- **Real-time**: Server-Sent Events (SSE) / WebSocket

### Growth Engine (Agent Orchestration)

**Front-End Agents**:
- **Customer-Front** (Chatwoot) → triage → hand off → ONE sub-agent → reassemble → HITL
- **CEO-Front** (dashboard) → read Action Queue → Top-10 opportunities → evidence-first

**Specialist Sub-Agents**:
- **Accounts Sub-Agent** → OAuth + Customer Accounts MCP (ONLY agent with PII access, ABAC protected)
- **Storefront Sub-Agent** → Storefront MCP (catalog/policies, public, no PII)

**Specialist Agents (Scheduled & Event-Driven)**:
- **Analytics** (daily GSC/GA4) → revenue opportunities → Action Queue
- **Inventory** (hourly + webhooks) → stock risk → reorder proposals → Action Queue
- **SEO/Perf** (daily + events) → page optimization → CWV tasks → Action Queue
- **Risk** (continuous + events) → fraud detection → alerts → Action Queue

**Key Principles**:
- Strict handoffs (one owner at a time, no fan-out)
- MCP separation (Storefront vs Customer Accounts vs Dev)
- PII Broker + ABAC (Customer Accounts protected)
- Unified Action Queue (standardized fields, evidence-first)
- Interactive agents (schedules/events, not passive)

**Dev Tools**: MCP servers (GitHub, Context7, Fly.io, Shopify Dev, Chrome DevTools)

---

## 📚 Documentation

### Governance (MANDATORY Reading)
- `docs/NORTH_STAR.md` - Vision, principles, agent architecture, Action Queue
- `docs/OPERATING_MODEL.md` - Pipeline, handoffs, PII protection, ABAC, no-ask execution
- `docs/RULES.md` - Markdown policy, process, security, agents
- `docs/REACT_ROUTER_7_ENFORCEMENT.md` - React Router 7 ONLY (no Remix)

### Agent Architecture (Canonical Reference)
- `docs/agent-design/` - **Growth Engine architecture** (read-only, 11 files)
  - `README-GrowthEngine.md` - Overview and success criteria
  - `architecture/Agents_and_Handoffs.md` - Agent roles, handoffs, tool allowlists
  - `integrations/Shopify_MCP_Split.md` - Storefront vs Customer Accounts MCP
  - `integrations/Chatwoot_Intake.md` - Customer-Front agent intake
  - `security/PII_Broker_and_ABAC.md` - PII protection, ABAC policy, redaction
  - `dashboard/Action_Queue.md` - Action Queue contract (standardized fields)
  - `data/Telemetry_Pipeline.md` - GSC + GA4 pipeline, freshness labels
  - `manager/Plan_Molecules.md` - Per-lane molecules with DoD
  - `ops/Background_Jobs.md` - Schedules, events, SLOs
  - `qa/Claude_QA_Gates.md` - QA checks (evidence, handoffs, PII)
  - `runbooks/Agent_Startup_Checklist.md` - No-ask execution pattern

### Design Specifications (ALL 57 Files)
- `/docs/design/` - **Complete design library** (protected, never archive)
- `COMPLETE_VISION_OVERVIEW.md` - 38-task feature manifest + Growth Engine
- `docs/DESIGN_PROTECTION_POLICY.md` - Protection policy (mandatory)

**KEY SPECS**:
- `docs/design/HANDOFF-approval-queue-ui.md` - Approval queue
- `docs/design/dashboard-features-1K-1P.md` - Personalization + notifications
- `docs/design/notification-system-design.md` - Notification system
- `docs/design/modal-refresh-handoff.md` - Enhanced modals
- `docs/design/design-system-guide.md` - Design system (38KB, 1800+ lines)
- `docs/design/dashboard_wireframes.md` - Complete wireframes

### Agent Directions
- `/docs/directions/` - 17 agent direction files
- Updated: 2025-10-21 (aligned with Growth Engine molecules)

### MCP Tools (MANDATORY)
- `mcp/` - MCP tool documentation
- Shopify Dev MCP - GraphQL validation (mandatory)
- Context7 MCP - Library patterns (mandatory)
- Chrome DevTools MCP - UI testing (Designer, QA, Pilot)

---

## 🛡️ Design Files Protection

**NEVER ARCHIVE OR DELETE**:
- `/docs/design/**` - ALL design files (57 files)
- `/docs/specs/**` - ALL specification files  
- `/docs/runbooks/**` - ALL operational runbooks
- `/docs/directions/**` - ALL agent direction files
- `/docs/agent-design/**` - ALL Growth Engine architecture files (read-only)

**Why**: Oct 15 incident - 57 design files archived, agents built to wrong spec (30% vs 100%)

**Policy**: `docs/DESIGN_PROTECTION_POLICY.md`

**Enforcement**: CI/CD blocks design file deletions, CEO approval required for any archival

---

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Accessibility tests
npm run test:a11y

# All tests
npm run test:ci

# Security scan (Gitleaks)
npm run scan
```

---

## 📦 Database

**Supabase Tables**:
- `decision_log` - HITL approvals with grading metadata
- `user_preferences` - Dashboard personalization
- `notifications` - Notification center
- `sales_pulse_actions` - Sales modal actions
- `inventory_actions` - Inventory reorder approvals
- `product_suggestions` (idea_pool) - Always-on idea pipeline
- `action_queue` - Specialist agent action cards
- `pii_audit_log` - Customer Accounts MCP audit trail
- Plus 20+ operational tables

**Migrations**: `supabase/migrations/`  
**RLS Tests**: `supabase/rls_tests.sql`

---

## 🎨 Design System

**Design Guide**: `docs/design/design-system-guide.md` (38KB, 1800+ lines)

**Components**:
- 8 dashboard tiles (TileCard wrapper + tile-specific)
- ApprovalCard
- Enhanced modals (CX, Sales, Inventory)
- Settings page (4 tabs)
- Notification center
- Onboarding tour

**Tokens**:
- Colors (Hot Rodan red #E74C3C, status colors)
- Spacing (8px grid)
- Typography (6-size scale)
- Dark mode palette

**Polaris**: Shopify Polaris components throughout

---

## 🔒 Security

### Application Security
- Row Level Security (RLS) on all Supabase tables
- Gitleaks secret scanning (pre-commit + CI)
- GitHub Push Protection
- No secrets in code
- Passwords in vault only
- MCP-validated GraphQL (no freehand queries)

### Growth Engine Security
- **PII Broker**: Fronts Customer Accounts MCP; handles OAuth, redaction, audit
- **ABAC Policy**: `(agent=accounts_sub) AND (session.customer_id matches) AND (tool in allowlist)`
- **Redaction**: Public replies contain NO PII; PII card (operator-only) has full details
- **MCP Separation**: Storefront (public) vs Customer Accounts (OAuth + ABAC) vs Dev (staging only)
- **Audit Trail**: Every Customer Accounts MCP call logged (timestamp, agent, tool, request_id)

---

## 🚦 CI/CD

**Guardrails**:
- Docs allow-list (no stray .md files)
- Danger (issue linkage, DoD, allowed paths)
- Gitleaks (secret protection)
- Validate AI Agent Config
- **Design file protection** (block deletions)

**GitHub Actions**: `.github/workflows/`

---

## 📖 Key Concepts

**Growth Engine**:
- Two front-end agents (Customer-Front, CEO-Front)
- Specialist sub-agents (Accounts, Storefront)
- Specialist agents on schedules/events (Analytics, Inventory, SEO/Perf, Risk)
- Unified Action Queue (Top-10 opportunities)
- Strict handoffs (one owner at a time)
- Evidence-first (MCP request IDs, dataset links)

**HITL (Human-in-the-Loop)**:
- AI agents draft actions
- Human approves/rejects with grading (1-5 scale)
- System learns from grades
- Full audit trail

**Grading System** (tone/accuracy/policy):
- 1-5 scale on all customer-facing actions
- Stored in decision_log
- Used for fine-tuning/evals
- Target: tone ≥4.5, accuracy ≥4.7, policy ≥4.8

**Action Queue**:
- Standardized contract (evidence, impact, confidence, ease, rollback)
- Top-10 ranking (Revenue × Confidence × Ease)
- All specialist agents emit same format
- Evidence links to MCP sources or telemetry

**PII Protection**:
- Accounts Sub-Agent ONLY agent with Customer Accounts MCP access
- ABAC policy enforced before every call
- PII Broker handles OAuth, redaction, audit
- Public replies redacted; PII card (operator-only) has full details

**Operator-First**:
- No context switching
- One control center for everything
- Real-time data
- Instant actions

---

## 🎯 Current Status

**Implemented** (Phases 1-8, 62%):
- ✅ 13 dashboard tiles (8 core + 5 analytics)
- ✅ Basic modals
- ✅ Enhanced modals with grading (Phases 2-6)
- ✅ Settings page (drag & drop, theme, visibility)
- ✅ Notification system (toast, banner, browser)
- ✅ Real-time features (SSE, live badges)
- ✅ Analytics UI (Chart.js, 4 tiles, 4 modals)

**Building** (Phases 9-13, 38% - Growth Engine):
- ⏳ Customer-Front Agent (Chatwoot intake + handoffs)
- ⏳ CEO-Front Agent (Action Queue reader)
- ⏳ Accounts Sub-Agent (Customer Accounts MCP + OAuth + ABAC)
- ⏳ Storefront Sub-Agent (Storefront MCP)
- ⏳ Specialist Agents (Analytics, Inventory, SEO/Perf, Risk)
- ⏳ Action Queue (unified interface, Top-10 ranking)
- ⏳ PII Broker + ABAC
- ⏳ Telemetry Pipeline (GSC → BigQuery)
- ⏳ Onboarding flow
- ⏳ Approval history

**Timeline**: 3-4 days (30 hours, remaining 38 tasks)

---

## 🤝 Contributing

**Agent Process**:
1. Read direction file: `docs/directions/{agent}.md`
2. Reference design specs: `docs/design/*.md`
3. Reference agent architecture: `docs/agent-design/*.md`
4. Use MCP tools (Shopify Dev + Context7) - log conversation IDs
5. NO `@remix-run` imports - React Router 7 ONLY
6. Follow design specs EXACTLY
7. Document agent handoffs (if applicable)
8. Verify Action Queue format (if applicable)
9. Report progress: `logDecision()` with taskId, status, progressPct (database - primary) + optional `feedback/{agent}/YYYY-MM-DD.md` (backup)

**Manager Review**:
- Validates against design specs
- Requires Designer sign-off
- Checks accessibility compliance
- Verifies MCP evidence
- Checks agent handoffs (if applicable)
- Verifies Action Queue format (if applicable)
- Confirms PII protection (if applicable)
- Rejects minimal implementations

---

## 📄 License

Proprietary - Hot Rodan LLC

---

## 📞 Contact

**CEO**: Justin (Hot Rodan LLC)  
**Support**: customer.support@hotrodan.com

---

**Building the Growth Engine - evidence-first, secure, operator-friendly** ✅
