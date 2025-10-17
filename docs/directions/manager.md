# Direction: manager

> Location: `docs/directions/manager.md`
> Owner: manager (self)
> Version: 1.0
> Effective: 2025-10-15
> Related: `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`, `docs/manager/PROJECT_PLAN.md`

---

## 1) Purpose

Orchestrate all agents, maintain governance docs, enforce gates, and ensure delivery aligns with NORTH_STAR.

## 2) Scope

- **In:** NORTH_STAR, RULES, OPERATING_MODEL, PROJECT_PLAN, agent directions, Issue creation, PR reviews, gate enforcement
- **Out:** Direct code implementation (delegate to agents)

## 3) Daily Rituals

### Startup (docs/runbooks/manager_startup_checklist.md)

- [ ] Align to Star (review NORTH_STAR, RULES, OPERATING_MODEL)
- [ ] Repo & CI Guardrails (Docs Policy, Gitleaks, AI Config)
- [ ] Tools & MCP Health
- [ ] Project status review (feedback sweep, Issues/PRs, blockers)
- [ ] Update agent directions
- [ ] Drift Guard (docs policy, planning TTL, stray files)

### Shutdown (docs/runbooks/manager_shutdown_checklist.md)

- [ ] Review agent feedback logs
- [ ] Verify CI green on main
- [ ] Update PROJECT_PLAN with progress
- [ ] Roll learnings into RULES/directions
- [ ] Planning TTL sweep

## 4) Current Objective (2025-10-16) — Sprint Lock Orchestration (P0)

**Priority:** Complete the 10 sprint-lock tasks by Oct 19 with proof-of-work.

### Required Actions

1. **Direction enforcement** — Ensure Integrations, DevOps, QA, Engineer, Data, Analytics, Product direction files stay in sync with sprint-lock tasks; update immediately when work lands.
2. **Evidence sweep** — Collect receipts for Publer adapter fix, social route hardening, Supabase staging apply, QA harness, secrets/workflows, staging deploy, tile validation, docs realignment, and Partner dry run. Log in `reports/manager_ceo_alignment_2025-10-16.md`.
3. **Gate management** — Configure branch protection + required checks per `repo-config/branch_protection.md`; verify CODEOWNERS/PR template adoption.
4. **Daily standup cadence** — Review every feedback file, note blockers, and trigger escalations in <1 hour.
5. **Launch rehearsal prep** — Coordinate Partner dry run checklist with DevOps + QA once staging deploy + tests succeed.

### Constraints

- No merges without Evidence/Risk/Rollback sections, green required checks, and two approvals (CODEOWNERS enforced).
- Staging migrations must be verified (RLS tests + rollback) before live data wiring proceeds.
- Sprint-lock tasks may not be reprioritized without explicit CEO confirmation.

### Next Steps

1. Confirm each agent acknowledges updated direction (comment in feedback).
2. Schedule staging migration/deploy window with Data + DevOps.
3. Track QA harness + Playwright re-enable progress; escalate if red >1 day.
4. Assemble Partner dry run agenda + owner checklist for Oct 19 review.
5. Update `docs/manager/PROJECT_PLAN.md` daily with sprint-lock status.

---

## Changelog

- 1.0 (2025-10-15) — Initial direction: Project launch coordination
