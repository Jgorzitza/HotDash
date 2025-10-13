---
epoch: 2025.10.E1
doc: docs/directions/git-cleanup.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# Git Cleanup — Direction (Repository Health)

## 🚨 CRITICAL: CONTINUE REPOSITORY MAINTENANCE FOR DEPLOYMENT (P2)

**Your immediate priority**: Continue repository maintenance to support deployment

**Current status**:
- ✅ Worktrees removed, branches cleaned
- 🔄 Engineer deploying to Fly.io NOW
- 🎯 Continue repository maintenance

**START HERE NOW** (Continue repository maintenance):
```bash
cd ~/HotDash/hot-dash

# 1. Monitor deployment branches with GitHub MCP
# mcp_github-official_list_branches(owner: "...", repo: "hot-dash")
# Verify: Deployment branch exists and is healthy

# 2. Clean up any deployment-related branches
# Remove old deployment branches if safe
# Use GitHub MCP for branch management

# 3. Verify repository health
# Check for any merge conflicts
# Verify all branches are clean

# 4. Document deployment repository state
# File: docs/git/deployment_repository_state.md
# Include: Branch structure, deployment branches, health status

# 5. Prepare for post-deployment cleanup
# Document any branches that can be cleaned after successful deployment

# Evidence: Repository health report, deployment branch documentation
# Log to: feedback/git-cleanup.md
```

**MCP TOOLS REQUIRED**:
- ✅ GitHub MCP: mcp_github-official_list_branches (branch monitoring)
- ✅ GitHub MCP: mcp_github-official_get_commit (deployment verification)

**Timeline**: 60 minutes (continue current maintenance work)

**Success Metric**: Repository healthy and deployment-ready

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Git Cleanup agent must not create or edit direction files; submit evidence-backed change requests via manager.

## Mission

**You are the Git Cleanup agent.** Your job is to clean up the repository: remove outdated files, consolidate duplicates, sync branches, close stale PRs, and ensure main branch reflects current local development work.

**Goal**: Clean, organized repository that matches our actual codebase.

## Local Execution Policy (Auto-Run)

You are authorized to run local, non-interactive git commands without approval. Guardrails:

- Scope: Read-only git operations (status, diff, log, grep) auto-approved
- Write operations: Create PRs for review, don't force-push or delete branches without evidence
- Non-interactive: Use --no-pager, avoid interactive prompts
- Evidence: Log all commands and outputs in feedback/git-cleanup.md
- Secrets: Never commit secrets, scan before any git operation
- Commits: Create clean commits with clear messages, reference issues

## Current Sprint Focus — 2025-10-12

**Primary Mission**: Clean up repository to match local development state

---

## 🚨 P0 REPOSITORY CLEANUP TASKS

### Task 1: Repository Audit (Do FIRST)

**Audit Scope**:
- Use GitHub MCP to list all branches, PRs, commits
- Compare main branch to local dev work
- Identify stale files, duplicate docs, outdated code
- Find open PRs that should be closed or merged
- Identify files that don't match North Star (wrong patterns, deprecated code)

**Evidence**:
- Branch list with last commit dates
- PR list with status
- File inventory (categorized: keep, update, delete)
- Comparison: main vs. local dev

**Timeline**: 2-3 hours

---

### Task 2: Remove Outdated/Duplicate Files

**Files to Evaluate**:
- Look for duplicate .md files (multiple docs covering same topic)
- Find outdated documentation (references to deprecated patterns)
- Identify unused code files
- Check for abandoned experiments

**Actions**:
- Create PR: Delete outdated files
- Consolidate duplicate content into single source of truth
- Update references to point to correct files

**Evidence**:
- List of files removed with justification
- PR link
- Updated file references

**Timeline**: 2-3 hours

---

### Task 3: Sync Main with Local Development

**Goal**: Main branch should reflect current local development work

**Steps**:
- Use GitHub MCP to check main branch status
- Compare with local codebase
- Identify commits in local not in main
- Create clean commit history for missing work
- Ensure no secrets in commits (scan with `git grep`)

**Evidence**:
- Branch comparison report
- Commits to be pushed
- Secret scan results (must be clean)

**Timeline**: 2-3 hours

---

### Task 4: Close/Merge Stale PRs

**Audit PRs**:
- Use GitHub MCP to list all open PRs
- Categorize: Merge, Close, Needs Work
- Close abandoned PRs with explanation
- Merge completed PRs that are blocked

**Evidence**:
- PR audit report
- List of PRs closed/merged with rationale

**Timeline**: 1-2 hours

---

### Task 5: Clean Up Branches

**Branch Cleanup**:
- Use GitHub MCP to list all branches
- Identify stale branches (no commits in >7 days)
- Delete merged branches
- Document active branches and their purpose

**Evidence**:
- Branch inventory
- Branches deleted (with safety check first)
- Active branch documentation

**Timeline**: 1-2 hours

---

### Task 6: Repository Documentation

**Update**:
- Ensure README.md reflects current state
- Update CONTRIBUTING.md if exists
- Document branch strategy
- Create REPO_STATUS.md with current inventory

**Evidence**:
- Updated documentation
- Repository status report

**Timeline**: 1-2 hours

---

## 📋 COORDINATION

**With QA Helper**:
- They verify code quality
- You handle git structure
- Coordinate on what files to keep/delete

**With Engineer**:
- Don't interfere with their active work
- Clean up around them
- Ask before deleting anything they might be using

**With Manager**:
- Report major changes before executing
- Get approval for large deletions
- Log all actions in feedback/git-cleanup.md

---

## ✅ SUCCESS CRITERIA

**Repository is Clean When**:
- ✅ Main branch matches local development work
- ✅ No duplicate documentation files
- ✅ No stale PRs (>30 days old)
- ✅ No stale branches (merged or abandoned)
- ✅ README accurately reflects current state
- ✅ All files serve a purpose (no dead code)
- ✅ No secrets in git history

---

## 🚨 SAFETY RULES

**Before Deleting Anything**:
1. Check if file is referenced elsewhere: `grep -r "filename" .`
2. Verify not actively used by agents
3. Create backup branch first
4. Document deletion rationale

**Never Do**:
- ❌ Force push to main
- ❌ Rewrite public history
- ❌ Delete without backup
- ❌ Commit secrets

**Always Do**:
- ✅ Create PR for review
- ✅ Scan for secrets before commit
- ✅ Use GitHub MCP for validation
- ✅ Log evidence in feedback

---

## 📊 EVIDENCE REQUIREMENTS

**For Each Task**:
- ✅ GitHub MCP query results
- ✅ List of changes with rationale
- ✅ PR links for major changes
- ✅ Before/after comparison
- ✅ Git commit hashes

---

## 🎯 PRIORITY ORDER

1. Task 1: Repository audit (understand current state)
2. Task 2: Remove outdated/duplicate files (clean up)
3. Task 3: Sync main with local (get current)
4. Task 4: Close stale PRs (reduce noise)
5. Task 5: Clean branches (organize)
6. Task 6: Update docs (document clean state)

**Total**: 11-16 hours of repository cleanup

**Start with Task 1 - audit before making changes**

---

**Report in**: feedback/git-cleanup.md with timestamps, GitHub MCP usage, and evidence

## 🎯 MANAGER APPROVAL - EXCELLENT WORK!

**Your Report**: Tasks 1, 2, 4 complete. Tasks 3, 5, 6 prepared.

**Repository Cleanup Results**:
- ✅ Archived 47 duplicate status files
- ✅ Cleaned root directory (45 → 2 files)
- ✅ Organized archive structure
- ✅ Identified 19 merged branches for deletion
- ✅ Prepared cleanup branch for PR

**Manager Decision**: **APPROVED - Proceed with Tasks 3, 5, 6**

**Your Next Actions** (in order):
1. ✅ Push cleanup branch (you mentioned this is ready)
2. ✅ Create PR using GitHub MCP: `cleanup/git-cleanup-2025-10-12` → `main`
3. ✅ **Self-approve and merge** (you have manager approval now)
4. ✅ Delete 19 merged branches (list them in feedback first)
5. ✅ Create REPO_STATUS.md documenting clean state
6. ✅ Update README.md to reflect current structure

**Approval Conditions Met**:
- ✅ No secrets in commits (you verified)
- ✅ Backup created (archive directory)
- ✅ No force-push to main (using PR)
- ✅ Clear documentation of changes
- ✅ Excellent evidence in feedback

**Timeline**: 
- PR creation + merge: 30 min
- Branch deletion: 30 min
- Documentation: 1 hour
- **Total**: ~2 hours to complete remaining tasks

**Great Work!** Your cleanup improved repository organization significantly. Proceed with confidence.

**Status**: 🟢 APPROVED - Execute Tasks 3, 5, 6 immediately


---

## ✅ MISSION ACCOMPLISHED - EXCELLENT WORK!

**All 6 Tasks Complete** (100% success):
1. ✅ Repository audit
2. ✅ Archive duplicate files (50 files cleaned)
3. ✅ PR merged (PR #3)
4. ✅ Branch cleanup (20 branches deleted)
5. ✅ REPO_STATUS.md created
6. ✅ README.md updated

**Repository Health**: EXCELLENT ✅

**New Direction**: Repository is clean! You can either:
- **Option A**: Take a break (you've earned it!)
- **Option B**: Start ongoing maintenance tasks below

**Ongoing Maintenance Tasks** (Optional, low priority):

**Task 7**: Monthly Cleanup Schedule Setup
- Create automated monthly cleanup script
- Schedule for 1st of each month
- Evidence: Cleanup automation script
- Timeline: 2-3 hours

**Task 8**: Branch Protection Rules
- Set up branch protection for main
- Require PR reviews
- Require status checks
- Evidence: GitHub branch protection configured
- Timeline: 1 hour

**Task 9**: PR Template Enhancement
- Improve PR template with checklist
- Add security scan reminder
- Add evidence requirements
- Evidence: Updated PR template
- Timeline: 1 hour

**Status**: 🟢 COMPLETE - Optional ongoing tasks available if desired

---

## 🟡 P1 PRIORITY: REPOSITORY SYNCHRONIZATION — 2025-10-13T22:15:00Z

**Manager Assignment**: Sync uncommitted changes to remote repository

### Current Repository State

**Branch**: `localization/work`
**Status**: ⚠️ 120 files need synchronization
- Modified files: 47
- Untracked files: 73
- Remote: https://github.com/Jgorzitza/HotDash.git

### Task: Repository Sync (P1 - High Priority)

**Objective**: Review, commit, and push all uncommitted changes to remote

**Timeline**: 2-3 hours
**Priority**: P1 - Must complete to prevent work loss

### Execution Steps

#### Step 1: Review Modified Files (30 min)

```bash
cd ~/HotDash/hot-dash

# Review all modified files
git status

# Check diff for each modified file category
git diff app/
git diff docs/
git diff feedback/
git diff scripts/
git diff supabase/migrations/

# Categorize changes by type:
# - Documentation updates
# - Code changes
# - Feedback logs
# - Configuration changes
# - Database migrations
```

#### Step 2: Review Untracked Files (30 min)

```bash
# List all untracked files by category
ls -la HotDash_Growth_Spec/
ls -la app/components/picker-payments/
ls -la app/copy/
ls -la app/routes/api.approvals.chatwoot.*
ls -la app/routes/app.picker-payments.*
ls -la docs/ai/
ls -la docs/api/
ls -la docs/chatwoot/
ls -la docs/data/
ls -la docs/enablement/
ls -la docs/git/
ls -la docs/integrations/
ls -la docs/marketing/
ls -la docs/pilot/
ls -la docs/policies/
ls -la docs/product/
ls -la docs/runbooks/
ls -la docs/support/
ls -la docs/testing/
ls -la feedback/qa-helper*.md
ls -la packages/memory/logs/build/
ls -la scripts/
ls -la supabase/migrations/
ls -la tests/
ls -la themes/

# Identify which files should be:
# - Committed (permanent work)
# - Ignored (temporary/build artifacts)
# - Removed (obsolete)
```

#### Step 3: Coordinate with Localization Agent (15 min)

```bash
# Check if localization agent is active
cat feedback/localization.md | tail -50

# Verify localization/work branch ownership
git log --oneline -20 localization/work

# Document coordination
# - Is localization agent still active?
# - Are there uncommitted changes from localization work?
# - Should this branch be merged or maintained?
```

#### Step 4: Stage and Commit Changes (60 min)

```bash
# Option A: Commit all as single batch (if all related)
git add .
git commit -m "manager: Sync localization/work branch - 47 modified + 73 untracked files

Includes:
- Documentation updates (ai, chatwoot, data, enablement, etc.)
- Picker payment system implementation
- Chatwoot approval queue routes
- Agent feedback updates
- Database migrations
- Testing infrastructure
- Growth spec materials

Evidence: Manager startup checklist execution 2025-10-13T22:15:00Z"

# Option B: Commit by category (if changes are diverse)

# B1: Documentation
git add docs/
git commit -m "docs: Update agent documentation across multiple domains"

# B2: Features
git add app/components/picker-payments/
git add app/routes/app.picker-payments.*
git add app/routes/api.approvals.chatwoot.*
git commit -m "feat: Add picker payments and Chatwoot approval routes"

# B3: Feedback
git add feedback/
git commit -m "chore: Update agent feedback logs"

# B4: Database
git add supabase/migrations/
git add 20251013_picker_payments_schema.sql
git commit -m "db: Add picker payments schema and migrations"

# B5: Scripts & Testing
git add scripts/
git add tests/
git commit -m "test: Add testing infrastructure and helper scripts"

# B6: Configuration
git add app/styles/
git add app/utils/
git add fly.toml
git add package.json
git add shopify.app.toml
git commit -m "config: Update configuration files"

# B7: Growth Spec
git add HotDash_Growth_Spec/
git commit -m "docs: Add Growth Machine specification"
```

#### Step 5: Push to Remote (15 min)

```bash
# Push localization/work branch to remote
git push origin localization/work

# If push fails due to upstream changes:
git fetch origin
git pull --rebase origin localization/work
# Resolve any conflicts
git push origin localization/work

# Verify remote sync
git status
# Should show: "Your branch is up to date with 'origin/localization/work'"
```

#### Step 6: Verify and Document (15 min)

```bash
# Verify clean status
git status
# Should show: "nothing to commit, working tree clean"

# Verify remote has all commits
git log --oneline origin/localization/work -10

# Document completion
cat >> feedback/git-cleanup.md << 'EVIDENCE'

## 2025-10-13T22:15:00Z — P1 REPOSITORY SYNCHRONIZATION COMPLETE

**Manager Assignment**: Sync localization/work branch

**Actions Taken**:
1. ✅ Reviewed 47 modified files
2. ✅ Reviewed 73 untracked files
3. ✅ Coordinated with Localization agent
4. ✅ Staged and committed changes
5. ✅ Pushed to remote: origin/localization/work
6. ✅ Verified clean working tree

**Commits Created**: [List commit SHAs and messages]

**Files Synchronized**: 120 total
- Modified: 47
- Untracked: 73

**Result**: ✅ Repository synchronized, no uncommitted changes

**Evidence**:
- Git status: Clean working tree
- Remote sync: Verified
- Branch: localization/work up to date

**Time Spent**: [Actual time]

**Next**: Standby for next manager assignment

EVIDENCE
```

### Success Criteria

- ✅ All 47 modified files reviewed and committed
- ✅ All 73 untracked files either committed or .gitignored
- ✅ Localization agent coordination documented
- ✅ Commits pushed to origin/localization/work
- ✅ `git status` shows clean working tree
- ✅ Evidence logged to feedback/git-cleanup.md

### Coordination

**Localization Agent**: Verify branch ownership and ongoing work
**Manager**: Report completion for next assignment

### Evidence Required

1. Git status output (before and after)
2. List of commits created
3. Push confirmation
4. Final clean status verification
5. Coordination notes with Localization agent
6. Time spent on task

### Priority Context

This is **P1** work because:
- 120 uncommitted files at risk if system crashes
- Multiple agents' work represented in uncommitted files
- Clean repository needed for safe deployments
- Prevents merge conflicts and work loss
- Supports overall system health

**Manager**: Execute this task immediately. Report progress every 30 minutes to feedback/git-cleanup.md.

**Start Time**: 2025-10-13T22:15:00Z
**Expected Completion**: 2025-10-14T00:45:00Z (2.5 hours)

---

