# Content Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** Content Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #105

Deliver production-ready content fixtures, idea briefs, and Publer-ready drafts that feed the approvals loop with evidence and copy that matches CEO tone.

## Tasks

1. Maintain idea pool fixtures (`app/fixtures/content/idea-pool.json`) and ensure each scenario has evidence + Supabase linkage.
2. Provide copy QA checklist + microcopy docs for Marketing/CEO review; attach to feedback.
3. Partner with AI-Customer and Ads to synchronize messaging and Publer drafts; ensure HITL approvals recorded.
4. Produce weekly content performance brief summarizing CTR/engagement from analytics tiles.
5. Write feedback to `feedback/content/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/fixtures/content/**`, `docs/specs/content_pipeline.md`, `docs/design/**`, `feedback/content/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No publishing without HITL approval; maintain tone guidelines.

## Definition of Done

- [ ] Fixtures + specs updated for production cadence
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` (relevant suites) green
- [ ] `npm run scan`
- [ ] Docs/runbooks updated for new workflows
- [ ] Feedback entry completed with evidence
- [ ] Contract test passes

## Contract Test

- **Command:** `jq '. | length >= 3' app/fixtures/content/idea-pool.json`
- **Expectations:** Fixture file contains >=3 scenarios (launch, evergreen, wildcard) with required fields.

## Risk & Rollback

- **Risk Level:** Low — Incorrect copy is caught by HITL, but delays launches.
- **Rollback Plan:** Revert fixture updates, restore previous copy docs, notify CEO.
- **Monitoring:** Content approvals queue, engagement metrics from analytics tiles.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/content/2025-10-17.md`
- Specs / Runbooks: `docs/specs/content_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production alignment for fixtures + briefs
- 2025-10-15: Version 1.0 – Initial launch planning

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 3.0)

**Previous Work**: ✅ COMPLETE - Idea pool fixtures + pipeline spec (193/193 tests)

**New Objective**: Content performance monitoring and Publer integration

**New Tasks** (15 molecules):

1. **CONT-101**: Create content performance API route (30 min)
2. **CONT-102**: Build weekly performance brief automation (35 min)
3. **CONT-103**: Implement Publer draft workflow (40 min)
4. **CONT-104**: Create content approval drawer component (45 min)
5. **CONT-105**: Build content grading system (tone/engagement) (35 min)
6. **CONT-106**: Coordinate with SEO on keyword optimization (25 min)
7. **CONT-107**: Coordinate with Ads on campaign content sync (25 min)
8. **CONT-108**: Create content calendar API route (30 min)
9. **CONT-109**: Build idea pool SLA alert system (30 min)
10. **CONT-110**: Implement auto-escalation for wildcard trends (35 min)
11. **CONT-111**: Create content metrics dashboard tile (40 min)
12. **CONT-112**: Build content A/B test framework (35 min)
13. **CONT-113**: Document content workflow runbooks (30 min)
14. **CONT-114**: Create content quality checklist automation (30 min)
15. **CONT-115**: Feedback summary and test validation (20 min)

**Feedback File**: `feedback/content/2025-10-19.md` ← USE THIS

