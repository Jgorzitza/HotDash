# HotDash Help Center (Launch Edition — 2025-10-24)

This guide is the operator-facing knowledge base for shipping HotDash on launch day. It organizes information using the Diátaxis model (tutorials, how-to guides, references, explanations) so that every workflow has the right level of depth. Keep it open alongside the app: every section links back to live UI surfaces.

---

## 0. Using This Help Center

- **Search everything:** Type keywords in the `/help` search bar (example: `approvals` or `notifications`). Results link directly to the section below.
- **Context jumps:** Append `?topic=<section-id>` to `/help` to deep-link from tooltips or product surfaces. Example: `/help?topic=troubleshooting` scrolls to the resolution table.
- **Tooltips:** Hover any dotted-underlined phrase to see definitions or policy notes without leaving the page.
- **Full markdown guide:** The “Open full guide” action opens this README on GitHub for copy/paste or offline review.

---

## 1. Getting Started

### 1.1 Launch-Day Checklist

1. **Sign in to HotDash** from Shopify Admin → Apps → HotDash Control Center.
2. **Confirm integrations** via `Settings → Integrations`:
   - Shopify Admin GraphQL (required)
   - Chatwoot (for CX tiles and approvals)
   - Google Analytics Data API (for SEO & growth metrics)
   - Publer (if social publishing is enabled)
3. **Review the dashboard tiles** once auto-refresh completes (default every 30 seconds): Ops Pulse, Sales Pulse, Fulfillment Health, Inventory Heatmap, CX Escalations, Approvals Queue, SEO & Content Watch, Idea Pool.
4. **Open the Approvals Queue** and clear any HIGH risk items before working other queues.
5. **Check notifications**: desktop + in-app bell icon. Resolve any overnight alerts before noon.
6. **Grade AI suggestions** as you approve or reject to feed the learning loop.

### 1.2 First-Time Setup Flow

1. Navigate to `Settings → Integrations` and click **Connect** on each provider. Follow OAuth prompts; success states appear as green badges.
2. Visit `Settings → Notifications` to configure quiet hours and SLA reminders (Chatwoot defaults to 15 minutes).
3. Go to `Settings → Tile Layout` to drag tiles in priority order. Use the `Auto-refresh` dropdown to match your team’s cadence.
4. Complete the **Setup Guide checklist** (top of dashboard) so every tile has data sources and alert thresholds.
5. Invite collaborators under `Settings → Team Access`. Roles map to ABAC policies: Operator, CEO Agent, Customer Agent, Specialist.

### 1.3 Daily Rhythm (From North Star §Growth Engine — Agent Orchestration)

- **Morning (15 min):** scan Ops Pulse, clear Approvals Queue (HIGH → LOW), address CX escalations, review urgent inventory alerts.
- **Throughout the day:** respond to notifications within 15 minutes, re-check tiles hourly, keep approvals under SLA, log feedback grades.
- **End of day (10 min):** empty approvals queue, review sales performance, close critical inventory alerts, queue tomorrow’s actions.

### 1.4 Navigation Tips

- Use the left nav to jump into domain-specific surfaces (Inventory, Analytics, Growth Engine, Support, Integrations, Knowledge Base).
- Each tile opens a drawer for detailed metrics, projected impact, and rollback instructions.
- Keyboard shortcuts: `J/K` cycle approvals, `A` approves, `R` rejects, `G` focuses grading, `?` opens this help center.

---

## 2. Feature Tutorials (How-To)

Each tutorial is scoped to a core launch workflow. Follow the steps in order; every step aligns with the approved App Home patterns and Polaris layout guidance ([Polaris Page/Layout/Card](https://polaris-react.shopify.com/components/layout-and-structure/page)).

### 2.1 Dashboard & Tiles

1. **Reorder tiles:** Dashboard → `Customize layout` → drag tiles; click **Save layout**. Tiles snap to the homepage pattern spacing.
2. **Adjust refresh:** Use the `Auto-refresh` dropdown (30s default, 15s minimum). Set heavier tiles (SEO Watch, Inventory Heatmap) to ≥60s to avoid noise.
3. **Inspect tile details:** Click a tile to open the drawer. Review evidence charts, confidence scores, and recommended actions.
4. **Hide tiles temporarily:** `Customize layout → Visibility` toggles. Hidden tiles remain in analytics but drop from the home grid.

### 2.2 Approvals Queue

1. Click the **Approvals Queue** tile or `Approvals` in the nav.
2. Use filters (Risk level, Source agent, Last updated) to triage.
3. Open an approval card to see evidence, expected impact, rollback plan, and policy checks.
4. **Approve:** `Approve` → optionally edit copy → grade Tone/Accuracy/Policy (1–5) → submit. Approved actions auto-execute via server adapters.
5. **Request changes or reject:** Add rationale; the originating agent receives the feedback in the decision log.
6. **Audit trail:** Click `View history` to see graded outcomes and operator edits for the selected suggestion.

### 2.3 Notifications & Alerts

1. Open `Settings → Notifications`.
2. Configure channels (In-app, Email, Desktop) per event type (Inventory critical, SLA breach, Deployment events, Growth anomalies).
3. Set quiet hours for non-critical alerts; HIGH risk notifications always bypass quiet hours.
4. Test delivery using the `Send test` button; confirm the toast in-app and email receipt.
5. For Chatwoot escalations, ensure `/rails/health` probe is green (visible in Support Health report).

### 2.4 Analytics & Reports

1. Navigate to `Analytics → Monitoring`. Tiles provide GA4 direct Data API results; filter date ranges via the context bar.
2. Use the `Compare` toggle to view 7d/14d/28d deltas powered by GA4 `hd_action_key` attribution.
3. Export CSV via the `Export` action (respects ABAC — CEO Agent only for revenue).
4. For anomaly detection, open `Analytics → Anomalies` and review flagged metrics, contributing dimensions, and recommended mitigations.

### 2.5 Inventory Management

1. Visit `Inventory → Alerts` for live stock status buckets (in stock, low, out, urgent reorder).
2. Click an alert to open the product drawer: see recent velocity, ROP calculation, suggested PO, and supplier notes.
3. Hit `Generate PO Draft` to push suggested quantities into the PO builder; approvals queue records the action.
4. Use `Inventory → Optimization` to review bundle rules (`BUNDLE:TRUE`) and picker payouts.

### 2.6 Settings & Integrations

1. Open `Settings → Integrations` to manage Shopify, Chatwoot, Publer, Google Analytics connections.
2. Toggle features on/off (e.g., Social Publishing) to control which approvals appear.
3. Use `Settings → Team Access` to assign roles; ABAC ensures the correct drawer views.
4. `Settings → Feature Flags` surfaces idea-pool experiments and dev toggles (Operator only).

---

## 3. Video Tutorial Scripts

Launch week requires short walk-through videos. Use these scripts when recording screen captures; each fits a 90–120 second demo.

### 3.1 Dashboard Overview (Video #1)

1. **Intro (10s):** “Welcome to HotDash. Let’s look at the launch dashboard tiles.”
2. **Tiles (45s):** Show auto-refresh, reorder tiles, open a drawer to highlight evidence.
3. **Approvals handoff (20s):** Jump to Approvals queue from the tile.
4. **Wrap (10s):** Remind operators to use keyboard shortcuts (`J/K`, `A`, `R`) and the `?` help menu.

### 3.2 Approvals Queue Deep Dive (Video #2)

1. **Intro (10s):** “Here’s how approvals flow from suggestion to execution.”
2. **Filters (20s):** Demonstrate risk filters and search.
3. **Card review (40s):** Open a HIGH risk suggestion, assess evidence, edit reply, grade tone/accuracy/policy.
4. **Bulk approve (20s):** Switch to LOW risk view, bulk approve after reviewing snapshots.
5. **Wrap (10s):** Highlight audit history and grading impact.

### 3.3 Notifications & Integrations (Video #3)

1. **Intro (10s):** “Configure alerts and keep integrations healthy.”
2. **Notifications (40s):** Walk through channel toggles, quiet hours, send test.
3. **Integrations (30s):** Show reconnecting Publer and verifying Chatwoot health.
4. **Wrap (10s):** Point to troubleshooting table for failures.

### 3.4 Inventory Actions (Video #4)

1. **Intro (10s):** “Resolve inventory alerts and generate POs.”
2. **Alerts (30s):** Open urgent reorder, explain thresholds.
3. **PO Draft (30s):** Generate draft, mention approvals queue entry.
4. **Wrap (10s):** Mention bundle rules and lead time settings.

### 3.5 Analytics & ROI (Video #5)

1. **Intro (10s):** “Track outcomes with GA4 attribution.”
2. **Monitoring (30s):** Filter date ranges, toggle compare.
3. **Exports (20s):** Export CSV, explain role-based access.
4. **Wrap (10s):** Tie results back to idea pool ranking.

Scripts live in `docs/help/video-scripts/` if you need to customize future recordings.

Video script library:

- [Dashboard Overview](video-scripts/dashboard-overview.md)
- [Approvals Deep Dive](video-scripts/approvals-deep-dive.md)
- [Notifications & Integrations](video-scripts/notifications-integrations.md)
- [Inventory Actions](video-scripts/inventory-actions.md)
- [Analytics & ROI Tracking](video-scripts/analytics-roi.md)

---

## 4. API Reference (Operator View)

HotDash exposes select read-only endpoints for operators who automate reporting. All endpoints require the operator token (see `Settings → API Access`). Responses are JSON and respect ABAC roles.

### 4.1 GET `/api/help/faq`

- **Description:** Returns the 20 launch FAQ entries with categories and last-updated timestamps.
- **Response sample:**
  ```json
  {
    "items": [
      {
        "question": "How do I change tile order?",
        "answer": "Use Customize layout…",
        "category": "dashboard",
        "updatedAt": "2025-10-24T18:30:00Z"
      }
    ]
  }
  ```
- **Use cases:** Embed FAQ search in internal docs, build chat triage bots.

### 4.2 GET `/api/help/tutorials`

- **Description:** Provides metadata and URLs for each help tutorial section and associated video script.
- **Response fields:** `id`, `title`, `summary`, `markdownUrl`, `videoScriptUrl`.
- **Use cases:** Automate linking inside operator LMS or in-product tooltips.

### 4.3 GET `/api/help/troubleshooting`

- **Description:** Returns troubleshooting table entries with symptoms, resolutions, tags, and escalation paths.
- **Use cases:** Integrate with on-call runbooks, power Slack triage workflows.

### 4.4 POST `/api/help/feedback`

- **Description:** Allows operators to submit help-center feedback. Requires payload `{ "page": "docs/help/README.md", "summary": "...", "details": "..." }`.
- **Behavior:** Writes to `DecisionLog` in KB database with `actor: "operator"` and notifies Content agent.

Ensure tokens are stored in Shopify environment secrets; never commit tokens to the repo.

---

## 5. Support SOP References

Coordinate with Support whenever customer-facing workflows change. The following SOPs remain the source of truth during launch week (links open in the repo for deep context):

- [Growth Engine CX Workflows](../support/growth-engine-cx-workflows.md) — escalation rules, approval SLAs, and hand-offs between CX and specialist agents.
- [Chatwoot Integration Guide](../support/chatwoot-integration-guide.md) — channel setup, token rotation, and failover steps for the shared inbox.
- [Chatwoot Health Dashboard Spec](../support/chatwoot-health-dashboard-spec.md) — probe definitions used by the `Support Health` tile.
- [Chatwoot Multichannel Testing Guide](../support/chatwoot-multichannel-testing-guide.md) — QA checklist for email, SMS, and web widget channels prior to launch.
- [PII Card Test Scenarios](../support/pii-card-test-scenarios.md) — verification steps for redaction rules and operator-only views.

For urgent CX escalations, follow the `Escalation` section inside the Growth Engine CX Workflows SOP and log outcomes in the approvals queue audit trail.

---

## 6. FAQ (20 Quick Answers)

1. **How do I change tile order?** Use `Dashboard → Customize layout` and drag tiles, then save.
2. **Can I pause auto-refresh?** Yes, set `Auto-refresh` to `Manual`; click the refresh icon to update tiles.
3. **Where do AI grades live?** In `Approvals → History` and the Supabase `approvals_grades` table (read-only).
4. **What happens when I reject a suggestion?** The originating agent logs feedback, and the action is archived with your rationale.
5. **How do I create a new approval manually?** Use `Action Queue → New suggestion`, attach evidence, then submit for operator review.
6. **Why is a tile blank?** The related integration is disconnected or the metric is filtered out; check `Settings → Integrations`.
7. **Can I export analytics?** Yes, click `Export` on any analytics report; exports respect role-based access.
8. **How are risk levels determined?** Based on action type: customer-facing = HIGH, operational drafts = MEDIUM, read-only insights = LOW.
9. **Where do I adjust inventory thresholds?** `Inventory → Settings → Thresholds` lets you customize per SKU group.
10. **How do I add a user?** `Settings → Team Access → Invite user`, assign role, and send invite.
11. **What if Publer is disconnected?** Social approvals pause; reconnect in `Settings → Integrations`.
12. **Can I see historical approvals?** Yes, filter the Approvals Queue to `State → Applied` or `Rejected`.
13. **How do I file a bug?** Use `Help → Submit feedback`; the manager receives it via decision log.
14. **Why is the GA chart delayed?** GA Data API refreshes every 15 minutes; wait for the next pull or check GA directly.
15. **How do I mute non-critical alerts?** Configure quiet hours per channel in `Settings → Notifications`.
16. **Can I bulk approve LOW risk items?** Yes, select multiple LOW risk cards and click `Bulk approve` after reviewing evidence snapshots.
17. **Where is the Idea Pool sourced?** AI-generated suggestions from Supabase `product_suggestions`, updated nightly.
18. **What browser is supported?** Chromium-based browsers (latest two versions) and Safari 17+.
19. **How do I escalate a CX conversation?** In the CX drawer, click `Escalate` to open a task for the Support agent.
20. **Where is the help center located?** `Top bar → ?` icon opens this document (`/help`).

---

## 7. Troubleshooting Guide

| Issue                              | Symptoms                                         | Resolution                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tiles stuck loading**            | Spinner persists >60s, data stale                | Verify integrations in `Settings → Integrations`, then click tile refresh. If still failing, check Supabase status and log blocker.          |
| **Approvals failing to apply**     | Toast: “Action execution failed.”                | Open approval card → `Execution logs` tab. Confirm upstream service health (Shopify, Chatwoot, Publer). Retry after fixing integration.      |
| **Chatwoot escalations missing**   | CX Escalations tile empty despite active tickets | Run `scripts/ops/check-chatwoot-health.mjs` or view `Support Health` report. Ensure API token valid and `/rails/health` returns 200.         |
| **Inventory alerts inaccurate**    | ROP suggestions look incorrect                   | Recalculate using latest lead times in `Inventory → Settings → Lead time`. Confirm daily job `inventory.rop.ts` ran (logs in Observability). |
| **Google Analytics data mismatch** | GA chart doesn’t match GA UI                     | Remember GA Data API updates every 15 minutes. Compare identical date ranges and property `hd_action_key` filters.                           |
| **Notifications not delivered**    | No desktop/email alerts                          | Re-enable browser notifications, verify quiet hours, and send `Send test` from settings. Check spam folder for email.                        |
| **Idea Pool empty**                | Tile displays empty state                        | Ensure nightly worker `idea-pool-refresh` succeeded; review logs. Manually trigger via `Action Queue → Refresh ideas` if necessary.          |
| **Help page 404**                  | `/help` route missing                            | Confirm deployment includes `app/routes/help.tsx`. Run `npm run lint` to ensure route exported default component.                            |

---

## 8. Documentation Standards & Maintenance

- **Structure:** This guide follows the Diátaxis documentation framework (tutorials, how-to, reference, explanation) per [Diátaxis best practices](https://diataxis.fr/complex-hierarchies) to avoid duplicated content and keep navigation predictable.
- **Polaris Compliance:** UI references align with the official [Polaris Page/Layout/Card guidance](https://polaris-react.shopify.com/components/layout-and-structure/page) to ensure consistency with Shopify Admin.
- **Shopify Build Guidance:** Reviewed Shopify’s [Apps to power commerce](https://shopify.dev/docs/apps/build/) handbook to confirm our embedded Admin experience, App Home usage, and evidence-first workflows match current platform expectations.
- **Source of Truth:** Feature behavior and daily workflows map directly to `docs/specs/help-documentation.md` §§1–13 and the North Star/Operating Model documents. When the product changes, update both the spec and this help file.
- **Update Process:**
  1. Draft changes in a feature branch (allowed paths `docs/help/**`).
  2. Log MCP evidence in `artifacts/content/<DATE>/mcp/CONTENT-HELP-DOCS-001.jsonl`.
  3. Reference related tasks in commit messages (`Refs #CONTENT-HELP-DOCS-001`).
  4. Notify the Manager so the database decision log captures the update.

---

## 9. Change Log

| Date       | Author        | Summary                                                                                                           |
| ---------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| 2025-10-24 | Content Agent | Initial launch-ready help center covering onboarding, tutorials, FAQ, troubleshooting, and maintenance standards. |
| 2025-10-25 | Content Agent | Added video script library links, operator API reference, support SOP references, and refreshed `/help` route search experience. |
