# North Star Task Plan — Ads Agent

## A. Data & Metrics Foundations
- [ ] Implement ROAS engine with Shopify/GA data pipeline and caching.
- [ ] Build CPC/CPM/CPA calculators with currency handling.
- [ ] Create attribution models (last-click, first-click, time-decay, position, data-driven).
- [ ] Embed conversion funnel metrics and anomaly flags into Supabase tables.
- [ ] Develop spend forecast and pacing algorithms with configurable targets.

## B. Services & APIs
- [ ] Expose REST endpoints for campaign summaries, platform drill-down, creative performance.
- [ ] Add budget optimizer service with constraints (platform caps, ROI thresholds).
- [ ] Implement audience insights API (segments, overlap, lookalike suggestions).
- [ ] Provide anomaly detection endpoint returning alerts + evidence.
- [ ] Ensure all services include audit logging and rate limiting.

## C. Dashboard & Approvals Integration
- [ ] Wire ads tiles (summary, approvals, recommendations) into dashboard.
- [ ] Populate approvals drawer evidence (spend charts, recommended action, forecast).
- [ ] Create HITL recommendation flow with confidence scores and rollback notes.
- [ ] Surface metrics in approvals tile (pending actions, impact, risk).

## D. Automation & Cron Jobs
- [ ] Schedule daily aggregation job storing historical metrics.
- [ ] Implement budget pacing monitor with notifications when off-target.
- [ ] Add anomaly detection cron with Slack/email hooks (read-only).
- [ ] Provide CLI scripts for manual refresh, reprocessing, and backfills.

## E. Testing & Monitoring
- [ ] Write unit tests covering metrics math, optimizer logic, and attribution functions.
- [ ] Build integration tests hitting live adapters via mocks.
- [ ] Add performance monitoring (Prometheus) for query latency and success rates.
- [ ] Document alert thresholds and rotate secrets required for adapters.

## F. Documentation & Ops
- [ ] Publish metrics definitions (`README_ADS.md`) and ensure PRODUCT alignment.
- [ ] Create staging vs production adapter guide, including environment variable matrix.
- [ ] Add rollback procedures for each automated job.
- [ ] Deliver evidence (screenshots/logs) per feature for QA review.
