# Knowledge Base Population Plan - CEO Approval Required

**Date:** 2025-10-24  
**Owner:** Manager (Augment Agent)  
**CEO:** Justin  
**Status:** PENDING CEO APPROVAL  
**Critical:** This is the BASE - must get it right the first time

---

## 🚨 CRITICAL REQUIREMENTS

**CEO Approval Required Before ANY Data Commit:**
- ✅ All content must be reviewed and approved by CEO (Justin)
- ✅ No data committed to knowledge base without explicit approval
- ✅ Staging/preview system for CEO review
- ✅ Clear separation: Customer support knowledge ONLY (NO dev knowledge)

---

## 📋 Knowledge Base Scope

### ✅ INCLUDED (Customer Support Knowledge)

**1. Product Information**
- Product descriptions
- Features and specifications
- Use cases and benefits
- Compatibility information
- Pricing and availability

**2. Policies**
- Shipping policy
- Return/refund policy
- Warranty policy
- Privacy policy
- Terms of service

**3. Support Procedures**
- Order tracking
- Return process
- Warranty claims
- Technical troubleshooting
- Account management

**4. FAQ**
- Common customer questions
- Product-specific questions
- Policy clarifications
- Troubleshooting guides

### ❌ EXCLUDED (Dev Knowledge - Separate System)

**NOT in customer knowledge base:**
- ❌ Code documentation
- ❌ Technical architecture
- ❌ Development processes
- ❌ Internal procedures
- ❌ Agent directions
- ❌ System documentation

**Note:** Dev knowledge has separate system (`project='dev_kb'` in database)

---

## 📊 Data Sources (3 Sources)

### Source 1: hotrodan.com Website Scrape

**What to Scrape:**
- Product pages
- Policy pages (shipping, returns, warranty)
- FAQ pages
- About/contact pages
- Help/support pages

**What NOT to Scrape:**
- Blog posts (unless support-related)
- Marketing pages
- Internal pages
- Admin pages

**Process:**
1. Scrape hotrodan.com
2. Extract text content
3. Chunk into logical sections
4. Generate preview for CEO review
5. CEO approves/rejects each section
6. Commit approved sections only

### Source 2: Chatwoot Customer Inquiries (After Chatwoot Fixed)

**What to Extract:**
- Customer questions
- Agent responses (approved/successful)
- Common issues and resolutions
- Policy clarifications

**Quality Filters:**
- ✅ Only conversations marked as "resolved"
- ✅ Only responses with high HITL grades (tone ≥4.5, accuracy ≥4.7, policy ≥4.8)
- ✅ Only conversations with customer satisfaction
- ❌ Exclude incomplete conversations
- ❌ Exclude conversations with complaints

**Process:**
1. Extract resolved conversations from Chatwoot
2. Identify question-answer pairs
3. Filter by quality metrics
4. Generate preview for CEO review
5. CEO approves/rejects each Q&A pair
6. Commit approved pairs only

### Source 3: Manual Curation (CEO-Provided)

**CEO can provide:**
- Product knowledge documents
- Policy documents
- FAQ documents
- Training materials
- Support scripts

**Process:**
1. CEO provides documents
2. System chunks and processes
3. Generate preview for CEO review
4. CEO approves/rejects
5. Commit approved content

---

## 🔄 CEO Approval Workflow

### Phase 1: Scrape & Preview (NO COMMITS)

**Step 1: Scrape hotrodan.com**
```bash
# Run scraper (stores in staging, NOT knowledge base)
npx tsx --env-file=.env scripts/knowledge-base/scrape-hotrodan.ts

# Output: staging/hotrodan-scrape-YYYY-MM-DD.json
```

**Step 2: Generate CEO Preview**
```bash
# Generate preview document for CEO review
npx tsx --env-file=.env scripts/knowledge-base/generate-preview.ts

# Output: staging/ceo-review-YYYY-MM-DD.md
```

**Preview Format:**
```markdown
# Knowledge Base Preview - YYYY-MM-DD

## Source: hotrodan.com

### Section 1: Shipping Policy
**Source URL:** https://hotrodan.com/pages/shipping
**Content:**
[Full text here]

**Action:** [ ] Approve  [ ] Reject  [ ] Edit

---

### Section 2: Return Policy
**Source URL:** https://hotrodan.com/pages/returns
**Content:**
[Full text here]

**Action:** [ ] Approve  [ ] Reject  [ ] Edit

---

[... more sections ...]
```

**Step 3: CEO Reviews Preview**
- CEO marks each section: Approve / Reject / Edit
- CEO can edit content directly in preview
- CEO saves approved preview

**Step 4: Commit Approved Content**
```bash
# Commit only CEO-approved sections
npx tsx --env-file=.env scripts/knowledge-base/commit-approved.ts staging/ceo-review-YYYY-MM-DD-approved.md

# Output: Commits to knowledge_base table with project='occ'
```

### Phase 2: Chatwoot Extraction (After Chatwoot Fixed)

**Step 1: Extract Quality Conversations**
```bash
# Extract from Chatwoot (stores in staging)
npx tsx --env-file=.env scripts/knowledge-base/extract-chatwoot.ts

# Filters:
# - status = 'resolved'
# - tone_grade >= 4.5
# - accuracy_grade >= 4.7
# - policy_grade >= 4.8

# Output: staging/chatwoot-extract-YYYY-MM-DD.json
```

**Step 2: Generate CEO Preview**
```bash
# Generate preview of Q&A pairs
npx tsx --env-file=.env scripts/knowledge-base/generate-chatwoot-preview.ts

# Output: staging/ceo-review-chatwoot-YYYY-MM-DD.md
```

**Preview Format:**
```markdown
# Chatwoot Knowledge Base Preview - YYYY-MM-DD

## Q&A Pair 1
**Customer Question:** How do I track my order?
**Agent Response:** You can track your order by...
**Quality Metrics:**
- Tone: 5.0
- Accuracy: 5.0
- Policy: 5.0
**Conversation ID:** 12345
**Date:** 2025-10-20

**Action:** [ ] Approve  [ ] Reject  [ ] Edit

---

[... more Q&A pairs ...]
```

**Step 3: CEO Reviews & Approves**
**Step 4: Commit Approved Q&A Pairs**

### Phase 3: Manual Curation

**CEO provides documents → Same preview/approval workflow**

---

## 🗄️ Database Structure

### knowledge_base Table

```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY,
  shop_domain TEXT NOT NULL,  -- 'hotrodan.com'
  
  -- Document identification
  document_key TEXT NOT NULL,  -- Unique identifier
  document_type TEXT NOT NULL,  -- 'policy', 'faq', 'product_info', 'support_qa'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Vector embedding
  embedding vector(1536),  -- OpenAI text-embedding-3-small
  
  -- Metadata
  source_url TEXT,  -- Original source
  tags TEXT[],
  category TEXT,  -- 'shipping', 'returns', 'products', 'technical', 'policies'
  
  -- Versioning
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  
  -- Audit
  created_by TEXT,  -- 'ceo_approved', 'chatwoot_extract', 'manual_curate'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Project isolation
  project TEXT DEFAULT 'occ',  -- 'occ' = customer support, 'dev_kb' = dev knowledge
  
  -- CEO approval tracking
  metadata JSONB  -- { approved_by: 'justin@hotrodan.com', approved_at: '...', source: '...' }
);
```

### Indexes

```sql
-- Vector similarity search
CREATE INDEX idx_kb_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Project isolation
CREATE INDEX idx_kb_project ON knowledge_base(project) WHERE is_current = true;

-- Category filtering
CREATE INDEX idx_kb_category ON knowledge_base(category) WHERE is_current = true;
```

---

## 🛠️ Implementation Tasks

### Task 1: Build Staging & Preview System

**Assigned to:** engineer  
**Priority:** P0  
**Estimated:** 4-6 hours

**Deliverables:**
1. `scripts/knowledge-base/scrape-hotrodan.ts` - Scrape website to staging
2. `scripts/knowledge-base/generate-preview.ts` - Generate CEO review document
3. `scripts/knowledge-base/commit-approved.ts` - Commit approved content
4. `staging/` directory for preview files (gitignored)

**Acceptance Criteria:**
- Scraper extracts all policy/FAQ/product pages
- Preview document generated in markdown
- CEO can mark Approve/Reject/Edit
- Only approved content committed to database
- All commits include CEO approval metadata

### Task 2: Build Chatwoot Extraction (After Chatwoot Fixed)

**Assigned to:** integrations  
**Priority:** P1  
**Estimated:** 3-4 hours

**Deliverables:**
1. `scripts/knowledge-base/extract-chatwoot.ts` - Extract quality conversations
2. `scripts/knowledge-base/generate-chatwoot-preview.ts` - Generate Q&A preview
3. Quality filters (HITL grades)

**Acceptance Criteria:**
- Extracts only resolved conversations
- Filters by HITL grades (tone ≥4.5, accuracy ≥4.7, policy ≥4.8)
- Generates Q&A pairs with metadata
- CEO preview format matches spec
- Only approved Q&A committed

### Task 3: Build Manual Curation Interface

**Assigned to:** engineer  
**Priority:** P2  
**Estimated:** 2-3 hours

**Deliverables:**
1. `scripts/knowledge-base/ingest-manual.ts` - Process CEO-provided docs
2. Same preview/approval workflow

**Acceptance Criteria:**
- Accepts markdown/text files
- Chunks content logically
- Generates CEO preview
- Commits approved content

---

## 📝 CEO Approval Checklist

**Before ANY content is committed, CEO must:**

- [ ] Review preview document
- [ ] Mark each section: Approve / Reject / Edit
- [ ] Verify no dev knowledge included
- [ ] Verify all content is customer-facing
- [ ] Verify accuracy of policies
- [ ] Verify accuracy of product information
- [ ] Save approved preview
- [ ] Authorize commit via approved preview file

**Commit Authorization:**
```bash
# CEO runs this after approving preview
npx tsx --env-file=.env scripts/knowledge-base/commit-approved.ts \
  staging/ceo-review-YYYY-MM-DD-approved.md \
  --approved-by justin@hotrodan.com
```

---

## 🔒 Safety Measures

**1. Staging-First Approach**
- All content goes to staging first
- NO direct commits to knowledge base
- CEO reviews staging before commit

**2. Audit Trail**
- All commits include CEO approval metadata
- Timestamp and approver recorded
- Source tracked (website, chatwoot, manual)

**3. Rollback Capability**
- Versioning enabled (version field)
- Can rollback to previous version
- Can delete entire batch if needed

**4. Project Isolation**
- Customer knowledge: `project='occ'`
- Dev knowledge: `project='dev_kb'`
- Never mix the two

---

## 📊 Success Metrics

**Quality:**
- 100% CEO approval before commit
- 0% dev knowledge in customer KB
- 0% unapproved content

**Coverage:**
- All policies documented
- All products documented
- Top 50 FAQ questions answered
- Common support issues covered

**Performance:**
- Search latency < 500ms
- Relevance score > 0.7 for top results
- Agent response quality improves (HITL grades increase)

---

## 🚀 Rollout Plan

**Phase 1: Foundation (Week 1)**
1. Build staging & preview system
2. Scrape hotrodan.com
3. CEO reviews and approves initial content
4. Commit approved content
5. Test with sample queries

**Phase 2: Chatwoot Integration (Week 2 - After Chatwoot Fixed)**
1. Extract quality conversations
2. Generate Q&A pairs
3. CEO reviews and approves
4. Commit approved Q&A
5. Monitor agent performance

**Phase 3: Continuous Improvement (Ongoing)**
1. Weekly Chatwoot extractions
2. CEO reviews new Q&A
3. Update existing content as needed
4. Track quality metrics

---

## ❓ CEO Questions to Answer

**Before proceeding, CEO should confirm:**

1. **Scope:** Is the included/excluded list correct?
2. **Sources:** Are the 3 sources (website, chatwoot, manual) sufficient?
3. **Approval Workflow:** Is the preview/approve/commit workflow acceptable?
4. **Quality Filters:** Are the Chatwoot quality thresholds correct (tone ≥4.5, accuracy ≥4.7, policy ≥4.8)?
5. **Timeline:** Is the 2-week rollout plan acceptable?
6. **Responsibility:** Who will review previews if CEO is unavailable?

---

**NEXT STEP: CEO approval required before implementation begins**

