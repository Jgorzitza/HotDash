Status: Planned only — do NOT seed or ship yet

# Customer Replies (HITL, Runtime Product)

This document captures the Day‑1 plan for Customer Replies with CEO-only approvals. It is a product/runtime HITL feature plan, not dev-process governance. Per direction, this is saved for later execution to avoid duplication while we review overlapping features (inventory, social publishing, data, analytics).

## Scope (Day‑1)

- Intake via Chatwoot, which aggregates: email, website live chat, Twilio/SMS, social DMs.
- Draft replies by agents/AI immediately on intake (even off-hours).
- CEO-only review with Approve, Approve with Edit (inline), Request Changes, Reject.
- On approval, post reply back to the original channel via Chatwoot; capture message IDs.
- Persist evidence and set `ai-customer.human_review = true`.

## Business Hours, SLA, and Priority

- Timezone: MST (confirm IANA tz before implementation to avoid DST ambiguity).
- Hours:
  - Mon–Fri: 09:00–21:00
  - Sat–Sun: 10:00–17:00
- SLA rules:
  - SLA does NOT accrue outside business hours. SLA start = next open time.
  - Live chat is priority 1 during business hours; off-hours live chat is disabled and routes to offline email capture.
  - No fallback auto-replies at 2h; notifications only.
- CEO notifications:
  - When a live chat starts in-hours: send SMS and email to CEO.
  - Off-hours: no live session; offline capture sends email notification.

## CEO Contact

- SMS: +1 (509) 263-9701
- Email: justin@hotrodan.com

## Offline Chat Copy

We’re probably elbows-deep in an LS swap or chasing down a stubborn AN fitting.
Drop your message below — we’ll get back to you faster than you can say “torque wrench.” 🔧🔥

## Learning Loop

- Store both Agent/AI Draft and CEO Final; generate unified diffs.
- Require CEO to select 1–2 reason codes for edits; store coach notes.
- Present diffs + coach notes to drafting agent; require acknowledgment before next draft.
- Weekly reporting: edit rate by channel/intent; hotspots for coaching.

## Proposed Reason Codes (hold for CEO final list)

- Tone/Voice; Accuracy/Factuality; Policy/Promise/Scope; Legal/Compliance/PII; Brand/Links/Assets; Clarity/Structure; Escalation/Ownership; Missing Context/Info; Risk/Safety; Format/Conciseness.

## Data Model (planned, do not migrate yet)

- customer_replies: id, approval_id, chatwoot_conversation_id, channel, draft_message_id, sent_message_id, status, created_by, timestamps
- customer_reply_versions: id, customer_reply_id, author_role (agent|ai|ceo), content, content_html?, version_number, created_at
- customer_reply_diffs: id, customer_reply_id, from_version, to_version, diff_unified, reason_codes[], coach_notes, created_at
- customer_reply_metrics: id, customer_reply_id, is_over_sla, sla_seconds, first_response_seconds, approvals_cycles, channel_priority
- audit_events (reuse): subject_type 'customer_reply', subject_id, event_type, payload_json, actor_id, created_at

## UI (planned)

- Approvals → Customer Responses: inline editor, side-by-side diff, reason code picker (required when editing), warnings panel, approve/send.
- Agent Composer: coach notes and Do/Don’t snippets; post-approval diff and acknowledgment.
- CEO Dashboard: open tickets, by channel, over-SLA count, live chat pinned; filters by channel/date.
- Admin Settings → Business Hours: timezone and weekly windows; preview open/closed.

## Implementation Constraints

- MCP-first policy for external APIs (Chatwoot, Twilio, SMTP, React Router/Remix, Shopify).
- PII redaction in training artifacts; no auto model retraining Day‑1.
- No code/migrations/seeds to be applied until cross-feature planning completes (inventory, social publishing, data, analytics).

## Open Items for Cross-Feature Planning

- Shared business-hours module consumed by Customer Replies, Inventory updates, and Social publishing.
- Unified notification bus for CEO alerts to avoid duplicate SMS/emails across features.
- Central reason-code taxonomy for approvals across domains (customer replies, inventory, social, data mutations).

## Ready-to-Implement Configuration (recorded; do not apply yet)

- Timezone: MST (confirm IANA tz id)
- Hours: Mon–Fri 09:00–21:00; Sat–Sun 10:00–17:00
- CEO_SMS_PHONE: +15092639701
- CEO_ALERT_EMAIL: justin@hotrodan.com
- Offline chat message: see section above.
