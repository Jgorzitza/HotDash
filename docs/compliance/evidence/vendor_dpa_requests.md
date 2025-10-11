---
epoch: 2025.10.E1
doc: docs/compliance/evidence/vendor_dpa_requests.md
owner: compliance
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-21
---
# DPA / Data Residency Request Templates

## Google Analytics MCP
Subject: HotDash GA MCP – Request for DPA & Data Residency Confirmation

Hello Google Cloud Support,

HotDash (Shopify app) is preparing to move the Google Analytics MCP integration into production. To complete our GDPR/CCPA review we need:
1. The current Google Cloud Data Processing Addendum covering GA4 / MCP usage.
2. Confirmation of the data residency/processing regions applicable to our property (project `{{GA_PROPERTY_ID}}`).
3. A link to the current subprocessors list.

Please provide signed documentation or direct us to the download portal. Our target go-live date is 2025-10-15.

Thank you,
Casey Lin
Compliance Lead, HotDash

## Supabase
Subject: Supabase Project – DPA & Region Confirmation

Hello Supabase Support,

We're finalizing compliance checks for our HotDash Operator Control Center. For project `{{SUPABASE_PROJECT_REF}}`, could you share:
1. Signed Supabase DPA / SCC package.
2. Confirmation of the hosting region and encryption standards for data at rest/in transit.
3. Documentation showing row-level security applied to `decision_log` and `facts` tables.

Please include any available SOC/ISO reports. We are targeting 2025-10-14 for production readiness.

Best,
Casey Lin
Compliance Lead, HotDash

## OpenAI
Subject: OpenAI Enterprise Terms & Data Handling Confirmation

Hi OpenAI Team,

We're integrating OpenAI via the HotDash CX Escalations workflow. To complete our DPIA, please send:
1. Enterprise Terms and Data Processing Addendum.
2. Statement on prompt retention/logging (ability to opt out).
3. Supported regional endpoints for API traffic (we prefer EU availability) and any cross-border transfer safeguards.
4. SOC 2 Type II executive summary or equivalent assurance report.

Our aim is to begin staged rollout after 2025-10-18 pending compliance sign-off.

Regards,
Casey Lin
Compliance Lead, HotDash
