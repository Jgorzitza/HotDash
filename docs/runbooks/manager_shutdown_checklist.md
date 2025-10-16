
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

## 2) Close Out Manager-Controlled Git
- [ ] Run `node scripts/policy/check-feedback.mjs --date <today>` to catch any WORK COMPLETE blocks that still need a PR.
- [ ] For each ready slice, commit/push within Allowed paths, open/refresh the PR, and add evidence links pulled from the agent’s feedback.
- [ ] Merge when CI is green; update the corresponding direction file to the next task.
- [ ] If a slice isn’t ready, leave it as draft with a clear Issue comment instead of rushing a PR.

---

## 3) CI & Guardrails (must be green)

- [ ] `main` status checks **green**: _Docs Policy, Danger, Gitleaks, Validate AI Agent Config_.
- [ ] **Push Protection & Secret Scanning** enabled (Settings → Code security & analysis).
- [ ] Local pre‑shutdown checks (paste and run):
  ```bash
  node scripts/policy/check-docs.mjs
  node scripts/policy/check-ai-config.mjs
  gitleaks detect --source . --redact
  ```
  _If any fail: stop, fix, commit, and re‑run until green._
- [ ] Sanitize any archived secrets discovered during the day (e.g., replace tokens with placeholders), re-run Gitleaks, and note the remediation in `feedback/manager/<YYYY-MM-DD>.md`.

---

## 4) Gates Sanity (per active task)

For each **Issue (label: task)** and linked PR:
- [ ] **Scope Gate** — Problem + Acceptance Criteria present in the **Issue**.
- [ ] **Sandbox** — **Allowed paths** present in **Issue** & **PR**; diffs stay within them.
- [ ] **Design Gate** — PR describes interfaces, data flow, and failure modes (for new paths).
- [ ] **Evidence Gate (dev)** — tests/logs/screens satisfy the **DoD**.
- [ ] **Ship Gate (if merging)** — rollback noted; changelog if user‑visible.

_Missing any artifact? Comment on the PR with the gap and reassign._

---

## 5) Direction & Feedback Closure

For each **active agent**:
- [ ] Read today’s `feedback/<agent>/<YYYY‑MM‑DD>.md` → extract answers, blockers, decisions.
- [ ] Update `docs/directions/<agent>.md` with **tomorrow’s objective**, **constraints**, and links
      to the **Issue** (and PR if open).
- [ ] **Archive/remove** completed items and feedback that has been actioned from directions and feedback files
- [ ] Ensure the last entry in the agent’s feedback states: **status → next intent**.

_Notes:_ Dev agents write only to their feedback log and code under Allowed paths.
Do **not** create or edit other docs.

---

## 6) Planning TTL & Drift Sweep

- [ ] If any `docs/planning/*` is older than **2 days**, sweep and commit:
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```
- [ ] Glance for any stray `.md` or cross‑agent edits in today’s PRs (reject/clean if found).

---

## 7) Security & Hygiene

- [ ] No secrets in local logs/console paste. Close terminals with creds; stop tunnels.
- [ ] Ensure `.env*` are **not staged**; `.gitignore` covers them.
- [ ] Inventory any newly rotated secrets in the private Security note (if applicable).

---

## 8) CEO Summary (paste in `feedback/manager/<YYYY‑MM‑DD>.md`)

**Today’s Outcomes**
- Shipped: PRs #…, #…
- In progress: PRs #… (DoD %), Issues #…
- Incidents: secrets (Y/N), CI failures (count), rogue docs (count)

**Tomorrow’s Goal**
- Objective: …
- Success metric (from North Star): …

**Agent Snapshot**
- <agent> — score 1–5; 1–2 wins; 1 improvement; 1 thing to stop.

### 9) Run Drift Checklist (Manager-only, required)

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
