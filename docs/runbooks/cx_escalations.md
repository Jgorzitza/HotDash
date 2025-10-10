---
epoch: 2025.10.E1
doc: docs/runbooks/cx_escalations.md
owner: support
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-20
---
# CX Escalations Runbook — Operator Control Center

## Purpose
Map each CX Escalations tile action to internal Standard Operating Procedures (SOPs) and escalation ladders. This runbook enables operators to handle customer conversations efficiently while maintaining quality and SLA compliance.

---

## Dashboard Actions & SOPs

### Modal Screenshots (Mock Mode)
![CX Escalation modal default state](images/cx_escalation_modal_overview.svg)
![Success toast after approval](images/cx_escalation_modal_toast.svg)

### 1. View Escalated Conversation
**Dashboard UI:** CX Escalations tile displays list of conversations with SLA breach indicators

**Operator Action:**
- Click conversation in tile to open the CX Escalation modal
- Review customer name, status, breach time, last message timestamp

**SOP Mapping:**
- **SOP-CX-001:** Conversation Triage Protocol
  - Priority 1: SLA breached >2 hours → Immediate response required
  - Priority 2: SLA breached <2 hours → Response within 30 minutes
  - Priority 3: Tagged "escalation" but within SLA → Review within 1 hour

**Escalation Ladder:**
- L1: CX Agent (first response, template selection)
- L2: CX Lead (escalation tag or complex issue)
- L3: Operations Manager (refund >$500, policy exception)

---

### 2. Approve & Send Reply (AI Suggestion)
**Dashboard UI:** Conversation detail modal with "Suggested Reply (AI-generated)" card

**Operator Action:**
- Review the AI-generated suggestion surfaced in the modal.
- Confirm the greeting reflects the customer name (defaults to "Customer" if Chatwoot lacks profile data).
- Edit the "Operator Note" field if extra context should be captured in the audit trail.
- Click "Approve & Send Reply" → sends the suggestion to Chatwoot and logs the decision.

**SOP Mapping:**
- **SOP-CX-002:** Template Response Guidelines
  - AI suggestion currently mirrors the `ack_delay` template; confirm tone and promise match the customer issue before approving.
  - If the suggestion is not appropriate, escalate the conversation or handle directly in Chatwoot.
- **Fallback:** When no suggestion is shown (missing `suggestedReply`), do **not** approve; escalate or reply in Chatwoot until template selector is available.

**Decision Logging:**
- Action: `chatwoot.approve_send`
- Scope: `ops`
- Metadata: conversationId, replyBody, operatorEmail, optional note

**Escalation Criteria:**
- Approved reply but no customer acknowledgement in 24h → Re-escalate to L2
- Suggestion missing or customer requests manager → Escalate to L3 immediately

---

### 3. Tag Conversation for Escalation
**Dashboard UI:** Modal action button "Escalate to Manager"

**Operator Action:**
- Click "Escalate to Manager" button
- Conversation tagged in Chatwoot with "escalation" tag
- Decision logged in HotDash

**SOP Mapping:**
- **SOP-CX-003:** Manager Escalation Protocol
  - Valid reasons: Policy exception, refund >$500, legal/fraud concern, abusive language
  - Notification: CX Lead notified via Slack (future integration)
  - Handoff: Add internal note summarizing issue + customer expectation

**Escalation SLA:**
- Manager must acknowledge within 2 hours
- Manager must resolve or provide update within 24 hours

**Decision Logging:**
- Action: `chatwoot.escalate`
- Scope: `ops`
- Metadata: conversationId, note (if provided), operatorEmail
- Chatwoot label applied: `escalation`

---

### 4. Mark Conversation as Resolved
**Dashboard UI:** Modal action button "Mark Resolved"

**Operator Action:**
- After customer satisfaction confirmed, click "Mark Resolved"
- Conversation status updated in Chatwoot
- Removed from CX Escalations tile

**SOP Mapping:**
- **SOP-CX-004:** Resolution Verification
  - Customer explicitly confirms issue resolved OR
  - 48 hours since last customer message after resolution offered
  - Do NOT mark resolved if: refund pending, return in progress, follow-up promised

**Decision Logging:**
- Action: `chatwoot.mark_resolved`
- Scope: `ops`
- Metadata: conversationId, optional note, operatorEmail

---

## Chatwoot Template Library

Current templates (app/services/chatwoot/templates.ts):

> **Note:** Suggested replies now map to templates via heuristics: shipping/delivery cues → `ship_update`, refund/return cues → `refund_offer`, otherwise `ack_delay`. Operators should still confirm tone before approving.

### Template: `ack_delay`
**Label:** Acknowledge delay
**Body:**
```
Hi {{name}}, thanks for your patience. I'm checking on your order now and will follow up with an update shortly.
```
**Use cases:** Order status questions, general inquiry delays, investigation needed

---

### Template: `ship_update`
**Label:** Shipping updated
**Body:**
```
Appreciate you reaching out, {{name}}. Your order is with our carrier and I'm expediting a status check right away.
```
**Use cases:** Shipping delays, tracking issues, carrier questions

---

### Template: `refund_offer`
**Label:** Refund offer
**Body:**
```
I'm sorry for the trouble, {{name}}. I can refund this immediately or offer store credit—let me know what works best.
```
**Use cases:** Product defects, wrong item shipped, customer dissatisfaction, quality issues

---

## Mock Mode Transcript Snippets & Edge Cases

> Pull these reference conversations from Playwright staging artefact `artifacts/playwright/shopify/playwright-staging-2025-10-10T04-20-37Z.log` while `?mock=0` remains blocked. Use them to rehearse tone, notes, and escalation decisions.

### Scenario Gallery

#### Shipping Delay Reassurance (`ship_update`)
```
Customer (Evergreen Outfitters — #PWA-4092):
"Hey team, my order still says processing. Do you have an update?"

Support AI Suggestion:
"Appreciate you reaching out, Alex. Your order is with our carrier and I'm expediting a status check right away."
```
- Approve AI reply, append operator note: "Requested UPS BOL via #occ-reliability @ 09:12 UTC" for audit trail.
- If tracking ID missing, add manual sentence with link before approving; follow SOP-CX-002 for promise tracking.

#### Refund Offer With Guardrails (`refund_offer`)
```
Customer (Peak Performance Gear — #PWA-4103):
"The zipper broke on first use. Can you just refund me?"

Support AI Suggestion:
"I'm sorry for the trouble, Jamie. I can refund this immediately or offer store credit—let me know what works best."
```
- Approve suggestion, then verify refund amount; escalate if >$500 or customer mentions "chargeback".
- Log Linear ticket (INC-SUPPORT-###) in operator note so L2/L3 can monitor reimbursement completion.

#### Backlog Queue Check-In (`ack_delay`)
```
Customer (Atelier Belle Maison — #PWA-4110):
"Just checking—did you get my earlier message about the wrong color?"

Support AI Suggestion:
"Hi Pat, thanks for your patience. I'm checking on your order now and will follow up with an update shortly."
```
- Approve reply, set Chatwoot reminder for 45 min follow-up, and document SLA timer in note.
- If conversation already tagged `escalation`, skip approval and confirm manager action before responding.

### Edge Case Checklist
- **Missing AI Draft:** If `suggestedReply` is null, do not approve. Escalate via `Escalate to Manager`, capture console log, and file in `feedback/engineering.md`.
- **Name Placeholder Fallback:** Templates default to "Customer" when Chatwoot lacks profile data; personalize manually or update contact record prior to approval.
- **High-Risk Language:** Terms like "legal", "fraud", "chargeback", or threats require immediate escalation even if the draft appears suitable.
- **Rapid Reopen:** If customer responds within 30 min after `chatwoot.mark_resolved`, the tile will re-surface with SLA breach 0. Reassess before marking resolved again.
- **Rate Limit Toast:** Should the modal emit a Shopify rate-limit error, switch to `docs/runbooks/shopify_rate_limit_recovery.md` and log the incident (timestamp + request ID) in `feedback/support.md`.

---

## Integration Monitoring & Alerts

**Health Checks:**
- Chatwoot API response time: <500ms (alert if >1000ms sustained)
- SLA breach count: Monitor daily trend (alert if >20% increase WoW)
- Template send failures: Alert reliability if error rate >5%

**Alert Channels:**
- Critical errors → Reliability team (Slack #incidents)
- SLA threshold breaches → Support lead + Ops manager
- Integration downtime → Immediate escalation per docs/runbooks/incident_response.md (pending)

## QA Verification Evidence
- 2025-10-10 Playwright staging run (`artifacts/playwright/shopify/playwright-staging-2025-10-10T04-20-37Z.log`) validated approve/escalate/resolve flows against Fly host `https://hotdash-staging.fly.dev` using mock data.
- Synthetic check `artifacts/monitoring/synthetic-check-2025-10-10T06-36-48.923Z.json` confirms dashboard load within 284 ms post-Playwright run; use these artifacts during operator rehearsals to demonstrate live readiness.

---

## Operator Training & Q&A

**Training Agenda:** See docs/runbooks/operator_training_agenda.md

**Common Confusing States:**
- Q: Conversation shows "SLA breached" but was already replied to?
  - A: Breach timestamp calculated from conversation creation, not last reply. Check `breachedAt` metadata.

- Q: Template variable {{name}} shows "Customer" instead of real name?
  - A: Chatwoot contact data incomplete. Add customer name in Chatwoot admin or use manual reply.

- Q: Decision log not showing after clicking "Send Reply"?
  - A: Check browser console for errors. File ticket with screenshot + conversationId.

**File Tickets:** Use Linear with label `support-feedback`, attach screenshots + timestamps

---

## Related Documentation
- Chatwoot service implementation: app/services/chatwoot/escalations.ts
- Template definitions: app/services/chatwoot/templates.ts
- Decision logging: app/services/decisions.server.ts
- Copy deck (English): docs/design/copy_deck.md
- Accessibility criteria: docs/design/accessibility_criteria.md

---

## Revision History
| Date | Author | Change |
|------|--------|--------|
| 2025-10-10 | support | Added mock-mode transcript gallery and edge case checklist for operator rehearsal while live data blocked. |
| 2025-10-10 | support | Added QA staging evidence references for modal verification |
| 2025-10-08 | support | Added template heuristics, rendered customer names, aligned escalation label |
| 2025-10-07 | support | Validated modal implementation, added screenshots, updated decision logging |
| 2025-10-06 | support | Initial runbook skeleton created per manager sprint focus |

---

## Next Steps
- [ ] Pair with engineer to validate modal flows against production data
- [x] Add annotated screenshots for modal default and success states (2025-10-07)
- [ ] Expand template library/AI suggestions beyond `ack_delay`
- [x] Align Chatwoot escalation label with SOP terminology (2025-10-08)
- [x] Draft incident_response.md for integration outages (see docs/runbooks/incident_response_supabase.md)

## Pending Validation — 2025-10-09
- [ ] Capture updated modal screenshots once staging seed is live (Owner: Support)
- [ ] Verify template heuristics against staged conversations and document edge cases (Owner: Support + Product)
- [ ] Re-run decision log export to confirm `chatwoot.*` events land in analytics with Supabase credentials (Owner: Support + Reliability)

## Validation Notes — 2025-10-08
- Modal launched with `FEATURE_MODAL_APPROVALS`; confirm flag enabled before training operators.
- `Approve & Send Reply` renders customer name into the template; operators must still confirm promise before sending.
- Decision logs emit actions `chatwoot.approve_send`, `chatwoot.escalate`, `chatwoot.mark_resolved`; audit dashboards should be updated to reflect these identifiers.
- Chatwoot escalation label now standardised to `escalation`; caches still accept legacy `escalated` tag for backwards compatibility.
