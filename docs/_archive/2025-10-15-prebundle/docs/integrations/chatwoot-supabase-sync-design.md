# Chatwoot-to-Supabase Data Sync Design

**Purpose:** Design data synchronization from Chatwoot to Supabase for analytics and reporting  
**Date:** 2025-10-11  
**Status:** Design Complete, Ready for Implementation

---

## Architecture Overview

```
┌──────────────────┐
│    Chatwoot      │
│    (Fly.io)      │
└────────┬─────────┘
         │
         ├─→ Real-time Sync (Webhooks)
         │   - message_created
         │   - conversation_status_changed
         │   - conversation_resolved
         │
         └─→ Batch Sync (Nightly Job)
             - Full conversation history
             - Agent performance metrics
             - Customer data enrichment
         
         ↓
┌──────────────────┐
│  Sync Service    │
│  (Edge Function) │
└────────┬─────────┘
         │
         ├─→ Transform Data
         ├─→ Validate Schema
         └─→ Enrich Context
         
         ↓
┌──────────────────┐
│    Supabase      │
│   (PostgreSQL)   │
└────────┬─────────┘
         │
         ├─→ conversation_analytics
         ├─→ agent_performance_metrics
         ├─→ customer_interaction_history
         └─→ support_knowledge_gaps
```

---

## Data Models

### Table 1: `conversation_analytics`

```sql
CREATE TABLE conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chatwoot references
  chatwoot_conversation_id BIGINT NOT NULL UNIQUE,
  chatwoot_inbox_id INTEGER NOT NULL,
  chatwoot_account_id INTEGER NOT NULL,
  
  -- Conversation metadata
  status TEXT NOT NULL CHECK (status IN ('open', 'pending', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  
  -- Customer info
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_segment TEXT, -- 'vip', 'standard', 'new'
  
  -- Agent SDK metrics
  agent_sdk_used BOOLEAN DEFAULT false,
  draft_confidence_score INTEGER,
  draft_created_at TIMESTAMPTZ,
  draft_approved_at TIMESTAMPTZ,
  operator_action TEXT CHECK (operator_action IN ('approve', 'edit', 'escalate', 'reject')),
  
  -- Performance metrics
  time_to_first_response_seconds INTEGER,
  time_to_resolution_seconds INTEGER,
  message_count INTEGER DEFAULT 0,
  agent_message_count INTEGER DEFAULT 0,
  customer_message_count INTEGER DEFAULT 0,
  
  -- Categorization
  category TEXT, -- 'order', 'product', 'return', 'general'
  subcategory TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sentiment TEXT, -- 'happy', 'neutral', 'frustrated', 'angry'
  urgency TEXT, -- 'low', 'normal', 'high', 'urgent'
  
  -- Agent assignment
  assigned_agent_id INTEGER,
  assigned_agent_name TEXT,
  escalated BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  
  -- Satisfaction
  csat_rating INTEGER CHECK (csat_rating BETWEEN 1 AND 5),
  csat_feedback TEXT,
  
  -- Timestamps
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_customer_email (customer_email),
  INDEX idx_agent_sdk (agent_sdk_used) WHERE agent_sdk_used = true,
  INDEX idx_category (category, subcategory)
);
```

### Table 2: `agent_performance_metrics`

```sql
CREATE TABLE agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Agent identification
  chatwoot_agent_id INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  agent_email TEXT,
  
  -- Time period
  date DATE NOT NULL,
  hour INTEGER CHECK (hour BETWEEN 0 AND 23), -- NULL for daily rollup
  
  -- Volume metrics
  conversations_handled INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  private_notes_created INTEGER DEFAULT 0,
  
  -- Agent SDK metrics
  drafts_approved INTEGER DEFAULT 0,
  drafts_edited INTEGER DEFAULT 0,
  drafts_rejected INTEGER DEFAULT 0,
  escalations_made INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_first_response_time_seconds INTEGER,
  avg_resolution_time_seconds INTEGER,
  avg_draft_review_time_seconds INTEGER,
  
  -- Quality metrics
  csat_avg DECIMAL(3,2),
  csat_count INTEGER DEFAULT 0,
  first_contact_resolution_rate DECIMAL(5,2),
  
  -- Activity tracking
  online_time_minutes INTEGER,
  idle_time_minutes INTEGER,
  
  -- Timestamps
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(chatwoot_agent_id, date, hour),
  INDEX idx_agent_date (chatwoot_agent_id, date DESC),
  INDEX idx_date (date DESC)
);
```

### Table 3: `customer_interaction_history`

```sql
CREATE TABLE customer_interaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer identification
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  chatwoot_contact_id BIGINT,
  
  -- Conversation reference
  conversation_id UUID REFERENCES conversation_analytics(id),
  chatwoot_conversation_id BIGINT NOT NULL,
  
  -- Interaction details
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('inquiry', 'complaint', 'follow_up', 'feedback')),
  category TEXT,
  sentiment TEXT,
  
  -- Resolution
  resolved BOOLEAN DEFAULT false,
  resolution_time_seconds INTEGER,
  satisfaction_score INTEGER,
  
  -- Timestamps
  interaction_date TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_customer_email (customer_email),
  INDEX idx_interaction_date (interaction_date DESC),
  INDEX idx_resolved (resolved)
);
```

### Table 4: `support_knowledge_gaps`

```sql
CREATE TABLE support_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Gap identification
  customer_question TEXT NOT NULL,
  detected_category TEXT,
  detected_keywords TEXT[],
  
  -- Agent SDK analysis
  llama_index_results JSONB, -- What KB articles were found
  llama_index_relevance_scores DECIMAL[], -- How relevant were they
  draft_confidence_score INTEGER,
  
  -- Operator feedback
  was_rejected BOOLEAN DEFAULT false,
  rejection_reason TEXT,
  correct_information TEXT, -- What operator provided instead
  
  -- Frequency tracking
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Resolution status
  gap_filled BOOLEAN DEFAULT false,
  knowledge_article_created_at TIMESTAMPTZ,
  knowledge_article_url TEXT,
  
  -- Indexes
  INDEX idx_gap_filled (gap_filled) WHERE gap_filled = false,
  INDEX idx_occurrence_count (occurrence_count DESC)
);
```

---

## Sync Strategies

### Real-Time Sync (Webhook-Based)

**Use Cases:**
- Immediate analytics updates
- Live operator dashboards
- Real-time alerting
- Customer interaction tracking

**Implementation:**

```typescript
// In supabase/functions/chatwoot-webhook/index.ts

// After processing webhook, sync to analytics
await supabase.from('conversation_analytics').upsert({
  chatwoot_conversation_id: conversation.id,
  chatwoot_inbox_id: conversation.inbox_id,
  chatwoot_account_id: account.id,
  status: conversation.status,
  created_at: new Date(conversation.created_at * 1000),
  updated_at: new Date(),
  customer_name: conversation.contact?.name,
  customer_email: conversation.contact?.email,
  agent_sdk_used: true,
  draft_created_at: new Date(),
  category: detectedCategory,
  sentiment: sentiment.emotion,
  urgency: sentiment.urgency,
  message_count: conversation.messages?.length || 1
}, {
  onConflict: 'chatwoot_conversation_id'
});

// Track customer interaction
await supabase.from('customer_interaction_history').insert({
  customer_email: conversation.contact?.email,
  customer_name: conversation.contact?.name,
  chatwoot_contact_id: conversation.contact?.id,
  chatwoot_conversation_id: conversation.id,
  interaction_type: 'inquiry',
  category: detectedCategory,
  sentiment: sentiment.emotion,
  interaction_date: new Date(),
  resolved: false
});
```

**Frequency:** Every webhook event (sub-second latency)

---

### Batch Sync (Nightly Job)

**Use Cases:**
- Historical data backfill
- Performance metrics aggregation
- Data quality verification
- Gap analysis

**Implementation:**

```typescript
// supabase/functions/chatwoot-batch-sync/index.ts

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

serve(async (req: Request) => {
  const startTime = Date.now();
  
  // Fetch conversations from Chatwoot (last 24 hours)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const conversations = await fetchChatwootConversations(since);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  for (const conv of conversations) {
    // Sync conversation
    await syncConversation(supabase, conv);
    
    // Sync messages
    const messages = await fetchConversationMessages(conv.id);
    await syncMessages(supabase, conv.id, messages);
    
    // Calculate metrics
    await calculateConversationMetrics(supabase, conv.id);
  }
  
  // Aggregate agent performance
  await aggregateAgentMetrics(supabase, since);
  
  // Identify knowledge gaps
  await identifyKnowledgeGaps(supabase);
  
  const duration = Date.now() - startTime;
  
  return new Response(JSON.stringify({
    ok: true,
    conversations_synced: conversations.length,
    duration_ms: duration
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

async function syncConversation(supabase: any, conv: any) {
  await supabase.from('conversation_analytics').upsert({
    chatwoot_conversation_id: conv.id,
    chatwoot_inbox_id: conv.inbox_id,
    chatwoot_account_id: conv.account_id,
    status: conv.status,
    created_at: new Date(conv.created_at * 1000),
    updated_at: new Date(conv.timestamp * 1000),
    resolved_at: conv.status === 'resolved' ? new Date() : null,
    customer_name: conv.meta?.sender?.name,
    customer_email: conv.meta?.sender?.email,
    tags: conv.labels || [],
    assigned_agent_id: conv.meta?.assignee?.id,
    assigned_agent_name: conv.meta?.assignee?.name,
    message_count: conv.messages_count || 0
  }, {
    onConflict: 'chatwoot_conversation_id'
  });
}
```

**Schedule:** Nightly at 2 AM UTC (Supabase cron job)

```sql
-- supabase/migrations/XXXXXX_chatwoot_sync_cron.sql

SELECT cron.schedule(
  'chatwoot-nightly-sync',
  '0 2 * * *', -- 2 AM UTC daily
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/chatwoot-batch-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## Sync Modes Comparison

| Aspect | Real-Time (Webhook) | Batch (Nightly) |
|--------|-------------------|-----------------|
| **Latency** | < 1s | Up to 24 hours |
| **Use Case** | Live dashboards, alerts | Historical analytics |
| **Data Volume** | Per-event (KB) | Bulk (MB-GB) |
| **Reliability** | Depends on webhook | More resilient |
| **Cost** | Low (per-event) | Moderate (bulk processing) |
| **Complexity** | Simple | Complex (pagination, deduplication) |

**Recommendation:** Use both - real-time for operational data, batch for analytics/enrichment

---

## Metrics to Track

### Conversation Metrics

```sql
-- Daily conversation volume
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_conversations,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
  SUM(CASE WHEN agent_sdk_used THEN 1 ELSE 0 END) as agent_sdk_conversations,
  AVG(time_to_first_response_seconds) as avg_first_response_sec,
  AVG(time_to_resolution_seconds) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_sec
FROM conversation_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Agent SDK Performance

```sql
-- Agent SDK effectiveness
SELECT 
  operator_action,
  COUNT(*) as count,
  AVG(draft_confidence_score) as avg_confidence,
  AVG(EXTRACT(EPOCH FROM (draft_approved_at - draft_created_at))) as avg_review_time_sec,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM conversation_analytics
WHERE agent_sdk_used = true
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY operator_action
ORDER BY count DESC;
```

### Customer Satisfaction Trends

```sql
-- CSAT by category over time
SELECT 
  DATE_TRUNC('week', created_at) as week,
  category,
  AVG(csat_rating) as avg_csat,
  COUNT(*) FILTER (WHERE csat_rating IS NOT NULL) as rated_conversations,
  COUNT(*) as total_conversations
FROM conversation_analytics
WHERE created_at > NOW() - INTERVAL '90 days'
  AND csat_rating IS NOT NULL
GROUP BY week, category
ORDER BY week DESC, category;
```

### Knowledge Gap Analysis

```sql
-- Most common knowledge gaps
SELECT 
  detected_category,
  customer_question,
  occurrence_count,
  AVG(draft_confidence_score) as avg_confidence,
  gap_filled,
  knowledge_article_url
FROM support_knowledge_gaps
WHERE gap_filled = false
ORDER BY occurrence_count DESC
LIMIT 20;
```

---

## Data Enrichment

### Order Data Integration

```typescript
// Enrich conversation with order data from Shopify
async function enrichWithOrderData(conversation: Conversation) {
  // Extract order number from message
  const orderNumber = extractOrderNumber(conversation.messages);
  
  if (!orderNumber) return conversation;
  
  // Fetch order from Shopify
  const order = await shopifyClient.getOrder(orderNumber);
  
  // Enrich conversation analytics
  return {
    ...conversation,
    custom_attributes: {
      ...conversation.custom_attributes,
      order_number: orderNumber,
      order_status: order.status,
      order_total: order.total_price,
      order_date: order.created_at,
      tracking_number: order.fulfillments?.[0]?.tracking_number,
      tracking_url: order.fulfillments?.[0]?.tracking_url
    }
  };
}
```

### Customer Lifetime Value

```typescript
// Calculate and sync customer LTV
async function enrichWithCustomerLTV(supabase: any, email: string) {
  // Get all orders for customer from Shopify
  const orders = await shopifyClient.getCustomerOrders(email);
  
  const lifetime_value = orders.reduce((sum, order) => 
    sum + parseFloat(order.total_price), 0
  );
  
  const order_count = orders.length;
  const first_order_date = orders[orders.length - 1]?.created_at;
  const last_order_date = orders[0]?.created_at;
  
  // Update conversation analytics
  await supabase
    .from('conversation_analytics')
    .update({
      customer_segment: lifetime_value > 1000 ? 'vip' : 'standard',
      custom_attributes: {
        lifetime_value,
        order_count,
        first_order_date,
        last_order_date
      }
    })
    .eq('customer_email', email);
}
```

---

## Analytics Views

### View 1: Agent SDK Performance Dashboard

```sql
CREATE OR REPLACE VIEW agent_sdk_performance_dashboard AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_drafts,
  SUM(CASE WHEN operator_action = 'approve' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN operator_action = 'edit' THEN 1 ELSE 0 END) as edited,
  SUM(CASE WHEN operator_action = 'reject' THEN 1 ELSE 0 END) as rejected,
  SUM(CASE WHEN operator_action = 'escalate' THEN 1 ELSE 0 END) as escalated,
  ROUND(AVG(draft_confidence_score), 1) as avg_confidence,
  ROUND(AVG(time_to_first_response_seconds) / 60.0, 1) as avg_response_time_min,
  ROUND(SUM(CASE WHEN operator_action = 'approve' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as approval_rate,
  ROUND(SUM(CASE WHEN operator_action = 'edit' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as edit_rate
FROM conversation_analytics
WHERE agent_sdk_used = true
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### View 2: Customer Support Health

```sql
CREATE OR REPLACE VIEW customer_support_health AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_conversations,
  SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
  ROUND(SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as resolution_rate,
  ROUND(AVG(time_to_first_response_seconds) / 60.0, 1) as avg_first_response_min,
  ROUND(AVG(time_to_resolution_seconds) FILTER (WHERE status = 'resolved') / 3600.0, 1) as avg_resolution_hours,
  ROUND(AVG(csat_rating) FILTER (WHERE csat_rating IS NOT NULL), 2) as avg_csat,
  SUM(CASE WHEN agent_sdk_used THEN 1 ELSE 0 END) as agent_sdk_conversations,
  ROUND(SUM(CASE WHEN agent_sdk_used THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as agent_sdk_adoption
FROM conversation_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Sync Job Implementation

### Edge Function: Batch Sync

**Location:** `supabase/functions/chatwoot-batch-sync/index.ts`

**Features:**
- Pagination handling for large datasets
- Incremental sync (only changed records)
- Error recovery and retry logic
- Progress tracking
- Data validation

**Schedule:**
```sql
-- Run nightly at 2 AM UTC
SELECT cron.schedule(
  'chatwoot-batch-sync',
  '0 2 * * *',
  $$ SELECT net.http_post(...) $$
);
```

### Incremental Sync Logic

```typescript
async function incrementalSync(supabase: any, since: Date) {
  const CHATWOOT_BASE_URL = Deno.env.get('CHATWOOT_BASE_URL')!;
  const API_TOKEN = Deno.env.get('CHATWOOT_API_TOKEN')!;
  
  let page = 1;
  let hasMore = true;
  let totalSynced = 0;
  
  while (hasMore) {
    // Fetch page of conversations
    const response = await fetch(
      `${CHATWOOT_BASE_URL}/api/v1/accounts/1/conversations?page=${page}&since=${since.toISOString()}`,
      {
        headers: { 'api_access_token': API_TOKEN }
      }
    );
    
    const data = await response.json();
    const conversations = data.data?.payload || [];
    
    // Sync each conversation
    for (const conv of conversations) {
      await syncConversation(supabase, conv);
      totalSynced++;
    }
    
    // Check if more pages
    hasMore = conversations.length > 0;
    page++;
    
    // Rate limiting
    await new Deno.sleep(100); // 100ms between pages
  }
  
  return totalSynced;
}
```

---

## Data Quality & Validation

### Validation Rules

```typescript
interface ValidationRule {
  field: string;
  rule: (value: any) => boolean;
  error: string;
}

const validationRules: ValidationRule[] = [
  {
    field: 'chatwoot_conversation_id',
    rule: (v) => typeof v === 'number' && v > 0,
    error: 'Invalid conversation ID'
  },
  {
    field: 'customer_email',
    rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    error: 'Invalid email format'
  },
  {
    field: 'status',
    rule: (v) => ['open', 'pending', 'resolved'].includes(v),
    error: 'Invalid status value'
  },
  {
    field: 'draft_confidence_score',
    rule: (v) => v === null || (v >= 0 && v <= 100),
    error: 'Confidence score must be 0-100'
  }
];

function validateRecord(record: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const rule of validationRules) {
    if (!rule.rule(record[rule.field])) {
      errors.push(`${rule.field}: ${rule.error}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Analytics Dashboards

### Dashboard 1: Agent SDK Performance

**Metrics:**
- Draft approval rate (target: >60%)
- Draft edit rate (target: <30%)
- Average confidence score
- Time to review (target: <2 min)
- Escalation rate (target: <10%)

**SQL:**
```sql
SELECT 
  'Agent SDK Performance' as dashboard,
  json_build_object(
    'approval_rate', (
      SELECT ROUND(AVG(CASE WHEN operator_action = 'approve' THEN 100 ELSE 0 END), 1)
      FROM conversation_analytics
      WHERE agent_sdk_used = true
        AND created_at > NOW() - INTERVAL '7 days'
    ),
    'edit_rate', (
      SELECT ROUND(AVG(CASE WHEN operator_action = 'edit' THEN 100 ELSE 0 END), 1)
      FROM conversation_analytics
      WHERE agent_sdk_used = true
        AND created_at > NOW() - INTERVAL '7 days'
    ),
    'avg_confidence', (
      SELECT ROUND(AVG(draft_confidence_score), 1)
      FROM conversation_analytics
      WHERE agent_sdk_used = true
        AND created_at > NOW() - INTERVAL '7 days'
    ),
    'avg_review_time_min', (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (draft_approved_at - draft_created_at)) / 60.0), 1)
      FROM conversation_analytics
      WHERE agent_sdk_used = true
        AND draft_approved_at IS NOT NULL
        AND created_at > NOW() - INTERVAL '7 days'
    )
  ) as metrics;
```

### Dashboard 2: Support Health

**Metrics:**
- Total conversations
- Resolution rate
- Average response time
- CSAT score
- Agent SDK adoption rate

---

## Real-Time vs Batch: Decision Matrix

| Data Type | Sync Method | Why |
|-----------|-------------|-----|
| **New conversation** | Real-time | Immediate operator notification |
| **New message** | Real-time | Draft generation trigger |
| **Conversation resolved** | Real-time | Update dashboards instantly |
| **Historical data** | Batch | Efficient bulk processing |
| **Agent performance** | Batch | Aggregation across time periods |
| **Customer LTV** | Batch | Requires Shopify API calls |
| **Knowledge gaps** | Batch | Analysis across conversations |
| **CSAT scores** | Real-time | Immediate feedback loop |

---

## Monitoring & Alerts

### Sync Health Monitoring

```sql
-- Check sync lag
SELECT 
  MAX(created_at) as last_conversation_time,
  MAX(synced_at) as last_sync_time,
  EXTRACT(EPOCH FROM (NOW() - MAX(synced_at))) / 60 as sync_lag_minutes
FROM conversation_analytics;

-- Alert if sync lag > 10 minutes
CREATE OR REPLACE FUNCTION check_sync_health()
RETURNS boolean AS $$
DECLARE
  lag_minutes INTEGER;
BEGIN
  SELECT EXTRACT(EPOCH FROM (NOW() - MAX(synced_at))) / 60
  INTO lag_minutes
  FROM conversation_analytics;
  
  IF lag_minutes > 10 THEN
    -- Send alert
    PERFORM net.http_post(
      url := current_setting('app.settings.slack_webhook_url'),
      body := jsonb_build_object(
        'text', '⚠️ Chatwoot sync lag: ' || lag_minutes || ' minutes'
      )
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;
```

---

## Data Retention Policy

### Retention Periods

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| **Active conversations** | Indefinite | Ongoing support |
| **Resolved conversations** | 2 years | Compliance, analytics |
| **Customer interaction history** | 3 years | Lifetime value tracking |
| **Agent performance metrics** | 1 year | Performance reviews |
| **Knowledge gap data** | Until filled | Continuous improvement |
| **Raw webhook logs** | 30 days | Debugging, audit |

### Cleanup Jobs

```sql
-- Archive old resolved conversations
CREATE OR REPLACE FUNCTION archive_old_conversations()
RETURNS void AS $$
BEGIN
  -- Move to archive table
  INSERT INTO conversation_analytics_archive
  SELECT *
  FROM conversation_analytics
  WHERE status = 'resolved'
    AND resolved_at < NOW() - INTERVAL '2 years';
  
  -- Delete from main table
  DELETE FROM conversation_analytics
  WHERE status = 'resolved'
    AND resolved_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly cleanup
SELECT cron.schedule(
  'archive-old-conversations',
  '0 3 1 * *', -- 3 AM UTC on 1st of month
  $$ SELECT archive_old_conversations(); $$
);
```

---

## Performance Optimization

### Indexing Strategy

```sql
-- Optimize for common queries
CREATE INDEX CONCURRENTLY idx_conv_created_status 
  ON conversation_analytics(created_at DESC, status);

CREATE INDEX CONCURRENTLY idx_conv_agent_sdk_created 
  ON conversation_analytics(created_at DESC) 
  WHERE agent_sdk_used = true;

CREATE INDEX CONCURRENTLY idx_conv_customer_email_date 
  ON conversation_analytics(customer_email, created_at DESC);

-- Partial index for unresolved
CREATE INDEX CONCURRENTLY idx_conv_unresolved 
  ON conversation_analytics(created_at DESC) 
  WHERE status IN ('open', 'pending');
```

### Query Optimization

```sql
-- Materialized view for expensive aggregations
CREATE MATERIALIZED VIEW daily_support_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_conversations,
  SUM(CASE WHEN agent_sdk_used THEN 1 ELSE 0 END) as agent_sdk_count,
  AVG(draft_confidence_score) FILTER (WHERE agent_sdk_used) as avg_confidence,
  AVG(time_to_first_response_seconds) as avg_first_response_sec,
  AVG(csat_rating) FILTER (WHERE csat_rating IS NOT NULL) as avg_csat
FROM conversation_analytics
GROUP BY DATE(created_at);

-- Refresh daily
SELECT cron.schedule(
  'refresh-daily-summary',
  '0 4 * * *', -- 4 AM UTC daily
  $$ REFRESH MATERIALIZED VIEW CONCURRENTLY daily_support_summary; $$
);
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Create database tables and indexes
- [ ] Implement real-time webhook sync
- [ ] Test real-time sync with sample data
- [ ] Set up basic monitoring

### Week 2: Batch Sync
- [ ] Implement batch sync Edge Function
- [ ] Set up cron job scheduling
- [ ] Add pagination and error handling
- [ ] Test with historical data

### Week 3: Enrichment
- [ ] Integrate Shopify order data
- [ ] Calculate customer LTV
- [ ] Implement knowledge gap detection
- [ ] Create analytics views

### Week 4: Polish
- [ ] Create dashboards
- [ ] Set up alerts
- [ ] Optimize query performance
- [ ] Document sync procedures

---

## Testing & Validation

### Sync Accuracy Tests

```bash
# Test real-time sync
# 1. Create conversation in Chatwoot
# 2. Check Supabase within 5 seconds
# 3. Verify all fields populated correctly

# Test batch sync
# 1. Run batch sync manually
# 2. Compare row counts (Chatwoot vs Supabase)
# 3. Validate random sample of records
# 4. Check for data quality issues
```

### Data Quality Checks

```sql
-- Missing required fields
SELECT COUNT(*) as missing_customer_email
FROM conversation_analytics
WHERE customer_email IS NULL;

-- Invalid date ranges
SELECT COUNT(*) as invalid_dates
FROM conversation_analytics
WHERE created_at > updated_at
   OR (resolved_at IS NOT NULL AND resolved_at < created_at);

-- Orphaned records (no matching customer)
SELECT COUNT(*) as orphaned
FROM conversation_analytics ca
LEFT JOIN customer_interaction_history cih 
  ON ca.customer_email = cih.customer_email
WHERE cih.id IS NULL;
```

---

## Reporting Examples

### Weekly Support Report

```sql
SELECT 
  'Weekly Support Report' as report_name,
  json_build_object(
    'week_ending', DATE_TRUNC('week', NOW()),
    'total_conversations', (SELECT COUNT(*) FROM conversation_analytics WHERE created_at > NOW() - INTERVAL '7 days'),
    'resolved', (SELECT COUNT(*) FROM conversation_analytics WHERE status = 'resolved' AND resolved_at > NOW() - INTERVAL '7 days'),
    'avg_first_response_min', (SELECT ROUND(AVG(time_to_first_response_seconds) / 60.0, 1) FROM conversation_analytics WHERE created_at > NOW() - INTERVAL '7 days'),
    'avg_csat', (SELECT ROUND(AVG(csat_rating), 2) FROM conversation_analytics WHERE csat_rating IS NOT NULL AND created_at > NOW() - INTERVAL '7 days'),
    'agent_sdk_adoption', (SELECT ROUND(AVG(CASE WHEN agent_sdk_used THEN 100 ELSE 0 END), 1) FROM conversation_analytics WHERE created_at > NOW() - INTERVAL '7 days'),
    'top_categories', (SELECT json_agg(json_build_object('category', category, 'count', count)) FROM (SELECT category, COUNT(*) as count FROM conversation_analytics WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY category ORDER BY count DESC LIMIT 5) t)
  ) as metrics;
```

---

## Next Steps

1. **Deploy Database Schemas:**
   ```bash
   supabase db push
   ```

2. **Deploy Sync Functions:**
   ```bash
   supabase functions deploy chatwoot-batch-sync
   ```

3. **Configure Cron Jobs:**
   - Enable pg_cron extension
   - Schedule nightly batch sync
   - Schedule weekly cleanup

4. **Create Analytics Dashboards:**
   - Metabase/Grafana setup
   - Connect to Supabase
   - Import dashboard templates

5. **Test & Validate:**
   - Run manual sync
   - Verify data accuracy
   - Monitor for 1 week
   - Optimize based on results

---

**Document Status:** Production Ready  
**Last Updated:** 2025-10-11  
**Maintained By:** Chatwoot Agent + Data Agent  
**Review Cadence:** Monthly or after schema changes

