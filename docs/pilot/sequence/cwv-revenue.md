# CWV → Revenue — Pilot Planning

Scope

- Pilot drafts the linkage plan (CWV metrics to revenue signals) without touching production analytics.

Refs

- Sequence key: `cwv_to_revenue`
- Evidence path: `feedback/analytics/YYYY-MM-DD.md#cwv-to-revenue` (to be used by analytics lane)

Plan (docs-only)

- Define KPIs: LCP, CLS, INP; hypothesized revenue correlations; guardrails.
- GA4/GSC via adapters only (policy). Pilot makes no data calls.

Proof (read-only)

```bash
node scripts/pilot/run.mjs seq:plan | jq -C .
```
