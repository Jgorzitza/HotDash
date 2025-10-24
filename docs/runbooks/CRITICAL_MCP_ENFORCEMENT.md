# CRITICAL: MCP-First Enforcement - DO NOT SKIP

**Date Created**: 2025-10-24  
**Trigger**: Engineer nearly reversed production fixes by not using MCP tools  
**Status**: MANDATORY - NO EXCEPTIONS

---

## The Problem (2025-10-24)

**Engineer was about to reverse all production fixes** related to JSON configuration because:

1. ❌ Did NOT pull MCP tools to verify current implementation
2. ❌ Relied on training data (6-12 months old)
3. ❌ Did NOT verify against codebase before "fixing"
4. ❌ Would have undone working production code

**Impact**: Would have broken production app installation, reversed critical fixes

---

## MANDATORY PROCESS - NO EXCEPTIONS

### Before ANY Code Change

**STOP** ✋ - Answer these questions:

1. **Have I pulled the relevant MCP tool docs?**
   - Shopify/Polaris? → Shopify Dev MCP
   - React Router/Prisma/TypeScript? → Context7 MCP
   - Other library? → Context7 MCP or Web Search

2. **Have I verified the CURRENT codebase state?**
   - Use `view` tool to read existing files
   - Use `codebase-retrieval` to understand current patterns
   - DO NOT assume from memory or training data

3. **Have I validated my changes?**
   - Shopify GraphQL? → `validate_graphql_codeblocks`
   - Polaris components? → `validate_component_codeblocks`
   - Library patterns? → Verify against MCP docs

**If ANY answer is NO → STOP and do it first**

---

## Real Examples: What Almost Happened (2025-10-24)

### Example 1: JSON/Build Configuration ❌

**❌ WRONG Approach (What Engineer Almost Did)**:

```
1. See error about JSON/build issue
2. Think "I know how to fix this from experience"
3. Make changes based on training data
4. Reverse working production fixes
5. Break production app installation
```

**Result**: Would have undone critical fixes, broken production

**✅ CORRECT Approach (What Should Happen)**:

```
1. See error about JSON/build issue
2. FIRST: Use codebase-retrieval to understand current state
3. SECOND: Use view tool to read relevant files
4. THIRD: Pull MCP docs for any libraries involved
5. FOURTH: Verify changes won't reverse existing fixes
6. FIFTH: Make minimal, targeted fix
7. SIXTH: Validate with appropriate MCP tool
```

**Result**: Fix the actual issue without breaking working code

---

### Example 2: Shopify API Key "Security Issue" ❌

**❌ WRONG Approach (What Agent Actually Did)**:

```
1. See Shopify API Key exposed to client in code
2. Think "This is a security issue based on my training"
3. Flag as critical security vulnerability
4. Recommend removing/hiding the API key
5. Would break App Bridge initialization
6. Would break entire Shopify app authentication
```

**Agent's Quote**:
> "My previous training-data-based assessment was WRONG. The Shopify API Key
> being exposed to the client is NOT a security issue - it's a REQUIRED part
> of App Bridge initialization according to Shopify's official documentation.
> This demonstrates exactly why MCP-first is mandatory."

**Result**: Would have broken Shopify app authentication, prevented app from loading

**✅ CORRECT Approach (What Should Have Happened)**:

```
1. See Shopify API Key exposed to client in code
2. FIRST: Use Shopify Dev MCP to verify App Bridge requirements
3. SECOND: Search docs: "App Bridge initialization API key client"
4. THIRD: Learn from official docs: API key MUST be client-accessible
5. FOURTH: Understand: This is NOT the API Secret (which must be private)
6. FIFTH: Verify current implementation is correct
7. SIXTH: Document why this is correct (not a security issue)
```

**What MCP Would Have Revealed**:
- Shopify App Bridge REQUIRES API key on client side
- API Key (public) ≠ API Secret (private)
- This is documented in official Shopify App Bridge docs
- Current implementation is CORRECT

**Result**: No false security flag, no breaking changes, correct understanding

**Impact**: This demonstrates that training data can be DANGEROUSLY WRONG about security, not just outdated about syntax

---

## Manager Enforcement (IMMEDIATE)

### Before Approving ANY Engineer PR

**Manager MUST verify**:

1. ✅ MCP Evidence JSONL present OR "non-code change" stated
2. ✅ Codebase retrieval used to understand current state
3. ✅ View tool used to read existing files
4. ✅ Changes validated with appropriate MCP tool
5. ✅ PR description explains WHY change won't break existing fixes

**If ANY missing → REJECT immediately with specific gap**

### Red Flags (Auto-Reject)

- ❌ "Fixed based on experience"
- ❌ "Applied standard pattern"
- ❌ "Cleaned up code"
- ❌ No MCP evidence for code changes
- ❌ No codebase-retrieval for understanding current state
- ❌ No validation for Shopify/Polaris/library code

---

## Training Data is OUTDATED and DANGEROUS

**Your training data is 6-12 months old AND CAN BE WRONG ABOUT SECURITY**

This means:

- ❌ React Router 7 patterns you "know" might be Remix
- ❌ Shopify GraphQL you "remember" might be deprecated
- ❌ Prisma patterns you "learned" might be old syntax
- ❌ TypeScript you "understand" might be outdated
- ❌ Build configs you "know" might not match current setup
- ❌ **Security assumptions you "learned" might be DANGEROUSLY WRONG**

**CRITICAL EXAMPLE (2025-10-24)**:

Agent flagged Shopify API Key in client code as "security issue" based on training data.

**Training data said**: "Never expose API keys to client"

**Reality (from Shopify MCP)**: Shopify App Bridge REQUIRES API key on client side. API Key (public) ≠ API Secret (private). This is CORRECT and DOCUMENTED.

**Impact if not caught**: Would have broken entire Shopify app authentication.

**Lesson**: Training data can be wrong about SECURITY, not just syntax. MCP tools prevent dangerous mistakes.

**ALWAYS verify with MCP tools - NEVER trust training data - ESPECIALLY for security**

---

## Codebase is CURRENT

**The codebase on disk is the source of truth**

Before changing ANY file:

1. ✅ Use `view` tool to read it
2. ✅ Use `codebase-retrieval` to understand how it's used
3. ✅ Search for related files that might be affected
4. ✅ Verify your change won't break existing functionality

**NEVER assume you know what's in a file from memory**

---

## MCP Tools Priority (STRICT ORDER)

### 1. Shopify Dev MCP (FIRST for Shopify/Polaris)

**MANDATORY for**:
- All Polaris components
- All Shopify Admin GraphQL
- All Shopify metafields/inventory/products

**Process**:
```bash
# 1. Learn API
mcp_shopify_learn_shopify_api(api: "polaris-app-home")  # or "admin"

# 2. Search docs
mcp_shopify_search_docs_chunks(conversationId, "your question")

# 3. VALIDATE (REQUIRED)
validate_graphql_codeblocks(codeblocks, api: "admin")
validate_component_codeblocks(code, api: "polaris-app-home")
```

### 2. Context7 MCP (SECOND for other libraries)

**MANDATORY for**:
- React Router 7
- Prisma
- TypeScript
- Any npm package

**Process**:
```bash
# 1. Find library
mcp_context7_resolve-library-id("react-router")

# 2. Get docs
mcp_context7_get-library-docs("/react-router/react-router", "topic")

# 3. Apply official patterns (not training data)
```

### 3. Web Search (LAST RESORT)

**Only if**:
- Neither MCP has the library
- Need current 2025 info

**Always include**: "official docs" or "documentation" in search

---

## Evidence Requirements (MANDATORY)

### Setup: Create Evidence Directory FIRST

**Before ANY MCP usage, create the directory structure**:

```bash
# Create directory for today's MCP evidence
mkdir -p artifacts/<your-agent>/$(date +%Y-%m-%d)/mcp

# Create evidence file for your task
touch artifacts/<your-agent>/$(date +%Y-%m-%d)/mcp/<task-id>.jsonl

# Example for engineer working on ENG-052:
# mkdir -p artifacts/engineer/$(date +%Y-%m-%d)/mcp
# touch artifacts/engineer/$(date +%Y-%m-%d)/mcp/ENG-052.jsonl
```

**Why**: Evidence file must exist BEFORE logging MCP usage. Prevents "file not found" errors.

### Every Code Change MUST Include

**In PR description**:

```markdown
## MCP Evidence

- [ ] Shopify Dev MCP: Conversation ID xxx (if Shopify/Polaris)
- [ ] Context7 MCP: Verified [library] pattern (if library code)
- [ ] Codebase retrieval: Understood current state
- [ ] View tool: Read existing files before changing
- [ ] Validation: Passed [tool name] (if applicable)

## Why This Won't Break Existing Fixes

[Explain how you verified this won't reverse production fixes]
```

**In artifacts/**:

```
artifacts/engineer/2025-10-24/mcp/[topic].jsonl
```

**Format**:
```json
{"tool":"shopify-dev|context7","doc_ref":"url","request_id":"id","timestamp":"ISO","purpose":"why"}
```

---

## Manager Daily Audit

**Every startup, Manager MUST**:

1. ✅ Review all engineer PRs for MCP evidence
2. ✅ Check for red flag phrases (see above)
3. ✅ Verify codebase-retrieval used
4. ✅ Confirm validation tools used
5. ✅ REJECT any PR missing evidence

**Log via**:
```typescript
await logDecision({
  scope: "build",
  actor: "manager",
  action: "mcp_enforcement_audit",
  rationale: "Reviewed engineer PRs for MCP compliance",
  payload: {
    prs_reviewed: 3,
    prs_rejected: 1,
    reason: "No MCP evidence for Polaris changes"
  }
});
```

---

## Consequences of Violation

### First Violation
- PR rejected immediately
- Required to redo with MCP tools
- Evidence logged in decision_log

### Second Violation
- PR rejected immediately
- 1-on-1 with Manager
- Review this document together
- Evidence logged in decision_log

### Third Violation
- Escalation to CEO
- All PRs require Manager pre-approval
- Evidence logged in decision_log

---

## Success Metrics

**Tool-First Approach** (2025-10-20 data):

- ✅ 3 issues fixed
- ✅ 3 deploys (1 per issue)
- ✅ 9 minutes total
- ✅ 0 production breaks

**Guessing Approach** (what we're preventing):

- ❌ 3 issues attempted
- ❌ 13 failed deploys
- ❌ 39 minutes wasted
- ❌ Multiple production breaks

**Savings**: 30 minutes per incident, 0 production breaks

---

## Quick Reference Card

**Before ANY code change**:

1. ✅ Pull MCP docs (Shopify Dev → Context7 → Web)
2. ✅ Use codebase-retrieval to understand current state
3. ✅ Use view tool to read existing files
4. ✅ Verify change won't break existing fixes
5. ✅ Validate with appropriate MCP tool
6. ✅ Log evidence in artifacts/ and PR description

**NEVER**:

- ❌ Trust training data
- ❌ Assume you know current state
- ❌ Skip MCP tools to "save time"
- ❌ Make changes without validation
- ❌ Reverse existing fixes without verification

---

## This Document is MANDATORY

- ✅ Read during every startup
- ✅ Reference before every code change
- ✅ Enforced by Manager (no exceptions)
- ✅ Violations logged and escalated

**Last Updated**: 2025-10-24  
**Next Review**: Daily (Manager startup)

