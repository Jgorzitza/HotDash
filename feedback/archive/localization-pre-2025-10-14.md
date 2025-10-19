---
epoch: 2025.10.E1
doc: feedback/localization.md
owner: localization-agent
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---

## 2025-10-10 — Sanitized Branch Reset Complete

## 2025-10-10 — Shopify Embed Token Plan

## 2025-10-10 — Sanitized Branch Reset Prep

# Localization Feedback Log

## 2025-10-08

**Acknowledgement**: Saw direction refresh ping and attempted to open `docs/directions/localization.md` for the new sprint focus.

**Blockers**:

- `docs/directions/localization.md` is missing from the repository, so the updated localization direction is unavailable. Awaiting guidance or the correct path to proceed.

## 2025-10-09

**Acknowledgement**: Followed the sprint prompt to re-check localization direction (`docs/directions/localization.md`) and restart cycle checklist (`docs/runbooks/restart_cycle_checklist.md`). Authored the restored localization direction doc with updated English-only guardrails and partner touchpoints, and reviewed the newly added restart checklist for localization implications.

**Actions**:

- Ran the English-only copy audit across shipping UI surfaces (`app/routes/app._index.tsx`, `app/components/tiles/*`, `app/services/chatwoot/templates.ts`) and confirmed all customer-facing strings are English with only typographic punctuation using en dashes.
- Scanned runbooks and enablement collateral (`docs/runbooks/*.md`, `docs/directions/support.md`, `docs/directions/enablement.md`) for residual French strings; none detected.
- Noted that French variants persist only in translation reference packets (`docs/marketing/launch_comms_packet.md`, tooltip handoffs) per embedded guidance that they remain for localization QA.

**Status**: English-only copy audit complete for production surfaces; no non-English strings found in shipping assets. Restart cycle checklist reviewed—no additional localization checkpoints required beyond English-only guardrails.

## 2025-10-10

**Proof-of-audit**:

- Re-ran English-only scan across dashboard UI and Chatwoot templates with `rg --stats "[À-ÿ]" app/routes/app._index.tsx app/components/tiles app/services/chatwoot/templates.ts` (0 matches across 10 files).
- Verified runbooks (including `docs/runbooks/restart_cycle_checklist.md`) via `rg --stats "[À-ÿ]" docs/runbooks` (0 matches across 13 files).
- Spot-checked copy deck alignment with TileCard outputs to confirm en dash usage only where specified.

**Collateral alignment**:

- Updated enablement dry run packet (`docs/enablement/dry_run_training_materials.md`) to call out the Fly staging host `https://hotdash-staging.fly.dev/app?mock=1` so facilitators reference the correct environment.
- Refreshed support training script (`docs/marketing/support_training_script_2025-10-16.md`) to anchor staging walkthroughs and credential requests on the same Fly host.
- Replaced the staging link placeholder in the launch comms packet (`docs/marketing/launch_comms_packet.md`) with the Fly host so marketing collateral mirrors enablement guidance.

**Partner touchpoint tracker (English-only scope)**:
| Partner / Vendor | Owner | Status | Notes |
| --- | --- | --- | --- |
| Marketing (launch comms) | Marketing team | ✅ Acknowledged | 2025-10-13 spot check reconfirmed English-only scope in `docs/marketing/support_training_script_2025-10-16.md` and `docs/marketing/launch_comms_packet.md`; FR copy isolated to translation reference sections. |
| Enablement (dry run) | Justin (enablement) | ✅ Acknowledged | 2025-10-13 update added explicit language guardrail to `docs/enablement/dry_run_training_materials.md`; enablement confirms English-only rehearsal until direction changes. |
| Support (Chatwoot templates) | Morgan Patel | ✅ Acknowledged | Chatwoot macros + training cadence remain English-only; 2025-10-13 audit logged no FR templates outside parked request (`docs/marketing/chatwoot_template_localization_request_2025-10-08.md`). |
| Chatwoot (Fly migration) | Integrations team | ✅ Acknowledged | 2025-10-13 confirmation via customer.support@hotrodan.com ensured Fly migration broadcast stays English-only; integrations log updated in `feedback/integrations.md`. |
| LlamaIndex (AI prompts) | AI/ML team | ✅ Acknowledged | 2025-10-13 regression review in `feedback/ai.md` confirmed prompt outputs remain English-only; FR prompt packets remain paused per manager direction. |
| External translation vendor | N/A (scope closed) | ✅ Removed | Manager directive maintains FR scope pause; 2025-10-13 audit reconfirmed vendor engagement remains retired. |

**Status**: English-only guardrails verified across shipping surfaces with new audit evidence. Marketing and enablement collateral now cite the Fly staging host consistently. Localization workstream now formalizes English-only launch—translation vendor engagement retired.

**Blockers / Follow-ups**:

- Pending confirmation from marketing once translation vendor availability is re-established post-English-only window.

## 2025-10-11

**English-only audit refresh**:

- Executed `rg --stats "[À-ÿ]" app/routes/app._index.tsx app/components/tiles app/services/chatwoot` (12 files scanned, 0 matches).
- Executed `rg --stats "[À-ÿ]" docs/runbooks` (13 files scanned, 0 matches), confirming runbooks remain English-only after latest updates.

**Collateral spot-check**:

- Validated that enablement and marketing packets still reference the Fly staging host (`https://hotdash-staging.fly.dev/app`) via `rg -n "hotdash-staging" docs/enablement docs/marketing`.
- Confirmed no new bilingual copy surfaced outside sanctioned translation packets.

**Partner touchpoints**:

- Marketing, enablement, and support acknowledgements unchanged—no new translation workstreams opened.
- Manager confirmed FR scope closed; translation vendor removed from active tracking.

**Status**: Guardrails hold; no remediation required. Monitoring continues under permanent English-only directive.

## 2025-10-11 — Direction Update Follow-Through

**Acknowledgement**: Direction now requires post-publication spot checks on marketing/support collateral. Re-ran audits after latest packet refresh.

**Actions**:

- `rg --stats "[À-ÿ]" app/routes/app._index.tsx app/components/tiles app/services/chatwoot` (12 files, 0 matches).
- `rg --stats "[À-ÿ]" docs/runbooks docs/marketing/support_training_script_2025-10-16.md docs/enablement/dry_run_training_materials.md` (15 files, 0 matches).
- Confirmed marketing/support materials remain aligned with Fly staging host and English-only scope; no copy regressions detected.

**Status**: Post-publication spot check complete; no non-English strings introduced. Ready to rerun on demand if materials change.

## 2025-10-11 — Modal Copy Audit

**Acknowledgement**: New sprint bullet requests verification of modal copy once published in staging.

**Actions**:

- Reviewed `app/components/modals/SalesPulseModal.tsx` and `app/components/modals/CXEscalationModal.tsx`; all strings are English, align with copy deck tone (“professional, operator-first”).
- Confirmed CTAs (`Log follow-up`, `Escalate to ops`, `Approve & send`, `Mark resolved`) match English-only copy deck entries and avoid abbreviations.
- No non-English strings or tone regressions detected; placeholders (“Add context for the decision log”) remain clear and consistent.

**Status**: Modal copy audit complete; no remediation required. Monitoring staging builds for future updates.

## 2025-10-12

**Acknowledgement**: Direction reminder at `docs/directions/localization.md:29-33` to rerun post-refresh copy audits and document modal copy.

**Actions**:

- `rg --stats "[À-ÿ]" app/routes/app._index.tsx app/components/tiles app/services/chatwoot app/components/modals` (15 files scanned, 0 matches) confirmed staging UI surfaces—including new modals—remain English-only.
- `rg --stats "[À-ÿ]" docs/runbooks docs/marketing docs/enablement` (36 files scanned; matches isolated to QA-only FR reference packets in `docs/marketing/launch_comms_packet.md` and tooltip handoffs) verified shipping collateral stayed English-only.
- Re-reviewed `app/components/modals/SalesPulseModal.tsx` and `app/components/modals/CXEscalationModal.tsx`; copy unchanged, tone aligns with deck guardrails, and CTA labels remain English.
- Pulled staging loader data snapshot to capture decision-log IDs for modal audit evidence (`artifacts/playwright/modal-loader-data-2025-10-12.json`).
- Attempted Playwright screenshot capture against staging modals; blocked by Shopify App Bridge host requirement (403/401 redirect to `admin.shopify.com`). Logged blocker for reliability/deployment follow-up.
- Authored `docs/marketing/english_only_audit_checklist.md` so marketing/support can self-serve English-only spot checks before circulation.
- Synced with AI agent outputs via latest regression artifacts (`artifacts/ai/prompt-regression-2025-10-10-072145.json`); no non-English copy observed, guardrail posture unchanged.
- Pre-reviewed enablement annotation draft (`docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md`) to confirm language remains English-only and ready for screenshot swaps once design files land.
- Logged the embed-token dependency with reliability and deployment (`feedback/reliability.md`, `feedback/deployment.md`) per updated direction so escalation stays visible across teams.
- Marketing (`feedback/marketing.md`) and support (`feedback/support.md`) adopted the checklist today and will return audit evidence to this log after each run.

**Partner touchpoints**:

- Marketing, enablement, and support records refreshed with today's audit evidence; no stakeholders requested reopening FR scope.
- Translation vendor engagement stays retired; tracker updated to reflect the 2025-10-12 confirmation.

**Status**: English-only guardrails continue to hold across staging UI, runbooks, and collateral; modal text review logged with no remediation required.

**Blockers / Follow-ups**:

- Shopify embed hard requirement (host + authenticated shop) prevents automated modal screenshots; need reliability/deployment guidance on sanctioned capture method or mock host token.
- Awaiting staging access window from reliability to capture screenshots for the modal audit evidence bundle once host stability and embed requirements are addressed.

## 2025-10-13

**Proof-of-audit**:

- `rg --stats "[À-ÿ]" app/routes/app._index.tsx app/components/tiles app/services/chatwoot/templates.ts` (10 files scanned, 0 matches) reconfirmed UI + Chatwoot templates remain English-only under the new support inbox workflow.
- `rg --stats "[À-ÿ]" docs/runbooks docs/marketing/support_training_script_2025-10-16.md docs/enablement/dry_run_training_materials.md` (16 files scanned, 0 matches) verified runbooks and dry-run collateral—now referencing `customer.support@hotrodan.com`—remain English-only.
- Spot-verified support inbox updates: `rg -n "customer.support@hotrodan.com" docs/runbooks docs/marketing docs/enablement` confirms new alias applied consistently with English copy; no FR strings surfaced.
- Started tracking the new AI logging/index artifacts: `rg --stats "[À-ÿ]" packages/memory/indexes packages/memory/logs docs/strategy/ai_pilot_readiness_brief.md` surfaced only the existing en-dash punctuation mirrored from runbooks; all strings remain English. Will rerun after each logging/index update until screenshots unblock.

**Spot checks after marketing/support collateral updates**:

- `rg --stats "[À-ÿ]" docs/marketing docs/enablement docs/runbooks` surfaced matches only in sanctioned translation reference packets (`docs/marketing/launch_comms_packet.md`, `docs/marketing/tooltip_copy_handoff_2025-10-07.md`); shipping collateral stayed English-only and now references the Fly host + new support inbox.
- Updated `docs/enablement/dry_run_training_materials.md` with an explicit English-only guardrail and added the English-only spot check task to `docs/runbooks/shopify_dry_run_checklist.md` so facilitators bake audits into rehearsal prep. Confirmed the Fly host (`https://hotdash-staging.fly.dev/app`) remains the default across dry-run materials.
- `rg --stats "[À-ÿ]" docs/design docs/strategy` surfaced expected FR strings confined to translation reference tables in `docs/design/copy_deck.md`; no new non-English copy in shipping design/AI docs. Will keep running diffs on these folders alongside AI index logs while screenshots remain blocked.

**Partner tracker refresh**:

- Table above now includes reliability and deployment rows with 2025-10-13 follow-up notes; marketing, enablement, and support acknowledgements reconfirmed post-update.

**Coordination**:

- Logged Shopify embed token follow-ups with reliability (`feedback/reliability.md`) and deployment (`feedback/deployment.md`) requesting a sanctioned token path and English-only scope confirmation before handing credentials to localization.
- Standing by for their acknowledgements so Playwright modal screenshots can resume once token guidance lands.
- Prepped screenshot capture checklist referencing `docs/runbooks/shopify_embed_capture.md` — once token arrives, will inject `host` param into Playwright suite, capture CX Escalations + Sales Pulse modals, and archive evidence under `artifacts/ops/dry_run_2025-10-16/screenshots/live`. Noted dependency on reliability to deliver token + storage path.
- Created placeholder directory `artifacts/ops/dry_run_2025-10-16/screenshots/live/` so staging captures can be archived immediately after token delivery.
- Routed Chatwoot Fly migration confirmation through the new support inbox (`customer.support@hotrodan.com`) so integrations logged English-only scope compliance in `feedback/integrations.md`.
- Shopify Admin screenshots remain blocked pending embed token delivery; Playwright config updates staged and ready to run within 15 minutes of token drop. Evidence plan: capture CX Escalations/Sales Pulse modal states plus navigation breadcrumbs and store results in `artifacts/ops/dry_run_2025-10-16/screenshots/live/`.
- Re-read updated direction (`docs/directions/localization.md:1-35`) and logged baseline README scan (`rg --stats "[À-ÿ]" README.md`, 0 matches). Daily diff checks over README/runbook updates, design/strategy files, and AI logging/index artifacts continue while the embed-token gate holds.
- Pre-reviewed launch comms + support training materials (`docs/marketing/launch_comms_packet.md`, `docs/marketing/support_training_script_2025-10-16.md`) to confirm English-only scope on shipping copy; FR sections remain confined to translation reference tables. Flagged readiness to refresh these once embed token lands and QA clears mock=0.

**Status**: English-only guardrails validated across UI, runbooks, and refreshed collateral; outstanding work limited to securing the embed token path for modal evidence capture.

**Blockers / Follow-ups**:

- Await reliability/deployment acknowledgement and delivery plan for the Shopify embed token; resume screenshot automation immediately after path approval.
- Direction update logged: per `docs/directions/localization.md:29-33`, escalating with reliability/deployment for a sanctioned embed token or approved host remains top priority; progress stays tracked here until screenshots resume.
- Continue daily text diff scans on design/strategy + AI logging/index artifacts while the embed-token gate holds, capturing any non-English drift before screenshots resume.

## 2025-10-14 — Sprint Focus Follow-through

**Proof-of-audit**:

- `rg --stats "[À-ÿ]" app/routes/app._index.tsx app/components/tiles app/services/chatwoot/templates.ts` (10 files scanned, 0 matches) reconfirmed UI + Chatwoot templates remain English-only under the new support inbox workflow.
- `rg --stats "[À-ÿ]" docs/runbooks docs/marketing/support_training_script_2025-10-16.md docs/enablement/dry_run_training_materials.md` (17 files scanned, 0 matches) validated runbooks + rehearsal collateral after the latest support inbox updates.
- `rg -n "customer.support@hotrodan.com" docs/runbooks docs/marketing docs/enablement` verified the new inbox is referenced consistently across collateral with no bilingual regressions.

**Collateral diff watch**:

- `rg --stats "[À-ÿ]" README.md docs/design docs/strategy packages/memory/indexes packages/memory/logs` surfaced only the expected FR strings inside translation reference tables (`docs/design/copy_deck.md`); no shipping docs introduced non-English copy.
- Re-read `docs/runbooks/shopify_embed_capture.md` and `tests/fixtures/shopify-admin/index.ts` to confirm the embed token workflow is staged—Playwright fixture already injects the host param + bearer token once `PLAYWRIGHT_SHOPIFY_EMBED_TOKEN` is mirrored.
- Walked through the `/app/tools/session-token` rehearsal path documented in `docs/runbooks/shopify_embed_capture.md`; confirmed localization can launch the session-token helper, copy the token, and trigger Playwright captures inside the 60 s window as soon as the mirrored secret lands.

**Stack compliance audit**:

- `rg -n "Fly Postgres"` returned matches only in direction guardrails (`docs/directions/*.md`) and feedback escalations—no shipping docs or UI copy reference deprecated stacks.
- Confirmed `tests/fixtures/shopify-admin/constants.ts` defaults to the encoded Supabase-backed host parameter, keeping terminology aligned with `docs/directions/README.md#canonical-toolkit--secrets`.

**Status**: English-only guardrails hold across UI, runbooks, and collateral; Shopify embed screenshot workflow is ready to execute once deployment mirrors the token.

**Blockers / Follow-ups**:

- Still waiting on deployment acknowledgement that `SHOPIFY_EMBED_TOKEN_STAGING` is mirrored and cleared for localization capture. Resume Playwright screenshot automation immediately after confirmation.
- Continue daily diff scans on design/strategy + AI logging/index artifacts while the embed-token gate remains in place; next sweep scheduled for 2025-10-15 or sooner if collateral changes land.
