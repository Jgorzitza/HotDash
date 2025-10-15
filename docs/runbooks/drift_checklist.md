
# Drift Checklist (Daily at Shutdown) — Manager Only

> **Who runs this:** Manager.  
> **When:** After **all agents** have completed their shutdown, and **before** you finalize Manager Shutdown.  
> **Goal:** no policy drift, no stray docs, no secret leaks, and a repo that restarts clean.

---

## 1) Secrets & Hygiene

- [ ] **HEAD scan** (fast):  
  ```bash
  gitleaks detect --source . --redact
  ```
- [ ] **History scan (Fri only)** or when you suspect a leak:  
  ```bash
  gitleaks git -v --redact --report-format sarif --report-path .reports/gitleaks-history.sarif --log-opts="--all" .
  ```
- [ ] Confirm **Push Protection** & **Secret Scanning** are enabled (Settings → Code security & analysis).  
- [ ] Ensure `.env*` files are ignored and **not staged**.

---

## 2) Docs Governance (no sprawl)

- [ ] Policy check (allow-list):  
  ```bash
  node scripts/policy/check-docs.mjs
  ```
  Expect **0 violations**. Fix or quarantine via archive sweep (below).

- [ ] **Planning TTL** (sweep anything > 2 days):  
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```

- [ ] **Stale docs clean-up**
  - [ ] Archive/remove any completed items from `docs/directions/<agent>.md` (leave “done” + PR link)
  - [ ] Move any one-off scratch notes into `feedback/<agent>/<YYYY-MM-DD>.md` or delete

---

## 3) CI & Required Checks

- [ ] On `main`, the following are **required and passing**:
  - **Docs Policy**
  - **Danger**
  - **Gitleaks (Secrets Scan)**
  - **Validate AI Agent Config**

- [ ] Sample PR sanity (create/choose one active PR):
  - [ ] **Docs Policy** passes (no rogue `.md`)
  - [ ] **Danger** passes (Issue linkage + Allowed paths present; tests if code changed)
  - [ ] **Gitleaks** passes
  - [ ] Diffs stay **within Allowed paths**

---

## 4) Sandboxes & Protections

- [ ] **Branch protection** on `main` still enforces required checks.  
- [ ] **CODEOWNERS** still guards `docs/**` and `feedback/**` (manager review).  
- [ ] (Optional) Close **stale branches** (> 14 days no commits) unless actively used.

---

## 5) Directions & Feedback Consistency

- [ ] For each active agent:
  - [ ] Today’s `feedback/<agent>/<YYYY-MM-DD>.md` ends with **status → next intent**
  - [ ] `docs/directions/<agent>.md` reflects **tomorrow’s objective** + constraints + Issue/PR links
  - [ ] Blockers have **owner + ETA** posted in the **Issue** (not only in feedback)

---

## 6) North Star & Plan

- [ ] If scope changed today, update **NORTH_STAR** metrics and **PROJECT_PLAN** gates
- [ ] If not, confirm we’re still aligned: **no side projects, no extra docs**

---

## 7) Optional Deep Checks (weekly or after large changes)

- [ ] Re-run history scan (see 1) and review SARIF in the Security tab
- [ ] Sample end-to-end flow: open a test PR → validate checks → ensure Danger rules catch missing artifacts
- [ ] Review **rulesets** (if used) to ensure path restrictions haven’t been loosened

---

## 8) Final State for Restart

- [ ] Open Issues contain **DoD + Allowed paths + owner**
- [ ] Draft PRs exist for mid-slice work; bodies include **Fixes/Refs** and **Allowed paths**
- [ ] No dirty working tree: `git status` clean
- [ ] Post a one-liner in `feedback/manager/<YYYY-MM-DD>.md`: open PRs/Issues, top blockers, first action on restart
