# Ads Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:20Z  
**Version**: 7.0  
**Status**: ACTIVE — Campaign Optimization Support (Maintenance)

## ✅ ADS-001 THROUGH 004 COMPLETE
- ✅ Google Ads client, metrics, budget alerts, HITL copy (1,753 lines)
- ⚠️ BLOCKER: Google Ads credentials missing

## 🔄 ACTIVE TASKS: Campaign Optimization (8h) — MAINTENANCE MODE

### ADS-010: Google Ads Credential Setup (2h) — P1 BLOCKER

**Objective**: Obtain and test Google Ads API credentials

**Required**: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DEVELOPER_TOKEN, CUSTOMER_IDS

**Tasks**:
1. Check vault/occ/google/
2. If missing: Request from Manager
3. Test integration (OAuth authentication)
4. Verify rate limiting

**Acceptance**: ✅ Credentials obtained, ✅ Integration tested

---

### ADS-011: Campaign Automation + Optimization (6h)

**Objective**: Automate campaign management with HITL approval

**Tasks**:
1. Auto-pause low performers (CTR <1%, ROAS <1.0)
2. Auto-increase budgets for high performers (ROAS >3.0)
3. A/B testing for ad creatives
4. HITL approval for all actions

**MCP Required**: Web search → Google Ads API v16

**Acceptance**: ✅ Automation service implemented, ✅ Tests passing

**START NOW**: Request credentials from Manager, implement automation

---

## 🔧 MCP Tools: Web search (Google Ads API), Context7 (algorithms)
## 🚨 Evidence: JSONL + heartbeat required
