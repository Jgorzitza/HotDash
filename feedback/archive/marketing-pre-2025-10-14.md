epoch: 2025.10.E1
doc: feedback/marketing.md
owner: marketing
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-11
---

## 2025-10-12 — Launch Comms Refresh + Compliance Audit

### Summary
- Refreshed launch communications to spotlight the new support inbox (`customer.support@hotrodan.com`) and Chatwoot Fly deployment across banner and feedback touchpoints.
- Pre-staged external messaging (press + social) alongside the existing email templates so distribution can fire immediately once QA mock=0 and embed token gates clear.
- Logged a stack compliance audit and expanded release-day asset tracking to cover graphics/snippets tied to the canonical Supabase + Chatwoot Fly + React Router + OpenAI/LlamaIndex stack.

### Actions
- Updated in-app banner copy and removed placeholder CTA email in `docs/marketing/launch_comms_packet.md` to reflect the Chatwoot Fly inbox routing.
- Added embargoed press blurb and clipboard-ready social captions (LinkedIn/Twitter) to `docs/marketing/distribution_kit.md`, keeping hold notes tied to QA + embed token evidence.
- Extended `docs/marketing/release_asset_readiness.md` with launch-day hero/email asset placeholders and recorded the stack compliance audit outcomes.
- Reviewed `docs/marketing/support_training_script_2025-10-16.md` and `docs/enablement/dry_run_training_materials.md` to confirm LlamaIndex + Chatwoot Fly messaging remains aligned—no edits required.

### Stakeholder Acknowledgements
- Pending — acknowledgement tracker staged in `docs/marketing/distribution_kit.md`; will trigger once QA mock=0 200 evidence and Chatwoot Fly embed token arrive.

### Blockers / Next Steps
- Waiting on reliability for sustained mock=0 200 + embed token evidence before sending comms/collecting acknowledgements.
- Design still owes final launch hero + ESP header exports; placeholder noted in `docs/marketing/release_asset_readiness.md`.
- Next action: drop evidence links + timestamps into distribution kit templates immediately after gates clear and circulate for stakeholder ✅s.

## 2025-10-10 — Sanitized Branch Reset Complete

## 2025-10-10 — Sanitized Branch Reset Prep

## 2025-10-10 — Security Incident Launch Hold Update

### Summary
- Captured the git scrub completion (`af1d9f1`) and pending Supabase credential rotation across the launch comms packet and campaign calendar; external messaging remains paused until product confirms new secrets + QA evidence.
- Prepared post-clearance copy blocks so distribution can resume immediately once the security gate lifts.

### Actions
- Added a security incident response row plus hold notice and post-clearance copy blocks to `docs/marketing/launch_comms_packet.md`.
- Updated `docs/marketing/campaign_calendar_2025-10.md` with a security status section and “Hold” notes on all external touchpoints; internal Slack briefing now instructs teams to cite the rotation status.

### Stakeholder Acknowledgements

### Blockers / Next Steps
- (Resolved 2025-10-10 16:00Z) Awaiting reliability credential rotation + QA artifacts; clearance received and external messaging resumed.
- (Resolved 2025-10-10 16:00Z) Update campaign calendar “Hold” notes to active send times once clearance lands — completed via clearance broadcast entry below.

## 2025-10-10 — Security Clearance Broadcast

### Summary
- Product + reliability validated existing Supabase credentials at 2025-10-10 16:00 UTC, so no rotation required; marketing lifted the launch comms hold and resumed campaign sequencing.
- Updated launch comms packet, campaign calendar, and clearance copy to reflect the resolved incident and distributed go-live messaging.

### Actions
- Marked the security incident tracker in `docs/marketing/launch_comms_packet.md` as cleared with timestamped evidence and published the clearance communications (Slack, email opener, social, enablement).
- Refreshed `docs/marketing/campaign_calendar_2025-10.md` to remove holds, reactivate touchpoints, and cite the clearance timestamp in planning notes.

### Stakeholder Acknowledgements

### Next Steps
- Keep staging smoke (`?mock=0`) watch active; swap in QA evidence once HTTP 200 lands.
- Attach clearance note to ESP/social approvals and archive evidence links with campaign artifacts.

## 2025-10-10 — Launch Messaging Refresh + QA Evidence Hold

### Summary
- Updated all launch surfaces with Operator Inbox positioning and OpenAI (via LlamaIndex) messaging per direction (§20-29) while reinstating the external send hold until QA publishes sustained mock=0 evidence.
- Campaign calendar now flags every external milestone as on hold; internal audiences have updated guidance on the new inbox and AI stack.

### Actions
- Revised `docs/marketing/launch_comms_packet.md` banner, email, blog, and supporting notes with Operator Inbox + LlamaIndex/OpenAI messaging and added the QA hold gate.
- Reverted `docs/marketing/campaign_calendar_2025-10.md` to planning status, marking beta outreach, ESP, social, and Partner Portal submissions as blocked pending QA evidence.
- Drafted updated talking points for support/enablement to highlight the new inbox and AI stack while reinforcing the QA hold during prep sessions.

### Stakeholder Alignment

### Next Steps
- Await QA evidence to lift the hold and move assets into staging/ESP queues.
- Once reliability posts the green run, update campaign notes and trigger stakeholder notifications captured here.

## 2025-10-10 — Support Inbox + Chatwoot Fly Integration Updates

### Summary
- Refreshed launch comms with the new support inbox (`customer.support@hotrodan.com`) and highlighted the Chatwoot Fly migration across banner/email/blog copy. External releases remain on hold until QA mock=0 200 evidence and the embed token arrive.
- Coordinated with enablement/support on dry-run materials so facilitators reinforce the new contact channel and Fly checklist.

### Actions
- Added support inbox + Chatwoot Fly latency callouts to launch email, blog, and clearance comms in `docs/marketing/launch_comms_packet.md`; updated go-live checklist to require the embed token before lifting the hold.
- Updated `docs/marketing/campaign_calendar_2025-10.md` to note QA + embed-token gates across every external milestone and refreshed social/blog notes with Chatwoot Fly messaging.

### Stakeholder Acknowledgements

### Next Steps
- Track reliability updates for mock=0 200 + embed token delivery; unblock releases immediately once both land.
- Provide enablement with final copy blocks and evidence links ahead of the 2025-10-16 dry run.

## 2025-10-10 — Hold Variant & Testimonial Prep

### Summary
- Built alternate launch variants (email, social, blog hero, banner) and staged testimonial placeholders while external sends remain paused.
- Ensured campaign calendar and launch packet reference the prep work so we can slot approved quotes the moment product signs off post-clearance.
- Documented release asset readiness checklist for quick go-live once QA/embed token gates clear.
- Authored full distribution kit (internal/external email drafts + acknowledgement tracker) so teams can execute immediately after green lights.

### Actions
- Added hold-ready variant copy blocks (email, social, blog hero) and testimonial placeholders to `docs/marketing/launch_comms_packet.md` supporting materials.
- Updated `docs/marketing/campaign_calendar_2025-10.md` next steps to track testimonial outreach/variant readiness.
- Coordinated with product to identify testimonial targets (Evergreen CX lead, beta partners) once QA evidence + embed token unlock distribution; placeholders cite scripts in `docs/marketing/privacy_toggle_rollout.md`.
- Authored release asset readiness tracker (`docs/marketing/release_asset_readiness.md`) summarizing primary/variant copy, testimonial slots, and gating evidence.
- Created distribution kit (`docs/marketing/distribution_kit.md`) covering internal clearance email, external merchant template, support enablement announcement, acknowledgement tracker, and send checklist.

### Stakeholder Alignment

### Next Steps
- Capture testimonial drafts during dry run debrief; store in `docs/marketing/testimonial_placeholders.md`.
- Swap alternate variants into ESP/social tooling once launch window + gates clear.
- Update readiness tracker with approvals and evidence links immediately after gates clear.
- Use distribution kit to drive acknowledgement logging once QA/embed token evidence lands; archive responses in tracker + feedback docs.

# Marketing Daily Status — 2025-10-12 (Checklist Distribution)

## Summary
- Received localization’s English-only audit checklist (`docs/marketing/english_only_audit_checklist.md`) and adopted it as the pre-publish gate for all marketing collateral updates.
- Logged acknowledgment in backlog item `docs/marketing/shopify_launch_comms_backlog.md` so future tasks reference the checklist before circulation.
- Notified enablement/support counterparts that marketing will run the checklist prior to sharing updated scripts or packets.

## Actions
- Added checklist reference to `docs/marketing/launch_comms_packet.md` approval tracker with a reminder that audit evidence lives in `feedback/localization.md`.
- Posted internal note to campaign calendar draft highlighting the checklist requirement at each copy freeze checkpoint.
- Coordinated with support to mirror the checklist in their dry run prep flow (see `feedback/support.md`).

## Staging Access Rollout Prep — 2025-10-10 08:05 UTC
- Extended the launch communications approval tracker with a staging access rollout comms row and linked the enablement announcement/acknowledgement templates so the send is turnkey once QA reports green (`docs/marketing/launch_comms_packet.md`).
- Synced with support/enablement to ensure facilitator prep scripts reference the mock-mode fallback while staging is degraded; support training script now calls out the 410 condition.
- Outstanding: ingest refreshed Supabase NDJSON export, attach sustained mock=0 evidence, and swap in final tooltip overlays once design delivers exports.

## Blockers / Follow-ups
- Still waiting on design modal overlays and reliability telemetry; checklist will remain in use once those assets arrive.
- Need embed token resolution from reliability/deployment before localization can supply modal screenshots; marketing will attach evidence once provided.

# Marketing Daily Status — 2025-10-10 (Evening Update)

## Summary
- Waiting on product’s go/no-go; comms packet + launch timeline already reference Supabase/Fly evidence so announcements can schedule immediately once the window lands.
- Drafted the Phase-2 GA MCP messaging outline (`docs/marketing/phase2_ga_mcp_messaging.md`) so fallback work progresses while launch remains blocked.
- Pinged design in `#occ-design` at 2025-10-10 18:42 UTC for the modal overlay visuals and tooltip annotations required for engineering handoff.
- Nudged reliability in `#occ-reliability` at 2025-10-10 19:05 UTC for the refreshed Supabase NDJSON export and confirmation the staging synthetic stays sub-300 ms.
- Updated the launch comms approval tracker with placeholders for tooltip overlays, `?mock=0` smoke, and the refreshed NDJSON so we can flip to distribution as soon as QA posts evidence.
- Logged the latest `?mock=0` probe (2025-10-10 07:57 UTC, still 410) so the go-live checklist can swap in the green artefacts the moment reliability delivers them.

## Evidence Updates
- New Phase-2 GA MCP messaging draft captures positioning, evidence gates, and required asset updates (`docs/marketing/phase2_ga_mcp_messaging.md`).
- Backlog item #2 now notes the latest designer follow-up and timestamp (`docs/marketing/shopify_launch_comms_backlog.md`).
- Launch comms packet now tracks the internal staging readiness broadcast with evidence placeholders so we can trigger operator comms as soon as DEPLOY-147 drops (`docs/marketing/launch_comms_packet.md` §Approval & Evidence Tracker).
- Added go-live trigger checklist to `docs/marketing/launch_comms_packet.md` with live Supabase NDJSON + latest curl log references so marketing/support know exactly which artefacts to swap once QA signs off.
- Support training script now points facilitators at the same staging evidence table to keep packet handoffs in sync (`docs/marketing/support_training_script_2025-10-16.md`).

## Blockers
- Product launch window/go-no-go decision (Backlog #1) — still escalated, prevents campaign calendar + ESP staging.
- Tooltip overlays + modal visuals (Backlog #2) — designer reply pending; engineering handoff on hold.
- Reliability telemetry bundle — Supabase NDJSON export + stable staging synthetic run needed before packaging audit evidence (Backlog #6).

## Next Actions
1. Pre-populate `docs/marketing/campaign_calendar_2025-10.md` with tentative send windows so we can lock dates the moment product responds.
2. Flesh Phase-2 GA MCP copy across the comms packet/FAQ once parity checklist items clear.
3. Follow up with design for modal overlays; update tooltip handoff docs immediately upon receipt.
4. Coordinate with reliability on NDJSON + synthetic rerun timing so evidence bundle can close.

# Marketing Daily Status — 2025-10-10 (Midday Update)

## Summary
- Launch window still unconfirmed; escalated to manager at 2025-10-10 14:05 UTC referencing backlog item #1 (`docs/marketing/shopify_launch_comms_backlog.md`).
- Documented readiness evidence (Supabase parity, Fly staging smoke, Shopify staging validation) across launch timeline + comms packet so marketing messaging tracks QA readiness.
- Embedded Shopify rate-limit coaching snippet across training script/proposal/FAQ; ready to capture enablement/support approvals once invites send.

## Evidence Updates
- Added telemetry readiness row + staging link updates to `docs/marketing/launch_comms_packet.md`, citing the same artifacts for operator-facing comms.
- Updated training materials with Shopify rate-limit snippet: `docs/marketing/support_training_script_2025-10-16.md`, `docs/marketing/support_training_session_proposal_2025-10-07.md`, and `docs/marketing/launch_faq.md` now reference `docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md`.
- Synced backlog status to reflect new evidence + snippet progress (`docs/marketing/shopify_launch_comms_backlog.md`).

## Launch Window Follow-up
- Pinged product in #occ-product at 2025-10-10 13:45 UTC for launch window decision; no update by the 10:00 ET deadline.
- Escalated to manager at 2025-10-10 14:05 UTC with summary of outstanding blockers (launch window, tooltip overlays); awaiting acknowledgement.

## Next Actions (PM)
1. Capture enablement/support approvals for the Shopify rate-limit coaching snippet once training invites distribute; log timestamps + approvers here.
2. Update `docs/marketing/campaign_calendar_2025-10.md` immediately after product supplies launch window.
3. Attach Supabase NDJSON export + telemetry rerun evidence to playbook/comms packet once reliability shares next drop.

# Marketing Daily Status — 2025-10-10 (AM Update)

## Summary
- Re-read `docs/directions/marketing.md` (refresh dated 2025-10-10) to capture the sprint focus: secure 10:00 ET launch window, apply telemetry evidence updates, and embed Shopify rate-limit coaching in training comms.
- Confirmed restart cycle runbook is restored at `docs/runbooks/restart_cycle_checklist.md`; backlog + feedback entries now reference the canonical path.
- Published `docs/marketing/shopify_launch_comms_backlog.md` centralizing launch comms items with owners, next actions, evidence, and blockers.
- Folded Supabase telemetry analyzer output (`artifacts/monitoring/supabase-sync-summary-latest.json`) and staging secret sync evidence (vault `occ/supabase`, `occ/shopify`) into the comms packet and timeline playbook.

## Production Blocker Focus
- **Launch window (Product):** Still waiting on reply to 2025-10-09 20:25 ET follow-up; backlog item #1 tracks timer to escalate at 2025-10-10 14:00 UTC (10:00 ET).
- **Tooltip placement overlays (Design):** Assets overdue despite 2025-10-10 AM ET commitment; backlog item #2 will notify engineering within 2h once delivered.
- **Telemetry evidence (Reliability/Data):** Supabase analyzer snapshot captured (see `artifacts/monitoring/supabase-sync-summary-latest.json`), staging secrets vaulted, but full NDJSON export + parity rerun still pending; backlog item #6 tracks remaining gap before citing KPIs in comms.

## Requests / Questions for Manager
- Ready to escalate product + design blockers at 10:00 ET if silence continues; confirm preferred escalation path.
- Guidance requested on pre-staging ESP QA ahead of launch window confirmation or holding until window set.

## Next Session Priorities (2025-10-10 PM)
1. Update backlog entries immediately with any product/design responses.
2. Apply telemetry timestamps to launch comms packet and timeline playbook once reliability/deployment drop evidence.
3. Incorporate Shopify rate-limit coaching snippet + dry-run invite details into enablement handoff when credentials land.

## Escalation Actions — 2025-10-10 14:00 UTC
- Triggered manager escalation for missing product launch window decision and overdue design tooltip overlays; referenced `docs/marketing/shopify_launch_comms_backlog.md` items #1 and #2.
- Awaiting manager response before staging ESP QA or delivering tooltip guidance to engineering.

# Marketing Daily Status — 2025-10-10

## Summary
- Followed up with product (20:25 ET) using the launch timeline playbook to underscore scheduling impact; awaiting go-live window by 2025-10-10 10:00 ET to unlock campaign calendar + ESP holds.
- Confirmed with design (20:27 ET) that tooltip placement annotations will post first thing tomorrow; prepped documentation hooks to update the handoff within two hours of receipt.
- Aligned launch timeline playbook with refreshed dependency status and paused localization workstream per manager directive (`docs/marketing/launch_timeline_playbook.md`).
- Coordinated with deployment/reliability notes so Supabase credentials + staging Postgres handoff stay tracked in marketing KPI plans.

## Production Blocker Focus
- **Supabase telemetry fix:** Monitoring reliability handoff for `SUPABASE_URL`/`SERVICE_KEY`; timeline playbook KPI table flags dependency. Ready to update comms once parity script/evidence re-run is confirmed.
- **Staging Postgres + secrets:** Runbook references are in place; coordinating with deployment once `DATABASE_URL` surfaces so operator FAQ/training script can call out staging login details.
- **GA MCP readiness:** Waiting on OCC-INF-221 outcome; will update comms packet metadata + campaign calendar once integrations supplies host/credential timing.
- **Operator dry run:** Training script + FAQ alignment set; pending staging access and tooltip annotations to finalize walkthrough deck.

## Blockers / Risks
- **Launch window confirmation (Product):** No response yet to 20:25 ET follow-up; escalation path planned if no update by 10:00 ET.
- **Tooltip placement annotations (Design):** Delivery promised for 2025-10-10 AM; comms updates queued immediately after arrival.
- **Supabase telemetry credentials (Reliability):** Still outstanding; prevents KPI validation and launch-day reporting readiness.

## Shopify Install Push — 2025-10-10 10:23 UTC
- Track product’s confirmation that Shopify staging secrets + install window are live; update launch timeline playbook with exact timestamps and evidence links once deployment logs the staging smoke run.
- Refresh the comms packet with Supabase telemetry/Lighthouse artefacts coming from QA/deployment so stakeholders see validation proof alongside messaging.
- Coordinate with enablement/support to embed the rate-limit coaching snippet in operator comms and log approvals here.

## Requests / Questions for Manager
- If product remains silent past 10:00 ET, please escalate so we can lock the launch calendar.
- Confirm ownership for sending support training invites once staging access is live (marketing ready to draft copy).

## Next Session Priorities (2025-10-10 PM)
1. Update launch comms packet + evidence bundle once product/design feedback lands.
2. Translate launch timeline playbook to calendar dates immediately after production window arrives.
3. Prep operator dry run invite draft and deck once tooltip annotations + staging credentials land.

# Marketing Daily Status — 2025-10-09

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Revisited sprint focus (launch comms packet, operator FAQ/training script, launch timeline playbook) per `docs/directions/marketing.md`.
- Blocked: currently executing integrations work; require marketing owner to continue delivering artifacts and managing approvals.

## 2025-10-08 — Sprint Focus Activation
- Revalidated launch comms packet requirements with product to ensure evidence bundle lines up with `docs/directions/marketing.md:26`; pending launch window to finalize distribution dates.
- Partnered with enablement/support on FAQ + training script alignment, capturing edits needed before the 2025-10-16 dry run per `docs/directions/marketing.md:27`.
- Started translating launch timeline playbook milestones into calendar holds contingent on product’s go-live window as called out in `docs/directions/marketing.md:28`.

## 2025-10-09 Sprint Execution
- Reviewed launch comms packet approvals and drafted outreach plan to secure product sign-off; pending final go-live window from product before sending.
- Coordinated with enablement/support on the operator FAQ/training script alignment; awaiting their feedback to incorporate into the dry run materials.
- Began converting launch timeline playbook milestones into date-specific schedule, but blocked until product provides production deployment window.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: holding launch comms updates until reliability confirms mitigation so we can reference stable monitoring in operator messaging.
- Staging Postgres + secrets: tracking deployment’s secret provisioning so staging comms can include accurate readiness notes for the dry run.
- GA MCP readiness: will update campaign timelines once integrations secures credentials; currently messaging that analytics tile remains mock.
- Operator dry run: training script + FAQ ready to send as soon as product/enablement confirm staging access and invite list.

## 2025-10-09 Production Blocker Push
- Supabase fix: holding comms updates that reference decision sync reliability until data/reliability confirm mitigation; flagged need to update FAQ once metrics stabilize.
- Staging Postgres + secrets: synced with deployment on evidence expectations so launch comms can reference staging validation when secrets land.
- GA MCP readiness: prepared comms snippet for credential go-live announcement; will finalize copy once integrations provides OCC-INF-221 outcome.
- Operator dry run: keeping invite language + training script ready to send as soon as product/enablement confirm staging access and attendee list.
- Updated staging preview checklist to pull in designer tooltip annotations once delivered (`docs/marketing/launch_timeline_playbook.md`), keeping playbook aligned with new design assets.

## Summary
- Added approval tracker + character-count validations to the launch comms packet (`docs/marketing/launch_comms_packet.md`) so product can sign off on English copy without hunting references.
- Authored full support training script for the 2025-10-16 dry run (`docs/marketing/support_training_script_2025-10-16.md`) and synced talking points with the FAQ.
- Published the launch timeline playbook (`docs/marketing/launch_timeline_playbook.md`) covering phase checklists, KPIs, and dependency matrix for once the launch date lands.

## Deliverables Completed Today
1. Launch comms packet approval tracker + copy guardrails (EN-first) — `docs/marketing/launch_comms_packet.md`
2. Support training script for dry run — `docs/marketing/support_training_script_2025-10-16.md`
3. Launch timeline playbook with KPI tracking — `docs/marketing/launch_timeline_playbook.md`

## Blockers / Risks
- **Launch window confirmation (Product):** Still waiting on production date to pin campaign calendar and move timeline playbook from relative T- dates to actuals.
- **Tooltip placement annotations (Design):** Due 2025-10-08 @ 12:00 ET; follow-up if not delivered so engineering wiring stays on track.
- **Localization scope:** Paused per manager direction; resume only if product reopens multi-language launch requirement.

## Requests / Questions for Manager
- Please nudge product for the go-live window so we can translate the playbook into calendar dates and lock ESP scheduling.
- Confirm whether marketing should circulate the support training invites or coordinate through enablement once scheduling is final.

## Next Session Priorities (2025-10-10)
1. Incorporate product/design/localization feedback into comms + tooltip assets the moment it lands.
2. Prep evidence bundle (screenshots, ESP checks) so approvals can attach quickly once launch date is final.
3. Draft launch-day metrics dashboard outline with data team pending Supabase credential delivery.

# Marketing Daily Status — 2025-10-08

## Direction Acknowledgment
- Reviewed `docs/directions/marketing.md` (2025-10-08 sprint refresh) and confirm focus on launch comms packet, operator FAQ + training script, and launch timeline playbook.

## Summary
- Prepped evidence bundle for the launch communications packet so we can attach proof once product signs off on the English-only strings.
- Coordinated with enablement to align the operator FAQ/training script updates with the 2025-10-16 dry run agenda; awaiting their final notes.
- Sketched launch timeline playbook structure (milestones, campaign triggers, KPI checkpoints) pending production window confirmation.

### Deliverables In Flight
1. Launch communications packet proof bundle (ties to `docs/marketing/launch_comms_packet.md` and approval packet).
2. Operator FAQ + training script alignment with enablement feedback.
3. Launch timeline playbook draft synced to campaign calendar + deployment milestones.

## Blockers / Risks
- **Launch window confirmation:** Product still needs to lock the production go-live window; blocks finalizing campaign calendar, comms timing, and the new playbook milestones.
- **Tooltip placement annotations:** Awaiting designer overlays (due 2025-10-08 @ 12:00 ET) to complete engineering handoff in `docs/marketing/tooltip_placement_request_2025-10-07.md`.
- **Localization QA:** FR review for "Centre OCC" abbreviation pending localization sign-off (due 2025-10-09 @ 18:00 ET).

## Requests / Questions for Manager
- Please confirm when product expects to lock the production launch window so marketing can finalize the timeline playbook and campaign calendar.
- Should marketing coordinate directly with enablement on the 2025-10-16 training dry run logistics or loop you in on scheduling?

## Next Session Priorities (2025-10-09)
1. Integrate product/design/localization feedback into launch comms + tooltip documentation once received.
2. Finalize the operator FAQ/training script package and attach evidence to this log.
3. Flesh out the launch timeline playbook with campaign triggers and KPI checkpoints as soon as the launch window is confirmed.

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
