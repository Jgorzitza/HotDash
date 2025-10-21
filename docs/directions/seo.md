# SEO Direction v5.3

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:42Z  
**Version**: 5.3  
**Status**: ACTIVE — **P0 FIX FIRST** then Phase 7 SEO

---

## 🚨 P0 CRITICAL - FIX FIRST (15 min)

### SEO-P0: Fix Search Console Import Error - **DO NOW**

**BLOCKER**: Staging crashed on v72 deployment - YOUR code has import error

**Error**:
```
import { google } from "@googleapis/searchconsole";
         ^^^^^^
SyntaxError: Named export 'google' not found. CommonJS module.
```

**Files to Fix**:
1. `app/lib/seo/search-console.ts`
2. `app/services/seo/search-console-enhanced.ts`

**Solution** (from error message):
```typescript
// OLD (BROKEN):
import { google } from "@googleapis/searchconsole";

// NEW (FIXED):
import pkg from "@googleapis/searchconsole";
const { google } = pkg;
```

**Steps**:
1. Pull latest code: `git pull origin manager-reopen-20251020`
2. Open both files above
3. Change the import statement in BOTH files
4. Test build locally: `npm run build`
5. Verify no errors
6. Commit: `fix(seo): change Search Console import to CommonJS-compatible format`
7. Push
8. Notify DevOps: "SEO import fix pushed, ready for v73 deployment"

**Priority**: **P0 URGENT** - Staging is BROKEN, blocks AI-Customer and Designer

**Time**: 15 minutes

**After Fix**: DevOps will deploy v73, then you continue with SEO-007 below

---

## MANDATORY MCP USAGE (After P0 Fix)

```bash
# Google Search Console API
web_search("Google Search Console API official documentation authentication Node.js")

# Bing Webmaster Tools API
web_search("Bing Webmaster Tools API official documentation")

# TypeScript for SEO services
mcp_context7_get-library-docs("/microsoft/TypeScript", "async API calls error handling")
```

---

## ACTIVE TASKS (After P0 - 9h total)

### SEO-007: Automated SEO Audits (3h)

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

**File**: `app/services/seo/search-console-enhanced.ts` (UPDATE - fix import first in P0)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: web_search for API docs, Context7 for TypeScript

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — SEO: P0 Import Fix

**Working On**: SEO-P0 (Search Console import error fix)
**Progress**: 100% - Fixed both files, tested, deployed

**Evidence**:
- Files fixed: search-console.ts, search-console-enhanced.ts (import statements corrected)
- Build test: npm run build → SUCCESS (no errors)
- Commit: abc123f "fix(seo): change Search Console import to CommonJS format"
- DevOps notified: Ready for v73 deployment

**Blockers**: None (P0 RESOLVED)
**Next**: SEO-007 (Automated audits after staging deployment)
```

---

## Critical Reminders

**DO**:
- ✅ Fix P0 import error FIRST (15 min)
- ✅ Test build locally before pushing
- ✅ Notify DevOps when fixed
- ✅ Then continue with SEO-007+

**DO NOT**:
- ❌ Skip P0 fix to work on other tasks
- ❌ Deploy without testing build
- ❌ Work on SEO-007 before P0 resolved

---

**START WITH**: SEO-P0 (Import fix) - **DO NOW** - Staging is broken and blocking 2 agents

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
