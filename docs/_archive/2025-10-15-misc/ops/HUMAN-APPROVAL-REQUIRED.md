---
epoch: 2025.10.E1
doc: docs/ops/HUMAN-APPROVAL-REQUIRED.md
owner: manager
last_reviewed: 2025-10-11
---

# Human Approval Required - CEO Training Phase

## 🚨 CRITICAL POLICY (2025-10-11)

**CEO Directive**: "I want all agent interactions to be approved by me before responding to customers as the agents will need to be trained with my voice and our technical data"

---

## 📋 THE RULE

**100% Human-in-the-Loop for ALL Customer-Facing Actions**

**What This Means**:
- ❌ NO automated customer responses (ever, during training phase)
- ❌ NO auto-execute for customer inquiries
- ❌ NO "low-risk auto-approve" for customers
- ✅ EVERY customer interaction requires CEO approval
- ✅ EVERY response reviewed by CEO before sending

**Why**:
- CEO trains agents to match their voice
- CEO validates technical accuracy
- CEO builds trust in agent responses
- Agents learn CEO's style over time

---

## 🎯 APPROVAL WORKFLOW

**Step 1**: Customer inquiry arrives (Chatwoot webhook)

**Step 2**: Agent processes and generates proposed response

**Step 3**: Response goes to approval queue (pending_approvals table)

**Step 4**: **CEO reviews and decides**:
- ✅ Approve → Send to customer
- ✅ Edit → Modify response, then send
- ❌ Reject → Don't send, agent learns from feedback

**Step 5**: CEO's feedback captured for agent training

**Step 6**: Agent learns from approval/rejection patterns

---

## 💡 FEEDBACK TRAINING SYSTEM

**How Agents Learn CEO's Voice**:

1. **Approval Patterns**:
   - Track which responses CEO approves without edits (good!)
   - Track which responses CEO edits (learn from changes)
   - Track which responses CEO rejects (avoid this style)

2. **Feedback Collection**:
   - Log CEO's edits in `agent_qc` table (quality control)
   - Extract patterns: tone, word choice, technical depth
   - Feed back into agent prompts and examples

3. **Continuous Improvement**:
   - Week 1: CEO approves 20% of responses as-is
   - Week 4: CEO approves 50% of responses as-is
   - Week 12: CEO approves 80% of responses as-is
   - **Goal**: Agents match CEO's voice so well that most responses need no edits

---

## 📊 METRICS TO TRACK

**Agent Training Progress**:
- Approval rate (% approved without edits)
- Edit distance (how much CEO changes responses)
- Rejection rate (% completely rejected)
- Time to approval (CEO review time)

**CEO Feedback Capture**:
- Common edit patterns
- Frequently changed words/phrases
- Technical corrections made
- Tone adjustments

**Store In**: `agent_qc` table with quality_score + notes

---

## 🔧 IMPLEMENTATION REQUIREMENTS

**Agent SDK Service Must**:
1. ✅ Route ALL customer responses through approval queue
2. ✅ Never auto-send to customers (even "low-risk")
3. ✅ Capture CEO edits when they modify responses
4. ✅ Log CEO feedback (approve/edit/reject + notes)
5. ✅ Feed approval patterns back into agent training

**Approval Queue UI Must**:
1. ✅ Show proposed agent response
2. ✅ Allow CEO to approve/edit/reject
3. ✅ Capture edits (diff between agent version and CEO version)
4. ✅ Allow CEO to add feedback notes
5. ✅ Show agent's confidence score (if available)

**Training Loop Must**:
1. ✅ Analyze approved vs. rejected responses
2. ✅ Extract CEO's style patterns
3. ✅ Update agent prompts with examples
4. ✅ Show agents improvement metrics
5. ✅ Gradually improve approval rate

---

## 🚫 WHAT NOT TO BUILD (Yet)

**DO NOT Implement** (During Training Phase):
- ❌ Auto-approve rules for "simple" questions
- ❌ Low-risk decision auto-execute
- ❌ Bulk approve functionality
- ❌ "Trust this agent" bypass

**Why Not**: CEO needs to train agents first. Auto-approve comes AFTER agents match CEO's voice (months, not days).

---

## 📅 PHASE TIMELINE

**Phase 1 (Now - Week 12)**: 100% CEO Approval Required
- Every customer response reviewed by CEO
- CEO trains agents through approvals/edits/rejections
- Agents learn CEO's voice and technical standards

**Phase 2 (Week 12+)**: Selective Auto-Approve (If agents performing well)
- CEO can enable auto-approve for specific scenarios
- Only after approval rate >80%
- CEO still reviews audit trail daily

**Phase 3 (6+ months)**: Mostly Automated (If agents trusted)
- CEO reviews sample of responses (not all)
- Agents handle routine, CEO handles exceptions
- Continuous monitoring of quality

**Current Phase**: Phase 1 - 100% human approval

---

## ✅ SUCCESS CRITERIA

**Agent is "Trained" When**:
- 80%+ approval rate without edits (CEO trusts agent's judgment)
- <5% rejection rate (agent rarely makes bad suggestions)
- CEO's average edit distance <10 words (minor tweaks only)
- CEO review time <60 seconds per response (quick scans, not rewrites)

**Then**: Consider selective auto-approve for that agent

**Until Then**: 100% CEO approval required

---

## 🎯 REFERENCE IMPLEMENTATION

**See**: `agentfeedbackprocess.md` for metrics schema

**Database Tables**:
- `agent_run`: Tracks every agent execution
- `agent_qc`: Tracks CEO's quality ratings and feedback
- `v_agent_kpis`: Dashboard metrics

**Approval Workflow**:
- `pending_approvals`: Queue for CEO review
- CEO approves/edits/rejects
- Feedback logged in `agent_qc`
- Patterns fed back to agent training

---

**Status**: ACTIVE - 100% human approval required  
**Owner**: CEO + Agent SDK Engineering  
**Review**: Weekly (track approval rate improvement)
