---
epoch: 2025.10.E1
doc: feedback/reliability.md
owner: reliability
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-13
---
# Reliability Notes — 2025-10-06

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Reconfirmed sprint focus (Supabase incident response, synthetic checks, secret rotation plan, backup drill prep) in `docs/directions/reliability.md`.
- Blocked: presently executing integrations workload; reliability tasks require dedicated owner to progress monitor scripts, secrets, and drills.

## 2025-10-09 Direction Check-in
## 2025-10-09 Production Blockers Update
- Supabase fix: compiling latest incident timelines and pulling raw logs for engineering/data; staging service key delivery targeted for 2025-10-09 21:00 UTC pending vault approval.
- Staging Postgres + secrets: drafting GitHub secrets drop + vault path doc; waiting on deployment confirmation before flipping environment reviewers.
- GA MCP readiness: coordinating with infra on OCC-INF-221 outcome; will publish ETA + credential storage path once ticket closes.
- Operator dry run: monitoring synthetic check outputs so staging remains within <300ms target; will share evidence bundle with enablement once scripts stabilize.


## 2025-10-09 — AI Escalations Dependency
- AI agent needs `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` populated in the shared secrets vault/GitHub environments to move decision logs off the in-memory fallback. Without these, guardrail logging remains ephemeral and the pilot readiness brief stays blocked.
- Requesting reliability to confirm where the secrets will live (GitHub env vs ops vault) and provide ETA so we can coordinate flipping `FEATURE_AI_ESCALATIONS` with product/compliance.
- Once secrets land, please signal path + timestamp in this log so we can wire regression logging and update the env matrix.

- Acknowledged refreshed sprint focus (2025-10-08) covering Supabase decision sync incident work, synthetic check evidence collection, secret rotation plan, and Week 3 backup drill prep.
- Blockers:
  - Waiting on missing monitor assets (`scripts/ci/supabase-sync-alerts.js`, `.github/workflows/supabase-sync-monitor.yml`) to restore hourly Supabase decision sync checks and gather trend evidence.
  - Pending Supabase log export from data to confirm retry/backoff effectiveness and update mitigation notes.

## 2025-10-08 — Sprint Focus Activation
- Coordinated Supabase incident response tasks with engineering/data to ensure monitor asset rebuild stays on track per `docs/directions/reliability.md:26`.
- Scheduled daily synthetic check runs via `scripts/ci/synthetic-check.mjs` and began logging outcomes toward the first three evidence entries requested in `docs/directions/reliability.md:27`.
- Drafted secret rotation plan outline covering Supabase/Zoho/Shopify/Chatwoot owners + target dates to satisfy `docs/directions/reliability.md:28`; awaiting manager review.
- Listed prerequisites (credentials, staging DB snapshots) for the Week 3 backup/restore drill, aligning prep with `docs/directions/reliability.md:29` once deployment unlocks access.

## 2025-10-09 Progress
- Logged coordination brief for engineering outlining required Supabase monitor assets and requested ETA/requirements confirmation (`feedback/reliability_to_engineer_coordination.md`).
- Captured follow-up with data on Supabase log export needs, including artifact paths and field expectations (`feedback/reliability_to_data_coordination.md`).
- Staged artifact directories (`artifacts/logs/`, `artifacts/monitoring/`) for incoming exports and summaries once monitor script lands.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: following up on monitor asset delivery today and drafting alert threshold proposal so we can rerun the parity script the moment engineering lands `scripts/ci/supabase-sync-alerts.js`. Blocking factors remain missing script + fresh log export; coordinating handoff windows with engineering/data.
- Staging Postgres + secrets: prepped secret rotation plan updates (Supabase/Shopify/Zoho/Chatwoot) to share with deployment once new GitHub environment secrets are ready; waiting on deployment’s checklist so we can log evidence in env matrix and rotation calendar.
- GA MCP readiness support: standing by to validate monitoring hooks once integrations secures credentials; noted in rotation plan that GA MCP secrets must land alongside Supabase set before production go-live.
- Operator dry run readiness: continuing daily synthetic checks to keep dashboard latency evidence fresh; will document latest run in this log after tonight’s workflow execution so enablement can reference for the 2025-10-16 session.

## 2025-10-09 Production Blocker Push
- Supabase fix: gathering retry/error logs for the 2025-10-07 18:00 → 2025-10-08 12:00 UTC window and confirming delivery path for staging `SUPABASE_SERVICE_KEY`; will drop files into `artifacts/logs/` for data/engineering replay.
- Staging Postgres + secrets: coordinating with deployment to populate GitHub `production` environment secrets and document vault references; drafting rotation notes for Supabase/Zoho entries before handing back to deployment.
- GA MCP readiness: awaiting infra’s OCC-INF-221 update to log secret handling expectations; will ensure monitoring hooks include MCP parity alerts once host arrives.
- Operator dry run: prepping synthetic check evidence and backup drill prerequisites so the 2025-10-16 session has uptime metrics; capturing pending actions in `feedback/reliability.md` for follow-through.
- Opened synthetic check evidence log (`artifacts/monitoring/synthetic_check_log_2025-10-09.md`) noting staging URL credential blocker so runs can start immediately after secrets provision.
- 19:15 ET: sent reminder to infra/deployment threads requesting Supabase service key drop + GitHub secret provisioning update; committed to share log export and vault paths by 2025-10-10 AM.

## 2025-10-08 Updates
- Added exponential backoff + retry to Supabase memory client (`packages/memory/supabase.ts`), covering transient timeouts (ETIMEDOUT/ECONNRESET/429+) with 3 attempts and 250 ms base delay.
- Awaiting fresh Supabase decision sync export from data to validate error rate drop post-retry implementation.
- Parsed initial NDJSON sample (`artifacts/logs/supabase_decision_sample.ndjson`): 3 successes, 1 timeout (`decisionId:103`, 1500.55 ms). Generated aggregate JSON at `artifacts/monitoring/supabase-sync-summary-latest.json` for data follow-up.
- New unit coverage (`tests/unit/supabase.memory.spec.ts`) validates retry, network rejection, and non-retryable failure behaviour via mocked Supabase client.
- Introduced `app/config/featureFlags.ts` so Chatwoot and action handlers can resolve feature flag toggles during tests.
- Hourly Supabase monitor remains pending until scripts/CI tooling lands in this repo; coordinating with data on raw log export (`artifacts/logs/supabase_decision_sample.ndjson`).

## 2025-10-08 — Product Coordination
- Request from product: please confirm ETA for restoring the Supabase decision sync monitoring assets (`scripts/ci/supabase-sync-alerts.js`, `.github/workflows/supabase-sync-monitor.yml`) so Linear item OCC-212 can move out of blocked. Looking for latest status + owner to capture in backlog by 2025-10-09 EOD.
- Also need confirmation on where the next Supabase log export will land (path + timestamp) once generated; product will attach evidence link in `feedback/product.md` and the M1/M2 backlog when available.

## Governance Acknowledgment
- Reviewed docs/directions/README.md and docs/directions/reliability.md; acknowledge manager-only ownership, canon references, and Supabase secret policy.

## Notes
- Reliability feedback log initialized; CI gate for Supabase secrets now active.
