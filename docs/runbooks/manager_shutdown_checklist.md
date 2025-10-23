# Manager Shutdown (Restart‑safe, Complete)

> Use this any time you step away or reboot. Goal: a **clean restart** where agents can resume with zero hidden context.

---

## 1) Normalize PRs & Issues

- [ ] Every active **PR** links an **Issue** (`Fixes #<issue>`) **and** includes a line:
      `Allowed paths: <pattern(s)>` in the PR body.
- [ ] If work is mid‑slice, convert to **Draft PR** (preserve state; avoid local-only context).
- [ ] Add a short **Issue comment** (per task) with:
  - Current status (1 line)
  - **Next concrete step**
  - **Blockers** with **owner + ETA**
  - Links to any relevant logs/evidence (screenshots, test output)

## 2a) Daily Branch Merge to Main (MANDATORY)

**Manager reviews all commits on daily branch, then merges to main.**

- [ ] **Review All Commits on Daily Branch**:

  ```bash
  git log manager-reopen-20251020 --oneline --graph -30
  # Verify: All commits follow feat(agent-name): format
  # Verify: No file ownership conflicts between agents
  # Verify: Each commit references work in feedback files
  ```

- [ ] **Test Merge to Main**:

  ```bash
  git checkout manager-reopen-20251020
  git fetch origin main
  git merge origin/main --no-commit --no-ff  # Test only
  # If conflicts: resolve them, commit resolution
  # If no conflicts: git merge --abort (will merge via PR)
  ```

- [ ] **Create PR (if main protected) OR Direct Merge**:

  ```bash
  # Option A: Main is protected (use PR)
  git push origin manager-reopen-20251020
  gh pr create --base main --head manager-reopen-20251020 \
    --title "Daily Snapshot: $(date +%Y-%m-%d)" \
    --body "Daily work from all 17 agents. Evidence in feedback/{agent}/$(date +%Y-%m-%d).md files."
  # Then merge PR after CI passes

  # Option B: Main not protected (direct merge)
  git checkout main
  git merge manager-reopen-20251020 --no-ff -m "Daily snapshot: $(date +%Y-%m-%d)"
  git push origin main
  ```

- [ ] **Verify Merge Success**:

  ```bash
  git checkout main
  git pull origin main
  git log --oneline -10  # Confirm all daily branch commits are in main
  ```

- [ ] **Tag Daily Snapshot** (for rollback capability):

  ```bash
  git tag daily-snapshot-$(date +%Y-%m-%d) main
  git push origin daily-snapshot-$(date +%Y-%m-%d)
  ```

- [ ] **For Tomorrow**: Update branch name in all 17 direction files if creating new daily branch

---

## 2) CI & Guardrails (must be green)

- [ ] `main` status checks **green**: _Docs Policy, Danger, Gitleaks, Validate AI Agent Config_.
- [ ] **Push Protection & Secret Scanning** enabled (Settings → Code security & analysis).
- [ ] Local pre‑shutdown checks (paste and run):
  ```bash
  node scripts/policy/check-docs.mjs
  node scripts/policy/check-ai-config.mjs
  gitleaks detect --source . --redact
  ```
  _If any fail: stop, fix, commit, and re‑run until green._

---

## 3) Gates Sanity (per active task)

For each **Issue (label: task)** and linked PR:

- [ ] **Scope Gate** — Problem + Acceptance Criteria present in the **Issue**.
- [ ] **Sandbox** — **Allowed paths** present in **Issue** & **PR**; diffs stay within them.
- [ ] **Design Gate** — PR describes interfaces, data flow, and failure modes (for new paths).
- [ ] **Evidence Gate (dev)** — tests/logs/screens satisfy the **DoD**.
- [ ] **Ship Gate (if merging)** — rollback noted; changelog if user‑visible.

_Missing any artifact? Comment on the PR with the gap and reassign._

---

## 4) Direction & Feedback Closure [DATABASE-DRIVEN]

**Query database for agent status** (< 10 seconds):

```bash
# Check final status
npx tsx --env-file=.env scripts/manager/query-agent-status.ts
npx tsx --env-file=.env scripts/manager/query-completed-today.ts
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
```

For each **active agent**:

- [ ] Review query results → extract blockers and status
- [ ] Only read markdown `feedback/<agent>/<YYYY‑MM‑DD>.md` for blocked tasks (deep context)
- [ ] Update `docs/directions/<agent>.md` with **tomorrow's objective**, **constraints**, and links
      to the **Issue** (and PR if open).
- [ ] **Archive/remove** completed items from directions
- [ ] Verify agents logged final status via `logDecision()` (check query output)

_Notes:_ Agents report via `logDecision()` (database) with structured fields (taskId, status, progressPct).

## 4.1) KB Integration Audit (NEW - Effective 2025-10-25)

**Verify KB search compliance** (< 30 seconds):

```bash
# Check KB search compliance
npx tsx --env-file=.env scripts/manager/query-kb-search-compliance.ts
```

For each **active agent**:

- [ ] **Verify KB searches completed** before task execution
- [ ] **Check KB search results** for quality and relevance
- [ ] **Review recommendations** from KB searches
- [ ] **Identify agents** who skipped KB search (violations)
- [ ] **Log KB compliance** via `logDecision()`:
  ```typescript
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "kb_compliance_audit",
    rationale: "KB search compliance audit completed",
    payload: {
      agentsAudited: ["engineer", "data", "analytics"],
      complianceRate: "95%",
      violations: ["agent-name: task-id"],
      recommendations: ["Improve KB search quality", "Review search queries"]
    }
  });
  ```

**KB Integration Benefits**:

- **Prevents Redoing Work**: Agents find existing solutions before implementing
- **Context Recovery**: Access lost knowledge from documentation
- **Issue Prevention**: Identify common problems and their solutions
- **Security Awareness**: Review security considerations before implementation
- **Integration Planning**: Understand system connections before building

**Enforcement**: KB search is MANDATORY before task execution. No exceptions.

---

## 5) Planning TTL & Drift Sweep

- [ ] If any `docs/planning/*` is older than **2 days**, sweep and commit:
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```
- [ ] Glance for any stray `.md` or cross‑agent edits in today’s PRs (reject/clean if found).

---

## 6) Security & Hygiene

- [ ] No secrets in local logs/console paste. Close terminals with creds; stop tunnels.
- [ ] Ensure `.env*` are **not staged**; `.gitignore` covers them.
- [ ] Inventory any newly rotated secrets in the private Security note (if applicable).

---

## 7) CEO Summary (log via `logDecision()` and/or paste in `feedback/manager/<YYYY‑MM‑DD>.md`)

**Today’s Outcomes**

- Shipped/merged: PRs #…, #…
- In progress: PRs #… (DoD % complete), Issues #…
- Incidents: secrets (Y/N), CI failures (count), rogue docs (count)

**Next Goal (tomorrow)**

- Primary objective: …
- Success criteria (from North Star): …

**Agent Performance (from database queries)**

From `query-completed-today.ts` and `query-agent-status.ts` output:

- <agent> — **Score (1–5)** (based on taskId completion rate, duration accuracy)
  - 2–3 things done well:
    1. Used structured logDecision() with all fields
    2. Completed X tasks on time
  - 1–2 things to change:
    1. Missing progressPct updates in some entries
  - **One thing to stop entirely:** …

(Use database queries for metrics; only read markdown for context)

### 8) Run Drift Checklist (Manager-only, required)

Before finalizing shutdown:

- [ ] Execute `docs/runbooks/drift_checklist.md` **in full** (after all agents have shut down).
- [ ] Confirm: HEAD secrets scan is clean; docs policy shows 0 violations; planning TTL sweep committed;
      required checks on `main` still enforced; directions ↔ feedback are consistent for tomorrow.

## 9) Finalize

- [ ] Merge or request changes with **explicit next steps** (per PR).
- [ ] Confirm branch protection required checks are **still on** for `main`.
- [ ] Optional: Add a **restart plan** comment to each active Issue with
      the **first 1–2 steps** the agent should take on startup.

> Build/Dev mode safety: no customer messaging, payments, or production Shopify mutations.
> If the UI needs sample approvals to render, they must be **fixtures**
> (`provenance.mode="dev:test"`, with `feedback_ref`, and **Apply disabled**).
