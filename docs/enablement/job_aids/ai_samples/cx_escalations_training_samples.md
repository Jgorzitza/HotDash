# CX Escalations — AI Dry Run Samples (2025-10-10 Draft)

## Staging Checklist
- Launch OCC staging with `?mock=1` and confirm `FEATURE_MODAL_APPROVALS=1`; keep `FEATURE_AI_ESCALATIONS=0` until telemetry sign-off, then flip to review AI copy.
- Seed Chatwoot sandbox with conversations from the operator agenda (`docs/runbooks/operator_training_agenda.md:63-104`) so SLA timers match the scripted scenarios.
- Open the staging Supabase decision log dashboard after each approval once secrets land; capture row screenshots for the dry-run evidence bundle.

### Scenario A — Late Shipment (Alex Rivera)
- **Shopify cues:** Order `#EVR-1045` shows label created 18h ago with no carrier movement.
- **Chatwoot cues:** Customer mentions "package still in transit" and "no tracking update"; SLA breach banner visible.
- **AI suggestion (ship_update):**
  "Hi Alex, thanks for flagging the delay. I've escalated this to our carrier and will email you a fresh tracking update as soon as they reply — I'll follow up within the next few hours."
- **Operator follow-through:** Attach the refreshed tracking link once the carrier responds and add an internal note summarizing outreach. Escalate to manager if the carrier ETA slips beyond 24h.
- **Evidence logging:** Confirm the decision log entry includes `scope="build"`, operator email, and shop domain; screenshot the Supabase row for the dry-run packet.

### Scenario B — Refund Offer (Jordan Lee)
- **Shopify cues:** Order `#EVR-1062` flagged "Damaged zipper"; value $325 triggers escalation threshold.
- **Chatwoot cues:** Customer attaches photo and requests refund/replacement; conversation auto-tagged `refund_offer`.
- **AI suggestion (refund_offer):**
  "I'm really sorry this item arrived faulty, Jordan. I can process a refund right away or ship a replacement if you prefer — let me know which works best and I’ll queue it immediately."
- **Operator follow-through:** Send the prepaid return label macro after replying. During the mock run, narrate the manager escalation path for refunds over $500.
- **Evidence logging:** Capture decision log entry + internal note; if Supabase unavailable, log the fallback in `feedback/ai.md` and annotate the enablement worksheet.

### Scenario C — SLA Breach & Hold (Taylor Morgan)
- **Shopify cues:** No fulfillment updates for three days; confirm status on the Shopify timeline before replying.
- **Chatwoot cues:** SLA timer red (>60 minutes) with a generic status request; no keyword template auto-select.
- **AI suggestion (ack_delay fallback):**
  "Hi Taylor, thank you for your patience — I'm reviewing your order details right now and will follow up with the exact status shortly."
- **Operator follow-through:** Add an internal note outlining the root cause and set a reminder to follow up within 60 minutes; escalate if still blocked after the follow-up window.
- **Evidence logging:** Once Supabase secrets land, add a follow-up fact (`topic="cx"`, `key="follow_up_due"`); during the mock run, record manually in the enablement worksheet.

### Scenario D — Policy Exception (Trainer Demo)
- **Purpose:** Demonstrate kill-switch behavior when AI should abstain.
- **Setup:** Toggle `FEATURE_AI_ESCALATIONS=0` to show template-only fallback for out-of-policy requests.
- **Operator script:** Explain policy exceptions route directly to manager; highlight "AI unavailable" messaging so operators understand guardrail behavior.
- **Evidence logging:** Capture a modal screenshot showing fallback copy once the UI patch lands; include in the dry-run appendix.

> **Next Steps:** Pair with enablement/support on 2025-10-15 to rehearse using the staging build, then append Supabase log IDs and annotated screenshots before distributing to operators.
