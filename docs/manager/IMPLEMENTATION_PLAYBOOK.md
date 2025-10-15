
# IMPLEMENTATION PLAYBOOK — Manager (one file to rule them all)

> **Goal:** Clean local + remote repo, install guardrails, set direction docs, and relaunch the 16 agents.
> **Mode:** Build/Dev (no customer messaging/payments/production Shopify mutations). HITL approvals apply later in Live‑Ops.

**Pre‑reqs:** GitHub admin, `gh` CLI, Node 20+, Gitleaks, `git-filter-repo`.

---
## Navigate to repo root
- Project lives at `~/HotDash/hot-dash` or `/home/justin/HotDash/hot-dash`

## 0) Create a working branch
```bash
git checkout -b governance-reset-$(date +%F)
```

## 1) Lock down security while we fix history
- Turn on **Secret scanning → Push protection** in GitHub repo settings.
- Require PRs on `main`, block force pushes, require status checks (we'll wire them in step 5).

## 2) Hunt & remove secrets
```bash
gitleaks git -v --redact --report-format sarif --report-path .reports/gitleaks-history.sarif --log-opts="--all" .
# Ensure any keys found are now secured (GitHub/Supabase/Shopify/Twilio/Chatwoot).
```

## 3) Purge leaked secrets from history 
```bash
# Example: remove a file everywhere
git filter-repo --path PATH/TO/LEAKED_FILE --invert-paths
git push --force --all && git push --force --tags
```

## 4) Add governance bundle (workflows, scripts, docs)
- Copy the bundle files into repo root and commit:
```bash
git add .github scripts docs app/agents/config supabase mcp packages/agents -A
git commit -m "governance: docs policy, danger, gitleaks, hitl, mcp examples"
```

**If missing, install policy scripts now:**
- `scripts/policy/check-docs.mjs` and `scripts/policy/check-ai-config.mjs`
- Workflows: `.github/workflows/docs-policy.yml`, `.github/workflows/ai-config.yml`

## 5) Enable CI & required checks
- In GitHub → Settings → Branches → **Required checks**:
  - Docs Policy
  - Gitleaks (Secrets Scan)
  - Danger
  - Validate AI Agent Config

## 6) Create a Markdown allow‑list ruleset (optional defense‑in‑depth)
```bash
scripts/rulesets/create-md-allowlist.sh <owner/repo>
```

## 7) Quarantine stray Markdown (one‑time sweep)
```bash
node scripts/ops/archive-docs.mjs
git commit -am "chore: archive stray docs and index"
```

## 8) Wire **Issues** as the single task ledger
- Use `.github/ISSUE_TEMPLATE/task.yml`.
- Each task **must** include **Allowed paths**; the PR must include them in the body (Danger fails otherwise).

## 9) North Star + Operating Model
- Update/confirm `docs/NORTH_STAR.md` (growth integrated, approvals loop defined for Live‑Ops).
- Add/confirm `docs/OPERATING_MODEL.md` (pipeline, guardrails, cadence, roster).
- Keep **approvals_drawer_spec.md** separate and linked from the Operating Model for later Live‑Ops.

## 10) Set directions for the 16‑agent roster (keep clean)
- Edit `docs/directions/<agent>.md` from the template and **remove completed work** daily.
- Roster: manager, engineer, qa, devops, integrations,
  ai-customer, ai-knowledge, inventory, analytics,
  seo, ads, content, support, designer, product, data.

## 11) In‑app Agents SDK (runtime agents; Live‑Ops later)
- Customer & CEO agents live under `packages/agents/` using **OpenAI Agents SDK (TypeScript)**.
- **HITL required** for `ai-customer` (enforced by CI: `app/agents/config/agents.json` must have `human_review: true` and reviewers).
- Tools exposed via MCP/servers: Shopify Admin, Supabase, Chatwoot, LlamaIndex. No freehand HTTP.

## 12) Relaunch with the runbooks
- Manager: `docs/runbooks/manager_startup_checklist.md`
- Agents:  `docs/runbooks/agent_startup_checklist.md`

## 13) Daily drift check (run at **Startup and Shutdown**)
- Execute `docs/runbooks/drift_checklist.md` (Manager‑only) — replaces the old weekly‑only process.
- TTL sweep planning docs older than **2 days**.
- Verify required checks are enforced; fix any drift immediately.

## 14) Crash Recovery (emergency only)
- If the machine crashed before agent shutdown, run:
  `docs/runbooks/manager_emergency_startup.md`
- Snapshot state, create Draft PRs for WIP, rebuild context from directions/feedback/Issues,
  then proceed with normal Manager Startup.

---

### Definition of Done (for this playbook)
- Required checks enforced on `main` (Docs Policy, Gitleaks, Danger, AI Config).
- Issue Form is live; **Allowed paths** enforced by PR + Danger.
- Docs allow‑list active; archive sweep complete.
- Directions updated for all agents; **agent runbooks** in place.
- First PRs pass **Danger + Docs Policy + Gitleaks**; daily drift checklist adopted.

> **Build/Dev mode reminder:** Until Live‑Ops is enabled, no customer messaging, payments, or production Shopify mutations. If UI needs sample “approvals,” use **fixtures** with `provenance.mode="dev:test"`, a `feedback_ref`, and **Apply disabled**.
