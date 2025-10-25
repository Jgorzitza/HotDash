# Launch Timeline & Task Matrix — ADS-LAUNCH-001

**Launch Target:** TBD (assumed Week of 2025-11-07)  
**Prepared by:** Ads Agent  
**Status:** Pending CEO approval

---

## High-Level Phases

| Phase            | Window              | Goals |
| ---------------- | ------------------- | ----- |
| Planning         | Day -14 to Day -8   | Finalize strategy, budgets, and briefs; gather assets. |
| Production       | Day -7 to Day -1    | Build campaigns in-platform, load emails, prep content, QA tracking. |
| Launch Day       | Day 0               | Activate paid media, send announcement email, publish hero content, monitor KPIs hourly. |
| Stabilization    | Day 1 to Day 7      | Optimize bids, run A/B tests, publish feature spotlights, monitor pipeline health. |
| Growth Sprint    | Day 8 to Day 30     | Scale winning segments, launch nurture sequences, release case studies + webinars. |

---

## Detailed Task Matrix

| Date (Relative) | Owner        | Task                                                      | Dependencies                         | Status |
| --------------- | ------------ | --------------------------------------------------------- | ------------------------------------ | ------ |
| Day -14         | Ads          | Approvals UI seeded with campaigns + evidence             | `app/routes/admin.marketing.approvals.tsx` | Pending |
| Day -13         | Ads + Design | Finalize creative direction across Google/Social/Email    | Creative briefs uploaded             | Pending |
| Day -12         | Content      | Draft launch announcement blog + video script             | Content calendar approved            | Pending |
| Day -10         | Design       | Produce first creative proofs (display banners, social)   | Creative briefs signed off           | Pending |
| Day -9          | Analytics    | Configure GTM + server-side tagging                       | Tracking plan approved               | Pending |
| Day -8          | Ads          | Load Google Ads structure + draft keywords                | Budget approved                      | Pending |
| Day -7          | Ads          | Load paid social campaigns (paused)                       | Creative assets uploaded             | Pending |
| Day -6          | Email        | Build launch announcement + drip flows in Klaviyo         | Templates approved                   | Pending |
| Day -5          | Design       | Deliver motion assets (YouTube, social teaser)            | Video script approved                | Pending |
| Day -4          | Content      | Final QA on launch blog, schedule for Day 0               | Blog draft completed                 | Pending |
| Day -3          | Analytics    | Validate conversion tracking, UTMs, QA dashboards         | GTM configuration complete           | Pending |
| Day -2          | Ads          | Run full QA (links, tracking, creative) across platforms  | Campaigns loaded                     | Pending |
| Day -1          | CEO          | Final go/no-go approval via marketing approvals UI        | All evidence attached                | Pending |
| Day 0 (AM)      | Ads          | Activate Google Ads + Paid Social                         | CEO go signal                        | Pending |
| Day 0 (AM)      | Email        | Send launch announcement email                            | Final segmentation check             | Pending |
| Day 0 (Midday)  | Content      | Publish launch blog + social posts                        | Blog scheduled                       | Pending |
| Day 0 (PM)      | Analytics    | Hourly KPI updates to CEO + Slack alerts                  | Dashboards live                      | Pending |
| Day 1           | Ads          | Shift budget based on initial performance                 | Day 0 data                           | Pending |
| Day 3           | Content      | Publish Inventory how-to guide                            | Launch week learnings                | Pending |
| Day 7           | Ads          | Launch retargeting sequences                              | Site traffic thresholds met          | Pending |
| Day 14          | Content      | Publish first case study                                  | Customer interviews complete         | Pending |
| Day 30          | Ads + Analytics | Present post-launch ROI report                          | Data aggregated                      | Pending |

---

## Meeting Cadence

- **Daily Standup (Day -7 → Day +7):** 15 minutes, Ads + Content + Design + Analytics. Review blockers + approvals status.
- **CEO Checkpoint:** Day -10 (strategy), Day -3 (launch readiness), Day +7 (optimization review).
- **War Room Slack Channel:** `#launch-ops` for real-time updates, alert triage, and approvals coordination.

---

## Risk & Contingency Highlights

| Risk                        | Mitigation                                               | Owner |
| --------------------------- | -------------------------------------------------------- | ----- |
| Creative delays             | Lock briefs by Day -12; use modular templates for speed. | Design |
| Tracking inconsistencies    | Server-side tagging with QA checklist + anomaly alerts.  | Analytics |
| Budget overruns             | Automated spend alerts at 80%; manual review daily.      | Ads |
| Email deliverability issues | Warm IP 14 days prior; monitor bounce/unsubscribe daily. | Email |
| CEO availability conflicts  | Pre-schedule approval windows; provide async loom demos. | Ads |

---

**Next Step:** CEO to approve timeline in `/admin/marketing/approvals` → unlock execution tasks.
