# Test Plan

## Unit
- Recommender heuristics (feature thresholds, ranking).
- Draft generators (title/meta length, tokenization, link count).

## Integration
- Adapters dry-run and rollback.
- Webhook → queue → action creation flow.

## E2E
- From signal to approved publication → verify UI diff → confirm external system state changed.

## Synthetic Monitoring
- Ping Action API and storefront pages; track Core Web Vitals; alert on regressions.

## Acceptance Criteria (v1)
- ≥ 10 actionable items/day on average.
- ≥ 60% operator approval rate for Top 10.
- Measurable CTR lift on SEO changes within 14 days for ≥ 50% of candidates.
