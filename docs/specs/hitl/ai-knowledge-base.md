# AI Knowledge Base Harness — HITL Learning System

**File:** `docs/specs/hitl/ai-knowledge-base.md`  
**Issue:** #71  
**Owner:** ai-knowledge agent  
**Version:** 1.0  
**Effective:** 2025-10-20  
**Status:** Implementation Spec (Dev Capability)

---

## 1) Purpose

Build a **dev-flagged knowledge base harness** that enables the AI-Customer agent to learn from Human-In-The-Loop (HITL) approvals and improve reply quality over time.

**Core Principle:** "Agents propose actions; humans approve or correct; the system learns."

**Feature Flag:** `feature.aiKnowledge` (OFF by default in production)

---

## 2) System Architecture

### 2.1 Knowledge Service Modules

Located in `app/services/knowledge/`:

| Module         | Purpose                                   | Status                     |
| -------------- | ----------------------------------------- | -------------------------- |
| `types.ts`     | Type definitions for KB system            | ✅ Complete                |
| `embedding.ts` | OpenAI text-embedding-3-small integration | ✅ Complete                |
| `ingestion.ts` | Document ingestion + chunking             | ✅ Complete                |
| `search.ts`    | Semantic search using pgvector            | ⚠️ Stub (Supabase pending) |
| `rag.ts`       | Context builder for ai-customer           | ✅ Complete                |
| `index.ts`     | Main export                               | ✅ Complete                |

### 2.2 Integration Points

**ai-customer agent → knowledge service:**

```typescript
import { buildRAGContext } from "~/services/knowledge";

const context = await buildRAGContext(customerMessage, { maxContext: 3 });
// Context injected into ai-customer prompt
```

**Approvals system → learning pipeline:**

```typescript
// When approval graded (tone/accuracy/policy):
await extractLearning({
  approvalId,
  aiDraft,
  humanFinal,
  grades,
  reviewer,
});
// Updates KB confidence scores and creates new articles
```

---

## 3) Knowledge Base Schema

**Reference:** `docs/specs/knowledge_base_design.md` (sections 2.1-2.4)

### 3.1 Core Tables

1. **kb_articles** — Semantic knowledge base with embeddings
   - question, answer, category, tags
   - confidence_score, usage_count, success_count
   - avg_tone_grade, avg_accuracy_grade, avg_policy_grade
   - embedding (vector 1536)

2. **kb_learning_edits** — Captures all human corrections
   - ai_draft vs human_final with edit_distance
   - tone/accuracy/policy grades (1-5)
   - learning_type classification

3. **kb_recurring_issues** — Tracks patterns needing KB articles
   - issue_pattern, occurrence_count
   - resolution_status (unresolved → kb_created)

### 3.2 Migration Status

**Required:** Supabase migration for pgvector extension + KB tables

**Schema SQL:** See `docs/specs/knowledge_base_design.md` section 2

---

## 4) Indexing Plan

### 4.1 Initial Seed Sources

**Phase 1 (Manual Seed):**

1. Existing customer reply templates from Support agent
2. Hot Rod AN product FAQs (orders, shipping, returns, products)
3. Policy documents (privacy, terms, warranties)

**Seed Size Target:** 20-30 articles minimum for Phase 1

### 4.2 Indexing Workflow

```
1. Source document → 2. Chunk (max 8000 tokens) → 3. Generate embedding
→ 4. Store in kb_articles → 5. Set initial confidence (0.50)
```

**Tools:**

- OpenAI API: `text-embedding-3-small` (1536 dimensions)
- Credentials: `vault/occ/openai/api_key_staging.env`
- Supabase: `vault/occ/supabase/service_key_staging.env`

### 4.3 Refresh Strategy

**Automatic refresh triggers:**

- New high-quality approval (grades ≥ 4, edit_ratio < 0.1) → Update confidence
- Recurring issue detected (≥ 3 in 7 days) → Create new KB article
- KB article not used in 90 days + confidence < 0.50 → Archive

**Manual refresh:** Support agent updates policy/product docs → Re-index category

---

## 5) Evaluation Framework

### 5.1 Quality Metrics

**Per-Article Metrics:**

- **Confidence score:** 0-1 (success rate + grade averages)
- **Usage rate:** Times used / total drafts in category
- **Success rate:** Approvals without edits / usage_count
- **Average grades:** tone (4.5+), accuracy (4.7+), policy (4.8+)

**Quality Tiers:**

- **High confidence:** ≥ 0.80 (use freely)
- **Medium confidence:** 0.60-0.79 (use with caution)
- **Low confidence:** 0.40-0.59 (flag for review)
- **Very low:** < 0.40 (disable/archive)

### 5.2 System-Wide Targets (M2+)

| Metric            | Target                       | Current | Status     |
| ----------------- | ---------------------------- | ------- | ---------- |
| Coverage          | ≥ 70% of customer questions  | TBD     | 🟡 Pending |
| Draft quality     | ≥ 60% approved minimal edits | TBD     | 🟡 Pending |
| Learning velocity | ≥ 5 new articles/week        | TBD     | 🟡 Pending |
| High confidence   | ≥ 40% of articles            | TBD     | 🟡 Pending |

### 5.3 Evaluation Stubs

**Stub 1: Confidence Score Calculator**

```typescript
// app/services/knowledge/eval/confidence.stub.ts
export function calculateConfidence(article: KBArticle): number {
  const successRate = article.success_count / article.usage_count || 0;
  const toneGrade = article.avg_tone_grade || 0;
  const accuracyGrade = article.avg_accuracy_grade || 0;
  const policyGrade = article.avg_policy_grade || 0;

  return (
    successRate * 0.4 +
    (toneGrade / 5) * 0.2 +
    (accuracyGrade / 5) * 0.3 +
    (policyGrade / 5) * 0.1
  );
}
```

**Stub 2: Search Quality Evaluator**

```typescript
// app/services/knowledge/eval/search-quality.stub.ts
export async function evaluateSearchQuality(
  queries: string[],
  expectedResults: Map<string, string[]>,
): Promise<SearchQualityReport> {
  // Run queries, compare with expected results
  // Calculate precision, recall, MRR
  return {
    precision: 0.0,
    recall: 0.0,
    mrr: 0.0,
    queries_tested: queries.length,
  };
}
```

**Stub 3: Learning Pipeline Monitor**

```typescript
// app/services/knowledge/eval/learning-monitor.stub.ts
export async function monitorLearningPipeline(): Promise<LearningHealthReport> {
  // Check: edits captured, confidence updated, new articles created
  return {
    edits_captured_24h: 0,
    confidence_updates_24h: 0,
    new_articles_7d: 0,
    health_status: "pending_migration",
  };
}
```

---

## 6) Learning Pipeline

### 6.1 Extraction Workflow

**Trigger:** Approval approved + grades submitted

```
1. Approval graded (tone/accuracy/policy)
↓
2. Compare ai_draft vs human_final (edit distance)
↓
3. Classify edit type (tone_improvement, factual_correction, policy_clarification, new_pattern)
↓
4. Store in kb_learning_edits
↓
5. Update KB article confidence OR create new article
↓
6. Log to feedback/ai-knowledge/<DATE>.md
```

### 6.2 Confidence Update Logic

**High-quality approval** (grades ≥ 4, edit_ratio < 0.1):

- Increment usage_count, success_count
- Increase confidence_score
- Update last_used_at

**Significant edit** (edit_ratio ≥ 0.3, grades ≥ 4):

- Increment usage_count
- Analyze edit for new KB article
- Update avg_grades

**Low grade** (any ≤ 2):

- Increment usage_count
- Decrease confidence_score
- Flag for human review

---

## 7) Integration with Approvals System

### 7.1 Approval Flow Extension

**Existing:** AI drafts → Private Note → Human reviews → Approves → Public reply

**New (with KB):**

```
AI drafts (WITH KB context) → Private Note → Human reviews/grades
→ Approves → Public reply + Learning extraction → KB update
```

### 7.2 Grading Form Requirements

**Approval drawer must collect:**

- Tone grade (1-5): Empathy, clarity, professionalism
- Accuracy grade (1-5): Factual correctness, completeness
- Policy grade (1-5): Compliance with Hot Rod AN policies

**Optional:**

- Edit classification (tone_improvement, factual_correction, etc.)
- Tags for categorization

---

## 8) Feature Flag Strategy

### 8.1 Flag: `feature.aiKnowledge`

**Default:** OFF in production  
**Enable for:** Dev, staging, and opted-in beta testers

**Flag Controls:**

- KB context injection in ai-customer prompts
- Learning pipeline execution
- Eval dashboard visibility

### 8.2 Rollout Plan

**Phase 0 (Dev):** Build harness, seed KB, test retrieval  
**Phase 1 (Staging):** Enable for internal testing, collect 50+ graded approvals  
**Phase 2 (Beta):** Enable for CEO + 1-2 operators, monitor quality  
**Phase 3 (GA):** Enable for all if metrics meet targets (M2+)

---

## 9) Acceptance Criteria (Issue #71)

### 9.1 Deliverables

✅ **Indexing Plan** (this document, section 4)  
✅ **Eval Stubs** (this document, section 5.3)  
✅ **Evidence logged** in `feedback/ai-knowledge/2025-10-20.md`

### 9.2 Verification

**Contract Test:**

```bash
npx tsx --eval "import('./app/services/knowledge/ingestion.ts').then(m => m.ingestKnowledgeStub().then(console.log))"
```

**Expected Output:**

```json
{
  "documentsProcessed": 0,
  "chunksCreated": 0,
  "embeddingsGenerated": 0,
  "errors": ["Credentials available - ready for production ingestion"]
}
```

### 9.3 Next Steps (Beyond Issue #71)

1. **Migration:** Create Supabase migration for KB schema
2. **Seed:** Manually ingest 20-30 initial KB articles
3. **Integration:** Wire KB context into ai-customer agent
4. **Learning:** Implement edit capture and confidence updates
5. **Dashboard:** Add KB health tile to admin dashboard

---

## 10) Monitoring & Observability

### 10.1 Health Checks

**KB Service Health:**

- Embedding API reachable (OpenAI)
- Supabase KB tables accessible
- Semantic search latency < 500ms

**Learning Pipeline Health:**

- Edits captured within 5 min of approval
- Confidence updates applied within 15 min
- New articles reviewed within 24h

### 10.2 Alerts

**Critical:**

- KB search failing > 5 times/hour
- Confidence score corruption detected
- Learning pipeline stalled > 1 hour

**Warning:**

- No new articles created in 7 days
- High confidence articles < 20%
- Average grades declining trend

---

## 11) Risk & Rollback

### 11.1 Risk Assessment

**Risk Level:** Medium  
**Impact:** Incorrect KB could degrade reply quality  
**Mitigation:** HITL approval still required, confidence thresholds, feature flag

### 11.2 Rollback Plan

**If KB degrades quality:**

1. Set `feature.aiKnowledge = OFF` in environment
2. Revert ai-customer to template-only drafting
3. Analyze problematic articles (confidence < 0.40)
4. Archive low-confidence articles
5. Re-enable with higher threshold (≥ 0.80)

**Rollback Artifacts:**

- KB snapshot (Supabase backup)
- learning_edits backup (CSV export)
- Config flag state (vault history)
- Monitoring alerts (Supabase logs)

---

## 12) Dependencies

### 12.1 External Services

| Service    | Purpose                      | Credential Location                          |
| ---------- | ---------------------------- | -------------------------------------------- |
| OpenAI API | text-embedding-3-small       | `vault/occ/openai/api_key_staging.env`       |
| Supabase   | KB storage + pgvector search | `vault/occ/supabase/service_key_staging.env` |

### 12.2 Internal Dependencies

- **ai-customer agent:** Consumes KB context for reply drafting
- **Approvals system:** Provides graded edits for learning
- **Support agent:** Seeds initial KB articles, maintains quality

---

## 13) Documentation References

- **Design Spec:** `docs/specs/knowledge_base_design.md` (comprehensive system design)
- **North Star:** `docs/NORTH_STAR.md` (knowledge as foundation principle)
- **Operating Model:** `docs/OPERATING_MODEL.md` (HITL pipeline)
- **Agent Direction:** `docs/directions/ai-knowledge.md` (current tasks)
- **Feedback Log:** `feedback/ai-knowledge/2025-10-20.md` (daily progress)

---

## 14) Change Log

- **2025-10-20 v1.0:** Initial spec for Issue #71 (indexing plan + eval stubs)
- **2025-10-15 v0.x:** Design spec created (`knowledge_base_design.md`)

---

**End of AI Knowledge Base Harness Spec v1.0**
