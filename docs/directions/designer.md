# Designer Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** Designer Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #107

Ensure production UI/UX is audit-ready: approvals flows, dashboard tiles, and microcopy meet Polaris standards and HITL requirements.

## Tasks

1. Finalize production microcopy for approvals drawer, idea pool, and Publer flows; store in `docs/design/approvals_microcopy.md`.
2. Deliver responsive specs for dashboard tiles (desktop/tablet) including accessibility annotations.
3. Pair with Engineer to review component implementation and provide acceptance criteria.
4. Support QA with visual regression checklist and sign-off artifacts.
5. Write feedback to `feedback/designer/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** Design tools, `bash`, `npm`, `npx`, `node`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `docs/design/**`, `app/components/**` (copy only), `feedback/designer/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Keep changes strictly to design docs/microcopy; no layout code without Engineer coordination.

## Definition of Done

- [ ] Microcopy + specs updated and reviewed
- [ ] `npm run fmt`
- [ ] `npm run lint`
- [ ] `npm run test:ci` (visual acceptance via QA partner) noted
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback entry completed
- [ ] Contract test passes

## Contract Test

- **Command:** `rg 'CX Escalation —' docs/design/approvals_microcopy.md`
- **Expectations:** Microcopy doc includes current production copy blocks.

## Risk & Rollback

- **Risk Level:** Low — Visual issues caught in HITL, but may slow launch.
- **Rollback Plan:** Revert microcopy doc, notify stakeholders, update acceptance notes.
- **Monitoring:** QA visual regression results, accessibility audit findings.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/designer/2025-10-17.md`
- Specs / Runbooks: `docs/design/approvals_microcopy.md`, `docs/design/dashboard-tiles.md`

## Change Log

- 2025-10-17: Version 2.0 – Production microcopy + responsive specs
- 2025-10-15: Version 1.0 – Approval queue UI specs

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 5.0)

**Status**: UNBLOCKED - Production app accessible

**Issue**: TBD (Manager to assign)

**Objective**: Visual review and design QA on production app

**⚠️ CHROME DEVTOOLS MCP BLOCKER**: 
Current blocker: Chrome DevTools MCP not initialized. Manager/DevOps working on resolution.

**Tasks** (15 molecules - executable once MCP ready):

1. **DES-001**: Production app visual audit (dashboard) (40 min)
2. **DES-002**: Review all dashboard tiles for design consistency (45 min)
3. **DES-003**: Test approvals drawer UX (50 min)
4. **DES-004**: Review mobile responsive behavior (45 min)
5. **DES-005**: Audit color scheme and branding (30 min)
6. **DES-006**: Test typography and readability (30 min)
7. **DES-007**: Review icon usage and consistency (25 min)
8. **DES-008**: Test loading states and animations (35 min)
9. **DES-009**: Review error states and messaging (35 min)
10. **DES-010**: Test keyboard navigation (40 min)
11. **DES-011**: Review accessibility (ARIA, contrast) (45 min)
12. **DES-012**: Document design improvements needed (35 min)
13. **DES-013**: Create design QA report with screenshots (40 min)
14. **DES-014**: Coordinate with Pilot on UX issues (25 min)
15. **DES-015**: Feedback summary and visual evidence (20 min)

**Feedback File**: `feedback/designer/2025-10-19.md` ← USE THIS

**Current Status**: BLOCKED - awaiting Chrome DevTools MCP initialization

**When Unblocked**: Execute all 15 molecules using Chrome DevTools MCP on https://hotdash-staging.fly.dev

