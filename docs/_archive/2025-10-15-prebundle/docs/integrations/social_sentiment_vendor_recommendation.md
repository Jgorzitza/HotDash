---
epoch: 2025.10.E1
doc: docs/integrations/social_sentiment_vendor_recommendation.md
owner: integrations
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Social Sentiment Vendor Recommendation — 2025-10 Sprint

## Summary
- **Decision:** Proceed with a Hootsuite-powered proof of concept (POC) while we secure pricing concessions and confirm API coverage; maintain a parallel path to native X + Meta APIs as a contingency for higher-volume campaigns.
- **Rationale:** Hootsuite delivers multi-platform sentiment analysis out-of-the-box, reducing integration time by ~3 weeks and avoiding custom NLP build-out outlined in `docs/marketing/social_sentiment_integration_plan.md`. Native APIs remain strategically important for long-term cost control and data ownership.
- **Stakeholder alignment:** Marketing favors rapid sentiment signal delivery for campaign monitoring; Reliability requires clear rate-limit + alerting guarantees; Compliance needs DPA terms covering EU data residency.

## Vendor Comparison Snapshot
| Dimension | Hootsuite (Shopify App) | Native APIs (X Premium + Meta Graph) |
| --- | --- | --- |
| **Coverage** | X, Facebook, Instagram, LinkedIn, TikTok via a single API | Requires stitching X + Meta (Instagram/Facebook); LinkedIn unavailable without additional partnership |
| **Sentiment Analysis** | Built-in classifier + anomaly alerts | Requires third-party NLP (e.g., AWS Comprehend) or manual model |
| **Time-to-Integrate** | 1-2 weeks (OAuth via Shopify App + typed client wrapper) | 4-6 weeks (OAuth flows, webhook handling, NLP pipeline, rate-limit management) |
| **Monthly Cost (est.)** | $99 Professional tier (one seat) | ~$100 (X Premium) + infra costs for NLP + maintenance |
| **Rate Limits** | Vendor-managed; SLA required (target ≥10 req/sec burst) | X Premium: 1M tweets/month; Meta: 200 calls/hour/user without Business verification |
| **Data Ownership** | Limited to data returned by Hootsuite API; subject to vendor retention policies | Direct access (subject to platform ToS); full control over storage/retention |
| **Engineering Effort** | Low — typed wrapper + fallback handling | High — separate clients, storage, NLP, monitoring |
| **Risk Profile** | Vendor lock-in, dependency on Shopify app availability | Higher ongoing maintenance, compliance with multiple platform policies |

## Recommendation & Next Steps
1. **Launch POC on Hootsuite**
   - Build typed client in `packages/integrations/social/hootsuiteClient.ts` with sentiment + mention fetch methods.
   - Coordinate with Reliability to define rate-limit guardrails (alert at 80% of vendor limits; integrate with `docs/data/data_quality_monitoring.md`).
   - Instrument fallback to mock sentiment data to preserve dashboard continuity if Hootsuite API degrades.
2. **Negotiate Contract Terms**
   - Request Professional tier discount for single-store usage; ensure SLA references HotDash outage credits.
   - Confirm data retention window (target ≤90 days) and ability to purge data upon request.
   - Verify vendor provides DPAs covering EU/UK processors; escalate gaps to Compliance.
   - Track deliverables in `docs/integrations/hootsuite_contract_checklist.md` and package evidence for Compliance by 2025-10-09.
3. **Plan Native API Track (Contingency)**
   - Marketing to prepare budget estimate for X Premium + AWS Comprehend if Hootsuite cost scales beyond $250/month.
   - Reliability to prototype rate-limit monitoring scripts for X + Meta (re-usable even within Hootsuite fallback scenario).
   - Integrations to maintain contract requirements for native APIs (OAuth scopes, webhook URLs) so we can pivot within one sprint if vendor access changes.

## Contract Considerations
### Hootsuite
- **Agreements:** Shopify App Terms + Hootsuite Enterprise Agreement; request security addendum covering SOC2 & GDPR posture.
- **Compliance Hooks:** Ensure DPIA lists Hootsuite as processor; audit log export cadence (weekly) retained in `artifacts/vendors/hootsuite/`.
- **Access Control:** Limit OAuth scope to required read-only sentiment endpoints; rotate app token every 90 days (align with secret rotation plan).
- **Support SLAs:** Seek 99.5% uptime commitment with 4-hour critical response; add clause requiring 30-day notice before API breaking changes.

### Native APIs
- **X Premium:** Requires detailed use case submission; ensure monitoring of elevated rate limits to avoid automated suspension. Contract must address content moderation obligations and storage retention (<30 days for tweets if user deletes content).
- **Meta Graph:** Business Verification necessary for advanced metrics; platform policy requires public privacy policy + user deletion endpoint (coordinate with Product/Legal).
- **NLP Add-on:** If AWS Comprehend is used, confirm cost center + data residency (us-east-1) meet compliance expectations; create data destruction workflow for sentiment artifacts older than 180 days.

## Alignment Log
| Date | Stakeholder | Summary | Follow-up |
| --- | --- | --- | --- |
| 2025-10-07 | Madison Lee (Marketing PM) | Reviewed POC scope; marketing approved Hootsuite-first plan due to time-to-insight. | Provide vendor contract draft by 2025-10-09. |
| 2025-10-07 | Arturo Vega (Reliability) | Confirmed need for explicit rate-limit metrics + alert thresholds before production. | Send proposed monitoring spec once Hootsuite API docs received. |
| 2025-10-07 | Casey Lin (Compliance) | Requested vendor DPIA inputs (Data categories, storage region, subcontractors). | Deliver questionnaire summary with contract packet. |
| 2025-10-08 | Casey Lin (Compliance) | Scheduled DPIA review for 2025-10-09 16:00 UTC; awaiting evidence bundle. | Share artifact package prior to meeting. |
| 2025-10-08 | Arturo Vega (Reliability) | Booked sentiment monitoring sync for 2025-10-09 17:00 UTC (pending vendor rate-limit doc). | Draft monitoring agenda once documentation arrives. |

## Open Questions
- Awaiting Hootsuite API rate-limit documentation; requested from vendor support (ticket HS-44721).
- Need Shopify App security review template—check with Security agent if previous app assessments exist.
- Confirm whether marketing requires LinkedIn coverage in POC or can defer to Phase 2B.

## Reporting Commitments
- Publish POC readiness update in `feedback/integrations.md` once contract terms finalized.
- Capture contract artifacts under `docs/integrations/vendor_contracts/hootsuite/` (create folder post-signature).
- Revisit recommendation during 2025-10-14 sprint planning with adoption metrics and vendor response times.
