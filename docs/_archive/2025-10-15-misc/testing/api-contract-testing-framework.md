# API Contract Testing Framework (Task D)

**Technology**: OpenAPI + Contract Tests  
**Alternative**: Pact (if consumer-driven contracts needed)  
**Date**: 2025-10-11

---

## Overview

API contract testing ensures APIs don't break consumers by validating:
- Request/response schemas
- Status codes
- Headers
- Data types
- Required fields

---

## Approach: OpenAPI Schema Validation

### 1. Define API Contracts (OpenAPI 3.0)

```yaml
# api-contracts/approval-queue-api.yaml
openapi: 3.0.0
info:
  title: Approval Queue API
  version: 1.0.0

paths:
  /api/approvals/queue:
    get:
      summary: Get pending approval queue items
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/QueueItem'

  /api/approvals/approve:
    post:
      summary: Approve a draft
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [queueItemId]
              properties:
                queueItemId:
                  type: string
                  format: uuid
      responses:
        '200':
          description: Approved successfully
        '403':
          description: Not authorized
        '404':
          description: Queue item not found

components:
  schemas:
    QueueItem:
      type: object
      required: [id, conversation_id, draft_response, confidence_score, status]
      properties:
        id:
          type: string
          format: uuid
        conversation_id:
          type: integer
        customer_name:
          type: string
        customer_email:
          type: string
          format: email
        draft_response:
          type: string
        confidence_score:
          type: integer
          minimum: 0
          maximum: 100
        status:
          type: string
          enum: [pending, approved, rejected, escalated]
```

### 2. Contract Tests

```typescript
// tests/integration/api-contracts.spec.ts
import { describe, it, expect } from 'vitest';
import { validateAgainstSchema } from 'openapi-validator';
import schema from '../../api-contracts/approval-queue-api.yaml';

describe('API Contract Tests', () => {
  it('GET /api/approvals/queue matches schema', async () => {
    const response = await fetch('http://localhost:3000/api/approvals/queue');
    const data = await response.json();
    
    const validation = validateAgainstSchema(schema, '/api/approvals/queue', 'get', {
      response: data,
      statusCode: response.status
    });
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it('POST /api/approvals/approve validates request schema', async () => {
    const invalidRequest = {
      queueItemId: 'not-a-uuid'  // Should be UUID format
    };
    
    const response = await fetch('http://localhost:3000/api/approvals/approve', {
      method: 'POST',
      body: JSON.stringify(invalidRequest),
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.message).toContain('Invalid queueItemId format');
  });

  it('response includes required fields', async () => {
    const response = await fetch('http://localhost:3000/api/approvals/queue');
    const data = await response.json();
    
    // Validate structure
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
    
    if (data.data.length > 0) {
      const item = data.data[0];
      
      // Required fields
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('conversation_id');
      expect(item).toHaveProperty('draft_response');
      expect(item).toHaveProperty('confidence_score');
      expect(item).toHaveProperty('status');
      
      // Type validation
      expect(typeof item.id).toBe('string');
      expect(typeof item.conversation_id).toBe('number');
      expect(typeof item.confidence_score).toBe('number');
      expect(item.confidence_score).toBeGreaterThanOrEqual(0);
      expect(item.confidence_score).toBeLessThanOrEqual(100);
    }
  });
});
```

---

## NPM Scripts

```json
{
  "test:contracts": "vitest run tests/integration/api-contracts.spec.ts",
  "validate:openapi": "openapi-validator api-contracts/*.yaml"
}
```

---

**Status**: Framework designed  
**Effort**: 6 hours implementation  
**Benefits**: Prevents breaking API changes

