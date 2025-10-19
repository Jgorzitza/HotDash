Status: Planned only — do NOT seed or ship yet

# Main Dashboard (CEO Home)

Window: 7 days default; 28 days toggle. Tiles surface outcomes and risk with quick actions to resolve.

## Tiles (overview)

- Sales: Net Sales, Orders (AOV in drilldown)
- Approvals: Pending by feature, Over‑SLA, Today’s approvals
- Tickets/Live Chat: Open tickets, Live chats waiting, Over‑SLA (detailed below)
- Inventory Health: OOS SKUs, High‑risk urgent SKUs, Coverage days, Settlement status
- Ads: Spend, Revenue (GA4), ROAS, CAC; badges for UTMs/attribution
- SEO: Organic Revenue, Sessions, CVR, CTR/Impressions, Non‑brand share

---

## Cross‑Initiative Integration (Programmatic SEO → Guided Selling → CWV→$ → A/B)

Coordinate the four growth initiatives by surfacing ready actions and evidence via the Action Dock and tile badges. All actions are HITL‑gated; Autopublish OFF.

- Programmatic SEO Factory
  - Evidence: preview diffs, internal‑link plans, template bindings
  - Binding: Action Dock rows show `diff` chips (+pages, template, links); evidence drawer opens previews

- Guided Selling / Kit Composer
  - Evidence: UX skeleton, rules graph outline
  - Binding: Action Dock rows include impact rationale; quick links to PDP harness (flagged)

- CWV → Revenue (Media Pipeline)
  - Evidence: before/after Lighthouse, compression plan
  - Binding: Action Dock shows `webp`, `-MB` chips; no focus steal on 60s refresh

- A/B Harness
  - Evidence: experiment registry, GA4 dimension mapping
  - Binding: Action Dock indicates variant key; labels not color‑only

Accessibility & Refresh

- Maintain keyboard flow; evidence drawers return focus
- Use `aria-live="polite"` for counts; avoid focus changes on refresh

Flags & Rollback

- Feature flags remain OFF in dev/staging
- Rollback: disable flag and revert any dashboard/template binding

## Tickets / Live Chat Tile (detailed)

Purpose

- Give the CEO an instant read on customer conversation load and urgency, respecting business hours, and provide fast paths to clear queues or respond.

Primary metrics

- Open tickets (Chatwoot conversations with status open)
- Live chats waiting (active chat contacts without agent reply)
- Over‑SLA count (pending_review or unresponded beyond thresholds)

Secondary (in drilldown)

- Median time‑to‑first‑response (TFR)
- Today resolved count
- Oldest waiting (minutes)

Badges (status pills)

- In‑hours / Off‑hours (business hours: America/Edmonton)
- CEO Alerts ON (SMS/email enabled for live chat in‑hours)
- Offline capture (live chat offline → email intake active)
- Chatwoot OK / Degraded (basic health ping)

Thresholds (defaults)

- Live chats waiting:
  - Red: ≥ 1 (in‑hours)
  - Yellow: ≥ 1 (off‑hours)
- Over‑SLA:
  - Red: ≥ 3
  - Yellow: 1–2
- Median TFR (in‑hours):
  - Red: > 10m
  - Yellow: 5–10m

Quick actions

- Reply Queue → open filtered view of unresponded tickets (Chatwoot)
- Live Chat Console → open live chat inbox
- Business Hours → settings panel
- Page CEO → send test SMS/email alert (diagnostic)

Data sources

- Chatwoot API: conversations status, live contacts, timestamp of last user message vs agent reply
- Business hours config: docs/specs/hitl/customer-replies.config.json
- CEO alerts config: phone/email from docs/specs/hitl/customer-replies.config.json

SLA rules (aligned to Customer Replies)

- SLA clocks pause off‑hours
- Live chat: warn @ 5m without draft; escalate @ 15m pending review
- Email: start at next open time

Behavior & refresh

- Refresh cadence: every 60s (tile), 15s in expanded drilldown
- Off‑hours: show Offline capture badge and suppress CEO SMS badge
- In‑hours: show CEO Alerts ON if configured

Links (examples)

- Reply Queue: /tickets/queue?filter=unresponded
- Live Chat Console: /tickets/livechat
- Business Hours: /settings/business-hours
- Page CEO: /ops/notify/ceo-test

Security & logging

- PII redaction for message previews
- Log only counts and status in the tile; detailed transcripts available in drilldown with role checks

---

## Approvals Tile (outline)

### Approvals Tile (detailed)

Purpose

- Central view of work waiting on CEO; highlight blocking (P0) issues and SLA breaches; provide one‑click actions.

Primary metrics

- Pending total; breakdown: Replies, Inventory, Social, Discounts (counts in parentheses)
- Over‑SLA (any pending exceeding per‑feature SLA)
- Today’s approvals (count)

Badges

- P0 present (any subject with block=true reason codes)
- SLA Breach (Over‑SLA > 0)
- In‑hours / Off‑hours context (uses global business hours)

Thresholds (defaults)

- Pending total: Red ≥ 8; Yellow 4–7
- Over‑SLA: Red ≥ 3; Yellow 1–2

Quick actions

- Open Approvals (pending) → /approvals?status=pending_review
- Evidence view (top items) → /approvals?status=pending_review&view=evidence
- Adjust SLAs → /settings/slas

Notes

- Require reasons on Approve and Approve with Edit (per policy)
- P0 blocks Approve/Schedule until fixed; tile shows P0 present badge

## Sales Tile (outline)

### Sales Tile (detailed)

Primary metrics

- Net Sales (Shopify) • Orders

Secondary (drilldown)

- AOV, Refund rate, Median time‑to‑fulfillment

Badges & thresholds (defaults)

- Refund spike: Red if refund rate > 5%; Yellow > 3%
- Slow fulfillment: Red if median TTF > 24h; Yellow 12–24h
- Down WoW: Yellow if 7d Net Sales ↓ > 15% vs prior week

Quick actions

- Orders → /orders
- Shipping Queue → /ops/shipping
- Refunds → /ops/refunds

## Inventory Health Tile (outline)

### Inventory Health Tile (detailed)

Primary metrics

- OOS SKUs • High‑risk urgent SKUs
- Coverage days (min across top sellers) • Settlement status (last run time)

Badges & thresholds (defaults)

- OOS: Red ≥ 10; Yellow 5–9
- High‑risk urgent: Red ≥ 5; Yellow 1–4
- Low coverage: Red if count of SKUs with coverage < 14d ≥ 10; Yellow 3–9
- Settlement missed: Red if no run in last 26h; Failed: Red if last run failed

Quick actions

- PO/Receiving → /inventory/receiving
- Settlement Log → /inventory/settlement
- Low‑stock list → /inventory/low-stock

## Ads Tile (see Ads+Analytics spec)

Binding

- Uses metrics, badges, thresholds, and quick actions defined in `docs/specs/hitl/ads-analytics.config.json` under `dashboards.tiles.ads`.

## SEO Tile (see Ads+Analytics spec)

Binding

- Uses metrics, badges, thresholds, and quick actions defined in `docs/specs/hitl/ads-analytics.config.json` under `dashboards.tiles.seo`.
