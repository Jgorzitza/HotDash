# Support Agent Training & Onboarding — HotDash

**Version:** 1.0  
**Effective:** 2025-10-25  
**Owner:** Support Agent  
**Audience:** New CX Operators, Support Leads, Manager

---

## 1. Purpose

Equip support operators with the knowledge, workflows, and quality guardrails required to run the HotDash support desk on day one. This guide builds on the Help Center (`/help`) and the Support SOP (`docs/support/support-sop.md`).

---

## 2. Onboarding Checklist

| Step | Action                                                                              | Evidence                                        |
| ---- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| 1    | Log into HotDash via Shopify Admin → Apps → **HotDash Control Center**              | Screenshot of dashboard tiles populated         |
| 2    | Complete the Help Center "Getting Started" tutorial (`/help?topic=getting-started`) | Checklist marked complete in app                |
| 3    | Connect Chatwoot, GA4, Publer integrations (`Settings → Integrations`)              | Green status badges in Integrations page        |
| 4    | Run Chatwoot health check (`npm run ops:check-chatwoot-health`)                     | Success output archived in `artifacts/support/` |
| 5    | Review **Support SOP** sections 2–5 (daily rhythm & escalation ladder)              | Initials + date recorded in Decision Log entry  |
| 6    | Read CX workflows overview (`docs/support/growth-engine-cx-workflows.md`)           | Acknowledge in Decision Log                     |
| 7    | Configure personal notification preferences (`Settings → Notifications`)            | Quiet hours + channels set                      |

**Tip:** Use the Help Center search to lookup unfamiliar concepts (e.g., "approvals", "analytics export").

---

## 3. Knowledge Base Usage

The Knowledge Base (KB) is the source of truth for product FAQs, processes, and historical resolutions. Access via the LlamaIndex MCP tools or `/help` embedded search.

1. **Find an answer:**
   - Use `/help` search or run `query_support` (LlamaIndex MCP) with the customer question.
   - Filter by the relevant topic (FAQ, Troubleshooting, Tutorials).
2. **Validate freshness:** Check the timestamp and linked artifacts in the response. If older than 30 days, confirm with the product lead before quoting.
3. **Log learnings:** Any KB gaps or corrections must be logged through `logDecision()` with `action: "kb_feedback"` so the Documentation lane updates sources.

---

## 4. Common Scenarios & Model Responses

| Scenario                                     | KB Source                                                        | Recommended Response Pattern                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Order status / tracking                      | KB → "Order inquiry" article; Chatwoot CRM drawer                | Provide latest tracking info, set follow-up reminder, link to Help Center shipping FAQ                        |
| Inventory availability                       | Help Center -> `?topic=feature-tutorials`, tile drawer           | Confirm stock status, offer back-in-stock alert, escalate using Inventory Alert runbook if out-of-stock > SLA |
| Refund/exchange                              | CX workflows doc, Accounts sub-agent output                      | Summarize policy, submit approval via Accounts agent, note refund timeline                                    |
| High-risk CX escalation                      | Support SOP Section 5, Chatwoot escalation rules                 | Acknowledge customer, gather evidence, escalate Level 2 or higher with Decision Log entry                     |
| App troubleshooting (blank tile, stale data) | Help Center troubleshooting table, Agent troubleshooting runbook | Walk through reset steps, rerun health script, document in Decision Log                                       |
| Feature request / feedback                   | Idea Pool process (`/help?topic=standards`)                      | Thank customer, capture context, submit feedback via `POST /api/help/feedback`                                |

Always personalize responses, confirm understanding, and invite the customer to reply if the issue resurfaces.

---

## 5. Escalation Procedures (Quick Reference)

Follow the Support SOP escalation ladder. Summary:

1. **Level 0 (Self-service):** Use `/help`, KB search, or existing runbooks.
2. **Level 1 (Support Lead):** If unresolved within 30 minutes or impacting multiple customers, post evidence in #support-hotdash and Decision Log.
3. **Level 2 (Manager):** SLA breach imminent (>60 minutes) or partial outage; ping manager with runbook link and health check output.
4. **Level 3 (On-call Engineering/DevOps):** Chatwoot outage, API failures, repeated Level 2 events; attach logs, `scripts/ops/check-chatwoot-health.mjs` output.
5. **Level 4 (Executive):** Legal/regulatory risk, data exposure, or unresolved Level 3 within 4 hours; coordinate with manager for customer comms.

Escalations must include a Decision Log entry with: severity, timestamps, customer impact, steps taken, next action.

---

## 6. Quality Guidelines

- **Tone:** Professional, empathetic, and aligned with brand voice. Mirror customer language while diffusing tension.
- **Accuracy:** Validate data against live tiles, KB, or API output before replying. Never guess.
- **Policy Compliance:** Follow refund/return policies and approval rules; do not promise actions beyond authority.
- **Documentation:** Log every significant interaction (approvals, escalations, troubleshooting) in the Decision Log with supporting artifacts.
- **Feedback Loop:** Grade AI suggestions (tone, accuracy, policy) and submit KB corrections via `logDecision()`.

Quality reviews occur weekly; 90% of interactions must score ≥4/5 across tone, accuracy, and policy.

---

## 7. Continuing Education

- Revisit the Help Center weekly—new sections are announced in Decision Log broadcast.
- Attend the Friday sync where the Support lead highlights escalations and knowledge updates.
- Pair with the AI-Customer agent when new flows launch to ensure SOP alignment.
- Review `docs/runbooks/growth-engine-support-training.md` modules for deeper practice exercises.

---

## 8. Revision History

| Date       | Version | Changes                                                                              | Author        |
| ---------- | ------- | ------------------------------------------------------------------------------------ | ------------- |
| 2025-10-25 | 1.0     | Initial onboarding guide covering KB usage, scenarios, escalation, quality standards | Support Agent |
