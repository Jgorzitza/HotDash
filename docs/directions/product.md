# Product Agent Direction
**Updated**: 2025-10-14
**Priority**: GROWTH SPEC EXECUTION - DEFINITION
**Focus**: Define Growth Features + Prioritization

## Mission

Define **feature specifications** for growth automation. NOT writing product docs - define WORKING requirements that engineers can build.

## Current State

**Finding**: 0/44 growth spec items implemented
**Root Cause**: Unclear requirements, scope drift, wrong priorities
**Your Role**: Define clear, actionable specs that align with growth goals

## Priority 0 - Growth Spec Clarification

### Task 1: Action Schema Specification (2-3 hours)
**Goal**: Define Action data model requirements

**Work With**: Engineer agent

**Define**:
- Action types (SEO CTR, metaobject, etc)
- Payload schemas for each type
- Status lifecycle (pending → approved → executed → outcome)
- Diff format for previews
- Outcome tracking requirements

**Deliverables**:
- [ ] Action schema spec document
- [ ] Payload examples for each type
- [ ] Lifecycle state diagram
- [ ] Coordinate with Engineer on implementation
- [ ] GitHub commit (spec in docs/)

### Task 2: Recommender Requirements (3-4 hours)
**Goal**: Define what each recommender must do

**Work With**: AI agent

**Define for Each Recommender**:
1. **SEO CTR Optimizer**
   - Input: GSC data, current titles/descriptions
   - Logic: Identify low-CTR, generate improvements
   - Output: Action with before/after diff
   - Success: CTR improvement > 20%

2. **Metaobject Generator**
   - Input: Page content, missing elements
   - Logic: Generate FAQ/specs/reviews
   - Output: Metaobject definition + entries
   - Success: Structured data validated

3. **Merch Playbook, Guided Selling, CWV** (similar specs)

**Deliverables**:
- [ ] Recommender spec documents (C1-C5)
- [ ] Input/output schemas
- [ ] Success criteria defined
- [ ] Coordinate with AI agent
- [ ] GitHub commit

## Priority 1 - Feature Prioritization

### Task 3: Growth Spec Roadmap (2-3 hours)
**Goal**: Prioritize 44 items into executable plan

**Framework**:
```
Priority 0 (Week 1 - Blockers):
- Action system (B1-B7) → Blocks everything
- Data pipelines (A1-A7) → Enables recommenders
- Security fixes (H1-H2) → Non-negotiable

Priority 1 (Week 2 - Value):
- SEO recommender (C1) → Immediate business value
- Storefront automation (D1-D2) → Action execution
- Learning loop (F1-F3) → System improvement

Priority 2 (Week 3 - Scale):
- Additional recommenders (C2-C5)
- Experiments (G1-G2)
- KPIs (I1-I8)
```

**Deliverables**:
- [ ] Prioritized roadmap (P0/P1/P2)
- [ ] Dependencies mapped
- [ ] Timeline estimates validated with engineers
- [ ] CEO approval on priorities
- [ ] GitHub commit

### Task 4: Acceptance Criteria Definition (3-4 hours)
**Goal**: Clear "done" criteria for each feature

**For Each Feature** (44 items):
- Functional requirements (what it does)
- Non-functional requirements (performance, security)
- Test scenarios (how to verify)
- Rollback plan (if it fails)

**Deliverables**:
- [ ] Acceptance criteria for all 44 items
- [ ] Test scenarios documented
- [ ] Success metrics defined
- [ ] GitHub commit

## Priority 2 - Operator Experience

### Task 5: Operator Workflows (3-4 hours)
**Goal**: Define how operators interact with growth automation

**Workflows to Define**:
1. **Action Review Workflow**
   - Operator sees top 10 actions
   - Reviews diff preview
   - Approves/edits/rejects
   - System learns from decision

2. **Auto-Publish Configuration**
   - Operator sets confidence thresholds
   - Defines auto-approve rules
   - Monitors automation health
   - Adjusts based on outcomes

3. **Incident Response**
   - Operator alerted to issue
   - Reviews impact
   - Rolls back if needed
   - Documents for learning

**Deliverables**:
- [ ] Workflow diagrams
- [ ] User stories for each workflow
- [ ] Edge cases documented
- [ ] Coordinate with Designer/Support
- [ ] GitHub commit

## Define Requirements, Not Write Docs

**✅ RIGHT**:
- Define Action schema (engineers can build from it)
- Define acceptance criteria (QA can test from it)
- Define workflows (designers can build from it)

**❌ WRONG**:
- Write product vision decks (not executable)
- Create feature lists without specs (vague)
- Document ideal state without path (not actionable)

## Evidence Required

- Spec documents (in docs/specs/)
- Schema definitions (JSON/TypeScript)
- Workflow diagrams (Mermaid or similar)
- Acceptance criteria checklists
- Engineer/Designer/QA sign-off

## Success Criteria

**Week 1 Complete When**:
- [ ] All 44 growth spec items have clear acceptance criteria
- [ ] Action schema defined and approved
- [ ] Recommender requirements specified
- [ ] Roadmap prioritized (P0/P1/P2)
- [ ] Operator workflows documented
- [ ] All specs approved by CEO and technical leads

## Report Every 2 Hours

Update `feedback/product.md`:
- Specs completed
- Requirements clarified
- Blockers identified
- Approvals obtained
- Evidence (commits, diagrams)

---

**Remember**: Define ACTIONABLE REQUIREMENTS that engineers can build, not product documentation. Specs should be executable.

## 🚨 CRITICAL: ENGLISH ONLY

**CEO DIRECTIVE**: NO FRENCH - ENGLISH ONLY

All specs, documentation, content MUST be in English.

---

## Priority 1 - Growth Spec Progress Review (IMMEDIATE - 3-4 hours)

**Goal**: Review which of 44 growth spec items are complete

**Tasks**:
1. Review Engineer's completed work (Action system, data pipelines)
2. Review other agents' progress
3. Identify gaps in 44-item checklist
4. Update acceptance criteria for incomplete items
5. Prioritize remaining work

**Deliverables**:
- [ ] Growth spec progress report (X/44 complete)
- [ ] Gap analysis
- [ ] Updated priorities for incomplete items
- [ ] GitHub commit

**ENGLISH ONLY** - All documentation in English

---
