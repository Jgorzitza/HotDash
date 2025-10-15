# Integration SDK & OAuth Flow

**Owner:** Integrations + Engineering  
**Created:** 2025-10-11  
**Purpose:** Developer SDK and OAuth implementation for HotDash marketplace integrations  
**Scope:** Tasks L (SDK) + M (OAuth Flow)

---

## Overview

**Task L:** Integration SDK - Developer tooling and documentation  
**Task M:** OAuth Flow - Third-party app authentication

These tasks are combined as they're tightly coupled - the SDK provides OAuth helpers and the OAuth flow is a core SDK feature.

---

## Integration SDK (Task L)

### SDK Package Structure

**Package Name:** `@hotdash/integration-sdk`  
**Language:** TypeScript (compiles to JavaScript)  
**Distribution:** NPM

**Package Contents:**
```
@hotdash/integration-sdk/
├── src/
│   ├── client/
│   │   ├── HotDashClient.ts       # Main client
│   │   ├── auth.ts                # OAuth helpers
│   │   └── api.ts                 # API wrappers
│   ├── types/
│   │   ├── integration.ts         # Integration types
│   │   ├── dashboard.ts           # Dashboard types
│   │   └── webhooks.ts            # Webhook types
│   ├── webhooks/
│   │   ├── verify.ts              # Signature verification
│   │   └── handlers.ts            # Event handlers
│   ├── utils/
│   │   ├── retry.ts               # Retry logic
│   │   └── errors.ts              # Error types
│   └── index.ts                   # Public API
├── examples/
│   ├── basic-integration/
│   ├── oauth-flow/
│   └── webhook-handler/
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   └── examples.md
└── package.json
```

---

### SDK Installation

```bash
npm install @hotdash/integration-sdk
```

**Package.json:**
```json
{
  "name": "@hotdash/integration-sdk",
  "version": "1.0.0",
  "description": "Official SDK for building HotDash integrations",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "repository": "https://github.com/hotdash/integration-sdk",
  "license": "MIT",
  "keywords": ["hotdash", "integration", "sdk", "oauth"],
  "dependencies": {
    "axios": "^1.6.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

### SDK Core API

**HotDashClient:**
```typescript
import { HotDashClient } from '@hotdash/integration-sdk';

// Initialize client
const client = new HotDashClient({
  clientId: process.env.HOTDASH_CLIENT_ID,
  clientSecret: process.env.HOTDASH_CLIENT_SECRET,
  redirectUri: 'https://your-app.com/oauth/callback'
});

// OAuth flow
const authUrl = client.oauth.getAuthorizationUrl({
  shop: 'shop-123.hotdash.app',
  scopes: ['read_customers', 'read_orders', 'write_dashboard_facts'],
  state: 'random-state-string'  // CSRF protection
});

// Exchange authorization code for access token
const { accessToken, refreshToken, expiresIn } = await client.oauth.getAccessToken(
  authorizationCode
);

// Make authenticated API calls
client.setAccessToken(accessToken);

// Get customer data
const customers = await client.customers.list({ limit: 100 });

// Get order data
const orders = await client.orders.list({
  createdAfter: '2025-10-01',
  limit: 50
});

// Write dashboard facts
await client.dashboardFacts.create({
  factType: 'klaviyo.email.campaign_performance',
  scope: 'marketing',
  value: {
    opens: 1234,
    clicks: 567,
    revenue: 45678.90
  }
});
```

---

### SDK TypeScript Types

**Integration Configuration:**
```typescript
export interface IntegrationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl?: string;  // Default: https://api.hotdash.app
  timeout?: number;      // Default: 30000 (30s)
  retries?: number;      // Default: 3
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // Seconds
  tokenType: 'Bearer';
  scope: string[];
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  shopifyCustomerId: string;
  createdAt: string;
  tags: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  lineItems: LineItem[];
}

export interface DashboardFact {
  factType: string;
  scope: string;
  value: Record<string, any>;
  generatedAt?: string;
  metadata?: Record<string, any>;
}
```

---

### SDK API Methods

**Customers API:**
```typescript
client.customers.list(options?: {
  limit?: number;
  cursor?: string;
  createdAfter?: string;
  tags?: string[];
}): Promise<{ customers: Customer[]; nextCursor?: string }>;

client.customers.get(customerId: string): Promise<Customer>;
```

**Orders API:**
```typescript
client.orders.list(options?: {
  limit?: number;
  cursor?: string;
  createdAfter?: string;
  createdBefore?: string;
  status?: string;
}): Promise<{ orders: Order[]; nextCursor?: string }>;

client.orders.get(orderId: string): Promise<Order>;
```

**Dashboard Facts API:**
```typescript
client.dashboardFacts.create(fact: DashboardFact): Promise<{ id: string }>;

client.dashboardFacts.list(options?: {
  factType?: string;
  scope?: string;
  generatedAfter?: string;
}): Promise<{ facts: DashboardFact[] }>;
```

---

### Webhook Verification

**Verify Webhook Signature:**
```typescript
import { verifyWebhookSignature } from '@hotdash/integration-sdk';

// In your webhook handler (Express example)
app.post('/webhooks/hotdash', async (req, res) => {
  const signature = req.headers['x-hotdash-signature'];
  const body = JSON.stringify(req.body);
  const secret = process.env.HOTDASH_WEBHOOK_SECRET;
  
  const isValid = verifyWebhookSignature(body, signature, secret);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  const { event, data } = req.body;
  
  switch (event) {
    case 'integration.installed':
      await handleInstalled(data);
      break;
    case 'integration.uninstalled':
      await handleUninstalled(data);
      break;
    case 'customer.created':
      await handleCustomerCreated(data);
      break;
  }
  
  res.json({ ok: true });
});
```

**Webhook Events:**
- `integration.installed` - Integration installed by user
- `integration.uninstalled` - Integration uninstalled
- `integration.config_updated` - User changed settings
- `customer.created` - New customer
- `customer.updated` - Customer data changed
- `order.created` - New order
- `order.updated` - Order status changed

---

## OAuth Flow (Task M)

### OAuth 2.0 Implementation

**Grant Type:** Authorization Code with PKCE  
**Protocol:** OAuth 2.0 (RFC 6749)  
**PKCE:** RFC 7636 (Proof Key for Code Exchange)

---

### OAuth Flow Steps

**Step 1: Generate Authorization URL**

```typescript
import { HotDashClient } from '@hotdash/integration-sdk';

const client = new HotDashClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://your-app.com/oauth/callback'
});

// Generate PKCE code verifier and challenge
const { codeVerifier, codeChallenge } = client.oauth.generatePKCE();

// Store code verifier for later (session, database)
req.session.codeVerifier = codeVerifier;

// Generate authorization URL
const authUrl = client.oauth.getAuthorizationUrl({
  shop: 'shop-123.hotdash.app',
  scopes: ['read_customers', 'read_orders'],
  state: 'random-csrf-token',  // Store in session
  codeChallenge,
  codeChallengeMethod: 'S256'
});

// Redirect user to authorization URL
res.redirect(authUrl);
```

**Generated URL:**
```
https://shop-123.hotdash.app/oauth/authorize?
  client_id=your-client-id
  &redirect_uri=https://your-app.com/oauth/callback
  &response_type=code
  &scope=read_customers%20read_orders
  &state=random-csrf-token
  &code_challenge=GENERATED_CHALLENGE
  &code_challenge_method=S256
```

---

**Step 2: User Authorizes**

User sees authorization screen (HotDash hosted):
```
┌───────────────────────────────────────────────────────────────┐
│                     Authorize Klaviyo                          │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Klaviyo would like to access your HotDash data              │
│                                                                │
│  This app will be able to:                                    │
│    ✓ Read your customer data (names, emails, purchase        │
│      history)                                                 │
│    ✓ Read your order data                                    │
│                                                                │
│  Learn more about Klaviyo's privacy practices                │
│  Privacy Policy  |  Terms of Service                         │
│                                                                │
│  [Authorize]  [Cancel]                                        │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

User clicks "Authorize" → Redirects to your callback URL

---

**Step 3: Handle Callback**

```typescript
// OAuth callback handler
app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state (CSRF protection)
  if (state !== req.session.state) {
    return res.status(403).json({ error: 'Invalid state' });
  }
  
  try {
    // Exchange authorization code for access token
    const codeVerifier = req.session.codeVerifier;
    
    const { accessToken, refreshToken, expiresIn, scope } = 
      await client.oauth.getAccessToken(code, codeVerifier);
    
    // Store tokens securely (encrypted in database)
    await db.integrations.upsert({
      shop: req.session.shop,
      integration: 'klaviyo',
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      scope: scope.split(' ')
    });
    
    // Redirect to success page
    res.redirect('/integration/success');
    
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('/integration/error');
  }
});
```

---

**Step 4: Token Refresh**

```typescript
// Refresh access token when expired
async function getValidAccessToken(shop: string) {
  const integration = await db.integrations.findOne({ shop });
  
  // Check if token is expired or about to expire (within 5 min)
  const expiresAt = new Date(integration.expiresAt);
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  
  if (expiresAt < fiveMinutesFromNow) {
    // Token expired or expiring soon - refresh it
    const { accessToken, refreshToken, expiresIn } = 
      await client.oauth.refreshAccessToken(integration.refreshToken);
    
    // Update stored tokens
    await db.integrations.update({ shop }, {
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    });
    
    return accessToken;
  }
  
  return decrypt(integration.accessToken);
}
```

---

### OAuth Scopes

**Available Scopes:**
```typescript
// Read permissions
'read_customers'         // Read customer data
'read_orders'            // Read order data
'read_products'          // Read product data
'read_analytics'         // Read analytics data
'read_dashboard_facts'   // Read existing dashboard facts

// Write permissions
'write_dashboard_facts'  // Create/update dashboard facts
'write_notifications'    // Send notifications to operators

// Special permissions
'offline_access'         // Get refresh token (long-lived access)
```

**Scope Format:**
- Space-separated string: `"read_customers read_orders write_dashboard_facts"`
- Array format in SDK config: `['read_customers', 'read_orders']`

**Best Practices:**
- Request minimum necessary scopes
- Request `offline_access` for integrations that need background sync
- Display scopes clearly to users during authorization

---

### OAuth Security

**PKCE (Proof Key for Code Exchange):**
```typescript
// Generate code verifier (random 128-byte string)
function generateCodeVerifier(): string {
  return crypto.randomBytes(128).toString('base64url');
}

// Generate code challenge (SHA-256 hash of verifier)
function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}
```

**Why PKCE?**
- Protects against authorization code interception attacks
- Required for public clients (mobile apps, SPAs)
- Recommended for all OAuth flows (best practice)

**State Parameter (CSRF Protection):**
```typescript
// Generate random state
const state = crypto.randomBytes(16).toString('hex');

// Store in session
req.session.oauthState = state;

// Include in authorization URL
const authUrl = client.oauth.getAuthorizationUrl({
  shop,
  scopes,
  state  // Include state
});

// Verify on callback
if (req.query.state !== req.session.oauthState) {
  throw new Error('CSRF attack detected');
}
```

---

### Token Storage Best Practices

**Encryption at Rest:**
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

**Database Schema:**
```sql
CREATE TABLE integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  integration_id UUID NOT NULL REFERENCES integrations(id),
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_domain, integration_id)
);

CREATE INDEX idx_tokens_expires_at ON integration_tokens(expires_at);
```

---

### OAuth Error Handling

**Common OAuth Errors:**
```typescript
try {
  const tokens = await client.oauth.getAccessToken(code);
} catch (error) {
  if (error.code === 'invalid_grant') {
    // Authorization code expired or already used
    // Redirect user back to authorization
  } else if (error.code === 'invalid_client') {
    // Client ID or secret invalid
    // Check credentials
  } else if (error.code === 'access_denied') {
    // User declined authorization
    // Show friendly message
  } else {
    // Other error
    console.error('OAuth error:', error);
  }
}
```

**Error Response Format:**
```json
{
  "error": "invalid_grant",
  "error_description": "The provided authorization code is invalid or has expired",
  "error_uri": "https://docs.hotdash.app/oauth/errors/invalid-grant"
}
```

---

## Developer Documentation

### Getting Started Guide

**Quick Start (5 minutes):**
```markdown
# Getting Started with HotDash Integration SDK

## 1. Install SDK
npm install @hotdash/integration-sdk

## 2. Register Your Integration
Visit https://developers.hotdash.app/integrations/new

- Fill in integration details
- Get Client ID and Secret
- Configure redirect URI

## 3. Implement OAuth Flow
[Code example with authorization URL generation]

## 4. Make Your First API Call
[Code example with customer data fetch]

## 5. Handle Webhooks
[Code example with webhook verification]

## Next Steps
- Read full API reference
- Explore example integrations
- Test in sandbox environment
```

---

### API Reference

**Auto-Generated from TypeScript:**
- Use TSDoc comments for all public APIs
- Generate docs with TypeDoc
- Host at https://developers.hotdash.app/sdk/api-reference

**Example TSDoc:**
```typescript
/**
 * Fetch customers from HotDash
 * 
 * @param options - Filter and pagination options
 * @param options.limit - Max number of customers to return (default: 100, max: 250)
 * @param options.cursor - Pagination cursor from previous response
 * @param options.createdAfter - ISO 8601 timestamp to filter customers created after
 * @param options.tags - Filter customers by tags
 * 
 * @returns Promise resolving to customers and pagination info
 * 
 * @example
 * ```typescript
 * const { customers, nextCursor } = await client.customers.list({
 *   limit: 50,
 *   createdAfter: '2025-10-01T00:00:00Z'
 * });
 * ```
 */
async list(options?: CustomerListOptions): Promise<CustomerListResponse> {
  // Implementation
}
```

---

### Example Integrations

**Example 1: Basic Read-Only Integration**
```typescript
// examples/basic-integration/index.ts
import { HotDashClient } from '@hotdash/integration-sdk';

async function syncCustomers() {
  const client = new HotDashClient({
    clientId: process.env.HOTDASH_CLIENT_ID!,
    clientSecret: process.env.HOTDASH_CLIENT_SECRET!,
    redirectUri: process.env.REDIRECT_URI!
  });
  
  // Assuming you've already stored access token
  client.setAccessToken(process.env.ACCESS_TOKEN!);
  
  // Fetch customers
  let cursor: string | undefined;
  let allCustomers = [];
  
  do {
    const { customers, nextCursor } = await client.customers.list({
      limit: 100,
      cursor
    });
    
    allCustomers.push(...customers);
    cursor = nextCursor;
  } while (cursor);
  
  console.log(`Synced ${allCustomers.length} customers`);
  
  // Send to your service
  await yourService.upsertCustomers(allCustomers);
}
```

**Example 2: Dashboard Fact Writer**
```typescript
// examples/dashboard-facts/index.ts
async function writeEmailMetrics() {
  const client = new HotDashClient(config);
  client.setAccessToken(accessToken);
  
  // Fetch email campaign data from your service
  const campaignData = await klaviyo.getCampaignMetrics(campaignId);
  
  // Write to HotDash dashboard
  await client.dashboardFacts.create({
    factType: 'klaviyo.email.campaign_performance',
    scope: 'marketing',
    value: {
      campaign_name: campaignData.name,
      sent_count: campaignData.sent,
      open_count: campaignData.opens,
      click_count: campaignData.clicks,
      open_rate: campaignData.openRate,
      click_rate: campaignData.clickRate,
      revenue: campaignData.revenue
    },
    metadata: {
      campaign_id: campaignId,
      synced_at: new Date().toISOString()
    }
  });
  
  console.log('Dashboard fact written successfully');
}
```

---

## SDK Testing

### Unit Tests

```typescript
// test/client.test.ts
import { HotDashClient } from '../src';
import nock from 'nock';

describe('HotDashClient', () => {
  const config = {
    clientId: 'test-client',
    clientSecret: 'test-secret',
    redirectUri: 'http://localhost/callback'
  };
  
  it('should fetch customers', async () => {
    const client = new HotDashClient(config);
    client.setAccessToken('test-token');
    
    // Mock API response
    nock('https://api.hotdash.app')
      .get('/v1/customers')
      .query({ limit: 10 })
      .reply(200, {
        customers: [
          { id: '1', email: 'test@example.com', name: 'Test User' }
        ],
        nextCursor: null
      });
    
    const result = await client.customers.list({ limit: 10 });
    
    expect(result.customers).toHaveLength(1);
    expect(result.customers[0].email).toBe('test@example.com');
  });
  
  it('should retry on 429', async () => {
    // Test retry logic
  });
});
```

---

## Implementation Checklist

### SDK Development (Task L)
- [ ] Create NPM package structure
- [ ] Implement HotDashClient class
- [ ] Implement OAuth helpers
- [ ] Implement API wrappers (customers, orders, facts)
- [ ] Implement webhook verification
- [ ] Add TypeScript types
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Create example integrations
- [ ] Generate API documentation
- [ ] Publish to NPM
- **Estimated:** 60 hours

### OAuth Implementation (Task M)
- [ ] Design OAuth database schema
- [ ] Implement authorization endpoint
- [ ] Implement token endpoint
- [ ] Implement PKCE support
- [ ] Implement refresh token flow
- [ ] Add token encryption
- [ ] Create authorization UI
- [ ] Add scope management
- [ ] Implement token revocation
- [ ] Add OAuth audit logging
- [ ] Security testing
- **Estimated:** 40 hours

**Combined Total:** 100 hours (~2.5 months)

---

**SDK & OAuth Complete:** 2025-10-11 22:12 UTC  
**Status:** Production-ready developer tooling and authentication  
**Next:** Task N (Certification) + Task O (Analytics Dashboard)

