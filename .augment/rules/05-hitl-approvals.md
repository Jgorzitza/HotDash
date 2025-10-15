---
description: Human-in-the-Loop workflow, approvals process, and grading system
globs:
  - "app/**/*"
  - "packages/**/*"
alwaysApply: true
---

# Human-in-the-Loop (HITL) & Approvals

**Source:** `docs/NORTH_STAR.md`, `docs/OPERATING_MODEL.md`

## Core HITL Principle

**All customer-facing messages and social posts are drafted → reviewed → sent**

Agents propose actions; **humans approve or correct**; the system learns.

## Approvals Loop States

**Draft → Pending Review → Approved → Applied → Audited → Learned**

### 1. Draft
- Agent creates suggestion or reply
- Includes evidence, projected impact, risks, rollback
- Stored as Private Note (Chatwoot) or pending post (social)

### 2. Pending Review
- Awaiting human review
- "Approve" button disabled until validation passes
- Evidence and rollback must be present

### 3. Approved
- Human has reviewed and approved
- Grading captured (tone/accuracy/policy: 1-5 scale)
- Human edits recorded for learning
- Ready to apply

### 4. Applied
- Action executed via server-side tool
- Chatwoot: Public reply sent from approved Private Note
- Social: Post published via Ayrshare adapter
- Shopify: Mutation executed via Admin GraphQL

### 5. Audited
- Logs and metrics attached
- Before/after state captured
- Rollback artifact stored
- Impact measured

### 6. Learned
- Human edits analyzed
- Grades recorded for fine-tuning
- Patterns fed to evals
- System improves over time

## Required Elements in Every Suggestion

### Evidence
- Queries that informed the suggestion
- Sample data or examples
- Diffs showing proposed changes
- Context from relevant systems

### Projected Impact
- Expected outcome
- Metrics that will change
- User experience impact
- Business value

### Risk & Rollback
- What could go wrong
- How to undo the action
- Rollback artifact location
- Recovery time estimate

### Affected Paths/Entities
- Files or code that will change
- Database tables affected
- Users or customers impacted
- External systems involved

## SLA Requirements

### Customer Experience (CX)
- **Review time:** ≤ 15 minutes (business hours)
- **Draft rate:** ≥ 90% of replies drafted by AI
- **Quality grades:** tone ≥ 4.5, accuracy ≥ 4.7, policy ≥ 4.8

### Inventory & Growth
- **Review time:** Same day
- **Evidence:** Required for all suggestions
- **Rollback:** Documented for all actions

## Grading System

### Tone (1-5 scale)
- 5: Perfect tone, empathetic, professional
- 4: Good tone, minor adjustments
- 3: Acceptable, needs improvement
- 2: Poor tone, significant issues
- 1: Unacceptable, complete rewrite

### Accuracy (1-5 scale)
- 5: Completely accurate, all facts correct
- 4: Mostly accurate, minor corrections
- 3: Acceptable, some errors
- 2: Significant inaccuracies
- 1: Mostly incorrect

### Policy (1-5 scale)
- 5: Fully compliant with all policies
- 4: Compliant, minor policy notes
- 3: Acceptable, some policy concerns
- 2: Policy violations present
- 1: Major policy violations

## HITL Enforcement

### In-App Agents (OpenAI Agents SDK)

**Required configuration:** `app/agents/config/agents.json`

```json
{
  "agents": [
    {
      "id": "ai-customer",
      "human_review": true,
      "reviewers": ["justin@hotrodan.com"]
    }
  ]
}
```

**Danger enforces:**
- `ai-customer` must have `human_review: true`
- `reviewers` array must be present and non-empty

### Approvals Drawer

**Spec:** `docs/specs/approvals_drawer_spec.md`

**Rules:**
- "Approve" button disabled until:
  - Evidence present
  - Rollback documented
  - `/validate` endpoint returns OK
- Grading required on approval
- Human edits captured

## Customer Ops (Chatwoot)

### Workflow
1. **AI drafts reply** as Private Note
2. **Human reviews** in Chatwoot
3. **Human approves** (with optional edits and grades)
4. **System sends** public reply from approved Private Note
5. **System records** edits and grades to Supabase

### Channels
- Email
- Website Live Chat
- Twilio SMS

### Grading
Required for every approved reply:
- Tone (1-5)
- Accuracy (1-5)
- Policy (1-5)

## Growth & Social

### Workflow
1. **AI recommends** content/SEO/ads
2. **CEO reviews** with evidence and projected impact
3. **CEO approves** (or rejects with feedback)
4. **System posts** via Ayrshare adapter
5. **System tracks** impact (CTR, ROAS, engagement)

### Read-Only First
- Start with analytics and recommendations
- No posting until HITL posting implemented
- Evidence-first suggestions

### HITL Posting
- Draft posts shown in UI
- Approve-to-post workflow
- Same approvals loop as CX
- Grading and learning captured

## Inventory Suggestions

### Workflow
1. **AI computes** ROP (lead-time demand + safety stock)
2. **AI generates** PO CSV/email
3. **Human reviews** with evidence (WOS, sales velocity)
4. **Human approves** (or adjusts quantities)
5. **System generates** PO or sends email
6. **System tracks** stockout/overstock impact

### Evidence Required
- Current inventory levels
- Sales velocity (last 30/60/90 days)
- Lead time data
- Safety stock calculation
- Projected stockout date

## Dev Mode Constraints

**In build/dev mode:**

❌ **NO customer messaging**
❌ **NO payments processing**
❌ **NO production Shopify mutations**
❌ **NO real social posts**

✅ **Use fixtures** with:
- `provenance.mode="dev:test"`
- `feedback_ref` for traceability
- **Apply disabled** in UI

## Validation Endpoint

**Endpoint:** `/validate`

**Checks:**
- Evidence present and valid
- Rollback plan documented
- Affected paths within allowed scope
- No policy violations
- Impact assessment reasonable

**Returns:**
- `OK` if all checks pass
- Error details if validation fails

**Approvals drawer:**
- Calls `/validate` before enabling "Approve"
- Shows validation errors to reviewer
- Blocks approval until validation passes

## Learning Pipeline

### Capture
- Human edits (diff between draft and approved)
- Grades (tone/accuracy/policy)
- Approval latency
- Impact metrics (before/after)

### Store
- Supabase tables: `approvals`, `grades`, `edits`
- Linked to original suggestion
- Timestamped and attributed

### Analyze
- Edit distance between draft and final
- Grade trends over time
- Common edit patterns
- Impact correlation

### Improve
- Feed to supervised fine-tuning
- Update evals and benchmarks
- Adjust suggestion algorithms
- Refine evidence requirements

## Metrics & Monitoring

### HITL Quality
- % replies drafted by AI (target: ≥ 90%)
- Average grades: tone ≥ 4.5, accuracy ≥ 4.7, policy ≥ 4.8
- Median approval time (target: ≤ 15 min)
- Edit distance (lower is better)

### Throughput
- Suggestions per day
- Approvals per day
- Rejections per day
- Approval latency distribution

### Impact
- CTR/ROAS lift on approved changes
- Stockout reduction from inventory suggestions
- Customer satisfaction from CX replies
- SEO critical resolution time

## Stop the Line Triggers

**STOP if:**

❌ Approvals without evidence
❌ Approvals without rollback
❌ `/validate` endpoint failing
❌ HITL config missing or disabled
❌ Grading not captured
❌ Customer-facing action without approval

## Best Practices

### ✅ DO
- Always include evidence with suggestions
- Document rollback for every action
- Capture grades on every approval
- Record human edits for learning
- Monitor approval latency
- Track impact metrics
- Use fixtures in dev mode

### ❌ DON'T
- Skip evidence or rollback
- Apply actions without approval
- Bypass HITL for customer-facing work
- Ignore validation failures
- Skip grading
- Use production data in dev mode
- Disable HITL config

## Verification Checklist

### Before Suggesting
- [ ] Evidence gathered and formatted
- [ ] Projected impact calculated
- [ ] Risks identified
- [ ] Rollback plan documented
- [ ] Affected paths listed

### Before Approval
- [ ] Evidence reviewed
- [ ] Rollback plan verified
- [ ] `/validate` endpoint returns OK
- [ ] Impact assessment reasonable
- [ ] No policy violations

### After Approval
- [ ] Grades captured (tone/accuracy/policy)
- [ ] Human edits recorded
- [ ] Action applied via server-side tool
- [ ] Audit log created
- [ ] Impact metrics tracked

### Continuous
- [ ] HITL config intact (`human_review: true`)
- [ ] Reviewers list populated
- [ ] Approval latency within SLA
- [ ] Grade averages meeting targets
- [ ] Learning pipeline functioning

