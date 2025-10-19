# Ads Agent - Proposed Next 40 Tasks
**Date**: 2025-10-19T03:40:00Z
**Status**: Proposed for Manager Approval

## Tier 1: API Integration & Data Layer (P0 - Immediate Value)

1. **Create app/routes/api.ads.campaigns.$id.ts** | reason: Single campaign detail endpoint | benefit: Enable campaign drill-down UI | alignment: North Star live metrics | no-collision: true | paths: ^app/routes/api\.ads\..*$

2. **Create app/routes/api.ads.campaigns.$id.pause.ts** | reason: Pause campaign API | benefit: Enable HITL pause approval workflow | alignment: North Star HITL actions | no-collision: true | paths: ^app/routes/api\.ads\..*$

3. **Create app/routes/api.ads.campaigns.$id.budget.ts** | reason: Budget update API | benefit: Enable HITL budget change workflow | alignment: North Star approvals loop | no-collision: true | paths: ^app/routes/api\.ads\..*$

4. **Create app/services/ads/sync.service.ts** | reason: Platform data sync orchestration | benefit: Automated metrics refresh | alignment: North Star data jobs | no-collision: true | paths: ^app/services/ads/.*$

5. **Create app/services/ads/alerts.service.ts** | reason: Campaign performance alerts | benefit: Proactive notification of issues | alignment: North Star operational resilience | no-collision: true | paths: ^app/services/ads/.*$

6. **Create app/lib/ads/data-sources/meta.real.ts** | reason: Real Meta API implementation | benefit: Ready for production credentials | alignment: North Star tool-first | no-collision: true | paths: ^app/lib/ads/.*$

7. **Create app/lib/ads/data-sources/google.real.ts** | reason: Real Google Ads implementation | benefit: Ready for production credentials | alignment: North Star tool-first | no-collision: true | paths: ^app/lib/ads/.*$

8. **Create app/lib/ads/publer-adapter.real.ts** | reason: Real Publer API implementation | benefit: Enable actual social posting | alignment: North Star HITL posting | no-collision: true | paths: ^app/lib/ads/.*$

## Tier 2: Testing & Quality (P0 - Launch Blockers)

9. **Create tests/unit/ads/approvals.spec.ts** | reason: Test approval request generation | benefit: Verify HITL data structures | alignment: North Star quality | no-collision: true | paths: ^tests/unit/ads/.*$

10. **Create tests/unit/ads/impact-metrics.spec.ts** | reason: Test impact calculation | benefit: Verify Supabase row transforms | alignment: North Star quality | no-collision: true | paths: ^tests/unit/ads/.*$

11. **Create tests/unit/ads/publer-adapter.spec.ts** | reason: Test Publer integration | benefit: Verify social posting logic | alignment: North Star quality | no-collision: true | paths: ^tests/unit/ads/.*$

12. **Create tests/unit/ads/meta-stub.spec.ts** | reason: Test Meta stub functionality | benefit: Verify stub mode accuracy | alignment: North Star quality | no-collision: true | paths: ^tests/unit/ads/.*$

13. **Create tests/unit/ads/google-stub.spec.ts** | reason: Test Google stub functionality | benefit: Verify stub mode accuracy | alignment: North Star quality | no-collision: true | paths: ^tests/unit/ads/.*$

14. **Create tests/integration/ads-api.spec.ts** | reason: Test API routes end-to-end | benefit: Verify request/response flow | alignment: North Star quality | no-collision: true | paths: ^tests/integration/.*$

15. **Create tests/unit/services/ads/campaign.service.spec.ts** | reason: Test campaign service layer | benefit: Verify business logic | alignment: North Star quality | no-collision: true | paths: ^tests/unit/services/.*$

16. **Create tests/unit/services/ads/metrics.service.spec.ts** | reason: Test metrics service layer | benefit: Verify aggregation logic | alignment: North Star quality | no-collision: true | paths: ^tests/unit/services/.*$

17. **Add CampaignMetricsTile unit test** | reason: Test component rendering | benefit: Verify UI states (loading/error/data) | alignment: North Star quality | no-collision: true | paths: ^tests/unit/components/.*$

## Tier 3: Documentation & Developer Experience (P1)

18. **Create app/lib/ads/README.md** | reason: Document ads module usage | benefit: Developer onboarding | alignment: Developer experience | no-collision: true | paths: ^app/lib/ads/.*$

19. **Add JSDoc examples to all exported functions** | reason: Inline documentation | benefit: IDE autocomplete guidance | alignment: Developer experience | no-collision: true | paths: ^app/lib/ads/.*$

20. **Create docs/specs/ads_api_contracts.md** | reason: API contract documentation | benefit: Frontend integration guide | alignment: North Star tool-first | no-collision: true | paths: ^docs/specs/.*$

21. **Create docs/runbooks/ads_deployment.md** | reason: Deployment checklist | benefit: Safe production rollout | alignment: North Star governed delivery | no-collision: true | paths: ^docs/runbooks/.*$

22. **Create docs/runbooks/ads_troubleshooting.md** | reason: Common issues guide | benefit: Faster incident resolution | alignment: North Star operational resilience | no-collision: true | paths: ^docs/runbooks/.*$

## Tier 4: Monitoring & Observability (P1)

23. **Create app/lib/ads/monitoring.ts** | reason: Metrics instrumentation | benefit: Performance tracking | alignment: North Star observability | no-collision: true | paths: ^app/lib/ads/.*$

24. **Add performance logging to API routes** | reason: Track response times | benefit: SLA monitoring | alignment: North Star P95 < 3s | no-collision: true | paths: ^app/routes/api\.ads\..*$

25. **Create app/services/ads/audit.service.ts** | reason: Audit trail for campaigns | benefit: Track all changes | alignment: North Star audit step | no-collision: true | paths: ^app/services/ads/.*$

26. **Add error tracking to all ads modules** | reason: Capture failures | benefit: Improve error rates | alignment: North Star < 0.5% error rate | no-collision: true | paths: ^app/lib/ads/.*$

## Tier 5: Advanced Features (P2)

27. **Create app/lib/ads/recommendations.ts** | reason: AI-powered campaign suggestions | benefit: Proactive optimization | alignment: North Star agent suggestions | no-collision: true | paths: ^app/lib/ads/.*$

28. **Create app/lib/ads/budget-optimizer.ts** | reason: Budget allocation logic | benefit: Maximize ROAS across campaigns | alignment: North Star operational efficiency | no-collision: true | paths: ^app/lib/ads/.*$

29. **Create app/lib/ads/anomaly-detection.ts** | reason: Detect performance anomalies | benefit: Early warning system | alignment: North Star SEO/ads anomalies | no-collision: true | paths: ^app/lib/ads/.*$

30. **Create app/lib/ads/forecasting.ts** | reason: Predict campaign performance | benefit: Better budget planning | alignment: North Star projected impact | no-collision: true | paths: ^app/lib/ads/.*$

31. **Create app/lib/ads/attribution.ts** | reason: Multi-touch attribution | benefit: Understand customer journey | alignment: North Star analytics depth | no-collision: true | paths: ^app/lib/ads/.*$

32. **Create app/routes/api.ads.recommendations.ts** | reason: Recommendations API | benefit: Surface optimization suggestions | alignment: North Star suggestions step | no-collision: true | paths: ^app/routes/api\.ads\..*$

33. **Create app/routes/api.ads.alerts.ts** | reason: Alerts configuration API | benefit: Manage alert thresholds | alignment: North Star operational resilience | no-collision: true | paths: ^app/routes/api\.ads\..*$

## Tier 6: Integration Points (P2 - Requires Coordination)

34. **Create app/components/approvals/AdsCampaignApprovalCard.tsx** | reason: Specialized approval UI | benefit: Rich campaign approval display | alignment: North Star approvals drawer | no-collision: false | paths: requires approvals/designer coordination

35. **Add ads metrics to nightly rollup job** | reason: Daily aggregation | benefit: Historical trend analysis | alignment: North Star data jobs | no-collision: false | paths: requires data agent coordination

36. **Wire health check to ops dashboard** | reason: Centralized monitoring | benefit: Single pane of glass | alignment: North Star operational resilience | no-collision: false | paths: requires ops/support coordination

37. **Add CampaignMetricsTile to main dashboard** | reason: Visible metrics | benefit: CEO sees ads performance | alignment: North Star embedded excellence | no-collision: false | paths: requires dashboard/designer coordination

## Tier 7: Data & Analytics (P2)

38. **Create scripts/ads/sync-campaigns.mjs** | reason: CLI sync tool | benefit: Manual sync capability | alignment: North Star data jobs | no-collision: true | paths: ^scripts/ads/.*$

39. **Create scripts/ads/export-metrics.mjs** | reason: CSV export utility | benefit: External reporting | alignment: North Star data export | no-collision: true | paths: ^scripts/ads/.*$

40. **Create app/lib/ads/reporting.ts** | reason: Report generation | benefit: Weekly/monthly summaries | alignment: North Star metrics updated | no-collision: true | paths: ^app/lib/ads/.*$

## Evidence for Task Selection

**Why These 40 Tasks:**
1. Tiers 1-2 (tasks 1-17): Production readiness - API completeness, testing coverage
2. Tier 3 (tasks 18-22): Developer experience - documentation for handoff
3. Tier 4 (tasks 23-26): Operational excellence - monitoring per North Star SLAs
4. Tier 5 (tasks 27-33): Advanced intelligence - agent-powered optimization
5. Tier 6 (tasks 34-37): Integration - requires coordination (DO NOT AUTO-EXECUTE)
6. Tier 7 (tasks 38-40): Utilities - operational tooling

**Safe to Auto-Execute**: Tasks 1-33, 38-40 (36 tasks)
**Requires Coordination**: Tasks 34-37 (4 tasks) - flagged no-collision: false

**Alignment Matrix**:
- North Star: Live tiles → 8 tasks
- North Star: HITL workflow → 6 tasks
- North Star: Tool-first → 5 tasks
- North Star: Operational resilience → 7 tasks
- North Star: Governed delivery → 4 tasks
- North Star: Data jobs → 6 tasks
- North Star: Quality/Testing → 10 tasks

