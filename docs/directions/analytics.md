# Direction: analytics

> Location: `docs/directions/analytics.md`
> Owner: manager
> Version: 1.1
> Effective: 2025-10-16

---

## Status: ACTIVE

## 1) Purpose
Deliver **multi-source analytics feeds** (GA4, Shopify reports, Supabase aggregates) that power revenue/traffic/severity tiles, anomaly detection, and CEO agent recommendations with accurate, auditable data.

### Tools (Granted by Manager)
| Tool | Purpose | Notes |
|------|---------|-------|
| GA4 API / google-analytics-data SDK | Traffic & revenue queries | Use staging property `339826228`; enforce strict sampling checks |
| Shopify Reports API | Supplement GA4 with Shopify order/return metrics | Read-only staging credentials only |
| Supabase RPC / SQL | Persist backfilled aggregates, expose tiles | Coordinate with Data agent |
| Context7 MCP | Locate analytics code/tests | Reference existing patterns |
| GitHub MCP | Manage PRs/issues | Required for reviews |

## 2) Current Objective (2025-10-16) — Analytics Launch (P0)

**Priority:** P0 — Ensure dashboard analytics are live, accurate, and backfilled to May 1.

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task Board — Sprint Lock Focus
**Proof-of-work:** Capture GA4 query IDs, Shopify GraphQL responses, sampling checks, and dashboards screenshots in `feedback/analytics/YYYY-MM-DD.md`.

1. **Live data validation for dashboard tiles (Due Oct 18)**  
   - Partner with Engineer to verify Revenue/AOV/Returns/Traffic/CX tiles hit live endpoints post-migration.  
   - Document latency (<3s) and accuracy checks; file issue if thresholds breached.

2. **Supabase migration verification (Due Oct 17)**  
   - Work with Data/DevOps to confirm analytics views deployed in staging.  
   - Run SQL sanity tests + share results with Manager/QA.

3. **Idea pool KPI instrumentation (Due Oct 18)**  
   - Provide acceptance rate, wildcard freshness, time-to-launch metrics through analytics endpoints / dashboards.  
   - Supply test fixtures + documentation for QA/CEO agents.

4. **Sampling guard evidence (Due Oct 18)**  
   - Re-run GA4 queries verifying unsampled results; log query IDs and fallback handling.  
   - Update docs with remediation path when sampling occurs.

5. **Feedback discipline**  
   - Continue daily logging, note when staging validation and dashboard checks complete.

### Blockers: Supabase migrations awaiting DevOps window

### Critical Reminders
- ✅ Use staging credentials first; promote to prod after verification.  
- ✅ Backfill must reach May 1, 2025 with unsampled data; split queries as needed.  
- ✅ Strict sampling: reject sampled results, flag to QA/manager.  
- ✅ Combine GA4 + Shopify data to support CEO-facing insights.

## Changelog
* 2.0 (2025-10-16) — Multi-source analytics launch plan (GA4+Shopify, backfill, strict sampling)
* 1.0 (2025-10-15) — Initial GA4 dashboard integration

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified
