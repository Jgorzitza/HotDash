# SEO Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:18Z  
**Version**: 7.0  
**Status**: ACTIVE — Content Optimization + Core Web Vitals (Maintenance)

## ✅ SEO-007 THROUGH 010 COMPLETE
- ✅ Automated audits, cannibalization, schema, Search Console (1,965 lines)

## 🔄 ACTIVE TASKS: Optimization Support (12h) — MAINTENANCE MODE

### SEO-018: Automated Content Optimization (3h) — START NOW

**Objective**: Content quality analysis and recommendations

**Service**: `app/services/seo/content-optimizer.ts` (enhance existing)
- Flesch reading ease score
- Keyword density (target 1-3%)
- Heading structure
- Internal linking
- Image alt text
- SEO score 0-100

**MCP Required**: Context7 → TypeScript text analysis

**Acceptance**: ✅ Service implemented, ✅ Tests passing

---

### SEO-019: Core Web Vitals Monitoring (3h)

**Objective**: Track CWV using PageSpeed Insights API

**Service**: `app/services/seo/core-web-vitals.ts` (NEW)
- LCP, FID, CLS tracking
- Daily monitoring cron
- Performance recommendations

**MCP Required**: Web search → PageSpeed Insights API

**Acceptance**: ✅ CWV monitoring works, ✅ Cron scheduled

---

### SEO-020: Internal Linking Service (2h)

**Objective**: Optimize internal link structure

**Service**: `app/services/seo/internal-linking.ts` (NEW)
- Identify orphan pages
- Suggest relevant links (content similarity)
- Page authority calculation

**MCP Required**: Context7 → TypeScript graph algorithms

**Acceptance**: ✅ Linking service implemented, ✅ Tests passing

---

### SEO-021: Testing + Documentation (4h)

**Objective**: 60+ tests, comprehensive docs

**Acceptance**: ✅ Tests passing, ✅ Docs complete

**START NOW**: Pull Context7, implement content optimizer

---

## 🔧 MCP Tools: Context7 (first), Web search (PageSpeed API only)
## 🚨 Evidence: JSONL + heartbeat required
