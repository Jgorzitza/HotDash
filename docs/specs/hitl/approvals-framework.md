Status: Planned only — do NOT seed or ship yet

# Approvals Framework (Runtime HITL)

Unified, CEO‑only approval system for Customer Replies, Inventory Updates, Social Publishing, and Discounts. Provides consistent statuses, actions, reason codes, evidence, audit trail, business hours SLAs, and notifications.

## Goals

- One approval UX/pipeline across features
- CEO‑only (with optional delegates later)
- Required evidence and audit events on every action
- SLAs respect business hours (America/Edmonton)
- Learning loop: edits + reasons → coach notes → agent acknowledgment

## Domain Objects (by feature)

- Customer Reply: draft → pending_review → approved → sent | rejected | changes_requested
- Inventory Update: draft → pending_review → approved → applied | rejected | changes_requested | failed
- Social Post: draft → pending_review → approved | scheduled → published | rejected | changes_requested | failed
- Discount: draft → pending_review → approved → active | rejected | changes_requested | expired

## Canonical Statuses

- draft, pending_review, approved, scheduled, applied/published/sent, rejected, changes_requested, failed, canceled
- Each feature maps to these; scheduler status used where applicable (social, discounts)

## Actions (CEO)

- Approve (no edits)
- Approve with Edit (inline edit required)
- Schedule (social/discounts)
- Request Changes (send back with reasons)
- Reject (with optional reasons)
- Cancel (scheduled items only)

Rules

- Approve with Edit requires ≥1 reason code selection
- All actions capture evidence + audit event
- Idempotent on repeated clicks (action key per subject + status)

## Reason Codes (taxonomy)

- Global editorial: Tone/Voice, Accuracy/Factuality, Policy/Promise/Scope, Legal/Compliance/PII, Brand/Links/Assets, Clarity/Structure, Escalation/Ownership, Missing Context/Info, Risk/Safety, Format/Conciseness
- Inventory: Receive PO, Return/RMA, Cycle Count, Damage/Shrinkage, Supplier Error, System Correction, Inter‑location Transfer, Kitting/Assembly, Other
- Social/Offers: Tone/Brand, Compliance/Claims, Asset/Media, Link/UTM, Timing/Schedule, Clarity/Conciseness, Targeting

Config lives in reason‑codes JSON; per‑feature subsets enforced. CEO may update taxonomy via settings (HITL gated).

## Evidence & Audit (required)

Evidence bundle per approval:

- Before/after payloads (diffs if available)
- Attachments/media snapshots
- Validation warnings/blocks (PII, policy, reserved stock, link checks)
- Reason codes selected, notes

Audit event fields:

- id, occurred_at, actor_id, action (approve|approve_edit|schedule|request_changes|reject|cancel)
- subject_type (customer_reply|inventory_update|social_post|discount)
- subject_id, status_before, status_after
- evidence_ref (json pointers/checksums)
- referenceDocumentUri (Shopify/Order|MarketingActivity|Discount id if applicable)

## Business Hours & SLAs

- Business hours: America/Edmonton; hours already captured in Customer Replies and Inventory specs
- SLA clocks pause outside business hours
- Thresholds (defaults; configurable):
  - Customer Replies: live chat warn @ 5m, escalate @ 15m; email: business‑day target
  - Inventory: warn @ 24h pending_review for high‑risk
  - Social: warn @ 24h if scheduled pipeline falls < min scheduled (e.g., 5 posts/7d)

## Notifications

- Channels: SMS/email to CEO for high‑priority (Customer Replies live chat in‑hours), in‑app for others
- Respect business hours for paging; queue off‑hours notifications
- Slack (optional) for team updates (planning)

## UI (Approvals Drawer)

- Header: subject summary (channel, vendor/location where relevant)
- Evidence tabs: Details, Diff, Warnings, Attachments
- Reason picker (required on Approve with Edit)
- Actions: Approve, Approve with Edit, Schedule (if applicable), Request Changes, Reject, Cancel (scheduled)
- Coach notes preview (post‑approval)

## Security & Roles

- CEO required for final Approve/Schedule; agents may draft/submit
- Optional delegates list (planning) with explicit toggle per feature
- Full audit trail immutable; PII redaction applied to evidence

## Cross‑Feature Hooks

- Customer Replies: sends via Chatwoot; sets ai‑customer.human_review = true; stores channel message IDs
- Inventory: apply to Shopify via inventorySet/Adjust; attach adjustment group id; auto settlement continues nightly
- Social: publish via Publer; store Publer job/post IDs + MarketingActivity upsert in Shopify
- Discounts: create/activate via Shopify Admin GraphQL; store DiscountCodeNode id

## Learning Loop & Acknowledgment

- Generate coach notes from edit diffs and reasons; tag by feature and topic
- Agent must acknowledge coach notes before next draft (soft gate Day‑1)
- Weekly reports: edit rates, reasons heatmap, SLA adherence

## Idempotency Keys

- Per approval action: `${subject_type}:${subject_id}:${target_status}`
- Prevents duplicate state transitions on retries

## MCP‑first & Evidence

- All external API interactions (Shopify, Publer, Chatwoot) must be documented via MCP or equivalent transcripts in evidence (production mode stores API responses sans secrets)

## Open Decisions

- Delegates: allow specific non‑CEO users to approve? (default OFF Day‑1)
- Required reasons on plain Approve (not only Approve with Edit)? (default OFF)
- SLA thresholds per feature (defaults above acceptable?)
