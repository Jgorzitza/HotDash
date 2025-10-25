# Support Agent Training Program

**Version:** 1.0  
**Last Updated:** 2025-10-24  
**Owner:** Support Team

---

## Purpose

This guide provides the end-to-end onboarding and enablement program for Hot Dash customer support agents. It combines required setup steps, training modules, escalation procedures, and quality expectations so new agents can reach production readiness within the first week.

---

## 1. Onboarding Checklist

| Phase | Timeframe | Actions | Resources |
| ----- | --------- | ------- | --------- |
| Pre-Day 0 | Before start | Receive welcome email, sign NDA, confirm equipment, review company overview | `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md` |
| Day 0 | Account provisioning | Manager grants access to Chatwoot (staging & production), Hot Dash dashboard, Vault credentials | `vault/occ/chatwoot/super_admin_staging.env`, `vault/occ/chatwoot/super_admin_prod.env` |
| Day 1 Morning | Environment setup | Log into Chatwoot and Hot Dash, set 2FA, join Slack `#support`, complete profile, bookmark dashboards | `docs/training/chatwoot-ai-assistant-guide.md` |
| Day 1 Afternoon | Tool orientation | Complete guided walk-through of Chatwoot HITL flow and knowledge base search; shadow experienced agent for 3 conversations | `docs/training/chatwoot-quick-reference.md`, `docs/knowledge-base-training.md` |
| Day 2 | AI workflow certification | Work through AI assistant guide, submit practice approvals, record grades, compare with answer key | `docs/training/chatwoot-ai-assistant-guide.md` |
| Day 3 | Scenario drills | Complete five common scenario run-throughs (orders, returns, defects, VIP, policy exception) with mentor feedback | `docs/training/chatwoot-scenarios-examples.md` |
| Day 4 | Escalation rehearsal | Practice escalation notes, SLA timing, and notification paths; review CX workflows | `docs/support/growth-engine-cx-workflows.md` |
| Day 5 | Go-live review | Manager reviews quality scores, confirms escalation readiness, assigns first live queue shift | Internal QA checklist |

**Success Criteria**: Agent demonstrates ability to approve/edit AI drafts, navigate knowledge base, follow SLA timing, and trigger escalations correctly.

---

## 2. Required Systems Access

1. **Chatwoot** – Primary inbox for customer conversations.
   - Staging: https://hotdash-chatwoot.fly.dev (practice)
   - Production: https://support.hotdash.ai (live queue)
2. **Hot Dash Dashboard** – Monitor queue, performance metrics, and AI feedback loops.
3. **Knowledge Base** – Internal article search, article feedback, and confidence tracking (`docs/knowledge-base-training.md`).
4. **Vault Access** – Retrieve credentials and API keys as documented in the onboarding checklist.
5. **Communication Channels** – Slack `#support`, escalation DM groups, and incident bridge as needed.

> ⚠️ **Security Reminder**: Never store credentials locally. Use Vault references and follow PII redaction rules outlined in `docs/support/growth-engine-cx-workflows.md`.

---

## 3. Training Modules

| Module | Goal | Completion Criteria | Evidence |
| ------ | ---- | ------------------- | -------- |
| Intro to AI-Assisted Support | Understand HITL philosophy and tooling | Complete `chatwoot-ai-assistant-guide` reading, pass knowledge check (≥ 80%) | Quiz results stored in LMS |
| Knowledge Base Mastery | Search and adapt responses | Demonstrate 3 successful searches with tailored responses | Mentor sign-off |
| Scenario Playbook | Handle top 5 issue categories | Submit annotated drafts for each scenario type | Stored in practice queue |
| Escalation Protocol | Trigger and document escalations | Create sample escalation note meeting all requirements | Manager approval |
| Quality Standards | Apply grading and tone guidelines | Grade 5 AI drafts, align with benchmark scores ±0.5 | QA review |

Managers track module completion in the performance dashboard and schedule remediation if standards are not met within the first week.

---

## 4. Common Scenarios Playbook

Use the following quick reference during training; detailed examples live in `docs/training/chatwoot-scenarios-examples.md`.

| Scenario | Checklist | Key Policies | Reference |
| -------- | --------- | ------------ | --------- |
| Order Status | Verify order number, confirm shipping carrier, provide tracking link, set expectation for next update | SLA: Respond < 15 min, update customer within 2 hours if carrier investigation needed | Sections 1.1–1.3 |
| Refund & Returns | Confirm eligibility, retrieve order details, outline next steps, log refund approval | Manager approval required for refunds > $100, follow return window policy | Sections 2.1–2.3 |
| Product Questions | Match product SKU, quote specifications from KB, suggest alternatives | Avoid speculative statements—use verified KB articles only | Section 3.1–3.2 |
| Complaint Handling | Acknowledge feelings, apologize, outline resolution path, offer follow-up | Escalate if threats/chargebacks, maintain professional tone | Section 4.1–4.2 |
| VIP & Bulk Orders | Prioritize response, gather business details, route to sales liaison | Escalate to Manager immediately for pricing approval | Section 5.1–5.2 |
| Edge Cases | Follow legal/compliance scripts, consult policy owners, document thoroughly | GDPR requests and safety issues require Manager involvement | Section 6 |

For each live conversation, agents must document decision rationale in Private Notes and update conversation tags for analytics.

---

## 5. Escalation Procedures

When standard workflows cannot resolve an issue, follow the escalation sequence derived from `docs/support/growth-engine-cx-workflows.md`:

1. **Trigger Conditions**
   - Refunds over **$100** or outside policy
   - Policy exceptions (free shipping, extended warranty)
   - Complex operational issues (carrier intervention, supplier coordination)
   - High-risk customer sentiment (threats, legal language, VIP complaints)
   - Repeated sub-agent/API failures preventing resolution

2. **Document the Escalation**
   - Flag conversation as **Urgent** in Chatwoot.
   - Add a structured Private Note covering customer details, issue summary, attempted actions, and requested decision.
   - Include SLA expectation (`Critical < 15 min`, `High < 30 min`, `Standard < 2 hours`).

3. **Notify the Manager**
   - Ping via Slack `#support-escalations` and direct mention of on-call Manager.
   - If P0 incident (payments, fraud, security), open incident bridge immediately.

4. **Track Resolution**
   - Await Manager instruction before committing to customer outcome.
   - Log follow-up tasks in Hot Dash dashboard and update ticket with final resolution.

> ⏱️ **Escalation SLA**: Managers respond within 15 minutes for critical issues, 30 minutes for high priority, and 2 hours for standard exceptions.

---

## 6. Quality Standards

Quality expectations map to the grading system defined in `docs/training/chatwoot-ai-assistant-guide.md` and `docs/support/growth-engine-cx-workflows.md`.

- **Tone**: Friendly, professional, and empathetic. Target average ≥ 4.5.
- **Accuracy**: Responses must reference verified data (orders, KB entries). Target average ≥ 4.7.
- **Policy**: All commitments must comply with published policies; seek Manager approval for exceptions. Target average ≥ 4.8.
- **Edit Distance**: Aim for ≥ 70% of AI drafts sent with minimal edits; document reasons for heavy rewrites to improve training data.
- **SLA Compliance**: Maintain response times within tier targets (Critical < 5 min, High < 15 min, Standard < 2 hours).
- **PII Handling**: Follow redaction rules—never expose full email, phone, or address in public replies. Use PII card for internal context.

Weekly QA audits compare agent grades to benchmarks ±0.5 tolerance. Agents with persistent gaps enter remediation plan (paired reviews, targeted drills).

---

## 7. Daily Operating Checklist

1. **Start of Shift**
   - Review overnight escalations and pending follow-ups.
   - Check dashboard metrics for SLA breaches or red flags.
   - Announce availability in Slack `#support`.
2. **During Shift**
   - Work conversations oldest-first unless SLA dictates otherwise.
   - Grade every AI draft and provide brief rationale in Private Note.
   - Update tags and dispositions for reporting.
   - Escalate immediately when trigger conditions are met.
3. **End of Shift**
   - Zero out assigned queue or hand off with note.
   - Record learning insights for continuous improvement (use `logDecision()` when database is available).
   - Confirm no open escalations without owner.

---

## 8. Reference Library

- `docs/training/chatwoot-ai-assistant-guide.md` – Full walkthrough of AI approval flow.
- `docs/training/chatwoot-scenarios-examples.md` – Detailed scenario breakdowns with graded responses.
- `docs/training/chatwoot-quick-reference.md` – One-page daily quick reference.
- `docs/training/chatwoot-troubleshooting.md` – Troubleshooting guide for AI drafts, access issues, and workflows.
- `docs/support/growth-engine-cx-workflows.md` – Comprehensive CX workflows, SLAs, and escalation policies.
- `docs/knowledge-base-training.md` – Knowledge base usage and best practices.

Agents should bookmark these documents and review updates announced in Slack every Monday.

---

## Document History

| Version | Date | Author | Notes |
| ------- | ---- | ------ | ----- |
| 1.0 | 2025-10-24 | Support Team | Initial creation for SUPPORT-TRAINING-001 |
