# SEO Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 4.0

## Objective

**Issue**: #115 ✅ COMPLETE  
All tasks complete - ready for SEO integration support

## Current Status

All tasks ✅, 43/43 tests ✅, SEO triage doc ✅ (528 lines)

## Tasks

### SUPPORTIVE WORK (30 min) - SEO Integration Planning

**SEO-SUPPORT-001**: Dashboard SEO Tile Enhancement Plan (20 min)
1. Review current SEO tile implementation
2. Document enhancements for Option A:
   - Real-time anomaly alerts
   - Keyword ranking trends (visual)
   - Web vitals dashboard
   - Crawl error monitoring
3. Create `docs/runbooks/seo_tile_enhancements.md`
4. Include: Data requirements, UI components needed
5. Save for Engineer reference

**SEO-SUPPORT-002**: GA4 Integration Verification (10 min)
1. Verify Google Analytics integration working
2. Test SEO metrics API endpoint
3. Document any gaps
4. Report status

### STANDBY - Ready for SEO Work

- Support Engineer with SEO tile enhancements
- Answer questions about anomaly detection
- Provide GA4 query examples
- Validate SEO data accuracy

## Work Complete

✅ SEO anomaly triage doc (528 lines)  
✅ HITL workflows (4 triage types)  
✅ Keyword cannibalization prevention  
✅ 43/43 tests passing  
✅ All documentation complete

## Constraints

**Tools**: curl, npm  
**Budget**: ≤ 45 min  
**Paths**: docs/runbooks/**, feedback/seo/**

## Links

- Previous work: feedback/seo/2025-10-20.md (all complete)
- Triage doc: docs/specs/seo_anomaly_triage.md
- Tests: tests/unit/seo.anomalies.spec.ts, seo.rankings.spec.ts

## Definition of Done

- [ ] SEO tile enhancement plan created
- [ ] GA4 integration verified
- [ ] Ready for Engineer coordination
