# Action Queue API Routes

**Task:** ENGINEER-GE-001  
**Status:** Complete  
**Date:** 2025-01-24  
**Priority:** P1

## Overview

Complete CRUD API routes for Action Queue system with HITL approval workflow, filtering, sorting, and pagination.

## API Endpoints

### 1. List Actions

**GET /api/action-queue**

List actions with filtering, sorting, and pagination.

**Query Parameters:**
- `limit` (number, default: 10, max: 100) - Number of results per page
- `offset` (number, default: 0) - Pagination offset
- `status` (string, default: 'pending') - Filter by status (pending|approved|rejected|executed)
- `agent` (string) - Filter by agent name
- `type` (string) - Filter by action type
- `risk_tier` (string) - Filter by risk tier (policy|safety|perf|none)
- `priority` (string) - Filter by priority (high|medium|low)
- `category` (string) - Filter by category (inventory|growth|content|seo)
- `sort_by` (string, default: 'score') - Sort field (score|confidence|expected_impact|created_at)
- `sort_order` (string, default: 'desc') - Sort order (asc|desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "reorder",
      "target": "SKU-123",
      "draft": "Reorder 50 units...",
      "evidence": {...},
      "expected_impact": {...},
      "confidence": 0.85,
      "ease": 0.9,
      "risk_tier": "policy",
      "can_execute": true,
      "rollback_plan": "Cancel PO...",
      "freshness_label": "fresh",
      "agent": "inventory",
      "score": 0.87,
      "status": "pending",
      "created_at": "2025-01-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "filters": {...},
  "sorting": {...}
}
```

### 2. Create Action

**POST /api/action-queue**

Create a new action in the queue.

**Body:**
```json
{
  "type": "reorder",
  "target": "SKU-123",
  "draft": "Reorder 50 units of SKU-123",
  "evidence": {
    "current_stock": 5,
    "avg_daily_sales": 3.2,
    "lead_time_days": 14
  },
  "expected_impact": {
    "prevent_stockout": true,
    "days_of_coverage": 30
  },
  "confidence": 0.85,
  "ease": 0.9,
  "risk_tier": "policy",
  "can_execute": true,
  "rollback_plan": "Cancel PO within 24 hours",
  "freshness_label": "fresh",
  "agent": "inventory"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Action created successfully"
}
```

### 3. Get Action Details

**GET /api/action-queue/:id**

Get detailed information about a specific action.

**Response:**
```json
{
  "success": true,
  "data": {...}
}
```

### 4. Update Action

**PATCH /api/action-queue/:id**

Update an action's fields.

**Body:**
```json
{
  "draft": "Updated draft text",
  "confidence": 0.9,
  "evidence": {...}
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Action updated successfully"
}
```

### 5. Delete Action

**DELETE /api/action-queue/:id**

Delete an action from the queue.

**Response:**
```json
{
  "success": true,
  "message": "Action deleted successfully"
}
```

### 6. Approve Action

**POST /api/action-queue/:id/approve**

Approve an action for execution (HITL workflow).

**Body:**
```json
{
  "operator_id": "user-123",
  "operator_name": "John Doe",
  "notes": "Approved after reviewing evidence"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Action approved successfully"
}
```

**Decision Log:**
- Logs approval to `DecisionLog` table
- Includes operator, action details, evidence

### 7. Reject Action

**POST /api/action-queue/:id/reject**

Reject an action (HITL workflow).

**Body:**
```json
{
  "operator_id": "user-123",
  "operator_name": "John Doe",
  "reason": "Insufficient evidence",
  "notes": "Need more data on sales velocity"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Action rejected successfully"
}
```

**Decision Log:**
- Logs rejection to `DecisionLog` table
- Includes operator, reason, notes

### 8. Edit Action

**POST /api/action-queue/:id/edit**

Edit an action before approval (HITL workflow).

**Body:**
```json
{
  "operator_id": "user-123",
  "operator_name": "John Doe",
  "updates": {
    "draft": "Reorder 75 units instead of 50",
    "confidence": 0.9
  },
  "notes": "Increased quantity based on recent sales spike"
}
```

**Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Action edited successfully"
}
```

**Validation:**
- Only pending actions can be edited
- Returns 400 if action status is not 'pending'

**Decision Log:**
- Logs edit to `DecisionLog` table
- Includes operator, updated fields, notes

## Service Methods

### ActionQueueService

**Enhanced Methods:**

```typescript
// Get actions with filtering, sorting, pagination
static async getActions(options: {
  limit?: number;
  offset?: number;
  status?: string;
  agent?: string;
  type?: string;
  risk_tier?: string;
  priority?: string;
  category?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<ActionQueueItem[]>

// Get count of actions matching filters
static async getActionCount(options: {
  status?: string;
  agent?: string;
  type?: string;
  risk_tier?: string;
  priority?: string;
  category?: string;
}): Promise<number>

// Delete an action
static async deleteAction(id: string): Promise<void>
```

## HITL Workflow

### Approval Flow

```
1. Agent creates action → status: pending
2. Human reviews in UI
3. Human can:
   a. Approve → status: approved, logs decision
   b. Reject → status: rejected, logs decision
   c. Edit → updates action, logs decision
4. Approved actions can be executed
```

### Decision Logging

All HITL actions are logged to `DecisionLog` table:

**Approve:**
```typescript
{
  scope: 'action-queue',
  actor: operator_name,
  action: 'action_approved',
  rationale: 'Approved action: reorder for SKU-123',
  evidenceUrl: '/api/action-queue/:id',
  payload: {
    actionId, actionType, target, agent,
    expectedImpact, confidence, riskTier
  }
}
```

**Reject:**
```typescript
{
  scope: 'action-queue',
  actor: operator_name,
  action: 'action_rejected',
  rationale: 'Rejected action: reorder for SKU-123. Reason: Insufficient evidence',
  evidenceUrl: '/api/action-queue/:id',
  payload: {
    actionId, actionType, target, agent, reason, notes
  }
}
```

**Edit:**
```typescript
{
  scope: 'action-queue',
  actor: operator_name,
  action: 'action_edited',
  rationale: 'Edited action: reorder for SKU-123. Notes: Increased quantity',
  evidenceUrl: '/api/action-queue/:id',
  payload: {
    actionId, actionType, target, agent, updatedFields, notes
  }
}
```

## Usage Examples

### List Pending Actions

```typescript
const response = await fetch('/api/action-queue?status=pending&limit=20&sort_by=score');
const { data, pagination } = await response.json();
```

### Filter by Agent and Risk Tier

```typescript
const response = await fetch('/api/action-queue?agent=inventory&risk_tier=policy&limit=10');
const { data } = await response.json();
```

### Approve Action

```typescript
const response = await fetch('/api/action-queue/uuid-123/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operator_id: 'user-123',
    operator_name: 'John Doe',
    notes: 'Approved after review'
  })
});
```

### Edit Action

```typescript
const response = await fetch('/api/action-queue/uuid-123/edit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operator_id: 'user-123',
    updates: {
      draft: 'Updated draft',
      confidence: 0.95
    },
    notes: 'Increased confidence based on new data'
  })
});
```

## Acceptance Criteria

✅ **1. GET /api/action-queue with filtering, sorting, pagination**
   - File: `app/routes/api.action-queue.ts`
   - Supports all query parameters
   - Returns paginated results

✅ **2. POST /api/action-queue to create actions**
   - File: `app/routes/api.action-queue.ts`
   - Creates new action in queue
   - Returns 201 status

✅ **3. GET /api/action-queue/:id for details**
   - File: `app/routes/api.action-queue.$id.ts`
   - Returns full action details
   - Returns 404 if not found

✅ **4. PATCH /api/action-queue/:id to update**
   - File: `app/routes/api.action-queue.$id.ts`
   - Updates action fields
   - Returns updated action

✅ **5. DELETE /api/action-queue/:id to remove**
   - File: `app/routes/api.action-queue.$id.ts`
   - Deletes action from queue
   - Returns success message

✅ **6. POST /api/action-queue/:id/approve (HITL)**
   - File: `app/routes/api.action-queue.$id.approve.ts`
   - Approves action
   - Logs decision

✅ **7. POST /api/action-queue/:id/reject (HITL)**
   - File: `app/routes/api.action-queue.$id.reject.ts`
   - Rejects action
   - Logs decision with reason

✅ **8. POST /api/action-queue/:id/edit (HITL)**
   - File: `app/routes/api.action-queue.$id.edit.ts`
   - Edits pending action
   - Logs decision with changes

✅ **9. All routes use ActionQueueService**
   - Service enhanced with new methods
   - Uses Prisma for database operations

✅ **10. Decision logging for all HITL actions**
   - Approve, reject, edit all logged
   - Includes operator, rationale, payload

## Files Created

1. `app/routes/api.action-queue.ts` - List and create
2. `app/routes/api.action-queue.$id.ts` - Get, update, delete
3. `app/routes/api.action-queue.$id.approve.ts` - Approve workflow
4. `app/routes/api.action-queue.$id.reject.ts` - Reject workflow
5. `app/routes/api.action-queue.$id.edit.ts` - Edit workflow

## Files Modified

1. `app/services/action-queue/action-queue.service.ts`
   - Enhanced getActions with sorting/pagination
   - Added getActionCount method
   - Added deleteAction method
   - Fixed Prisma usage (removed prisma.query)

## References

- Service: `app/services/action-queue/action-queue.service.ts`
- Database Table: `action_queue`
- Decision Log: `DecisionLog` table
- Task: ENGINEER-GE-001 in TaskAssignment table

