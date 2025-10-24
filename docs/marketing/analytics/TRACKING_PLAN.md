# Launch Analytics & Tracking Plan

**Campaign:** HotDash Launch – Analytics & Attribution  
**Budget:** 5% of total marketing budget  
**Objective:** Provide full-funnel visibility, enable ROI optimization, support CEO decision-making  
**Timeline:** Pre-launch (-7 days) → Ongoing

---

## Tracking Architecture Overview

1. **Core Platforms**
   - **GA4** (primary web analytics) with enhanced measurement, server-side tagging.
   - **Looker Studio Dashboard** (executive reporting).
   - **HubSpot CRM** (lead + opportunity tracking).
   - **Ad Platform Pixels:** Google Ads, Meta (CAPI), LinkedIn Insight, X Pixel.

2. **Event Collection Flow**
   - Client-side events → GTM → Server-side GTM → GA4 / Ad platforms.
   - Product usage events (`trial_activated`, `approval_submitted`) → Segment → BigQuery → BI.

3. **Data Governance**
   - UTM taxonomy enforced via link builder tool.
   - Daily data validation checks with automated anomaly alerts.
   - PII never stored in marketing dashboards; hashed IDs only.

---

## UTM Framework

| Parameter    | Definition                             | Example                               |
| ------------ | --------------------------------------- | ------------------------------------- |
| `utm_source` | Origin platform                         | google, facebook, linkedin, email     |
| `utm_medium` | Channel type                            | cpc, paid_social, email, content      |
| `utm_campaign` | Campaign initiative                  | launch2025_search, launch2025_nurture |
| `utm_term`   | Keyword or audience (if applicable)     | inventory_management, ops_directors   |
| `utm_content`| Creative variant                        | video_aiworkflow, carousel_testimonial|

**Governance:** No campaign can launch without UTM QA; macro in Google Sheets auto-generates links.

---

## Conversion Events

### Primary Conversions
- `trial_signup` – value: $100 (initial LTV proxy)
- `demo_request` – value: $200
- `pricing_view` – micro-conversion
- `content_download` – qualifies lead score +10

### Product Milestones (from in-app telemetry)
- `shopify_store_connected`
- `first_approval_submitted`
- `inventory_alert_configured`
- `campaign_plan_exported`

### Revenue Events (from billing system)
- `subscription_started` (plan, MRR value)
- `subscription_upgraded`
- `subscription_cancelled`

All events mapped to GA4 custom events + CRM for closed-loop reporting.

---

## Dashboarding & Reporting

### Executive Dashboard (Daily)
- Channel spend vs budget (Google, Meta, LinkedIn, Email)
- Trials, demos, SQLs, customers by source
- CAC, ROAS, LTV:CAC ratio
- Pipeline velocity (lead → trial → customer)
- Launch day scorecard with hour-by-hour updates

### Channel Ops Dashboard (Real-time)
- Ad set performance, CPM/CPC trends
- Creative leaderboard
- Email deliverability and engagement
- Content engagement heatmap

### Attribution Dashboard (Weekly)
- Multi-touch model (Position-based default, compare with Data-Driven)
- Assisted conversions by channel
- Time lag to conversion distributions
- Cohort performance (launch week vs ongoing)

Dashboards built in Looker Studio; data sources: GA4, BigQuery, HubSpot, ad platform APIs.

---

## Implementation Checklist

1. **Pre-launch (-7 days)**
   - [ ] Configure GTM containers (web + server)
   - [ ] Validate GA4 property settings (currency USD, time zone PST)
   - [ ] Install Meta CAPI via server GTM
   - [ ] Connect LinkedIn Insight Tag, X Pixel
   - [ ] Sync CRM audiences to ad platforms

2. **Pre-launch (-3 days)**
   - [ ] Test all conversion events using GTM preview
   - [ ] QA UTM parameters across landing pages
   - [ ] Enable Google Ads auto-tagging
   - [ ] Configure custom dimensions (campaign_stage, persona)
   - [ ] Stand up Looker Studio dashboards with dummy data

3. **Launch Day**
   - [ ] Monitor real-time GA4 for traffic spikes/errors
   - [ ] Cross-check conversions in ad platforms vs GA4
   - [ ] Validate server-side events (no duplicates/drops)
   - [ ] Send hourly summary to CEO via Slack #launch-analytics

4. **Post-launch (Day 1–30)**
   - [ ] Daily anomaly detection (±30% variance triggers review)
   - [ ] Weekly data hygiene (remove spam referrals, bot traffic)
   - [ ] Update dashboards with commentary
   - [ ] Archive raw reports in `/artifacts/ads/<date>/analytics/`

---

## Alerting & Automation

- **Slack Alerts:** 
  - CAC > $1,000 for 48h  
  - Trial signup volume drop >25% vs 7-day avg  
  - Tracking outage (no events for 30 min)  
  - Email bounce rate >2%
- **Email Digests:** Daily exec summary at 6 PM PST.
- **Incident Response:** If tracking failure, pause spend >$5K/day until resolved.

---

## Tools & Integrations

- **Segment** for event forwarding & schema enforcement.
- **Fivetran** to sync ad spend into BigQuery nightly.
- **dbt** transformations to create marketing performance models.
- **Hightouch** reverse ETL to push LTV segments into ad platforms.
- **Supabase** stores decision logs, referenced for campaign approvals.

---

## Data Quality Governance

- Weekly schema review to ensure event naming consistency.
- Maintain data dictionary in shared Notion (link in admin dashboard).
- Access controls: marketing analyst (read/write), other agents read-only.
- Backups: BigQuery daily snapshots, Looker Studio version history.
- Compliance: GDPR/CCPA opt-out handling, cookie consent banner validated.

---

## CEO Approval Checklist

1. Tracking architecture diagram & documentation.
2. Conversion event definitions & values.
3. Dashboard mockups + reporting cadence.
4. Alert thresholds and escalation process.
5. Budget for analytics tooling (Segment, Fivetran, etc.).

Once approved, analytics configuration tasks scheduled via `/app/routes/admin.marketing.analytics.tsx`.

---

**Owner:** Ads Agent (analytics coordination)  
**Status:** Ready for implementation pending engineering support for server-side tagging  
**Next Action:** Partner with Analytics agent to finalize dashboard builds.

