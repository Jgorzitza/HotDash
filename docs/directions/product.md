# Product Direction

- **Owner:** Product Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #113

Define A/B harness (first‑party cookie + GA4 dimension) with one‑click promote and rollback; maintain launch readiness comms and HITL checklist.

## Tasks

1. Draft `docs/specs/hitl/ab-harness.*` config and verification steps (cookie strategy, GA4 dimension, promotion path, rollback).
2. Maintain launch checklist (`docs/specs/dashboard_launch_checklist.md`) with current blockers/owners.
3. Prepare stakeholder comms (daily brief, risk summary) leveraging analytics tiles.
4. Coordinate with Content/Ads/Inventory on release sequencing and rollback notes.
5. Write feedback to `feedback/product/2025-10-18.md` and clean up stray md files.

## Upcoming (broad lanes — break into molecules)

- Guided Selling/Kit Composer UX spec
  - Allowed paths: `docs/specs/hitl/guided-selling*`, `feedback/product/**`
  - Deliverables: user flows, wireframes, acceptance criteria
- Garage OS (Build Notebooks) product spec
  - Allowed paths: `docs/specs/hitl/garage-os*`, `feedback/product/**`
  - Deliverables: metaobject fields, privacy controls, success KPIs
- AN‑Vision (Photo‑to‑Fitment) product brief
  - Allowed paths: `docs/specs/hitl/an-vision*`, `feedback/product/**`
  - Deliverables: confidence thresholds, UX checklist, HITL fallback rules
- Autopublish policy draft (toggles OFF by default)
  - Allowed paths: `docs/specs/hitl/media-pipeline*`, `docs/specs/hitl/approvals-framework.config.json`
  - Deliverables: enablement criteria, rollback plan, monitoring

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `docs/runbooks/ai_agent_review_checklist.md`, `docs/specs/dashboard_launch_checklist.md`, `docs/specs/stakeholder_comms.md`, `feedback/product/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Keep checklist factual; align with CI status; no scope drift without CEO sign-off.

## Definition of Done

- [ ] Launch checklist current with blocker statuses
- [ ] Stakeholder comms updated with latest metrics
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback entry updated
- [ ] Contract test passes

## Contract Test

- **Command:** `rg 'Blocker' docs/specs/dashboard_launch_checklist.md`
- **Expectations:** Checklist enumerates blockers with owners/dates.

## Risk & Rollback

- **Risk Level:** Medium — Poor communication can stall launch.
- **Rollback Plan:** Freeze launches, update checklist, realign with CEO.
- **Monitoring:** Launch checklist, stakeholder comms doc, approvals backlog.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/product/2025-10-18.md`
- Specs / Runbooks: `docs/specs/dashboard_launch_checklist.md`

## Change Log

- 2025-10-18: Version 2.1 – HITL checklist restored and linked
- 2025-10-17: Version 2.0 – Production readiness alignment
- 2025-10-15: Version 1.0 – Launch readiness dashboard spec
