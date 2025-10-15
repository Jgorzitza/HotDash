# QA Validation Process - Agent Task Quality Verification

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Authority**: Manager Assignment (2025-10-11T22:30:00Z)

---

## Mission

**Validate all agent task completions for quality and evidence standards before manager review.**

Guard the evidence gates - ensure every task completion includes verifiable proof:
- File paths (not just "created document")
- Line numbers for code changes
- Test results (not just "tests pass")
- Artifacts (screenshots, logs, benchmarks)

---

## Validation Cycle

### Schedule
- **Frequency**: Every 4 hours
- **Scope**: All agent feedback files
- **Sample Size**: 3-5 tasks per agent (random selection)
- **Deliverable**: Validation report in feedback/qa.md

### Timing
- **Cycle 1**: 00:00-04:00 UTC (validate at 04:00)
- **Cycle 2**: 04:00-08:00 UTC (validate at 08:00)
- **Cycle 3**: 08:00-12:00 UTC (validate at 12:00)
- **Cycle 4**: 12:00-16:00 UTC (validate at 16:00)
- **Cycle 5**: 16:00-20:00 UTC (validate at 20:00)
- **Cycle 6**: 20:00-00:00 UTC (validate at 00:00)

---

## Evidence Standards

### Code Changes
**Required**:
- ✅ Exact file path (e.g., `app/services/chatwoot/escalations.ts`)
- ✅ Line numbers or function names (e.g., `lines 45-67` or `getEscalations function`)
- ✅ Description of what changed
- ✅ Why it changed (business reason)

**NOT Acceptable**:
- ❌ "Updated the code"
- ❌ "Made changes to service"
- ❌ "Fixed the file"

**Example - GOOD**:
```
File: app/services/chatwoot/escalations.ts (lines 102-145)
Changes: Added template selection heuristics
- Added refund keyword detection (lines 115-120)
- Added shipping delay detection (lines 125-130)
- Enhanced template matching logic (lines 135-145)
Reason: Enable AI to suggest appropriate response templates
```

---

### Test Evidence
**Required**:
- ✅ Test file path (e.g., `tests/unit/chatwoot.escalations.spec.ts`)
- ✅ Test count (e.g., "6 tests passing")
- ✅ Test execution output or screenshot
- ✅ Coverage impact (if applicable)

**NOT Acceptable**:
- ❌ "Tests pass"
- ❌ "All tests working"
- ❌ "Tested it"

**Example - GOOD**:
```
Test File: tests/unit/chatwoot.escalations.spec.ts
Results: 6/6 tests passing
Output: artifacts/qa/test-output-20251011.log
Coverage: Service layer 92% (up from 78%)
New Tests:
- should select refund_offer template (line 45)
- should select ship_update template (line 62)
```

---

### Documentation Evidence
**Required**:
- ✅ Document path (e.g., `docs/testing/TESTING_GUIDE.md`)
- ✅ Section names or headings
- ✅ Word/line count
- ✅ Key topics covered

**NOT Acceptable**:
- ❌ "Created documentation"
- ❌ "Documented the feature"
- ❌ "Added docs"

**Example - GOOD**:
```
Document: docs/testing/TESTING_GUIDE.md (20KB, 600 lines)
Sections:
- Quick Start (lines 1-50)
- Unit Testing with Vitest (lines 51-200)
- E2E Testing with Playwright (lines 201-350)
- Debugging Tests (lines 351-450)
Topics: Test pyramid, mocking, fixtures, CI integration
```

---

### Design Evidence
**Required**:
- ✅ Asset file paths (e.g., `artifacts/design/approval-card-mockup.png`)
- ✅ Screenshots or visual proof
- ✅ Specifications document
- ✅ Component names and properties

**NOT Acceptable**:
- ❌ "Designed the UI"
- ❌ "Created mockups"
- ❌ "Completed design"

**Example - GOOD**:
```
Design: Approval Card Component
Spec: docs/design/approval-card-spec.md (12KB)
Mockups:
- artifacts/design/approval-card-high-confidence.png
- artifacts/design/approval-card-low-confidence.png
- artifacts/design/approval-card-urgent.png
Components: ApprovalCard, ConfidenceBadge, ActionButtons
Properties: confidence_score, recommended_action, customer_message
```

---

## Validation Procedure

### Step 1: Identify Agents

```bash
ls feedback/*.md | grep -v manager.md | grep -v qa.md
```

**Active Agents** (expected):
- ai.md (AI agent)
- engineer.md (Engineer agent)
- designer.md (Designer agent)
- data.md (Data agent)
- deployment.md (Deployment agent)
- reliability.md (Reliability agent)
- integrations.md (Integrations agent)
- compliance.md (Compliance agent)
- Other agents as needed

---

### Step 2: Review Agent Feedback

For each agent:

1. **Read feedback file** (`feedback/{agent}.md`)
2. **Identify completed tasks** (look for ✅, COMPLETE, timestamps)
3. **Count total tasks** claimed complete
4. **Random sample** 3-5 tasks (or all if <5 tasks)

---

### Step 3: Validate Evidence

For each sampled task, check:

**Question 1: Is there evidence?**
- [ ] File paths provided?
- [ ] Test results shown?
- [ ] Artifacts referenced?
- [ ] Line numbers or specific locations?

**Question 2: Can I verify it?**
- [ ] Do the files exist?
- [ ] Do the tests actually pass?
- [ ] Are the artifacts accessible?
- [ ] Can I reproduce the results?

**Question 3: Is the quality acceptable?**
- [ ] Work meets requirements?
- [ ] No obvious bugs or issues?
- [ ] Follows project standards?
- [ ] Documentation is clear?

---

### Step 4: Rate Quality

**🟢 High Quality** (Excellent):
- All evidence provided
- Files exist and are high quality
- Tests pass, coverage good
- Documentation comprehensive
- Exceeds requirements
- **Action**: Approve, commend in report

**🟡 Needs Work** (Acceptable with Issues):
- Most evidence provided
- Files exist but quality issues
- Tests pass but coverage gaps
- Documentation incomplete
- Meets minimum requirements
- **Action**: Note issues, agent should improve

**🔴 Rework Required** (Unacceptable):
- Missing evidence
- Files don't exist or are broken
- Tests fail
- Documentation missing or wrong
- Does not meet requirements
- **Action**: Escalate to manager, agent must redo

---

### Step 5: Document Findings

**Format** (in feedback/qa.md):

```markdown
## YYYY-MM-DDTHH:MM:SSZ — Agent Quality Validation Report

**Validation Cycle**: Cycle N (HH:00-HH:00 UTC)
**Agents Reviewed**: X agents
**Tasks Sampled**: Y tasks

### Agent: {agent_name}

**Tasks Claimed**: Z tasks complete
**Sample Size**: 3-5 tasks (random selection)

#### Sample 1: {Task Name}
**Claim**: {What agent said they did}
**Evidence Check**:
- Files: {exist/missing}
- Tests: {pass/fail/not found}
- Artifacts: {found/not found}
- Quality: {description}

**Rating**: 🟢 / 🟡 / 🔴
**Notes**: {specific findings}

#### Sample 2: {Task Name}
...

**Overall Agent Rating**: 🟢 / 🟡 / 🔴
**Recommendation**: {Approve / Request improvements / Escalate to manager}

---

**Summary**:
- 🟢 High Quality: X agents
- 🟡 Needs Work: Y agents
- 🔴 Rework Required: Z agents

**Escalations**: {Any critical issues for manager}
```

---

## Verification Commands

### Check File Exists
```bash
ls -lh {file_path}
```

### Check Code Changes
```bash
git log --oneline --all -- {file_path}
grep -n "function_name" {file_path}
```

### Run Tests
```bash
npm run test:unit {test_file}
npm run test:e2e {test_file}
```

### Check Artifacts
```bash
ls -lh artifacts/{agent}/*
find artifacts/ -name "*{pattern}*" -mtime -1
```

### Verify Documentation
```bash
wc -l {doc_path}
grep -n "## Section Name" {doc_path}
```

---

## Escalation Criteria

**Immediate Escalation to Manager**:
- Agent claims 10+ tasks but provides zero evidence
- Critical security issue found (secrets in code)
- Tests failing that agent claims pass
- Files don't exist that agent claims created
- Evidence contradicts agent claims
- Multiple 🔴 ratings for same agent

**Report in Next Cycle**:
- Agent needs minor improvements (🟡 ratings)
- Documentation gaps (non-critical)
- Test coverage below target but improving
- Style/formatting issues

---

## Validation Checklist

### Before Each Cycle

- [ ] Check time (validate at :00 of each 4-hour block)
- [ ] Pull latest from all agents (`git pull` if needed)
- [ ] Create validation artifact directory
- [ ] Prepare validation notes template

### During Validation

- [ ] Read all agent feedback files
- [ ] Sample 3-5 tasks per agent (random)
- [ ] Verify file existence
- [ ] Run tests if applicable
- [ ] Check artifact quality
- [ ] Rate each sampled task
- [ ] Calculate overall agent rating

### After Validation

- [ ] Document findings in feedback/qa.md
- [ ] Escalate critical issues to manager immediately
- [ ] Save validation artifacts
- [ ] Update agent quality scorecard
- [ ] Set reminder for next cycle

---

## Agent Quality Scorecard

**Track Over Time**:

| Agent | Cycle 1 | Cycle 2 | Cycle 3 | Trend | Notes |
|-------|---------|---------|---------|-------|-------|
| AI | 🟢 | 🟢 | 🟢 | Stable | Excellent evidence |
| Engineer | 🟢 | 🟡 | 🟢 | Improving | Minor doc gaps |
| Designer | 🟢 | 🟢 | 🟢 | Stable | Great screenshots |
| Data | 🟡 | 🟢 | 🟢 | Improving | Added artifacts |

---

## Common Issues & Remediation

### Issue: "Task complete" with no evidence
**Remediation**: Tag agent, request file paths and test results
**Rating**: 🔴 if critical, 🟡 if minor

### Issue: Files claimed but don't exist
**Remediation**: Escalate immediately to manager
**Rating**: 🔴 Always

### Issue: Tests claimed passing but actually failing
**Remediation**: Run tests, document actual results, escalate
**Rating**: 🔴 Always

### Issue: Documentation incomplete
**Remediation**: Note in report, agent should enhance
**Rating**: 🟡 Usually

### Issue: Good work but poor documentation
**Remediation**: Commend work, request better evidence
**Rating**: 🟡 with guidance

---

## Sample Validation Report

```markdown
## 2025-10-11T22:30:00Z — Agent Quality Validation Report (Cycle 1)

**Validation Window**: 18:30-22:30 UTC
**Agents Reviewed**: 8 agents
**Tasks Sampled**: 28 tasks (3-5 per agent)
**Validation Duration**: 90 minutes

---

### Agent: Engineer

**Tasks Claimed**: 12 tasks complete
**Sample Size**: 5 tasks (random selection from last 4 hours)

#### Sample 1: "Implement Agent SDK webhook handler"
**Evidence Check**:
- File: supabase/functions/chatwoot-webhook/index.ts ✅ EXISTS (267 lines)
- Tests: tests/integration/chatwoot-webhook.spec.ts ✅ EXISTS (stub with TODOs)
- Code Quality: Comprehensive implementation with error handling ✅
- Documentation: Referenced in docs/integrations/agent_sdk_integration_plan.md ✅

**Rating**: 🟢 HIGH QUALITY
**Notes**: Excellent work. Well-structured code, error handling present, integration points clear.

#### Sample 2: "Add Chatwoot API client methods"
**Evidence Check**:
- File: packages/integrations/chatwoot.ts ✅ EXISTS
- Methods: createPrivateNote (lines 89-97), assignAgent (lines 99-107) ✅ VERIFIED
- Tests: tests/unit/chatwoot.action.spec.ts ✅ PASSING
- Documentation: Methods documented inline ✅

**Rating**: 🟢 HIGH QUALITY
**Notes**: Clean implementation, tests passing, good inline documentation.

...(3 more samples)

**Overall Rating**: 🟢 HIGH QUALITY (5/5 samples excellent)
**Recommendation**: APPROVED - Excellent evidence and quality standards

---

### Agent: Designer

**Tasks Claimed**: 8 tasks complete
**Sample Size**: 4 tasks

#### Sample 1: "Create approval card component specification"
**Evidence Check**:
- Spec: docs/design/approvalcard-component-spec.md ✅ EXISTS (15KB)
- Mockups: ❌ NOT FOUND in artifacts/design/ 
- Component props: ✅ DOCUMENTED
- Tokens: ✅ REFERENCED

**Rating**: 🟡 NEEDS WORK
**Notes**: Spec is excellent, but mockup artifacts not found. Agent should add visual proof.

...(3 more samples)

**Overall Rating**: 🟡 NEEDS WORK (2/4 missing visual artifacts)
**Recommendation**: Request mockup artifacts be added to artifacts/design/

---

**Summary**:
- 🟢 High Quality: 6 agents (Engineer, AI, Reliability, Data, Integrations, Compliance)
- 🟡 Needs Work: 2 agents (Designer, Marketing) - missing visual artifacts
- 🔴 Rework Required: 0 agents

**Escalations**: None - all issues minor and documented for agent follow-up

**Next Cycle**: 2025-10-12T02:30:00Z
```

---

## Random Sampling Method

```bash
# List all tasks from agent feedback
grep -n "✅\|COMPLETE" feedback/engineer.md | nl

# Use timestamp as seed for random
SEED=$(date +%s)

# Select random line numbers
python3 -c "import random; random.seed($SEED); print(random.sample(range(1, 20), 5))"
```

Or manual selection:
- First completed task
- Last completed task
- Middle task
- One with most claims
- One with least evidence

---

## Validation Artifacts

**Storage**: `artifacts/qa/validation/{timestamp}/`

**Files**:
- validation-report.md (detailed findings)
- agent-scores.json (structured data)
- evidence-verification.log (commands run + results)
- escalations.txt (if any)

---

## Authority & Responsibility

**Authority**:
- QA can request evidence from any agent
- QA can rate agent work quality
- QA can escalate to manager
- QA validates before manager reviews

**Responsibility**:
- Validate fairly and consistently
- Provide constructive feedback
- Document all findings with evidence
- Escalate critical issues immediately
- Help agents improve evidence quality

**Not Responsible For**:
- Doing agent's work for them
- Accepting "trust me" without evidence
- Approving incomplete work
- Hiding quality issues from manager

---

## Communication Templates

### Requesting Evidence (Slack/Comment)
```
@{agent}: Your task "{task_name}" is missing evidence.

Required:
- File path(s) of code changes
- Test results showing pass status
- Artifact links (screenshots, logs)

Please update feedback/{agent}.md with this information.
QA validation cycle: {timestamp}
```

### Escalation to Manager
```
@manager: Critical issue in agent validation

Agent: {agent_name}
Task: {task_name}
Issue: {specific problem}
Evidence: {what's wrong}
Impact: {why this matters}

Recommendation: {suggested action}
```

---

**End of QA Validation Process**

**Key Principle**: Evidence or it didn't happen.  
**Maintained by**: QA Team  
**Authority**: Manager Assignment 2025-10-11
