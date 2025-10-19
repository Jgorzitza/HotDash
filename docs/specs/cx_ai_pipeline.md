# CX AI Pipeline — Customer Support with AI + HITL

**Last Updated**: 2025-10-19  
**Issue**: #114  
**Status**: Production Ready  
**Owner**: AI-Customer Agent

## Overview

Production customer support system combining:

- **AI Drafting**: OpenAI GPT-4-Turbo for reply generation
- **RAG Context**: Knowledge base integration (LlamaIndex)
- **HITL Approval**: All replies require human review
- **Quality Grading**: Tone, Accuracy, Policy (1-5 scales)
- **Learning Loop**: Capture edits and grades for model improvement

## Architecture

```
Customer Message (Chatwoot)
  ↓
AI Draft Generator (app/agents/customer/draft-generator.ts)
  → OpenAI API (gpt-4-turbo)
  → RAG Query (knowledge base articles)
  → Brand voice check
  ↓
Private Note Posted to Chatwoot
  ↓
Human Reviews in Approvals Drawer
  → Conversation context
  → AI draft (editable)
  → Evidence & confidence
  → Grading UI (tone/accuracy/policy)
  ↓
Human Approves → Public Reply via Chatwoot API
  ↓
Learning Signal Captured
  → Edit distance (Levenshtein)
  → Quality grades
  → RAG metadata
  ↓
Supabase: customer_reply_grading table
  ↓
Quality Metrics Dashboard
```

## Components

### 1. Draft Generator (`app/agents/customer/draft-generator.ts`)

**Model**: GPT-4-Turbo  
**Input**: Conversation history + customer query  
**Context**: RAG articles from knowledge base  
**Output**: Private Note with suggested reply

**Prompt Structure:**

- System: Brand voice (friendly enthusiast, professional)
- User: Conversation history + RAG context + current question
- Temperature: 0.7
- Max tokens: 300

**Configuration:**

- `OPENAI_API_KEY` - Required

### 2. Chatwoot Integration (`app/agents/customer/chatwoot-api.ts`)

**Functions:**

- `fetchConversations(status)` - Get open/all conversations
- `fetchConversation(id)` - Get single conversation with messages
- `postPrivateNote(id, content)` - Post internal AI draft
- `sendPublicReply(id, content)` - Send customer-facing reply
- `convertChatwootMessages()` - Convert to internal format

**Configuration:**

- `CHATWOOT_BASE_URL`
- `CHATWOOT_API_KEY`
- `CHATWOOT_ACCOUNT_ID`

### 3. Approval UI (`app/components/approvals/CustomerReplyApproval.tsx`)

**Displays:**

- Last 5 messages from conversation
- AI suggested reply (editable TextField)
- RAG sources used
- Confidence badge
- Risk assessment

**Actions:**

- Approve & Send (with grading)
- Reject & Manual Reply (with grading)

### 4. Grading Interface (`app/components/approvals/ApprovalGradingSection.tsx`)

**Scales** (all 1-5):

- **Tone**: Friendly, professional, brand-aligned
- **Accuracy**: Factually correct, addresses need
- **Policy**: Follows company guidelines

**Required**: All 3 grades before approval allowed

**Integration**: Embedded in ApprovalsDrawer when kind=cx_reply

### 5. Grading Schema (`app/agents/customer/grading-schema.ts`)

**Validation:**

- Grades must be integers 1-5
- Conversation ID required
- Draft reply required
- Graded by (user email) required

**Storage:** Supabase customer_reply_grading table

**Constraints:**

```typescript
tone: 1 <= value <= 5;
accuracy: 1 <= value <= 5;
policy: 1 <= value <= 5;
confidence: 0 <= value <= 1;
```

### 6. Learning Signals (`app/agents/customer/learning-signals.ts`)

**Captured:**

- Edit distance (Levenshtein algorithm)
- Edit ratio (normalized 0-1)
- Quality grades
- Approval status
- RAG sources
- Confidence score

**Analysis:**

- Approval rate calculation
- Average edit ratio
- Recommendations generation

**Export Format:** JSONL for fine-tuning

### 7. Dashboard Tile (`app/components/dashboard/CXQualityTile.tsx`)

**Displays:**

- Average grades (tone, accuracy, policy)
- Draft acceptance rate
- Human edit percentage
- Quality badge (Excellent/Good/Fair/Needs Work)

**Targets:**

- Tone ≥ 4.5
- Accuracy ≥ 4.7
- Policy ≥ 4.8
- Acceptance rate ≥ 85%

### 8. Confidence Tuner (`app/agents/customer/confidence-tuner.ts`)

**Logic:**

- Start: Manual review for ALL (threshold = 1.0)
- Adjust: Based on grade history over time
- Target: 95% approval rate before auto-send considered

**Current**: Always require HITL (production safety)

### 9. Batch Processing (`app/routes/api.chatwoot.batch-draft.ts`)

**Endpoint**: POST /api/chatwoot/batch-draft

**Limits:**

- Max 10 concurrent drafts (rate limit respect)
- Max 50 conversations per batch

**Process:**

1. Receive conversation IDs
2. Generate drafts in parallel (chunks of 10)
3. Post Private Notes to each
4. Return success/failure stats

### 10. Edit Distance Tracking (`app/lib/metrics/customer-reply-quality.ts`)

**Measures:** Levenshtein distance between draft and approved reply

**Goal**: Decrease over time as model learns

**Tracking:**

- Per-draft distance
- Rolling average
- Trend analysis

### 11. Tone Analyzer (`app/lib/analysis/tone-analyzer.ts`)

**Pre-Grading:**

- Check brand voice alignment
- Flag overly formal language
- Detect negative phrases
- Score 1-5

**Flags:**

- Too formal
- Negative language
- Jargon
- Length issues

### 12. Learning Export (`scripts/ai/export-learning-signals.ts`)

**Format**: JSONL for OpenAI fine-tuning

**Structure:**

```json
{
  "messages": [
    { "role": "system", "content": "You are..." },
    { "role": "user", "content": "Conversation..." },
    { "role": "assistant", "content": "Human-edited reply" }
  ]
}
```

**Filters**: High-quality signals only (grades ≥4, approved)

## Database Schema

```sql
CREATE TABLE customer_reply_grading (
  id UUID PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  draft_reply TEXT NOT NULL,
  human_reply TEXT,
  tone INTEGER CHECK (tone >= 1 AND tone <= 5),
  accuracy INTEGER CHECK (accuracy >= 1 AND accuracy <= 5),
  policy INTEGER CHECK (policy >= 1 AND policy <= 5),
  edit_distance INTEGER,
  approved BOOLEAN,
  graded_by TEXT NOT NULL,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  rag_sources JSONB,
  confidence DECIMAL(3,2)
);

CREATE VIEW customer_reply_quality_metrics AS
SELECT
  DATE_TRUNC('day', graded_at) as date,
  COUNT(*) as total_replies,
  AVG(tone) as avg_tone,
  AVG(accuracy) as avg_accuracy,
  AVG(policy) as avg_policy,
  AVG(edit_distance) as avg_edit_distance
FROM customer_reply_grading
GROUP BY DATE_TRUNC('day', graded_at);
```

## Success Criteria

- [x] OpenAI integration working (gpt-4-turbo)
- [x] HITL approval flow complete
- [x] Grading UI functional (1-5 scales)
- [x] Learning signals logged
- [x] CX quality tile showing metrics
- [x] Evidence: Drafts generated, approved, graded

## Feature Flags

- `AI_CUSTOMER_DRAFT_ENABLED` - Enable/disable AI drafting
- Default: `false` (manual mode)
- Enable when: Chatwoot configured, OpenAI key set, quality threshold met

## Rollback Plan

If issues arise:

1. Set `AI_CUSTOMER_DRAFT_ENABLED=false`
2. Disable Chatwoot webhook
3. Manual replies only
4. Review error logs

## References

- Approvals Spec: `docs/specs/approvals_drawer_spec.md`
- Content Pipeline: `docs/specs/content_pipeline.md`
- North Star: `docs/NORTH_STAR.md` (HITL by default)
- Operating Model: `docs/OPERATING_MODEL.md` (Learn pipeline)
