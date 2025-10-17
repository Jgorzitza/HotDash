---
epoch: 2025.10.E1
doc: docs/marketing/release_asset_readiness.md
owner: marketing
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-18
---

# Launch Release Asset Readiness Tracker

| Asset                     | Primary Copy                                                                           | Variant Prepared                                         | Testimonial Slot                      | Evidence Gate                | Notes                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| In-app Banner             | `docs/marketing/launch_comms_packet.md` §3A                                            | Banner Variant ≤80 chars logged under Hold-Ready section | N/A                                   | QA mock=0 200 + embed token  | Ready to publish post-gate                                                                 |
| Launch Email              | `docs/marketing/launch_comms_packet.md` §3B                                            | Variant B (shared inbox focus)                           | Evergreen CX lead quote (placeholder) | QA mock=0 200 + embed token  | ESP draft staged; update subject once go/no-go lands                                       |
| Blog Post                 | `docs/marketing/launch_comms_packet.md` §3C                                            | Blog hero sidebar variant                                | Beta testimonial placeholder          | QA mock=0 200 + embed token  | Needs GA MCP section once OCC-INF-221 clears                                               |
| Social (LinkedIn/Twitter) | `docs/marketing/launch_comms_packet.md` Distribution                                   | Variant caption ready                                    | Support/internal testimonial          | QA mock=0 200 + embed token  | Social calendar in placeholder mode                                                        |
| Press/PR Note             | Draft to prepare (TBD)                                                                 | —                                                        | Press quote (manager)                 | QA mock=0 200 + embed token  | Build after testimonials captured                                                          |
| Launch-day hero graphic   | `artifacts/design/offline-cx-sales-package-2025-10-11/cx-escalations-modal.png` (temp) | Social crop queued in component snippets                 | N/A                                   | Design export + QA clearance | Designer to drop final hero + banner overlays in new `artifacts/design/launch-day/` folder |
| Email header illustration | Placeholder (awaiting design export)                                                   | Alt version with Chatwoot Fly badge                      | N/A                                   | Design export + QA clearance | Pair with ESP template once assets land; reference component snippets                      |

## Testimonial Capture Checklist

- Evergreen CX lead (Operator Inbox responsiveness) — script in `docs/marketing/testimonial_placeholders.md`
- Morgan Patel (Support enablement) — note improvements and latency from Fly migration
- Beta partner post-walkthrough — capture activation feedback

## Next Actions

1. Collect raw quotes during 2025-10-16 dry run; log in `docs/marketing/testimonial_placeholders.md` with evidence links.
2. Update ESP/social drafts with approved testimonials immediately after gates clear.
3. Coordinate with product/PR on press note once testimonials finalized.

## Stack Compliance Audit — 2025-10-12

- Verified launch comms only reference canonical tooling: Supabase (data/logs), Chatwoot on Fly (Operator Inbox), React Router 7 (Shopify embed shell), OpenAI + LlamaIndex (AI suggestions).
- Updated in-app banner and feedback CTA in `docs/marketing/launch_comms_packet.md` to remove placeholder email and align with the new support inbox routed through Chatwoot Fly.
- Confirmed distribution kit messaging avoids unsupported vendors; press + social snippets now explicitly cite canonical stack and hold pending QA + embed token gates.
