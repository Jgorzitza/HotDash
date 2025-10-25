# ADS Tracking Test Matrix & Test Links

**Task:** ADS-TRACKING-TEST-MATRIX  
**Owner:** ads  
**Last Updated:** 2025-10-25  

---

## 1. Test Scenarios Overview

| Scenario ID | Channel        | Persona / Placement                  | URL Target                                        | Expected Primary Goal | Notes                                   |
| ----------- | -------------- | ------------------------------------ | ------------------------------------------------- | --------------------- | --------------------------------------- |
| GGL-SRCH-01 | Google Search  | Inventory Automation RSA             | `/hotdash/trial`                                  | Trial signup          | Inventory copy variation 1              |
| GGL-SRCH-02 | Google Search  | CX Automation RSA                    | `/hotdash/cx`                                     | Demo request          | CX messaging variation                  |
| META-AWR-01 | Meta Paid      | Feed Video – Ops Manager Lookalike   | `/hotdash`                                        | Landing engagement    | Includes pixel + CAPI                   |
| META-LEAD-01| Meta Lead Gen  | Lead form – Playbook offer           | `/hotdash/playbook` (form thank-you redirect)     | Lead submission       | Validate hidden UTM fields via webhook  |
| LNK-SPO-01  | LinkedIn       | Sponsored Content – Ops Director     | `/hotdash/demo`                                   | Demo request          | Lead gen form mapping to HubSpot        |
| LNK-CONV-01 | LinkedIn       | Conversation Ad                      | `/hotdash/launch-toolkit`                         | Toolkit download      | Check conversation template link        |
| X-TEASER-01 | X (Twitter)    | Promoted Tweet – DTC Audience        | `/hotdash`                                        | Site visit            | Validate GA realtime event              |
| EMAIL-LA-01 | Email          | Launch Announcement (HTML + plaintext)| `/hotdash/trial`                                 | Trial signup          | Validate ESP link rewrites              |
| EMAIL-FTR-02| Email Nurture  | Feature Series Step 2                | `/hotdash/inventory`                              | Feature engagement    | Check appended query parameters         |
| CONTENT-BLG-01 | Content     | Launch Blog CTA                      | `/hotdash/trial`                                  | Trial signup          | Organic UTM expected                    |

---

## 2. UTM Parameter Expectations

| Scenario ID   | utm_source | utm_medium      | utm_campaign         | utm_content                       | utm_term                    |
| ------------- | ---------- | --------------- | -------------------- | --------------------------------- | --------------------------- |
| GGL-SRCH-01   | google     | cpc             | launch2025_search    | inventory_automation_headline1    | inventory management ai     |
| GGL-SRCH-02   | google     | cpc             | launch2025_search    | cx_automation_headline2           | ai customer support         |
| META-AWR-01   | meta       | paid_social     | launch2025_meta      | feed_video_ai_control             | (blank)                     |
| META-LEAD-01  | meta       | paid_social     | launch2025_meta      | leadform_playbook_ops             | (blank)                     |
| LNK-SPO-01    | linkedin   | paid_social     | launch2025_linkedin  | opsdirector_singleimage           | (blank)                     |
| LNK-CONV-01   | linkedin   | paid_social     | launch2025_linkedin  | conversation_demo_invite          | (blank)                     |
| X-TEASER-01   | twitter    | paid_social     | launch2025_x         | teaser_variation1                 | (blank)                     |
| EMAIL-LA-01   | email      | email           | launch2025_email     | launch_announcement_step1         | (blank)                     |
| EMAIL-FTR-02  | email      | email           | launch2025_email     | feature_series_step2              | (blank)                     |
| CONTENT-BLG-01| content    | organic_content | launch2025_content   | launch_blog_cta_trial             | (blank)                     |

---

## 3. Pre-Generated Test Links

1. **Google Search – Inventory RSA**  
   `https://hotrodan.com/hotdash/trial?utm_source=google&utm_medium=cpc&utm_campaign=launch2025_search&utm_content=inventory_automation_headline1&utm_term=inventory%20management%20ai`

2. **Google Search – CX RSA**  
   `https://hotrodan.com/hotdash/cx?utm_source=google&utm_medium=cpc&utm_campaign=launch2025_search&utm_content=cx_automation_headline2&utm_term=ai%20customer%20support`

3. **Meta Feed Video**  
   `https://hotrodan.com/hotdash?utm_source=meta&utm_medium=paid_social&utm_campaign=launch2025_meta&utm_content=feed_video_ai_control`

4. **Meta Lead Form Redirect**  
   `https://hotrodan.com/hotdash/playbook?utm_source=meta&utm_medium=paid_social&utm_campaign=launch2025_meta&utm_content=leadform_playbook_ops`

5. **LinkedIn Sponsored Content**  
   `https://hotrodan.com/hotdash/demo?utm_source=linkedin&utm_medium=paid_social&utm_campaign=launch2025_linkedin&utm_content=opsdirector_singleimage`

6. **LinkedIn Conversation Ad**  
   `https://hotrodan.com/hotdash/launch-toolkit?utm_source=linkedin&utm_medium=paid_social&utm_campaign=launch2025_linkedin&utm_content=conversation_demo_invite`

7. **X Promoted Tweet**  
   `https://hotrodan.com/hotdash?utm_source=twitter&utm_medium=paid_social&utm_campaign=launch2025_x&utm_content=teaser_variation1`

8. **Email Launch Announcement**  
   `https://hotrodan.com/hotdash/trial?utm_source=email&utm_medium=email&utm_campaign=launch2025_email&utm_content=launch_announcement_step1`

9. **Email Feature Series Step 2**  
   `https://hotrodan.com/hotdash/inventory?utm_source=email&utm_medium=email&utm_campaign=launch2025_email&utm_content=feature_series_step2`

10. **Content Blog CTA**  
    `https://hotrodan.com/hotdash/trial?utm_source=content&utm_medium=organic_content&utm_campaign=launch2025_content&utm_content=launch_blog_cta_trial`

---

## 4. Validation Steps (per scenario)

1. **Launch GA4 DebugView** and filter on `utm_campaign` for the scenario.
2. **Load the test link in an incognito window** (disable browser extensions).
3. **Confirm GA4 events:**  
   - `page_view` contains the expected `session_source`, `session_medium`, `campaign`.  
   - Verify any custom parameters (e.g., `creative_name` mapped from `utm_content` via GTM server rules).
4. **Check landing page:**  
   - URL query string persists (no redirects stripping UTM).  
   - For email, confirm ESP rewrites keep UTM parameters intact.
5. **Log results** in analytics QA sheet (Analytics owner will provide shared sheet).

Additional checks:
- Paid social scenarios: confirm Meta Pixel & CAPI duplicate suppression (matching event IDs).  
- LinkedIn lead gen: ensure CRM record captures `utm_campaign`, `utm_content`.  
- Email: verify both HTML and plaintext versions carry identical UTMs.

---

## 5. Coordination & Follow-ups

- **Analytics Team:** Share this matrix and align on validation schedule; request GA4 audience segments for each campaign to monitor.  
- **RevOps / CRM:** Confirm hidden fields for lead forms ingest `utm_*` fields.  
- **Design / Creative:** Align naming conventions with `utm_content` values to ensure reporting consistency.  
- **Automation:** Ensure Segment/Fivetran sync jobs capture the new campaign parameters for BI dashboards.

---

**Evidence:** This document (`docs/ads/ADS-TRACKING-TEST-MATRIX.md`) plus test links above. Append validation results to shared analytics QA sheet post-testing.
