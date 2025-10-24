# Image Search OAL Review - Technical Feasibility Analysis

**Date**: 2025-10-24  
**Reviewer**: Manager  
**Status**: ✅ APPROVED with recommendations  
**Estimated Effort**: 12-16 hours (MVP)

---

## Executive Summary

**Verdict**: ✅ **APPROVED** - OAL is technically sound and aligns with current stack

**Key Findings**:
- ✅ Infrastructure ready (pgvector + LlamaIndex already in use)
- ✅ Supabase Storage configured and available
- ✅ RLS policies pattern established
- ✅ Feature flag system exists
- ⚠️ Need to add OpenCLIP/CLIP embedding generation
- ⚠️ Need image processing worker (new component)

---

## Current Stack Alignment

### ✅ What We Already Have

**1. pgvector Infrastructure** (READY)
- ✅ pgvector extension enabled in Supabase
- ✅ Vector similarity search working (`knowledge_base` table)
- ✅ IVFFlat indexes with cosine distance (`<=>` operator)
- ✅ Proven at scale (text embeddings: 1536-dim)

**Evidence**:
```sql
-- From supabase/migrations/20251024000003_create_knowledge_base.sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_knowledge_base_embedding 
ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

**2. LlamaIndex Integration** (READY)
- ✅ LlamaIndex installed and configured
- ✅ Vector store index for documents
- ✅ Query engine with similarity postprocessors
- ✅ Custom embedding providers (OpenAI)

**Evidence**:
```typescript
// From app/services/rag/ceo-knowledge-base.ts
const index = await VectorStoreIndex.init({ storageContext });
const similarityProcessor = new SimilarityPostprocessor({
  similarityCutoff: 0.65
});
```

**3. Supabase Storage** (READY)
- ✅ Storage enabled in config
- ✅ File size limit: 50MiB
- ✅ Image transformation API available (Pro plan)
- ✅ Bucket configuration pattern exists

**Evidence**:
```toml
# From supabase/config.toml
[storage]
enabled = true
file_size_limit = "50MiB"
# [storage.buckets.images]
# public = false
# allowed_mime_types = ["image/png", "image/jpeg"]
```

**4. RLS Policies** (PATTERN ESTABLISHED)
- ✅ RLS enabled on 18+ tables
- ✅ Project-based isolation pattern
- ✅ Service role + authenticated policies
- ✅ Tenant isolation via `app.current_project`

**Evidence**:
```sql
-- From multiple migrations
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY kb_read_by_project ON knowledge_base
  FOR SELECT TO authenticated
  USING (project = COALESCE(
    current_setting('app.current_project', true),
    auth.jwt() ->> 'project'
  ));
```

**5. Feature Flags** (READY)
- ✅ Feature flag system exists (`app/config/featureFlags.ts`)
- ✅ Environment variable support
- ✅ Gradual rollout capability
- ✅ User/segment targeting

**Evidence**:
```typescript
// From app/config/featureFlags.ts
export function isFeatureEnabled(flag: string, defaultValue = false): boolean
export function getFeatureFlag(flag: string): string | undefined
```

### ⚠️ What We Need to Add

**1. Image Embedding Generation** (NEW)
- ❌ No CLIP/OpenCLIP integration yet
- ❌ No image-to-vector pipeline
- ❌ Need to add embedding model (ViT-B/32)

**Recommendation**: Use OpenAI CLIP API or OpenCLIP library

**2. Image Processing Worker** (NEW)
- ❌ No image upload/processing pipeline
- ❌ No EXIF stripping
- ❌ No thumbnail generation
- ❌ No checksum de-duplication

**Recommendation**: Node.js worker with `sharp` for image processing

**3. Image-Specific Tables** (NEW)
- ❌ No `image_embeddings` table
- ❌ No `customer_photos` table
- ❌ Need schema for image metadata

**Recommendation**: Follow existing pgvector pattern from `knowledge_base`

---

## Technical Review by Section

### 1. SQL Schema ✅ APPROVED

**Proposed**:
```sql
CREATE TABLE image_embeddings (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  embedding vector(512),  -- OpenCLIP ViT-B/32
  ...
);
CREATE INDEX ON image_embeddings 
USING hnsw (embedding vector_cosine_ops);
```

**Review**:
- ✅ Follows existing `knowledge_base` pattern
- ✅ HNSW index appropriate for image search (better than IVFFlat for <1M vectors)
- ✅ 512-dim matches OpenCLIP ViT-B/32
- ⚠️ Consider adding `checksum` column for de-duplication
- ⚠️ Add `project` column for RLS isolation

**Recommendation**: APPROVED with minor additions

---

### 2. Supabase Storage ✅ APPROVED

**Proposed**:
- Upload to `customer-photos` bucket
- Strip EXIF on upload
- Generate thumbnails
- Serve via signed URLs

**Review**:
- ✅ Supabase Storage already configured
- ✅ Signed URL pattern aligns with security model
- ✅ EXIF stripping prevents PII leakage
- ✅ Thumbnail generation reduces bandwidth

**Recommendation**: APPROVED - use existing Supabase Storage

---

### 3. Embedding Worker ⚠️ NEEDS DESIGN

**Proposed**: Node or Python worker

**Review**:
- ✅ Node.js preferred (matches existing stack)
- ⚠️ Need to choose: OpenAI CLIP API vs. OpenCLIP library
- ⚠️ If OpenCLIP: Need Python runtime or ONNX.js
- ✅ Idempotency via checksum is good practice

**Recommendation**: 
- **Option A** (Simpler): Use OpenAI CLIP API (if available)
- **Option B** (More control): Python worker with OpenCLIP + Supabase queue

**Decision needed**: Which embedding source?

---

### 4. Search API ✅ APPROVED

**Proposed**:
- `GET /search/images?q=...` (text→image)
- `POST /search/images/by-image` (image→image)

**Review**:
- ✅ REST API pattern matches existing routes
- ✅ Separation of text/image search is clear
- ✅ Can reuse existing pgvector query patterns

**Recommendation**: APPROVED

---

### 5. LlamaIndex Wiring ✅ APPROVED

**Proposed**: LlamaIndex retriever wrapping pgvector

**Review**:
- ✅ LlamaIndex already integrated
- ✅ Can create custom retriever (like `ceo-knowledge-base.ts`)
- ✅ Similarity postprocessor pattern established
- ⚠️ LlamaIndex primarily for text - may need custom retriever for images

**Recommendation**: APPROVED - create custom `ImageVectorRetriever`

---

### 6. RLS Policies ✅ APPROVED

**Proposed**: Tenant isolation + signed URLs

**Review**:
- ✅ RLS pattern established across 18+ tables
- ✅ Project-based isolation works
- ✅ Signed URLs prevent unauthorized access
- ✅ Service role for worker access

**Recommendation**: APPROVED - follow existing RLS pattern

---

### 7. Feature Flag ✅ APPROVED

**Proposed**: `VECTOR_BACKEND=pgvector`

**Review**:
- ✅ Feature flag system exists
- ✅ Environment variable pattern established
- ✅ Swappable backend is good future-proofing
- ⚠️ Consider `FEATURE_IMAGE_SEARCH=true` as master switch

**Recommendation**: APPROVED - add both flags

---

## Risks & Mitigations

### Risk 1: Embedding Model Choice

**Risk**: OpenAI may not have CLIP API, OpenCLIP requires Python

**Mitigation**:
- Research OpenAI CLIP API availability
- If not available, use Python worker with OpenCLIP
- Alternative: ONNX.js for Node.js (lower performance)

**Action**: Research OpenAI CLIP API before implementation

### Risk 2: Performance at Scale

**Risk**: Image embeddings are compute-intensive

**Mitigation**:
- Start with async worker (not blocking uploads)
- Use queue for batch processing
- Monitor p50/p95 latency (as specified in OAL)
- HNSW index scales better than IVFFlat

**Action**: Implement observability from day 1

### Risk 3: Storage Costs

**Risk**: Images + thumbnails consume storage

**Mitigation**:
- Implement retention policy (e.g., 90 days)
- Compress images on upload
- Use Supabase Storage (cost-effective)

**Action**: Add storage monitoring to observability

---

## Recommendations

### Must-Have (Before Implementation)

1. ✅ **Research OpenAI CLIP API**
   - Check if OpenAI offers CLIP embeddings
   - Compare cost vs. self-hosted OpenCLIP

2. ✅ **Choose Embedding Stack**
   - Option A: OpenAI CLIP API (if available)
   - Option B: Python worker + OpenCLIP
   - Document decision in OAL

3. ✅ **Add to Schema**
   - `checksum` column for de-duplication
   - `project` column for RLS
   - `uploaded_by` for audit trail

4. ✅ **Define Observability**
   - Query latency (p50/p95)
   - Embedding generation time
   - Storage usage
   - Top-K hit rate

### Nice-to-Have (Future)

1. **Hybrid Search** (text + image)
2. **Multi-modal embeddings** (CLIP for text+image)
3. **Image similarity clustering**
4. **Automatic tagging** from embeddings

---

## Approval Checklist

- [x] Infrastructure ready (pgvector + LlamaIndex)
- [x] Supabase Storage configured
- [x] RLS pattern established
- [x] Feature flag system exists
- [ ] Embedding model chosen (DECISION NEEDED)
- [ ] Worker stack decided (Node vs. Python)
- [x] Observability metrics defined
- [x] Rollback plan documented

---

## Next Steps

1. **Manager Decision**: Choose embedding stack (OpenAI CLIP vs. OpenCLIP)
2. **Data Agent**: Create SQL migration for `image_embeddings` table
3. **Engineer**: Implement upload API + EXIF stripping
4. **Data/Engineer**: Build embedding worker
5. **Engineer**: Implement search API
6. **QA**: Test with sample images

---

## Estimated Effort

**MVP (Basic Functionality)**:
- SQL schema: 1 hour
- Upload API + EXIF stripping: 2 hours
- Embedding worker: 4 hours
- Search API: 2 hours
- LlamaIndex retriever: 2 hours
- RLS policies: 1 hour
- Tests: 2 hours
- **Total**: 14 hours

**Production-Ready** (with observability):
- Add observability: 2 hours
- Performance tuning: 2 hours
- Documentation: 1 hour
- **Total**: 19 hours

---

## Conclusion

**Status**: ✅ **APPROVED FOR IMPLEMENTATION**

The OAL is technically sound and aligns well with our current stack. The main decision point is choosing the embedding model (OpenAI CLIP API vs. OpenCLIP). Once that's decided, implementation can proceed following existing patterns.

**Confidence**: HIGH - We have all the infrastructure pieces, just need to wire them together for images.

**Recommendation**: Proceed with implementation after embedding model decision.

