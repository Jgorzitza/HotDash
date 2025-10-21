# SEO Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:03Z  
**Version**: 5.2  
**Status**: ACTIVE — Phase 7 Automated SEO + Content Optimization

---

## Objective

**Build automated SEO audits, keyword cannibalization detection, schema validation**

---

## MANDATORY MCP USAGE

```bash
# Google Search Console API
web_search("Google Search Console API official documentation authentication")

# Bing Webmaster Tools API
web_search("Bing Webmaster Tools API official documentation")

# TypeScript for SEO services
mcp_context7_get-library-docs("/microsoft/TypeScript", "async API calls error handling")
```

---

## ACTIVE TASKS (9h total)

### SEO-007: Automated SEO Audits (3h) - START NOW

**Requirements**:
- Daily automated SEO crawl
- Check: Title tags, meta descriptions, headers, images
- Report anomalies (missing tags, duplicate content)
- Store in seo_audits table

**MCP Required**: Search Console API docs via web_search

**Implementation**:

**File**: `app/services/seo/automated-audit.ts` (new)
```typescript
export async function runDailyAudit() {
  // Crawl site
  // Check SEO elements
  // Report issues
}
```

**File**: `app/routes/api.seo.run-audit.ts` (new)
- POST endpoint to trigger audit
- Store results in seo_audits table

**Credentials**: `vault/occ/google/search_console_credentials.json`

**Time**: 3 hours

---

### SEO-008: Keyword Cannibalization Detection (2h)

**Requirements**:
- Detect multiple pages ranking for same keyword
- Identify cannibalization conflicts
- Recommend consolidation

**File**: `app/services/seo/cannibalization.ts` (new)

**Time**: 2 hours

---

### SEO-009: Schema Markup Validator (2h)

**Requirements**:
- Validate JSON-LD schema markup
- Check Product, Organization, WebSite schemas
- Report validation errors

**File**: `app/services/seo/schema-validator.ts` (new)

**Time**: 2 hours

---

### SEO-010: Search Console Integration Enhancement (2h)

**Requirements**:
- Fetch more metrics: impressions, clicks, CTR, position
- Daily refresh
- Store in seo_rankings table

**File**: `app/services/seo/search-console-enhanced.ts` (new)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: web_search for API docs, Context7 for TypeScript

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — SEO: Automated Audits

**Working On**: SEO-007 (Daily SEO audit automation)
**Progress**: 50% - Crawl working, checking SEO elements

**Evidence**:
- File: app/services/seo/automated-audit.ts (156 lines)
- MCP: web_search for Search Console API (official docs found)
- Test: Audited 12 pages, found 3 missing meta descriptions
- API: Authenticated with Search Console successfully

**Blockers**: None
**Next**: Complete audit reporting, store in seo_audits table
```

---

**START WITH**: SEO-007 (Automated audits) - web_search for API docs NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
