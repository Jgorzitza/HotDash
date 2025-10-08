---
epoch: 2025.10.E1
doc: feedback/marketing.md
owner: marketing
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-08
---
# Marketing Daily Status — 2025-10-07

## Summary
- Locked product-approved copy variants into launch assets (banner, email, hero subhead, tooltip).
- Delivered support-ready Operator Control Center FAQ ahead of training.
- Finalized tooltip copy (EN/FR) within character limits and queued design + localization follow-ups.
- Published October campaign calendar with KPI targets feeding telemetry.

### Deliverables Completed Today
1. **Product approval packet** (`docs/marketing/product_approval_packet_2025-10-07.md`) — refreshed with product decisions + EN/FR final copy strings.
2. **Launch comms packet update** (`docs/marketing/launch_comms_packet.md`) — applied approved banner/email/blog/tooltip variants with char checks.
3. **Tooltip copy handoff** (`docs/marketing/tooltip_copy_handoff_2025-10-07.md`) — EN/FR strings with ≤80 characters, updated inventory message + counts.
4. **Tooltip placement request** (`docs/marketing/tooltip_placement_request_2025-10-07.md`) — outlines design annotation needs and deadline.
5. **Translation review request** (`docs/marketing/translation_review_request_2025-10-07.md`) — scopes FR QA, flags "Centre OCC" abbreviation for review.
6. **Support training proposal** (`docs/marketing/support_training_session_proposal_2025-10-07.md`) — schedules session options and agenda for support.
7. **Campaign calendar + KPI targets** (`docs/marketing/campaign_calendar_2025-10.md`) — weekly plan tied to telemetry metrics.

## Blockers / Risks
- **Launch window confirmation:** Need product to lock tentative production date to sequence campaign calendar.
- **Tooltip placement annotations:** Designer to confirm overlay positions on wireframes before we brief engineering.
- **Translation QA:** FR strings updated with "Centre OCC" abbreviation; localization to confirm or provide alternative (P1).

## Evidence Links

### New Deliverables
- Product approval packet: `docs/marketing/product_approval_packet_2025-10-07.md`
- Launch comms packet update: `docs/marketing/launch_comms_packet.md`
- Tooltip copy handoff: `docs/marketing/tooltip_copy_handoff_2025-10-07.md`
- Tooltip placement request: `docs/marketing/tooltip_placement_request_2025-10-07.md`
- Translation review request: `docs/marketing/translation_review_request_2025-10-07.md`
- Support training proposal: `docs/marketing/support_training_session_proposal_2025-10-07.md`
- Campaign calendar: `docs/marketing/campaign_calendar_2025-10.md`

### Reference Materials
- Brand tone deck (tone enforcement): `docs/marketing/brand_tone_deck.md`
- Copy limits + layout guidance: `docs/design/copy_deck_modals.md`
- Direction canon: `docs/directions/marketing.md`, `docs/NORTH_STAR.md`

## Sprint Goals Status (2025-10-07)
| Goal | Status | Evidence |
|------|--------|----------|
| Secure product approval on launch comms packet, release notes template, brand tone deck | ⏳ Waiting on product sign-off | `docs/marketing/product_approval_packet_2025-10-07.md`
| Deliver final tooltip copy with character limits and placement notes | ✅ Complete (awaiting design placement review) | `docs/marketing/tooltip_copy_handoff_2025-10-07.md`
| Draft operator-facing FAQ for support training | ✅ Complete | `docs/marketing/launch_faq.md`

## Collaboration Notes
- **Product:** Approval packet delivered; need feedback on copy variations + evidence thresholds before EOD.
- **Design:** Tooltip copy ready; awaiting overlay annotations to sync with engineering.
- **Support:** FAQ ready for dry run; schedule training week of 2025-10-14 after product sign-off.
- **Manager:** Highlighted pending approvals and translation QA; request confirmation on launch timeline to lock comms schedule.

## Recommendations
1. Product: Confirm launch window + acknowledge final copy decisions (recorded in approval packet) to sync campaign scheduling.
2. Design: Deliver tooltip placement annotations by Oct 8 @ 12:00 ET so engineering can wire copy.
3. Localization: Complete FR review (banner/email/tooltip) by Oct 9 @ 18:00 ET, especially "Centre OCC" usage.

## Questions for Manager
- Can we lock a tentative production launch window to pencil in comms distribution dates?
- Should marketing own the support training session facilitation or co-lead with support lead?
- Any additional copy surfaces needing variations beyond those listed in the approval packet?

## Time Tracking (2025-10-07)
- Product approval packet updates + copy integration: ~2.0 hours
- Launch comms + tooltip revisions (EN/FR): ~2.0 hours
- Operator FAQ draft + evidence linking: ~2.5 hours
- Cross-team request docs (design, localization, support): ~1.5 hours
- Campaign calendar + KPI planning: ~1.0 hour
- Feedback log update + coordination follow-up: ~0.5 hours

**Total: ~9.5 hours** (distributed across sync + async blocks)

## Next Session Priorities (2025-10-08)
1. Incorporate product/design feedback once tooltip placements + localization notes return.
2. Sync campaign calendar dates with confirmed launch window + update assets timeline.
3. Prep telemetry dashboard references for KPI tracking (activation, CTR, CSAT).


---

# Marketing Daily Status — 2025-10-06

## Summary
Completed current sprint deliverables per docs/directions/marketing.md (updated 2025-10-06):
- ✅ Drafted launch communications packet (email, blog, in-admin messaging)
- ✅ Created release notes template with tile milestones
- ✅ Assembled brand tone/talking points deck
- ✅ Outlined social sentiment integration plan (vendor options, API contracts)

### Deliverables Completed Today

1. **Launch Communications Packet** (docs/marketing/launch_comms_packet.md)
   - Mock review comms (internal Slack/email templates)
   - Staging review comms (beta partner email + calendar invite)
   - Production launch comms (in-app banner, launch email, blog post)
   - In-admin tooltip copy for all 5 tiles
   - FAQ structure + screenshot requirements
   - Compliance checklist (legal, GDPR, partner portal)
   - Distribution channels + metrics tracking

2. **Release Notes Template** (docs/marketing/release_notes_template.md)
   - Per-tile milestone structure aligned with Mock → Staging → Production cadence
   - Version numbering scheme (v[MAJOR].[MILESTONE].[PATCH])
   - Evidence requirements (Vitest, Playwright, Lighthouse, screenshots)
   - Full example release (v1.M2.0) with all 5 tiles
   - Tile-specific snippets for incremental releases
   - Distribution plan (in-app changelog, email, blog, partner portal)

3. **Brand Tone & Talking Points Deck** (docs/marketing/brand_tone_deck.md)
   - Tone guidelines ("professional but approachable")
   - Voice attributes (trustworthy, operator-first, action-oriented, concise)
   - Talking points by audience (operators, CX leads, marketing owners, technical)
   - Message hierarchy + competitive differentiation
   - Localization guidance (EN/FR)
   - Support training script with Q&A
   - 50-word and 100-word boilerplate copy (EN/FR)

4. **Social Sentiment Integration Plan** (docs/marketing/social_sentiment_integration_plan.md)
   - 3 vendor options: X API, Meta Graph API, Hootsuite (Shopify App)
   - Complete API contracts (TypeScript interfaces)
   - Rate limits, pricing, vendor approval requirements
   - Recommended approach: Hootsuite POC → Hybrid (X + Meta) production
   - Data contract expectations (dashboard facts schema)
   - Phase 2 timeline: 9 weeks (M5-M9)

## Blockers / Risks

### Resolved
- ~~No brand style guide~~ → Created brand tone deck (docs/marketing/brand_tone_deck.md)
- ~~Social sentiment vendor not selected~~ → Documented 3 options with recommendation (Hootsuite POC)
- ~~Release notes structure unclear~~ → Created template with per-tile milestone approach

### Current Blockers
- **Product approval pending:** Release notes template + brand tone deck need product review for tone/messaging alignment
- **Designer coordination pending:** In-admin tooltip placement (copy ready, awaiting wireframe annotations)
- **Support training timing:** Brand tone deck ready for support team; awaiting training session schedule

### New Risks Identified
1. **Social sentiment vendor approval timeline:** X API Elevated Access (2-4 weeks) or Meta Business Verification (4-6 weeks) could delay Phase 2
   - Mitigation: Recommend Hootsuite (1-2 weeks) for faster POC
   - Owner: Product (vendor selection decision)

2. **French translation quality:** Brand tone deck translations are marketing-provided, not professional service
   - Mitigation: Flagged for translation service review (aligns with designer's recommendation)
   - Owner: Product + Translation Service

3. **Launch comms timing:** Production launch date not confirmed; comms packet ready but cannot schedule distribution
   - Mitigation: Comms templates ready for rapid deployment once launch date set
   - Owner: Product + Manager

## Evidence Links

### Marketing Deliverables (2025-10-06)
- Launch comms packet: docs/marketing/launch_comms_packet.md
- Release notes template: docs/marketing/release_notes_template.md
- Brand tone deck: docs/marketing/brand_tone_deck.md
- Social sentiment plan: docs/marketing/social_sentiment_integration_plan.md

### Reference Documents
- Direction: docs/directions/marketing.md
- Strategy: docs/strategy/initial_delivery_plan.md
- Product plan: docs/directions/product_operating_plan.md
- Copy deck: docs/design/copy_deck.md
- Copy deck modals: docs/design/copy_deck_modals.md
- North Star: docs/NORTH_STAR.md

## Sprint Goals Status (2025-10-06)

| Goal | Status | Evidence |
|------|--------|----------|
| Draft launch communications packet | ✅ Complete | docs/marketing/launch_comms_packet.md |
| Create release notes template | ✅ Complete | docs/marketing/release_notes_template.md |
| Assemble brand tone/talking points deck | ✅ Complete | docs/marketing/brand_tone_deck.md |
| Outline social sentiment integration plan | ✅ Complete | docs/marketing/social_sentiment_integration_plan.md |

**Sprint Completion: 100% (4/4 goals complete)**

## Collaboration Notes

### For Product
- **Review requested:**
  - Release notes template (per-tile milestone structure)
  - Brand tone deck (tone/messaging alignment with North Star)
  - Social sentiment vendor selection (Hootsuite vs. X API vs. Meta API)
- **Approval needed:**
  - Launch communications timeline (coordinate production launch date)
  - French translation service engagement (aligns with designer's P1 request)

### For Designer
- **Coordination needed:**
  - In-admin tooltip placement (copy ready in launch_comms_packet.md)
  - Localization glossary format (reference brand_tone_deck.md for terminology)
- **Alignment:**
  - Brand tone deck follows "professional but approachable" from copy deck
  - Character limits respected (tile headings 30 chars, buttons 25 chars, toasts 80 chars)

### For Support
- **Training materials ready:**
  - Brand tone deck includes support training script (docs/marketing/brand_tone_deck.md)
  - FAQ structure outlined in launch comms packet
  - Talking points for common questions (integrations, security, AI replies, customization, audit trail)
- **Next step:** Schedule training session (coordinate with support agent per docs/directions/support.md)

### For Manager
- **Deliverables complete:** All 4 sprint focus items from docs/directions/marketing.md (2025-10-06)
- **Dependencies identified:** Product approval (release notes + brand tone), designer coordination (tooltips), support training (schedule)
- **Phase 2 planning:** Social sentiment integration plan ready for roadmap discussion

## Recommendations

### Immediate Next Steps
1. **Product:** Review release notes template + brand tone deck by 2025-10-07
2. **Product:** Decide social sentiment vendor (Hootsuite recommended for POC)
3. **Designer:** Annotate tooltip placement in wireframes (copy ready)
4. **Support:** Schedule training session on brand tone + dashboard workflows
5. **Manager:** Set production launch date to enable comms distribution scheduling

### Launch Readiness
- **Comms package:** Ready (pending launch date)
- **Release notes:** Template complete (pending product approval)
- **Brand consistency:** Established (tone deck + boilerplate copy)
- **Support enablement:** Training materials ready (pending session)

### Phase 2 Preparation
- **Vendor selection:** Decision needed by M5 milestone
- **API contracts:** Documented for all 3 vendor options
- **Timeline:** 9 weeks post-vendor approval (M5-M9)

## Questions for Manager

1. **Production launch date:** When can we confirm launch date to schedule comms distribution?
2. **Translation service:** Should we engage by 2025-10-07 (aligns with designer's P1 request for French label review)?
3. **Social sentiment vendor:** Ready to make decision on Hootsuite (POC) vs. direct APIs (production)? Need approval to proceed with M5 planning.
4. **Support training:** Should marketing lead training session or coordinate with support agent?

## Time Tracking (2025-10-06)
- Launch comms packet: ~3 hours
- Release notes template: ~2.5 hours
- Brand tone deck: ~3 hours
- Social sentiment integration plan: ~4 hours
- Feedback update + evidence organization: ~0.5 hours

**Total: ~13 hours** (full day + evening session)

## Next Session Priorities (2025-10-07)
1. Respond to product feedback on release notes + brand tone deck
2. Coordinate with designer on tooltip placement
3. Create FAQ document (docs/marketing/launch_faq.md)
4. Begin weekly campaign calendar with KPI targets (pending product metrics confirmation)
5. Support Phase 2 vendor approval process (if Hootsuite selected)

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/marketing.md; acknowledge manager-only ownership and Supabase secret policy.
