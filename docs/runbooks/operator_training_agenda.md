---
epoch: 2025.10.E1
doc: docs/runbooks/operator_training_agenda.md
owner: support
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-20
---
# Operator Training Agenda — HotDash Dashboard

## Session Overview
**Duration:** 90 minutes
**Format:** Live walkthrough + hands-on practice with mock data
**Prerequisites:** Shopify admin access, Chatwoot familiarity (basic)
**Materials:** Dashboard URL with `?mock=1`, copy of this agenda, Q&A capture template, support escalation inbox `customer.support@hotrodan.com`
**Support Inbox:** customer.support@hotrodan.com — send dry-run comms, evidence screenshots, and operator questions here for tracking.
**Current Status:** Rehearsals paused pending QA green `?mock=0` evidence and Chatwoot Fly cut-over smoke; continue prep work only and complete asynchronous modules listed in `docs/enablement/dry_run_training_materials.md`.

---

## Session Outline

### 1. Introduction (10 minutes)
**Objective:** Understand dashboard purpose and north star

**Topics:**
- Operator Control Center vision: single source of truth across CX, sales, inventory, SEO
- Approval workflow paradigm: every action requires explicit operator decision
- Decision logging: all actions tracked for audit trail (decision_log table)
- Staging install overview: Operator Control Center lives inside Shopify Admin (`Apps -> HotDash`). Support briefs participants on staging credentials (see `docs/integrations/shopify_readiness.md`) and verifies feature flags (`FEATURE_MODAL_APPROVALS`, `FEATURE_AI_ESCALATIONS`) before kickoff.

**Key Points:**
- Dashboard reduces tab fatigue by consolidating Shopify, Chatwoot, GA data
- Mock mode vs. live mode: Start training in mock mode (`?mock=1`)
- Evidence-based operations: every tile shows data source + refresh timestamp
- Staging access verification: load `https://hotdash-staging.fly.dev/app?mock=1` ahead of the session; a 200 OK (or 302 to Shopify auth) is required. If you receive HTTP 410 or a network error, escalate to deployment/reliability immediately and document the outcome in `feedback/enablement.md`.
- Staging evidence table: Supabase NDJSON entry is live (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`); monitor for the first green `?mock=0` run to swap in fresh curl + synthetic evidence (latest log `artifacts/integrations/shopify/2025-10-10/curl_mock0_2025-10-10T07-57-48Z.log` is still 410). Until QA posts the green run, keep rehearsals paused and only iterate on prep docs. Once evidence lands, refresh this agenda’s links and broadcast updates via customer.support@hotrodan.com.
- Chatwoot Fly migration: monitor reliability announcements, keep `scripts/ops/chatwoot-fly-smoke.sh --env staging` ready with the latest host/token, and review `docs/runbooks/cx_escalations.md#chatwoot-fly-deployment-validation-pre-launch` so facilitators can brief operators the moment the new host goes live.

---

### 2. Dashboard Navigation (15 minutes)
**Objective:** Tour the interface and understand tile layout

**Walkthrough:**
- Header: "Operator Control Center" heading, mock mode notice
- Tile grid: 6 tiles in responsive layout (1280px desktop, 768px tablet)
- Tile anatomy: Title, status indicator, metadata line, content area, action buttons (future)

**Tiles Overview:**
1. **Ops Pulse** — Activation rate, SLA resolution metrics (meta tile)
2. **Sales Pulse** — Revenue, order count, top SKUs
3. **Fulfillment Health** — Orders stuck in pending/processing, blockers
4. **Inventory Heatmap** — Low stock alerts, days of cover
5. **CX Escalations** — SLA breached conversations, escalation tags
6. **SEO & Content Watch** — Landing pages with WoW session drops

**Practice:**
- Operators click through each tile
- Identify status indicators (healthy, attention, error, unconfigured)
- Confirm staging environment readiness: support lead walks through Shopify Admin login flow and staging credentials pre-check (demo shop domain, OCC staging URL with `?mock=1`, Supabase decision log access). Document confirmation in the Q&A template.
- If Supabase telemetry is still syncing, rehearse using the sample IDs (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`, IDs 101–104) so facilitators can validate success, retry, and timeout scenarios before live data lands.

**Q&A Capture:**
- Any tile unclear or confusing?
- What information is missing?
- Any visual hierarchy issues?

---

### 3. CX Escalations Deep Dive (25 minutes)
**Objective:** Master conversation triage and templated replies

**Walkthrough:**
- Tile shows list of conversations: customer name, status, SLA breach indicator
- Click conversation name to open modal (if `FEATURE_MODAL_APPROVALS=true`)
- Modal displays: customer name, conversation ID, created/breached timestamps, last message preview

**Template Selection:**
- Review 3 current templates: ack_delay, ship_update, refund_offer
- Explain use cases per docs/runbooks/cx_escalations.md
- Show variable interpolation: {{name}} → customer name

**Approval Flow:**
- Select template from dropdown
- Review pre-filled message body
- Click "Approve & Send Reply" → logs decision + sends to Chatwoot
- Toast confirmation: "Reply sent to [Customer Name]"

**Escalation Actions:**
- "Escalate to Manager" button → tags conversation, logs decision
- Escalation SLA: Manager acknowledges within 2 hours

**Practice Scenarios:**
1. Customer asking about shipping delay → Use `ship_update` template
2. Customer reports product defect → Use `refund_offer` template
3. Customer requests policy exception → Escalate to manager

**Q&A Capture:**
- Is template selection clear?
- Do operators understand when to escalate vs. reply?
- Any confusion about SLA breach indicators?

---

### 4. Sales & Inventory Workflows (20 minutes)
**Objective:** Understand sales tracking and inventory alerts

**Sales Pulse Tile:**
- Shows order count, revenue for current window
- Top SKUs list with units sold
- Open fulfillment count (future: drill-in modal)
- QA readiness evidence: Playwright staging run `artifacts/playwright/shopify/playwright-staging-2025-10-10T04-20-37Z.log` covers modal open/close and decision logging paths.

**Inventory Heatmap Tile:**
- Low stock alerts with SKU, units left, days of cover
- Color coding: red (<7 days), yellow (7-14 days), green (>14 days) — future enhancement
- Actions (future): Create draft PO, adjust quantity, mark intentional

**Practice:**
- Operators review mock inventory alerts
- Identify which SKUs need reorder vs. intentional low stock

**Q&A Capture:**
- Is "days of cover" calculation clear?
- What additional inventory data would be helpful?
- Any confusion about fulfillment blockers?

---

### 5. Decision Logging & Audit Trail (10 minutes)
**Objective:** Understand how actions are tracked

**Concepts:**
- Every approval action creates decision_log entry
- Decision includes: shopDomain, action type, operatorEmail, timestamp, payload
- Decisions sync to Supabase for analytics (scope: `ops`)

**Viewing Decisions:**
- Future: Audit trail view in dashboard
- Current: Decisions viewable in database (support/admin only)

**Privacy & Compliance:**
- Operator email logged for accountability
- Customer data (names, emails) stored per Shopify/Chatwoot policies
- Decision logs retained for 90 days (configurable)

**Q&A Capture:**
- Any privacy concerns about decision logging?
- What audit reports would be useful?

---

### 6. Error Handling & Integration Monitoring (10 minutes)
**Objective:** Recognize errors and know escalation paths

**Error States:**
- Tile shows "Error" status → Integration failure (Shopify API down, Chatwoot unreachable)
- "Configuration required" status → Missing credentials or setup incomplete
- Empty state: "No SLA breaches detected" (normal, not an error)
- Shopify banner "API rate limit exceeded." → Reference `docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md` and the support playbook `docs/runbooks/shopify_rate_limit_recovery.md`

**Escalation Paths:**
- Integration errors → Alert reliability team (#incidents) (internal channel)
- Shopify rate-limit persists after two retries → Capture headers and escalate to reliability via # `#occ-reliability` using the playbook
- Data discrepancies → File Linear ticket with screenshots + timestamps
- Persistent failures → Escalate to support lead

**Practice:**
- Show mock error state in tile
- Role-play the Shopify rate-limit coaching script (first-hit reassurance + escalation) and document notes in the Q&A template
- Operators practice filing ticket with evidence (screenshot + description)

**Q&A Capture:**
- Is error messaging clear?
- Do operators know who to contact for each issue type?

---

### 7. Hands-On Practice Session (15 minutes)
**Objective:** Operators complete realistic scenarios independently

**Scenarios:**
1. **CX Escalation:** Customer "Alex Rivera" conversation SLA breached, use `ack_delay` template
2. **Inventory Alert:** SKU "HOODIE-BLK-M" at 15 units, 5 days of cover → identify as reorder needed
3. **Manager Escalation:** Customer "Jordan Lee" requests refund >$500 → escalate to manager
4. **Error Handling:** Chatwoot tile shows error → file ticket with screenshot

**Evidence Reference:** QA staging validation log `artifacts/playwright/shopify/playwright-staging-2025-10-10T04-20-37Z.log` demonstrates CX Escalations modal approve/escalate/resolve flows on Fly staging.

**Trainer Observation:**
- Note any confusion, hesitation, or incorrect actions
- Capture in Q&A template for follow-up

---

### 8. Q&A & Feedback Collection (5 minutes)
**Objective:** Gather operator feedback for product/engineering

**Questions:**
- What dashboard features are most valuable?
- What's confusing or needs improvement?
- What additional data or actions would help daily workflows?

**Feedback Capture:**
- Use docs/runbooks/operator_training_qa_template.md
- Support agent files Linear tickets for each improvement opportunity
- Evidence: screenshots, exact quotes, timestamps

---

## Q&A Capture Template

See: docs/runbooks/operator_training_qa_template.md

---

## Training Materials Checklist
- [ ] Dashboard access with mock mode enabled (`?mock=1`)
- [ ] Copy of this agenda (printed or digital)
- [ ] Q&A capture template
- [ ] Screenshot/screen recording tools
- [ ] Linear project access for ticket filing
- [ ] #incidents (internal channel) channel access

---

## Dry Run Coordination — 2025-10-08
- **Primary proposal:** Wednesday, 2025-10-16 @ 13:00 ET (aligns with marketing's launch prep window)
- **Owner:** Riley Chen (Product) — confirmation requested in `feedback/product.md`
- **Support prep:** Send agenda + Q&A template by 2025-10-14, verify `FEATURE_MODAL_APPROVALS=1` in staging, confirm Chatwoot seed data covers shipping + refund scenarios.
- **Dependencies:** Latest English copy deck alignment (`docs/design/copy_deck.md`), Sales Pulse/CX Escalations job aids staged in `docs/enablement/job_aids/`, staging shop access package from product (OCC-214).
- **Comms Sync:** Coordinate enablement/marketing resend once QA posts green evidence; share updated materials via customer.support@hotrodan.com and archive announcements in `feedback/support.md`.

---

## Post-Training Follow-Up
- [ ] Support lead reviews Q&A capture and files tickets
- [ ] Share feedback summary with product + engineer (via feedback/support.md)
- [ ] Schedule follow-up training for modal workflows (post-M2 deployment)
- [ ] Update training agenda based on operator feedback

---

## Related Documentation
- CX Escalations Runbook: docs/runbooks/cx_escalations.md
- Copy Deck (English): docs/design/copy_deck.md
- Accessibility Criteria: docs/design/accessibility_criteria.md
- North Star: docs/NORTH_STAR.md

---

## Revision History
| Date | Author | Change |
|------|--------|--------|
| 2025-10-10 | support | Added support inbox contact, QA evidence hold status, refresh workflow, and comms sync instructions |
| 2025-10-10 | support | Added staging install readiness steps and environment checks |
| 2025-10-12 | support | Updated hold status to include Chatwoot Fly cut-over and smoke script readiness |
| 2025-10-08 | support | Added dry run coordination details and ownership |
| 2025-10-06 | support | Initial training agenda created per manager sprint focus |
