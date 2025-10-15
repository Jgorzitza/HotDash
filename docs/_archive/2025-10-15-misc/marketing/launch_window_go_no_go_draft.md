---
epoch: 2025.10.E1
doc: docs/marketing/launch_window_go_no_go_draft.md
owner: product
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Launch Window Go/No-Go Comms Draft — Operator Control Center

## Purpose
Provide ready-to-send messaging for unlocking the Shopify backlog once QA posts the new smoke + Supabase artifacts and DEPLOY-147 delivers store access. Update timestamps and evidence links before posting.

## Evidence Checklist (update before send)
- ✅ QA log references both artifacts in [`feedback/qa.md`](../../feedback/qa.md).
- ✅ Store invite bundle captured in [`artifacts/integrations/shopify/2025-10-10/`](../../artifacts/integrations/shopify/2025-10-10/).
- ✅ Supabase parity artifact: [`artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`](../../artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json).
- ✅ Synthetic smoke artifact: [`artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json`](../../artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json).

## # Draft — #occ-launch
```
✅ **Go for Shopify staging backlog thaw**

QA logged the refreshed evidence bundle at <link-to-feedback-qa-entry>, and DEPLOY-147 is closed with the store invite artifacts here: <link-to-store-access-artifact>.

- Supabase parity (01:25Z): ../../artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json
- Synthetic smoke (`?mock=0`, 04:40Z): ../../artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json

Action items:
1. Product → Publish Linear/Memory update lifting the backlog freeze (OCC-212 + memory:staging_install_plan) with the above evidence.
2. QA → Kick admin validation window (Prisma forward/back, Shopify parity, Playwright) and drop artifacts in feedback/qa.md once runs complete.
3. Marketing/Support → Align launch window per docs/marketing/campaign_calendar_2025-10.md and update comms packet with timestamps.

If anything regresses, reply in-thread with the artifact link + timestamp so we can re-freeze quickly.
```

## Email Draft — Marketing & Support Distribution Leads
```
Subject: [Go] Shopify staging backlog clear — evidence attached

Hi team,

Shopify staging is cleared for backlog thaw. QA has recorded the new smoke + Supabase artifacts and deployment delivered the DEPLOY-147 invite package.

Evidence bundle:
- Supabase parity (01:25Z): ../../artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json
- Synthetic smoke (`?mock=0`, 04:40Z): ../../artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json
- Store invite log: <link-to-store-access-artifact>
- QA log entry: <link-to-feedback-qa-entry>

Next steps:
- Product will post the Linear backlog refresh and Memory update within the hour, citing the above links.
- QA begins the admin validation window immediately; expect Prisma + Shopify parity artifacts in the shared folder before EOD.
- Marketing/Support should slot the launch-window comm timeline per docs/marketing/launch_comms_packet.md and prep operator outreach once QA signs off.

Ping me if anything blocks your path; otherwise expect the Linear + Memory updates shortly.

— Product
```

## Notes
- Replace `<link-to-feedback-qa-entry>` with the precise line permalink to the QA log once evidence lands.
- Replace `<link-to-store-access-artifact>` with the final artifact path (e.g., `../../artifacts/integrations/shopify/2025-10-10/store-access.md#L?`).
- If QA artifacts differ (new timestamps), update the evidence checklist and drafts accordingly.
