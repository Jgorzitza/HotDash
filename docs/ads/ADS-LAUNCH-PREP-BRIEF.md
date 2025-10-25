# ADS Launch Prep — Campaign Brief & Tracking Plan

**Task:** ADS-LAUNCH-PREP  
**Owner:** ads  
**Last Updated:** 2025-10-25  

---

## 1. Channel Overview

| Channel        | Objective                          | Primary Audiences                                         | Key Messaging                                                   | Launch Deliverables                                             |
| -------------- | ---------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Google Search  | Capture high-intent operators      | Shopify ops managers, CX leads, growth directors           | “Automate Shopify operations with human-reviewed AI”            | Responsive search ads (inventory + CX themes), sitelinks, callouts |
| Paid Social    | Build awareness & capture leads    | Meta lookalikes, LinkedIn operations execs, X DTC audience | “One control center for inventory, CX, and growth approvals”    | Meta carousel/video, LinkedIn single image & conversation ad, X launch teasers |
| Email          | Convert warm list & onboard trials | Existing subscribers, partner lists, launch registrants    | “Launch confidently with AI that keeps you in control”          | 5-email launch & nurture sequence (announcement + feature spotlights) |
| Content        | Educate & support sales enablement | Ops teams researching automation, Shopify partners         | “Human-in-the-loop AI for Shopify operations”                   | Launch blog, inventory & CX how-to guides, downloadable playbook, case study outline |

---

## 2. Campaign Brief Links

- Google Ads plan: `docs/marketing/google-ads/CAMPAIGN_PLAN.md`
- Paid social plan: `docs/marketing/social-media/CAMPAIGN_PLAN.md`
- Email campaign plan: `docs/marketing/email/CAMPAIGN_PLAN.md`
- Content calendar: `docs/marketing/content/CONTENT_CALENDAR.md`
- Analytics tracking plan: `docs/marketing/analytics/TRACKING_PLAN.md`

All assets (copy, creative notes, video scripts) are stored under `assets/marketing/ADS-LAUNCH-001/`.

---

## 3. UTM Structure

**Base landing URL:** `https://hotrodan.com/hotdash`

| Channel    | utm_source  | utm_medium       | utm_campaign      | utm_content                         | Example Link                                                                 |
| ---------- | ----------- | ---------------- | ----------------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| Google Ads | google      | cpc              | launch2025_search | `{adgroup}_{headline}`              | `https://hotrodan.com/hotdash/trial?utm_source=google&utm_medium=cpc&utm_campaign=launch2025_search&utm_content=inventory_automation_headline1` |
| Meta       | meta        | paid_social      | launch2025_meta   | `{placement}_{creative}`            | `https://hotrodan.com/hotdash?utm_source=meta&utm_medium=paid_social&utm_campaign=launch2025_meta&utm_content=feed_video_ai_control` |
| LinkedIn   | linkedin    | paid_social      | launch2025_linkedin| `{persona}_{format}`               | `https://hotrodan.com/hotdash/demo?utm_source=linkedin&utm_medium=paid_social&utm_campaign=launch2025_linkedin&utm_content=opsdirector_singleimage` |
| X          | twitter     | paid_social      | launch2025_x      | `{tweet_variation}`                 | `https://hotrodan.com/hotdash?utm_source=twitter&utm_medium=paid_social&utm_campaign=launch2025_x&utm_content=teaser_variation1` |
| Email      | email       | email            | launch2025_email  | `{sequence}_{step}`                 | `https://hotrodan.com/hotdash/trial?utm_source=email&utm_medium=email&utm_campaign=launch2025_email&utm_content=feature_series_step2` |
| Content    | content     | organic_content  | launch2025_content| `{asset}_{cta}`                     | `https://hotrodan.com/hotdash?utm_source=content&utm_medium=organic_content&utm_campaign=launch2025_content&utm_content=inventory_playbook_cta` |

**Governance Notes**
- Use lowercase parameters.
- Replace placeholders with specific creative identifiers.
- For lead forms (Meta/LinkedIn), ensure CRM mapping includes `utm_campaign`.

---

## 4. Dependencies & Coordination

| Area                     | Dependency Owner | Requirement                                                         | Status |
| ------------------------ | ---------------- | ------------------------------------------------------------------- | ------ |
| Server-side tagging      | Analytics        | Confirm GTM server container capturing new campaign UTMs            | Pending |
| GA4 conversion mapping   | Analytics        | Map new UTMs to trial/demo goals; verify reporting views             | Pending |
| CRM attribution          | Analytics/RevOps | Ensure HubSpot fields capture `utm_*` parameters from paid social   | Pending |
| Creative QA              | Design           | Provide final asset filenames to keep aligned with UTM `utm_content`| Pending |

Coordination touch-point: daily launch standup (`#launch-ops` channel) + analytics sync Day -5.

---

## 5. Next Steps Checklist

- [x] Publish briefing document and UTM plan.
- [ ] Meet with Analytics to validate tracking (ensure Segment/Fivetran jobs updated).
- [ ] Confirm creative asset naming matches UTM `utm_content` values.
- [ ] Schedule QA review for campaign links before launch activation.

---

**Evidence:** This document (`docs/ads/ADS-LAUNCH-PREP-BRIEF.md`) + asset references within allowed paths.
