Title: Closed‑loop SEO Telemetry (GSC Bulk Export → BigQuery)

Goal

- Full‑fidelity search telemetry with joins to GA4 revenue to prioritize daily actions.

Pipeline

- Nightly: Export GSC Bulk to BigQuery
- Join: GA4 sessions/revenue, content table
- Action cards: “Impressions ↑, CTR ↓” and rank‑4–10 targets

CWV→$$ mapping

- Model: RevenueLift = Sessions × ConvRate × AOV
- Inputs:
  - Sessions delta from LCP/FID/CLS improvement buckets (industry multipliers)
  - ConvRate delta from CLS/LCP improvements (benchmarks)
  - AOV from GA4 adapter (last 28d)
- Output: Expected $/page for top candidates; feed into Action Dock

Validation plan

- Backtest: sample 50 URLs; compute predicted vs observed over 14d
- Sanity checks: clamp negative lifts; exclude low-signal pages (< N sessions)
- Evidence: attach query, chart, and summary table with top 10 pages

Acceptance

- ≥5 high‑value SEO actions/day
- Top‑10 list ordered by expected revenue

Notes

- Respect brand filters; MCP-first for GSC/GA4 SDK docs
- Evidence: attach query, chart, and draft change
