# SEO Anomaly Triage Runbook

**Version:** 1.0  
**Owner:** SEO Agent  
**Date:** 2025-10-19

## Purpose

Operational runbook for triaging SEO anomalies with clear escalation paths.

## Supabase Data Sources

| Resource                          | Purpose           | Freshness SLA |
| --------------------------------- | ----------------- | ------------- |
| `public.facts`                    | Traffic snapshots | < 24h         |
| `public.get_seo_anomalies_tile()` | Anomaly counts    | Real-time     |

## Alert Thresholds

**Traffic Anomalies:**

- Critical: ≥ 40% drop WoW
- Warning: 20-40% drop WoW
- Info: < 20% drop

**Core Web Vitals:**

- LCP: Poor > 4.0s (critical), 2.5s-4.0s (warning)
- FID: Poor > 300ms (critical), 100ms-300ms (warning)
- CLS: Poor > 0.25 (critical), 0.1-0.25 (warning)

## Daily Workflow

1. Query Supabase `get_seo_anomalies_tile()`
2. If anomaly_count = 0, log clear state
3. If anomaly_count > 0, capture evidence from GA4
4. Create HITL recommendation with rollback plan
5. Route to Product/Ads/Content for approval

## MCP Tools Required

- `mcp_google-analytics_run_report` - GA4 traffic data
- `mcp_supabase_list_tables` - Schema verification

## References

- `docs/specs/seo_anomalies_detection.md`
- `tests/unit/seo.web-vitals.spec.ts`
