# Manager Startup (On first run)

## PATH
- [ ] Navigate to repo root ~/HotDash/hot-dash/ or /home/justin/HotDash/hot-dash/

## 0) Align to the Star (1–2 min)
- [ ] Skim diffs in `docs/NORTH_STAR.md` and `docs/RULES.md` (if changed since yesterday).
- [ ] Open `docs/OPERATING_MODEL.md` header; confirm the pipeline: **Signals → Suggestions → Approvals → Actions → Audit → Learn**.

## 1) Repo & CI Guardrails (2–4 min)
- [ ] **Status checks green on `main`**: _Docs Policy, Danger, Gitleaks, Validate AI Agent Config_.
- [ ] **Push Protection & Secret Scanning** enabled (Settings → Code security & analysis).
- [ ] Run local policy checks:
  ```bash
  node scripts/policy/check-docs.mjs
  node scripts/policy/check-ai-config.mjs
  gitleaks detect --source . --redact
  ```
  _If any fail: stop, fix, commit before continuing._

## 2) Tools & MCP Health (2–3 min)
- [ ] `shopify version` OK; `supabase --version` OK.
- [ ] Chatwoot API reachable (quick ping via adapter or dashboard).
- [ ] **Agents SDK/HITL** config intact: `app/agents/config/agents.json` has `ai-customer.human_review: true` and reviewers.
- [ ] (If social enabled) Ayrshare environment secret present (never hard-coded).

## 3) Manager-Controlled Git — Daily Flow (new)
- [ ] Run: `node scripts/policy/check-feedback.mjs --date 2025-10-15`
- [ ] For each agent with a WORK COMPLETE block today:
  - Create/checkout branch: `agent/<agent>/<YYYYMMDD>-<task>`
  - Add only files in Allowed paths; commit with evidence reference
  - Push and create PR (`gh pr create ...`)
- [ ] Merge when CI green; update direction to next task

## 3) Project status review and Agent direction (3–5 min)

### 3.1 At-a-glance (30–45 sec)
- [ ] **Milestone** on track? (tasks ≤ 2-day molecules)
- [ ] **CI** green on active PRs (Docs Policy, Danger, Gitleaks, AI Config)
- [ ] **Main** releasable (build/smoke pass)

### 3.2 Feedback sweep **first** (60–90 sec)
For each active agent:
- [ ] Open `feedback/<agent>/<YYYY-MM-DD>.md`
- [ ] Extract **blockers**, unanswered questions, unexpected findings
- [ ] Tag each blocker with **owner** and **ETA** (you or agent)
- [ ] If a decision is needed, add a short **Issue comment** on the task (not in feedback)

### 3.3 Issues & PRs (gate sanity) (60–90 sec)
For each **Issue (label: task)** and its linked PR:
- [ ] **Scope Gate:** Problem + Acceptance Criteria present in Issue
- [ ] **Sandbox:** Issue lists **Allowed paths**; PR body repeats them
- [ ] **Design Gate:** PR describes interfaces/data flow/failure modes
- [ ] **Evidence Gate (dev):** unit/integration tests present or justified
- [ ] **Ship Gate (if merging today):** rollback noted; changelog if user-visible
- [ ] Missing anything? Comment on the PR with the gap and reassign

### 3.4 Prioritize blockers (30–45 sec)
- [ ] Rank top 3 blockers (env/data/API/review)
- [ ] Decide per blocker: **unblock now**, **de-scope**, or **timebox & escalate**
- [ ] Record the decision in the **Issue comment** (link from feedback)

### 3.5 Update agent direction (45–60 sec)
For each active agent:
- [ ] Open `docs/directions/<agent>.md` file must follow template `docs/directions/agenttemplate.md`
- [ ] **Set today’s objective** (≤ 2-day molecule) and **constraints**
- [ ] Reflect answers/decisions from step **3.2/3.4** into the direction file
- [ ] **Archive/remove** completed items (leave “done” note + PR link)
- [ ] Confirm the **task → Issue → PR** chain is explicit

### 3.6 Sandboxes & safety (quick pass)
- [ ] Diffs stay **within Allowed paths** (Danger enforces)
- [ ] No new `.md` outside allow-list (Docs Policy enforces)
- [ ] No secrets in code/logs; push protection **ON**
- [ ] Dev mode: **no customer messaging, payments, or production Shopify mutations**

### 3.7 Today plan (30 sec)
- [ ] Assign/resize 10–15 molecules **per agent**; confirm DoD + Allowed paths
- [ ] Post a one-liner plan in `feedback/manager/<YYYY-MM-DD>.md`

> **Note:** Approvals/HITL is **out of scope in build/dev mode**. If the UI needs sample approvals to render, use **fixture entries** with `provenance.mode="dev:test"`, a `feedback_ref`, and **Apply disabled**.

## 4 Drift Guard (2–4 min)
- [ ] Run docs policy again on your working branch:
  ```bash
  node scripts/policy/check-docs.mjs
  ```
- [ ] **Planning TTL**: archive any `docs/planning/*` older than **2 days**:
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```
- [ ] Glance for any stray `.md` or cross‑agent edits in repo and Bounce them.

## 5 Quick Health Lights (Tiles should be green)
- [ ] Tile P95 < **3s** (prod).
- [ ] Nightly rollup error rate < **0.5%** (last 24h).
- [ ] Approvals SLA for CX met; growth & inventory reviews on track.
- [ ] **0** secret incidents open.

## 6 “Stop the Line” Triggers (do not proceed until resolved)
- Secrets detected (local or CI) → rotate, purge history, re-scan.
- PR missing Issue linkage or Allowed paths → send back.
- Approvals without evidence/rollback or failing `/validate` → send back.

## 7 Start the Day (2 min)

- [ ] Create/resize **Tasks** (≤ 2-day molecules) and set in the Issue:
      **owner**, **DoD**, and **Allowed paths** (fnmatch).
- [ ] Update `docs/directions/<agent>.md` with **today’s objective** + **constraints**,
      and link the **Issue** (and PR if open).
- [ ] Move any blockers from yesterday’s `feedback/<agent>/<YYYY-MM-DD>.md`
      into the **Issue** as a comment with **resolver + ETA**.
- [ ] (Optional) Post a one-liner plan in `feedback/manager/<YYYY-MM-DD>.md`.
- [ ] Dev mode only: if UI needs sample approvals, use **fixtures** with
      `provenance.mode="dev:test"`, a `feedback_ref`, and **Apply disabled**.


