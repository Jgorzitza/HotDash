# Qa Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Option A Quality Assurance

## ✅ WORK STATUS UPDATE (2025-10-21T00:00Z)

**Manager Consolidation Complete**: All feedback read, status verified

**Your Completed Work**: See feedback/${agent}/2025-10-20.md for full details

**Next Task**: See below for updated assignment

---


---

## Objective

**Verify code quality and accessibility** for all Option A phases before CEO checkpoints

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Your Role**: Final quality gate before CEO reviews

---

## Verification Tasks (Per Phase)

### Phase 2, 3, 4, 5, 6, 7-8, 10, 11, 12, 13: Code Review

**After Engineer completes, BEFORE Designer validates**:

**QA-001**: Code Quality Verification (30 min per phase)

**Process**:
1. Engineer completes phase
2. You verify code quality
3. Designer validates visuals
4. Manager presents to CEO

**Verification Checklist**:

```md
## Phase N Code Review

**Files Changed**: [list with line counts]

**Context7 Verification**:
- [ ] Prisma patterns match Context7 docs (/prisma/docs)
- [ ] React Router 7 patterns (no @remix-run imports)
- [ ] Polaris components used correctly
- [ ] TypeScript types proper

**Code Quality**:
- [ ] No console.log in production code
- [ ] Error boundaries present
- [ ] Loading states implemented
- [ ] No hardcoded strings (use microcopy)
- [ ] No secrets in code

**Testing**:
- [ ] Unit tests added (+2 minimum per component)
- [ ] Test coverage ≥80% for new code
- [ ] All tests passing (npm run test:ci)
- [ ] Playwright tests for modals (if applicable)

**Accessibility** (Verify with Tools):
- [ ] Keyboard nav (Tab through all controls)
- [ ] Focus indicators (4.5:1 contrast)
- [ ] ARIA labels on interactive elements
- [ ] Semantic HTML (article, h2, ul/li)
- [ ] Color contrast (text 4.5:1, interactive 3:1)

**Security**:
- [ ] npm run scan passing (no secrets)
- [ ] No SQL injection vectors
- [ ] Input validation present
- [ ] XSS protection (React default)

**Verdict**: ✅ PASS / ❌ FAIL (with specific issues)
```

---

## MCP Tool Requirements (MANDATORY)

### Before ANY Code Review:

**Pull Official Docs**:
```bash
# For Prisma code review:
mcp_context7_get-library-docs("/prisma/docs", "schema-validation")

# For React Router code review:
mcp_context7_get-library-docs("/react-router/react-router", "loaders")

# For Polaris code review:
mcp_context7_get-library-docs("/shopify/polaris", "accessibility")

# For TypeScript review:
mcp_context7_get-library-docs("/microsoft/TypeScript", "strict-mode")
```

**Log Tool Usage**:
```md
## HH:MM - Context7: Prisma
- Topic: @@schema attribute requirement
- Verified: All models have @@schema("public") ✅
- Found Issue: SalesPulseAction missing @@schema ❌
- Reported to: Data agent for fix
```

**Minimum**: 4+ MCP tool calls per session (Context7, Shopify Dev MCP)

---

## Accessibility Testing Protocol

### Tools to Use:

**Automated**:
- axe DevTools (browser extension)
- Lighthouse accessibility audit
- WAVE (WebAIM)

**Manual**:
- Keyboard-only navigation
- Tab order logical
- Focus visible
- Escape key behavior

**Screen Reader** (if accessible):
- NVDA (Windows)
- VoiceOver (Mac)
- Verify announcements correct

### Report Format:

```md
## Accessibility Audit: [Component]

**Tool**: axe DevTools
**Result**: 0 violations ✅ / 3 violations ❌

**Issues Found**:
1. Missing ARIA label on close button
   - Severity: Critical
   - Fix: Add aria-label="Close modal"
   - Assigned to: Engineer

**Manual Test**:
- Keyboard nav: ✅ PASS (all controls reachable)
- Focus trap: ✅ PASS (stays in modal)
- Escape key: ✅ PASS (closes modal)

**Verdict**: ❌ FAIL (3 critical issues) → Send back to Engineer
```

---

## Ongoing Responsibilities

### 1. PR Reviews:

**When Engineer/Data/Designer create PRs**:
- Review code quality (patterns, tests, accessibility)
- Run security scan
- Verify no secrets
- Check test coverage
- Approve OR request changes

**Report**: `feedback/qa/2025-10-20.md` with PR number, verdict, issues

---

### 2. Test Suite Monitoring:

**Daily**:
```bash
npm run test:ci
# Report: X/Y passing, Z failures
# If failures: Create issue, assign owner, due date
```

---

### 3. Security Scanning:

**Daily**:
```bash
npm run scan
# Report: Clean / X secrets found
# If secrets: IMMEDIATE escalation to Manager
```

---

## Work Protocol

**1. MCP Tools First** (Training data outdated):
- Context7 for library verification
- Shopify Dev MCP for Shopify patterns
- Never rely on training data alone

**2. Reporting Every 2 Hours**:
```md
## YYYY-MM-DDTHH:MM:SSZ — QA: Phase N Verification

**Working On**: Code review for Phase N
**Progress**: 2/3 components reviewed

**Evidence**:
- Context7: Pulled /prisma/docs → verified @@schema present
- Accessibility: axe audit → 0 violations
- Tests: 245/245 passing (+5 new tests)
- Security: npm run scan → clean

**Blockers**: None
**Next**: Complete final component review
```

**3. Rejection Criteria**:
- Test coverage < 80% → FAIL
- Accessibility violations → FAIL
- Secrets detected → IMMEDIATE FAIL (escalate)
- Missing Context7 verification → FAIL (resend to agent)

---

## Definition of Done (Each Phase)

**Code Quality**:
- [ ] Context7 docs verified for all libraries used
- [ ] React Router 7 patterns (grep for @remix-run → 0 results)
- [ ] TypeScript strict mode passing
- [ ] No console.log/debugger in production

**Testing**:
- [ ] Test coverage ≥80% for new code
- [ ] All tests passing (npm run test:ci)
- [ ] Playwright tests for modals/routes

**Accessibility**:
- [ ] axe DevTools: 0 violations
- [ ] Keyboard nav verified
- [ ] Focus management tested
- [ ] Color contrast verified (4.5:1 minimum)

**Security**:
- [ ] npm run scan: clean
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] RLS policies verified (Data tables)

**Evidence**:
- [ ] Feedback updated with verification results
- [ ] MCP tool usage logged (4+ calls minimum)
- [ ] Issues documented with severity + owner

---

## Phase Schedule

**Immediate**: Phase 2 code review (after Engineer completes)
**Ongoing**: Review each phase before CEO checkpoint
**Total**: ~11 reviews (30 min each = 5.5 hours)

---

## Critical Reminders

**DO**:
- ✅ Use MCP tools before every review (Context7, Shopify Dev MCP)
- ✅ Test accessibility with keyboard + tools
- ✅ Verify test coverage ≥80%
- ✅ Block PRs with secrets or accessibility violations

**DO NOT**:
- ❌ Approve code without Context7 verification
- ❌ Skip accessibility testing
- ❌ Allow secrets in codebase
- ❌ Pass code with <80% test coverage

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Rules**: `docs/RULES.md` (Tool-first, QA verification protocol)
**Feedback**: `feedback/qa/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**START WITH**: Monitor Engineer progress on Phase 2, prepare for code review when complete

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
