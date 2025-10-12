# Git Workflow Training Guide

**Last Updated**: 2025-10-12  
**Audience**: All HotDash Agents  
**Status**: ACTIVE

---

## 🎯 Quick Start (TL;DR)

**Your Branch**: `{agent}/work` (e.g., `compliance/work`, `engineer/work`)
**Workflow**: Work → Commit → Push → PR to main
**Rule**: ONE branch per agent, NO temporary branches

---

## New Git Workflow (Oct 2025)

### Branch Standard

**Format**: `{agent}/work`

Each agent has ONE persistent work branch:
- `compliance/work` - Compliance agent
- `data/work` - Data agent  
- `engineer/work` - Engineer agent
- `git-cleanup/work` - Git Cleanup agent
- `integrations/work` - Integrations agent
- `localization/work` - Localization agent
- `marketing/work` - Marketing agent

### Daily Workflow

```bash
# 1. Start work (switch to your branch)
git checkout {agent}/work

# 2. Pull latest changes
git pull origin main
git merge main  # Keep your branch current

# 3. Do your work, make changes...

# 4. Commit your work
git add .
git commit -m "type(scope): description"

# 5. Push to remote
git push origin {agent}/work

# 6. Create PR when ready
# Go to GitHub → New Pull Request
# Base: main ← Head: {agent}/work
```

### Commit Message Format

Use **Conventional Commits**:

```
type(scope): description

Examples:
- feat(tiles): add Sales Pulse tile
- fix(auth): resolve session timeout issue
- docs(readme): update installation steps
- chore(deps): update dependencies
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `chore`: Maintenance
- `test`: Tests
- `refactor`: Code refactoring
- `style`: Formatting
- `perf`: Performance

---

## 🚫 What NOT to Do

### ❌ DON'T Create Temporary Branches

```bash
# ❌ WRONG
git checkout -b agent/compliance/staging-push
git checkout -b agent/compliance/fix-bug-123
git checkout -b feature/new-tile

# ✅ CORRECT
git checkout compliance/work
# Do all work in your /work branch
```

### ❌ DON'T Commit to Main Directly

```bash
# ❌ NEVER DO THIS
git checkout main
git commit -m "quick fix"  # WRONG!

# ✅ ALWAYS USE YOUR BRANCH
git checkout {agent}/work
git commit -m "fix: quick fix"
git push
# Then create PR
```

### ❌ DON'T Force Push to Main

```bash
# ❌ ABSOLUTELY NEVER
git push --force origin main  # DANGEROUS!

# ✅ Your branch is OK (with caution)
git push --force origin {agent}/work  # Use sparingly
```

---

## 📋 Pull Request Process

### Creating a PR

1. **Push your branch**:
   ```bash
   git push origin {agent}/work
   ```

2. **Go to GitHub**: https://github.com/Jgorzitza/HotDash

3. **Click "New Pull Request"**

4. **Set branches**:
   - Base: `main`
   - Compare: `{agent}/work`

5. **Fill PR template**:
   - Clear title (use conventional commits format)
   - Description of changes
   - Link to evidence/artifacts
   - Testing notes

### PR Requirements

Every PR must include:
- ✅ Code changes
- ✅ Tests (unit and/or e2e if applicable)
- ✅ Documentation updates
- ✅ Decision log entries (if needed)
- ✅ Evidence/artifact links

### After PR is Merged

**DON'T delete your `/work` branch!**

```bash
# After merge, update your branch
git checkout {agent}/work
git pull origin main
git merge main

# Continue working in same branch
```

---

## 🔧 Common Scenarios

### Scenario 1: Starting Fresh

```bash
# First time setup
git clone https://github.com/Jgorzitza/HotDash.git
cd HotDash

# Switch to your branch
git checkout {agent}/work

# Start working!
```

### Scenario 2: Syncing with Main

```bash
# Your branch is behind main
git checkout {agent}/work
git fetch origin
git merge origin/main

# Resolve any conflicts
git add .
git commit -m "chore: sync with main"
git push
```

### Scenario 3: Fixing a Mistake

```bash
# Undo last commit (not pushed yet)
git reset --soft HEAD~1

# Undo changes in a file
git checkout -- filename.ts

# Revert a pushed commit (creates new commit)
git revert <commit-hash>
git push
```

### Scenario 4: Merge Conflicts

```bash
# When merging main and conflicts occur
git checkout {agent}/work
git merge main

# Git will show conflicts
# Edit conflicted files, look for:
# <<<<<<< HEAD
# your changes
# =======
# main's changes
# >>>>>>> main

# After fixing:
git add .
git commit -m "chore: resolve merge conflicts with main"
git push
```

---

## 🔒 Security Best Practices

### Never Commit Secrets

```bash
# ❌ NEVER commit these files
.env
.env.local
vault/**

# ✅ These are already in .gitignore
# Just never override with --force
```

### Pre-commit Hook

A pre-commit hook scans for secrets automatically:
- Located: `.git/hooks/pre-commit`
- Runs: `gitleaks` secret scanner
- Blocks: Commits with detected secrets

**If secrets are detected**:
1. Remove the secret
2. Add `[REDACTED]` placeholder
3. Store actual secret in `vault/` with 600 permissions
4. Update `docs/ops/credential_index.md`

---

## 📊 Repository Structure

```
HotDash/
├── main (protected, production-ready)
├── {agent}/work branches (7 active)
│   ├── compliance/work
│   ├── data/work
│   ├── engineer/work
│   ├── git-cleanup/work
│   ├── integrations/work
│   ├── localization/work
│   └── marketing/work
└── Special branches
    ├── backup/* (rollback points)
    └── originstory (historical)
```

---

## 🆘 Troubleshooting

### "Your branch is behind 'origin/main'"

```bash
git pull origin main
git merge main
```

### "You have uncommitted changes"

```bash
# Commit them
git add .
git commit -m "wip: work in progress"

# Or stash them temporarily
git stash
# ... do other work ...
git stash pop
```

### "Merge conflict in ..."

1. Open the conflicted file
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Choose which changes to keep
4. Remove conflict markers
5. Test that code works
6. Commit: `git add . && git commit`

### "I'm on the wrong branch!"

```bash
# Move uncommitted changes to correct branch
git stash
git checkout {correct-agent}/work
git stash pop
```

---

## 📚 Additional Resources

- **Git Protocol**: `docs/git_protocol.md` (comprehensive rules)
- **Repository Status**: `REPO_STATUS.md` (current state)
- **Feedback Log**: `feedback/git-cleanup.md` (cleanup history)

---

## 🎓 Training Checklist

Before starting work, ensure you:
- [ ] Know your branch name: `{agent}/work`
- [ ] Have cloned the repository
- [ ] Can switch to your branch: `git checkout {agent}/work`
- [ ] Understand commit message format
- [ ] Know how to create a PR
- [ ] Never commit secrets
- [ ] Never work directly on main

---

## 🚀 Launch Week (Oct 13-15)

During launch week:
- ✅ Use your `/work` branch as normal
- ✅ Create PRs for any changes
- ✅ Keep PRs small and focused
- ✅ Test thoroughly before merging
- ⚠️ Coordinate with manager for urgent fixes

**Git Cleanup Agent on standby** for any git issues!

---

**Questions?** Log them in your agent's feedback file (`feedback/{agent}.md`)

**Last Updated**: 2025-10-12 by Git Cleanup Agent

