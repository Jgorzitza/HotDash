# Seo Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Search Console + Bing Setup (PARALLEL DAY 1-3)

---

## Objective

**Set up Google Search Console and Bing Webmaster** for enhanced SEO monitoring

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 1-3 — START NOW (Parallel with other agents)

---

## Day 1 Tasks (START NOW - 4h)

### SEO-001: Google Search Console Integration

**What to Build**:

**API Client** - `app/services/seo/search-console.ts`:
- Authenticate with service account (like GA)
- Fetch search analytics (clicks, impressions, CTR, position)
- Landing page performance tracking
- Top queries analysis
- Index status monitoring

**API Endpoint** - `app/routes/api.seo.search-console.ts`:
```typescript
// Returns:
{
  landing_pages: Array<{
    url: string,
    clicks: number,
    impressions: number,
    ctr: number,
    position: number,
    change_7d_pct: number
  }>,
  top_queries: Array<{
    query: string,
    clicks: number,
    ctr: number
  }>,
  summary: {
    total_clicks: number,
    avg_position: number,
    index_coverage_pct: number
  }
}
```

**Tests** - `tests/unit/services/seo/search-console.spec.ts`:
- Auth flow
- Data fetching
- Error handling
- Rate limiting

**CRITICAL - Pull Context7 FIRST**:
```bash
mcp_context7_get-library-docs("/googleapis/google-api-nodejs-client", "search-console")
```

**Credentials** (coordinate with Manager):
- Search Console property ID (from Manager)
- Service account JSON (similar to GA setup)
- Store in vault, set Fly secrets

---

### SEO-002: Search Console Credentials Setup

**Process**:
1. Request credentials from Manager
2. Store in `vault/occ/google/search_console_property_id.env`
3. Store service account in `vault/occ/google/search_console_credentials_base64.env`
4. Test connection locally (if possible)
5. Coordinate with DevOps for Fly secrets

**Verification**:
```bash
# After DevOps sets secrets, test:
curl https://hotdash-staging.fly.dev/api/seo/search-console
# Expected: Landing page data with clicks/impressions
```

---

## Day 2 Tasks

### SEO-003: Bing Webmaster Tools Integration

**What to Build**:

**API Client** - `app/services/seo/bing-webmaster.ts`:
- Bing Webmaster API authentication
- Search analytics (clicks, impressions)
- Crawl errors monitoring
- Index status

**API Endpoint** - `app/routes/api.seo.bing-webmaster.ts`:
- Similar structure to Search Console
- Returns landing page performance
- Combined with Search Console for multi-engine view

**CRITICAL - Use Web Search** (Context7 may not have Bing):
```bash
web_search("Bing Webmaster Tools API documentation 2025")
```

**Credentials**:
- Bing API key (from Manager)
- Site verification token

---

### SEO-004: Enhanced SEO Tile Integration

**Update SEO & Content Watch tile**:

**Add to existing `app/routes/api.seo.anomalies.ts`** OR create new endpoint:
- Combine GA + Search Console + Bing data
- Priority ranking (which pages need attention)
- Traffic source breakdown (organic, direct, social)
- Top declining pages (not just anomalies)

**Data Format for Engineer**:
```typescript
{
  overview: {
    total_sessions: number,      // from GA
    total_clicks: number,         // from Search Console
    avg_position: number,         // from Search Console
    organic_change_7d_pct: number // combined metric
  },
  landing_pages: Array<{
    url: string,
    ga_sessions: number,
    gsc_clicks: number,
    position: number,
    change_pct: number,
    priority: 'high' | 'medium' | 'low' // calculated
  }>
}
```

---

## Day 3 Tasks (Optional - If Time)

### SEO-005: Sitemap Auto-Generation

**Generate sitemap.xml**:
- Query Shopify for all products
- Generate XML format
- Update on product create/delete webhook
- Submit to Search Console + Bing

**File**: `app/routes/sitemap[.]xml.ts` (React Router 7 pattern)

---

### SEO-006: Schema Markup Validation

**Validate structured data**:
- Product schema (schema.org/Product)
- Organization schema
- Check all product pages have valid markup
- Report errors for Engineer to fix

---

## Work Protocol

**1. MCP Tools (MANDATORY)**:
```bash
# Google Search Console:
mcp_context7_get-library-docs("/googleapis/google-api-nodejs-client", "searchconsole")

# Bing Webmaster:
web_search("Bing Webmaster Tools API authentication 2025")

# Log usage:
## HH:MM - Context7: Google API Node Client
- Topic: Search Console authentication with service account
- Key Learning: Uses OAuth2 similar to Analytics
- Applied to: app/services/seo/search-console.ts
```

**2. Coordinate**:
- **Manager**: Get credentials (Search Console property, Bing API key)
- **DevOps**: Set Fly secrets
- **Engineer**: Will integrate data into SEO tile
- **Analytics**: May share GA integration patterns

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — SEO: Search Console Setup

**Working On**: SEO-001 (Search Console API integration)
**Progress**: API client complete, testing connection

**Evidence**:
- Files: app/services/seo/search-console.ts (245 lines)
- Tests: 10/10 passing
- Context7: Pulled Google API client docs (OAuth2 patterns)
- Connection: ⏸️ Waiting for Manager credentials

**Blockers**: Need Search Console property ID from Manager
**Next**: Complete Bing integration once Search Console verified
```

---

## Definition of Done

**Search Console**:
- [ ] API client functional
- [ ] Endpoint returning real data
- [ ] Tests passing (10+ tests)
- [ ] Context7 docs pulled
- [ ] Connection verified
- [ ] Credentials in vault

**Bing Webmaster**:
- [ ] API client functional
- [ ] Endpoint returning data
- [ ] Tests passing
- [ ] Connection verified

**SEO Tile Enhancement**:
- [ ] Combined data endpoint ready
- [ ] Priority ranking implemented
- [ ] Format matches Engineer's needs for tile integration

**Optional** (if time):
- [ ] Sitemap generation working
- [ ] Schema validation tool created

---

## Critical Reminders

**DO**:
- ✅ Pull Context7/web search BEFORE coding
- ✅ Test with real credentials
- ✅ Follow GA patterns (service account, base64 encoding)
- ✅ Coordinate with Manager for credentials

**DO NOT**:
- ❌ Hardcode API keys
- ❌ Skip Context7 tool pulls
- ❌ Assume Bing API = Google API (different patterns)
- ❌ Deploy without testing connection

---

## Phase Schedule

**Day 1**: SEO-001, SEO-002 (Search Console - 4h) — START NOW
**Day 2**: SEO-003, SEO-004 (Bing + tile enhancement - 4h)
**Day 3**: SEO-005, SEO-006 (sitemap + schema - optional)

**Total**: 8 hours across Days 1-3 (parallel with other agents)

**UNBLOCKS**: Enhanced SEO tile for Engineer integration

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Similar Pattern**: GA integration (see app/services/analytics/)
**Feedback**: `feedback/seo/2025-10-20.md`

---

**START WITH**: SEO-001 (Search Console integration NOW - 3h) — PARALLEL DAY 1

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

---

## ✅ MANAGER UPDATE (2025-10-21T00:00Z)

---

## ✅ ALL TASKS COMPLETE - STANDBY MODE

**Manager Update** (2025-10-21T01:25Z): All feedback reviewed, work verified complete

**Your Status**: ✅ STANDBY
- All assigned tasks completed successfully
- Evidence documented in feedback file
- Ready for Phase 3+ coordination or new assignments

**Current Focus**: Monitor feedback and await direction for:
- Option A support requests from other agents
- SEO triage documentation enhancements
- Monitoring for keyword cannibalization issues

**No Action Required**: Stay in standby until Manager assigns next task

**If Contacted By Other Agents**: Respond to coordination requests and document in feedback

**Status**: ALL TASKS COMPLETE ✅

**Evidence**: See feedback/seo/2025-10-20.md

**Your Work**:
Work verified complete by Manager

**Next Assignment**: STANDBY - Await Phase 3-13 coordination requests

**No Action Required**: You are in standby mode until Manager assigns next phase work

