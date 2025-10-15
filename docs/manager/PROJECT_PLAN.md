
# PROJECT_PLAN — Manager Gates, Milestones, and Rituals (v2)

**File:** `docs/manager/PROJECT_PLAN.md`  
**Canonical strategy:** `docs/NORTH_STAR.md`  
**Execution model:** `docs/OPERATING_MODEL.md`  
**Spec (approvals UI + contracts):** `docs/specs/approvals_drawer_spec.md`

> This is the manager’s **tactical** playbook. The Operating Model explains *how the system works overall*; this file tells you *exactly what to do, in what order, with what artifacts*, and how gates are enforced in CI.

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
- [ ] Task 1 (Agent: engineer) — Fixes #123 — Allowed paths: app/**
- [ ] Task 2 (Agent: integrations) — Fixes #124 — Allowed paths: packages/agents/**
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

| Gate | Check | Enforced by |
|---|---|---|
| Scope | Issue linked (`Fixes #123`) | Danger |
| Scope | Allowed paths present & respected | Danger |
| Design | Tests present if app code changed | Danger (warn) |
| Evidence | CI green (Docs Policy, Gitleaks, Danger, AI config) | GitHub Actions |
| Evidence | Approval `/validate` OK (runtime) | API + UI pre‑check |
| Ship | Required checks on `main` | Branch protection |
| Ship | Secret scanning & push protection | Repo settings |

---

## 5) Progress Tracker (lightweight)

Add this table to the top comment of your Milestone Issue and update daily:

| Task | Agent | Gate | Status | Blocker | ETA |
|---|---|---:|---|---|---|
| Build Approvals Drawer | engineer | 3/Evidence | 🔶 | Awaiting `/validate` fix | 2025‑10‑18 |
| Inventory ROP RPC | integrations | 2/Design | 🔷 | Need variant metafield spec | 2025‑10‑17 |

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
- **Integrations:** Implements tool adapters (Shopify/Supabase/Chatwoot/Ayrshare).  
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

*This plan is intentionally mechanical. Boring guardrails win. Use it to move fast without burning the shop down.*
