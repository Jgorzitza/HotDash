---
epoch: 2025.10.E1
doc: docs/marketing/phase2_ga_mcp_messaging.md
owner: marketing
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---

# Phase-2 GA MCP Messaging Draft — 2025-10-10

## Objectives

- Translate Google Analytics MCP availability into operator-facing messaging once credentials land and parity checks complete.
- Maintain alignment with product roadmap and compliance guardrails so GA MCP positioning stays accurate during approvals.
- Provide enablement with preview copy for dashboards, launch notes, and operator FAQs.

## Audience & Positioning

- **Primary audience:** Shopify operators who already rely on OCC tiles for CX, sales, and SEO monitoring.
- **Pain points addressed:** Fragmented analytics context, long lag times on acquisition metrics, lack of cross-surface insights inside OCC.
- **Value promise:** GA MCP brings real-time landing page health and acquisition insight directly into OCC tiles, tied to the same approve/assign workflows operators already trust.

## Messaging Pillars

1. **Unified Metrics:** GA MCP data flows into the Operator Control Center alongside Shopify, Supabase, and Chatwoot telemetry so operators see campaign health in one place.
2. **Faster Response:** Highlight sub-300 ms staging target and planned monitoring hooks (per `docs/data/ga_mcp_parity_checklist.md`) to reinforce reliability once credentials ship.
3. **Governed Access:** Stress read-only OAuth scope, vault-managed credentials, and DPIA coverage (see `docs/compliance/evidence/vendor_dpa_status.md`) so compliance can pre-approve copy.
4. **Actionable Signals:** Tie GA MCP insights to specific OCC workflows (SEO & Content Watch tile escalations, campaign alerts) rather than vanity metrics.

## Launch Assets To Update

- `docs/marketing/launch_comms_packet.md` — Add GA MCP section once host + credentials confirmed.
- `docs/marketing/launch_faq.md` — Prepare Q&A entries covering credential handling, monitoring, and fallback.
- `docs/marketing/support_training_script_2025-10-16.md` — Insert rehearsal steps for GA MCP tile walkthrough once parity evidence exists.
- `docs/marketing/campaign_calendar_2025-10.md` — Slot GA MCP Phase-2 announcements against vendor approval milestones.
- Operator blog / email variants — Stage CTA language noting GA MCP availability gating on OCC-INF-221 closure.

## Evidence Requirements Before Publishing

- Credential delivery + storage logs (`scripts/deploy/sync-ga-mcp-secrets.sh` output, vault audit trail).
- Parity checklist completion (items 1-8 in `docs/data/ga_mcp_parity_checklist.md`).
- Monitoring artifact (`artifacts/monitoring/ga-mcp/<timestamp>.json`) showing latency/error budget compliance.
- DPIA addendum + vendor DPA confirmation (tracked in `docs/compliance/evidence/vendor_dpa_status.md`).
- QA screenshot bundle demonstrating GA MCP tile in OCC with fact IDs.

## Current Blockers (2025-10-10)

- OCC-INF-221 still pending; no `GA_MCP_HOST`/credential bundle.
- Compliance awaiting Google DPA + subprocessor list; DPIA addendum on hold.
- Data team contract tests still skipped pending host availability.

## Immediate Next Steps

1. Draft placeholder copy for `launch_comms_packet.md` and FAQ referencing GA MCP readiness gates.
2. Sync with data/reliability on expected telemetry timelines so messaging promises precise SLA once host arrives.
3. Outline enablement talking points (tile walkthrough + monitoring posture) for review during the 2025-10-16 dry run prep.
4. Coordinate with compliance on consent/privacy language updates ahead of GA MCP go-live.

## Open Questions

- Do we promise any specific GA MCP metrics at launch (landing-page anomalies only vs. broader acquisition tiles)?
- Should GA MCP rollout target a beta cohort first, mirroring Phase-1 Shopify approach, or leap to GA once parity passes?
- What threshold of monitoring stability is required before marketing can schedule external announcements (e.g., 24h of green checks)?
