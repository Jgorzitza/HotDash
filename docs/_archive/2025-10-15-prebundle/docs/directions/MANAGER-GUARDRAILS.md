---
epoch: 2025.10.E1
doc: docs/directions/MANAGER-GUARDRAILS.md
owner: ceo
last_reviewed: 2025-10-12
---

# Manager Guardrails - Prevent Process Drift

## 🚨 MANAGER VIOLATIONS IDENTIFIED (2025-10-12)

**CEO Feedback**: "Looks like we generated a few more new MD files, were these needed or could it have been folded into an existing process?"

**Manager's Violations**:

1. ❌ Created docs/ops/SHOPIFY-AUTH-PATTERN.md (should've updated docs/dev/authshop.md)
2. ❌ Created docs/ops/HUMAN-APPROVAL-REQUIRED.md (should've updated agentfeedbackprocess.md)
3. ❌ Created multiple combined direction documents earlier (violated individual agent file process)
4. ❌ Made 0 MCP calls despite North Star requiring MCP-first development

**Pattern**: Manager creates new documents instead of updating existing ones

---

## ✅ GUARDRAILS TO PREVENT DRIFT

### Guardrail 1: NO NEW DOCUMENTATION FILES

**Rule**: Before creating ANY new .md file, Manager MUST:

1. Check if existing doc can be updated instead
2. Search for related existing docs: `grep -r "topic" docs/`
3. If content fits existing doc: UPDATE that doc, don't create new
4. If truly new: Ask CEO approval first

**Examples**:

- ❌ Create SHOPIFY-AUTH-PATTERN.md
- ✅ Update docs/dev/authshop.md with auth clarification

- ❌ Create HUMAN-APPROVAL-REQUIRED.md
- ✅ Update agentfeedbackprocess.md or docs/AgentSDKopenAI.md with approval policy

**Exception**: artifacts/manager/\*.md for analysis reports (OK to create)

---

### Guardrail 2: INDIVIDUAL AGENT FILES ONLY

**Rule**: Direction updates go in `docs/directions/<agent>.md` ONLY

**Never Create**:

- ❌ Combined direction documents
- ❌ EMERGENCY-\*.md direction files
- ❌ URGENT-\*.md direction files
- ❌ \*-CRITICAL.md direction files

**Always Update**:

- ✅ docs/directions/engineer.md (individual file)
- ✅ docs/directions/qa.md (individual file)
- etc.

**CEO Reminder**: "Follow our existing process to provide direction and receive feedback. Each agent has a direction file."

---

### Guardrail 3: MCP-FIRST VALIDATION

**Rule**: Manager MUST use MCPs for technical decisions

**Required MCP Usage**:

- Shopify MCP: Validate any Shopify GraphQL patterns before assigning tasks
- Context7 MCP: Verify React Router 7 patterns before directing Engineer
- GitHub MCP: Check commits when verifying "task complete" claims
- Fly MCP: Verify deployments when agents claim "deployed"
- Supabase MCP: Check database changes when agents claim schema updates

**Enforcement**:

- Manager logs MCP usage in feedback/manager.md
- CEO can audit: "grep 'MCP:' feedback/manager.md"
- Minimum: 5+ MCP calls per day for technical direction

---

### Guardrail 4: VERIFY BEFORE ACCEPT

**Rule**: Don't accept "task complete" without verification

**Verification Methods**:

1. Use MCPs to check technical claims
2. Assign QA to validate
3. Check git commits exist
4. Review actual artifacts (not just claims)

**Never Accept**:

- ❌ "Task complete" without evidence
- ❌ "Deployed" without URL + health check
- ❌ "Fixed" without before/after comparison

---

### Guardrail 5: ASK BEFORE CREATE

**Rule**: Before creating any new:

- Process
- Document structure
- Agent role
- Direction approach

**Manager Must**: Ask CEO first, explain why existing process won't work

**Default**: Use existing process unless CEO approves change

---

## 📋 ENFORCEMENT

**CEO Reviews Weekly**:

- New .md files created (should be ~0)
- MCP usage count (should be >5/day)
- Process adherence

**Violations Result In**:

- Manager rating penalty
- Increased CEO oversight
- Process correction required

---

## ✅ IMMEDIATE CORRECTIONS NEEDED

1. **Delete or Consolidate New Docs**:
   - Move SHOPIFY-AUTH-PATTERN content to docs/dev/authshop.md
   - Move HUMAN-APPROVAL content to agentfeedbackprocess.md
   - Delete redundant files

2. **Start Using MCPs**:
   - Assign QA to verify Engineer's claims using MCPs
   - Manager uses MCPs for all future technical direction

3. **Clean Up Direction Files**:
   - Review all 16 agent direction files
   - Ensure aligned, no overlap
   - Remove any lingering process violations

---

**Status**: Active guardrails to prevent Manager drift  
**Owner**: CEO (Manager must follow)  
**Review**: Weekly compliance check
