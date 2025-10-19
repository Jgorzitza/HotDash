# Manager Startup (Daily)

## PATH

- [ ] Navigate to repo root `~/HotDash/hot-dash/` or `/home/justin/HotDash/hot-dash/`

---

## 0) Align to the Star (2-3 min) — ALWAYS FIRST

- [ ] **READ COMPLETELY** (not skim): `docs/NORTH_STAR.md`
- [ ] **READ COMPLETELY**: `docs/OPERATING_MODEL.md` — Confirm pipeline: **Signals → Suggestions → Approvals → Actions → Audit → Learn**
- [ ] **READ COMPLETELY**: `docs/RULES.md` — Manager owns governance docs, agents never touch git

**Critical**: These define vision, process, and governance. NEVER skip this step.

---

## 0b) Session Handoff (If Continuing Previous Work) (3-5 min)

**Check for session handoff documents** (created during previous manager shutdown):

- [ ] If `reports/manager/NEXT_STARTUP_HANDOFF.md` exists, **READ IT** after step 0
  - Contains: Agent work inventory, git state, known blockers, regression prevention
  - Prevents: Redoing completed work, losing uncommitted agent files, git contamination

- [ ] If session handoff exists, also read:
  - `reports/manager/FINAL_DIRECTION_UPDATE_<date>.md` (session details)
  - `reports/manager/SHUTDOWN_SUMMARY_<date>.md` (achievements)
  - `feedback/manager/<YYYY-MM-DD>.md` (CEO summary from previous session)

**Purpose**: Understand what was completed, what's in working tree, what blockers were resolved

---

## 1) Repo & CI Guardrails (2-4 min)

- [ ] **Status checks green on `main`**: Docs Policy, Danger, Gitleaks, Validate AI Agent Config
- [ ] **Push Protection & Secret Scanning** enabled (Settings → Code security & analysis)
- [ ] Run local policy checks:
  ```bash
  cd ~/HotDash/hot-dash
  node scripts/policy/check-docs.mjs
  node scripts/policy/check-ai-config.mjs
  gitleaks detect --source . --redact
  ```
  _If any fail: stop, fix, commit before continuing._

---

## 2) Tools & MCP Health (2-3 min)

### Dev Tools

- [ ] `shopify version` OK (target: 3.85+)
- [ ] `supabase --version` OK (use CLI, NOT MCP)
- [ ] `node --version` OK (target: 20+)
- [ ] `npm --version` OK

### MCP Tools (Dev Agents)

**Active MCP servers** (verify in Cursor settings):
- [ ] **github-official**: GitHub repo management
- [ ] **context7**: Codebase search, React Router 7 docs
- [ ] **fly**: Fly.io deployment
- [ ] **shopify-dev-mcp**: Shopify API docs, GraphQL validation (**NOT for running app - use Shopify CLI**)
- [ ] **chrome-devtools-mcp**: UI testing (Designer, Pilot, QA)

**NOT MCP** (use CLI/API instead):
- ❌ Supabase MCP - Use `supabase` CLI
- ❌ Google Analytics MCP - Use built-in API in `app/services/analytics/`

### In-App Agents (Customer/CEO-Facing)

- [ ] `app/agents/config/agents.json` has `ai-customer.human_review: true` and reviewers
- [ ] OpenAI Agents SDK configured (NOT for dev agents - only customer-facing)

### External Services (Optional Checks)

- [ ] Chatwoot API reachable: `npm run ops:check-chatwoot-health` (may fail in dev - acceptable)
- [ ] Publer environment secret present (if social enabled)

---

## 3) Production State Check (NEW - 2-3 min)

**Check production app status FIRST** (before assuming local dev needed):

- [ ] **Fly.io production**: `curl -I https://hotdash-staging.fly.dev` (should return HTTP 200)
- [ ] **Shopify app config**: Verify `shopify.app.hotdash.toml` exists with real `client_id`
- [ ] **Shopify app status**: `shopify app info --config hotdash` (shows app details)
- [ ] **Recent deployments**: `shopify app versions list` (check latest version)

**If production app is accessible**: Designer, Pilot, QA can test immediately using Chrome DevTools MCP (no need to wait for local dev)

---

## 4) Project Status Review — Feedback FIRST (3-5 min)

### 4.1 Read All Agent Feedback (CRITICAL - Do This First)

- [ ] Find today's feedback: `find feedback -name "<YYYY-MM-DD>.md" -type f | sort`
- [ ] **Read EVERY agent feedback file completely** (not just skim)
- [ ] Extract for each agent:
  - Current state (COMPLETE, IN PROGRESS, BLOCKED, IDLE)
  - Blockers (owner + ETA)
  - Molecules completed (with evidence)
  - Requests/questions for Manager

**Why First**: Prevents assigning work already completed, ensures direction reflects reality

### 4.2 Consolidate Status (1-2 min)

- [ ] Create status table: agent | state | progress | blockers | evidence
- [ ] Identify:
  - **COMPLETE agents** (ready for Manager PRs)
  - **IN PROGRESS agents** (continuing work)
  - **BLOCKED agents** (need unblockers)
  - **IDLE agents** (need new direction)

### 4.3 Issues & PRs Review (2-3 min)

- [ ] List open PRs: `gh pr list --state open`
- [ ] For each PR verify:
  - [ ] Links Issue (`Fixes #<issue>` in body)
  - [ ] Has `Allowed paths:` line in body
  - [ ] Diffs stay within allowed paths
  - [ ] Has evidence (tests/logs/screenshots)
- [ ] Missing anything? Comment on PR with gap

### 4.4 Prioritize Blockers (1-2 min)

- [ ] List all blockers from feedback
- [ ] Rank by impact (P0 blocks multiple agents > P1 blocks one agent > P2 technical debt)
- [ ] Decide per blocker: **unblock now**, **assign to agent**, or **defer to v1.1**
- [ ] Record decisions in Issue comments (not just feedback)

---

## 5) Update Agent Directions (5-10 min)

**For each agent** (prioritize BLOCKED → IN PROGRESS → IDLE → COMPLETE):

- [ ] Open `docs/directions/<agent>.md`
- [ ] **Verify current**: Check effective date, issue #, version
- [ ] **Molecule depth**: Ensure 15-20 molecules assigned (if <15, add more; if >20, sequence to next cycle)
- [ ] **Unblockers first**: Prepend P0/P1 unblocker molecules before production work
- [ ] **Update objective**: Set today's goal aligned to North Star
- [ ] **Update constraints**: Allowed paths, MCP tools required, budget
- [ ] **Definition of Done**: Clear, testable, evidence-based
- [ ] **Follow template**: `docs/directions/agenttemplate.md`
- [ ] **Archive completed items**: Leave "done" note + PR link, remove from task list

**Tool Requirements to Include**:
- **shopify-dev-mcp**: For Shopify API validation (NOT for running app)
- **context7**: For React Router 7 patterns, library docs
- **chrome-devtools-mcp**: For UI testing (Designer, Pilot, QA)
- Supabase CLI (NOT MCP)
- Built-in GA4 API (NOT MCP)

---

## 6) Manager-Controlled Git — Create PRs (Variable time)

**For agents with WORK COMPLETE block**:

### Sequential PR Creation (MANDATORY - Prevents Git Contamination)

**Why Sequential**: Concurrent git operations cause file mixing across branches

**Process** (ONE agent at a time):

  ```bash
# Return to main first
git checkout main
git pull origin main

# For EACH completed agent (never parallel):
agent="<agent-name>"  # e.g., "ai-knowledge"
issue="<issue-number>"  # from agent feedback

# 1. Create branch
git checkout -b ${agent}/oct-19-complete main

# 2. Stage ONLY that agent's files (from feedback evidence)
git add <agent-specific-files>

# 3. Verify staged files are correct
git status --short

# 4. Commit with evidence
git commit -m "${agent}: [Summary from feedback] (Fixes #${issue})"

# 5. Push
git push -u origin ${agent}/oct-19-complete

# 6. Create PR
gh pr create --title "${agent}: [Summary]" --body "
[Evidence from agent's feedback file]

Allowed paths: <from agent direction>
"

# 7. CRITICAL: Return to main BEFORE next agent
git checkout main

# Repeat for next agent
```

**Timeline**: ~15-20 min per agent × number of completed agents

---

## 7) Drift Guard (2-4 min)

- [ ] Run docs policy: `node scripts/policy/check-docs.mjs`
- [ ] **Planning TTL**: Archive any `docs/planning/*` older than 2 days:
  ```bash
  node scripts/ops/archive-docs.mjs
  git commit -am "chore: planning TTL sweep" && git push
  ```
- [ ] Check for stray `.md` files outside allow-list

---

## 8) Health Lights & Stop-the-Line Triggers

**In Production** (check metrics):
- [ ] Tile P95 < 3s
- [ ] Nightly rollup error rate < 0.5%
- [ ] 30-day uptime ≥ 99.9%

**In Development** (may be N/A):
- [ ] Build passing locally
- [ ] Test suite ≥95% passing
- [ ] 0 secrets detected

**Stop-the-Line Triggers** (do NOT proceed):
- ❌ Secrets detected (local or CI) → rotate, purge, rescan
- ❌ PR missing Issue linkage → send back
- ❌ PR missing Allowed paths → send back
- ❌ Diffs outside Allowed paths → send back

---

## 9) Start the Day (1-2 min)

- [ ] Create/resize **Tasks** (15-20 molecules per agent, 5-30 min each)
- [ ] Set in Issue: **owner**, **DoD**, **Allowed paths**
- [ ] Update `docs/directions/<agent>.md` with **today's objective** + **constraints**
- [ ] Post one-liner plan in `feedback/manager/<YYYY-MM-DD>.md`

---

## 10) Finalize Startup (30 sec)

- [ ] Commit any direction updates
- [ ] Push manager changes
- [ ] Signal agents (direction files updated)

---

## Quick Reference: What Manager Controls

**Manager ALWAYS owns** (per RULES.md):
- ✅ NORTH_STAR.md, RULES.md, OPERATING_MODEL.md
- ✅ docs/directions/*.md (all agent direction files)
- ✅ ALL git operations (branch, commit, push, PR creation)
- ✅ docs/manager/PROJECT_PLAN.md

**Agents NEVER touch**:
- ❌ Git commands (no branch, commit, push, PR)
- ❌ Governance docs
- ❌ Other agents' direction files
- ❌ Manager's feedback file

**Agents ONLY touch**:
- ✅ Their own feedback file: `feedback/<agent>/<YYYY-MM-DD>.md`
- ✅ Their allowed paths (code, tests, specs as listed in Issue)

---

## Common Mistakes to Avoid

1. ❌ Skipping North Star/Operating Model/Rules (always read governance first)
2. ❌ Updating directions before reading ALL agent feedback
3. ❌ Assigning P0 fixes without verifying test files exist
4. ❌ Letting agents create PRs (causes git contamination)
5. ❌ Bulk committing agent work (causes file mixing)
6. ❌ Confusing Shopify CLI (running app) with shopify-dev-mcp (API docs)
7. ❌ Assuming local dev needed when production app already accessible
8. ❌ Assigning <15 molecules per agent (violates accountability threshold)

---

## Manager Launch Command

After completing all checklist steps:

```bash
cd ~/HotDash/hot-dash

# Verify governance alignment
echo "✅ Step 0: Read NORTH_STAR, OPERATING_MODEL, RULES"

# Check for session handoff
if [ -f reports/manager/NEXT_STARTUP_HANDOFF.md ]; then
  echo "📋 Session handoff exists - read after standard process"
fi

# CI checks
node scripts/policy/check-docs.mjs && \
node scripts/policy/check-ai-config.mjs && \
gitleaks detect --source . --redact && \
echo "✅ Step 1: CI guardrails GREEN"

# Production check
curl -I https://hotdash-staging.fly.dev && \
shopify app info --config hotdash 2>/dev/null && \
echo "✅ Step 3: Production app accessible"

# Agent feedback consolidation
echo "📖 Step 4: Read ALL agent feedback files"
find feedback -name "$(date +%Y-%m-%d).md" -type f | sort

# Manager ready
echo ""
echo "✅ MANAGER STARTUP CHECKLIST COMPLETE"
echo "Next: Read session handoff (if exists) → Consolidate feedback → Update directions"
```

---

**Manager Note**: This checklist ensures governance alignment BEFORE session-specific work. Session handoff is SUPPLEMENTAL, not a replacement.
