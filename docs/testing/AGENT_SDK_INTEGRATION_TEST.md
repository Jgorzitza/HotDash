# Agent SDK Integration Test Plan

**Status**: Ready for Testing
**Last Updated**: October 12, 2025
**Owner**: Engineer Helper Agent
**Priority**: CRITICAL (Pre-Launch)

---

## Executive Summary

This document provides a comprehensive test plan for validating the Agent SDK integration with OpenAI GPT-4, the approval queue workflow, and Chatwoot integration. All tests must pass before launch (Oct 13-15, 2025).

---

## Test Environment

### Production Services
- **Agent SDK**: `https://hotdash-agent-service.fly.dev` ✅ HEALTHY
- **LlamaIndex MCP**: `https://hotdash-llamaindex-mcp.fly.dev` ✅ HEALTHY
- **Chatwoot**: `https://hotdash-chatwoot.fly.dev` ✅ DEPLOYED
- **Supabase**: Database migrations applied ✅

### Database Schema
- **Table**: `agent_approvals` ✅ EXISTS
- **Columns**: id, conversation_id, serialized, last_interruptions, created_at, approved_by, status, updated_at
- **RLS**: Enabled with service role and authenticated policies ✅

### UI Routes
- **Generic Approvals**: `/approvals` ✅ IMPLEMENTED
- **Chatwoot Approvals**: `/chatwoot-approvals` ✅ IMPLEMENTED

---

## Test Categories

### 1. Health Check Tests ✅ PASSING

#### Test 1.1: Agent SDK Health
**Objective**: Verify Agent SDK service is running and healthy

**Steps**:
```bash
curl https://hotdash-agent-service.fly.dev/health
```

**Expected Result**:
```json
{
  "status": "ok",
  "service": "agent-service",
  "version": "1.0.0",
  "timestamp": "2025-10-12T08:44:09.740Z"
}
```

**Status**: ✅ **PASS** (Response time: ~300ms)

---

#### Test 1.2: LlamaIndex MCP Health
**Objective**: Verify LlamaIndex service is running with all tools available

**Steps**:
```bash
curl https://hotdash-llamaindex-mcp.fly.dev/health
```

**Expected Result**:
```json
{
  "status": "ok",
  "service": "llamaindex-rag-mcp",
  "version": "1.0.0",
  "uptime": "217s",
  "tools": ["query_support", "refresh_index", "insight_report"],
  "metrics": {...}
}
```

**Status**: ✅ **PASS** (Response time: ~284ms)

---

### 2. Approval Queue Database Tests

#### Test 2.1: Database Schema Validation
**Objective**: Verify agent_approvals table exists with correct schema

**Steps**:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'agent_approvals'
ORDER BY ordinal_position;
```

**Expected Result**:
- ✅ id (bigserial, PK)
- ✅ conversation_id (text, NOT NULL)
- ✅ serialized (jsonb, NOT NULL)
- ✅ last_interruptions (jsonb)
- ✅ created_at (timestamptz, NOW())
- ✅ approved_by (text)
- ✅ status (text, 'pending')
- ✅ updated_at (timestamptz, NOW())

**Status**: ⏳ PENDING (Requires database access)

---

#### Test 2.2: RLS Policy Validation
**Objective**: Verify Row Level Security policies are correctly configured

**Steps**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'agent_approvals';
```

**Expected Policies**:
- ✅ agent_approvals_service_role_all
- ✅ agent_approvals_read_own
- ✅ agent_approvals_insert_service_only
- ✅ agent_approvals_update_service_only
- ✅ agent_approvals_no_delete

**Status**: ⏳ PENDING (Requires database access)

---

#### Test 2.3: Insert Approval Record
**Objective**: Verify we can insert an approval record via service role

**Steps**:
```typescript
const { data, error } = await supabase
  .from('agent_approvals')
  .insert({
    conversation_id: 'test-conversation-123',
    serialized: {
      agent: 'shopify_support',
      tool: 'create_order',
      args: { customer_id: '12345', items: [] }
    },
    status: 'pending'
  })
  .select();
```

**Expected Result**:
- Record created successfully
- ID auto-generated
- created_at and updated_at set automatically
- Status is 'pending'

**Status**: ⏳ PENDING (Requires testing environment)

---

#### Test 2.4: Query Pending Approvals
**Objective**: Verify we can query pending approvals efficiently

**Steps**:
```typescript
const { data, error } = await supabase
  .from('agent_approvals')
  .select('*')
  .eq('status', 'pending')
  .order('created_at', { ascending: true });
```

**Expected Result**:
- Returns all pending approvals
- Ordered by creation time (oldest first)
- Query uses index `agent_approvals_status_created_idx`
- Response time < 100ms

**Status**: ⏳ PENDING (Requires testing environment)

---

### 3. Agent SDK API Tests

#### Test 3.1: Get Approvals Endpoint
**Objective**: Verify Agent SDK returns pending approvals

**Steps**:
```bash
curl https://hotdash-agent-service.fly.dev/approvals
```

**Expected Result**:
```json
[
  {
    "id": "approval-123",
    "conversationId": "conv-456",
    "createdAt": "2025-10-12T08:00:00Z",
    "pending": [
      {
        "agent": "shopify_support",
        "tool": "create_order",
        "args": { "customer_id": "12345" }
      }
    ]
  }
]
```

**Status**: ⏳ PENDING (Requires test data)

---

#### Test 3.2: Approve Action
**Objective**: Verify we can approve a pending action

**Steps**:
```bash
curl -X POST https://hotdash-agent-service.fly.dev/approvals/123/approve \
  -H "Content-Type: application/json" \
  -d '{"operator_id": "user-123"}'
```

**Expected Result**:
- Status 200 OK
- Approval record updated to 'approved'
- Action executed by agent
- Learning data logged

**Status**: ⏳ PENDING (Requires test data)

---

#### Test 3.3: Reject Action
**Objective**: Verify we can reject a pending action

**Steps**:
```bash
curl -X POST https://hotdash-agent-service.fly.dev/approvals/123/reject \
  -H "Content-Type: application/json" \
  -d '{"operator_id": "user-123", "reason": "Invalid customer ID"}'
```

**Expected Result**:
- Status 200 OK
- Approval record updated to 'rejected'
- Action NOT executed
- Learning data logged with rejection reason

**Status**: ⏳ PENDING (Requires test data)

---

### 4. OpenAI GPT-4 Integration Tests

#### Test 4.1: OpenAI API Connectivity
**Objective**: Verify Agent SDK can communicate with OpenAI API

**Steps**:
```bash
# Trigger a draft generation that requires OpenAI
curl -X POST https://hotdash-agent-service.fly.dev/draft \
  -H "Content-Type: application/json" \
  -d '{
    "customer_message": "What is your return policy?",
    "customer_context": {"name": "Test Customer"}
  }'
```

**Expected Result**:
- Status 200 OK
- Draft response generated
- Confidence score included (0-100)
- Response time < 3 seconds

**Status**: ⏳ PENDING (Requires OpenAI API key configuration)

---

#### Test 4.2: GPT-4 Model Selection
**Objective**: Verify correct GPT-4 model is being used

**Environment Variable**:
```bash
OPENAI_MODEL=gpt-4-turbo-preview  # or gpt-4o
```

**Validation**:
- Check Agent SDK logs for model name
- Verify token usage aligns with GPT-4 pricing
- Confirm response quality (vs GPT-3.5)

**Status**: ⏳ PENDING (Requires log access)

---

#### Test 4.3: Confidence Scoring
**Objective**: Verify confidence scores are accurate and meaningful

**Test Cases**:
1. **High Confidence (>90%)**: Clear question with exact knowledge match
   - Input: "What is your return policy?"
   - Expected: Detailed policy with high confidence

2. **Medium Confidence (70-89%)**: Ambiguous question
   - Input: "Can I get a refund?"
   - Expected: Qualified response with medium confidence

3. **Low Confidence (<70%)**: Complex or out-of-scope question
   - Input: "Why is my order delayed?"
   - Expected: Generic response or escalation recommendation with low confidence

**Status**: ⏳ PENDING (Requires testing environment)

---

### 5. LlamaIndex Knowledge Retrieval Tests

#### Test 5.1: Knowledge Query
**Objective**: Verify LlamaIndex returns relevant knowledge articles

**Steps**:
```bash
curl -X POST https://hotdash-llamaindex-mcp.fly.dev/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the return policy?",
    "top_k": 5,
    "min_relevance": 0.7
  }'
```

**Expected Result**:
```json
{
  "results": [
    {
      "title": "Return Policy",
      "content": "...",
      "relevance_score": 0.95,
      "source": "docs/policies/returns.md"
    }
  ],
  "query_time_ms": 450
}
```

**Status**: ⏳ PENDING (Requires knowledge base population)

---

#### Test 5.2: Knowledge Refresh
**Objective**: Verify we can refresh the knowledge index

**Steps**:
```bash
curl -X POST https://hotdash-llamaindex-mcp.fly.dev/refresh
```

**Expected Result**:
- Status 200 OK
- Index rebuilt successfully
- New documents indexed
- Response time < 10 seconds

**Status**: ⏳ PENDING (Requires testing environment)

---

### 6. UI Approval Queue Tests

#### Test 6.1: Generic Approvals Page Load
**Objective**: Verify /approvals route loads and displays pending items

**Steps**:
1. Navigate to `http://localhost:5173/approvals`
2. Check for pending approvals
3. Verify auto-refresh (every 5 seconds)

**Expected Result**:
- Page loads without errors
- Displays approval count
- Shows approval cards with:
  - Conversation ID
  - Agent name
  - Tool name
  - Arguments
  - Approve/Reject buttons

**Status**: ⏳ PENDING (Requires local dev environment)

---

#### Test 6.2: Chatwoot Approvals Page Load
**Objective**: Verify /chatwoot-approvals route loads with Chatwoot-specific data

**Steps**:
1. Navigate to `http://localhost:5173/chatwoot-approvals`
2. Check for pending customer responses
3. Verify statistics banner (urgent, high, normal, low priority)

**Expected Result**:
- Page loads without errors
- Displays customer context:
  - Customer name and email
  - Customer message
  - Draft response
  - Confidence score
  - Knowledge sources
  - Sentiment analysis
- Shows priority badges
- Auto-refresh every 10 seconds

**Status**: ⏳ PENDING (Requires local dev environment)

---

#### Test 6.3: Approval Action Flow
**Objective**: Verify approve action from UI works end-to-end

**Steps**:
1. Load approval queue
2. Click "Approve" on first item
3. Verify loading state
4. Verify success notification
5. Verify item removed from queue

**Expected Result**:
- Loading spinner shown
- Success toast notification
- Item disappears from queue
- Database updated to 'approved'
- Agent executes approved action

**Status**: ⏳ PENDING (Requires test data)

---

#### Test 6.4: Reject Action Flow
**Objective**: Verify reject action from UI works end-to-end

**Steps**:
1. Load approval queue
2. Click "Reject" on first item
3. Enter rejection reason
4. Verify loading state
5. Verify success notification

**Expected Result**:
- Rejection modal appears
- Reason field required
- Success toast notification
- Item disappears from queue
- Database updated to 'rejected'
- Agent does NOT execute action

**Status**: ⏳ PENDING (Requires test data)

---

### 7. Chatwoot Integration Tests

#### Test 7.1: Webhook Delivery
**Objective**: Verify Chatwoot sends webhooks to Agent SDK

**Prerequisite**:
- Chatwoot webhook configured
- Points to Agent SDK endpoint
- HMAC secret configured

**Steps**:
1. Send test message in Chatwoot
2. Check Agent SDK logs for webhook receipt
3. Verify signature validation passes

**Expected Result**:
- Webhook received within 1 second
- Signature validated successfully
- Message parsed correctly
- Processing begins

**Status**: ⏳ PENDING (Requires Chatwoot access)

---

#### Test 7.2: Draft Generation Flow
**Objective**: Verify end-to-end draft generation from Chatwoot message

**Steps**:
1. Customer sends message via Chatwoot
2. Webhook triggers Agent SDK
3. LlamaIndex queries knowledge base
4. OpenAI generates draft response
5. Draft added as private note in Chatwoot
6. Approval record created in database

**Expected Result**:
- End-to-end time < 5 seconds
- Private note visible to agents only
- Approval appears in queue
- All metadata captured correctly

**Status**: ⏳ PENDING (Requires test environment)

---

#### Test 7.3: Approve and Send
**Objective**: Verify approved draft is sent as public reply in Chatwoot

**Steps**:
1. Operator approves draft in queue
2. Agent SDK sends reply via Chatwoot API
3. Customer receives response
4. Conversation tagged appropriately

**Expected Result**:
- Public reply sent to customer
- Tags added: 'agent_sdk_approved'
- Conversation status updated
- Customer notification sent

**Status**: ⏳ PENDING (Requires test environment)

---

### 8. Error Handling Tests

#### Test 8.1: Agent SDK Service Down
**Objective**: Verify graceful degradation when Agent SDK is unavailable

**Steps**:
1. Stop Agent SDK service temporarily
2. Load approval queue UI
3. Verify error message displayed

**Expected Result**:
- "Agent service unavailable" message
- No JavaScript errors in console
- Retry mechanism available
- User can still access other features

**Status**: ⏳ PENDING (Requires controlled failure)

---

#### Test 8.2: Database Connection Error
**Objective**: Verify handling of database connection failures

**Steps**:
1. Simulate database timeout
2. Attempt to load approvals
3. Verify error handling

**Expected Result**:
- "Database connection error" message
- Transaction rolled back properly
- No data corruption
- Automatic retry after 5 seconds

**Status**: ⏳ PENDING (Requires controlled failure)

---

#### Test 8.3: OpenAI API Rate Limit
**Objective**: Verify handling of OpenAI rate limiting

**Steps**:
1. Trigger multiple draft generations rapidly
2. Hit OpenAI rate limit
3. Verify exponential backoff

**Expected Result**:
- Requests queued for retry
- Exponential backoff applied
- User notified of delay
- Eventually succeeds

**Status**: ⏳ PENDING (Requires load testing)

---

### 9. Performance Tests

#### Test 9.1: Approval Queue Load Time
**Objective**: Measure time to load approval queue with various data volumes

**Test Cases**:
- 10 pending approvals: < 200ms
- 100 pending approvals: < 500ms
- 1000 pending approvals: < 1000ms

**Status**: ⏳ PENDING (Requires performance testing)

---

#### Test 9.2: Concurrent Operator Load
**Objective**: Verify system handles multiple operators simultaneously

**Test Scenario**:
- 10 operators viewing approval queue
- 5 operators approving items concurrently
- No race conditions or conflicts

**Expected Result**:
- All actions processed correctly
- No duplicate approvals
- No database deadlocks
- Real-time updates for all operators

**Status**: ⏳ PENDING (Requires load testing)

---

### 10. Security Tests

#### Test 10.1: RLS Policy Enforcement
**Objective**: Verify users can only access authorized approvals

**Steps**:
1. Create approval for conversation A
2. Attempt to access as user B (unauthorized)
3. Verify access denied

**Expected Result**:
- 403 Forbidden or empty result set
- No data leakage
- Audit log entry created

**Status**: ⏳ PENDING (Requires security testing)

---

#### Test 10.2: Webhook Signature Validation
**Objective**: Verify only authentic Chatwoot webhooks are processed

**Steps**:
1. Send webhook with invalid signature
2. Verify rejection
3. Check logs for security event

**Expected Result**:
- 401 Unauthorized response
- Webhook not processed
- Security event logged
- No side effects

**Status**: ⏳ PENDING (Requires security testing)

---

## Test Execution Summary

### Status Legend
- ✅ **PASS**: Test passed successfully
- ⏳ **PENDING**: Test not yet executed
- ❌ **FAIL**: Test failed, requires attention
- ⚠️ **BLOCKED**: Test blocked by dependency

### Current Status (October 12, 2025)

| Category | Tests | Pass | Pending | Fail | Blocked |
|----------|-------|------|---------|------|---------|
| Health Check | 2 | 2 | 0 | 0 | 0 |
| Database | 4 | 0 | 4 | 0 | 0 |
| Agent SDK API | 3 | 0 | 3 | 0 | 0 |
| OpenAI GPT-4 | 3 | 0 | 3 | 0 | 0 |
| LlamaIndex | 2 | 0 | 2 | 0 | 0 |
| UI Approval Queue | 4 | 0 | 4 | 0 | 0 |
| Chatwoot Integration | 3 | 0 | 3 | 0 | 0 |
| Error Handling | 3 | 0 | 3 | 0 | 0 |
| Performance | 2 | 0 | 2 | 0 | 0 |
| Security | 2 | 0 | 2 | 0 | 0 |
| **TOTAL** | **28** | **2** | **26** | **0** | **0** |

### Overall Status
**🟡 YELLOW - In Progress**
- Core services healthy ✅
- Database schema deployed ✅
- UI routes implemented ✅
- Integration tests pending ⏳

---

## Pre-Launch Requirements

### Must Complete Before Launch (Oct 13-15)
- [ ] Execute all Database tests (Test 2.1-2.4)
- [ ] Execute all Agent SDK API tests (Test 3.1-3.3)
- [ ] Validate OpenAI GPT-4 integration (Test 4.1-4.2)
- [ ] Test UI approval flow end-to-end (Test 6.3-6.4)
- [ ] Validate Chatwoot webhook delivery (Test 7.1-7.2)

### Nice to Have
- [ ] Complete performance tests
- [ ] Complete security tests
- [ ] Load testing with 10+ concurrent operators

---

## Testing Instructions

### Local Testing Setup
```bash
# 1. Start local development environment
cd ~/HotDash/hot-dash
npm run dev

# 2. Start Supabase local
supabase start

# 3. Set environment variables
export AGENT_SERVICE_URL=https://hotdash-agent-service.fly.dev
export SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_ANON_KEY=<your-key>

# 4. Navigate to approval queues
open http://localhost:5173/approvals
open http://localhost:5173/chatwoot-approvals
```

### Production Testing
```bash
# 1. Run health checks
bash scripts/ops/health-check-agent-services.sh

# 2. Test Agent SDK endpoint
curl https://hotdash-agent-service.fly.dev/approvals

# 3. Monitor logs
fly logs -a hotdash-agent-service
fly logs -a hotdash-llamaindex-mcp
```

---

## Issue Tracking

### Known Issues
1. **None currently identified**

### Potential Risks
1. **OpenAI API Rate Limits**: May hit limits during high-traffic periods
   - Mitigation: Implement request queuing and exponential backoff
2. **Database Connection Pool**: May exhaust connections under load
   - Mitigation: Monitor connection usage, increase pool size if needed
3. **Webhook Delivery Failures**: Chatwoot webhooks may fail intermittently
   - Mitigation: Implement retry mechanism with exponential backoff

---

## Next Steps

### Immediate Actions (Engineer Helper Agent)
1. Set up local testing environment
2. Execute database validation tests (Test 2.1-2.4)
3. Create test data for approval queue
4. Execute end-to-end UI tests (Test 6.1-6.4)
5. Document all test results

### Coordination Required
1. **AI Agent**: Validate OpenAI integration and confidence scoring
2. **Chatwoot Agent**: Test webhook delivery and draft generation
3. **Data Agent**: Verify database migrations and performance
4. **QA/Testing**: Execute comprehensive test suite

---

## Contact

**Owner**: Engineer Helper Agent
**Escalation**: See `docs/directions/engineer-helper.md`
**Feedback**: `feedback/engineer-helper.md`

---

**Document Version**: 1.0
**Last Updated**: October 12, 2025 08:45 UTC
**Status**: Ready for Test Execution

