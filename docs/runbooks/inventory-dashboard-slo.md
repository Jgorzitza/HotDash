# Inventory Dashboard SLOs & Runbook (INV-DASHBOARD-SLO)

**Date:** 2025-10-25  
**Owner:** Inventory Engineering  
**Agent:** inventory_agent

## 1. Service Definition
- **Service:** Inventory Health & Optimization dashboard (`/inventory/health`, `/inventory/alerts`, `/inventory/optimization`).
- **Users:** Operations leadership, CEO approvers, inventory agents.
- **Dependencies:** Shopify Admin API, Postgres (inventory + action queue), Supabase KB (decision logs), Prisma services.

## 2. Service Level Objectives
| Metric | SLO | Error Budget | Measurement |
| --- | --- | --- | --- |
| Dashboard Availability | 99.5% monthly | 3.6 hours down/month | Pingdom synthetic check hitting `/inventory/health` every 5 minutes.
| Data Freshness (ROP snapshot) | 95% of runs deliver data < 15 minutes old | 5% of requests may exceed freshness window | Cron job log comparing `generatedAt` vs current time; alert if stale >15 min.
| Action Queue Latency | 95th percentile < 3 minutes from queue to CEO view | 5% of actions may exceed threshold | Instrument `action_queue` timestamps and compute p95 hourly.
| API Response Time | 95th percentile < 800ms for `/api/inventory/health-metrics` | 5% above threshold | Prometheus histogram via router instrumentation.

## 3. Monitoring & Alerting
- **Metrics:**
  - `inventory_dashboard_http_duration_seconds` (histogram) per endpoint.
  - `inventory_dashboard_last_sync_timestamp` gauge.
  - `inventory_action_queue_pending_total` gauge.
- **Alert Policies:**
  1. Availability breach: if uptime < 99.5% rolling 30 days → PagerDuty P1 (Ops On-call).
  2. Freshness breach: if freshness gauge > 15 minutes for 3 consecutive checks → PagerDuty P2.
  3. Queue latency breach: if 95th percentile latency > 3 minutes for two consecutive hours → Slack #inventory-alerts + PagerDuty P2.

## 4. Runbook Steps
1. **Confirm outage:** Check synthetic monitors in Grafana; validate error codes.
2. **Identify dependency failures:**
   - Shopify Admin status (status.shopify.com).
   - Postgres health via `fly status` or RDS metrics.
   - Inspect latest `action_queue` logs.
3. **Data freshness issue:**
   - Ensure cron `api.inventory.rop` job ran (`fly logs` or job scheduler UI).
   - If backlog, run manual `npm run inventory:recompute-rop` (requires manager approval).
4. **API latency spike:**
   - Capture `EXPLAIN ANALYZE` for `/api/inventory/health-metrics` queries.
   - Verify caches (if applicable) and Prisma connection count.
5. **Escalation:**
   - Slack `#inventory-eng` with incident summary (template in `docs/runbooks/incident-template.md`).
   - Engage on-call engineer via PagerDuty.
6. **Post-incident:**
   - Document root cause in KB DecisionLog (`action: incident_postmortem`).

## 5. Communication Plan
- Slack channels: `#inventory-alerts` (automated), `#inventory-eng` (discussion).
- PagerDuty escalation: Inventory Ops → Platform → CTO (if >2 hours).
- Status page update: Owner posts within 15 minutes of confirmed outage.

## 6. Maintenance
- Review SLO metrics monthly with Ops lead.
- Recalculate thresholds after major feature releases.
- Validate synthetic monitor credentials quarterly.

## 7. References
- `docs/inventory/inventory-diff-report.md`
- `docs/inventory/inventory-performance-readiness.md`
- `docs/runbooks/incident-template.md`

---
_Status: SLO targets drafted and runbook steps enumerated. Awaiting manager review._
