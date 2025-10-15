---
epoch: 2025.10.E1
doc: docs/compliance/privacy_notice_updates.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-21
---
# Privacy Notice Updates — Operator Analytics & AI Assistance

## Purpose
Outline required amendments to external-facing privacy disclosures before GA MCP + Anthropic go-live, ensuring operators understand data usage and consent options.

## Proposed Language (for Marketing Site / In-App Modal)
1. **Dashboard Usage Analytics**
   > We collect limited operator telemetry (email, tile interactions, request IDs) to maintain service quality and detect outages. Data is retained for up to 180 days in our analytics datastore (Supabase) and is accessible only to authorized HotDash personnel. Operators can request an opt-out by contacting support or toggling "Share usage analytics" within the app settings.

2. **AI-Assisted Replies**
   > When you request an AI suggestion, relevant conversation context is sent to our AI provider (Anthropic) to generate a draft reply. We strip payment details and other sensitive fields before transmission. Suggestions are optional—you decide whether to send, edit, or discard them. We retain AI interaction logs for up to 12 months to improve detection of misuse and fulfill audit obligations.

3. **Third-Party Processors**
   > Our core processors include Shopify, Chatwoot, Supabase, Google Analytics, and Anthropic. Each processes data under signed agreements with data protection safeguards, and data may be transferred to the United States. Contact privacy@hotdash.io for the latest list of subprocessors.

## Required Product Changes
- Add privacy toggle to settings panel (`app/routes/app._index.tsx` future update) controlling analytics logging (feature flag).
- Display first-run notice summarizing analytics + AI data usage.
- Ensure launch FAQ and support scripts include telemetry/AI disclosures (`docs/marketing/launch_faq.md`).

## Next Steps
1. Marketing to integrate language into website privacy policy and operator onboarding emails.
2. Support to prepare FAQ article referencing opt-out mechanism.
3. Compliance to verify copy prior to publish and archive final version in `docs/compliance/evidence/privacy_notice/`.
