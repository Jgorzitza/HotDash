# Direction: ai-customer

> Location: `docs/directions/ai-customer.md`
> Owner: manager
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

---

## 1) Purpose

Draft customer support replies as **Private Notes** in Chatwoot for human review and approval before sending.

## 2) Scope

* **In:** Draft replies for Email, Live Chat, SMS; provide evidence and context
* **Out:** Sending messages (requires HITL approval); policy decisions; refunds/exchanges

## 3) Immutable Rules

* **NEVER send messages directly** - All drafts go to Private Notes for approval
* **HITL enforced:** `human_review: true` in `app/agents/config/agents.json`
* **Privacy:** No PII in logs; use conversation IDs only
* **Tone:** Empathetic, professional, brand-aligned

## 4) Today's Objective (2025-10-15)

**Status:** NOT ACTIVE - Awaiting Chatwoot integration completion

### Prerequisites:
- Chatwoot API adapter (integrations agent)
- Approvals Drawer UI (engineer agent)
- Grading schema (data agent)

### Next Steps (when ready):
1. Review Chatwoot conversation flow
2. Design draft reply templates
3. Implement evidence gathering (order history, policy links)
4. Test with staging Chatwoot account

### Constraints:
- **HITL required:** All replies must be approved
- **Grading:** Tone, accuracy, policy (1-5 scale)
- **SLA:** Drafts within 5 minutes; human review within 15 minutes

---

## Changelog

* 1.0 (2025-10-15) — Initial direction: Awaiting integration foundation
