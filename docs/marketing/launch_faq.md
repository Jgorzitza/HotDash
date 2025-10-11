---
epoch: 2025.10.E1
doc: docs/marketing/launch_faq.md
owner: marketing
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-18
---
# Operator Control Center — Launch FAQ (Support Ready)

## How to Use This FAQ
- Audience: Store operators, CX leads, support agents preparing for launch.
- Tone: Professional, approachable, action-oriented (per `docs/marketing/brand_tone_deck.md`).
- Localization: EN complete; FR translation pending professional review (flagged P1).
- Evidence links provided so support can cite source material when responding.

---

## Access & Activation

### Q: How do I access the Operator Control Center?
A: Once the app is updated, log into Shopify Admin → Apps → HotDash. The dashboard opens to the Operator Control Center home with all five tiles visible.

**Evidence:** App navigation spec (`app/routes/app._index.tsx`).

### Q: Do I need to enable anything before first use?
A: No extra setup is required to see Sales Pulse, Inventory Heatmap, Fulfillment Health, or SEO & Content Watch in mock mode. Connect integrations (Chatwoot, Google Analytics) to unlock live data.

**Evidence:** Product operating plan (`docs/directions/product_operating_plan.md`).

### Q: Can team members without Shopify Admin access use the dashboard?
A: Operator Control Center inherits Shopify Admin permissions. Anyone who can access the HotDash app can use the dashboard; there is no separate login.

**Evidence:** App authentication runbook (`docs/runbooks/authentication.md`).

---

## Integrations & Data Sources

### Q: What integrations are required for full coverage?
A: Shopify is always-on. Connect Chatwoot for CX Escalations and Google Analytics for SEO & Content Watch. Inventory data comes directly from Shopify; Sales Pulse uses Shopify Orders + Payments APIs.

**Evidence:** Launch comms packet — "Supporting Materials" section (`docs/marketing/launch_comms_packet.md`).

### Q: How do I connect Chatwoot?
A: Go to Operator Control Center → Settings → Integrations → Chatwoot. Paste the API token generated in Chatwoot (Admin → Settings → API Access). Status indicator turns green when connected.

**Evidence:** Integration walkthrough script (`docs/strategy/initial_delivery_plan.md`, M3 section).

### Q: What if Google Analytics isn’t connected?
A: SEO & Content Watch tile will show "Connect Google Analytics" with a CTA to authorize via OAuth. The rest of the dashboard still functions.

**Evidence:** Product design wireframes (`docs/design/wireframes/dashboard_wireframes.md`).

---

## AI & Automation

### Q: What does "AI-suggested reply" mean?
A: For CX Escalations, the system reads conversation history from Chatwoot and drafts a suggested reply. Operators always review, edit, and approve before anything sends. No auto-send.

**Evidence:** Brand tone deck — AI messaging section (`docs/marketing/brand_tone_deck.md`).

### Q: What data is shared with the AI provider?
A: We send only the most recent messages needed for context and automatically strip payment details, emails, and phone numbers before the prompt goes to OpenAI (via our LlamaIndex service). Drafts and approvals are retained for audit purposes for up to 12 months.

**Evidence:** DPIA (`docs/compliance/dpia_chatwoot_openai.md`).

### Q: Is the suggested reply logged anywhere?
A: Yes. When you approve or edit an AI reply, the final message and decision are captured in the decision audit trail.

**Evidence:** Decision logging schema (`packages/facts/README.md`).

### Q: Can I disable AI suggestions?
A: Yes. Toggle "AI Reply Suggestions" off in Settings → CX. The tile will still surface escalations, but without draft replies.

**Evidence:** Settings spec (`docs/design/wireframes/settings_cx.md`).

---

## Configuration & Thresholds

### Q: Can we adjust SLA breach times?
A: Yes. Choose 2h, 4h, or 8h in Settings → CX → SLA Breach Threshold. The tile recalculates in under a minute.

**Evidence:** Product operating plan (Release Review Checklist, Mock) (`docs/directions/product_operating_plan.md`).

### Q: How are low-stock alerts calculated?
A: Inventory Heatmap flags SKUs when projected days-of-cover falls below your set threshold (default 7 days). Recommendations consider 14-day sales velocity.

**Evidence:** Inventory data contract (`packages/facts/inventory_heatmap.md`).

### Q: Can I set custom SEO drop percentages?
A: Yes. SEO & Content Watch supports 15%, 20%, or 25% week-over-week drop thresholds. Adjust in Settings → SEO.

**Evidence:** Launch comms packet tooltip copy (`docs/marketing/launch_comms_packet.md`).

---

## Data & Security

### Q: Where is my data stored?
A: Data stays within your Shopify store and connected tools. HotDash caches data in Supabase per Shopify security standards; no customer PII leaves the ecosystem.

**Evidence:** Security runbook (`docs/runbooks/security.md`).

### Q: What operator analytics do you collect?
A: We log limited telemetry (operator email, tile interactions, request IDs) so we can monitor uptime and improve the dashboard. Records live in Supabase for up to 180 days and are restricted to the HotDash reliability team.

**Evidence:** Privacy notice update draft (`docs/compliance/privacy_notice_updates.md`).

### Q: Can I opt out of analytics tracking?
A: Yes. Toggle "Share usage analytics" off in Settings → Privacy. You can also email customer.support@hotrodan.com to request manual removal. Opting out doesn’t affect dashboard access.

**Evidence:** Privacy notice update draft (`docs/compliance/privacy_notice_updates.md`).

### Q: Who can view the decision audit trail?
A: Anyone with HotDash dashboard access can view the audit trail. Permissions mirror Shopify Admin roles.

**Evidence:** Audit trail spec (`docs/strategy/initial_delivery_plan.md`, Decision Logging section).

### Q: Does the app support GDPR/CCPA compliance?
A: Yes. Data retention follows Shopify app policies, and all actions are auditable. Contact support if a deletion request is made; the runbook covers steps.

**Evidence:** Compliance checklist (`docs/marketing/launch_comms_packet.md`, Compliance section).

---

## Telemetry & Success Metrics

### Q: What metrics prove adoption?
A: Key metrics include Operator activation rate (>70%), in-app banner CTR (>15%), session opens, and tile interaction counts. Operators can view a summary in the Ops Pulse tile (release candidate v1.M2).

**Evidence:** Launch comms packet — Metrics & Success Tracking (`docs/marketing/launch_comms_packet.md`).

### Q: How do we report bugs or feedback?
A: Use the "Have feedback?" link in the dashboard (routes to customer.support@hotrodan.com) or log an issue in GitHub (`https://github.com/Jgorzitza/HotDash/issues`). For beta partners, #occ-feedback internal channel is monitored.

**Evidence:** Release notes template (Support section) (`docs/marketing/release_notes_template.md`).

---

## Troubleshooting

### Q: Why do tiles show "Mock data" labels?
A: Mock mode is active when integrations aren’t connected or Shopify sync hasn’t completed. Flip the mock/live toggle in Settings → General once data connections succeed.

**Evidence:** Product operating plan (Mock Review requirements) (`docs/directions/product_operating_plan.md`).

### Q: Inventory numbers look off — what should I check?
A: Confirm Shopify inventory sync completed (Settings → Inventory → Last Sync timestamp). Re-run sync manually if older than 15 minutes.

**Evidence:** Inventory runbook (`docs/runbooks/inventory_sync.md`).

### Q: I don’t see the decision audit trail link.
A: Ensure you’ve updated to v1.M2.0 or later. Clear browser cache if the nav link still doesn’t appear; the route is `/app/audit-trail`.

**Evidence:** Release notes template (v1.M2.0 example) (`docs/marketing/release_notes_template.md`).

---

## Training & Support

### Q: Is there a training session scheduled?
A: Support training is targeted for the week of 2025-10-14. Date to be confirmed once product approves final deck.

**Evidence:** Feedback log (`feedback/marketing.md`, 2025-10-06 entry).

### Q: Where can I find the brand tone guide?
A: See `docs/marketing/brand_tone_deck.md` for voice, message pillars, and boilerplate copy in EN/FR.

### Q: Will translations be available at launch?
A: Yes. French copy is drafted and awaiting professional review. Expect signed-off translations before production go-live.

**Evidence:** Designer request in `docs/design/copy_deck_modals.md` (Translation Review Required).

---

## Revision Log
| Date | Change | Owner |
|------|--------|-------|
| 2025-10-07 | Initial FAQ drafted for operator-facing launch support. | Marketing |

## Pending Items
- [ ] Add FR translations post review.
- [ ] Insert staging URL + mock credentials once finalized by product.
- [ ] Update training date after support schedules session.
