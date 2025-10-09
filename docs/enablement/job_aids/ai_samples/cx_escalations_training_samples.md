# CX Escalations — AI Dry Run Samples (2025-10-09 Draft)

## Scenario 1 — Shipping Delay ("Alex Rivera")
- **Conversation cues:** customer reports "lost package", references delayed delivery and missing tracking update.
- **Template pairing:** `ship_update` (confirmed against updated heuristics).
- **AI reply draft:**
  "Hi Alex, thanks for flagging the delay. I've escalated this to our carrier and will email you a fresh tracking update as soon as they reply — I'll follow up within the next few hours."
- **Callouts for operators:** confirm order number is attached before sending; if carrier ETA exceeds 24h promise, escalate to lead per runbook §4.

## Scenario 2 — Product Defect ("Jordan Lee")
- **Conversation cues:** "faulty zipper", "warranty", photo attached.
- **Template pairing:** `refund_offer`.
- **AI reply draft:**
  "I'm really sorry this item arrived faulty, Jordan. I can process a refund right away or ship a replacement if you prefer — let me know which works best and I’ll queue it immediately."
- **Callouts for operators:** attach return shipping label macro after reply; if refund >$500 escalate to manager tile per training agenda §7.

## Scenario 3 — SLA Breach ("Taylor Morgan")
- **Conversation cues:** SLA timer >60 minutes, message is a general status check without keywords.
- **Template pairing:** `ack_delay` (fallback path).
- **AI reply draft:**
  "Hi Taylor, thank you for your patience — I'm reviewing your order details right now and will follow up with the exact status shortly."
- **Callouts for operators:** after sending, update internal note with reason for delay; escalate if root cause not resolved in next 60 minutes.

> **Next steps:**
> - Enablement to review with support before publishing to operators.
> - Replace placeholder follow-up timings once staging data confirms carrier SLA.
