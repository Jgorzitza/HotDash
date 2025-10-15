# Training Content Management System

**Document Type:** Content Management Framework  
**Owner:** Enablement Team  
**Created:** 2025-10-11  
**Version:** 1.0  
**Purpose:** System for managing training content versions, updates, reviews, and maintenance

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Version Management](#version-management)
3. [Content Update Workflow](#content-update-workflow)
4. [Review & Approval Process](#review--approval-process)
5. [Content Freshness Maintenance](#content-freshness-maintenance)
6. [Documentation Standards](#documentation-standards)
7. [Audit & Compliance](#audit--compliance)
8. [Tools & Infrastructure](#tools--infrastructure)

---

## System Overview

### Purpose

This content management system ensures:
- ✅ All training materials are current and accurate
- ✅ Changes are tracked with version control
- ✅ Updates follow consistent review/approval process
- ✅ Content freshness is monitored and maintained
- ✅ Operators always have access to latest materials

### Governance Principles

**From `docs/git_protocol.md`:**
- All content changes use git version control
- Conventional commits for change tracking
- PRs include documentation + evidence
- Squash merge, delete branch on merge

**From `docs/directions/enablement.md`:**
- Enablement owns operator-facing documentation
- Changes logged in `feedback/enablement.md`
- Coordinate with support, product, marketing
- Evidence-based updates only

---

## Version Management

### Versioning Scheme

**Format:** `MAJOR.MINOR.PATCH`

**MAJOR (1.0.0 → 2.0.0):**
- Complete rewrite or restructure
- Fundamental content change
- Requires re-training

**MINOR (1.0.0 → 1.1.0):**
- New sections added
- Significant content updates
- New scenarios or examples

**PATCH (1.0.0 → 1.0.1):**
- Typo fixes
- Minor clarifications
- Link updates
- Formatting improvements

**Examples:**
```
v1.0.0 - Initial release (2025-10-11)
v1.0.1 - Fixed typos in Section 3
v1.1.0 - Added 5 new FAQ entries
v2.0.0 - Complete rewrite after Agent SDK v2 launch
```

---

### Version Tracking

**Document Header (All Training Materials):**

```markdown
---
document_type: [Training Module / FAQ / Job Aid / etc.]
version: 1.0.0
created_date: 2025-10-11
last_updated: 2025-10-11
last_reviewed: 2025-10-11
next_review: 2025-11-11
owner: Enablement Team
status: Active
replaces: None
related_docs: [list of related document paths]
---
```

**Change Log Section (Bottom of Each Document):**

```markdown
## Change Log

### Version 1.1.0 (2025-10-25)
- Added Section 5.3: Advanced troubleshooting scenarios
- Updated FAQ Question 12 with new escalation SLA
- Added 3 new practice exercises
- **Impact:** Minor - existing knowledge still valid
- **Action Required:** Review new sections, no re-training needed

### Version 1.0.1 (2025-10-15)
- Fixed typos in escalation matrix
- Corrected Loom video link
- Updated contact information
- **Impact:** None - cosmetic changes only
- **Action Required:** None

### Version 1.0.0 (2025-10-11)
- Initial release
- Comprehensive Agent SDK training module created
- 11 sections, 8 practice exercises, quick reference checklist
```

---

### Version Control in Git

**Branch Naming:**
```
enablement/[document-type]/[brief-description]

Examples:
enablement/faq/add-ai-accuracy-questions
enablement/training-module/update-escalation-section
enablement/job-aid/create-policy-reference-card
```

**Commit Messages:**
```
[type]: [brief description]

feat: Add advanced troubleshooting scenarios to training module
fix: Correct escalation SLA in FAQ
docs: Update job aid library index with new cards
chore: Refresh video links in training materials

Examples:
feat: Add 5 new FAQ entries about AI accuracy (v1.1.0)
fix: Correct return policy timeframe in quick start guide (v1.0.1)
docs: Update all video module links after re-recording (v1.0.2)
```

**Pull Request Template:**

```markdown
## Training Content Update

**Document:** [Path to document]
**Version:** [Old version] → [New version]
**Type:** [Major / Minor / Patch]

### Changes Made
- [Bulleted list of changes]

### Reason for Update
[Why this update is needed]

### Impact Assessment
- **Existing Training:** [Does this require re-training? Yes/No]
- **Operators Affected:** [All / New only / Advanced only]
- **Urgency:** [Immediate / Routine / Next review cycle]

### Evidence
- [Links to feedback, bug reports, or requests that drove this update]

### Review Checklist
- [ ] Technical accuracy verified (Support lead review)
- [ ] Consistent with other training materials
- [ ] Links and references work
- [ ] Version number updated
- [ ] Change log updated
- [ ] Next review date set

### Distribution Plan
- [ ] How will operators be notified of changes?
- [ ] Timeline for rollout
- [ ] Communication template prepared
```

---

## Content Update Workflow

### Update Types & Processes

---

### Type 1: Emergency Update (Same Day)

**Triggers:**
- Critical error in training material
- Policy change effective immediately
- System change that makes content wrong
- Security or compliance issue

**Process:**
```
Hour 0: Issue Identified
├─ Support/ops reports critical error
└─ Example: "Training says 14-day returns but policy is 30 days"

Hour 1: Immediate Fix
├─ Enablement team makes correction
├─ Skip normal review (emergency exception)
└─ Manager approves via Slack

Hour 2-3: Distribution
├─ Create quick notice email/Slack
├─ Update all affected documents
├─ Push to git with emergency tag

Hour 4-24: Follow-Up
├─ Full team notification
├─ Confirm all operators aware
├─ Update related materials
└─ Post-mortem: How did error occur?

Documentation:
└─ Log in feedback/enablement.md with timestamp, impact, resolution
```

**Emergency Update Email Template:**
```
Subject: URGENT: Training Material Correction - [Topic]

Team,

We've identified and corrected a critical error in our training materials.

WHAT WAS WRONG:
[Description of error]

WHAT'S CORRECTED:
[Correct information]

AFFECTED MATERIALS:
• [Document 1] - Updated to v[X.X.X]
• [Document 2] - Updated to v[X.X.X]

ACTION REQUIRED:
✅ Read this email completely
✅ Review corrected materials: [links]
✅ Apply correct information immediately
✅ Reply "CONFIRMED" when you've read this

EFFECTIVE: Immediately

Questions? Ask in #support-questions or reply to this email.

[Name]
Enablement Team
```

---

### Type 2: Routine Update (1-2 Weeks)

**Triggers:**
- New FAQ questions accumulate
- Minor improvements identified
- Operator feedback suggests enhancements
- Quarterly review cycle

**Process:**
```
Week 1: Gather & Plan
├─ Collect operator feedback
├─ Review support questions
├─ Identify improvement opportunities
└─ Create update backlog

Week 1-2: Create Updates
├─ Draft changes
├─ Review with SME
├─ Create PR with changes
└─ Request reviews

Week 2: Review & Approve
├─ Support lead review (2 days)
├─ Manager approval (1 day)
├─ Incorporate feedback
└─ Final approval

Week 2: Distribute
├─ Merge to main branch
├─ Send update notification
├─ Update library index
└─ Archive old versions
```

**Routine Update Email Template:**
```
Subject: Training Material Updates - [Month Year]

Hi Team,

We've updated several training materials based on your feedback and recent changes.

WHAT'S NEW:
• [Document 1]: [Brief description of changes]
• [Document 2]: [Brief description of changes]

WHY:
[Reason for updates - operator feedback, policy change, etc.]

ACTION REQUIRED:
📚 Review updated materials at your convenience: [links]
💬 No immediate changes to your workflow
✅ Bookmark new versions

EFFECTIVE: [Date]

Questions? Ask in #occ-enablement.

Thanks for your continued feedback!

[Name]
Enablement Team
```

---

### Type 3: Major Revision (1-2 Months)

**Triggers:**
- Annual comprehensive review
- Major system changes (Agent SDK v2)
- Complete training program overhaul
- Significant policy changes

**Process:**
```
Month 1: Research & Planning
Week 1: Assessment
├─ Review all feedback from past year
├─ Analyze operator performance data
├─ Interview top performers
└─ Survey operator satisfaction

Week 2-3: Design
├─ Create revision proposal
├─ Draft new content outline
├─ Get stakeholder buy-in
└─ Allocate resources

Week 4: Draft
├─ Write new content
├─ Create new examples
├─ Update all related materials
└─ Internal review

Month 2: Review & Launch
Week 5-6: Review
├─ SME technical review
├─ Manager approval
├─ Operator pilot testing (5-10 operators)
└─ Incorporate feedback

Week 7: Finalize
├─ Final edits
├─ Production (videos, print materials)
├─ Distribution preparation
└─ Communication plan

Week 8: Launch
├─ Rollout to all operators
├─ Training sessions if needed
├─ Q&A support
└─ Monitor adoption
```

---

## Review & Approval Process

### Review Levels

**Level 1: Enablement Team Review** (All Changes)
- Content accuracy
- Consistency with other materials
- Writing quality and clarity
- Formatting and accessibility

**Level 2: Subject Matter Expert Review** (Technical Content)
- Policy accuracy
- Procedure correctness
- System functionality
- Real-world applicability

**Reviewers:**
- Support Lead (policies, procedures)
- Product Team (feature functionality)
- Engineering (technical accuracy)
- Manager (strategic alignment)

**Level 3: Manager Approval** (All Changes)
- Alignment with strategy
- Resource allocation appropriate
- Risk assessment
- Final sign-off

**Level 4: Operator Pilot Test** (Major Changes)
- Test with 5-10 operators
- Collect feedback
- Usability assessment
- Comprehension check

---

### Review Checklist

**Content Quality:**
- [ ] Accurate (facts checked against source of truth)
- [ ] Complete (covers topic comprehensively)
- [ ] Clear (easily understood by target audience)
- [ ] Consistent (aligns with other training materials)
- [ ] Actionable (operators know what to do)

**Technical Standards:**
- [ ] Links work and point to current versions
- [ ] Examples are realistic
- [ ] Screenshots are current (if applicable)
- [ ] Code/procedures are tested
- [ ] Platform/system references are correct

**Accessibility:**
- [ ] Readable fonts (12pt+ for print)
- [ ] High contrast for visibility
- [ ] Alternative text for images (digital)
- [ ] Logical structure and hierarchy
- [ ] Printable (if print job aid)

**Compliance:**
- [ ] Follows canonical toolkit references (Supabase, React Router 7, etc.)
- [ ] No outdated technology references
- [ ] Evidence-based (not opinions)
- [ ] Proper citations
- [ ] Security/privacy appropriate

---

### Approval Workflow

**Step 1: Enablement Creates/Updates**
- Draft content in branch
- Self-review against checklist
- Create PR when ready

**Step 2: SME Review (2 business days SLA)**
- Assigned based on content type
- Provides feedback via PR comments
- Approves or requests changes

**Step 3: Incorporate Feedback (1 day)**
- Enablement addresses all feedback
- Makes requested changes
- Re-requests review if major changes

**Step 4: Manager Approval (1 business day SLA)**
- Final review and approval
- Strategic alignment check
- Approve merge or request changes

**Step 5: Merge & Distribute**
- Squash merge to main
- Delete feature branch
- Trigger distribution workflow
- Update library index

**Total Timeline:**
- Patch: 1-3 days
- Minor: 3-7 days
- Major: 4-8 weeks

---

## Content Freshness Maintenance

### Freshness Framework

**Content Status Levels:**

🟢 **CURRENT** (Green)
- Last reviewed <30 days ago
- Information verified accurate
- No known issues

🟡 **REVIEW SOON** (Yellow)
- Last reviewed 30-90 days ago
- May have minor outdating
- Scheduled for next review cycle

🔴 **STALE** (Red)
- Last reviewed >90 days ago
- Likely has outdating
- Immediate review needed

⚫ **DEPRECATED** (Black)
- No longer applicable
- Replaced by newer content
- Archive only, remove from distribution

---

### Regular Review Schedule

**Weekly Review:**
- Check for operator questions/feedback
- Monitor FAQ suggestions
- Track content issues
- Quick scan of emergency updates needed

**Monthly Review:**
- Review all 🟡 REVIEW SOON materials
- Update FAQ with new questions
- Refresh job aids if policy changed
- Check video links and access

**Quarterly Review:**
- Comprehensive review of ALL materials
- Update statistics and examples
- Refresh screenshots and visuals
- Test all links and references
- Update next review dates

**Annual Review:**
- Deep assessment of entire library
- Major updates or rewrites as needed
- Benchmark against industry best practices
- Incorporate year of learnings
- Strategic planning for next year

---

### Content Audit Process

**Monthly Audit (First Friday of Month):**

```
AUDIT CHECKLIST:

ACCURACY:
□ All policies current (check against source systems)
□ All procedures match current workflows
□ All examples still relevant
□ All statistics updated
□ All links work

COMPLETENESS:
□ FAQ covers recent operator questions
□ New scenarios added if patterns emerged
□ Escalation matrix reflects current team structure
□ Contact information current

CONSISTENCY:
□ Cross-references accurate
□ No conflicting information
□ Terminology consistent
□ Formatting uniform

ACTION ITEMS:
□ List of updates needed
□ Priority and owner assigned
□ Deadline set
□ Tracked in project management
```

**Audit Documentation:**
```markdown
## Monthly Content Audit - [Month Year]

**Audit Date:** [Date]
**Auditor:** [Name]
**Materials Reviewed:** [List]

### Findings

**Issues Identified:**
1. [Issue description] - Priority: [High/Med/Low] - Owner: [Name]
2. [Issue description] - Priority: [High/Med/Low] - Owner: [Name]

**Updates Completed:**
1. [Update description] - Completed: [Date]
2. [Update description] - Completed: [Date]

**Status Summary:**
- 🟢 Current: [X] documents
- 🟡 Review Soon: [X] documents
- 🔴 Stale: [X] documents (action plan attached)

**Next Review:** [Date]
```

---

### Content Update Triggers

**Automatic Review Triggered By:**

1. **Policy Change**
   - Any shipping, return, refund policy update
   - Triggers: Review all affected training materials within 48 hours

2. **System Change**
   - Agent SDK updates
   - Approval queue interface changes
   - Triggers: Update screenshots, procedures within 1 week

3. **Performance Data**
   - New top operator strategies identified
   - Common error patterns discovered
   - Triggers: Update best practices, troubleshooting

4. **Operator Feedback**
   - 3+ operators report same confusion
   - Specific content improvement suggestions
   - Triggers: Review and update within 2 weeks

5. **Compliance Requirement**
   - Governance direction updates
   - Security/privacy policy changes
   - Triggers: Immediate review and update

---

## Content Update Workflow

### Standard Update Process

**Step 1: Identify Need (Ongoing)**

**Sources of Updates:**
- Operator feedback in #occ-enablement
- Support questions patterns
- Policy/system changes
- Scheduled review cycles
- Performance data insights

**Capture Method:**
```markdown
## Content Update Request

**Requestor:** [Name]
**Date:** [Date]
**Affected Material:** [Document name]

**Issue/Opportunity:**
[Description of what needs updating]

**Proposed Change:**
[What should be added/modified/removed]

**Evidence:**
[Link to feedback, data, or change notice]

**Priority:** [Emergency / High / Medium / Low]
**Impact:** [All operators / New operators / Advanced / Specific role]

**Status:** [Pending / In Progress / Complete]
```

**Tracking:** Content update backlog in project management system

---

**Step 2: Plan Update (1-2 days)**

- Review request and evidence
- Determine scope (patch/minor/major)
- Assign owner
- Set timeline
- Identify dependencies

**Planning Questions:**
- Does this affect one document or many?
- Do related materials need updates too?
- Are examples or scenarios needed?
- Is this urgent or routine?

---

**Step 3: Draft Changes (Time varies by scope)**

**Patch (Typos, Links):** 30 minutes
- Make corrections directly
- Quick self-review
- Create PR

**Minor (New Content):** 2-4 hours
- Research and draft new sections
- Create examples if needed
- Review against existing content
- Create PR with detailed description

**Major (Rewrite):** 1-2 weeks
- Comprehensive rewrite or new document
- Multiple review cycles
- Pilot testing
- Phased rollout plan

---

**Step 4: Review & Approve (2-5 days)**

**Patch:** 1 day
- Enablement self-review
- Manager approval
- Merge

**Minor:** 3 days
- SME review (2 days)
- Manager approval (1 day)
- Merge

**Major:** 5-10 days
- SME review (3 days)
- Operator pilot test (3-5 days)
- Manager approval (1 day)
- Staged rollout planning

---

**Step 5: Distribute & Communicate (1-2 days)**

**Patch:** Passive
- Merge to main
- Update library index
- No special notification (routine refresh)

**Minor:** Email notification
- Update notification email
- Slack announcement
- Update library index
- Highlight key changes

**Major:** Active communication campaign
- Pre-announcement (coming soon)
- Launch announcement
- Training session if needed
- Follow-up to ensure adoption
- Measure effectiveness

---

**Step 6: Monitor & Iterate (Ongoing)**

- Track operator questions (did update help?)
- Monitor performance metrics (improvement?)
- Collect feedback (what's still unclear?)
- Plan next iteration if needed

---

## Review & Approval Process

### Review Matrix

| Document Type | SME Reviewer | Manager Review | Operator Pilot | Timeline |
|--------------|--------------|----------------|----------------|----------|
| FAQ Entry | Support Lead | Yes (final) | No | 3 days |
| Training Module Section | Support Lead + Product | Yes | 5 operators | 1 week |
| Job Aid | Support Lead | Yes | 3 operators | 5 days |
| Video Script | Support Lead | Yes | No | 3 days |
| Certification Exam | Support Lead + Manager | Yes | 10 operators | 2 weeks |
| Policy Reference | Support Lead | Yes (critical) | No | 2 days |

---

### Reviewer Responsibilities

**Subject Matter Expert (Support Lead):**
- ✅ Verify technical accuracy
- ✅ Ensure policy alignment
- ✅ Test procedures (if applicable)
- ✅ Check for completeness
- ✅ Validate examples and scenarios
- ✅ Timeline: 2 business days

**Manager:**
- ✅ Strategic alignment review
- ✅ Resource allocation appropriate
- ✅ Risk assessment
- ✅ Final approval authority
- ✅ Timeline: 1 business day

**Operator Pilot Testers:**
- ✅ Usability assessment
- ✅ Clarity and comprehension
- ✅ Practical applicability
- ✅ Identify gaps or confusion
- ✅ Timeline: 3-5 days (flexible)

---

### Feedback Integration

**Reviewer Feedback Template:**

```markdown
## Review: [Document Name] [Version]

**Reviewer:** [Name] [Role]
**Review Date:** [Date]
**Review Type:** [SME / Manager / Operator Pilot]

### Overall Assessment
☐ Approve as-is
☐ Approve with minor changes (noted below)
☐ Requires major revision
☐ Reject (explain below)

### Specific Feedback

**Section [X]:**
- Issue: [What's wrong or could be better]
- Suggestion: [Specific improvement]
- Priority: [Must fix / Should fix / Nice to have]

**Section [Y]:**
- [Same format]

### Positive Elements
[What works well - reinforce these]

### Questions for Author
[Any clarifications needed]

### Recommendation
[Final approval recommendation with justification]
```

---

## Content Freshness Maintenance

### Freshness Monitoring

**Automated Checks (If Implemented):**
- Script runs monthly
- Checks last_updated dates
- Flags materials >90 days old
- Sends report to enablement team

**Manual Checks (Current Process):**
- First Friday of each month
- Review all document headers
- Update freshness status spreadsheet
- Create action plan for stale content

---

### Content Freshness Spreadsheet

```
| Document | Version | Last Updated | Days Since | Status | Next Review | Owner |
|----------|---------|--------------|------------|--------|-------------|-------|
| Agent SDK Training Module | 1.0.0 | 2025-10-11 | 0 | 🟢 | 2025-11-11 | Enablement |
| Quick Start Guide | 1.0.0 | 2025-10-11 | 0 | 🟢 | 2025-11-11 | Enablement |
| Approval Queue FAQ | 1.0.0 | 2025-10-11 | 0 | 🟢 | 2025-12-11 | Enablement |
| Video Module 1 | 1.0.0 | 2025-10-11 | 0 | 🟢 | 2026-01-11 | Enablement |
| Policy Reference Card | 1.2.0 | 2025-09-15 | 26 | 🟢 | 2025-12-15 | Enablement |
| Escalation Matrix Card | 1.1.0 | 2025-08-20 | 52 | 🟡 | 2025-11-20 | Enablement |
```

**Actions Based on Status:**
- 🟢 CURRENT (0-30 days): Monitor only
- 🟡 REVIEW SOON (31-90 days): Schedule review
- 🔴 STALE (91+ days): Immediate review required

---

### Refresh Procedures

**Quarterly Refresh (Every 90 Days):**

```
FOR EACH DOCUMENT:

1. ACCURACY CHECK (30 min):
   □ All policies still current?
   □ All procedures still accurate?
   □ All examples still relevant?
   □ All statistics recent?
   □ All links working?

2. COMPLETENESS CHECK (20 min):
   □ Recent operator questions covered?
   □ New scenarios added if patterns exist?
   □ FAQ updated with new questions?
   □ Missing anything operators need?

3. QUALITY CHECK (20 min):
   □ Writing clear and concise?
   □ Examples helpful?
   □ Structure logical?
   □ Visuals current?

4. UPDATE & DOCUMENT (30 min):
   □ Make necessary updates
   □ Update version number
   □ Update last_reviewed date
   □ Set next_review date (+90 days)
   □ Log changes in change log
   □ Commit to git

Total Time per Document: ~2 hours
If 20 documents: ~40 hours per quarter (1 week effort)
```

---

### Content Retirement

**When to Retire Content:**
- Feature deprecated
- Process no longer used
- Replaced by superior content
- No longer accurate and can't be updated

**Retirement Process:**

1. **Mark as Deprecated**
   ```
   Status: ⚫ DEPRECATED
   Effective: [Date]
   Replaced By: [New document]
   Reason: [Why retired]
   ```

2. **Update All References**
   - Find all documents that link to deprecated content
   - Update links to point to replacement
   - Add deprecation notice at top of old document

3. **Archive**
   - Move to `/archive` directory
   - Include deprecation date in filename
   - Keep for historical reference (1 year)
   - Delete after retention period

4. **Communicate**
   - Notify operators of retirement
   - Explain replacement
   - Update library index

**Example Deprecation Notice:**
```markdown
---
⚠️ **DEPRECATED: This document is no longer current.**

**Effective Date:** 2025-11-01
**Reason:** Replaced by improved content
**See Instead:** [Link to replacement document]
**Archived:** This version archived for historical reference only
---
```

---

## Documentation Standards

### File Organization

**Directory Structure:**
```
docs/
├── enablement/
│   ├── agent_sdk_operator_training_module.md
│   ├── approval_queue_quick_start.md
│   ├── approval_queue_faq.md
│   ├── advanced_operator_training_modules.md
│   ├── training_effectiveness_measurement_system.md
│   ├── operator_onboarding_program.md
│   ├── video_training_library.md
│   ├── training_content_management_system.md (this document)
│   ├── job_aids/
│   │   ├── job_aid_library_index.md
│   │   ├── cards/
│   │   │   ├── 5_question_framework_card.md
│   │   │   ├── escalation_matrix_card.md
│   │   │   └── [more cards]
│   │   ├── printable/
│   │   │   ├── approval_queue_workflow.md
│   │   │   ├── policy_quick_reference.md
│   │   │   └── [more printables]
│   │   └── digital/
│   │       └── [digital-only resources]
│   └── archive/
│       └── [deprecated materials with dates]
├── runbooks/
│   ├── operator_training_agenda.md
│   ├── operator_training_qa_template.md
│   └── [operational runbooks]
└── [other doc categories]
```

---

### Naming Conventions

**Documents:**
```
[topic]_[type]_[descriptor].md

Examples:
agent_sdk_operator_training_module.md
approval_queue_quick_start.md
escalation_matrix_card.md
```

**Videos:**
```
HotDash_[Series]_[Number]_[Topic]_[Date].mp4

Examples:
HotDash_Basics_01_OCC_Overview_20251011.mp4
HotDash_QuickHit_05_KB_Versions_20251025.mp4
```

**Archived Materials:**
```
[original_name]_[deprecated_date].md

Examples:
approval_queue_faq_deprecated_20251115.md
old_training_module_deprecated_20260101.md
```

---

### Metadata Standards

**Required Header (All Training Materials):**

```yaml
---
document_type: [Training Module / FAQ / Job Aid / Quick Reference / Video Script]
title: [Full document title]
version: X.Y.Z
created_date: YYYY-MM-DD
last_updated: YYYY-MM-DD
last_reviewed: YYYY-MM-DD
next_review: YYYY-MM-DD
owner: Enablement Team
reviewers: [List of SME reviewers]
status: [Active / Under Review / Deprecated]
target_audience: [All Operators / New Operators / Advanced / etc.]
estimated_time: [Reading/viewing time]
prerequisites: [Required prior knowledge or materials]
related_docs:
  - [path/to/related/doc1.md]
  - [path/to/related/doc2.md]
replaces: [path/to/old/version or None]
---
```

---

### Writing Style Guide

**Voice & Tone:**
- ✅ Friendly and supportive (not formal or academic)
- ✅ Direct and clear (not wordy or ambiguous)
- ✅ Encouraging (not intimidating)
- ✅ Practical (not theoretical)

**Structure:**
- ✅ Scannable (headers, bullets, tables)
- ✅ Logical progression (simple → complex)
- ✅ Examples included (real scenarios)
- ✅ Visual aids when helpful (diagrams, tables)

**Language:**
- ✅ Active voice ("Click the button" not "The button should be clicked")
- ✅ Second person ("You will..." not "Operators will...")
- ✅ Contractions okay ("You'll" not "You will")
- ✅ Simple words (not jargon or corporate speak)

**Formatting:**
- ✅ Headers: Sentence case
- ✅ Bold: Key terms first use, important warnings
- ✅ Italic: Emphasis, examples
- ✅ Code blocks: Exact quotes, templates, technical content
- ✅ Tables: Comparisons, matrices, reference data

---

## Audit & Compliance

### Compliance Requirements

**Per `docs/directions/enablement.md`:**

✅ **Canonical Toolkit References:**
- Supabase backend (not Fly Postgres)
- Chatwoot on Supabase
- React Router 7 UI (not older versions)
- OpenAI + LlamaIndex tooling
- No outdated tech stack references

✅ **Evidence-Based:**
- All training content backed by evidence
- Changes logged in feedback/enablement.md
- Timestamps and artifact paths documented

✅ **Coordination:**
- Align with @support for technical accuracy
- Coordinate with @marketing for messaging
- Check with @product for feature accuracy

---

### Quarterly Compliance Audit

**Audit Checklist:**

```
TECHNICAL STACK REFERENCES:
□ All materials reference Supabase (not old DB)
□ Chatwoot described as "on Supabase"
□ React Router 7 referenced (not RR6)
□ OpenAI + LlamaIndex mentioned correctly
□ No obsolete tech mentioned

POLICY ALIGNMENT:
□ All policies reflect current versions
□ Escalation matrix matches current structure
□ Authority levels accurate
□ SLAs current

CONTENT QUALITY:
□ No contradictions between documents
□ Cross-references work
□ Examples realistic and helpful
□ Scenarios based on real patterns

ACCESSIBILITY:
□ Readable fonts and formatting
□ Alt text for images (digital)
□ Print-friendly versions available
□ Mobile-accessible where appropriate

SECURITY & PRIVACY:
□ No real customer data in examples
□ Mock data only in screenshots
□ Contact info current and appropriate
□ No sensitive information exposed
```

**Audit Report:**
```markdown
## Quarterly Compliance Audit - Q[X] [Year]

**Audit Date:** [Date]
**Auditor:** [Name]
**Materials Audited:** [Total count]

### Compliance Score
- Technical Stack: [X]% compliant
- Policy Alignment: [X]% compliant
- Content Quality: [X]% compliant
- Overall: [X]% compliant

### Issues Found
[List with severity and remediation plan]

### Recommendations
[Improvements for next quarter]

### Sign-Off
Enablement Lead: _________________ Date: _______
Manager: _________________ Date: _______
```

---

## Tools & Infrastructure

### Current Tools

**Version Control:**
- Git + GitHub
- Branch protection on main
- PR required for all changes
- Squash merge only

**Content Editing:**
- Markdown for all text content
- Cursor/VSCode for editing
- Conventional commits

**Review Process:**
- GitHub PR reviews
- Slack for quick feedback
- Email for formal approvals

**Distribution:**
- Email for notifications
- Slack #occ-enablement for announcements
- Internal wiki/knowledge base (planned)
- Loom for videos

**Tracking:**
- Spreadsheet for freshness monitoring (current)
- Project management for update backlog
- Feedback log in feedback/enablement.md

---

### Recommended Future Tools

**Content Management System (CMS):**
- Centralized training library
- Version tracking built-in
- Review workflow automation
- Search functionality
- Analytics (page views, time spent)

**Options to Evaluate:**
- GitBook (documentation focused)
- Notion (flexible, collaborative)
- Confluence (enterprise standard)
- Custom built (full control)

**Learning Management System (LMS):**
- Training path enforcement
- Quiz hosting and grading
- Certification tracking
- Progress dashboards
- Reporting and analytics

**Options to Evaluate:**
- TalentLMS
- Docebo
- SAP Litmos
- Custom integration

---

### Automation Opportunities

**Auto-Freshness Monitoring:**
```javascript
// Concept: Monthly cron job
// Reads all .md headers
// Flags if last_reviewed >90 days
// Sends report to enablement team
```

**Auto-Link Checking:**
```javascript
// Concept: Weekly check
// Tests all [links] in documents
// Reports broken links
// Sends alert if critical paths broken
```

**Auto-Version Bumping:**
```javascript
// Concept: Git hook on PR merge
// Detects scope of changes
// Suggests version bump
// Updates header automatically
```

**Auto-Change Log:**
```javascript
// Concept: Git hook on commit
// Extracts commit message
// Appends to change log section
// Keeps change history current
```

---

## Content Management Dashboard (Future)

### Ideal Dashboard View

```
┌──────────────────────────────────────────────────────────────┐
│           TRAINING CONTENT MANAGEMENT DASHBOARD               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📊 CONTENT HEALTH                                           │
│  ├─ 🟢 Current (0-30 days): 45 documents                     │
│  ├─ 🟡 Review Soon (31-90 days): 8 documents                 │
│  ├─ 🔴 Stale (91+ days): 2 documents ⚠️                      │
│  └─ Total: 55 active training materials                      │
│                                                               │
│  📝 UPDATE BACKLOG                                           │
│  ├─ Emergency: 0 (🎯 Target: 0)                              │
│  ├─ High Priority: 2                                         │
│  ├─ Medium Priority: 5                                       │
│  └─ Low Priority: 8                                          │
│                                                               │
│  ✅ IN REVIEW                                                │
│  ├─ SME Review: 3 documents                                  │
│  ├─ Manager Approval: 1 document                             │
│  └─ Operator Pilot: 2 documents                              │
│                                                               │
│  📈 RECENT ACTIVITY                                          │
│  ├─ Last 7 days: 4 updates published                         │
│  ├─ Last 30 days: 12 updates published                       │
│  └─ Avg time to publish: 5.2 days                            │
│                                                               │
│  ⭐ QUALITY METRICS                                          │
│  ├─ Operator satisfaction: 4.7/5.0                           │
│  ├─ Content accuracy rate: 98%                               │
│  └─ Review compliance: 100%                                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Summary & Implementation

### This System Provides:

✅ **Version Control** - Track all changes with git
✅ **Update Workflow** - Structured process for all change types
✅ **Review Standards** - Consistent quality assurance
✅ **Freshness Monitoring** - Prevent content from going stale
✅ **Compliance Auditing** - Ensure alignment with governance
✅ **Distribution Process** - Operators get updates reliably

### Implementation Checklist

**Week 1: Foundation**
- [ ] Set up git repository structure
- [ ] Create document templates with headers
- [ ] Establish review team and roles
- [ ] Create freshness tracking spreadsheet

**Week 2-3: Process Documentation**
- [ ] Document all workflows (this document)
- [ ] Train reviewers on process
- [ ] Create PR templates
- [ ] Test workflow with pilot update

**Week 4: Rollout**
- [ ] Announce new process to team
- [ ] Begin monthly freshness audits
- [ ] Start using formal review process
- [ ] Monitor and iterate

**Ongoing:**
- Weekly: Monitor feedback and issues
- Monthly: Freshness audit and updates
- Quarterly: Comprehensive review
- Annually: Major refresh and improvement

---

### Success Metrics

**Process Efficiency:**
- Update time: Patch <1 day, Minor <1 week, Major <2 months
- Review compliance: 100% (all changes reviewed)
- Broken link rate: <1%
- Stale content rate: <5% of library

**Content Quality:**
- Operator satisfaction: 4.5+/5.0
- Accuracy rate: 98%+
- Coverage: 95%+ of operator questions answered by materials
- Update responsiveness: Critical updates <24 hours

**Operator Impact:**
- Reduced support questions about topics covered
- Faster time to competency
- Higher confidence ratings
- Better performance metrics

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-11  
**Created By:** Enablement Team  
**Next Review:** 2025-11-11 (monthly for first year)

**Total System Components:** 8 processes | 15 templates | 4 audit procedures | Complete version control

✅ **TRAINING CONTENT MANAGEMENT SYSTEM COMPLETE - READY FOR IMPLEMENTATION**

**With this system, training content stays accurate, current, and effective indefinitely!**

