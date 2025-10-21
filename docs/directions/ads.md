# Ads Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Google Ads Testing + Automation

---

## ✅ ADS-001 THROUGH 004 COMPLETE
- ✅ Google Ads client, performance metrics, budget alerts, HITL copy approval
**Files**: 8 created (1,753 lines)
**❌ BLOCKER**: Google Ads credentials missing from vault

---

## ACTIVE TASKS (10h total)

### ADS-005: Google Ads Credentials Setup + Testing (2h) - START NOW
Obtain Google Ads API credentials and test integration
- Check vault/occ/google/ for credentials
- If missing: Request from Manager, document setup procedure
- Create testing script (test all 6 functions)
- Test OAuth authentication
- Verify rate limiting
**MCP**: Web search Google Ads API v16 2025 docs
**Required Credentials**: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, DEVELOPER_TOKEN, CUSTOMER_IDS

### ADS-006: Campaign Automation Service (3h)
Automate campaign management
- Auto-pause low performers (CTR <1%, ROAS <1.0)
- Auto-increase budgets for high performers (ROAS >3.0)
- HITL approval for all automated actions
- Keyword optimization (pause low CTR keywords)
**MCP**: Web search Google Ads campaign management API

### ADS-007: Ad Creative A/B Testing Service (2h)
Manage A/B tests for ad creatives
- Create test with 2-3 variants
- Track performance per variant
- Determine winner (Chi-square statistical test)
- HITL approval to implement winner
**MCP**: TypeScript Chi-square test

### ADS-008: Facebook Ads Integration (3h)
Integrate Facebook Ads API
- Campaign creation and management
- Performance tracking (reach, engagement, conversions)
- Integrate with Ads ROAS calculator
**MCP**: Web search Facebook Ads API v18.0

### ADS-009: Ads Reporting Automation (included)
Weekly ad performance reports (Google + Facebook)

**START NOW**: Check vault for Google Ads credentials, create test script
