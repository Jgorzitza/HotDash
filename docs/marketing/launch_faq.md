---
epoch: 2025.10.E1
doc: docs/marketing/launch_faq.md
owner: marketing
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-18
---
# Hot Rod AN Dashboard — Launch FAQ (Operator Ready)

## How to Use This FAQ
- Audience: Hot Rod AN operators, mechanics, shop staff, and automotive aftermarket partners.
- Tone: Practical, gearhead-friendly, no corporate jargon.
- Language: Built for the hot rod community — speak automotive, not generic retail.
- Evidence links provided for technical details.

---

## Access & Activation

### Q: How do I access the Hot Rod AN Dashboard?
A: Log into Shopify Admin → Apps → HotDash. The dashboard opens immediately with all five tiles: CX Escalations, Sales Pulse, Inventory Heatmap, SEO Watch, and Fulfillment Health.

### Q: Do I need to set anything up before using it?
A: Nope. Shopify data is already connected. Connect Chatwoot for CX escalations and Google Analytics for SEO tracking when you're ready. Everything else works out of the box.

### Q: Can my shop staff use the dashboard?
A: Yes. Anyone with Shopify Admin access can use the dashboard. Permissions are inherited from Shopify, so your existing team access controls apply.

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

### Q: What does "AI suggests, you approve" mean?
A: When a hot rod customer asks about AN fittings or brake line setups, the AI drafts a suggested reply based on conversation history. You review, edit, and approve before anything sends. No auto-replies. Your expertise is irreplaceable — this just helps you move faster.

### Q: Will AI replace me?
A: Absolutely not. AI suggests, but you're the expert on hot rod parts. Every recommendation requires your approval. Your automotive knowledge is what makes Hot Rod AN special.

### Q: What if AI is wrong about a part recommendation?
A: You approve everything. If the AI suggests the wrong AN fitting size or adapter, you edit or reject it. All decisions are logged in the audit trail so you have context.

### Q: What data does AI see?
A: Only recent customer messages needed for context. We automatically strip payment details, emails, and phone numbers before the AI sees anything. Automotive questions and product inquiries are what the AI uses to draft replies.

### Q: Can I turn off AI suggestions?
A: Yes. Toggle "AI Reply Suggestions" off in Settings → CX. You'll still see customer escalations, just without draft replies.

---

## Configuration & Thresholds

### Q: Can I adjust when customer escalations trigger?
A: Yes. Set your SLA breach time to 2h, 4h, or 8h in Settings → CX. Hot rod enthusiasts expect fast responses, so default is 4 hours.

### Q: How does inventory prediction work for AN fittings?
A: The Inventory Heatmap tracks 14-day sales velocity for each SKU. When projected days-of-cover falls below your threshold (default 7 days), you get an alert with a recommended reorder quantity. Works great for fast-moving adapters and fittings.

### Q: Can I set custom alerts for different part categories?
A: Not yet (v1). Coming in Phase 2: custom thresholds for AN fittings, brake lines, fuel system components, etc.

### Q: How do I track hot rod search rankings?
A: Connect Google Analytics in Settings → Integrations. SEO Watch flags landing pages losing >20% traffic week-over-week. Adjust the threshold (15%, 20%, 25%) in Settings → SEO.

---

## Data & Security

### Q: Where is my hot rod customer data stored?
A: Data stays in your Shopify store and connected tools. We cache limited data in Supabase per Shopify security standards. No customer payment info or PII leaves the ecosystem.

### Q: What telemetry do you collect?
A: We log operator email, tile interactions, and request IDs to monitor uptime and improve the dashboard. Records live for up to 180 days. No customer data, no payment info.

### Q: Can I opt out of tracking?
A: Yes. Toggle "Share usage analytics" off in Settings → Privacy or email customer.support@hotrodan.com. Opting out doesn't affect dashboard access.

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
A: Use the "Have feedback?" link in the dashboard (routes to customer.support@hotrodan.com, handled via Chatwoot hosted on Fly.io) or log an issue in GitHub (`https://github.com/Jgorzitza/HotDash/issues`). For beta partners, #occ-feedback internal channel is monitored.

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
