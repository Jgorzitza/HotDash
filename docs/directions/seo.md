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
**Status**: ✅ ALL TASKS COMPLETE — MAINTENANCE MODE (No new work assigned)

## ✅ SEO-007 THROUGH 010 COMPLETE (Phases 1-8)
- ✅ Automated audits, cannibalization, schema, Search Console (1,965 lines)

## ✅ SEO-018 COMPLETE (2025-10-21)

**Task**: Automated Content Optimization (3h)

**Completed**:
- ✅ Service: `app/services/seo/content-optimizer.ts` verified
- ✅ 20 tests created and passing
- ✅ Content quality analysis implemented (Flesch reading ease, keyword density, heading structure, internal linking, image alt text, SEO score)

**Evidence**: Tests in `tests/unit/services/seo/content-optimizer.spec.ts`

---

## ✅ SEO-019 COMPLETE (2025-10-21)

**Task**: Core Web Vitals Monitoring (3h)

**Completed**:
- ✅ Service: `app/services/seo/core-web-vitals.ts` verified
- ✅ 22 tests created and passing
- ✅ LCP, FID, CLS tracking implemented

**Evidence**: Tests in `tests/unit/services/seo/core-web-vitals.spec.ts`

---

## ✅ SEO-020 COMPLETE (2025-10-21)

**Task**: Internal Linking Service (2h)

**Completed**:
- ✅ Service: `app/services/seo/internal-linking.ts` verified
- ✅ 22 tests created and passing
- ✅ Orphan page detection, link suggestions, page authority calculation implemented

**Evidence**: Tests in `tests/unit/services/seo/internal-linking.spec.ts`

---

## ✅ SEO-021 COMPLETE (2025-10-21)

**Task**: Testing + Documentation (4h)

**Completed**:
- ✅ 64 tests total (all passing)
- ✅ Comprehensive test coverage

**Evidence**: Feedback log with test results

**Completed**: 2025-10-21T22:50:48Z

---

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (3 hours) — START NOW

**Strategic Deployment**: Support Content and Analytics with SEO expertise

### SEO-022: Content Optimization Review (2h) — P2

**Objective**: Help Content agent (CONTENT-015) by applying SEO optimization to generated content

**Owner**: SEO (optimization expert)  
**Beneficiary**: Content

**Deliverables**:
1. **Content SEO Audit** (`artifacts/seo/2025-10-21/content-audit.md`):
   - Review CX theme content for SEO quality
   - Apply content-optimizer service to all generated content
   - Recommend improvements (keyword density, readability, headers)

2. **SEO Guidelines for Content Generation**:
   - Best practices doc for Content agent
   - Target metrics (Flesch score >60, keyword density 1-3%)
   - Internal linking strategy for CX content

**Dependencies**: Content generates CX theme content (CONTENT-015)

**Acceptance**: ✅ Content audit complete, ✅ Guidelines created

---

### SEO-023: GA4 Action Attribution Documentation (1h) — P1

**Objective**: Help Analytics (ANALYTICS-017) by documenting GA4 custom dimension setup

**Owner**: SEO (GA4 expert)  
**Beneficiary**: Analytics + DevOps

**Deliverables**:
1. **GA4 Custom Dimension Setup Guide** (`docs/seo/ga4-custom-dimensions.md`):
   - How to create `hd_action_key` custom dimension in GA4 Property 339826228
   - Event scope vs user scope (event scope for action tracking)
   - Testing and validation steps
   
2. **Shopify Web Pixel Integration**:
   - How Shopify's native GA4 already sends purchase/add_to_cart events
   - How to piggyback on existing events with custom dimensions
   - Code snippets for Web Pixel implementation

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Setup guide created (200+ lines), ✅ Analytics can implement

---

**Total Assigned**: 3 hours supporting Content and Analytics  
**Priority**: P1-P2  
**Start**: SEO-023 (immediate), SEO-022 (when Content has output)

---

## 🔧 MCP Tools: Context7 (first), Web search (PageSpeed API only)
## 🚨 Evidence: JSONL + heartbeat required
