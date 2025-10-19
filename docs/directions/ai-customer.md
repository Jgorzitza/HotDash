# AI-Customer - CX HITL + Grading + Learning

> Draft CX replies. HITL approval. Grade quality. Learn from feedback. Ship.

**Issue**: #114 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: app/agents/customer/**, packages/agents/src/ai-customer.ts, tests/unit/agents/**

## Constraints

- MCP Tools: MANDATORY for framework patterns
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
  - Direct OpenAI API for AI operations (no MCP)
- Framework: React Router 7 (NOT Remix) - use loaders/actions for server-side
- HITL: MANDATORY for all customer-facing replies
- Grading: Tone ≥4.5, Accuracy ≥4.7, Policy ≥4.8 (averages)
- Learning: Log all grades for model improvement
- Feature flag: AI_CUSTOMER_DRAFT_ENABLED

## Definition of Done

- [ ] AI drafting working with OpenAI API
- [ ] HITL approval flow complete
- [ ] Grading UI functional (1-5 scales)
- [ ] Learning signals logged
- [ ] CX quality tile showing metrics
- [ ] Evidence: Drafts generated, approved, graded

## Production Molecules

### AIC-001: OpenAI Draft Generator (40 min)

**File**: app/agents/customer/draft-generator.ts
**Model**: gpt-4-turbo
**Prompt**: Include company tone, customer context, conversation history
**Evidence**: Drafts generated, quality reasonable

### AIC-002: Chatwoot Integration - Fetch Conversations (30 min)

**File**: app/agents/customer/chatwoot-api.ts
**Fetch**: Open conversations, customer data, message history
**Evidence**: Conversations retrieved

### AIC-003: Draft Approval Flow (35 min)

**File**: app/components/approvals/CustomerReplyApproval.tsx
**Display**: Original message, AI draft, edit field, approve/reject
**Evidence**: Approval UI working

### AIC-004: Grading Interface (35 min)

**File**: app/components/approvals/ApprovalGradingSection.tsx
**Scales**: Tone (1-5), Accuracy (1-5), Policy (1-5)
**Required**: All 3 grades before approval
**Evidence**: Grading UI functional

### AIC-005: Grading Schema + Validation (25 min)

**File**: app/agents/customer/grading-schema.ts
**Validate**: All grades 1-5, required before submission
**Store**: In database for learning
**Evidence**: Grades validated and stored

### AIC-006: Learning Signals Logger (30 min)

**File**: app/agents/customer/learning-signals.ts
**Log**: Draft, human edits, grades, conversation outcome
**Format**: JSONL for fine-tuning
**Evidence**: Signals logged

### AIC-007: CX Quality Dashboard Tile (30 min)

**File**: app/components/dashboard/CXQualityTile.tsx
**Display**: Avg grades, draft acceptance rate, human edit %
**Evidence**: Tile showing quality metrics

### AIC-008: Confidence Tuning (30 min)

**File**: app/agents/customer/confidence-tuner.ts
**Adjust**: Auto-submit threshold based on grade history
**Start**: Manual review for all (confidence threshold = 1.0)
**Evidence**: Confidence logic implemented

### AIC-009: Batch Draft Processing (25 min)

**File**: app/routes/api.chatwoot.batch-draft.ts
**Process**: Multiple conversations in parallel
**Limit**: Max 10 concurrent to respect rate limits
**Evidence**: Batch processing working

### AIC-010: Edit Distance Tracking (25 min)

**File**: app/lib/metrics/customer-reply-quality.ts
**Measure**: Levenshtein distance between draft and approved
**Goal**: Decrease over time as model learns
**Evidence**: Edit distance tracked

### AIC-011: Tone Analyzer - Pre-Grading (30 min)

**File**: app/lib/analysis/tone-analyzer.ts
**Check**: Draft matches brand voice before sending to human
**Flag**: If tone seems off
**Evidence**: Tone checked

### AIC-012: Learning Data Export (25 min)

**File**: scripts/ai/export-learning-signals.ts
**Export**: Graded conversations for fine-tuning
**Format**: JSONL with prompt/completion pairs
**Evidence**: Export script working

### AIC-013: Contract Tests - OpenAI (20 min)

**File**: tests/unit/agents/openai.contract.test.ts
**Verify**: Chat completion response shapes
**Evidence**: Contracts passing

### AIC-014: Documentation (20 min)

**File**: docs/specs/cx_ai_pipeline.md
**Include**: Draft flow, grading, learning loop
**Evidence**: Docs complete

### AIC-015: WORK COMPLETE Block (10 min)

**Update**: feedback/ai-customer/2025-10-19.md
**Include**: HITL working, grading active, learning logged
**Evidence**: Feedback entry

## Foreground Proof

1. draft-generator.ts with OpenAI
2. chatwoot-api.ts integration
3. CustomerReplyApproval.tsx component
4. ApprovalGradingSection.tsx UI
5. grading-schema.ts validation
6. learning-signals.ts logger
7. CXQualityTile.tsx component
8. confidence-tuner.ts logic
9. batch-draft.ts endpoint
10. Edit distance tracking
11. tone-analyzer.ts checker
12. export-learning-signals.ts script
13. OpenAI contract tests
14. cx_ai_pipeline.md docs
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~6 hours
**SUCCESS**: CX HITL operational, grading active, learning loop logging
