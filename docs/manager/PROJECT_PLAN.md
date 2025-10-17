# PROJECT_PLAN — Manager Gates, Milestones, and Rituals (v2)

**File:** `docs/manager/PROJECT_PLAN.md`  
**Canonical strategy:** `docs/NORTH_STAR.md`  
**Execution model:** `docs/OPERATING_MODEL.md`  
**Spec (approvals UI + contracts):** `docs/specs/approvals_drawer_spec.md`

> This is the manager’s **tactical** playbook. The Operating Model explains _how the system works overall_; this file tells you _exactly what to do, in what order, with what artifacts_, and how gates are enforced in CI.

---

## 0) Roles & Defaults

- **Owner:** Manager (final accountability)
- **Gate approvers:** Manager + domain lead (e.g., engineer for code, integrations for tools)
- **Timeboxes:** Molecule-sized tasks (≤ 2 days each)
- **Where work lives:** GitHub Issues (Task form), PRs, and the Approvals Drawer for runtime changes

---

## 1) Gate Framework — Entry/Exit Criteria & Artifacts

Each task/PR must pass **all four gates**. Danger/CI enforces parts automatically.

### Gate 1 — **Scope**

**Entry:** Issue created (Task form), agent assigned.  
**Exit:** Problem framed, acceptance criteria defined, sandbox set.

**Artifacts required**

- Issue body contains:
  - **Problem statement** (1–3 sentences)
  - **Acceptance criteria** (bullet list)
  - **Allowed paths** (fnmatch patterns; e.g., `app/** packages/shared/**`)
  - **Risk notes** (known risks, data shape unknowns)

**Automation checks**

- Danger fails PRs without `Fixes #<issue>` or **Allowed paths** in body.
- PR diffs must be within Allowed paths.

---

### Gate 2 — **Design**

**Entry:** Scope gate passed.  
**Exit:** Interfaces clear, data flow mapped, failures planned.

**Artifacts required**

- PR description includes a **Design sketch** (can be text/mermaid):
  - Interfaces (functions/routes/schemas)
  - Data flow (where data comes from; tool calls)
  - Failure modes + fallback/timeout strategy
- If UI: screenshot or quick loom/gif; component contracts
- **Tool list** (MCP/SDK) that will be used (no freehand APIs)

**Automation checks**

- If app code changed, Danger warns if no tests changed.
- For tool adapters, stub tests must exist (unit or integration).

---

### Gate 3 — **Evidence**

**Entry:** Design gate passed.  
**Exit:** Evidence proves the change works and is safe to ship.

**Artifacts required**

- **Tests**: unit + (where meaningful) integration; E2E if user-visible
- **Metrics/logs**: demo evidence (before/after or sample logs)
- **Approvals (if runtime change)**: an item in Approvals Drawer with evidence & rollback

**Automation checks**

- CI green (Docs Policy, Gitleaks, Danger, AI config)
- If runtime: `/validate` succeeds for the approval’s actions

---

### Gate 4 — **Ship**

**Entry:** Evidence gate passed.  
**Exit:** Change merged (or applied) with rollback & audit trail.

**Artifacts required**

- **Rollback plan** in PR/approval
- **Changelog** entry (if user-facing)
- **Receipts** for applied actions (tool IDs/timestamps)

**Automation checks**

- Required checks passing on `main`
- Secret scanning push protection on

---

## 2) Milestone Template (copy‑paste into a planning Issue)

```md
# Milestone: <Name> — <Start–End Dates>

## Objective

- One sentence that ties to NORTH_STAR.

## Scope

- Bullets of what’s in/out.

## Work Breakdown (molecules, ≤ 2 days each)

- [ ] Task 1 (Agent: engineer) — Fixes #123 — Allowed paths: app/\*\*
- [ ] Task 2 (Agent: integrations) — Fixes #124 — Allowed paths: packages/agents/\*\*
- …

## Risks & Mitigations

- Risk → Mitigation

## Success Criteria (from NORTH_STAR metrics)

- e.g., P95 tile < 3s, 10 HITL posts/week, etc.

## Review

- Demo checklist, metrics snapshot, retro notes
```

---

## 3) Daily Rituals (daily task list)

**Startup — Plan & Assign**

- Review NORTH_STAR diffs (if any) and backlog
- Create/resize Tasks with DoD + Allowed paths
- Update and clean `docs/directions/<agent>.md`

**Daily — Operate**

- Manager: run Startup & Shutdown runbooks
- Agents: follow Agent runbooks, keep feedback logs current

**On Shutdown — Evidence & Drift**

- Run Drift checklist (docs policy, sweep, Gitleaks history scan)
- Review SLA times, approval grades, growth/SEO criticals cleared
- Roll learnings into RULES/directions

---

## 4) CI/Danger Enforcement Matrix

| Gate     | Check                                               | Enforced by        |
| -------- | --------------------------------------------------- | ------------------ |
| Scope    | Issue linked (`Fixes #123`)                         | Danger             |
| Scope    | Allowed paths present & respected                   | Danger             |
| Design   | Tests present if app code changed                   | Danger (warn)      |
| Evidence | CI green (Docs Policy, Gitleaks, Danger, AI config) | GitHub Actions     |
| Evidence | Approval `/validate` OK (runtime)                   | API + UI pre‑check |
| Ship     | Required checks on `main`                           | Branch protection  |
| Ship     | Secret scanning & push protection                   | Repo settings      |

---

## 5) Progress Tracker (lightweight)

Add this table to the top comment of your Milestone Issue and update daily:

| Task                   | Agent        |       Gate | Status | Blocker                     | ETA        |
| ---------------------- | ------------ | ---------: | ------ | --------------------------- | ---------- |
| Build Approvals Drawer | engineer     | 3/Evidence | 🔶     | Awaiting `/validate` fix    | 2025‑10‑18 |
| Inventory ROP RPC      | integrations |   2/Design | 🔷     | Need variant metafield spec | 2025‑10‑17 |

Legend: 🔷 = in progress, 🔶 = needs review, ✅ = done, ⛔ = blocked

---

## 6) “Stop the Line” Rules

- Secrets detected? **Stop.** Rotate, purge history, re‑run scans, then resume.
- Rogue `.md` in PR? **Stop.** Quarantine and fix the Task setup (Allowed paths).
- Failing `/validate` for runtime actions? **Stop.** Fix tool payloads or scopes before approving.

---

## 7) Manager One‑Command Walkthrough (reference)

> Run these locally to sanity check before asking for review.

```bash
# Docs & AI config policies
node scripts/policy/check-docs.mjs
node scripts/policy/check-ai-config.mjs

# Secrets scan (HEAD)
gitleaks detect --source . --redact

# Weekly (history) — optional before retro
gitleaks git -v --redact --report-format sarif --report-path .reports/gitleaks-history.sarif --log-opts="--all" .

# Planning TTL sweep
node scripts/ops/archive-docs.mjs
```

---

## 8) RACI (who does what)

- **Manager:** Owns NORTH_STAR, RULES, directions, approvals policy; gate approvals; merges.
- **Engineer:** Implements UI & app code; writes tests; produces evidence.
- **Integrations:** Implements tool adapters (Shopify/Supabase/Chatwoot/Publer).
- **QA:** Designs acceptance checks; verifies `/validate` and receipts.
- **AI (customer):** Drafts; never sends; requires HITL.
- **DevOps:** CI, rulesets, push protection, secret scanning.

---

## 9) Exit from a Milestone (checklist)

- [ ] All tasks passed **Ship Gate**; changelog updated (if applicable)
- [ ] Metrics snapshot attached (tile P95, error rate, approvals SLA, growth deltas)
- [ ] Retro captured → RULES/directions updated
- [ ] Close Milestone; open the next

---

## 10) Templates & Links

- **North Star:** `docs/NORTH_STAR.md`
- **Operating Model:** `docs/OPERATING_MODEL.md`
- **Approvals Drawer Spec:** `docs/specs/approvals_drawer_spec.md`
- **Runbooks:** `docs/runbooks/manager_startup_checklist.md`, `docs/runbooks/manager_shutdown_checklist.md`, `docs/runbooks/drift_checklist.md`
- **Agent Direction** `docs/directions/agenttemplate.md`
- **Issue Form:** `.github/ISSUE_TEMPLATE/task.yml`

---

## 11) Sprint-Lock Status Tracker (Oct 16-19)

### Purpose

Daily sprint-lock status tracking to ensure Partner dry-run readiness by Oct 19.

### Sprint-Lock Overview

**Duration:** Oct 16-19 (4 days)
**Objective:** Complete all pre-launch gates and resolve critical blockers
**Total Tasks:** 10 tasks across 5 agents
**Partner Dry-Run:** Oct 19, 10:00 AM (conditional on staging + QA green)

---

### Daily Status: 2025-10-16 (Day 1 of 4)

**Updated:** Evening
**Updated by:** Product Agent

#### Overall Progress

- **Progress:** 40% (Target: 25%) ✅ AHEAD
- **Gates:** 1/6 complete (Target: 1) ✅ ON TRACK
- **Blockers:** 3 active (2 critical, 1 medium) ⚠️ AT RISK
- **Velocity:** 15+ tasks completed ✅ ABOVE TARGET

#### Tasks Completed Today

| Task                                | Agent   | Status | Evidence                                   |
| ----------------------------------- | ------- | ------ | ------------------------------------------ |
| Create 10 launch readiness specs    | Product | ✅     | feedback/product/2025-10-16.md             |
| Extend 8 specs with idea pool       | Product | ✅     | feedback/product/2025-10-16.md             |
| Agent startup checklist             | Product | ✅     | feedback/product/2025-10-16.md             |
| Sprint-lock status tracking         | Product | ✅     | docs/specs/dashboard_launch_checklist.md   |
| Partner dry-run readiness checklist | DevOps  | ✅     | docs/runbooks/partner_dry_run_readiness.md |
| Create 5 new workflows              | DevOps  | ✅     | .github/workflows/                         |
| Create verify_secrets.sh            | DevOps  | ✅     | scripts/verify_secrets.sh                  |
| Document 2 critical blockers        | DevOps  | ✅     | docs/runbooks/partner_dry_run_readiness.md |
| Test suite audit (375/375 passing)  | QA      | ✅     | feedback/qa/2025-10-16.md                  |
| Create QA review checklist          | QA      | ✅     | docs/runbooks/qa_review_checklist.md       |
| Create idea pool integration tests  | QA      | ✅     | tests/integration/idea-pool.api.spec.ts    |
| Daily QA health report              | QA      | ✅     | feedback/qa/2025-10-16.md                  |
| CX schema design                    | Data    | ✅     | feedback/data/2025-10-16.md                |
| Idea pool schema implementation     | Data    | ✅     | supabase/migrations/                       |
| Idea pool views created             | Data    | ✅     | supabase/migrations/                       |

#### Active Blockers

| Blocker                             | Priority     | Impact                                          | Owner          | Age | ETA Resolution |
| ----------------------------------- | ------------ | ----------------------------------------------- | -------------- | --- | -------------- |
| GitHub Actions billing issue        | **CRITICAL** | Blocks CI/CD, staging deploy, branch protection | Manager        | 0h  | Oct 17 AM      |
| Supabase migration history mismatch | **CRITICAL** | Blocks staging database sync, RLS testing       | Manager + Data | 0h  | Oct 17 AM      |
| Secrets configuration pending       | MEDIUM       | Blocks workflow testing                         | Manager        | 0h  | Oct 17 AM      |

**Blocker Details:**

**1. GitHub Actions Billing Issue (CRITICAL)**

- **Error:** "The job was not started because recent account payments have failed or your spending limit needs to be increased"
- **Impact:** Cannot run CI workflows, trigger deployments, verify branch protection, test secrets
- **Required Action:** Manager must resolve in GitHub account settings
- **Affected:** Tasks 2, 3, 4 in partner_dry_run_readiness.md

**2. Supabase Migration History Mismatch (CRITICAL)**

- **Issue:** Remote has 53 migrations not in local directory (Oct 3-14), Local has 40 migrations not on remote (Oct 10-16)
- **Impact:** Cannot safely push migrations to staging database
- **Required Action:** Manager + Data agent coordination on migration strategy
- **Options:** Pull remote schema (safer), Repair migration history (riskier), Manual reconciliation (safest but time-consuming)

**3. Secrets Configuration Pending (MEDIUM)**

- **Required:** 15 secrets (Supabase: 5, Publer: 2, Shopify: 4, Notifications: 3, Fly.io: 1)
- **Impact:** Cannot test workflows requiring secrets
- **Required Action:** Manager to configure GitHub Secrets
- **Status:** Verification script ready (scripts/verify_secrets.sh)

#### Gates Status

| Gate                          | Status         | Completion | Blockers                        |
| ----------------------------- | -------------- | ---------- | ------------------------------- |
| 1. Backend Infrastructure     | 🔶 IN PROGRESS | 60%        | Supabase migrations             |
| 2. Frontend Integration       | 🔶 IN PROGRESS | 50%        | Staging deploy                  |
| 3. HITL Workflow              | 🔶 IN PROGRESS | 40%        | Approvals drawer implementation |
| 4. Security & Governance      | ✅ COMPLETE    | 100%       | None                            |
| 5. Monitoring & Observability | 🔶 IN PROGRESS | 70%        | GitHub Actions billing          |
| 6. Data Integrity             | 🔶 IN PROGRESS | 50%        | Supabase migrations             |

Legend: ✅ = Complete, 🔶 = In Progress, ❌ = Blocked

#### Risks & Mitigations

| Risk                                 | Likelihood | Impact                    | Mitigation                                                        | Owner            |
| ------------------------------------ | ---------- | ------------------------- | ----------------------------------------------------------------- | ---------------- |
| Sprint-lock deadline missed (Oct 19) | MED        | Delays Partner dry-run    | Resolve blockers by EOD Oct 17, daily status updates              | Manager          |
| Migration data loss                  | LOW        | Critical data corruption  | Use pull remote schema (safest option), test on staging first     | Data + Manager   |
| CI/CD pipeline untested              | HIGH       | Unknown deployment issues | Resolve billing immediately, manual testing as fallback           | DevOps + Manager |
| Secrets exposure during config       | LOW        | Security incident         | Use GitHub Secrets UI only, verify with scripts/verify_secrets.sh | Manager          |

#### Tomorrow's Plan (Oct 17)

**Manager:**

- [ ] **CRITICAL:** Resolve GitHub Actions billing issue (first thing AM)
- [ ] **CRITICAL:** Configure 15 GitHub Secrets
- [ ] **CRITICAL:** Coordinate with Data agent on Supabase migration strategy
- [ ] Review and approve product specs
- [ ] Daily standup 9:00 AM

**DevOps:**

- [ ] Execute Supabase migration once strategy decided
- [ ] Trigger staging deploy rehearsal once billing resolved
- [ ] Verify branch protection once billing resolved
- [ ] Collect deployment artifacts

**QA:**

- [ ] Execute smoke tests on staging once deployed
- [ ] Verify RLS policies on staging database
- [ ] Test approvals drawer end-to-end
- [ ] Update daily QA health report

**Data:**

- [ ] Coordinate with Manager on migration strategy
- [ ] Execute migration plan once approved
- [ ] Verify data integrity post-migration
- [ ] Update CX schema if needed

**Product:**

- [ ] Monitor blocker resolution progress
- [ ] Update sprint-lock status (EOD Oct 17)
- [ ] Prepare Partner dry-run agenda (conditional on staging green)
- [ ] Chase blockers within 1 hour if not resolved

#### Deadline Risk Assessment

**Deadline Risk Score:** 7 (MEDIUM)

- Active blockers: 3 × 2 = 6
- Critical path delay: 0 hours / 4 = 0
- Gates incomplete: 5 × 3 = 15
- **Total:** (6 + 0 + 15) / 3 = 7

**Risk Level:** MEDIUM (5-9)
**Action:** Resolve critical blockers by EOD Oct 17 to reduce risk to LOW

#### Partner Dry-Run Status

**Current Status:** ⚠️ AT RISK (2 critical blockers)

**Readiness Checklist:**

- [ ] Staging deploy successful
- [ ] QA smoke tests passed
- [ ] All critical blockers resolved
- [ ] All 6 gates complete
- [ ] Rollback plan tested
- [ ] Partner dry-run agenda ready

**Conditional GO/NO-GO Decision:** Oct 19, 8:00 AM

---

### Sprint-Lock Completion Criteria

**All criteria must be met by EOD Oct 19:**

**Progress:**

- [ ] 100% of tasks completed
- [ ] All 6 gates completed (✅)
- [ ] 0 active critical blockers
- [ ] ≤ 1 active medium blocker

**Quality:**

- [ ] All acceptance criteria met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance targets met (P95 < 3s)
- [ ] Security scans green (Gitleaks, npm audit)

**Documentation:**

- [ ] All specs updated and reviewed
- [ ] All feedback logs complete
- [ ] Partner dry-run agenda ready
- [ ] Rollback plans documented

**Readiness:**

- [ ] Staging deploy successful
- [ ] QA smoke tests passed
- [ ] CEO sign-off obtained
- [ ] Partner dry-run scheduled

**If criteria not met by EOD Oct 19:**

- Extend sprint-lock to Oct 20
- Escalate to CEO
- Identify root cause
- Adjust plan for next sprint

---

### Daily Update Template (Copy for Oct 17-19)

**Date:** [YYYY-MM-DD]
**Day:** [Day X of 4]
**Updated by:** [Agent name]

#### Overall Progress

- **Progress:** [XX]% (Target: [XX]%) [✅/⚠️/❌]
- **Gates:** [X]/6 complete (Target: [X]) [✅/⚠️/❌]
- **Blockers:** [X] active ([X] critical, [X] medium) [✅/⚠️/❌]
- **Velocity:** [X] tasks completed [✅/⚠️/❌]

#### Tasks Completed Today

[Copy table from above]

#### Active Blockers

[Copy table from above]

#### Gates Status

[Copy table from above]

#### Risks & Mitigations

[Copy table from above]

#### Tomorrow's Plan

[Copy list from above]

#### Deadline Risk Assessment

[Copy from above]

#### Partner Dry-Run Status

[Copy from above]

---

_This plan is intentionally mechanical. Boring guardrails win. Use it to move fast without burning the shop down._
