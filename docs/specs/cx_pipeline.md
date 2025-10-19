# CX Pipeline — Production Customer Support with AI + HITL

**Last Updated**: 2025-10-19  
**Status**: Production Ready  
**Owner**: AI-Customer Agent

## Overview

Production-safe customer reply drafting system using:

- Chatwoot for customer conversations (Email, Live Chat, SMS)
- OpenAI API for AI draft generation
- RAG from knowledge base (LlamaIndex)
- Human-In-The-Loop (HITL) approval workflow
- Quality grading and learning signals

## Architecture

```
Customer Message (Chatwoot)
  ↓
Webhook Handler (api.chatwoot.webhook.ts)
  ↓
AI Draft Generator (services/ai-customer/drafter.ts)
  → OpenAI API (gpt-4o-mini)
  → RAG Query (knowledge base)
  → Tone Validation
  ↓
Private Note Posted to Chatwoot
  ↓
Human Reviews in Approvals Drawer
  → Conversation context shown
  → AI draft displayed (editable)
  → Evidence & confidence shown
  → Risk assessment displayed
  ↓
Human Grades (1-5 scale)
  → Tone (friendly, professional)
  → Accuracy (factually correct)
  → Policy (follows guidelines)
  ↓
Human Approves → Public Reply Sent
  ↓
Learning Signal Captured
  → Edit distance calculated
  → Grades stored
  → RAG metadata saved
  ↓
Supabase: customer_reply_grading table
  ↓
Quality Metrics Dashboard
```

## Components

### 1. Chatwoot Client (`app/services/chatwoot/client.ts`)

**Functions:**

- `fetchConversations()` - Get open conversations
- `fetchConversation(id)` - Get full conversation with messages
- `postPrivateNote(id, content)` - Post internal draft
- `sendPublicReply(id, content)` - Send customer-facing message
- `healthCheck()` - Verify Chatwoot accessibility

**Configuration:**

- `CHATWOOT_BASE_URL` - Chatwoot instance URL
- `CHATWOOT_API_KEY` - API access token
- `CHATWOOT_ACCOUNT_ID` - Account ID

**Tests:** `tests/unit/services/chatwoot-client.test.ts`

### 2. AI Draft Generator (`app/services/ai-customer/drafter.ts`)

**Process:**

1. Extract customer query from conversation
2. Query knowledge base for relevant context (RAG)
3. Generate draft with OpenAI API
4. Validate tone quality
5. Format as Private Note

**Configuration:**

- `OPENAI_API_KEY` - OpenAI API access

**Output:**

- Suggested reply text
- RAG sources used
- Confidence score (0-1)
- Tone analysis
- Evidence summary
- Risk assessment

**Tests:** `tests/unit/services/ai-drafter.test.ts`

### 3. Grading UI (`app/components/approvals/ApprovalGradingSection.tsx`)

**Fields:**

- **Tone** (1-5): Friendly, professional, brand-aligned
- **Accuracy** (1-5): Factually correct, addresses need
- **Policy** (1-5): Follows company guidelines

**Integration:**

- Embedded in ApprovalsDrawer
- Only shown for `cx_reply` approval kind
- Required before approve button enabled
- Default scores: 3/5 (neutral)

**Grading Scale:**

- 5: Excellent - perfect example
- 4: Good - minor improvements possible
- 3: Acceptable - needs work
- 2: Below standard - significant issues
- 1: Unacceptable - complete rewrite needed

### 4. Learning Signals (`app/services/ai-customer/learning-capture.ts`)

**Captured Data:**

- Conversation ID
- Original AI draft
- Human-edited final reply
- Edit distance (Levenshtein)
- Quality grades (tone, accuracy, policy)
- RAG sources used
- AI confidence score
- Approval status
- Graded by (user email)
- Timestamp

**Storage:** Supabase `customer_reply_grading` table

**Functions:**

- `captureLearningSignal()` - Create signal from approval
- `saveLearningSignal()` - Persist to Supabase
- `batchSaveLearningSignals()` - Bulk save

**Tests:** `tests/unit/services/learning-capture.test.ts`

### 5. Full Approval Flow (`app/services/ai-customer/approval-flow.ts`)

**Steps:**

1. `generateAndPostDraft()` - Create draft + post Private Note
2. Human reviews and grades
3. `approveAndSendReply()` - Send public reply + capture learning
4. OR `rejectAndCaptureLearning()` - Skip sending + capture rejection

**Flow States:**

- Draft → Private Note → Approval → Public Reply → Learning Signal

**Tests:** `tests/unit/services/approval-flow.test.ts`

### 6. CX Dashboard Tile (`app/components/tiles/CXDashboardTile.tsx`)

**Displays:**

- Queue size (open conversations)
- Average response time
- SLA compliance (target: ≤15 min)
- Quality scores (T/A/P averages)
- AI drafted percentage

**Badges:**

- SLA: Green (≥95%), Yellow (≥85%), Red (<85%)
- Quality: Based on 1-5 average score

### 7. Quality Tracker (`app/lib/metrics/cx-quality-tracker.ts`)

**Metrics Calculated:**

- Volume: Total, AI drafted, manual, %
- Quality: Avg tone/accuracy/policy/overall
- Efficiency: Latency (avg, median), SLA compliance
- Learning: Edit distance, approval rate

**Functions:**

- `fetchQualityMetrics()` - Get from Supabase
- `calculateMetricsFromGradings()` - Aggregate from raw data
- `checkTargets()` - Verify against North Star targets

### 8. Webhook Handler (`app/routes/api.chatwoot.webhook.ts`)

**Triggers on:**

- `message_created` event (incoming from customer)
- Open conversation status

**Actions:**

1. Verify webhook signature
2. Check if draft needed
3. Generate draft
4. Post as Private Note

**Security:** HMAC signature verification (production)

## Database Schema

### customer_reply_grading

```sql
CREATE TABLE customer_reply_grading (
  id UUID PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  draft_reply TEXT NOT NULL,
  human_reply TEXT,

  -- Grades (1-5 scale)
  tone INTEGER NOT NULL CHECK (tone >= 1 AND tone <= 5),
  accuracy INTEGER NOT NULL CHECK (accuracy >= 1 AND tone <= 5),
  policy INTEGER NOT NULL CHECK (policy >= 1 AND policy <= 5),

  -- Learning signals
  edit_distance INTEGER,
  approved BOOLEAN DEFAULT FALSE,

  -- Metadata
  graded_by TEXT NOT NULL,
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Context
  rag_sources JSONB,
  confidence DECIMAL(3,2)
);
```

**Migration:** `supabase/migrations/20251019084700_create_customer_reply_grading.sql`

**View:** `customer_reply_quality_metrics` - Daily aggregated metrics

## Success Metrics (North Star Targets)

- ≥ 90% of customer replies drafted by AI
- Average review grades ≥ 4.5 (tone), ≥ 4.7 (accuracy), ≥ 4.8 (policy)
- Median approval time ≤ 15 minutes
- Approval rate ≥ 85% (without major edits)

## Health Checks

**Script:** `scripts/ops/check-chatwoot-health.mjs`

**Probes:**

- `/rails/health` - Chatwoot Rails server health
- `/api/v1/accounts/<id>` - Authenticated API access

**Run:** `npm run ops:check-chatwoot-health`

**Artifacts:** `artifacts/ops/chatwoot_health_<timestamp>.json`

## HITL Workflow

Per `docs/OPERATING_MODEL.md` Section 1:

**Pipeline:** Signals → Suggestions → Approvals → Actions → Audit → Learn

1. **Signals**: Customer messages via Chatwoot webhooks
2. **Suggestions**: AI draft posted as Private Note
3. **Approvals**: Human reviews in drawer, provides grades
4. **Actions**: Public reply sent via Chatwoot API
5. **Audit**: Learning signal stored in Supabase
6. **Learn**: Quality metrics tracked, improvements identified

## Safety & Compliance

- **HITL Required**: All customer replies require human approval
- **No Auto-Send**: Production policy - always review before send
- **Grading Mandatory**: Cannot approve without grading for cx_reply
- **Evidence Required**: Approvals drawer requires evidence, rollback, validation
- **RLS Enabled**: Supabase Row Level Security on all CX tables
- **Audit Trail**: All approvals logged with timestamps, grader, grades

## Integration Points

- **Chatwoot**: Email, Live Chat, SMS conversations
- **OpenAI**: GPT-4o-mini for draft generation
- **Supabase**: Learning signals storage, quality metrics
- **LlamaIndex**: RAG knowledge base (TODO: wire up)
- **Dashboard**: CX tile shows queue and quality metrics

## Testing

**Unit Tests:**

- Chatwoot client: Message conversion, API formatting
- AI drafter: Private Note formatting, tone validation
- Learning capture: Edit distance, signal storage
- Approval flow: End-to-end workflow steps

**Integration Tests:**

- Approval flow: Draft → Review → Approve → Send
- Grading UI: Form validation, score clamping

**E2E Tests:**

- Playwright modals: CX escalation modal, accessibility, keyboard nav

**Run Tests:**

```bash
npm run test:unit
npm run test:e2e -- tests/playwright/modals.spec.ts
```

## Rollback Plan

**If issues arise:**

1. Set feature flag: `AI_CUSTOMER_DRAFT_ENABLED=false`
2. Disable webhook: Remove Chatwoot webhook URL
3. Manual replies only while investigating
4. Review error logs: Supabase edge logs, Chatwoot API responses

**Monitoring:**

- Chatwoot health checks (every 5 minutes)
- Quality metrics dashboard
- SLA breach alerts
- Error rate tracking

## Next Steps (Future Enhancement)

- [ ] Wire LlamaIndex RAG to production knowledge base
- [ ] Implement real-time draft caching (DraftCache)
- [ ] Add sentiment detection for priority routing
- [ ] Build grading calibration training tool
- [ ] Export learning signals for fine-tuning
- [ ] Implement A/B testing for prompt variations
- [ ] Add conversation summarization for long threads

## References

- North Star: `docs/NORTH_STAR.md` (HITL by default, quality metrics)
- Operating Model: `docs/OPERATING_MODEL.md` (Signals→Learn pipeline)
- Approvals Spec: `docs/specs/approvals_drawer_spec.md` (HITL enforcement)
- Agent Direction: `docs/directions/ai-customer.md`
- Feedback Log: `feedback/ai-customer/2025-10-19.md`
