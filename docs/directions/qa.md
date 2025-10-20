# QA Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** QA Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #114

Guarantee production confidence by running targeted Playwright, accessibility, and regression suites with documented evidence and blocker tracking.

## Tasks

1. Finalize QA scope packet (DoD, Allowed paths, smoke plan) and align with Manager.
2. Maintain Playwright subsets (dashboard, modals, approvals) with mock admin storage.
3. Execute accessibility smoke (`npm run test:a11y`) and record results.
4. Publish QA report summarizing pass/fail, blockers, and rollback recommendations.
5. Write feedback to `feedback/qa/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `tests/playwright/**`, `tests/e2e/**`, `docs/tests/**`, `feedback/qa/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No disabling tests without documented blocker; escalate failures immediately.

## Definition of Done

- [ ] QA scope packet published
- [ ] Playwright + accessibility suites executed with logs
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Feedback entry updated with outcomes
- [ ] Contract test passes

## Contract Test

- **Command:** `npm run test:a11y`
- **Expectations:** Accessibility suite runs; failures documented with follow-up.

## Risk & Rollback

- **Risk Level:** High — Undetected regressions ship to production.
- **Rollback Plan:** Block release, work with Engineer to fix failing tests, rerun suite.
- **Monitoring:** Playwright reports, QA packet updates, approvals backlog.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/qa/2025-10-17.md`
- Specs / Runbooks: `docs/tests/qa_scope_packet.md`

## Change Log

- 2025-10-17: Version 2.0 – Production QA scope + reporting
- 2025-10-16: Version 1.0 – Smoke/axe checklists

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 3.0)

**Previous Work**: ~10% complete (production build verification, health check)

**⚠️ CHROME DEVTOOLS MCP BLOCKER**:
Current blocker: Chrome DevTools MCP not initialized. Manager/DevOps working on resolution.

**Continue with**: Remaining Phase 2 tests (non-UI) while awaiting MCP:

**Executable Now** (5 molecules):
1. **QA-005**: Unit test suite rerun (35 min)
2. **QA-006**: Integration test suite (40 min)
3. **QA-008**: Security scan verification (25 min)
4. **QA-009**: RLS verification (30 min)
5. **QA-007**: E2E tests (if build allows) (50 min)

**Awaiting MCP** (12 molecules):
- QA-003, QA-004, QA-010 through QA-014 (UI/UX testing)

**Final** (3 molecules):
- QA-015: Final QA packet
- QA-016: Production checklist
- QA-017: GO/NO-GO decision

**Feedback File**: `feedback/qa/2025-10-19.md` ← USE THIS (correct date)

**Strategy**: Execute non-UI tests now, complete UI tests after MCP ready

