# Dashboard Launch Checklist

**Owner:** Product Agent  
**Issue:** #113  
**Last Updated:** 2025-10-18  
**Status:** 🚧 In Progress

---

## 1) Purpose

Track production launch readiness for the HotDash operator dashboard, including rollout sequencing, rollback coverage, monitoring hooks, and human-in-the-loop (HITL) verification. This checklist aggregates the latest blockers surfaced across engineering lanes and aligns stakeholders on the go/no-go decision.

## 2) HITL & Approvals

- HITL reviewers must follow the [AI Agent Review Checklist (HITL)](../runbooks/ai_agent_review_checklist.md) before approving any customer-facing automation.
- QA to log completed HITL sessions under `artifacts/ai-customer/<DATE>/review_*.jsonl` with manifest hashes.
- Outstanding evidence: QA throughput metrics pending (`feedback/qa/2025-10-18.md`).

## 3) Launch Gates Overview

| Gate                            | Status     | Owner(s)                | Notes / Evidence                                                                                                                                                                   |
| ------------------------------- | ---------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run fmt`                   | 🚫 Blocked | Engineering             | Prettier halts on archived JSON corruption (`docs/_archive/.../retention_runs/2025-10-15_purge_log.json`); cleanup slice required.                                                 |
| `npm run lint`                  | 🚫 Blocked | Engineering (#107)      | 500+ lint errors (unused vars, `any` types, missing module aliases across analytics/shopify/tests suites).                                                                         |
| `npm run test:ci`               | 🚫 Blocked | QA / Engineering (#114) | Vitest fails on missing `tests/utils/render` helper and ESM interop for `react-router` (`tests/unit/components/dashboard/tiles.spec.tsx`, `tests/integration/social.api.spec.ts`). |
| `npm run scan`                  | ✅         | DevOps (#106)           | Gitleaks scan succeeded 2025-10-18 (`artifacts/devops/2025-10-18/sha256_manifest.txt`).                                                                                            |
| Analytics GA4 + Supabase export | 🚫 Blocked | Analytics (#104)        | Awaiting validated revenue/AOV/conversion numbers; ETA 2025-10-19 per analytics feedback.                                                                                          |
| Inventory staging apply window  | 🚫 Blocked | Data & Inventory (#111) | DevOps scheduling staging apply; migrations drafted but not applied.                                                                                                               |
| CEO go/no-go approval           | 🚫 Blocked | CEO Office              | Follow-up draft prepared (`artifacts/product/2025-10-18/ceo_followup_draft_2025-10-19.md`); waiting on response.                                                                   |
| CX health report (queue/SLA)    | ⚠️ Pending | Support (#116)          | Template prepared; waiting on latest queue metrics (promised 2025-10-19).                                                                                                          |
| HITL throughput evidence        | ⚠️ Pending | QA (#114)               | Session running; need throughput metrics before sign-off.                                                                                                                          |

## 4) Rollout Plan

1. **Confirm CI green** — require `npm run fmt`, `npm run lint`, `npm run test:ci`, and `npm run scan` to pass in sequence. _(Blocked on fmt/lint/test)_
2. **Analytics publish GA4 + Supabase export** — analytics team to drop verified dataset into launch packet and notify product. _(Blocked)_
3. **Inventory/data migrations staging apply** — DevOps schedule apply window for Issue #111; product to capture confirmation. _(Blocked)_
4. **CEO approval loop** — send reminder 2025-10-19 17:00 if still pending; update stakeholder packet upon response. _(Blocked)_
5. **Stakeholder briefing update** — once metrics land, refresh launch packet (daily brief + risk summary) and distribute via manager channel. _(Pending dependencies)_
6. **Final go/no-go rehearsal** — run HITL walkthrough, contract test (`rg 'Blocker' docs/specs/dashboard_launch_checklist.md`), and archive evidence. _(Pending upstream gates)_

## 5) Rollback Plan

- Freeze releases via manager directive; communicate freeze in #ops and stakeholder brief.
- Toggle dashboard feature flag off (`feature.dashboard.launch = false`) and confirm dashboards degrade gracefully.
- Revert latest deployment via Fly rollback (see `docs/devops/rollback_playbook.md`) once CI red reproduces the incident.
- Notify CEO and stakeholders with impact summary and ETA for remediation.
- HITL reviewers to suspend approvals and log outstanding conversations in `artifacts/ai-customer/`.

## 6) Monitoring & Verification

- **Observability:** Confirm Supabase decision log RLS enabled (`supabase/migrations/20251011144000_enable_rls_decision_logs.sql`) and observability logs streaming; monitor analytics pipeline after GA4 export.
- **Dashboard Metrics:** Track revenue/AOV/conversion, inventory WOS, CX SLA, growth metrics per `artifacts/product/2025-10-18/metrics_notes.md`.
- **Post-launch watch window:** 24-hour KPI watch with hourly checks; escalate anomalies via `reports/manager/ESCALATION.md`.
- **Contract Test:** `rg 'Blocker' docs/specs/dashboard_launch_checklist.md` — ensure blockers list current before green-lighting launch.

## 7) Launch Packet Components

- **Daily Brief:** Pending update once analytics data arrives; owner Product.
- **Risk & Rollback Notes:** Verified in Sections 4 & 5; share summary with stakeholders.
- **Stakeholder Comms:** Align with support and content lanes; draft to live in `artifacts/product/2025-10-18/` until numbers finalized.

## 8) Blockers & Next Actions

- Blocker: `npm run fmt` halted by archived JSON corruption; coordinate cleanup of `docs/_archive/.../retention_runs/2025-10-15_purge_log.json`.
  - Owner: Engineering • ETA: 2025-10-19
- Blocker: Lint debt (>500 errors across analytics/shopify/tests) unresolved; need engineering sweep before rerunning gate.
  - Owner: Engineering (#107) • ETA: 2025-10-20
- Blocker: `npm run test:ci` failing on missing `tests/utils/render` helper and `react-router` ESM interop; patch tests or config before next attempt.
  - Owner: QA/Engineering (#114) • ETA: 2025-10-20
- Blocker: Analytics GA4 + Supabase export not yet delivered (Issue #104); confirm ETA.
  - Owner: Analytics (#104) • ETA: 2025-10-19
- Blocker: DevOps staging apply window for inventory/data migrations unscheduled (Issue #111).
  - Owner: DevOps/Data (#111) • ETA: 2025-10-19
- Blocker: CEO go/no-go approval pending; send reminder if no response by 2025-10-19 17:00.
  - Owner: CEO Office • ETA: 2025-10-19 17:00 reminder
- Blocker: QA HITL throughput evidence not logged; capture and attach before sign-off.
  - Owner: QA (#114) • ETA: 2025-10-19
