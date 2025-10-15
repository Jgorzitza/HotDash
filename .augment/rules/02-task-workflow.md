---
description: GitHub Issues workflow, PR requirements, and task management process
globs:
  - "**/*"
alwaysApply: true
---

# Task Workflow & Process

**Source:** `docs/OPERATING_MODEL.md`, `docs/RULES.md`

## Single Ledger: GitHub Issues

**GitHub Issues are the ONLY source of truth for tasks.**

### Required Fields in Every Issue

1. **Agent** - Who owns this task
2. **Definition of Done** - Clear acceptance criteria
3. **Acceptance checks** - How to verify completion
4. **Allowed paths** - File patterns this task can modify (fnmatch format)

### Example Issue Format

```markdown
**Agent:** engineer
**Definition of Done:**
- [ ] User authentication flow implemented
- [ ] Tests pass with >80% coverage
- [ ] Rollback documented

**Acceptance Checks:**
- [ ] Can log in with valid credentials
- [ ] Invalid credentials show error
- [ ] Session persists across page refresh

**Allowed paths:** app/routes/auth.*, app/services/auth.*, tests/auth.*
```

## PR Requirements

Every PR MUST include:

### 1. Issue Linkage
```markdown
Fixes #123
```

### 2. Allowed Paths Declaration
```markdown
Allowed paths: app/routes/auth.*, app/services/auth.*, tests/auth.*
```

### 3. Definition of Done Checklist
Copy from the Issue and check off completed items

### 4. Evidence
- Test results
- Screenshots (if UI changes)
- Rollback plan
- Impact assessment

## Workflow Pipeline

**Signals → Suggestions → Approvals → Actions → Audit → Learn**

### 1. Signals
- Shopify Admin GraphQL (orders, inventory, tags/metafields)
- Supabase (metrics/evals)
- Chatwoot (Email/Live Chat/SMS)
- Social analytics (read-only first)

### 2. Suggestions
Agents propose:
- Inventory (ROP, PO drafts)
- CX (draft replies)
- Growth (SEO/ads/content)

**Must include:**
- Evidence (queries, samples, diffs)
- Projected impact
- Risks and rollback plan
- Affected paths/entities

### 3. Approvals
- The Approvals Drawer validates tool calls
- HITL enforced for customer/social interactions
- "Approve" disabled until evidence + rollback + `/validate` OK

### 4. Actions
**Server-side tools ONLY:**
- Shopify mutations (guarded)
- Supabase RPC
- Chatwoot public reply from approved Private Note
- Social post via adapter (Ayrshare)

### 5. Audit
- Persist receipts
- Store logs
- Capture before/after state
- Save rollback artifacts

### 6. Learn
- Capture human edits
- Record 1-5 grades (tone/accuracy/policy for CX)
- Feed evals and fine-tuning

## Task Sizing

### Molecules (≤ 2 days)
- Break large tasks into 2-day molecules
- Each molecule is a complete, shippable unit
- Has its own DoD and acceptance criteria

### Assignment
- Manager assigns 10-15 molecules per agent
- Each has clear DoD + Allowed paths
- Linked to GitHub Issue

## Danger Enforcement

Danger automatically checks every PR for:

- ✅ Issue linkage (`Fixes #<issue>`)
- ✅ Allowed paths declaration
- ✅ Files stay within allowed paths
- ✅ No disallowed `.md` files
- ✅ HITL config enforced for `ai-customer`

**If any check fails, PR is blocked.**

## Allowed Paths Format

Use fnmatch patterns:

```
app/routes/auth.*           # All files in auth directory
app/services/auth.server.ts # Specific file
tests/**                    # All test files
packages/*/src/**           # All src in any package
```

**Danger validates:**
- All changed files match at least one pattern
- No files outside the patterns are modified

## Feedback Logs

### Daily Feedback File
Each agent writes to: `feedback/<agent>/<YYYY-MM-DD>.md`

**Include:**
- Progress on assigned tasks
- Blockers encountered
- Questions for manager
- Unexpected findings
- Decisions needed

**Manager reviews:**
- During startup checklist
- Extracts blockers
- Updates agent directions
- Adds Issue comments for decisions

## Direction Files

Each agent has: `docs/directions/<agent>.md`

**Must follow:** `docs/directions/agenttemplate.md`

**Manager updates:**
- Today's objective (≤ 2-day molecule)
- Constraints and guardrails
- Answers to questions from feedback
- Links to active Issues/PRs
- Archive completed items

## Stop the Line Conditions

**Do NOT proceed if:**

❌ PR missing Issue linkage
❌ PR missing Allowed paths
❌ Files outside Allowed paths modified
❌ Disallowed `.md` files created
❌ CI checks failing
❌ Approvals without evidence/rollback
❌ `/validate` endpoint failing

**Action:** Send PR back with specific gap identified

## Verification Before Merge

- [ ] Issue linkage present (`Fixes #<issue>`)
- [ ] Allowed paths declared and matched
- [ ] DoD checklist complete
- [ ] Tests pass (or justified why not)
- [ ] Rollback documented
- [ ] Evidence provided
- [ ] CI checks green
- [ ] No disallowed `.md` files
- [ ] HITL config intact (if applicable)

## Common Workflow Patterns

### Bug Fix
1. Create Issue with bug description
2. Define DoD (bug fixed, test added, rollback plan)
3. Set Allowed paths (files to fix)
4. Create PR with `Fixes #<issue>`
5. Include test demonstrating fix
6. Document rollback (revert commit)
7. Merge when CI green

### Feature Development
1. Create Issue with feature spec
2. Break into ≤ 2-day molecules
3. Define DoD for each molecule
4. Set Allowed paths
5. Create PR per molecule
6. Include tests and evidence
7. Document rollback
8. Merge incrementally

### Refactoring
1. Create Issue with refactoring goal
2. Define DoD (behavior unchanged, tests pass)
3. Set Allowed paths (files to refactor)
4. Create PR with before/after comparison
5. Prove behavior unchanged (tests)
6. Document rollback
7. Merge when verified

## Manager Responsibilities

### Daily Startup
- Review feedback files
- Extract blockers
- Update directions
- Assign/resize molecules
- Confirm DoD + Allowed paths

### Daily Shutdown
- Verify PR compliance
- Merge or request changes
- Roll learnings into RULES/directions
- Log summary in manager feedback

### Continuous
- Monitor CI status
- Enforce Allowed paths
- Block non-compliant PRs
- Maintain governance docs

