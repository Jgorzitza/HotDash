# Product Health Monitoring

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent
**Evidence Path**: `docs/product_health_monitoring.md` (Health score model, monitoring dashboard, alert thresholds)

---

## Product Health Score (0-100)

**Components**:
- **System Performance** (30%): Uptime, latency, error rate
- **User Satisfaction** (30%): NPS, CSAT, operator rating
- **Business Metrics** (20%): Revenue, churn, growth rate
- **Quality Metrics** (20%): Bug count, tech debt, test coverage

**Example Calculation**:
- System: 99.5% uptime → 29/30 pts
- Satisfaction: NPS +45 → 28/30 pts
- Business: 3% churn → 18/20 pts
- Quality: 5 P1 bugs → 15/20 pts
**Total**: 90/100 (Healthy)

**Thresholds**:
- 80-100: Healthy (green)
- 60-79: At risk (yellow)
- <60: Critical (red)

**Document Path**: `docs/product_health_monitoring.md`
**Status**: Health monitoring system with scoring model

