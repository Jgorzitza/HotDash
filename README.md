# HotDash — Hot Rod AN Operator Control Center

**Shopify-embedded admin app** providing real-time operational intelligence with Human-in-the-Loop (HITL) approval workflow.

**Live App**: https://admin.shopify.com/store/hotroddash/apps/hotdash  
**Status**: 6/8 tiles working (building to complete vision)

---

## 🎯 Complete Vision (Option A)

**What We're Building** (from 57 design specifications):

### Dashboard
- **8 real-time tiles** (Ops, Sales, Fulfillment, Inventory, CX, SEO, Idea Pool, Approvals Queue)
- **Drag & drop** tile reordering
- **Tile visibility** toggles (show/hide)
- **Personalization** (saved per user)

### HITL Workflow
- **Approval queue** (`/approvals`) with risk badges
- **Enhanced modals** with grading sliders (tone/accuracy/policy 1-5)
- **Multiple actions** (approve/edit/escalate/resolve)
- **Approval history** with CSV export

### Notifications
- **Toast messages** (success/error/info)
- **Banner alerts** (queue backlog, performance, health)
- **Desktop notifications** (browser, sound option)
- **Badge indicators** (nav items, real-time counts)

### Settings & Personalization
- **Settings page** (4 tabs: Dashboard, Appearance, Notifications, Integrations)
- **Theme toggle** (Light/Dark/Auto)
- **Notification preferences** (desktop, sound, frequency)
- **Integration management**

### Advanced Features
- **Real-time updates** (SSE, live indicators, auto-refresh)
- **Data visualization** (sparklines, charts in tiles/modals)
- **Onboarding flow** (welcome modal, 4-step tour)
- **Dark mode** (Hot Rodan red adjusted)
- **Mobile optimized** (touch-friendly, responsive)
- **WCAG 2.2 AA** accessibility (keyboard nav, screen readers)

**Design Specs**: `/docs/design/` (57 files, ~500KB)  
**Complete Vision**: `COMPLETE_VISION_OVERVIEW.md`

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

## 📚 Documentation

### Governance (MANDATORY Reading)
- `docs/NORTH_STAR.md` - Vision, principles, scope
- `docs/OPERATING_MODEL.md` - Pipeline, guardrails, roles
- `docs/RULES.md` - Markdown policy, process, security, agents
- `docs/REACT_ROUTER_7_ENFORCEMENT.md` - React Router 7 ONLY (no Remix)

### Design Specifications (ALL 57 Files)
- `/docs/design/` - **Complete design library** (protected, never archive)
- `COMPLETE_VISION_OVERVIEW.md` - 38-task feature manifest
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
- Updated: 2025-10-20 (all agents directed to build complete vision)

### MCP Tools (MANDATORY)
- `mcp/` - MCP tool documentation
- Shopify Dev MCP - GraphQL validation (mandatory)
- Context7 MCP - Library patterns (mandatory)
- Chrome DevTools MCP - UI testing (Designer, QA, Pilot)

---

## 🛡️ Design Files Protection

**NEVER ARCHIVE OR DELETE**:
- `/docs/design/**`
- `/docs/specs/**`
- `/docs/runbooks/**`
- `/docs/directions/**`

**Why**: Oct 15 incident - 57 design files archived, agents built to wrong spec (30% vs 100%)

**Policy**: `docs/DESIGN_PROTECTION_POLICY.md`

**Enforcement**: CI/CD blocks design file deletions, CEO approval required for any archival

---

## 🏗️ Architecture

- **Frontend**: React Router 7 + Shopify Polaris + Vite
- **Backend**: Node/TypeScript + Supabase (PostgreSQL + RLS)
- **Agents**: OpenAI Agents SDK (TypeScript) with HITL
- **Dev Tools**: MCP servers (GitHub, Context7, Fly.io, Shopify, Chrome DevTools)
- **Deployment**: Fly.io
- **Database**: Supabase (managed PostgreSQL)
- **Real-time**: Server-Sent Events (SSE) / WebSocket

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

- Row Level Security (RLS) on all Supabase tables
- Gitleaks secret scanning (pre-commit + CI)
- GitHub Push Protection
- No secrets in code
- Passwords in vault only
- MCP-validated GraphQL (no freehand queries)

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

**Operator-First**:
- No context switching
- One control center for everything
- Real-time data
- Instant actions

---

## 🎯 Current Status

**Implemented** (30%):
- ✅ 6 dashboard tiles
- ✅ Basic modals
- ✅ Tile status system
- ✅ Loading/error states

**Building** (70% - Option A):
- ⏳ Approval queue route
- ⏳ Enhanced modals with grading
- ⏳ 2 missing tiles (Idea Pool, Approvals Queue)
- ⏳ Notification system
- ⏳ Dashboard personalization
- ⏳ Settings page
- ⏳ Real-time features
- ⏳ Onboarding flow
- ⏳ Data visualization
- ⏳ Approval history

**Timeline**: 3-4 days (30 hours, 38 tasks)

---

## 🤝 Contributing

**Agent Process**:
1. Read direction file: `docs/directions/{agent}.md`
2. Reference design specs: `docs/design/*.md`
3. Use MCP tools (Shopify Dev + Context7) - log conversation IDs
4. NO `@remix-run` imports - React Router 7 ONLY
5. Follow design specs EXACTLY
6. Write feedback: `feedback/{agent}/YYYY-MM-DD.md`

**Manager Review**:
- Validates against design specs
- Requires Designer sign-off
- Checks accessibility compliance
- Verifies MCP evidence
- Rejects minimal implementations

---

## 📄 License

Proprietary - Hot Rodan LLC

---

## 📞 Contact

**CEO**: Justin (Hot Rodan LLC)  
**Support**: customer.support@hotrodan.com

---

**Building the complete vision - not the minimal version** ✅
