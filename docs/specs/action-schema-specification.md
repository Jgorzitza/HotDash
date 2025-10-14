# Action Schema Specification

**Version**: 1.0  
**Date**: 2025-10-14  
**Owner**: Product Agent  
**Purpose**: Define Action data model for growth automation system  
**Status**: DRAFT - Pending Engineer approval

---

## 1. Overview

### What is an Action?

An **Action** represents a proposed change to the Shopify store (meta description, metaobject, etc.) that requires operator approval before execution.

**Lifecycle**: `pending` → `approved` → `executing` → `executed` → `outcome`

---

## 2. Database Schema (Supabase)

### Table: `actions`

```sql
CREATE TABLE actions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES stores(id),
  
  -- Classification
  type TEXT NOT NULL, -- 'seo_ctr', 'metaobject', 'merch_playbook', 'guided_selling', 'cwv'
  category TEXT NOT NULL, -- 'seo', 'content', 'merchandising', 'performance'
  priority INTEGER NOT NULL DEFAULT 5, -- 1 (highest) to 10 (lowest)
  
  -- Content
  title TEXT NOT NULL, -- "Improve CTR for Chrome Headers page"
  description TEXT NOT NULL, -- Human-readable explanation
  payload JSONB NOT NULL, -- Type-specific data (see schemas below)
  diff_preview JSONB, -- Before/after preview for operator
  
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'pending', 
    -- 'pending', 'approved', 'rejected', 'executing', 'executed', 'failed', 'rolled_back'
  
  -- Metadata
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00 (AI confidence in recommendation)
  estimated_impact TEXT, -- "CTR +2.5% → +150 visits/month"
  source TEXT NOT NULL, -- 'recommender:seo_ctr', 'recommender:metaobject', 'manual'
  
  -- Operator interaction
  approved_by TEXT REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejected_by TEXT REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  operator_notes TEXT, -- Operator can add notes when approving/rejecting
  
  -- Execution
  executed_at TIMESTAMPTZ,
  execution_log JSONB, -- API calls made, changes applied
  
  -- Outcome tracking
  outcome_measured_at TIMESTAMPTZ,
  outcome_metrics JSONB, -- Actual impact vs estimated
  outcome_status TEXT, -- 'success', 'partial_success', 'no_impact', 'negative_impact'
  
  -- Rollback
  rollback_data JSONB, -- Original values for rollback
  rolled_back_at TIMESTAMPTZ,
  rollback_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_actions_store_status ON actions(store_id, status);
CREATE INDEX idx_actions_type ON actions(type);
CREATE INDEX idx_actions_created ON actions(created_at DESC);
CREATE INDEX idx_actions_priority ON actions(priority, created_at);
```

---

## 3. Action Type Schemas

### Type: `seo_ctr` (SEO CTR Optimizer)

**Payload Structure**:
```typescript
interface SEOCTRPayload {
  shopify_resource: {
    type: 'page' | 'product' | 'collection';
    id: string; // Shopify GID
    handle: string;
    url: string;
  };
  
  current_metadata: {
    title: string;
    description: string;
  };
  
  proposed_metadata: {
    title: string;
    description: string;
    rationale: string; // Why this change improves CTR
  };
  
  gsc_data: {
    current_ctr: number; // Current click-through rate (0.035 = 3.5%)
    impressions_30d: number;
    clicks_30d: number;
    average_position: number;
    top_queries: Array<{
      query: string;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
  };
  
  estimated_impact: {
    ctr_increase_percentage: number; // +2.5 = 2.5% increase
    additional_clicks_monthly: number;
    confidence: number; // 0.0 to 1.0
  };
}
```

**Diff Preview Structure**:
```typescript
interface SEOCTRDiff {
  before: {
    title: string;
    description: string;
    ctr: number;
  };
  after: {
    title: string; // Highlighted changes
    description: string; // Highlighted changes
    estimated_ctr: number;
  };
  changes: {
    title_diff: string; // Word-level diff
    description_diff: string;
  };
}
```

**Example Payload**:
```json
{
  "shopify_resource": {
    "type": "page",
    "id": "gid://shopify/Page/123456",
    "handle": "chrome-headers",
    "url": "https://hotrodan.com/pages/chrome-headers"
  },
  "current_metadata": {
    "title": "Chrome Headers",
    "description": "Shop chrome headers for hot rods"
  },
  "proposed_metadata": {
    "title": "Chrome Headers for Hot Rods - AN Fittings & Custom Builds",
    "description": "Premium chrome headers for '69 Camaro, '32 Ford, classic hot rods. AN-6, AN-8, AN-10 fittings. Free shipping on $100+.",
    "rationale": "Current title lacks key search terms (AN fittings, specific models). CTR below 2% suggests title isn't compelling. Proposed includes top query keywords and value prop."
  },
  "gsc_data": {
    "current_ctr": 0.018,
    "impressions_30d": 5420,
    "clicks_30d": 98,
    "average_position": 8.2,
    "top_queries": [
      {"query": "chrome headers 69 camaro", "impressions": 850, "clicks": 12, "ctr": 0.014},
      {"query": "hot rod chrome headers", "impressions": 720, "clicks": 18, "ctr": 0.025},
      {"query": "AN fitting headers", "impressions": 480, "clicks": 8, "ctr": 0.017}
    ]
  },
  "estimated_impact": {
    "ctr_increase_percentage": 2.5,
    "additional_clicks_monthly": 135,
    "confidence": 0.78
  }
}
```

---

### Type: `metaobject` (Structured Data Generator)

**Payload Structure**:
```typescript
interface MetaobjectPayload {
  shopify_resource: {
    type: 'product' | 'collection' | 'page';
    id: string;
    handle: string;
  };
  
  metaobject_type: 'faq' | 'specifications' | 'reviews' | 'how_to';
  
  generated_content: {
    entries: Array<{
      key: string; // Field name
      value: string | number | boolean;
      type: 'single_line_text' | 'multi_line_text' | 'number' | 'boolean';
    }>;
  };
  
  schema_definition: {
    name: string; // "Product FAQ"
    type: string; // "product_faq"
    fields: Array<{
      key: string;
      name: string;
      type: string;
      required: boolean;
    }>;
  };
  
  validation: {
    schema_valid: boolean;
    all_required_fields: boolean;
    character_limits_ok: boolean;
  };
}
```

**Example Payload**:
```json
{
  "shopify_resource": {
    "type": "product",
    "id": "gid://shopify/Product/789012",
    "handle": "an-6-fuel-line-kit"
  },
  "metaobject_type": "faq",
  "generated_content": {
    "entries": [
      {
        "key": "question_1",
        "value": "What thread size are AN-6 fittings?",
        "type": "single_line_text"
      },
      {
        "key": "answer_1",
        "value": "AN-6 fittings use 9/16-18 thread size (UNF threads).",
        "type": "multi_line_text"
      },
      {
        "key": "question_2",
        "value": "Will this fit a '69 Camaro?",
        "type": "single_line_text"
      },
      {
        "key": "answer_2",
        "value": "Yes, this AN-6 fuel line kit is compatible with '69 Camaro small block and big block engines. Includes all necessary adapters.",
        "type": "multi_line_text"
      }
    ]
  },
  "schema_definition": {
    "name": "Product FAQ",
    "type": "product_faq",
    "fields": [
      {"key": "question_1", "name": "Question 1", "type": "single_line_text", "required": true},
      {"key": "answer_1", "name": "Answer 1", "type": "multi_line_text", "required": true}
    ]
  },
  "validation": {
    "schema_valid": true,
    "all_required_fields": true,
    "character_limits_ok": true
  }
}
```

---

### Type: `merch_playbook` (Merchandising Optimization)

**Payload Structure**:
```typescript
interface MerchPlaybookPayload {
  shopify_resource: {
    type: 'collection';
    id: string;
    handle: string;
  };
  
  optimization_type: 'sort_order' | 'featured_products' | 'cross_sell' | 'bundle';
  
  current_state: {
    product_count: number;
    current_sort: string; // 'manual', 'best-selling', 'price-asc', etc
    current_featured: string[]; // Product IDs
  };
  
  proposed_changes: {
    new_sort: string;
    new_featured: string[];
    rationale: string;
  };
  
  performance_data: {
    current_conversion: number;
    estimated_conversion: number;
    confidence: number;
  };
}
```

---

### Type: `guided_selling` (Product Recommendations)

**Payload Structure**:
```typescript
interface GuidedSellingPayload {
  trigger: {
    page_type: 'product' | 'collection' | 'cart';
    conditions: Array<{
      type: 'product_type' | 'collection' | 'cart_total';
      operator: 'equals' | 'contains' | 'greater_than';
      value: string | number;
    }>;
  };
  
  recommendation: {
    type: 'cross_sell' | 'upsell' | 'bundle';
    products: Array<{
      id: string;
      title: string;
      reasoning: string; // "Customers who bought AN-6 fittings often need..."
    }>;
    message: string; // Display message to customer
  };
  
  performance: {
    expected_aov_increase: number; // Average order value increase
    expected_conversion: number;
    confidence: number;
  };
}
```

---

### Type: `cwv` (Core Web Vitals Optimization)

**Payload Structure**:
```typescript
interface CWVPayload {
  issue_type: 'lcp' | 'fid' | 'cls' | 'ttfb';
  
  affected_pages: Array<{
    url: string;
    current_score: number;
    target_score: number;
  }>;
  
  recommended_fixes: Array<{
    fix_type: 'image_optimization' | 'lazy_loading' | 'defer_js' | 'minify_css';
    description: string;
    implementation: string; // Code changes or config changes
    expected_improvement: number; // Score improvement (0.2 = 20 point increase)
  }>;
  
  validation: {
    tested_locally: boolean;
    lighthouse_score_before: number;
    lighthouse_score_after: number;
  };
}
```

---

## 4. Status Lifecycle

### State Machine

```
                                    ┌──────────┐
                                    │ pending  │
                                    └────┬─────┘
                                         │
                        ┌────────────────┼────────────────┐
                        │                                 │
                    [approve]                        [reject]
                        │                                 │
                        ▼                                 ▼
                  ┌──────────┐                      ┌──────────┐
                  │ approved │                      │ rejected │
                  └────┬─────┘                      └──────────┘
                       │
                   [execute]
                       │
                       ▼
                 ┌───────────┐
                 │ executing │
                 └─────┬─────┘
                       │
           ┌───────────┼───────────┐
           │                       │
       [success]               [error]
           │                       │
           ▼                       ▼
     ┌──────────┐            ┌────────┐
     │ executed │            │ failed │
     └────┬─────┘            └───┬────┘
          │                       │
    [measure outcome]      [retry or rollback]
          │                       │
          ▼                       ▼
    ┌──────────┐            ┌─────────────┐
    │ outcome  │            │ rolled_back │
    └──────────┘            └─────────────┘
```

### Status Definitions

**`pending`**: Action created, awaiting operator review
- Next: Operator approves/rejects
- Timeout: Expire after 7 days (auto-reject)

**`approved`**: Operator approved, ready to execute
- Next: System executes change
- Timeout: Execute within 24 hours or alert

**`rejected`**: Operator declined action
- Next: Log reason, learn for future
- Terminal state (no further processing)

**`executing`**: Currently applying changes to Shopify
- Next: Complete successfully or fail
- Timeout: Alert if >5 minutes

**`executed`**: Changes successfully applied
- Next: Measure outcome after 7-30 days
- Store rollback data

**`failed`**: Execution error (API failure, validation error)
- Next: Retry 3X or alert operator
- Rollback if partial changes made

**`rolled_back`**: Changes reverted due to negative impact
- Next: Log learnings, don't recommend again
- Terminal state

**`outcome`**: Impact measured (success/partial/negative)
- Terminal state
- Data used for recommender learning

---

## 5. Payload Schemas by Type

### Schema Validation Rules

**All Payloads MUST Include**:
- `shopify_resource` - What is being changed
- `current_state` - Before values
- `proposed_state` - After values
- `rationale` - Why this change
- `estimated_impact` - Expected business value

**Validation on Create**:
```typescript
function validateActionPayload(type: string, payload: any): ValidationResult {
  // Type-specific schema validation
  const schema = ACTION_TYPE_SCHEMAS[type];
  const errors = validateJSON(payload, schema);
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Business rule validation
  if (payload.confidence_score && payload.confidence_score < 0.5) {
    return { valid: false, errors: ['Confidence too low for auto-generation'] };
  }
  
  return { valid: true };
}
```

---

## 6. Diff Preview Format

### Purpose

Operator needs to see **exactly what will change** before approving.

### Structure

```typescript
interface DiffPreview {
  type: 'text' | 'json' | 'structured';
  
  changes: Array<{
    field: string; // "meta_description"
    before: string | object;
    after: string | object;
    diff: string; // Formatted diff (added/removed/unchanged)
    change_type: 'addition' | 'modification' | 'deletion';
  }>;
  
  summary: {
    fields_changed: number;
    additions: number;
    modifications: number;
    deletions: number;
  };
}
```

### Example: SEO CTR Diff

```json
{
  "type": "text",
  "changes": [
    {
      "field": "meta_title",
      "before": "Chrome Headers",
      "after": "Chrome Headers for Hot Rods - AN Fittings & Custom Builds",
      "diff": "Chrome Headers[ + for Hot Rods - AN Fittings & Custom Builds]",
      "change_type": "modification"
    },
    {
      "field": "meta_description",
      "before": "Shop chrome headers for hot rods",
      "after": "Premium chrome headers for '69 Camaro, '32 Ford, classic hot rods. AN-6, AN-8, AN-10 fittings. Free shipping on $100+.",
      "diff": "[- Shop chrome headers for hot rods][+ Premium chrome headers for '69 Camaro, '32 Ford, classic hot rods. AN-6, AN-8, AN-10 fittings. Free shipping on $100+.]",
      "change_type": "modification"
    }
  ],
  "summary": {
    "fields_changed": 2,
    "additions": 0,
    "modifications": 2,
    "deletions": 0
  }
}
```

---

## 7. Outcome Tracking

### Metrics by Action Type

**SEO CTR Actions**:
```typescript
interface SEOCTROutcome {
  measured_period_days: 30; // Measure CTR change over 30 days
  
  actual_impact: {
    ctr_before: number;
    ctr_after: number;
    ctr_change_percentage: number;
    additional_clicks: number;
  };
  
  vs_estimate: {
    estimated_ctr_change: number;
    actual_ctr_change: number;
    accuracy_percentage: number; // How close was estimate?
  };
  
  outcome_classification: 'success' | 'partial_success' | 'no_impact' | 'negative_impact';
}
```

**Success Criteria**:
- `success`: Actual impact ≥80% of estimated
- `partial_success`: Actual impact 40-79% of estimated
- `no_impact`: Actual impact <40% of estimated
- `negative_impact`: CTR decreased

---

### Outcome Measurement Schedule

**Day 7**: Early signal (trending up/down?)  
**Day 14**: Mid-point check (50% of expected impact?)  
**Day 30**: Final measurement (success or failure?)

**Automation**:
```typescript
// Scheduled job runs daily
async function measureActionOutcomes() {
  const actionsToMeasure = await db.actions
    .where('status', 'executed')
    .where('outcome_measured_at', null)
    .where('executed_at', '<', dayjs().subtract(30, 'days'));
  
  for (const action of actionsToMeasure) {
    const outcome = await measureImpact(action);
    await db.actions.update(action.id, {
      outcome_measured_at: new Date(),
      outcome_metrics: outcome,
      outcome_status: classifyOutcome(outcome)
    });
  }
}
```

---

## 8. Rollback Mechanism

### Rollback Data Storage

**Store Original Values** (when executing action):
```typescript
interface RollbackData {
  action_id: string;
  executed_at: string;
  
  original_values: {
    [field: string]: any; // Original values before change
  };
  
  shopify_resource: {
    type: string;
    id: string;
    api_version: string; // Shopify API version used
  };
  
  rollback_script: string; // Generated script to revert changes
}
```

**Example**:
```json
{
  "action_id": "uuid-123",
  "executed_at": "2025-10-15T10:00:00Z",
  "original_values": {
    "meta_title": "Chrome Headers",
    "meta_description": "Shop chrome headers for hot rods"
  },
  "shopify_resource": {
    "type": "page",
    "id": "gid://shopify/Page/123456",
    "api_version": "2024-10"
  },
  "rollback_script": "mutation { pageUpdate(id: \"gid://shopify/Page/123456\", page: { metafields: [...] }) }"
}
```

### Rollback Triggers

**Automatic Rollback** (system-initiated):
- Outcome measured as `negative_impact` after 30 days
- Critical error during execution (revert partial changes)
- Shopify API errors (couldn't complete action)

**Manual Rollback** (operator-initiated):
- Operator sees negative results early (before 30 days)
- Customer complaints about changes
- SEO rankings drop immediately after change

### Rollback Execution

```typescript
async function rollbackAction(actionId: string, reason: string) {
  const action = await db.actions.findOne(actionId);
  const rollbackData = action.rollback_data;
  
  // Execute rollback via Shopify API
  await shopify.revertChanges(rollbackData.shopify_resource, rollbackData.original_values);
  
  // Update action status
  await db.actions.update(actionId, {
    status: 'rolled_back',
    rolled_back_at: new Date(),
    rollback_reason: reason
  });
  
  // Log for learning
  await logRollback(action, reason);
}
```

---

## 9. API Endpoints

### Required Endpoints

**GET `/api/actions`**
- List pending actions for operator review
- Query params: `?status=pending&store_id={id}&limit=10`
- Response: Array of actions with diff previews

**GET `/api/actions/:id`**
- Get single action details
- Response: Full action with payload, diff, metadata

**POST `/api/actions/:id/approve`**
- Approve action for execution
- Body: `{ operator_notes?: string }`
- Response: Updated action (status = 'approved')

**POST `/api/actions/:id/reject`**
- Reject action
- Body: `{ rejection_reason: string, operator_notes?: string }`
- Response: Updated action (status = 'rejected')

**POST `/api/actions/:id/execute`**
- Execute approved action (system-triggered)
- Auth: System only (not exposed to operators)
- Response: Execution log

**POST `/api/actions/:id/rollback`**
- Rollback executed action
- Body: `{ rollback_reason: string }`
- Response: Rollback confirmation

**GET `/api/actions/outcomes`**
- Get outcome metrics for learning
- Query: `?outcome_status=success&days=30`
- Response: Aggregated outcomes by type

---

## 10. Implementation Requirements

### For Engineer Team

**Phase 1: Database** (2-3 hours)
- [ ] Create `actions` table with schema above
- [ ] Add indexes for performance
- [ ] Add RLS policies (operators see own store only)
- [ ] Migration tested in staging

**Phase 2: API Routes** (4-5 hours)
- [ ] Implement 7 endpoints listed above
- [ ] Add validation for all payloads
- [ ] Add authorization (operator must own store)
- [ ] Add rate limiting (prevent abuse)
- [ ] API tests written (integration tests)

**Phase 3: Execution Engine** (3-4 hours)
- [ ] Background job to execute approved actions
- [ ] Shopify API integration for each action type
- [ ] Error handling and retry logic
- [ ] Rollback mechanism implementation
- [ ] Execution logging

**Phase 4: Outcome Measurement** (2-3 hours)
- [ ] Scheduled job (daily) to measure outcomes
- [ ] GSC/Shopify data collection for metrics
- [ ] Outcome classification logic
- [ ] Learning data export for AI team

**Total Estimate**: 11-15 hours

---

## 11. Acceptance Criteria

### Action Schema is DONE When:

- [x] Database table created and deployed to staging
- [x] All 5 action types have defined payload schemas
- [x] Diff preview format specified and examples provided
- [x] Status lifecycle documented with state machine
- [x] Rollback mechanism designed with data storage
- [x] API endpoints specified with request/response formats
- [x] Engineer reviews and approves schema
- [x] QA writes test scenarios based on spec
- [x] CEO approves approach

---

## 12. Test Scenarios

### Scenario 1: SEO CTR Action Happy Path

1. Recommender creates SEO CTR action (status: pending)
2. Action appears in operator approval queue
3. Operator reviews diff preview (title + description changes)
4. Operator approves action
5. System executes Shopify API call (updates page metadata)
6. Action status → executed
7. After 30 days, system measures CTR change
8. Outcome: CTR increased 2.8% (vs 2.5% estimated) → success

**Expected Result**: ✅ All steps complete, positive outcome measured

---

### Scenario 2: Action Rejection Flow

1. Recommender creates metaobject action
2. Operator reviews, finds generated content incorrect
3. Operator rejects with reason: "Product specs are wrong"
4. Action status → rejected
5. System logs rejection for AI learning
6. AI improves recommendations based on feedback

**Expected Result**: ✅ Rejection logged, learning loop engaged

---

### Scenario 3: Execution Failure & Rollback

1. Operator approves SEO CTR action
2. System attempts Shopify API call
3. API returns error: "Resource not found"
4. System logs failure, action status → failed
5. Operator notified of failure
6. Engineer investigates and fixes
7. Action retried successfully

**Expected Result**: ✅ Graceful failure handling, retry succeeds

---

### Scenario 4: Negative Outcome Rollback

1. Action executed successfully
2. After 30 days, CTR decreased by 1.5% (negative impact)
3. System auto-flags for rollback
4. Operator reviews, confirms rollback
5. System reverts to original metadata
6. Action status → rolled_back
7. Recommender learns to avoid similar changes

**Expected Result**: ✅ Negative impact detected and reverted

---

## 13. Non-Functional Requirements

### Performance

- **Action Creation**: <500ms
- **Approval/Rejection**: <200ms
- **Execution**: <5s per action
- **Queue Load**: <1s for 100 pending actions

### Security

- **RLS**: Operators only see actions for their stores
- **Authorization**: Only approved operators can approve actions
- **Audit Trail**: All approvals/rejections/executions logged
- **Rollback Safety**: Only rollback if operator authorizes or auto-criteria met

### Scalability

- **Actions per Store**: Support 100+ pending actions per store
- **Stores**: Support 100+ stores with separate action queues
- **Execution Throughput**: Process 50 actions/hour
- **Outcome Measurement**: Measure 1,000+ actions/day (background job)

---

## Document Status

**Status**: ✅ COMPLETE - Ready for Engineer review  
**Owner**: Product Agent  
**Created**: 2025-10-14T12:47:20Z  
**Next**: Engineer reviews schema, provides feedback, begins implementation

---

**This specification provides complete, actionable requirements for engineers to build the Action system. All data models, lifecycle states, API endpoints, and acceptance criteria are defined.**

