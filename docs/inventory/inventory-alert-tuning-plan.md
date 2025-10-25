# Inventory Alert Tuning Plan (INV-ALERT-TUNING)

**Date:** 2025-10-25  
**Agent:** inventory_agent  
**Scope:** Define thresholds, SLO alignment, and rollout plan for tuning inventory alerts (low stock, urgent reorder, overstock).

## 1. Current Alert Streams
- **Sources:**
  - `inventory_alert` table (severity, alertType, acknowledged flag).
  - `reorder_suggestion` entries (days until stockout, status).
  - Polaris dashboards (`/inventory/alerts`, `/inventory/health`).
- **Issues Observed:**
  - Excessive “low_stock” alerts for slow movers (noise).
  - Limited differentiation between “urgent_reorder” and “out_of_stock”.
  - No linkage to business impact (turnover, revenue).

## 2. Target SLO Alignment
| Alert Type | SLO | Metric | Threshold Proposal |
| --- | --- | --- | --- |
| Urgent Reorder | Resolve 95% within 4 business hours | `inventory_urgent_alert_resolution_seconds` (p95) | Trigger when `days_until_stockout <= 3` **AND** `abcClass = 'A' or 'B'`. |
| Low Stock | Keep < 20 active alerts globally | `inventory_low_stock_active_total` | Raise threshold to `days_until_stockout <= 10` only for `abcClass = 'A'`. |
| Overstock | Weekly review; ack within 48h | `inventory_overstock_unacked_total` | Alert when `excessUnits > 25%` of suggested stock. |

## 3. Threshold Changes
1. **Urgent Reorder:**
   - Add guard for high-value SKUs (ABC A/B).
   - Ignore SKUs with forecast <= 0.5/day to reduce noise.
2. **Low Stock:**
   - Switch trigger from static ROP breach to `min(ROP, 10 days cover)`.
   - Batch daily digest instead of real-time Slack spam.
3. **Overstock:**
   - Introduce financial impact check (`tiedUpCapital > $500`).

## 4. Rollout Plan
| Phase | Actions | Owner | Timeline |
| --- | --- | --- | --- |
| Phase 1 (Prep) | Implement config-driven thresholds in `inventory_alert` generator; add ABC filter. | Inventory Engineering | Week 1 |
| Phase 2 (Shadow Mode) | Run new thresholds in parallel, log deltas to `inventory_alert_tuning` table. | Inventory Engineering | Week 2 |
| Phase 3 (Enable) | Flip feature flag; update Slack routing to daily digest for low stock. | Ops Engineering | Week 3 |
| Phase 4 (Review) | Compare alert counts & resolution metrics vs baseline; adjust SLOs. | Inventory + Ops | Week 4 |

## 5. Monitoring & Metrics
- New metrics: `inventory_alerts_filtered_total`, `inventory_alerts_triggered_total{type}`, `inventory_alert_resolution_seconds`.
- Daily report summarizing:
  - Active alerts by severity.
  - Count of filtered alerts.
  - Breaches of SLO error budgets.

## 6. Communication
- Pre-rollout briefing to `#inventory-ops` (slides + doc summary).
- Weekly digest posted to `#inventory-alerts` during shadow mode.
- Post-rollout retro with Ops lead.

## 7. Risks & Mitigations
- **Risk:** Missing genuine low-stock issues after tightening thresholds.  
  **Mitigation:** Maintain fallback query comparing Shopify vs warehouse stock (see diff report) for critical SKUs.
- **Risk:** Alert backlog due to misconfigured digest.  
  **Mitigation:** Run manual check of digest job day before cutover.

## 8. Next Steps
- [ ] Build configurable threshold module.  
- [ ] Add metrics instrumentation.  
- [ ] Schedule rollout timeline with Ops.

---
_Status: Plan drafted; pending manager approval._
