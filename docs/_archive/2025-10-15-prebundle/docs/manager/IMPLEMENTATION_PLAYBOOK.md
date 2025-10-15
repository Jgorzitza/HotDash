# IMPLEMENTATION PLAYBOOK — Manager (one file to rule them all)

> **Goal:** Clean local + remote repo, install guardrails, set direction docs, and relaunch the 16 agents.

**Pre‑reqs:** GitHub admin, `gh` CLI, Node 20+, Gitleaks, `git-filter-repo`.

---

## 0) Create a working branch
```bash
git checkout -b governance-reset-2025-10-15
```

## 1) Lock down security while we fix history
- Turn on **Secret scanning → Push protection** in GitHub repo settings.
- Require PRs on `main`, block force pushes, require status checks (we'll wire them in step 5).

## 2) Hunt & rotate secrets
```bash
gitleaks git -v --redact --report-format sarif --report-path .reports/gitleaks-history.sarif --log-opts="--all" .
# Rotate any keys found (GitHub/Supabase/Shopify/Twilio/Chatwoot).
```

## 3) Purge leaked secrets from history (after rotation)
```bash
# Example: remove a file everywhere
git filter-repo --path PATH/TO/LEAKED_FILE --invert-paths
git push --force --all && git push --force --tags
```

## 4) Add governance bundle
- Copy the bundle files into repo root (workflows, scripts, docs). Commit them:

```bash
git add .github scripts docs app/agents/config supabase mcp packages/agents -A
git commit -m "governance: docs policy, danger, gitleaks, hitl, mcp examples"
```

## 5) Enable CI & required checks
- In GitHub → Settings → Branches → **Required checks**:
  - Docs Policy
  - Gitleaks (Secrets Scan)
  - Danger
  - Validate AI Agent Config

## 6) Create a Markdown allow‑list ruleset (optional but recommended)
```bash
scripts/rulesets/create-md-allowlist.sh <owner/repo>
```

## 7) Quarantine stray Markdown (one‑time sweep)
```bash
node scripts/ops/archive-docs.mjs
git commit -am "chore: archive stray docs and index"
```

## 8) Wire Issues as the single task ledger
- Use `.github/ISSUE_TEMPLATE/task.yml`.
- Each task must include **Allowed paths**; the PR must include them in the body. Danger will fail if changed files fall outside.

## 9) Set directions for the 16‑agent roster
- Edit `docs/directions/<agent>.md` for:
  manager, engineer, qa, devops, integrations,
  ai-customer, ai-knowledge, inventory, analytics,
  seo, ads, content, support, designer, product, data.

## 10) Relaunch with the runbooks
- Manager: `docs/runbooks/manager_startup_checklist.md`
- Agents: `docs/runbooks/agent_startup_checklist.md`

## 11) In‑app Agents SDK
- Build customer‑facing and CEO‑facing agents under `packages/agents/` using OpenAI Agents SDK (TypeScript). HITL on by default for `ai-customer`.
- Tools exposed through MCP servers (Shopify Admin, Supabase, Chatwoot, LlamaIndex).

## 12) Weekly drift check
- Run `docs/runbooks/drift_checklist.md` every Friday.
- TTL sweep planning docs older than 7 days.
- Review secret scan results and update RULES if needed.

> **Definition of Done for this playbook:** All checks required on `main`, Issue Form live, allow‑list active, directions updated for all agents, first PRs passing Danger + Docs Policy + Gitleaks.
