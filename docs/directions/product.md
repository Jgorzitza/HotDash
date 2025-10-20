# Product Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** Product Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #113

Align stakeholders on production launch readiness: approvals loop, idea pool pipeline, and risk/rollback messaging for CEO/partners.

## Tasks

1. Maintain launch checklist (`docs/specs/dashboard_launch_checklist.md`) with current blockers/owners.
2. Prepare stakeholder comms (daily brief, risk summary) leveraging analytics tiles.
3. Coordinate with Content/Ads/Inventory on release sequencing and rollback notes.
4. Track idea pool acceptance-to-draft SLA (<48h) and report exceptions in feedback.
5. Write feedback to `feedback/product/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `docs/specs/dashboard_launch_checklist.md`, `docs/specs/stakeholder_comms.md`, `feedback/product/2025-10-17.md`
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
- Feedback: `feedback/product/2025-10-17.md`
- Specs / Runbooks: `docs/specs/dashboard_launch_checklist.md`

## Change Log

- 2025-10-17: Version 2.0 – Production readiness alignment
- 2025-10-15: Version 1.0 – Launch readiness dashboard spec

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 3.0)

**Previous Work**: ✅ COMPLETE - Launch checklists, stakeholder comms, SLA tracking

**New Objective**: Pre-launch coordination and final go/no-go preparation

**New Tasks** (15 molecules):

1. **PROD-101**: Monitor PR #99 (Data) and PR #100 (Inventory) merge status (15 min)
2. **PROD-102**: Update launch checklist with current PR status (20 min)
3. **PROD-103**: Coordinate with QA on testing priorities (25 min)
4. **PROD-104**: Review idea pool SLA breaches and implement escalations (30 min)
5. **PROD-105**: Update stakeholder comms with evening summary (20 min)
6. **PROD-106**: Track remaining agent completions (Designer, Pilot, QA) (25 min)
7. **PROD-107**: Document launch timeline with dependencies (30 min)
8. **PROD-108**: Prepare final GO/NO-GO decision framework (35 min)
9. **PROD-109**: Coordinate with Content on wildcard trend resolution (20 min)
10. **PROD-110**: Update risk assessment based on current blockers (25 min)
11. **PROD-111**: Review all agent PRs for product impact (30 min)
12. **PROD-112**: Prepare launch announcement draft (25 min)
13. **PROD-113**: Document rollback triggers and procedures (30 min)
14. **PROD-114**: Create post-launch monitoring checklist (25 min)
15. **PROD-115**: Feedback summary and stakeholder brief (20 min)

**Feedback File**: `feedback/product/2025-10-19.md` ← USE THIS (Oct 20 corrected)

**Priority**: Support final launch decision and coordination

