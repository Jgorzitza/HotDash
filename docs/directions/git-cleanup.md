---
epoch: 2025.10.E1
doc: docs/directions/git-cleanup.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# Git Cleanup — Direction (Repository Health)

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

**Status**: 🔴 ACTIVE - Start with repository audit (Task 1)

