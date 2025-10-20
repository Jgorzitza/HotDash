# Ads Direction v5.1

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Google Ads Integration (PARALLEL DAY 1-3)

---

## Objective

**Set up Google Ads API for ad performance monitoring** (future Ads tile)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 1-3 — START NOW (Parallel with other agents)

---

## Day 1 Tasks (START NOW - 4h)

### ADS-001: Google Ads API Integration

**What to Build**:

**API Client** - `app/services/ads/google-ads.ts`:
- Google Ads API authentication
- Fetch campaign performance (impressions, clicks, spend, conversions)
- Ad group performance
- Keyword performance
- Budget tracking

**API Endpoint** - `app/routes/api.ads.performance.ts`:
```typescript
// Returns:
{
  campaigns: Array<{
    id: string,
    name: string,
    status: 'active' | 'paused',
    impressions: number,
    clicks: number,
    ctr: number,
    cost: number,
    conversions: number,
    roas: number // return on ad spend
  }>,
  summary: {
    total_spend: number,
    total_conversions: number,
    avg_cpc: number,
    avg_roas: number
  },
  alerts: Array<{
    campaign_id: string,
    issue: string, // 'budget_depleted', 'low_ctr', 'high_cpc'
    severity: 'high' | 'medium' | 'low'
  }>
}
```

**Tests** - `tests/unit/services/ads/google-ads.spec.ts`:
- Auth flow
- Campaign data fetching
- Alert generation logic
- Error handling

**CRITICAL - Pull Context7 FIRST**:
```bash
mcp_context7_get-library-docs("/googleapis/google-api-nodejs-client", "google-ads")
```

**Credentials** (coordinate with Manager):
- Google Ads customer ID
- OAuth2 credentials OR service account
- Developer token

---

### ADS-002: Campaign Templates for Social Ads

**Create ad campaign templates** (for future agent use):

**File**: `app/fixtures/ads/campaign-templates.json`

```json
{
  "product_launch": {
    "platforms": ["google", "facebook", "instagram"],
    "ad_copy": "New {product_name} - {selling_point}. Shop now!",
    "budget_recommendation": "$50/day",
    "targeting": {
      "interests": ["{product_category}"],
      "demographics": "25-45, all genders"
    }
  },
  "sale_promotion": {
    "platforms": ["google", "facebook"],
    "ad_copy": "{discount_pct}% OFF {category} - Limited time!",
    "budget_recommendation": "$100/day"
  },
  "retargeting": {
    "platforms": ["google", "facebook", "instagram"],
    "ad_copy": "Still thinking about {product_name}? Get {incentive} today!",
    "budget_recommendation": "$30/day"
  }
}
```

**Purpose**: Templates for agents to create ad campaigns post-launch

---

## Day 2 Tasks

### ADS-003: Ad Spend Tracking & Alerts

**Build alert system**:
- Budget depletion alerts (>90% spent)
- Low CTR alerts (<1%)
- High CPC alerts (above target)
- Conversion drops (>20% decrease)

**Integration**:
- Store alerts in notifications table (Data creates)
- Display in future Ads tile
- Trigger banner alerts if critical

---

### ADS-004: Integration with Publer (Social Ads)

**Coordinate with Integrations agent**:
- Publer supports social ads (Facebook/Instagram)
- Connect ad performance to social posts
- Track: Post → Ad Campaign → Conversions → ROI

**Create**: `app/services/ads/social-ads-integration.ts`
- Link Publer posts to ad campaigns
- Track performance per post
- Calculate social ad ROI

---

## Day 3 Tasks (Optional)

### ADS-005: Ads Performance Dashboard Data

**Build data service for future Ads tile**:
- Real-time campaign status
- Budget burn rate
- Top performing campaigns
- Underperforming campaigns (actionable alerts)

---

## Work Protocol

**1. MCP Tools (MANDATORY)**:
```bash
# Google Ads API:
mcp_context7_get-library-docs("/googleapis/google-api-nodejs-client", "google-ads")

# Or web search for latest:
web_search("Google Ads API Node.js authentication 2025")

# Log:
## HH:MM - Context7: Google Ads API
- Topic: authentication, campaign reporting
- Key Learning: Requires developer token + customer ID
- Applied to: app/services/ads/google-ads.ts
```

**2. Coordinate**:
- **Manager**: Get Google Ads credentials
- **Integrations**: Share Publer patterns
- **DevOps**: Set Fly secrets
- **Engineer**: Will build Ads tile when ready (post-Option A)

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Ads: Google Ads Integration

**Working On**: ADS-001 (Google Ads API client)
**Progress**: API client 80% complete

**Evidence**:
- Files: app/services/ads/google-ads.ts (280 lines)
- Tests: 12/15 passing (+12 new tests)
- Context7: Pulled Google Ads API docs
- Credentials: ⏸️ Waiting for Manager

**Blockers**: Need Google Ads customer ID + developer token
**Next**: Test with real credentials, build alert system
```

---

## Definition of Done

**Google Ads Integration**:
- [ ] API client functional
- [ ] Endpoint returning campaign data
- [ ] Tests passing (12+ tests)
- [ ] Context7 docs pulled
- [ ] Connection verified with real account
- [ ] Credentials in vault

**Campaign Templates**:
- [ ] Templates created (3+ campaign types)
- [ ] JSON format valid
- [ ] Documented for future agent use

**Ad Spend Tracking**:
- [ ] Alerts generating correctly
- [ ] Integration with notifications table
- [ ] Budget tracking accurate

**Social Ads Integration**:
- [ ] Publer posts linked to ad campaigns
- [ ] Performance tracking functional
- [ ] ROI calculations correct

---

## Critical Reminders

**DO**:
- ✅ Pull Context7/web search before coding
- ✅ Test with real Google Ads account
- ✅ Coordinate with Manager for credentials
- ✅ Document all ad patterns for future agents

**DO NOT**:
- ❌ Hardcode API keys or developer tokens
- ❌ Skip testing with real data
- ❌ Deploy without credential verification

---

## Phase Schedule

**Day 1**: ADS-001, ADS-002 (Google Ads API + templates - 4h) — START NOW
**Day 2**: ADS-003, ADS-004 (Alerts + social ads - 4h)
**Day 3**: ADS-005 (Dashboard data - optional)

**Total**: 8 hours across Days 1-3 (parallel with other agents)

**PREPARES**: Future Ads tile (post-Option A), social ad automation

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Similar Pattern**: GA integration (app/services/analytics/)
**Feedback**: `feedback/ads/2025-10-20.md`

---

**START WITH**: ADS-001 (Google Ads API integration NOW - 3h) — PARALLEL DAY 1

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
