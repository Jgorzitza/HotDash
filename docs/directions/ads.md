# Ads Direction

- **Owner:** Ads Agent
- **Effective:** 2025-10-19
- **Version:** 3.0

## Objective

Current Issue: #101

**P0 PRIORITY:** Fix getPlatformBreakdown test failure FIRST, then deliver production-ready Ads intelligence with HITL approvals and proven ROAS/CTR lift.

## Tasks (16 Molecules - Unblocker First)

### P0 CRITICAL UNBLOCKER (Execute First)

1. **ADS-000-P0:** Fix getPlatformBreakdown Empty List Handling (20 min) **PRIORITY 1**
   - **Blocker Impact:** QA reports test failure in `tests/unit/ads/platform-breakdown.spec.ts:75`
   - **Root Cause:** Function doesn't handle empty campaign list correctly
   - **Location:** `app/lib/ads/platform-breakdown.ts` or similar
   - **Action:**
     - Add empty array guard: `if (!campaigns || campaigns.length === 0) return []`
     - Ensure test fixture includes empty list scenario
     - Run test: `npx vitest run tests/unit/ads/platform-breakdown.spec.ts`
   - **Evidence:** Test passes 100%, QA re-verification confirms fix
   - **ETA:** 20 minutes

### Original Tasks (now 2-6)

2. Finalize Slice B + C of the ads metrics diff (≤50 files per PR) and ship ROAS/CPC/CPA helpers with Vitest coverage and fixtures.
3. Wire the Ads approvals drawer to the centralized approvals API, including evidence payloads, rollback plan, and alert hooks.
4. Partner with Analytics to stub Meta/Google data sources until credentials are approved; document follow-up in feedback.
5. Automate Publer campaign plan export (HITL only) and attach per-campaign impact metrics to Supabase.
6. Write feedback to `feedback/ads/2025-10-19.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/ads/**`, `app/routes/api.ads.*`, `app/components/dashboard/**`, `tests/unit/ads/**`, `tests/e2e/**`, `docs/specs/ads_pipeline.md`, `feedback/ads/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Respect Allowed paths; HITL-only publishing via Publer; no secrets committed; ensure CI green before merge; work must tie to the current Issue and Allowed paths listed there.

## Definition of Done

- [ ] All ads metrics slices (A–C) merged with evidence and ≤50 files each
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` with ads tests and Playwright suite green
- [ ] `npm run scan` with clean report
- [ ] Dashboard tiles and approvals docs updated
- [ ] Feedback entry completed with test logs and follow-ups recorded
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/unit/ads/tracking.spec.ts`
- **Expectations:** ROAS/CPC helpers return correct values and zero guards when spend/clicks are zero.

## Risk & Rollback

- **Risk Level:** Medium — Incorrect metrics mislead executives; mitigated by tests + HITL approvals.
- **Rollback Plan:** Feature-flag new metrics slices (`ADS_METRICS_SLICE_B/C`), revert module imports, redeploy.
- **Monitoring:** Supabase `ads_metrics_daily` table, dashboard tile latency, Publer queue health, approvals audit logs.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/ads/2025-10-17.md`
- Specs / Runbooks: `docs/specs/ads_pipeline.md`

## Change Log

- 2025-10-19: Version 3.0 – Added P0 unblocker (getPlatformBreakdown test fix)
- 2025-10-17: Version 2.0 – Production launch alignment with HITL workflow
- 2025-10-17: Version 1.3 – Template rewrite aligning ads strategy with Publer cadence and analytics tasks
- 2025-10-16: Version 1.2 – Ads intelligence launch plan (aggregates, approvals, anomalies)
- 2025-10-15: Version 1.1 – Ads performance tracking foundation
