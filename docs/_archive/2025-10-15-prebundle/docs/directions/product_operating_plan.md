---
epoch: 2025.10.E1
doc: docs/directions/product_operating_plan.md
owner: product
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-11
---
# Product Operating Plan — Operator Control Center

## Weekly Customer Cadence
- **Cadence:** Tuesdays @ 10:00 ET (primary) with optional Friday backup slot.
- **Next calls:**
  - 2025-10-07 — Focus: tile hierarchy validation, activation blockers. Participants: Riley Chen (Ops Lead, Pilot Shop "Evergreen Outfitters"), Morgan Patel (CX Lead, Evergreen Outfitters). Prep: finalize dashboard walkthrough, capture quotes + decisions in `packages/memory` (`scope="ops"`).
  - 2025-10-14 — Focus: telemetry instrumentation demos, release readiness feedback. Participants: Riley Chen (Ops Lead), Morgan Patel (CX Lead), plus data partner Jordan Alvarez (Analytics). Prep: circulate pre-read (metric snapshots, mock screens) 24h prior.
- **Prep checklist (48h before):** finalize agenda, update discovery questions, ensure Memory capture template ready, document action items in Linear post-call.
- **Post-call:** log key quotes + decisions to Memory, sync highlights to shared `ops` package, tie follow-ups to backlog evidence links.

## Release Review Checklist (Mock → Staging → Production)
1. **Mock Review**
   - Tile UX walkthrough (screenshots, copy) signed by design + engineering.
   - Evidence bundle: Vitest + Playwright results, Lighthouse perf snapshot, data contract notes.
   - Open risks + outstanding telemetry stories documented.
2. **Staging Review**
   - Deploy to staging using tagged build; attach runbook link.
   - Verify integrations with sandbox creds, confirm decision log + facts populate.
   - Trigger `npm run ops:nightly-metrics` (or the staging workflow) and confirm Ops Pulse tile renders with latest aggregates.
   - Collect metrics vs. acceptance thresholds (activation leading indicators, SLA breach counts).
3. **Production Go/No-Go**
   - Comms package ready (release notes draft, in-admin tooltip copy).
   - Support + reliability sign-off recorded; rollback plan validated.
   - Final go/no-go meeting outcomes logged as decision (`scope="ops"`, action `release.go` or `release.no_go`).

## Doc Change Log Process
- Maintain rolling change log in `docs/directions/product_changelog.md`; append entry for every material update (what changed, evidence link, author, timestamp).
- At daily manager sync, review change log + highlight scope creep or dependency risks.
- Any roadmap adjustments require change log entry + ping to manager + design/engineering owners.
- Archive log entries older than 30 days into `/docs/strategy/archive/` for traceability.
