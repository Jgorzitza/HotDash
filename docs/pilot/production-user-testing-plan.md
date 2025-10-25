# Production User Testing Plan — HotDash Control Center

## 1. Overview & Objectives
- Validate that first-time operators can navigate the embedded Shopify app without direction.
- Confirm daily workflow efficiency across dashboard tiles, agent handoffs, and approvals.
- Assess resilience on mobile/tablet form factors and identify any blocking UI defects.
- Capture latency, error handling, and logging behaviours under opportunistic load tests.
- Harvest qualitative feedback for final polish items before launch.

## 2. Participant Profiles
- **Primary Operator (3 participants):** Shopify admin staff responsible for daily CX + inventory decisions, familiar with standard Polaris UI but new to HotDash.
- **Growth Stakeholder (1 participant):** Marketing/SEO manager consuming analytics tiles and approvals summaries.
- **Executive Reviewer (1 participant):** Business owner validating approvals flow, idea pool, and risk controls.
- Recruit mix of desktop (70%) and tablet (30%) users; ensure at least one mobile Safari session for responsive validation.

## 3. Logistics & Environment
- **Test window:** 60 minutes per session (45m scenarios + 15m debrief).
- **Environment:** Staging Shopify shop + HotDash staging workspace with seeded data snapshot dated within 72 hours of session.
- **Observers:** Pilot lead (moderator), QA note-taker, optional PM observer.
- **Tools:** Zoom (recording enabled), FigJam observation board, Stopwatch, shared Google Drive folder for artifacts.

## 4. Consent Script (Read Before Recording)
> “Thanks for helping us test the HotDash control center. We’ll record this session so the product team can review it. The recording is used for internal improvements only and deleted within 14 days. You can stop at any time. Do you consent to participate and be recorded?”

- Capture verbal yes/no on recording.
- If declined, stop recording and continue note-taking only.

## 5. Pre-Session Checklist
- Verify staging credentials provisioned and MFA disabled for session window.
- Confirm rollback snapshot and feature flags match production launch configuration.
- Launch Zoom, confirm microphone + screen share (participant audio + moderator recording).
- Open incident log sheet (see §9) and rubric template (§7).
- Ensure backup browser (Chrome) ready if participant’s primary browser fails.

## 6. Scenario Tasks & Moderator Prompts
| # | Scenario | Moderator Prompt | Success Signals | Notes |
|---|----------|------------------|-----------------|-------|
| 1 | New user onboarding | “Pretend you’re logging into HotDash for the first time. Show me how you’d understand what’s happening today.” | Finds dashboard tiles, reads KPI summaries without guidance, identifies approvals drawer. | Time to first meaningful insight, confusion points. |
| 2 | Daily workflow | “Handle today’s operations: check inbox, inventory risks, and actionable approvals.” | Navigates between CX queue, inventory, approvals without getting lost; submits at least one approval decision. | Track navigation path and blockers. |
| 3 | Mobile responsiveness | “Open HotDash on your phone/tablet and repeat the critical actions from Scenario 2.” | UI usable without horizontal scroll; key actions accessible; no critical layout breaks. | Capture screenshots of issues. |
| 4 | Error handling | “A data tile fails to load with an error banner. Show how you’d diagnose next steps.” (Use seeded fault) | Identifies logs/refresh options, references incident workflow or escalation plan. | Observe trust impact. |
| 5 | Performance under load | “Approve or reject queued items while background sync is running.” (Trigger job) | UI stays responsive; operator understands spinner/state cues. | Record perceived lag >1.5s. |

## 7. Observation Rubric
- **Task success:** Achieved / Partial / Failed.
- **Confidence rating (1–5):** Self-reported post-scenario.
- **Time-on-task:** Start/stop per scenario.
- **Error severity:** None, Minor (recoverable), Major (needs fix pre-launch).
- **Delight/friction notes:** Quote verbatim user statements; tag with sentiment (Positive/Neutral/Negative).
- **Approval usability:** Track confusion with HITL flow, ABAC guardrails, or rollback details.

## 8. Recording & Artifact Handling
- Store recordings in `/artifacts/pilot/2025-10-24/screenshots` + `/artifacts/pilot/2025-10-24/sessions` (create folder per participant).
- Name convention: `YYYYMMDD_ParticipantRole_Session#.mp4` and matching `..._Notes.md`.
- Upload rubrics and notes within 24 hours; ensure access restricted to Pilot + Manager roles.

## 9. Incident Handling & Escalation
- Maintain live incident log (Google Sheet) with columns: Timestamp, Scenario, Severity, Description, Immediate Workaround, Owner.
- Severity definitions:
  - **Critical:** Blocks launch → file blocker ticket immediately, notify Manager + Engineer via Slack #launch-war-room.
  - **High:** Severe friction but workaround exists → log follow-up issue within 1 hour.
  - **Medium/Low:** Capture for backlog triage post round.
- If staging instability occurs, pause session, capture evidence, coordinate with DevOps per `docs/runbooks/staging-recovery.md`.

## 10. Post-Session Debrief Template
```
Session ID:
Participant Role:
Date/Time:

### Highlights
- Task successes:
- Major blockers:
- Unexpected behaviours:

### Metrics
- Tasks completed:
- Average confidence (1–5):
- Notable time-on-task variances:

### Recommendations
- Immediate release blockers:
- UX polish opportunities:
- Follow-up experiments / additional research:

### Next Actions
- Owner / due date
```

## 11. Schedule & Reporting
- Complete minimum five sessions by T-5 days to go-live; include at least two repeat sessions after fixes land.
- Summarize findings in daily standup with links to artifacts and updated incident log.
- Provide final roll-up to Manager + CEO with pass/fail recommendation and backlog summary.
