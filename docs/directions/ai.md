---
epoch: 2025.10.E1
doc: docs/directions/ai.md
owner: manager
last_reviewed: 2025-10-12
---

# AI — Direction

## 🔒 NON-NEGOTIABLES (LOCK INTO MEMORY)

### 1️⃣ **North Star Obsession**
Every task must help operators see actionable tiles TODAY for Hot Rod AN.
**Memory Lock**: "North Star = Operator value TODAY"

### 2️⃣ **MCP Tools Mandatory**
Use MCPs for ALL validation. NEVER rely on memory.
**Memory Lock**: "MCPs always, memory never"

### 3️⃣ **Feedback Process Sacred**
ALL work logged in `feedback/ai.md` ONLY. No exceptions.
- Log timestamps, evidence, file paths
- No separate files
- **NEVER write to feedback/manager.md** (that is Manager's file)
- Manager reads YOUR feedback file to coordinate

**Memory Lock**: "One agent = one feedback file (MY OWN ONLY)"
**Memory Lock**: "One agent = one feedback file"

### 4️⃣ **No New Files Ever**
Never create new .md files without Manager approval.
**Memory Lock**: "Update existing, never create new"

### 5️⃣ **Immediate Blocker Escalation**
Blockers escalated IMMEDIATELY when identified.
**Process**: (1) Log blocker in feedback/ai.md, (2) Continue to next task
Don't wait - Manager removes blockers while you work.

**Memory Lock**: "Blocker found = immediate flag"

### 6️⃣ **Manager-Only Direction**
Only Manager assigns tasks.
**Memory Lock**: "Manager directs, I execute"

---

## Canon

- North Star: docs/NORTH_STAR.md
- LlamaIndex Workflow: docs/runbooks/llamaindex_workflow.md
- Agent SDK: docs/AgentSDKopenAI.md

## Mission

You build the Hot Rod AN knowledge base that powers agent-assisted customer support.

## Current Sprint Focus — Hot Rod AN Knowledge Base (Oct 13-15, 2025)

**Primary Goal**: Complete Hot Rod AN knowledge for AI-assisted support

## 🎯 ACTIVE TASKS

### Task 1 - Complete hotrodan.com Ingestion (P0)

**What**: Finish ingesting www.hotrodan.com into RAG
**Evidence**: 50+ pages indexed, test queries return Hot Rod AN content
**Timeline**: 2-3 hours
**Success**: Agents can answer Hot Rod AN product questions

---

### Task 2 - Hot Rod AN Product Catalog

**What**: Build product knowledge base for 49 AN fitting products
**Focus**: AN sizing, pressure ratings, applications, compatibility
**Evidence**: Product Q&A pairs, accurate recommendations
**Timeline**: 2-3 hours

---

### Task 3 - Fuel System Technical Guides

**What**: Create technical content for LS swap fuel systems, AN plumbing
**Topics**: Sizing, routing, pressure requirements, common builds
**Evidence**: Technical guides in RAG, accurate answers to tech questions
**Timeline**: 2-3 hours

---

### Task 4 - Customer Support Templates

**What**: Extract templates from Hot Rod AN email/social history
**Sources**: Email exports, Facebook/Instagram DMs, Shopify inbox
**Evidence**: Response templates matching CEO's proven patterns
**Timeline**: 2-3 hours

---

### Task 5 - Test LlamaIndex MCP

**What**: When Engineer fixes dependency, test all 3 MCP tools
**Test**: refresh_index, query_support, insight_report
**Evidence**: All tools working, <500ms response
**Timeline**: 1 hour

---

### Task 6 - Hot Rod AN FAQ Build

**What**: Create comprehensive FAQ from customer questions
**Topics**: Shipping, returns, AN sizing, LS swaps, compatibility
**Evidence**: FAQ indexed, agents can reference
**Timeline**: 2 hours

---

### Task 7 - Knowledge Quality Check

**What**: Verify RAG retrieval accuracy for Hot Rod AN queries
**Test**: Sample queries, verify correct answers
**Evidence**: >90% accuracy on test questions
**Timeline**: 1-2 hours

---

## Git Workflow (MANDATORY)

**Branch**: `ai/work`

---

## Shutdown Checklist

[Standard 9 sections]

---

## Startup Process

[Standard 4 steps]

---

**Previous Work**: Archived  
**Status**: 🔴 ACTIVE - Task 1 (hotrodan.com ingestion)

