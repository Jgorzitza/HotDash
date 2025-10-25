# ADS Launch Campaign Calendar & Approvals Plan

**Task:** ADS-CAMPAIGN-CALENDAR  
**Owner:** ads  
**Last Updated:** 2025-10-25  

---

## 1. Calendar Overview (Weeks -2 through +2)

| Date Range           | Focus                               | Channels Activated                         | Primary Owner | Dependencies                                |
| -------------------- | ----------------------------------- | ------------------------------------------ | ------------- | -------------------------------------------- |
| Week -2 (Oct 24-30)  | Finalize assets & tracking          | None (prep only)                           | Ads           | Analytics validation, design final assets    |
| Week -1 (Oct 31-Nov 6)| Load campaigns & secure approvals  | Google Ads (paused), Meta (paused), LinkedIn (paused), Email staging | Ads | CEO approval on briefs, creative QA          |
| Launch Day (Nov 7)   | Go-live & announce                  | Google Search, Meta awareness, Email launch, Content blog | Ads + Content | CEO go signal, analytics monitoring in place  |
| Launch Week (Nov 7-13)| Optimize & iterate                 | Paid social retargeting, LinkedIn conversation ads, nurture emails | Ads | Performance data from analytics               |
| Week +1 (Nov 14-20)  | Scale performers & release case study teaser | Email nurture, content how-to guides, remarketing expansions | Ads + Content | Case study draft, analytics reports           |
| Week +2 (Nov 21-27)  | Sustained optimization              | A/B tests on creatives, retargeting variants, newsletter feature | Ads | Updated creative assets, analytics insights   |

---

## 2. Detailed Campaign Timeline

| Date        | Milestone                                         | Owner        | Dependencies / Notes                                  |
| ----------- | ------------------------------------------------- | ------------ | ----------------------------------------------------- |
| Oct 28 (Mon)| Tracking QA complete (UTMs, GA4, CRM)             | Analytics    | Reference docs/ads/ADS-TRACKING-TEST-MATRIX.md        |
| Oct 29 (Tue)| Creative handoff + QA screenshots                 | Design       | Checklist in docs/ads/ADS-CREATIVE-CHECKLIST.md       |
| Oct 31 (Thu)| CEO approval request submitted via `/admin/marketing/approvals` | Ads | Evidence: briefs, creatives, tracking docs            |
| Nov 1 (Fri) | Email launch sequence loaded (paused)             | Email Ops    | QA tests, fallbacks validated                         |
| Nov 4 (Mon) | Final go/no-go sync with CEO + Analytics          | Ads          | Confirm alerts configured, budgets locked             |
| Nov 7 (Thu) | Launch activation (09:00 PT)                      | Ads          | Live monitoring from analytics dashboard              |
| Nov 7 (Thu) | Launch announcement email + blog publish          | Email + Content | Copy & links verified                                 |
| Nov 8 (Fri) | Daily stabilization review (spend, CPL, pixel)    | Ads + Analytics | Adjust bids, pause underperforming creatives        |
| Nov 11 (Mon)| LinkedIn conversation ad live                     | Ads          | Conversation flow approved, UTMs verified             |
| Nov 14 (Thu)| Post-launch report v1 + retargeting expansion     | Ads + Analytics | Share summary with CEO & stakeholders               |
| Nov 18 (Mon)| Case study teaser distribution                    | Content      | Case study draft ready, CTA aligned                   |
| Nov 21 (Thu)| Rollback readiness check (see Section 5)          | Ads + Support | Rehearse communications if metrics fall below thresholds |

---

## 3. Owners & Dependencies Matrix

| Workstream      | Primary Owner | Supporting Teams        | Dependencies                                  |
| --------------- | ------------- | ----------------------- | ---------------------------------------------- |
| Paid Media      | Ads           | Design, Analytics       | Creative assets, tracking validation           |
| Email           | Ads + Email Ops | Design, Support      | ESP QA, deliverability checks                  |
| Content         | Content       | Ads, Design             | Calendar alignment, video/script approvals     |
| Analytics       | Analytics     | Ads, RevOps             | GTM/GA4 setup, CRM field mappings              |
| Approvals       | Ads           | CEO, Design, Analytics  | `/admin/marketing/approvals` workflow          |
| Support/Success | Support       | Ads                     | Prepared responses for launch communications   |

---

## 4. Approvals Flow

1. **Draft Creation:** Ads agent prepares briefs/assets (stored under `docs/marketing/` & `assets/marketing/...`).  
2. **Internal QA:** Design verifies specs; Analytics verifies UTMs/pixels; results captured in artifacts.  
3. **Submission:** Ads agent submits items via `/admin/marketing/approvals` route (see seeded entries).  
4. **CEO Review:** CEO reviews, adds notes, approves/rejects. Status updates logged automatically (per approvals UI).  
5. **Activation:** Only approved items move to activation; status “applied” recorded when assets live.  
6. **Post-Launch Review:** Daily check-ins; updates logged via `logDecision()` and analytics dashboards.

Approvals checkpoint dates:
- Oct 31: Full launch pack approval.
- Nov 6: Final go/no-go.
- Nov 14: Post-launch progress review.

---

## 5. Rollback Communication Templates

### Scenario A: Budget Pause / Spend Overrun
```
Subject: [ACTION REQUIRED] ADS Launch Spend Pause

Hi team,

We’ve hit the spend threshold of $X (80% of allocated budget) within Y days. Campaigns are now paused while we review allocations. Analytics is investigating conversion efficiency, and we’ll share an updated budget plan by <date>.

Next steps:
- Analytics: provide ROAS diagnostics within 4 hours.
- Ads: prep revised bid strategy and creative rotation.
- Support: ready responses for customer inquiries referencing promotional messaging.

Thanks,
Ads Team
```

### Scenario B: Tracking Failure
```
Subject: Urgent: Tracking Signal Loss Detected

Team,

Analytics flagged missing GA4 events for campaign `launch2025_meta`. We are pausing paid social traffic until tracking integrity is restored. Root cause appears to be <issue>. New test links will be validated against docs/ads/ADS-TRACKING-TEST-MATRIX.md.

Actions:
- Analytics: confirm fix completion and share QA screenshots.
- Ads: keep campaigns paused until green light from Analytics.
- Support/Content: hold any pending comms referencing the affected campaign.

We’ll send an update within 60 minutes.
```

### Scenario C: Messaging Adjustment
```
Subject: Update: HotDash Launch Messaging Adjustment

Hello all,

Following feedback from CEO, we’re updating launch messaging to emphasize “human-reviewed AI”. All creatives and copy will be refreshed per docs/ads/ADS-CREATIVE-CHECKLIST.md. Campaigns remain live; new assets will rotate in over the next 6 hours.

Tasks:
- Design: deliver revised assets by <time>.
- Ads: swap creatives in Meta/LinkedIn once uploaded.
- Content/Email: update headlines in scheduled sends.

We’ll confirm once all channels are aligned.
```

---

## 6. Monitoring & Reporting Cadence

- **Daily 09:30 PT:** Launch war-room check-in (spend, CPL, tracking).  
- **Daily 17:00 PT:** Slack digest with key metrics and actions taken.  
- **Weekly Monday:** Full performance recap + next week adjustments.  
- **Alert thresholds:** automated Slack alerts on spend, conversion drops, tracking outages (configured in analytics plan).

---

**Evidence:** This calendar document (`docs/ads/ADS-CAMPAIGN-CALENDAR.md`). Update as schedules shift; log significant changes via `logDecision()`.
