---
epoch: 2025.10.E1
doc: docs/marketing/distribution_kit.md
owner: marketing
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-18
---
# OCC Launch Distribution Kit (Hold Until QA + Embed Token Greenlights)

Use this packet to ship internal/external notifications within minutes once QA posts the sustained mock=0 (<300 ms) evidence and reliability delivers the Shopify embed token. Update the placeholders with live timestamps + evidence links before sending.

## 1. Internal Clearance Email Draft — occ-launch@hotrodan.com
```
Subject: [Action Required] OCC launch cleared — publish within minutes

Team,

Evidence gates ✅
- QA mock=0 smoke: <link to curl log> (<timestamp>)
- Synthetic check (<300 ms): <link to JSON>
- Shopify embed token evidence: <link / screenshot>

Action items
1. Fetch latest + reset to sanitized head (`git fetch --all --prune && git reset --hard origin/agent/ai/staging-push`).
2. Publish assets using the release checklist in docs/marketing/launch_comms_packet.md.
3. Reply-all with ✅ once your team has executed.

Need help? Email customer.support@hotrodan.com (Chatwoot Fly inbox) or reply directly to this thread.
```

## 2. External Merchant Email (ESP) — Final Template
```
Subject: Operator Control Center is ready in your Shopify Admin

Hi [Merchant Name],

Operator Control Center keeps every escalation, approval, and insight in one shared inbox—now tuned for faster responses with our Chatwoot cluster on Fly. We just finished final QA and you can launch the dashboard today.

What’s new:
• Operator Inbox powered by Chatwoot on Fly — approve AI drafts in seconds.
• Live telemetry across sales, inventory, and SEO with one-tap actions.
• Decision audit trail so your team always knows who approved what.

Getting started:
1. Open Shopify Admin → Apps → HotDash.
2. Click “Operator Control Center” (look for the Operator Inbox badge).
3. Review today’s priority tiles and assign next steps.

Need support? Email customer.support@hotrodan.com — the inbox routes through Fly so escalations land instantly. Full release notes + FAQ: <link>.

Thanks for building with us,
[Your Team Name]
```

## 3. Support / Enablement Announcement Email
```
Subject: OCC launch go — training + support actions today

Hi team,

QA + reliability cleared OCC launch at <timestamp>. Please complete the following:
- Confirm you can access https://hotdash-staging.fly.dev/app (mock=0) with live data.
- Review the updated dry run packet (`docs/enablement/dry_run_training_materials.md`) and ensure macros reference customer.support@hotrodan.com.
- Capture operator testimonials during the 16 Oct rehearsal and log them in docs/marketing/testimonial_placeholders.md.

Acknowledgement: reply ✅ once you’ve validated access and synced your team.

Thanks!
```

## 4. Press / PR Blurb (Embargoed)
```
Subject: HotDash debuts Operator Control Center with shared inbox on Chatwoot Fly

Hi [Outlet/Partner],

Operator Control Center is ready for merchants once QA posts sustained mock=0 200 evidence and reliability delivers the Shopify embed token. The launch pairs a realtime dashboard with the new Operator Inbox running on Chatwoot Fly (backed by Supabase) so teams approve AI-assisted replies without latency.

Highlights:
• Shared Operator Inbox routed through Chatwoot on Fly for faster escalations
• OpenAI + LlamaIndex suggestions stay auditable inside Shopify Admin
• Supabase decision log powers retention, SLA tracking, and compliance reviews

Assets (attach after gates clear):
- Launch email / blog copy (docs/marketing/launch_comms_packet.md §§3B-3C)
- Operator dashboard hero graphic (artifacts/design/offline-cx-sales-package-2025-10-11/)
- Evidence bundle (synthetic check JSON + curl log)

Next steps: reply with ✅ once your outlet confirms embargo details, or route questions to customer.support@hotrodan.com (Chatwoot Fly inbox).
```

## 5. Social Posts (LinkedIn/Twitter) — Clipboard Ready
- **LinkedIn:** `Operator Control Center unifies your support inbox (now on Chatwoot Fly) with realtime sales, inventory, and SEO telemetry. Hold until QA mock=0 200 + embed token land: “One shared inbox. AI you approve. OCC keeps every escalation flowing—fast.”`
- **Twitter/X:** `Operator Control Center is almost live. Shared Operator Inbox on Chatwoot Fly + OpenAI-powered insights = faster escalations, zero tab fatigue. Shipping once QA mock=0 200 + embed token clear.`
- **Hashtags:** `#Shopify`, `#ecommerce`, `#customersupport`

## 6. Acknowledgement Tracker
| Stakeholder Group | Channel | Owner | Status | Timestamp | Notes |
|-------------------|---------|-------|--------|-----------|-------|
| Product | occ-launch@hotrodan.com (reply-all) | Marketing | ▢ Pending |  |  |
| Reliability | occ-reliability@hotrodan.com | Marketing | ▢ Pending |  |  |
| Support | support-all@hotrodan.com | Support Lead | ▢ Pending |  |  |
| Enablement | enablement@hotrodan.com + Docs comment | Enablement Lead | ▢ Pending |  |  |
| Localization | localization@hotrodan.com | Marketing | ▢ Pending |  |  |
| Compliance | compliance@hotrodan.com | Marketing | ▢ Pending |  |  |

## 7. Send Checklist (Execute After Evidence Uploads)
1. Verify evidence links + timestamps added to templates above.
2. Update `docs/marketing/launch_comms_packet.md` go-live checklist with actual file paths.
3. Send internal clearance email, monitor acknowledgements in tracker.
4. Trigger support/enablement announcement; confirm ✅ from each team.
5. Stage ESP send (segmented list) + schedule social posts using approved variants.
6. Archive evidence + acknowledgements in `feedback/marketing.md` and `feedback/manager.md`.
