# 🎯 COMPLETE VISION: Hot Rod AN Operator Control Center

**Date**: 2025-10-20T01:00:00Z  
**Source**: Recovered design specifications (57 files, ~500KB)  
**Status**: Comprehensive overview of YOUR complete vision

---

## EXECUTIVE SUMMARY

**Your Vision**: A **world-class, operator-first control center** embedded in Shopify Admin that:
- Centralizes ALL operational data in one place
- Routes EVERY action through Human-in-the-Loop approval
- Learns from your decisions to get better over time
- Provides complete customization and personalization
- Delivers real-time alerts and notifications
- Maintains full accessibility (WCAG 2.2 AA)
- Matches Hot Rodan brand (red accent, speed theme)

**Current Implementation**: ~30% of vision  
**Recovery Status**: ✅ ALL design specs restored and verified

---


## 0. GROWTH ENGINE (Agent Orchestration)

**Reference**: `docs/agent-design/` (read-only, canonical architecture)

**Purpose**: Enable a single operator to 10× sales through intelligent agent orchestration

### 0.1 Agent Architecture

**Front-End Agents**:
- **Customer-Front Agent** (Chatwoot intake):
  - Detects intent from customer messages
  - Hands off to exactly ONE specialist sub-agent
  - Reassembles redacted reply + PII card
  - Submits for HITL approval
  - Pattern: Triage → Hand off → Wait → Reassemble → Approve
  
- **CEO-Front Agent** (Operator dashboard):
  - Reads Action Queue (no write access)
  - Surfaces Top-10 opportunities (Revenue × Confidence × Ease)
  - Evidence-first (never invents data)
  - Read-only Storefront MCP access

**Specialist Sub-Agents**:
- **Accounts Sub-Agent**:
  - ONLY agent allowed to call Customer Accounts MCP
  - OAuth 2.0 + PKCE per customer session
  - ABAC policy: `(agent=accounts_sub) AND (session.customer_id matches) AND (tool in allowlist)`
  - Returns structured, redacted data
  - All calls audited (timestamp, agent, tool, MCP request_id)
  
- **Storefront Sub-Agent**:
  - Storefront MCP for catalog/policies/cart
  - Public shopping context (no PII)
  - Availability, pricing, product fit queries

**Specialist Agents (Scheduled & Event-Driven)**:
- **Analytics Agent** (daily + events):
  - GSC Bulk Export → BigQuery (daily)
  - GA4 Data API (runReport)
  - Opportunity rules: rank 4-10, CTR gaps, high-revenue poor CTR pages
  - Emits Action cards with $$ impact
  
- **Inventory Agent** (hourly + webhooks):
  - Stock-risk thresholds (velocity vs on-hand vs POs)
  - Slow-mover and back-in-stock playbooks
  - Reorder proposals with evidence + rollback
  
- **Content/SEO/Perf Agent** (daily + events):
  - Programmatic page opportunities
  - Internal link rules
  - CWV tasks tied to $$ pages
  - A/B harness specs
  
- **Risk Agent** (continuous + events):
  - Order aging, carrier delays
  - Refund anomalies
  - Fraud detection

### 0.2 Handoff Pattern (Strict)

**Customer Request Flow**:
1. Customer-Front Agent **triages** incoming message (Chatwoot webhook)
2. **Hands off** to exactly ONE specialist sub-agent (Accounts or Storefront)
3. Sub-agent **owns** the request until complete
4. Returns structured result with MCP evidence (request IDs)
5. Front agent **reassembles** redacted reply + PII card
6. **Submits** for HITL approval
7. Operator approves/rejects
8. System executes (if approved) and logs to audit trail

**No Fan-Out**: One sub-agent owns request at a time (prevents token burn, conflicting state)

**Acceptance**:
- Every request shows clear owner (which sub-agent handled it)
- Every reply cites MCP request IDs and data sources
- PII never in public text (redacted)
- PII card present for operator review
- Handoff log includes timing and evidence trail

### 0.3 Security Architecture

**MCP Separation**:
- **Storefront MCP**: Public shopping context
  - Used by: Customer-Front, CEO-Front, Specialist Agents
  - Returns: Products, policies, cart data (no PII)
  
- **Customer Accounts MCP**: Authenticated customer context
  - Used by: Accounts Sub-agent ONLY
  - Requires: OAuth 2.0 + PKCE (token per session)
  - Returns: Orders, returns, account details (PII)
  
- **Dev MCP**: Development/staging only
  - NEVER in production flows
  - Production bundles contain NO Dev MCP import

**PII Broker**:
- Fronts all Customer Accounts MCP calls
- Functions:
  - OAuth 2.0 + PKCE token management
  - Token rotation and secure storage
  - Field-level redaction (emails, addresses, payment info)
  - Audit line per call: `{timestamp, agent, tool, purpose, mcp_request_id}`
  - Logs separate from chat transcripts

**ABAC Policy** (enforced before every Customer Accounts MCP call):
```
Allow IF:
  (agent = accounts_sub)
  AND
  (session.customer_id matches request.customer_id)
  AND
  (tool in allowlist)
```

**Redaction Discipline**:
- **Public Reply** (sent to customer):
  - NO PII (no emails, addresses, payment info)
  - Masked formats: `j***@example.com`, `Order #1234`
  - General policy statements only
  
- **PII Card** (operator-only):
  - Full details (email, address, order specifics)
  - Not sent to customer
  - Visible in approval drawer only

**Acceptance**:
- Red-team test: PII exfiltration via Customer-Front → BLOCKED or REDACTED
- Operator approval required for any reply with account facts
- End-to-end audit trace visible for order-status case
- Tokens never logged
- ABAC policy pass rate 100%

### 0.4 Action Queue (Unified Interface)

**Purpose**: Single interface for all specialist agent proposals

**Standard Contract** (every specialist agent emits):
```typescript
{
  type: string; // seo_fix, perf_task, inventory_risk, content_draft, etc.
  target: string; // page/SKU/collection/customer-safe-id
  draft: string; // what will change (human-readable)
  evidence: {
    mcp_request_ids: string[];
    dataset_links: string[];
    telemetry_refs: string[];
  };
  expected_impact: {
    metric: string; // revenue, CTR, conversion, etc.
    delta: number; // projected change
    unit: string; // $, %, sessions
  };
  confidence: number; // 0.0-1.0
  ease: 'simple' | 'medium' | 'hard';
  risk_tier: 'policy' | 'safety' | 'perf' | 'none';
  can_execute: boolean; // policy-gated
  rollback_plan: string; // one-liner
  freshness_label: string; // "GSC 48-72h lag", "Real-time", etc.
}
```

**Ranking Algorithm**:
- Primary: `Expected Revenue × Confidence × Ease`
- Tie-breaker 1: Freshness (newer data ranks higher)
- Tie-breaker 2: Risk tier (lower risk ranks higher)

**Top-10 Dock**: Dashboard displays top 10 ranked actions

**Operator Interface**:
- Each Action tile shows:
  - Draft action (human-readable)
  - Evidence links (clickable to MCP sources or telemetry)
  - Expected impact ($ or KPI delta)
  - Confidence + ease + risk badges
  - Single-click: Approve / Edit / Dismiss
  
- Evidence links open MCP sources (Storefront/Customer Accounts) or telemetry reports
- No tile without evidence + rollback plan

**Acceptance**:
- 10+ high-value actions surfaced daily
- 80% acceptance rate on top-ranked actions
- 95% of Action cards include MCP evidence
- Freshness labels accurate 100%

### 0.5 Telemetry Pipeline (Data Flow)

**GSC Bulk Export**:
- Daily export to BigQuery (full fidelity: queries, pages, dimensions)
- Dataset names and partitioning documented
- Freshness label: "GSC 48-72h lag" (typical delay)

**GA4 Data API**:
- runReport for landing page metrics (revenue, CTR, attach)
- Join to GSC keys (page + query dimension)
- Near real-time for event data

**Analytics Agent Transform**:
- Daily: Join GSC + GA4 → Top Opportunities table
- Apply rules: rank 4-10, CTR gap >10%, high-revenue poor CTR pages
- Calculate expected impact ($$ lift per optimization)
- Emit Action cards to Action Queue

**Acceptance**:
- Yesterday's GSC tables in BigQuery (expected row counts)
- GA4 runReport specs documented (dimensions/metrics)
- Joined outputs verified
- Tiles display freshness badges (e.g., "GSC 48-72h lag")
- No alerts on incomplete days

### 0.6 Success Metrics (Growth Engine)

**Agent Performance**:
- **Customer-Front**: <5s triage → handoff; 100% handoff target accuracy
- **Accounts Sub-Agent**: 0 unauthorized MCP calls; ABAC policy pass rate 100%
- **Specialist Agents** (Analytics, Inventory, SEO/Perf, Risk): 95% of Action cards include MCP evidence; freshness labels accurate 100%
- **Action Queue**: 10+ high-value actions surfaced daily; 80% acceptance rate on top-ranked

**Security**:
- 0 PII leaks (red-team tests pass)
- 100% ABAC policy compliance
- Audit trail complete (all Customer Accounts MCP calls logged)
- Tokens never logged

**Operator Efficiency**:
- CEO ad-hoc tool time −50% vs baseline
- Action Queue acceptance rate ≥80%
- Specialist agent uptime ≥99.9%
- Median time-to-approve ≤15 min (CX), same-day (inventory/growth)

### 0.7 Implementation Status (Growth Engine)

**Not Yet Built** (0%):
- ❌ Customer-Front Agent (Chatwoot intake + handoffs)
- ❌ CEO-Front Agent (Action Queue reader)
- ❌ Accounts Sub-Agent (Customer Accounts MCP + OAuth + ABAC)
- ❌ Storefront Sub-Agent (Storefront MCP)
- ❌ Analytics Agent (GSC + GA4 → opportunities)
- ❌ Inventory Agent (stock risk → reorder proposals)
- ❌ Content/SEO/Perf Agent (page optimization → CWV tasks)
- ❌ Risk Agent (fraud detection → alerts)
- ❌ Action Queue UI (unified interface, Top-10 ranking)
- ❌ PII Broker service (OAuth, redaction, audit)
- ❌ ABAC policy enforcement
- ❌ Telemetry pipeline (GSC Bulk Export → BigQuery)

**Existing Foundation** (can leverage):
- ✅ OpenAI Agents SDK installed (`packages/agents/src/ai-ceo.ts`, `ai-customer.ts`)
- ✅ Chatwoot integration (routing, webhooks, API client)
- ✅ Supabase tables (decision_log, approvals ready)
- ✅ HITL workflow (approval queue from Phase 1)

**Next Phase**: M8-M10 (Agent Orchestration + Action Queue + Specialist Agents)

**Estimated Effort**: 20-30 hours (Phases 9-13)

**Spec Files** (canonical reference):
- `docs/agent-design/README-GrowthEngine.md` - Overview
- `docs/agent-design/architecture/Agents_and_Handoffs.md` - Agent roles, handoffs, allowlists
- `docs/agent-design/integrations/Shopify_MCP_Split.md` - MCP separation
- `docs/agent-design/integrations/Chatwoot_Intake.md` - Customer intake
- `docs/agent-design/security/PII_Broker_and_ABAC.md` - Security model
- `docs/agent-design/dashboard/Action_Queue.md` - Action Queue contract
- `docs/agent-design/data/Telemetry_Pipeline.md` - GSC + GA4 pipeline
- `docs/agent-design/manager/Plan_Molecules.md` - Per-lane tasks with DoD
- `docs/agent-design/ops/Background_Jobs.md` - Schedules, events, SLOs
- `docs/agent-design/qa/Claude_QA_Gates.md` - QA requirements
- `docs/agent-design/runbooks/Agent_Startup_Checklist.md` - No-ask execution

**Molecules to Assign** (from Plan_Molecules.md):
- CF-M1, CF-M2, CF-M3 (Customer-Front)
- ACC-M1, ACC-M2, ACC-M3 (Accounts Sub-Agent)
- SF-M1, SF-M2 (Storefront Sub-Agent)
- CEO-M1, CEO-M2 (CEO-Front)
- AN-M1, AN-M2, AN-M3 (Analytics)
- INV-M1, INV-M2 (Inventory)
- SEO-M1, SEO-M2, SEO-M3 (Content/SEO/Perf)
- RISK-M1 (Risk)

---


## 1. DASHBOARD (Main View)

### 1.1 Dashboard Tiles (8 Total)

**CORE TILES** (6 implemented, 2 missing):

1. **✅ Ops Pulse** - Activation rate, SLA metrics
   - Shows 7-day activation percentage
   - Median and P90 resolution times
   - Status badge (Healthy/Attention)

2. **✅ Sales Pulse** - Revenue, orders, top SKUs
   - Total revenue (last 24h)
   - Order count
   - Top 3 SKUs with quantity/revenue
   - Pending fulfillment list
   - "View details" modal

3. **✅ Fulfillment Health** - Order status
   - Unfulfilled orders list
   - In-progress status
   - Empty state: "All orders on track"

4. **✅ Inventory Heatmap** - Stock alerts
   - Low stock alerts
   - Days of cover (WOS)
   - Quantity available
   - "Take action" button

5. **✅ CX Escalations** - Support issues
   - SLA breached conversations
   - Customer name, status
   - "View & Reply" modal
   - Grading system (tone/accuracy/policy)

6. **✅ SEO & Content Watch** - Traffic anomalies
   - Landing page sessions
   - Week-over-week delta
   - Anomaly detection (-24% flags)

7. **❌ Idea Pool** (MISSING) - Product suggestions
   - 5/5 pool capacity indicator
   - Wildcard badge
   - Pending/accepted/rejected counts
   - "View Idea Pool" button
   - **Spec**: dashboard-tiles.md lines 528-670

8. **❌ Approvals Queue** (MISSING) - Pending actions
   - Pending approval count
   - Oldest pending time
   - "Review queue" button
   - Links to /approvals route
   - **Spec**: HANDOFF-approval-queue-ui.md

### 1.2 Dashboard Personalization (NOT BUILT)

**Drag & Drop Tile Reordering**:
- Use @dnd-kit/core library
- Operators can rearrange tiles
- Order saved to Supabase user_preferences table
- Persists across sessions

**Tile Visibility Toggles**:
- Settings page with checkboxes
- Show/hide individual tiles
- "Reset to default" button
- Saves to user_preferences

**User Preferences Table** (Supabase):
```sql
CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  tile_order TEXT[],
  visible_tiles TEXT[],
  default_view TEXT, -- 'grid' or 'list'
  theme TEXT, -- 'light', 'dark', 'auto'
  notification_prefs JSONB,
  updated_at TIMESTAMPTZ
);
```

**Spec**: dashboard-features-1K-1P.md

### 1.3 Real-Time Updates (NOT BUILT)

**Live Update Indicators**:
- Pulse animation on tile when data refreshes
- "Updated 2 seconds ago" timestamp
- Auto-refresh without page reload

**SSE / WebSocket Integration**:
- Real-time tile updates
- Instant approval notifications
- Live chat message indicators
- Connection status indicator

**Spec**: realtime-update-indicators.md

---

## 2. APPROVAL QUEUE SYSTEM (0% BUILT)

**Priority**: P0 - CORE HITL WORKFLOW

### 2.1 Approval Queue Route

**URL**: `/approvals`

**Features**:
- List of pending agent actions
- Auto-refresh every 5 seconds
- Empty state: "All clear!"
- Badge in navigation showing pending count

**Layout**:
```
┌─────────────────────────────────────────┐
│ Approval Queue          [3 Pending]    │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Conversation #123      [HIGH RISK] ││
│ │                                     ││
│ │ Agent: ai-customer                  ││
│ │ Tool: send_email                    ││
│ │ Args: { to: "customer@...", ... }   ││
│ │ Requested: 5 min ago                ││
│ │                                     ││
│ │ [Approve]  [Reject]                 ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Conversation #122   [MEDIUM RISK]  ││
│ │ ...                                 ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### 2.2 ApprovalCard Component

**Features**:
- Shows agent name, tool, arguments
- Risk level badge (HIGH/MEDIUM/LOW)
- Timestamp (relative: "5 min ago")
- Approve/Reject buttons with loading states
- Error banner if action fails
- Auto-refresh on success

**Risk Levels**:
- **HIGH**: send_email, create_refund, cancel_order
- **MEDIUM**: create_private_note, update_conversation
- **LOW**: all other tools

### 2.3 Approval Actions

**Approve**: POST `/approvals/:id/:idx/approve`
- Executes agent action
- Logs to decision_log (Supabase)
- Shows success toast
- Refreshes queue

**Reject**: POST `/approvals/:id/:idx/reject`
- Blocks agent action
- Logs to decision_log
- Shows rejection reason modal
- Refreshes queue

### 2.4 Navigation Integration

**Nav Badge**:
- Shows pending count (e.g. "3" in red badge)
- Updates in real-time
- Clicking nav item goes to /approvals

**Spec**: HANDOFF-approval-queue-ui.md (complete Polaris implementation)

---

## 3. ENHANCED MODALS (10% BUILT)

### 3.1 CX Escalation Modal

**CURRENT** (Basic):
- Conversation ID
- Basic reply textarea
- Approve/Cancel buttons

**DESIGNED** (Full-featured):
- **Conversation Preview** - Scrollable message history
- **AI Suggested Reply** - Display AI-drafted response
- **Internal Notes** - Textarea for operator notes
- **Grading Sliders** (1-5 scale):
  - Tone (friendliness, professionalism)
  - Accuracy (correctness, completeness)
  - Policy (compliance)
- **Multiple Actions**:
  - Approve & Send Reply
  - Edit Reply
  - Escalate to Manager
  - Mark Resolved
  - Cancel
- **Toast Notifications** - Success/error feedback
- **Error Retry** - Graceful error handling with retry button

**Wireframe**:
```
┌──────────────────────────────────────────────────────────┐
│ ✕  CX Escalation — Jamie Lee                            │
├──────────────────────────────────────────────────────────┤
│ Status: Open • Priority                                  │
│ SLA: Breached (2h 15m ago)                              │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Conversation Preview                  [Scroll]    │ │
│ │ Jamie: "Where is my order?"                       │ │
│ │ You: "Let me check on that..."                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Suggested Reply (AI):                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ "Hi Jamie, thanks for your patience. We're       │ │
│ │ expediting your order update now."               │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Internal Notes:                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [For team eyes only...]                           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Grade this reply (helps AI improve):                    │
│ Tone:     ●●●●○ (4/5)  [────●────]                    │
│ Accuracy: ●●●●● (5/5)  [────────●]                    │
│ Policy:   ●●●●● (5/5)  [────────●]                    │
│                                                          │
│ [Approve & Send] [Edit Reply] [Escalate] [Resolve]     │
└──────────────────────────────────────────────────────────┘
```

**Spec**: modal-refresh-handoff.md, accessibility-approval-flow.md

### 3.2 Sales Pulse Modal

**DESIGNED**:
- Revenue variance review (WoW comparison)
- Top SKUs breakdown
- Action dropdown ("Log follow-up" / "Escalate to ops")
- Notes textarea with audit trail
- Dynamic button label (matches selected action)

**Wireframe**:
```
┌──────────────────────────────────────────────────────────┐
│ ✕  Sales Pulse — Variance Review                        │
├──────────────────────────────────────────────────────────┤
│ Snapshot (Last 24h)                                      │
│ • Revenue: $8,425.50 (▲ 12% WoW)                        │
│ • Orders: 58                                             │
│ • Avg order: $145.27                                     │
│                                                          │
│ Top SKUs                                                 │
│ • Powder Board XL — 14 units                            │
│ • Thermal Gloves — 12 units                             │
│                                                          │
│ What do you want to do?  [Log follow-up ▼]             │
│                                                          │
│ Notes (audit trail):                                     │
│ ┌────────────────────────────────────────────────────┐ │
│ │ "Followed up with ops..."                          │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Log Follow-up]                              [Cancel]   │
└──────────────────────────────────────────────────────────┘
```

**Spec**: dashboard_wireframes.md lines 126-181

### 3.3 Inventory Modal

**DESIGNED**:
- 14-day velocity analysis
- Reorder point calculation display
- Approve reorder workflow
- Quantity input for PO
- Vendor selection dropdown
- "Approve Reorder" action

**Wireframe**:
```
┌──────────────────────────────────────────────────────────┐
│ ✕  Inventory Alert — Powder Board XL                    │
├──────────────────────────────────────────────────────────┤
│ SKU: BOARD-XL                                           │
│ Current Stock: 6 units                                  │
│ Threshold: 10 units                                     │
│ Days of Cover: 2.5 days                                 │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 14-Day Velocity Analysis                           │ │
│ │ Avg daily sales: 2.4 units                        │ │
│ │ Peak day: 5 units (Oct 2)                         │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Recommended Reorder: 24 units (10-day supply)           │
│ Vendor: Snowboard Supply Co.                            │
│                                                          │
│ Adjust Quantity: [24] units                             │
│                                                          │
│ [Approve Reorder]  [Skip]  [Remind Later]              │
└──────────────────────────────────────────────────────────┘
```

**Spec**: dashboard_wireframes.md lines 183-240

---

## 4. NOTIFICATION SYSTEM (0% BUILT)

### 4.1 Notification Center

**Features**:
- Badge count in navigation
- Slide-out panel from right
- Notification cards grouped by date
- Mark as read/unread
- "Mark all as read" button

**Notification Types**:
1. **Approval** - New approval needs review (bell icon)
2. **Alert** - Tile status changed (warning icon)
3. **System** - Maintenance, updates (info icon)
4. **Escalation** - Urgent issue (critical icon)

**Priority Levels**:
- **Critical**: Banner + Browser notification
- **High**: Banner + Toast
- **Medium**: Toast only (5 sec)
- **Low**: Badge only

**Desktop Notifications**:
- Browser notification permission
- Persistent until clicked
- Sound option (configurable)
- Works when tab is hidden

### 4.2 Toast Messages

**Success Toasts**:
- "Action approved and executed" ✅
- "Feedback submitted" ✅
- "Settings saved" ✅

**Error Toasts**:
- "Approval failed. Please try again." ❌
- "Connection lost. Check your internet." ❌

**Info Toasts**:
- "3 new approvals need review" ℹ️
- "Queue refreshed" ℹ️

### 4.3 Banner Alerts

**Queue Backlog** (>10 pending):
- Warning tone
- "View Queue" action button
- Dismissible

**Performance Degradation** (approval rate <70%):
- Critical tone
- "View Metrics" action
- Shows current approval rate

**System Health**:
- Degraded: Warning banner
- Down: Critical banner with support contact

**Spec**: notification-system-design.md

---

## 5. SETTINGS & PREFERENCES (0% BUILT)

### 5.1 Settings Page

**URL**: `/settings`

**Sections**:

**Dashboard Preferences**:
- Tile visibility checkboxes (show/hide each tile)
- Default view (grid/list)
- Reset to default layout button

**Appearance**:
- Theme selector (Light/Dark/Auto)
- Auto matches system preference
- Persistent across sessions

**Notification Preferences**:
- Desktop notifications (on/off)
- Queue backlog warnings (on/off)
- Performance alerts (on/off)
- Sound enabled (on/off)
- Notification frequency (realtime/5min/hourly)

**Integration Management**:
- Shopify (connected status)
- Chatwoot (health check)
- Google Analytics (config)
- API keys (masked display)

### 5.2 User Preferences Storage

**Supabase Table**: user_preferences
**Fields**:
- tile_order (TEXT[])
- visible_tiles (TEXT[])
- default_view (TEXT)
- theme (TEXT)
- notification_prefs (JSONB)
- updated_at (TIMESTAMPTZ)

**Spec**: dashboard-features-1K-1P.md

---

## 6. ONBOARDING FLOW (0% BUILT)

### 6.1 First-Time User Experience

**Welcome Modal** (on first login):
- "Welcome to HotDash!" heading
- 3-step setup guide:
  1. Connect Shopify store
  2. Configure Chatwoot for CX
  3. Set up Google Analytics
- "Start setup" button
- "Skip for now" link

**Tile Tour**:
- Tooltip overlay on each tile
- Explains what data it shows
- "Next" / "Skip" buttons
- Progress indicator (1/8, 2/8, etc.)

**Setup Wizard**:
- Step-by-step integration setup
- Progress bar
- Skip/complete tracking
- Celebratory message on completion

**Motivational Copy**:
- "You're doing great!" (after setup)
- "Ready to roll!" (all configured)
- "Rev up your operations" (Hot Rodan theme)

**Spec**: dashboard-onboarding-flow.md

---

## 7. DATA VISUALIZATION (PARTIAL)

### 7.1 Charts & Graphs

**Sparkline** (Trend indicator):
- Small line chart in tiles
- Shows 7-day trend
- Color-coded (success/warning/critical)
- Hover tooltips

**Bar Chart** (Comparison):
- Daily/weekly sales comparison
- Polaris Viz library
- Print-friendly

**Line Chart** (Time series):
- Revenue over time
- Multiple series support
- Interactive tooltips

**Donut Chart** (Breakdown):
- Product mix
- Category distribution
- Percentage labels

**Spec**: dashboard-features-1K-1P.md (Task 1M)

---

## 8. APPROVAL HISTORY & AUDIT (0% BUILT)

### 8.1 Approval History View

**URL**: `/approvals/history`

**Features**:
- Filterable table (status, date range)
- Search by conversation ID, tool name
- Export to CSV
- Timeline visualization

**Table Columns**:
- Date (sortable)
- Conversation ID
- Tool name
- Action (Approved/Rejected badge)
- Operator name

**Filters**:
- Status: All / Approved / Rejected
- Date range: Last 7/30/90 days
- Search: Full-text search

**Export**:
- CSV download
- Includes all visible columns
- Filename: `approval-history-YYYY-MM-DD.csv`

**Spec**: dashboard-features-1K-1P.md (Task 1P)

---

## 9. DESIGN SYSTEM (10% BUILT)

### 9.1 Design Tokens

**Colors**:
- Hot Rodan red primary: #E74C3C
- Status healthy: #1A7F37 (green)
- Status attention: #D82C0D (red)
- Status unconfigured: #637381 (gray)
- Background surface: #FFFFFF (light mode)
- Text primary: #202223
- Text subdued: #637381

**Dark Mode Palette**:
- Background surface: #1A1A1A
- Background secondary: #2C2C2C
- Text: #E3E5E7
- Text subdued: #8C9196
- Hot Rodan red: #E74C3C (adjusted)

**Spacing Scale** (8px base grid):
- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 20px
- space-6: 24px

**Typography Scale**:
- Heading 2xl: 1.5rem, semibold
- Heading md: 1.15rem, semibold
- Body md: 1rem, regular
- Body sm: 0.85rem, regular

### 9.2 Component Library

**OCC Custom Components**:
- TileCard (wrapper for all tiles)
- SalesPulseTile
- FulfillmentHealthTile
- InventoryHeatmapTile
- CXEscalationsTile
- SEOContentTile
- OpsMetricsTile
- IdeaPoolTile (missing)
- ApprovalsQueueTile (missing)

**Polaris Components** (heavily used):
- Page, Layout, Card
- BlockStack, InlineStack
- Text, Button, Badge
- Modal, Banner, Toast
- TextField, Select, Checkbox
- EmptyState, Spinner
- DataTable, List

**Spec**: design-system-guide.md (38KB, 1800+ lines)

---

## 10. ACCESSIBILITY (WCAG 2.2 AA)

### 10.1 Requirements

**Keyboard Navigation**:
- All interactive elements reachable via Tab
- Enter/Space activate buttons
- Escape closes modals
- Focus indicators visible (4.5:1 contrast)

**Screen Reader Support**:
- Semantic HTML (article, h2, ul/li)
- ARIA labels for all controls
- aria-live regions for dynamic content
- Modal title announced on open

**Color Contrast**:
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- All verified and documented

**Focus Management**:
- Focus trap in modals
- Return focus on modal close
- Skip links for navigation
- Visible focus indicators

**Spec**: accessibility-approval-flow.md, accessibility_criteria.md

---

## 11. RESPONSIVE DESIGN

### 11.1 Breakpoints

**Mobile** (< 768px):
- 1 column tile grid
- Full-width tiles
- Larger touch targets (44x44px minimum)
- Reduced font sizes (scale 0.9)
- Hide non-critical metadata

**Tablet** (768-1024px):
- 2 column tile grid
- Standard font sizes
- Standard touch targets

**Desktop** (> 1024px):
- 3-4 column auto-fit grid
- Standard font sizes
- Hover states enabled
- Keyboard shortcuts visible

### 11.2 Mobile Optimization

**Touch Targets**:
- Minimum 44x44px
- Adequate spacing between targets
- Larger buttons on mobile

**Navigation**:
- Bottom tab bar on mobile
- Top navigation on desktop
- Hamburger menu for secondary items

**Spec**: mobile-operator-experience.md, mobile-responsive-68-73.md

---

## 12. BRANDING (Hot Rodan)

### 12.1 Brand Integration

**Primary Color**: Hot Rodan Red (#E74C3C)
- Used for primary buttons
- Brand accent throughout
- Accessibility-compliant variants

**Brand Voice**:
- "Rev up your operations"
- "Full throttle ahead"
- "Pit stop complete" (success messages)
- Speed/automotive theme

**Logo Placement**:
- Favicon
- Loading states
- Empty states
- About page

**Spec**: hot-rodan-brand-integration.md

---

## 13. DATA ARCHITECTURE

### 13.1 Supabase Tables

**Required Tables** (some missing):

**user_preferences**:
- Personalization settings
- Tile order, visibility
- Theme, notifications

**notifications**:
- Notification history
- Read/unread status
- Priority levels
- Action URLs

**decision_log** (exists):
- Approval/rejection records
- Grading metadata
- Operator info
- Timestamp, payload

**approval_queue**:
- Pending agent actions
- Risk levels
- Conversation links

**idea_pool** (exists):
- Product suggestions
- Wildcard tracking
- Acceptance status

### 13.2 Real-Time Subscriptions

**Supabase Realtime**:
- Subscribe to approval_queue changes
- Subscribe to notifications
- Update UI instantly
- Connection status handling

**Spec**: Prisma migration needed for user_preferences, notifications

---

## 14. IDEA POOL SYSTEM

### 14.1 Always-On Pipeline

**Rules**:
- Maintain EXACTLY 5 ideas at all times
- EXACTLY 1 must be a Wildcard
- Accept/reject flow
- Auto-generate Shopify drafts on accept

### 14.2 Idea Pool Tile

**Display**:
- 5/5 capacity indicator
- Wildcard badge
- Pending: X
- Accepted: Y
- Rejected: Z
- "View Idea Pool" button

**Status Badge**:
- Full (5/5): Success tone (green)
- Filling (<5): Warning tone (yellow)

### 14.3 Idea Pool Route

**URL**: `/ideas`

**Features**:
- List view of all 5 ideas
- Wildcard indicator
- Accept/Reject buttons
- Evidence display
- Projected impact
- Risk/rollback info

**Spec**: dashboard-tiles.md lines 528-670

---

## 15. LEARNING LOOP (PARTIAL)

### 15.1 Grading System

**1-5 Scale**:
- Tone: Friendliness, professionalism
- Accuracy: Correctness, completeness
- Policy: Company policy compliance

**Storage**: Supabase decision_log.payload.grades
**Usage**: Fine-tuning, evaluation improvements

### 15.2 Performance Metrics

**Track**:
- Approval rate (target: ≥90%)
- Average grades (tone ≥4.5, accuracy ≥4.7, policy ≥4.8)
- Median approval time (target: ≤15 min)
- Rejection reasons
- Edit patterns

**Dashboard**: Agent performance tile (future)

**Spec**: Agent learning documented in NORTH_STAR.md

---

## 16. COMPLETE FEATURE LIST

### ✅ IMPLEMENTED (30%)
- 6 basic dashboard tiles
- Tile status system
- Loading states
- Error states
- Basic modals
- TileCard wrapper
- Basic design tokens

### ❌ MISSING (70%)

**Dashboard (P1)**:
- Idea Pool tile
- Approvals Queue tile
- Drag & drop reordering
- Tile visibility toggles
- User preferences

**Approval Queue (P0)**:
- /approvals route
- ApprovalCard component
- Auto-refresh
- Risk badges
- Nav badge

**Modals (P1)**:
- CX: Grading sliders, conversation preview, internal notes
- Sales: Variance review, action dropdown
- Inventory: Velocity analysis, reorder approval

**Notifications (P1)**:
- Notification center
- Browser notifications
- Toast messages
- Banner alerts

**Settings (P2)**:
- Settings page
- Theme toggle
- Notification prefs
- Integration management

**Advanced (P2-P3)**:
- Real-time indicators
- Data visualization (charts)
- Onboarding flow
- Approval history
- Dark mode
- Mobile optimization

---

## RECOVERY VERIFICATION

✅ All 57 design files restored
✅ All specs intact and complete
✅ No data loss - everything recovered
✅ Ready to build full vision

**Files Restored**:
- HANDOFF-approval-queue-ui.md ✅
- dashboard-features-1K-1P.md ✅
- notification-system-design.md ✅
- modal-refresh-handoff.md ✅
- design-system-guide.md ✅
- dashboard_wireframes.md ✅
- accessibility specs (5 files) ✅
- Plus 50 more comprehensive specifications ✅


---

## 17. OPTION A BUILD PLAN (Full Vision - 24-30 hours)

### Phase 1: Core HITL Workflow (P0) — 3-4 hours

**Engineer Tasks**:
1. **Approval Queue Route** (2h):
   - Create `app/routes/approvals.tsx`
   - List of pending approvals
   - Auto-refresh every 5 seconds
   - Empty state: "All clear!"
   - Spec: HANDOFF-approval-queue-ui.md

2. **ApprovalCard Component** (1h):
   - Create `app/components/ApprovalCard.tsx`
   - Show agent, tool, arguments
   - Risk level badge (HIGH/MEDIUM/LOW)
   - Approve/Reject buttons
   - Loading states, error handling
   - Spec: approvalcard-component-spec.md

3. **Approval Actions** (30 min):
   - POST `/approvals/:id/:idx/approve`
   - POST `/approvals/:id/:idx/reject`
   - Supabase decision_log integration
   - Toast notifications

4. **Navigation Badge** (30 min):
   - Add badge to nav showing pending count
   - Real-time updates
   - Link to /approvals

**QA**: Test approval workflow end-to-end

---

### Phase 2: Enhanced Modals (P1) — 4-5 hours

**Engineer + Designer Tasks**:

5. **Enhanced CX Modal** (2.5h):
   - Add conversation preview (scrollable)
   - Display AI suggested reply
   - Add internal notes textarea
   - Add grading sliders (tone/accuracy/policy 1-5)
   - Add multiple action buttons (Approve/Edit/Escalate/Resolve)
   - Toast notifications for actions
   - Error retry mechanisms
   - Spec: modal-refresh-handoff.md

6. **Sales Pulse Modal** (1h):
   - Variance review UI (WoW comparison)
   - Action dropdown (Log follow-up / Escalate to ops)
   - Notes textarea with audit trail
   - Dynamic CTA text (matches dropdown selection)
   - Supabase sales_pulse_actions table
   - Spec: dashboard_wireframes.md lines 126-181

7. **Inventory Modal** (1.5h):
   - 14-day velocity analysis display
   - Reorder approval workflow
   - Quantity input for PO
   - Vendor selection
   - "Approve Reorder" action
   - Supabase inventory_actions table
   - Spec: dashboard_wireframes.md lines 183-240

**Data**: Create new Supabase tables (sales_pulse_actions, inventory_actions)

---

### Phase 3: Missing Dashboard Tiles (P1) — 1-2 hours

**Engineer Tasks**:

8. **Idea Pool Tile** (1h):
   - Create `app/components/tiles/IdeaPoolTile.tsx`
   - Display 5/5 capacity
   - Wildcard badge
   - Pending/accepted/rejected counts
   - "View Idea Pool" button
   - Backend: `getIdeaPoolSummary()` function
   - Spec: dashboard-tiles.md lines 528-670

9. **Approvals Queue Tile** (30 min):
   - Create `app/components/tiles/ApprovalsQueueTile.tsx`
   - Pending count display
   - Oldest pending time
   - "Review queue" button → /approvals
   - Backend: `getApprovalsSummary()` function
   - Spec: dashboard-tiles.md lines 281-301

10. **Dashboard Integration** (30 min):
    - Add tiles to `app/routes/app._index.tsx`
    - Update LoaderData interface
    - Add to loader function
    - Export from tiles/index.ts

---

### Phase 4: Notification System (P1) — 2-3 hours

**Engineer Tasks**:

11. **Toast Infrastructure** (1h):
    - Integrate Shopify App Bridge toast
    - Success toasts (actions completed)
    - Error toasts (with retry)
    - Info toasts (new approvals)
    - Spec: notification-system-design.md

12. **Banner Alerts** (45 min):
    - Queue backlog banner (>10 pending)
    - Performance degradation banner (<70% approval rate)
    - System health banner (service down)
    - Connection status banner (offline/reconnecting)

13. **Browser Notifications** (1h):
    - Request notification permission
    - Desktop notifications for new approvals
    - Sound option (configurable)
    - Works when tab hidden
    - Notification preferences

**Data**: Create notifications table in Supabase

---

### Phase 5: Dashboard Personalization (P1) — 3-4 hours

**Engineer + Data Tasks**:

14. **Drag & Drop Reordering** (2h):
    - Install @dnd-kit/core library
    - Implement drag handles on tiles
    - Save order to Supabase user_preferences
    - Restore order on page load
    - Spec: dashboard-features-1K-1P.md Task 1K

15. **Tile Visibility Toggles** (1h):
    - Settings page with checkboxes
    - Show/hide tiles
    - Persist to database
    - Update dashboard to respect visibility

16. **User Preferences Migration** (30 min):
    - Create user_preferences table
    - Fields: tile_order, visible_tiles, theme, notification_prefs
    - RLS policies
    - Migration + seed data

17. **Reset to Default** (30 min):
    - "Reset layout" button in settings
    - Clears user_preferences
    - Restores default tile order

---

### Phase 6: Settings Page (P2) — 2-3 hours

**Engineer Tasks**:

18. **Settings Route** (1h):
    - Create `app/routes/settings.tsx`
    - Tabbed layout (Dashboard / Appearance / Notifications / Integrations)
    - Form submission to user_preferences

19. **Dashboard Tab** (45 min):
    - Tile visibility checkboxes
    - Default view selector (grid/list)
    - Reset to default button

20. **Appearance Tab** (30 min):
    - Theme selector (Light/Dark/Auto)
    - Apply theme to root element
    - Persist to database

21. **Notification Tab** (45 min):
    - Desktop notifications toggle
    - Sound toggle
    - Queue backlog threshold
    - Performance alert threshold
    - Frequency selector (realtime/5min/hourly)

22. **Integrations Tab** (30 min):
    - Shopify status (connected)
    - Chatwoot health check
    - Google Analytics status
    - API key management (masked)

---

### Phase 7: Real-Time Indicators (P2) — 2-3 hours

**Engineer + DevOps Tasks**:

23. **Live Update Indicators** (1h):
    - Pulse animation on tile refresh
    - "Updated X seconds ago" timestamp
    - Auto-refresh progress bar
    - Manual refresh button
    - Spec: realtime-update-indicators.md

24. **SSE / WebSocket** (1.5h):
    - Server-Sent Events for approval queue
    - Real-time tile updates
    - Connection status handling
    - Reconnection logic

25. **Optimistic Updates** (30 min):
    - Instant approve/reject feedback
    - Revert on API failure
    - Smooth animations

---

### Phase 8: Data Visualization (P2) — 2-3 hours

**Engineer Tasks**:

26. **Chart Library Integration** (1h):
    - Install @shopify/polaris-viz
    - Sparkline component
    - Bar chart component
    - Line chart component
    - Donut chart component

27. **Sales Charts** (1h):
    - 7-day revenue sparkline in Sales Pulse tile
    - Revenue trend in modal
    - Top SKUs bar chart

28. **Inventory Charts** (1h):
    - 14-day velocity line chart
    - Stock level trends
    - Reorder timing visual

---

### Phase 9: Onboarding Flow (P3) — 2-3 hours

**Engineer + Designer Tasks**:

29. **Welcome Modal** (45 min):
    - First-visit detection
    - 3-step setup guide
    - "Don't show again" checkbox
    - Spec: dashboard-onboarding-flow.md

30. **Tooltip Tour** (1.5h):
    - 4-step progressive tour
    - Tooltip component with Next/Back/Skip
    - Spotlight effect (dim background)
    - Progress indicator (1/4, 2/4, etc.)

31. **Help System** (45 min):
    - Help icon in header
    - Keyboard shortcut (?) for help
    - Restart tour option in settings
    - Contextual tooltips

---

### Phase 10: Approval History & Audit (P2) — 2-3 hours

**Engineer Tasks**:

32. **History Route** (1.5h):
    - Create `/approvals/history`
    - Filterable DataTable
    - Search functionality
    - Export to CSV
    - Spec: dashboard-features-1K-1P.md Task 1P

33. **Timeline View** (1h):
    - Visual timeline of approvals
    - Grouped by date
    - Color-coded by action
    - Click to view details

34. **Audit Filters** (30 min):
    - Filter by status (all/approved/rejected)
    - Filter by date range (7/30/90 days)
    - Filter by agent
    - Filter by tool

---

### Phase 11: Polish & Refinements (P2) — 3-4 hours

**Designer + Engineer Tasks**:

35. **Design System Completion** (1.5h):
    - Complete design tokens in CSS
    - Component library documentation
    - Usage guidelines
    - Spec: design-system-guide.md

36. **Dark Mode** (1h):
    - Dark color palette
    - Theme toggle in settings
    - Persist preference
    - WCAG AA contrast verification
    - Spec: dashboard-features-1K-1P.md Task 1N

37. **Mobile Optimization** (1.5h):
    - Responsive tile grid
    - Touch-friendly buttons (44x44px)
    - Bottom nav on mobile
    - Swipe gestures
    - Spec: mobile-operator-experience.md

38. **Accessibility Audit** (1h):
    - WCAG 2.2 AA compliance check
    - Screen reader testing (NVDA/VoiceOver)
    - Keyboard navigation verification
    - Color contrast validation
    - Spec: accessibility_criteria.md

---

## 18. COMPLETE FEATURE MANIFEST

### Dashboard Features
✅ 6 core tiles (Ops, Sales, Fulfillment, Inventory, CX, SEO)
❌ Idea Pool tile
❌ Approvals Queue tile
❌ Drag & drop tile reordering
❌ Tile visibility toggles
❌ User preference storage
❌ Settings page

### HITL Workflow
✅ Basic modals (CX, Sales, Inventory)
❌ Approval queue route (/approvals)
❌ ApprovalCard component
❌ Enhanced CX modal (grading sliders, conversation preview)
❌ Enhanced Sales modal (variance review, action dropdown)
❌ Enhanced Inventory modal (velocity analysis, reorder approval)
❌ Approval history (/approvals/history)

### Notifications
❌ Notification center (slide-out panel)
❌ Toast messages (success/error/info)
❌ Banner alerts (backlog, performance, health)
❌ Desktop notifications
❌ Browser notification permission
❌ Sound/vibration preferences

### Real-Time Features
❌ Live update indicators
❌ SSE / WebSocket integration
❌ Auto-refresh progress bar
❌ Connection status indicator
❌ Optimistic updates
❌ "Updated X ago" timestamps

### Personalization
❌ Settings page (/settings)
❌ Theme toggle (Light/Dark/Auto)
❌ Notification preferences
❌ Integration management
❌ Tile visibility settings
❌ Default view (grid/list)

### Onboarding
❌ Welcome modal (first visit)
❌ 4-step tooltip tour
❌ Spotlight effect
❌ "Don't show again" option
❌ Help icon / restart tour
❌ Keyboard shortcut (?)

### Data Visualization
❌ Sparklines (trend indicators)
❌ Bar charts (comparisons)
❌ Line charts (time series)
❌ Donut charts (breakdowns)
❌ Interactive tooltips
❌ Print-friendly reports

### Design System
✅ Basic design tokens (partial)
❌ Complete token system
❌ Component library documentation
❌ Dark mode palette
❌ Spacing utilities
❌ Typography scale
❌ Accessibility guidelines

### Database
✅ decision_log (exists)
✅ idea_pool (exists)
❌ user_preferences (missing)
❌ notifications (missing)
❌ approval_queue (missing)
❌ sales_pulse_actions (missing)
❌ inventory_actions (missing)

---

## 19. TOTAL EFFORT BREAKDOWN (Option A)

| Phase | Description | Hours | Priority |
|-------|-------------|-------|----------|
| 1 | Core HITL (Approval Queue) | 3-4h | P0 |
| 2 | Enhanced Modals | 4-5h | P1 |
| 3 | Missing Tiles | 1-2h | P1 |
| 4 | Notification System | 2-3h | P1 |
| 5 | Personalization | 3-4h | P1 |
| 6 | Settings Page | 2-3h | P2 |
| 7 | Real-Time Indicators | 2-3h | P2 |
| 8 | Data Visualization | 2-3h | P2 |
| 9 | Onboarding Flow | 2-3h | P3 |
| 10 | Approval History | 2-3h | P2 |
| 11 | Polish & Refinements | 3-4h | P2 |

**TOTAL**: 26-35 hours (average: **30 hours**)

**Timeline**: 3-4 days of focused work

---

## 20. VERIFICATION CHECKLIST

### ✅ ALL DESIGN FILES RECOVERED

**Critical Files** (verified present):
- ✅ HANDOFF-approval-queue-ui.md (approval queue spec)
- ✅ dashboard-features-1K-1P.md (personalization, notifications, dark mode)
- ✅ notification-system-design.md (toast, banner, browser notifs)
- ✅ modal-refresh-handoff.md (enhanced modal specs)
- ✅ design-system-guide.md (38KB design system)
- ✅ dashboard_wireframes.md (complete mockups)
- ✅ realtime-update-indicators.md (live indicators)
- ✅ dashboard-onboarding-flow.md (first-time UX)
- ✅ accessibility-approval-flow.md (WCAG 2.2 AA)
- ✅ approval-queue-edge-states.md (edge cases)
- ✅ approvalcard-component-spec.md (component details)

**Supporting Files** (verified present):
- ✅ mobile-operator-experience.md
- ✅ mobile-responsive-68-73.md
- ✅ hot-rodan-brand-integration.md
- ✅ error-states-deep-dive.md
- ✅ loading-micro-interactions.md
- ✅ empty-state-library.md
- ✅ Plus 46 more files

**Total**: 57/57 files restored ✅

---

## 21. YOUR COMPLETE VISION (Summary)

### The Operator Experience

**Login** → Welcome modal (first time)
  ↓
**Dashboard** → 8 tiles showing real-time data
  - Drag & drop to reorder
  - Hide/show tiles as needed
  - Theme: Light/Dark/Auto
  ↓
**Click Tile** → Enhanced modal opens
  - CX: Grade AI reply (tone/accuracy/policy), approve/reject/escalate
  - Sales: Review variance, log follow-up or escalate
  - Inventory: See velocity analysis, approve reorder
  ↓
**Notification** → Badge shows "3 new approvals"
  - Click → Goes to /approvals queue
  - Desktop notification (if enabled)
  - Toast: "3 new approvals arrived"
  ↓
**Approval Queue** → List of pending agent actions
  - Risk badges (HIGH/MEDIUM/LOW)
  - Auto-refresh every 5 seconds
  - Approve/reject with one click
  - Success toast on action
  ↓
**Learning** → Your grades stored in Supabase
  - AI improves based on feedback
  - Performance dashboard shows trends
  - Approval history exportable to CSV

### The System

**Real-Time**: SSE updates, auto-refresh, live badges
**Accessible**: WCAG 2.2 AA, keyboard nav, screen readers
**Branded**: Hot Rodan red, speed theme, automotive voice
**Personalized**: Your tile order, visibility, theme, notif prefs
**Trustworthy**: Full audit trail, rollback, evidence-based
**Fast**: Optimistic updates, <3s tile load, <15min approval SLA

---

## 22. NOTHING WAS LOST

**Verification Complete**:
- ✅ All 57 design files recovered
- ✅ All specs intact (no corruption)
- ✅ All wireframes present
- ✅ All component specs present
- ✅ All technical details present
- ✅ All accessibility requirements present
- ✅ All brand guidelines present

**Your planning day work is 100% SAFE.**

---

## 23. READY FOR OPTION A

**Decision**: Build Full Vision (30 hours, 3-4 days)

**Next Steps**:
1. Update Engineer direction (P0 tasks: Approval Queue)
2. Update Designer direction (Enhanced modals, visual QA)
3. Update Data direction (New migrations: user_preferences, notifications)
4. Create detailed 38-task checklist (all phases)
5. Agents build to YOUR complete specifications
6. QA validates against YOUR design files
7. Launch with YOUR full vision

**All 57 design specifications now guiding development.**

