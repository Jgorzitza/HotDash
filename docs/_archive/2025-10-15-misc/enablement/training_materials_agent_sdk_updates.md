# Training Materials Update: Agent SDK Features Integration

**Document Type:** Training Materials Enhancement Guide  
**Owner:** Enablement Team  
**Created:** 2025-10-11  
**Version:** 1.0  
**Purpose:** Document updates needed for existing training materials to incorporate Agent SDK approval queue features

---

## Table of Contents

1. [Overview](#overview)
2. [Documents Requiring Updates](#documents-requiring-updates)
3. [Specific Updates by Document](#specific-updates-by-document)
4. [New Training Materials Created](#new-training-materials-created)
5. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Context

As of 2025-10-11, HotDash has introduced the **Agent SDK Approval Queue** - a comprehensive human-in-the-loop AI system for operator-assisted customer support. This system significantly enhances the operator workflow by having AI agents prepare draft responses for operator review and approval.

### What Changed

**Before Agent SDK:**

- Operators manually searched knowledge base
- Operators wrote all responses from scratch
- Limited AI assistance (template suggestions only)

**After Agent SDK:**

- AI agents analyze customer inquiries
- AI retrieves relevant knowledge base articles
- AI prepares draft responses with confidence scores
- Operators review, approve, edit, reject, or escalate
- System learns from operator decisions

### Training Materials Impact

Existing training materials need updates to:

1. Explain the Agent SDK approval queue workflow
2. Incorporate the 5-Question decision framework
3. Update escalation procedures
4. Add new metrics and success criteria
5. Reference new training modules and resources

---

## Documents Requiring Updates

### High Priority (Update Immediately)

1. **`docs/runbooks/operator_training_agenda.md`**
   - Main operator training agenda
   - Needs: Agent SDK section, approval queue demo, hands-on exercises
   - **Status:** Requires significant additions

2. **`docs/runbooks/operator_training_qa_template.md`**
   - Already comprehensive but needs Agent SDK references
   - Needs: Links to new materials, approval queue Q&A
   - **Status:** Minor updates needed

3. **`docs/enablement/dry_run_training_materials.md`**
   - Current dry-run materials
   - Needs: Agent SDK scenarios, approval queue practice
   - **Status:** Moderate updates needed

### Medium Priority (Update Within 1 Week)

4. **`docs/marketing/support_training_script_2025-10-16.md`**
   - Public-facing training script
   - Needs: Agent SDK benefits, operator testimonials
   - **Status:** Review and update messaging

5. **`docs/marketing/support_training_session_proposal_2025-10-07.md`**
   - Training session proposal
   - Needs: Updated session content, new objectives
   - **Status:** Refresh with Agent SDK content

### Low Priority (Update as Needed)

6. **`docs/enablement/job_aids/ai_samples/*.md`**
   - AI training samples for various tiles
   - Needs: Approval queue examples added
   - **Status:** Add supplementary content

7. **`docs/enablement/async_training_snippets.md`**
   - Async training modules
   - Needs: References to new Loom videos
   - **Status:** Update with new module links

---

## Specific Updates by Document

### 1. operator_training_agenda.md

**File:** `docs/runbooks/operator_training_agenda.md`

#### Section to Add: "Agent SDK Approval Queue" (After Section 3, Before Section 4)

```markdown
### 3.5 Agent SDK Approval Queue Workflow (30 minutes)

**Objective:** Master the AI-assisted approval workflow for efficient customer support

**New Materials Referenced:**

- [Agent SDK Operator Training Module](../enablement/agent_sdk_operator_training_module.md) - Complete guide
- [Approval Queue Quick Start](../enablement/approval_queue_quick_start.md) - One-page reference
- [Approval Queue FAQ](../enablement/approval_queue_faq.md) - Common questions

**Walkthrough:**

**3.5.1 Introduction to Agent SDK (5 min)**

- What is the approval queue and why we use it
- Benefits: More time for complex issues, less time on repetitive tasks
- Human-in-the-loop philosophy: AI suggests, you decide
- How your decisions teach the AI

**3.5.2 Approval Queue Interface Tour (5 min)**

- Accessing the approval queue (route: `/app/approvals`)
- Queue overview: Pending count, filters, stats dashboard
- Individual approval cards: Structure and components
- Understanding confidence scores (High 90-100%, Medium 70-89%, Low <70%)
- Knowledge base source links and verification

**3.5.3 The 5-Question Framework (5 min)**
Teach operators to evaluate every approval using:

1. **Accuracy** - Is all information correct?
2. **Completeness** - Are all questions answered?
3. **Tone** - Is it friendly, professional, empathetic?
4. **Clarity** - Will the customer understand?
5. **Risk** - Any red flags or special approvals needed?

**3.5.4 Live Demo: Complete Approval Flows (10 min)**

**Demo 1: Standard Approval (High Confidence)**
```

Customer: "Where is my order #12345?"
AI Draft (95% confidence): [Accurate order status with tracking]
Action: Walk through 5-Question Framework → Approve
Result: Show response sent to customer immediately

```

**Demo 2: Edit & Approve (Medium Confidence)**
```

Customer: "I got the wrong item and I'm frustrated!"
AI Draft (78% confidence): [Correct info but lacks empathy]
Action: Show how to edit for warmth → Approve edited version
Result: Demonstrate how system learns from edits

```

**Demo 3: Escalation (High Risk)**
```

Customer: "Charged me 3× for same order! Disputing with bank!"
AI Draft (68% confidence): [Generic response]
Action: Identify red flags → Escalate with detailed notes
Result: Show manager notification and next steps

```

**3.5.5 Hands-On Practice (5 min)**
- Operators work through 2-3 practice scenarios
- Apply 5-Question Framework
- Make approve/edit/reject/escalate decisions
- Get immediate feedback from facilitator

**Decision Criteria Covered:**
- **Approve:** All 5 checks pass, ready to send as-is
- **Edit & Approve:** Minor improvements needed (tone, specificity, empathy)
- **Reject:** Factual errors, misunderstands question, contradicts policy
- **Escalate:** High-value issues, policy exceptions, threats, technical issues, uncertainty

**Escalation Procedures:**
- Always escalate: High-value (>$100), policy exceptions, threats, technical issues
- SLA times: Urgent (15 min), High (2 hrs), Standard (4 hrs)
- How to write effective escalation notes (template provided)

**Q&A Capture:**
- Does the approval queue make sense?
- Any concerns about trusting AI suggestions?
- Clear on when to escalate vs. handle?
- Questions about metrics or performance evaluation?

**Key Takeaways:**
- You are always in control - AI is a tool, not a replacement
- Trust but verify - always review, never blindly approve
- When in doubt, escalate - it's good judgment, not weakness
- Your decisions improve the system - you're teaching the AI
```

#### Updates to Existing Sections

**Section 1: Introduction - Add:**

```markdown
**Agent SDK Approval Queue:**

- AI-powered draft response system with human approval
- Reduces time on routine tasks, increases time on complex issues
- Continuous learning system that improves from operator decisions
- Reference materials: See docs/enablement/agent_sdk_operator_training_module.md
```

**Section 3: CX Escalations Deep Dive - Update:**

```markdown
**Integration with Approval Queue:**

- CX escalations now appear in both the dashboard tile AND the approval queue
- High-priority escalations route through approval queue for faster handling
- AI pre-analyzes conversations and suggests appropriate templates
- Operators can override AI suggestions if inappropriate
- Manual Chatwoot access still available for complex cases

**Approval Queue vs. Manual Handling:**

- Use approval queue for: Order status, policy questions, routine issues
- Use manual Chatwoot for: Emotionally charged situations, highly complex issues, special customer relationships
- Hybrid approach is encouraged - use the tool that fits the situation
```

**Section 8: Metrics & Success Criteria - Add:**

```markdown
**Agent SDK Approval Queue Metrics:**

- **Approval Rate:** Target 70%+ (shows AI is learning your preferences)
- **Edit Rate:** Percentage of drafts you improve before approving
- **Rejection Rate:** Percentage of drafts discarded (should be low ~1-2%)
- **Escalation Rate:** Target 10-15% (shows appropriate judgment)
- **Average Review Time:** Target <3 minutes per approval
- **Decision Quality:** QA review of your approve/reject decisions
- **Customer Satisfaction:** Still #1 most important metric (4.5+/5.0)

**Metric Shift:**

- Less emphasis on: Raw response volume, typing speed
- More emphasis on: Decision quality, customer satisfaction, appropriate escalations
```

---

### 2. operator_training_qa_template.md

**File:** `docs/runbooks/operator_training_qa_template.md`

**This document is already comprehensive (800 lines).** Minor additions needed:

#### Add to "FAQ for Operators" Section (around line 485)

```markdown
### Q: How does the Agent SDK approval queue work with Chatwoot automation?

**A**: The approval queue integrates seamlessly with Chatwoot:

1. **Customer sends message** → Chatwoot receives it
2. **AI agent analyzes** → Prepares draft response
3. **Appears in approval queue** → You review and approve/edit/reject/escalate
4. **On approval** → Response automatically sent via Chatwoot
5. **System logs** → Decision recorded in Supabase for audit trail

**When to use approval queue vs. direct Chatwoot:**

- **Approval queue:** Routine inquiries (order status, policy questions, tracking)
- **Direct Chatwoot:** Complex emotional situations, special relationships, issues requiring extensive back-and-forth

**Manual override is always available** - use the tool that best serves the customer.

---

### Q: What are the 4 new Loom training modules and how do they relate to the approval queue?

**A**: As of October 2025, we have 4 comprehensive Loom training modules (18 min 25 sec total):

1. **Module 1: OCC Overview & Architecture** (5m 47s)
   - Dashboard overview and Agent SDK introduction
   - Where approval queue fits in the workflow

2. **Module 2: Customer Lifecycle Management** (3m 52s)
   - How approval queue helps track customer journey
   - Decision logging and audit trails

3. **Module 3: Sales Pulse Integration** (4m 58s)
   - Cross-functional data in approval decisions
   - Using sales context to inform responses

4. **Module 4: Troubleshooting & Support** (3m 48s)
   - Common approval queue issues
   - Escalation procedures and support resources

**Access:** All modules available at [internal training portal] or via customer.support@hotrodan.com

**Recommended viewing:** Complete all 4 modules before your first shift using the approval queue.
```

#### Add New Section: "Agent SDK Approval Queue Workflows" (after line 175)

```markdown
### Workflow 5: Agent SDK Approval Queue Decision

**Scenario**: AI has prepared a draft response for operator approval

**Steps**:

1. **Access approval queue** at `/app/approvals`
2. **Review pending items** sorted by age (oldest first)
3. **Open approval card** to see full details
4. **Read customer's original message** carefully
5. **Review AI's draft response** completely
6. **Check confidence score** and KB sources
7. **Apply 5-Question Framework**:
   - Accuracy: Information correct? ✅/❌
   - Completeness: All questions answered? ✅/❌
   - Tone: Friendly, professional, empathetic? ✅/❌
   - Clarity: Customer will understand? ✅/❌
   - Risk: Any red flags? ✅/⚠️/❌
8. **Make decision**:
   - **All checks pass** → Approve & Execute
   - **Minor issues** → Edit & Approve
   - **Major issues** → Reject with notes
   - **Special handling needed** → Escalate

**Time Target**: 1-3 minutes per approval (quality > speed)
**Quality Standard**: 98%+ decision accuracy

**Decision Examples:**

**Approve:**
```

Customer: "Where is order #123?"
AI (95% conf): "Hi! Order #123 shipped Oct 8 via FedEx..."
Assessment: ✅✅✅✅✅ All checks pass
Action: Approve & Execute

```

**Edit & Approve:**
```

Customer: "Wrong item sent! Very frustrated!"
AI (78% conf): "You can return per our policy..."
Assessment: Accurate but lacks empathy ⚠️
Edit: Add apology, urgency, expedited solution
Action: Approve & Execute (edited)

```

**Reject:**
```

Customer: "Can I return after 20 days?"
AI (85% conf): "Policy is 14 days..." [WRONG - policy is 30 days]
Assessment: Factually incorrect ❌
Action: Reject with notes, write correct response

```

**Escalate:**
```

Customer: "Charged 3× - $1,350! Calling bank!"
AI (68% conf): "Contact billing@..."
Assessment: High-value + threats ⚠️⚠️⚠️
Action: Escalate to manager (15-min SLA)

```

```

---

### 3. dry_run_training_materials.md

**File:** `docs/enablement/dry_run_training_materials.md`

#### Add New Section After Loom Modules Reference

```markdown
## Agent SDK Approval Queue Training Components

### Complete Training Package (Created 2025-10-11)

**Core Training Modules:**

1. **[Agent SDK Operator Training Module](./agent_sdk_operator_training_module.md)** (20-25 min)
   - Complete training guide for approval queue workflow
   - 5-Question Framework detailed explanation
   - Common scenarios with solutions
   - Practice exercises with answer keys
   - Quick reference checklist

2. **[Approval Queue Quick Start Guide](./approval_queue_quick_start.md)** (1-page)
   - Desk reference for quick lookup
   - Decision matrix and cheat sheet
   - Contact information and escalation SLAs
   - Common scenarios at a glance

3. **[Approval Queue FAQ](./approval_queue_faq.md)** (Comprehensive)
   - 40 frequently asked questions
   - Addresses accuracy concerns, AI trust, job security
   - Technical troubleshooting
   - Impact on work and metrics

4. **[Internal Dry-Run Session Guide](./internal_dry_run_session_guide.md)** (90-min session)
   - Complete facilitation guide
   - Demo scenarios with scripts
   - Hands-on practice exercises
   - Q&A facilitation guide

### Training Path for Operators

**Pre-Session (Self-Paced):**

1. Watch 4 Loom modules (18m 25s total)
2. Read Quick Start Guide (5 minutes)
3. Review FAQ - Top 10 questions (10 minutes)

**Live Session (90 minutes):**

1. Agent SDK overview and demos (30 minutes)
2. Hands-on practice with scenarios (45 minutes)
3. Q&A and feedback (15 minutes)

**Post-Session (Weeks 1-4):**

1. Supervised practice (Week 1)
2. Independent with support (Week 2)
3. Fully independent (Week 3+)
4. Ongoing coaching and development

### Practice Scenarios for Dry-Run

**Scenario Set: Agent SDK Approval Decisions**

**Easy: Order Status**
```

Customer: "Where is order #12345?"
AI (95%): Accurate tracking info + friendly tone
Task: Quick review and approve
Goal: Build confidence

```

**Medium: Needs Editing**
```

Customer: "Wrong item! Event Saturday!"
AI (78%): Correct process, lacks empathy/urgency
Task: Edit to add warmth and expedited solution
Goal: Practice improving drafts

```

**Hard: Escalation Required**
```

Customer: "Charged 3x! $1,350! Legal action!"
AI (68%): Generic billing redirect
Task: Identify red flags and escalate
Goal: Practice urgent escalations

```

**Integration Points:**
- All scenarios available in `/docs/enablement/internal_dry_run_session_guide.md`
- Facilitators use demo environment with pre-loaded examples
- Real-time feedback and coaching during practice
- Q&A captured for FAQ updates
```

---

### 4. support_training_script_2025-10-16.md

**File:** `docs/marketing/support_training_script_2025-10-16.md`

#### Updates Needed (General Guidance)

**Add Talking Points About Agent SDK:**

```markdown
### Agent SDK Benefits (For Public Communication)

**For Operators:**
"Our new Agent SDK approval queue empowers operators to work smarter, not harder. AI agents handle the research and drafting, while operators focus on judgment and customer relationships. This means more time solving complex problems and building customer loyalty, less time searching for information."

**For Customers:**
"Customers benefit from faster, more accurate responses backed by our complete knowledge base, with the human judgment and empathy they deserve."

**Operator Testimonials to Highlight:**
[To be collected after 2-4 weeks of use]

- "I used to spend 60% of my time searching for policy information. Now I spend that time actually helping customers."
- "The approval queue lets me handle twice as many routine inquiries, which means I have more time for the really challenging cases."
- "I love that I can quickly review AI suggestions but always have final say. It's the best of both worlds."

**Key Messages:**

- Human-in-the-loop approach: AI suggests, operators decide
- Quality over speed: Operators take time needed for good decisions
- Continuous improvement: System learns from operator expertise
- Empowerment, not replacement: Operators' roles become more valuable

**Addressing Concerns:**

- Q: "Will AI replace operators?"
  A: "No. AI handles repetitive tasks so operators can focus on complex, high-value work that requires human judgment."

- Q: "Can we trust AI?"
  A: "AI is a tool that requires operator review. You're always in control and make final decisions."

- Q: "What if operators don't like it?"
  A: "We've invested heavily in training and support. Operators can still handle responses manually when needed. Early feedback is very positive."
```

---

### 5. async_training_snippets.md

**File:** `docs/enablement/async_training_snippets.md`

#### Update References to Loom Modules

```markdown
## Agent SDK Approval Queue Module References

**4 Complete Loom Training Modules (18m 25s total)**
Created: 2025-10-11
Status: ✅ Production-ready

### Module 1: OCC Overview & Architecture (5m 47s)

**URL:** https://loom.com/share/module1-occ-overview
**Content Highlights:**

- Dashboard overview and value proposition
- Agent SDK approval queue introduction
- Chatwoot-on-Supabase architecture
- React Router 7 + Shopify CLI v3 workflow
  **Target Audience:** All operators, first module to watch

### Module 2: Customer Lifecycle Management (3m 52s)

**URL:** https://loom.com/share/module2-customer-lifecycle
**Content Highlights:**

- CX escalations tile deep dive
- Decision logging and audit trails
- Template selection and approval workflow
  **Target Audience:** All operators, focus on CX

### Module 3: Sales Pulse Integration (4m 58s)

**Content Highlights:**

- Sales metrics and KPIs
- Cross-functional data visibility
- Decision logging for sales actions
  **Target Audience:** Operators who handle sales inquiries

### Module 4: Troubleshooting & Support (3m 48s)

**URL:** https://loom.com/share/module4-troubleshooting
**Content Highlights:**

- Common approval queue issues
- Escalation procedures
- Support resources and contacts
  **Target Audience:** All operators, reference module

**Distribution:**

- Available via customer.support@hotrodan.com
- Also in internal training portal
- All operators should complete before using approval queue

**Success Metrics:**

- Target: >80% operator completion before first shift
- Goal: <3 architecture questions during dry-run session
```

---

## New Training Materials Created

### Complete List of New Documents (2025-10-11)

1. **`docs/enablement/agent_sdk_operator_training_module.md`** (CREATED) ✅
   - Comprehensive 20-25 minute training guide
   - 5-Question Framework detailed
   - Common scenarios with practice exercises
   - Complete reference for operators

2. **`docs/enablement/approval_queue_quick_start.md`** (CREATED) ✅
   - One-page desk reference
   - Quick decision matrix
   - Common scenarios cheat sheet
   - Print-friendly format

3. **`docs/enablement/approval_queue_faq.md`** (CREATED) ✅
   - 40 frequently asked questions
   - Addresses all operator concerns
   - Technical troubleshooting
   - Impact on metrics and work

4. **`docs/enablement/internal_dry_run_session_guide.md`** (CREATED) ✅
   - Complete 90-minute session plan
   - Demo scenarios with facilitator scripts
   - Hands-on practice exercises
   - Pre/post session checklists

5. **`docs/enablement/training_materials_agent_sdk_updates.md`** (THIS DOCUMENT) ✅
   - Update guide for existing materials
   - Integration instructions
   - Implementation checklist

### Training Materials Summary

**Total New Content Created:**

- 4 comprehensive training documents
- 8 demo scenarios with solutions
- 8 practice exercises with answer keys
- 40 FAQ entries
- 1 complete dry-run session guide
- Multiple quick reference materials

**Total Training Time:**

- Self-paced reading: ~60 minutes
- Loom videos: 18 minutes 25 seconds
- Live dry-run session: 90 minutes
- Practice and Q&A: ~30 minutes
- **Total:** ~3.5 hours comprehensive training

---

## Implementation Checklist

### Phase 1: Immediate Updates (Week of 2025-10-11)

- [ ] **Update operator_training_agenda.md**
  - [ ] Add Section 3.5: Agent SDK Approval Queue Workflow
  - [ ] Update Section 1: Introduction with Agent SDK overview
  - [ ] Update Section 3: CX Escalations with approval queue integration
  - [ ] Update Section 8: Add Agent SDK metrics
  - [ ] Review by: Support Lead + Enablement Team
  - [ ] Test: Run through updated agenda in mock session

- [ ] **Update operator_training_qa_template.md**
  - [ ] Add Agent SDK FAQ entries to FAQ section
  - [ ] Add Workflow 5: Agent SDK Approval Queue Decision
  - [ ] Add Loom module references
  - [ ] Review by: Support Lead
  - [ ] Validate: Ensure no conflicting information

- [ ] **Update dry_run_training_materials.md**
  - [ ] Add Agent SDK Training Components section
  - [ ] Add Training Path for Operators
  - [ ] Add Practice Scenarios reference
  - [ ] Link to new training documents
  - [ ] Review by: Enablement Team

### Phase 2: Marketing/Communication Updates (Within 1 Week)

- [ ] **Update support_training_script_2025-10-16.md**
  - [ ] Add Agent SDK benefits talking points
  - [ ] Collect operator testimonials (after 2 weeks of use)
  - [ ] Update key messages
  - [ ] Add Q&A responses for concerns
  - [ ] Review by: Marketing + Support Leadership

- [ ] **Update support_training_session_proposal_2025-10-07.md**
  - [ ] Refresh session content with Agent SDK
  - [ ] Update objectives and outcomes
  - [ ] Revise timeline and milestones
  - [ ] Review by: Product + Enablement

### Phase 3: Supplementary Materials (As Needed)

- [ ] **Create approval queue job aids**
  - [ ] Add to `docs/enablement/job_aids/`
  - [ ] Create visual workflow diagrams
  - [ ] One-pagers for specific scenarios
  - [ ] Laminated desk references

- [ ] **Update AI training samples**
  - [ ] Add approval queue examples to existing samples
  - [ ] Create new sample set: `approval_queue_training_samples.md`
  - [ ] Include diverse scenario types

- [ ] **Create video content**
  - [ ] Screen recordings of approval workflows
  - [ ] Annotated demo videos
  - [ ] Common mistake walkthroughs

### Phase 4: Validation & Iteration (Ongoing)

- [ ] **Collect operator feedback**
  - [ ] Post-training surveys
  - [ ] Weekly team discussions
  - [ ] Individual check-ins

- [ ] **Update materials based on feedback**
  - [ ] Clarify confusing sections
  - [ ] Add missing scenarios
  - [ ] Update FAQ with new questions

- [ ] **Track metrics**
  - [ ] Operator confidence scores (pre/post training)
  - [ ] Training completion rates
  - [ ] Approval queue usage rates
  - [ ] Decision quality metrics

- [ ] **Regular reviews**
  - [ ] Monthly: Quick review of FAQs and scenarios
  - [ ] Quarterly: Comprehensive training materials audit
  - [ ] Annually: Major refresh based on system evolution

---

## Success Criteria

### Training Materials Are Successfully Updated When:

✅ **Completeness:**

- All existing training documents reference Agent SDK
- No conflicting information between old and new materials
- Operators can find answers to all common questions
- Clear pathways from one document to another

✅ **Clarity:**

- Operators understand when to use approval queue vs. manual handling
- 5-Question Framework is consistently explained across materials
- Escalation procedures are clear and unambiguous
- Examples are realistic and helpful

✅ **Accessibility:**

- All materials follow consistent format
- Cross-references work correctly
- Print-friendly versions available
- Mobile-accessible where appropriate

✅ **Effectiveness:**

- **80%+** operators complete pre-training successfully
- **4+/5** operator confidence rating after training
- **<10** questions during dry-run that indicate training gaps
- **85%+** decision accuracy in first week of use

---

## Maintenance Plan

### Ongoing Responsibilities

**Enablement Team:**

- Monitor operator questions and update FAQ monthly
- Collect feedback after each training session
- Update scenarios based on real-world examples
- Maintain cross-references between documents

**Support Lead:**

- Review operator performance and identify training needs
- Suggest scenario updates based on common issues
- Validate technical accuracy of all materials
- Approve all major changes

**Product Team:**

- Alert Enablement to feature changes
- Provide roadmap for upcoming capabilities
- Review materials for technical accuracy
- Contribute to scenario development

### Review Schedule

- **Weekly:** FAQ updates based on new questions
- **Monthly:** Quick scan of all materials for accuracy
- **Quarterly:** Comprehensive review and refresh
- **Annually:** Major update to reflect system evolution

---

## Contact & Support

**Questions About Updates:**

- **Slack:** #occ-enablement
- **Email:** customer.support@hotrodan.com
- **Owner:** Enablement Team

**Suggest Improvements:**

- Submit via #occ-enablement Slack channel
- Email specific suggestions with examples
- Participate in weekly knowledge sharing

**Request Training:**

- Contact your manager for scheduling
- Additional one-on-one coaching available
- Refresher sessions offered quarterly

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-11  
**Maintained By:** Enablement Team  
**Next Review:** 2025-11-11 (1 month)

---

**Related Documents:**

- [Agent SDK Operator Training Module](./agent_sdk_operator_training_module.md)
- [Approval Queue Quick Start Guide](./approval_queue_quick_start.md)
- [Approval Queue FAQ](./approval_queue_faq.md)
- [Internal Dry-Run Session Guide](./internal_dry_run_session_guide.md)
- [Operator Training Agenda](../runbooks/operator_training_agenda.md)
- [Operator Training QA Template](../runbooks/operator_training_qa_template.md)
