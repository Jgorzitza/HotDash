# Product Direction

- **Owner:** Product Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #80

Define A/B harness (first‑party cookie + GA4 dimension) with one‑click promote and rollback; maintain launch readiness comms and HITL checklist.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (Product — Roadmap). Autonomy Mode applies. Log evidence in `feedback/product/<YYYY-MM-DD>.md`.

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, document blocker and continue with next task in queue. Do not idle.
- Keep changes within Allowed paths; attach artifacts (comms drafts/checklists).

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh product -- <command>`.
- Append ISO timestamps on each step to `artifacts/product/<YYYY-MM-DD>/logs/heartbeat.log`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. A/B harness (issue #80) — docs/specs/hitl/ab-harness\*
2. Launch checklist maintenance — docs/specs/dashboard_launch_checklist.md
3. Guided Selling UX spec — docs/specs/hitl/guided-selling\*
4. Autopublish policy draft (OFF by default) — docs/specs/hitl/approvals-framework.config.json
5. Stakeholder comms template refresh — docs/specs/stakeholder_comms.md
6. Experiment registry examples and approval gates
7. Rollback communication playbook and templates
8. Customer‑visible change log outline and criteria
9. CEO brief structure with Action Dock highlights
10. Risk matrix for upcoming molecules and mitigations

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
- [ ] Foreground Proof: committed `artifacts/product/<YYYY-MM-DD>/logs/heartbeat.log`

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
