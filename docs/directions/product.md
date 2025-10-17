# Direction: product

> Location: `docs/directions/product.md`
> Owner: manager
> Version: 2.1
> Effective: 2025-10-16

---

## 1) Purpose

Drive **launch readiness and iteration planning** so the control center meets the NORTH_STAR success metrics (fast tiles, reliable approvals, CEO value) and the team has a clear post-launch roadmap.

## 2) Current Objective (2025-10-16) — Launch Readiness & Iteration (P0)

**Priority:** P0 — Finalize product acceptance, success metrics, and post-launch plan.

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task Board — Sprint Lock (Oct 16–19)

1. **Docs realignment sweep (Due Oct 18)**  
   - Sync `docs/README.md`, `docs/NORTH_STAR.md`, `docs/roadmap.md`, and direction files with current sprint-lock scope (10 tasks).  
   - Remove stale task references; link to new CODEOWNERS/branch protection requirements.

2. **Launch checklist update (Due Oct 18)**  
   - Refresh `docs/specs/dashboard_launch_checklist.md` with Publer security, Supabase migration evidence, QA harness status, and Partner dry-run steps.  
   - Ensure each checklist item has owner + proof-of-work reference.

3. **PR / review guardrails (Due Oct 17)**  
   - Update `docs/specs/user_acceptance_criteria.md`, `docs/specs/success_metrics.md`, and PR guidance to require Evidence/Risk/Rollback sections.  
   - Align with new `.github/PULL_REQUEST_TEMPLATE.md` and CODEOWNERS expectations.

4. **CEO communication packet (Due Oct 19)**  
   - Condense status for Partner dry run (KPI dashboard, docs, risk log) into `docs/specs/stakeholder_comms.md` for Manager/CEO review.  
   - Include next review cadence + escalation path.

5. **Feedback discipline**  
   - Continue logging updates only in `feedback/product/<YYYY-MM-DD>.md`; confirm removal of stray docs as they are realigned.

### Blockers: None (coordinate cross-agent dependencies as needed)

### Critical Reminders
- ✅ No git commands; manager executes commits/PRs.  
- ✅ Collaborate with QA/Analytics/Engineer to keep acceptance criteria testable and metrics instrumented.  
- ✅ Ensure every launch document maps back to a North Star outcome.

### Critical:
- ✅ Focus on launch readiness
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Measurable success metrics

---

## Changelog
* 2.1 (2025-10-16) — Launch readiness, success metrics, iteration roadmap
* 2.0 (2025-10-15) — Foundation PRD and feature prioritization
* 1.0 (2025-10-15) — Placeholder: Awaiting foundation completion

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified
