# New Git Process Section (for all agent directions)

## Git Process (Manager-Controlled)

**YOU DO NOT USE GIT COMMANDS** (except read-only)

### What You Do:
1. Read this direction file
2. Write code in allowed paths
3. Write feedback documenting work
4. **Signal completion:** Add "WORK COMPLETE - READY FOR PR" to your feedback file
5. Wait for manager to create PR

### What You DON'T Do:
- ❌ `git add`
- ❌ `git commit`
- ❌ `git push`
- ❌ `git checkout`
- ❌ `git branch`
- ❌ `git merge`

### What You CAN Do (Read-Only):
- ✅ `git status` (see what you changed)
- ✅ `git diff` (see your changes)
- ✅ `git log` (see history)

### Why:
- Prevents git conflicts between agents
- Manager handles all git operations
- You focus on code, not git
- See: `docs/runbooks/manager_git_workflow.md`

### Completion Signal:
When your work is complete, add this to your feedback file:
```
## WORK COMPLETE - READY FOR PR

**Summary:** [Brief description of what you built]

**Files Changed:**
- [List files you created/modified]

**Tests:** [Test results]

**Evidence:** [Link to feedback, screenshots, etc.]
```

Manager will then:
1. Create branch
2. Commit your work
3. Push to remote
4. Create PR
5. Review and merge
6. Update your direction with next task

