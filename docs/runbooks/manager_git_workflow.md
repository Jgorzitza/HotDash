# Manager: Git Workflow (Manager-Controlled)

## Purpose
Manager controls ALL git operations to prevent conflicts between agents.

## Core Principle
**Agents write code. Manager handles git.**

## Agent Process (NO GIT COMMANDS)

### What Agents Do:
1. Read direction file
2. Write code in allowed paths
3. Write feedback documenting work
4. Signal completion: Add "WORK COMPLETE - READY FOR PR" to feedback
5. Wait for manager

### What Agents DON'T Do:
- ❌ `git add`
- ❌ `git commit`
- ❌ `git push`
- ❌ `git checkout`
- ❌ `git branch`
- ❌ `git merge`
- ❌ `git pull`
- ❌ `git stash`

### Agents CAN Use (Read-Only):
- ✅ `git status` (see what changed)
- ✅ `git diff` (see changes)
- ✅ `git log` (see history)

## Manager Process (ALL GIT OPERATIONS)

### 1. Monitor Agent Feedback
```bash
# Check for completion signals
grep -r "WORK COMPLETE" feedback/*/2025-*.md
```

### 2. When Agent Signals Complete

**For each completed agent:**

```bash
# Set agent name
AGENT=engineer

# Create branch (if doesn't exist)
git checkout -b agent/${AGENT}/$(date +%Y%m%d)-task || git checkout agent/${AGENT}/$(date +%Y%m%d)-task

# Add agent's changed files
git add app/ tests/ docs/specs/ feedback/${AGENT}/

# Commit with agent's work description
git commit -m "${AGENT}: [description from feedback]

[Copy work summary from agent feedback]

Files changed:
- [list from git status]

Evidence: feedback/${AGENT}/2025-10-15.md"

# Push to remote
git push origin agent/${AGENT}/$(date +%Y%m%d)-task

# Return to main
git checkout main
```

### 3. Create PR

```bash
# Create PR with proper format
gh pr create \
  --base main \
  --head agent/${AGENT}/$(date +%Y%m%d)-task \
  --title "${AGENT}: [Task Description]" \
  --body "**Agent:** ${AGENT}
**Priority:** P0
**Issues:** Fixes #[issue]

## Definition of Done
[Copy from agent feedback]

## Acceptance Checks
[Copy from agent feedback]

## Allowed paths
\`\`\`
[agent's allowed paths]
\`\`\`

## Work Summary
[Copy from agent feedback]

## Evidence
- Feedback: feedback/${AGENT}/2025-10-15.md
- Tests: [test results]
- Screenshots: [if applicable]

## Rollback Plan
[from agent feedback]

---
**Branch:** agent/${AGENT}/$(date +%Y%m%d)-task
**Commit:** $(git rev-parse HEAD)
**WORK COMPLETE - READY FOR REVIEW**" \
  --label "task,P0"
```

### 4. Review PR

```bash
# Check PR
gh pr view [number]

# Check CI
gh pr checks [number]

# Review code
gh pr diff [number]
```

### 5. Merge PR

```bash
# When ready
gh pr merge [number] --squash --delete-branch --admin
```

### 6. Update Agent Direction

After merge, update agent's direction file with next task.

## Handling Multiple Agents

### Sequential Processing
Process agents one at a time to avoid conflicts:

```bash
# Process queue
for agent in engineer integrations data; do
  if grep -q "WORK COMPLETE" feedback/${agent}/2025-*.md; then
    echo "Processing ${agent}..."
    # Run steps 2-5 above
  fi
done
```

### Branch Naming Convention
- Format: `agent/<agent-name>/<date>-<task-slug>`
- Example: `agent/engineer/20251015-approval-queue`
- Ensures unique branches per agent per day

## Deployment to Live App

### After PR Merge

```bash
# Automatic deployment to staging (via GitHub Actions)
# Monitor: https://github.com/Jgorzitza/HotDash/actions

# Check staging
fly status -a hotdash-staging

# If staging healthy, deploy to production (manual)
gh workflow run deploy-production.yml
```

### Verify Live App

```bash
# Check production
fly status -a hotdash

# View logs
fly logs -a hotdash

# Test live app
curl https://hotdash.fly.dev/health
```

## Troubleshooting

### Agent Created Branch/Committed
If agent violated process:
```bash
# Stash their changes
git stash

# Delete their branch
git branch -D agent/${AGENT}/bad-branch

# Recreate properly
# Follow steps 2-5 above
```

### Merge Conflict
```bash
# Pull latest
git pull origin main

# Resolve conflicts
git mergetool

# Complete merge
git commit
git push
```

### Lost Work
```bash
# Find agent's commits
git reflog | grep ${AGENT}

# Recover
git cherry-pick [commit-hash]
```

## Daily Checklist

- [ ] Monitor agent feedback for "WORK COMPLETE" signals
- [ ] Create branches for completed work
- [ ] Commit with proper messages
- [ ] Push to remote
- [ ] Create PRs with full evidence
- [ ] Review and merge PRs
- [ ] Deploy to staging
- [ ] Verify live app
- [ ] Update agent directions with next tasks

## Success Metrics

- **0 git conflicts** between agents
- **All work captured** in PRs
- **Clear audit trail** of who did what
- **Live app updated** regularly
- **Agents focused** on code, not git

