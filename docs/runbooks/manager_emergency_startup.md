# Manager Emergency Startup (Crash Recovery)

> **When to use:** The machine crashed, agents didn’t finish shutdown, context may be missing.  
> **Goal:** Reconstruct current state safely and relaunch work with zero guesswork.

---

## PATH

- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) Safety First (no writes yet)

- [ ] Disconnect tunnels/VPNs that may auto-run commands on resume.
- [ ] Do **not** force-push or delete anything. We will read & snapshot first.

---

## 1) Snapshot & Health (read-only where possible)

### 1.1 Git status snapshot

```bash
git rev-parse --abbrev-ref HEAD
git status -s
git log --oneline -n 5
git branch --list "agent/*"
```

### 1.2 Find WIP/dangling work (reflog + stash)

```bash
git reflog -n 20
git stash list
```

- If you see `WIP` or local commits not on origin: note the SHAs. **Do not reset yet.**

### 1.3 Confirm origin/remote

```bash
git remote -v
git fetch --all --prune
```

### 1.4 CI/Guardrails (read-only checks)

- GitHub: `main` required checks still enforced (Docs Policy, Danger, Gitleaks, AI Config).
- Settings → Code security & analysis: Push Protection & Secret Scanning are **ON**.

---

## 2) Secret & Policy Sanity (fast scans)

> Safe to run locally; does not modify state.

```bash
# HEAD secrets scan
gitleaks detect --source . --redact

# Docs allow-list (violations indicate untracked/dirty MD drift)
node scripts/policy/check-docs.mjs || true
```

- If either flags a problem, note it for **Step 6** (triage). Do not fix yet; finish state recovery first.

---

## 3) Recover Agent Work-In-Progress

### 3.1 Ensure every agent has a branch

```bash
git branch --list "agent/*" | sed 's/* //'
```

- If an agent was active and has **no** branch:
  - Check reflog for their local WIP commit; create a temp branch:
    ```bash
    git checkout -b recover/<agent>/<date>-<time> <SHA_FROM_REFLOG>
    ```

### 3.2 Draft PRs for mid-slice work

For each branch without a PR, create a **Draft PR** (optional via GitHub CLI):

```bash
# from branch agent/<agent>/<molecule>
gh pr create --draft --fill || true
```

- In the PR body, add (or verify):
  - `Refs #<issue>` (or `Fixes #<issue>` if complete)
  - `Allowed paths: <pattern(s)>`
  - Brief **Design sketch** if new code paths
  - Links to tests/logs/screens if they exist

> Draft PRs preserve state so agents can resume on any machine.

---

## 4) Rebuild Context from Logs & Files

### 4.1 Feedback logs

```bash
ls -1 feedback/*/$(date +%F).md 2>/dev/null || true
```

- If today’s logs are missing for an agent, check **yesterday’s** file and the last PR comments.
- If the terminal/history holds context:
  - Copy relevant, **non-secret** command lines & outcomes into today’s feedback log with a new “Recovery Note” section.

### 4.2 Directions

- Open `docs/directions/<agent>.md` and ensure it points at the current **Issue** and **PR**.
- If direction is out of date, add a short “Recovery Objective” for the next 2–4 hours.

### 4.3 Issues

- For each active Issue, add a manager comment:
  - “Crash recovery: branch = …, PR = …, next step = …, blocker owner/ETA = …”

---

## 5) Tool & Env Smoke (read-only or safe checks)

```bash
# Shopify CLI present
shopify version

# Supabase CLI present
supabase --version

# Quick MCP/adapter pings as read-only (or via health endpoints if you have them)
# e.g., curl -sSf http://localhost:<your-app-port>/health || true
```

- If a tool is unavailable, note it in the Issue as a **blocker** with owner/ETA.

---

## 6) Triage & Fix (only now make small, safe changes)

### 6.1 Secrets

- If `gitleaks` flagged a leak:
  - Rotate the secret(s) and **do not** commit secrets in any form.
  - If necessary, schedule history cleanup with `git filter-repo` on a separate branch per the incident playbook.

### 6.2 Docs policy violations

- Run the planning TTL sweep (moves stray/old planning docs and reindexes):
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```

### 6.3 Stabilize PRs

- Ensure PRs include Issue linkage and **Allowed paths**; keep as **Draft** until agents verify tests.

---

## 7) Relaunch Plan (make it explicit)

- Create/resize Tasks (≤ 2-day molecules) for any recovered branches; set **DoD** + **Allowed paths**.
- Update `docs/directions/<agent>.md` with “Recovery Objective” + constraints + Issue/PR links.
- Post a one‑liner in `feedback/manager/$(date +%F).md`:
  - Open PRs/Issues recovered, top blockers & owners, **first step on restart** for each agent.

---

## 8) Optional: Fresh Clone Sanity (if local repo seems corrupted)

```bash
cd ~ && mkdir -p CrashRecovery && cd CrashRecovery
git clone git@github.com:<owner>/<repo>.git fresh
cd fresh && git fetch --all --prune
# Compare branches
git branch -r | grep agent/
```

- If diffs are confusing locally, continue work from `fresh/` on the recovered draft PR branches.

---

## 9) Greenlight

- `main` checks green; Push Protection **ON**.
- Draft PRs exist for mid-slice work with Issue linkage + Allowed paths.
- Directions updated; Issues have a restart comment.
- Manager posts **Crash Recovery Summary** in today’s feedback.

## 10) Proceed with work

> You can now proceed with the normal **Manager Startup**.

- Execute `docs/runbooks/manager_startup_checklist.md`
