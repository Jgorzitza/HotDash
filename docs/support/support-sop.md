# Support Operations SOP — HotDash Control Center

**Version:** 1.0  
**Effective:** 2025-10-25  
**Owner:** Support Agent  
**Audience:** Customer Support Operators, Manager, On-Call Engineers

---

## 1. Purpose & Scope

This SOP defines the end-to-end workflow for customer support inside HotDash, including day-to-day operations, tooling expectations, and the escalation ladder when incidents or customer-impacting issues arise. It complements existing deep-dive runbooks and provides quick links to the canonical procedures.

**In scope**

- CX queue triage (Chatwoot, email, SMS) and approvals handoff
- Monitoring and maintaining support-facing surfaces (CX tiles, notifications, Help Center)
- Operator communication standards and documentation requirements
- Escalation pathway from frontline agents to management and engineering

**Out of scope**

- Development of AI agents (see `docs/support/growth-engine-cx-workflows.md`)
- Inventory or fulfillment escalations (see `docs/runbooks/inventory-alert-escalation-workflow.md`)
- Platform-wide outages (refer to the Manager/DevOps incident playbooks)

---

## 2. Daily Operating Rhythm

| Time | Action | Tooling | Notes |
| --- | --- | --- | --- |
| Start of shift | Review CX Escalations & Approvals Queue | HotDash Dashboard → Approvals tile | Clear HIGH risk cards first, grade responses (tone/accuracy/policy) |
| Hourly | Check Chatwoot health & SLA timer | `npm run ops:check-chatwoot-health` or CX Escalations tile | See [Chatwoot Health Runbook](../runbooks/support_chatwoot_health.md) |
| Throughout day | Monitor notifications & alerts | HotDash Notifications center; Chatwoot | Respond within SLA (default 30 minutes) |
| End of shift | Summarize outstanding issues, handoff notes | Decision Log entry via feedback template | Include blockers, customer promises, pending escalations |

**Reference:** Detailed workflows and grading policies live in [`docs/support/growth-engine-cx-workflows.md`](growth-engine-cx-workflows.md).

---

## 3. Core Tooling & Checklists

- **HotDash Help Center (`/help`)** — now searchable with deep links (`?topic=<section>`). Use the “Getting Started” and “Troubleshooting” sections for operator FAQs.
- **Chatwoot** — Primary CX channel. Follow routing, automation, and SLA guidance in [`docs/support/chatwoot-integration-guide.md`](chatwoot-integration-guide.md).
- **Approval Workflow** — All AI-generated drafts require HITL approval and grading. Guidance is in Section 2 of the Help Center and the CX Workflows document.
- **Health Scripts** — `npm run ops:check-chatwoot-health` (Chatwoot), `scripts/ops/check-chatwoot-health.mjs` (manual). Escalate per Section 5 when failures persist.
- **Documentation Updates** — Use Diátaxis format and log evidence via `logDecision()` or the feedback template (`scripts/agent/log-feedback.ts`).

---

## 4. Incident Classification

| Severity | Description | Initial Actions |
| --- | --- | --- |
| S0 — Critical | Complete outage, customer data risk, regulatory exposure | Immediate escalation to Manager + On-call DevOps; follow Manager Incident SOP |
| S1 — High | Major feature inoperative (approvals queue blocked, Chatwoot down), SLA breach across multiple conversations | Trigger Level 3 escalation, update customers within 30 minutes |
| S2 — Medium | Single-channel disruption, delayed analytics, Help Center stale | Attempt Level 2 remediation, prepare comms if SLA impact > 30 minutes |
| S3 — Low | Minor UI bug, help content typo, single-customer education | Resolve within shift; document in Decision Log |

Severity drives which rung of the escalation ladder you activate.

---

## 5. Escalation Ladder

| Level | Trigger | Action | Contacts / Runbooks |
| --- | --- | --- | --- |
| Level 0 — Self-Service | S3 issues, knowledge gaps | Consult Help Center search (`/help`), review CX workflows doc | `/help`, `docs/support/growth-engine-cx-workflows.md` |
| Level 1 — Support Lead | S2 issue unresolved in 30 minutes or knowledge gap persists | Post summary + evidence in #support-hotdash (Slack) and Decision Log | Support Agent lead on duty |
| Level 2 — Manager | SLA breach approaching or S2 unresolved after 60 minutes | Page Manager, attach Decision Log ID, link relevant runbook | Manager Incident SOP, `docs/runbooks/agent-troubleshooting.md` |
| Level 3 — On-call DevOps/Engineering | S1 issues (Chatwoot down, API failures), repeated health check failures | Tag on-call (see `docs/runbooks/deployment.md` on-call table), provide logs, scripts output | `scripts/ops/check-chatwoot-health.mjs` results, `docs/runbooks/support_chatwoot_health.md` |
| Level 4 — Executive | S0 issues, legal/compliance risk, repeated Level 3 within 24h | Manager escalates to CEO; align on comms plan | Executive escalation instructions in `docs/runbooks/manager_emergency_startup.md` |

**Evidence requirement:** Every escalation must include:

1. `DecisionLog` entry (use feedback template) with severity, timestamps, and actions taken.
2. Links to relevant runbooks or health check output.
3. Customer communication plan if applicable.

---

## 6. Documentation & Training Links

- **Support Training Packet** — Pending BLOCKER-001 data load. When unblocked, publish onboarding guide in `docs/training/` (see `SUPPORT-TRAINING-001`).
- **Help Center Maintenance** — Changes funnel through the Help Center doc (`docs/help/README.md`) and `/help` route. Use the new search and deep-link capabilities to surface context-sensitive tips.
- **Escalation Runbooks** — Quick access:
  - Chatwoot health & SLA: `docs/runbooks/support_chatwoot_health.md`
  - Agent troubleshooting ladder: `docs/runbooks/agent-troubleshooting.md`
  - Inventory escalations: `docs/runbooks/inventory-alert-escalation-workflow.md`
  - Growth Engine support training: `docs/runbooks/growth-engine-support-training.md`

---

## 7. Reporting & Feedback

- Log daily summary and blockers via the feedback template (`logDecision()`) — categorize as `scope: "build"`, `actor: "support"`.
- Track unresolved follow-ups in Decision Log `nextAction` so the manager can route resources.
- Surface gaps (missing runbooks, stale SOP) at the end of each week in the manager sync.

---

## 8. Revision History

| Date | Version | Changes | Author |
| --- | --- | --- | --- |
| 2025-10-25 | 1.0 | Initial SOP drafted; added escalation ladder and Help Center integration notes | Support Agent |

