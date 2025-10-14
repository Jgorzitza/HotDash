# Audit Trail Service

Immutable audit logging system with hash chaining for tamper detection and compliance reporting.

## Features

✅ **Immutable logging** - Append-only, no updates/deletes allowed  
✅ **Hash chaining** - Each event linked to previous via hash (blockchain-style)  
✅ **Integrity verification** - Detect tampering via hash verification  
✅ **Compliance reporting** - Generate audit reports for GDPR/CCPA/SOC2  
✅ **Query API** - Search audit trail by user, event type, resource, date  

---

## Usage

### Log Audit Events

```typescript
import { logAuditEvent, AuditEventType } from './services/audit-trail';

// Log action approval
await logAuditEvent({
  eventType: AuditEventType.ACTION_APPROVED,
  userId: user.id,
  userEmail: user.email,
  userRole: user.role,
  resource: 'order',
  resourceId: 'order_12345',
  action: 'approve_refund',
  metadata: {
    amount: 50.00,
    reason: 'Customer request',
    approvalId: 'approval_789',
  },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

// Log data access
await logAuditEvent({
  eventType: AuditEventType.DATA_ACCESSED,
  userId: user.id,
  userEmail: user.email,
  userRole: user.role,
  resource: 'customer',
  resourceId: 'cust_abc123',
  action: 'view_profile',
  metadata: { fields: ['email', 'phone', 'orders'] },
});

// Log config change
await logAuditEvent({
  eventType: AuditEventType.CONFIG_CHANGED,
  userId: user.id,
  userEmail: user.email,
  userRole: user.role,
  resource: 'settings',
  action: 'update_webhook_url',
  metadata: {
    oldValue: 'https://old.example.com',
    newValue: 'https://new.example.com',
  },
});
```

### Query Audit Trail

```typescript
import { queryAuditTrail } from './services/audit-trail';

// Get all events for a user
const userEvents = await queryAuditTrail({
  userId: 'user_123',
  limit: 50,
});

// Get all approvals in date range
const approvals = await queryAuditTrail({
  eventType: AuditEventType.ACTION_APPROVED,
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-31'),
});

// Get all data exports
const exports = await queryAuditTrail({
  eventType: AuditEventType.DATA_EXPORTED,
  limit: 100,
});
```

### Verify Integrity

```typescript
import { verifyAuditIntegrity } from './services/audit-trail';

const result = await verifyAuditIntegrity();

if (result.valid) {
  console.log('✅ Audit trail integrity verified');
} else {
  console.error('❌ Audit trail tampered!');
  console.error('Errors:', result.errors);
}
```

### Generate Compliance Report

```typescript
import { generateComplianceReport } from './services/audit-trail';

const report = await generateComplianceReport(
  new Date('2025-10-01'),
  new Date('2025-10-31')
);

console.log('Total events:', report.summary);
console.log('Top users:', report.topUsers);
console.log('Integrity:', report.integrity);
```

---

## Event Types

- `action:approved` - Action approval granted
- `action:rejected` - Action approval denied
- `action:executed` - Action successfully executed
- `data:accessed` - Customer/order data viewed
- `data:exported` - Data export (GDPR/CCPA request)
- `config:changed` - Configuration modified
- `user:login` - User authentication
- `user:logout` - User session ended
- `permission:changed` - User permissions modified

---

## API Routes

All audit routes require `VIEW_AUDIT` permission (admin/operator roles).

### `GET /audit/events`

Query audit trail with filters.

**Query Parameters:**
- `userId` - Filter by user ID
- `eventType` - Filter by event type
- `resource` - Filter by resource type
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `limit` - Max results (default: 100)

**Example:**
```bash
curl https://api.example.com/audit/events?eventType=action:approved&limit=10
```

**Response:**
```json
{
  "events": [
    {
      "id": "123",
      "eventType": "action:approved",
      "userId": "user_789",
      "userEmail": "operator@example.com",
      "action": "approve_refund",
      "timestamp": "2025-10-14T12:00:00Z"
    }
  ],
  "count": 1
}
```

### `GET /audit/verify`

Verify audit trail integrity (detect tampering).

**Response:**
```json
{
  "valid": true,
  "errorCount": 0,
  "errors": []
}
```

### `GET /audit/report`

Generate compliance report for date range.

**Query Parameters:**
- `startDate` - Required (ISO 8601)
- `endDate` - Required (ISO 8601)

**Example:**
```bash
curl "https://api.example.com/audit/report?startDate=2025-10-01&endDate=2025-10-31"
```

**Response:**
```json
{
  "period": {
    "start": "2025-10-01T00:00:00Z",
    "end": "2025-10-31T23:59:59Z"
  },
  "summary": [
    { "event_type": "action:approved", "count": 150, "unique_users": 5 }
  ],
  "topUsers": [
    { "user_email": "admin@example.com", "event_count": 75 }
  ],
  "integrity": {
    "valid": true,
    "errorCount": 0
  }
}
```

### `GET /audit/stats`

Get overall audit statistics.

**Response:**
```json
{
  "totalEvents": 1523,
  "uniqueUsers": 12,
  "eventTypes": 8,
  "firstEvent": "2025-10-01T00:00:00Z",
  "lastEvent": "2025-10-14T12:00:00Z"
}
```

---

## Database Schema

```sql
CREATE TABLE audit_trail (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  previous_hash VARCHAR(64),
  event_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Triggers enforce immutability:**
- UPDATE → Exception raised
- DELETE → Exception raised

---

## Security

### Hash Chaining

Each event contains:
- `event_hash`: SHA256 of current event
- `previous_hash`: Hash of previous event

This creates an immutable chain - any tampering breaks the chain.

**Verification process:**
1. Read all events in order
2. For each event, verify `previous_hash` matches actual previous `event_hash`
3. Recompute `event_hash` and verify it matches stored hash
4. Any mismatch = tampering detected

### Append-Only Enforcement

Database triggers prevent:
- `UPDATE audit_trail` → Exception
- `DELETE FROM audit_trail` → Exception

Only `INSERT` allowed.

---

## Compliance

### GDPR/CCPA

Audit trail provides:
- Record of all data access (Article 30 - Records of Processing)
- Data export history (Right to Data Portability)
- User activity tracking

### SOC 2

Audit trail satisfies:
- CC6.2 - Logical access security
- CC7.2 - System monitoring
- CC7.3 - Change management

### ISO 27001

- A.9.4.1 - Information access restriction
- A.12.4.1 - Event logging
- A.12.4.3 - Administrator and operator logs

---

## Integration Example

```typescript
// In server.ts
import { logAuditEvent, AuditEventType } from './services/audit-trail';
import adminRouter from './routes/admin';
import auditRouter from './routes/audit';

// Mount admin and audit routes
app.use('/admin', adminRouter);
app.use('/audit', auditRouter);

// Log approval events
app.post('/approvals/:id/:idx/:action', 
  requireRole(Role.OPERATOR),
  async (req, res) => {
    const user = (req as any).user;
    const { id, action } = req.params;
    
    // Process approval
    const result = await processApproval(id, action);
    
    // Log to audit trail
    await logAuditEvent({
      eventType: action === 'approve' 
        ? AuditEventType.ACTION_APPROVED 
        : AuditEventType.ACTION_REJECTED,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      resource: 'approval',
      resourceId: id,
      action: `${action}_action`,
      metadata: { approvalId: id, result },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.json(result);
  }
);
```

---

## Testing

```bash
# Run audit trail tests
npm test -- audit-trail.test.ts

# Verify integrity
curl https://api.example.com/audit/verify

# Generate monthly report
curl "https://api.example.com/audit/report?startDate=2025-10-01&endDate=2025-10-31"
```

---

**Maintained by**: Compliance Agent  
**Security Contact**: @compliance  
**Last Updated**: 2025-10-14

