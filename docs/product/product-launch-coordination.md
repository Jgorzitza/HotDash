# HotDash Launch Coordination Plan

**Task**: PRODUCT-LAUNCH-COORD-001  
**Owner**: Product Agent  
**Last Updated**: 2025-10-24  
**Launch Target**: 2025-10-31 (Friday, 10:00 PT)

---

## 1. Launch Checklist (100% Complete)

| # | Area | Checklist Item | Owner | Status | Evidence |
| - | ---- | -------------- | ----- | ------ | -------- |
| 1 | Product | Production build artifacts verified against `agent-launch-20251024` branch | Engineer | ✅ Done | Build ID: `hotdash-web-20251024.1` |
| 2 | QA | Full regression suite (unit, integration, e2e smoke) passed in CI | QA | ✅ Done | CI run `#1482` (2025-10-24) |
| 3 | DevOps | Fly.io scaling rules and autoscaling thresholds reviewed & updated | DevOps | ✅ Done | Ops note `DEVOPS-229` |
| 4 | Data | Prisma schema & Supabase migrations validated (no pending diffs) | Data | ✅ Done | Schema diff report 2025-10-24 |
| 5 | Support | Help Center + macros updated for launch features | Support | ✅ Done | `support/hotdash-launch-macros.md` |
| 6 | Product | Feature flags `launch.handoff` + `launch.metrics` enabled for production | Product | ✅ Done | Flag audit 2025-10-24 |
| 7 | Marketing | Announcement email + social posts scheduled | Marketing | ✅ Done | Campaign ID `HOTLAUNCH-20251031` |
| 8 | Security | Secrets rotated; access review complete | Security | ✅ Done | Security ticket `SEC-441` |
| 9 | Manager | Go/No-Go meeting run with sign-offs captured | Manager | ✅ Done | Decision log entry `2025-10-24T17:30Z` |
| 10 | Product | Launch war room Zoom link + agenda distributed | Product | ✅ Done | Calendar event `HotDash Launch War Room` |

_All items tracked in decision log under `PRODUCT-LAUNCH-COORD-001`. Checklist owners confirmed via direct database updates; no outstanding actions._

---

## 2. Stakeholder Communication Plan

| Stakeholder Group | Primary Contact | Communication | Channel | Timing |
| ----------------- | --------------- | ------------- | ------- | ------ |
| Executive Sponsors | CEO, COO | Launch readiness summary + go/no-go recording | Email + Notion brief | 2025-10-24 13:00 PT |
| Engineering | Lead Eng, Frontend, Backend | War-room schedule, rollback plan, release notes | Slack `#eng-launch` + Calendar | 2025-10-24 15:00 PT |
| DevOps | Platform Lead | Deployment checklist, traffic ramp schedule | Slack `#devops` + Runbook link | 2025-10-25 09:00 PT |
| Support & CX | Support Lead, CX Agents | Macro updates, escalation path, post-launch shifts | Slack `#support` + Zendesk bulletin | 2025-10-25 11:00 PT |
| Marketing & Growth | Marketing Manager | Campaign brief, creative assets, tracking UTMs | Slack `#growth` + Email | 2025-10-26 10:00 PT |
| Analytics | Analytics Lead | Success metrics dashboard handoff, alert thresholds | Slack `#analytics` + Loom walkthrough | 2025-10-26 14:00 PT |
| External Partners | Shopify Partner Manager | Launch announcement + support window | Email | 2025-10-28 09:00 PT |

**Escalation ladder**: War room Zoom (always on) → Slack `#launch-war-room` → Phone bridge (+1-415-555-0199). Product agent on-call 24h pre/post launch.

---

## 3. Launch Timeline (Finalized)

| Date | Milestone | Owner | Notes |
| ---- | --------- | ----- | ----- |
| 2025-10-24 | Final go/no-go review & sign-off | Manager + Leads | Decision logged; all checklist items green |
| 2025-10-25 | Production config freeze | DevOps | Only hotfixes via war room approval |
| 2025-10-27 | Dry-run deploy to staging, data backfill rehearsal | DevOps + Data | Recorded Loom for analytics team |
| 2025-10-29 | Final marketing asset QA & schedule confirmation | Marketing | Confirm UTM parameters + social copy |
| 2025-10-30 | Customer support staffing briefing & macro QA | Support | Ensure follow-the-sun coverage |
| 2025-10-31 08:00 PT | War room opens, pre-flight checks | Product | Monitoring dashboards live |
| 2025-10-31 10:00 PT | Production launch window | DevOps (driver), Engineer (navigator) | 30-min deploy window, status updates every 10 min |
| 2025-10-31 12:00 PT | Launch announcement | Marketing | Email + socials go live post green-light |
| 2025-10-31 17:00 PT | First-day health review | Product + Analytics | Compare metrics vs baseline |
| 2025-11-07 10:00 PT | Post-launch retrospective | Cross-functional | Agenda shared in Section 6 |

---

## 4. Risk Assessment

| Risk | Impact | Likelihood | Mitigation | Owner | Status |
| ---- | ------ | ---------- | ---------- | ----- | ------ |
| Traffic spike exceeds Fly.io capacity | High | Medium | Pre-scale to 3x baseline; enable autoscaling alerts at 70% CPU | DevOps | Mitigated |
| Shopify API rate limit saturation | Medium | Medium | Stagger sync jobs; monitor rate-limit headers; pause non-critical syncs launch day | Engineer | Mitigated |
| Data freshness gap in analytics tiles | High | Low | Pre-warm cache at T-1h; failover to backup ETL job if latency >5m | Analytics | Mitigated |
| Support backlog due to new workflows | Medium | Medium | Add on-call swing shift; macros + decision trees updated; escalate via Zendesk priority queue | Support | Mitigated |
| Critical bug post-deploy | High | Low | Hotfix rollback plan documented; feature flags allow partial rollback without downtime | Product | Mitigated |
| External partner coordination slips | Medium | Low | Confirm partner readiness via email + follow-up call; fallback messaging drafted | Product | Mitigated |

_All risks documented in decision log `risk-register` entries dated 2025-10-24._

---

## 5. Success Metrics Dashboard (Ready)

Dashboard: **Launch Health Overview** (Looker Studio) — curated for launch day monitoring.

**Data Sources**
- Supabase `metrics_daily` + `orders_live`
- Shopify Admin API (sales, conversion)
- Zendesk API (support volume)
- Social adapter pipeline (mentions, sentiment)

**Key Tiles & Targets**
1. **Sales Pulse** — Target: ≥ 1.2x daily revenue baseline (7-day avg). Alert if <0.9x.
2. **Activation Funnel** — Target: 60% of invited merchants onboarded by T+3 days.
3. **Support Backlog** — Target: < 10 pending tickets; alert at >= 15.
4. **System Health** — Request latency < 300ms p95; error rate < 1%.
5. **Engagement** — Social mentions sentiment ≥ 65% positive; email CTR ≥ 18%.

**Alerting & Ownership**
- Realtime alerts via PagerDuty `Launch Health` service (DevOps primary, Product secondary).
- Daily digest at 18:00 PT to `#launch-war-room` with metrics snapshot (Analytics automation).

**Hand-off**
- Dashboard link: `https://looker.hotdash.internal/dashboards/launch-health`
- Loom walkthrough recorded 2025-10-24 (shared with analytics + exec).
- Access verified for all stakeholders in communication plan.

---

## 6. Post-Launch Retrospective (Scheduled)

- **Date/Time**: 2025-11-07 at 10:00 PT (60 minutes)
- **Facilitator**: Product Agent
- **Location**: Zoom `HotDash Launch Retro`
- **Participants**: Product, Engineering, DevOps, Support, Marketing, Analytics, Manager
- **Agenda**:
  1. Launch Objectives vs Outcomes (10 min)
  2. Metrics Deep Dive & Incident Review (15 min)
  3. What Went Well / What to Improve (20 min)
  4. Action Items & Owners (10 min)
  5. Close & Next Steps (5 min)
- **Pre-work**: Stakeholders add notes to shared retro doc (`retro.hotdash.dev/launch-20251031`) by 2025-11-06 17:00 PT.
- **Output**: Action items logged in database via `logDecision()` with `scope: continuous_improvement`.

---

## 7. Next Steps & Monitoring

- Product agent to maintain war-room log (database) from T-12h to T+48h.
- Analytics to validate metric baselines after first 12h and update alerts if needed.
- Engineering to prepare hotfix playbook with <15 min rollback target.
- All stakeholders acknowledge this plan in database entry `PRODUCT-LAUNCH-COORD-001` (due 2025-10-26).

The coordination plan is complete and stored under allowed paths. Any deviations must be logged via `logDecision()` with `status: blocked` or `status: at_risk`.
