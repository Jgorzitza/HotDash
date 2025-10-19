# Content Pipeline — Approvals Launch Notes (2025-10-18)

**Owner:** Content Agent  
**Issue:** #105  
**Status:** Ready for CEO approval pending analytics + CI gates

---

## 1. Objective

Finalize the launch-day messaging for the Approvals Drawer, document the rollback playbook, and ensure every channel references verifiable evidence. These notes align with the refreshed fixtures:

- `app/fixtures/content/calendar.json`
- `app/fixtures/content/drafts.publer.json`
- `app/fixtures/content/idea-pool.json`

Evidence hashes live in `artifacts/content/2025-10-18/` and `artifacts/analytics/2025-10-18/` per the stabilized GA4 exports.

---

## 2. Launch Notes by Channel

| Channel / Date                                                      | Status  | Key Message                                                                              | Evidence                                                                                                                                                                                                                                                                 | Owner                     |
| ------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| **LinkedIn — 2025-10-21** (`launch-linkedin-2025-10-21`)            | Ready   | “Approvals Drawer is live—automations stop for evidence, rollback, and a human grade.”   | `artifacts/analytics/2025-10-18/mock-ga4-metrics.json` (`e39e3d25544347dcdd7abe81e2eb2c2b72211af4da0a27a9574eab948c9beea5`), `artifacts/analytics/2025-10-18/ga4-live-metrics.json` (`b0c9d522598ea230acce4e2df5ae6614c41d2132fb31d47e7747cdcc317f9dae`), HITL checklist | Content (awaiting CEO ✅) |
| **Email — 2025-10-21** (`launch-email-2025-10-21`)                  | Ready   | “Approvals Drawer launches 21 Oct @ 10:00 ET; stay HITL-first and keep pending <15 min.” | Same analytics artifacts + `docs/specs/dashboard_launch_checklist.md`                                                                                                                                                                                                    | Product (needs CI green)  |
| **Slack thread — 2025-10-23** (`sampling-guard-thread-2025-10-23`)  | Pending | “Sampling guard protects engagement; wildcard stays blocked until live export.”          | GA4 snapshot + future engagement export (blocked)                                                                                                                                                                                                                        | Analytics                 |
| **Testimonials — 2025-10-29** (`testimonials-follow-up-2025-10-29`) | Blocked | “Activation ≥70% unlocks testimonial story and webinar invite.”                          | GA4 snapshot + upcoming testimonial artifacts                                                                                                                                                                                                                            | Content + CEO             |

### 2.1 LinkedIn Launch Copy (final)

```
Approvals Drawer is live—every automation waits for a human before it ships.

• Every dashboard suggestion now routes through the Approvals Drawer with evidence, rollback notes, and reviewer grades before apply.
• Stabilized GA4 metrics (30d): Sessions 85,612 (+6.4%), conversion rate 2.51%, revenue $128,450.32 (+8.6%).
• Review the HITL checklist so your approvals stay audit-ready.

Read the rollout checklist → https://hotdash.internal/docs/dashboard-launch
#Shopify #HITL #HotDash
```

### 2.2 Launch Email Copy (final)

**Subject:** Approvals Drawer launches 21 Oct — what to expect  
**Preview:** HITL first, metrics-backed confidence, instant rollback.

```
Hi team — the Approvals Drawer is landing on 21 Oct at 10:00 ET.

Why it matters: no automation ships without evidence, rollback, and a human grade. You will see the new drawer from any dashboard tile, and every decision logs in Supabase.

Confidence: Sessions 85,612 (+6.4%), conversion 2.51%, revenue $128,450.32 (+8.6%) from the stabilized GA4 export.

Next steps: follow the HITL checklist, keep pending approvals under 15 minutes, and note any edits in the feedback field for learning.

Review the HITL checklist → https://hotdash.internal/runbooks/hitl
```

### 2.3 Pending Channels

- **Sampling guard thread:** Publish once analytics delivers live engagement export. Include the wildcard Publer screenshot and checksum reference. Dependency tracked in fixtures (`status: "blocked"`).
- **Testimonials follow-up:** Hold until activation ≥0.70 and testimonials clear CEO sign-off. Update calendar + drafts once numbers land.

---

## 3. Rollback Messaging

If any launch gate fails (CI, analytics export, CEO approval), execute the global rollback steps embedded in `app/fixtures/content/calendar.json` and communicate:

- **LinkedIn/Twitter:** “Pausing the Approvals Drawer launch while we investigate a validation issue. Operators should continue the existing manual workflow; we will share an updated go-live once the fix is verified.”
- **Email:** “We are delaying the Approvals Drawer launch until CI and analytics checks finish. All automations stay in draft-only mode—no action needed while we stabilize.”
- **Slack:** “Holding the sampling guard explainer until analytics provides a clean engagement dataset. Approvals remain evidence-first; expect the new date after analytics signs off.”

Log the decision in `feedback/content/2025-10-18.md`, update `artifacts/content/2025-10-18/calendar_metrics.md`, and notify #launch-coordination per Section 5 of the dashboard launch checklist.

---

## 4. Dependencies & Approvals

| Dependency                                   | Status  | Owner       | Notes                                                       | ETA               |
| -------------------------------------------- | ------- | ----------- | ----------------------------------------------------------- | ----------------- |
| CEO approval on launch copy                  | Pending | CEO         | Required before scheduling Publer draft `draft-launch-001`. | 2025-10-19 17:00Z |
| CI green (`npm run lint`, `npm run test:ci`) | Pending | Engineering | Blocker tracked in Launch Checklist Gate table.             | 2025-10-19 23:00Z |
| Live engagement export                       | Blocked | Analytics   | Needed to unblock wildcard calendar entry + draft.          | TBA               |
| Activation ≥0.70                             | Blocked | Analytics   | Required before testimonials post.                          | TBA               |
| Testimonials quote approval                  | Pending | CEO         | Two quotes awaiting final approval.                         | 2025-10-27 18:00Z |

---

## 5. Evidence Trail

- `artifacts/content/2025-10-18/calendar_metrics.md`
- `artifacts/content/2025-10-18/publer_metrics.md`
- `artifacts/content/2025-10-18/manager_brief.md`
- `artifacts/analytics/2025-10-18/mock-ga4-metrics.json`
- `artifacts/analytics/2025-10-18/ga4-live-metrics.json`

All evidence paths and checksums are mirrored inside the fixtures to keep the HITL trail intact.

---

## 6. Next Actions

1. Await analytics live engagement export; update wildcard draft + calendar entry when delivered.
2. Collect CEO approval and mark dependencies complete in the fixtures.
3. Rerun `npm run fmt`, `npm run lint`, `npm run test:ci`, and `npm run scan` once numbers land to maintain launch readiness logs.

---

## 7. Verification Steps (HITL, Autopublish OFF)

- Approvals HITL: ON. Autopublish: OFF. No customer-facing publishing in this lane.
- Fixture integrity:
  - `jq '. | length >= 3' app/fixtures/content/idea-pool.json` → expect `true`.
  - `jq -e '.entries | length >= 3' app/fixtures/content/calendar.json` (if key present).
  - `jq -e '.drafts | length >= 1' app/fixtures/content/drafts.publer.json` (if key present).
- Sanity checks (shell):
  - `rg -n "Autopublish" docs/**/*.md | wc -l` → references exist; ensure OFF in copy.
  - `rg -n "HITL" docs/**/*.md | wc -l` → references exist; ensure ON in copy.
- Evidence trail:
  - Ensure artifacts referenced in fixtures exist and have matching checksums.
  - Link evidence in `feedback/content/YYYY-MM-DD.md`.
- UI spot-check (non-publishing):
  - Load Approvals Drawer in dev; verify microcopy variants match `docs/design/approvals_microcopy.md`.

---

## 8. Rollback Commands (No-op friendly)

- Revert fixture changes:
  - `git checkout -- app/fixtures/content/*`
- Disable related content flags if present in local config:
  - Ensure any feature flags remain OFF for publish/scheduling.
- Document rollback in feedback with evidence paths.
- If scheduled drafts exist in external tools (dev only), mark UNSCHEDULED and attach receipts.

---

## 9. Messaging Alignment Notes (A/B Harness Awareness)

- If A/B harness language appears in content, keep copy neutral and HITL-first; avoid implying activation without analytics owner sign-off.
- Do not introduce new experiment variant names in content without coordinating with SEO/Analytics lanes.

---

## 10. Execution Proof (Foreground)

- 2025-10-19T02:38:00Z — Updated `app/fixtures/content/idea-pool.json` with `proof` field.
