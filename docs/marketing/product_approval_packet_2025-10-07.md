---
epoch: 2025.10.E1
doc: docs/marketing/product_approval_packet_2025-10-07.md
owner: marketing
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-18
---
# Product Approval Packet — 2025-10-07

## Overview
Requesting product sign-off on the core launch comms assets ahead of the Operator Control Center production release. Feedback deadline: **2025-10-07 @ 17:00 ET** so we can circulate edits before end of day.

## Deliverables Requiring Approval

### 1. Launch Communications Packet (`docs/marketing/launch_comms_packet.md`)
- Ready for Mock → Staging → Production cadence; includes in-app banner, launch email, blog post, and tooltip copy.
- Adds final tooltip copy matched to `docs/design/copy_deck_modals.md` character limits (≤80 chars per tooltip).
- **Decisions needed:**
  - Confirm go-live banner CTA (`Explore Now →`) vs. variation (`View Dashboard →`).
  - Approve beta-partner invite language ("Your feedback shapes our roadmap").
  - Validate tooltip triggers (first dashboard visit, dismissible) before engineering handoff.

### 2. Release Notes Template (`docs/marketing/release_notes_template.md`)
- Structured per tile milestone with evidence requirements (Vitest, Playwright, Lighthouse).
- Includes V1.M2 sample release + tile-specific snippets for incremental updates.
- **Decisions needed:**
  - Confirm evidence thresholds (tile load time <500ms, error rate <1%).
  - Approve distribution list (in-app changelog, email, blog, partner portal).

### 3. Brand Tone & Talking Points Deck (`docs/marketing/brand_tone_deck.md`)
- Aligns copy with "professional but approachable" tone; builds on North Star.
- Contains EN/FR boilerplate, support scripts, and testimonial proof points.
- **Decisions needed:**
  - Validate CX Escalations testimonial usage (Evergreen Outfitters quote).
  - Approve FR translations pending professional review (flagged P1 with designer).

## Copy Variations for Product Review
| Surface | Variation A (current) | Variation B | Notes |
|---------|-----------------------|-------------|-------|
| In-app banner headline | `🎉 New: Operator Control Center is now live!` | `🎉 Operator Control Center is here for your daily truth.` | Both ≤70 chars; Variation B leans into "truth" messaging from brand deck. |
| In-app banner CTA | `Explore Now →` | `View Dashboard →` | Both ≤18 chars; confirm preference before engineering wires CTA to route. |
| Launch email subject | `[Launch] Operator Control Center is live in Shopify Admin` | `Your new operations command center is live in Shopify Admin` | Variation A keeps bracket convention; Variation B focuses on benefit. |
| Blog post subhead | `Monitor CX, sales, inventory & SEO without tab fatigue.` | `Know what changed overnight and act before issues escalate.` | Both ≤85 chars for CMS hero module. |
| Tooltip (Inventory Heatmap) EN | `Low-stock SKUs with AI reorder recommendations. Act before stockouts.` | `See low-stock SKUs and reorder before stockouts cost you.` | Both ≤78 chars; Variation B tightens phrasing, still action-oriented. |

_All surfaces moved forward with Variation B after product sign-off (2025-10-07)._

## Product Decisions (2025-10-07)
- ✅ In-app banner headline finalized: `🎉 Operator Control Center is here for your daily truth.`
- ✅ In-app banner CTA finalized: `View Dashboard →`
- ✅ Launch email subject approved: `Your new operations command center is live in Shopify Admin`
- ✅ Blog hero subhead approved: `Know what changed overnight and act before issues escalate.`
- ✅ Inventory Heatmap tooltip (EN) updated to approved variant: `See low-stock SKUs and reorder before stockouts cost you.`
  * FR banner variant: `🎉 Centre OCC : votre vérité quotidienne est là.`
  * FR CTA: `Voir le tableau de bord →`
  * FR email subject: `Votre nouveau centre de commande est en ligne dans l'administration Shopify`
  * FR inventory tooltip: `Voyez les SKU en stock faible et réapprovisionnez avant les ruptures coûteuses.`

## Evidence & References
- Brand tone benchmarks: `docs/marketing/brand_tone_deck.md`
- Copy limits: `docs/design/copy_deck_modals.md`
- Direction canon: `docs/NORTH_STAR.md`, `docs/directions/marketing.md`
- Prior approvals: `feedback/marketing.md` (2025-10-06 entry)

## Requested Feedback
1. Provide approvals or redlines on the three core docs via PR comments or reply in #occ-product.
2. Flag preferred copy variations (table above) so we can finalize assets.
3. Confirm timeline for production launch so marketing can schedule comms distribution.

**Next Check-in:** Ready to review feedback during daily standup (2025-10-08 @ 09:30 ET). Ping @marketing if async review needed.
