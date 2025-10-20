# PR #107 API Contract Validation Report

**Date**: 2025-10-20
**Analyst**: API Contract Quality Assurance Specialist
**Scope**: Engineer utilities - New services and HTTP utilities

---

## Executive Summary

**Status**: WARN

**Services Validated**: 6 files
- `app/services/approvals.ts` - Approval workflow service (stub)
- `app/utils/http.server.ts` - HTTP response helpers
- `app/lib/analytics/schemas.ts` - Analytics response schemas
- `app/lib/analytics/sampling-guard.ts` - GA4 sampling detection
- `app/lib/seo/diagnostics.ts` - SEO diagnostics (stub)
- `app/lib/seo/pipeline.ts` - SEO data pipeline (stub)

**Overall Assessment**:
- **Type Safety**: 8/10 - Good type coverage, explicit return types
- **Error Handling**: 3/10 - Critical gaps in stub implementations
- **React Router 7 Compliance**: 10/10 - Fully compliant
- **Production Readiness**: 4/10 - Multiple stub implementations

**Breaking Changes**: 0
**Blocking Issues**: 0 (stubs documented)
**Risk Level**: MEDIUM (stub implementations need backend before production)

---

## Type Safety Analysis

### app/services/approvals.ts

**Lines**: 70
**Functions**: 6
**Return Types**: EXPLICIT (100%)
**Parameter Types**: COMPLETE
**Error Types**: NOT DEFINED (stubs return hardcoded success)
**TypeScript Score**: 7/10

**Function Signatures**:

```typescript
// Contract: Get all pending approvals
export async function getPendingApprovals(): Promise<Approval[]>
// Request: None
// Response: Approval[]
// Error Cases: None (stub returns [])
// Stub: YES - returns empty array

// Contract: Get approval by ID
export async function getApprovalById(id: string): Promise<Approval | null>
// Request: { id: string }
// Response: Approval | null
// Error Cases: None (stub returns null)
// Stub: YES - always returns null

// Contract: Approve request with optional grades
export async function approveRequest(
  id: string,
  grades?: { tone: number; accuracy: number; policy: number }
): Promise<{ success: boolean }>
// Request: { id: string, grades?: { tone, accuracy, policy } }
// Response: { success: boolean }
// Error Cases: None (stub returns { success: true })
// Stub: YES - always succeeds

// Contract: Reject request with reason
export async function rejectRequest(
  id: string,
  reason: string
): Promise<{ success: boolean }>
// Request: { id: string, reason: string }
// Response: { success: boolean }
// Error Cases: None (stub returns { success: true })
// Stub: YES - always succeeds

// Contract: Get approvals with filters
export async function getApprovals(filters?: {
  state?: string;
  kind?: string;
  limit?: number;
  offset?: number;
}): Promise<{ approvals: Approval[]; total: number; error: string | null }>
// Request: { state?, kind?, limit?, offset? }
// Response: { approvals: Approval[], total: number, error: string | null }
// Error Cases: Returns error in response object (not thrown)
// Stub: YES - returns empty results

// Contract: Get approval counts by state
export async function getApprovalCounts(): Promise<Record<string, number>>
// Request: None
// Response: Record<string, number> (state -> count mapping)
// Error Cases: None (stub returns {})
// Stub: YES - returns empty object
```

**Strengths**:
- All functions have explicit return types
- Type imports from `~/components/approvals/ApprovalsDrawer` establish shared contract
- Grade structure properly typed with specific fields
- Filter parameters use optional types correctly

**Concerns**:
- NO error handling (no try-catch blocks)
- NO error types defined (ServiceError not used)
- Stub implementations don't throw errors - may mask integration issues
- Missing JSDoc for error scenarios

### app/utils/http.server.ts

**Lines**: 38
**Functions**: 2
**Return Types**: EXPLICIT
**React Router 7 Compliance**: YES
**Type Safety Score**: 10/10

**Function Signatures**:

```typescript
// Contract: Create JSON response (React Router 7 pattern)
export function json<T>(data: T, init?: ResponseInit): Response
// Request: data: T, init?: ResponseInit
// Response: Response with JSON content-type
// Error Cases: None (synchronous wrapper)

// Contract: Create redirect response
export function redirect(url: string, status: number = 302): Response
// Request: url: string, status?: number
// Response: Response with Location header
// Error Cases: None (synchronous wrapper)
```

**Strengths**:
- Generic type parameter `<T>` for type-safe JSON responses
- Uses `Response.json()` (React Router 7 compliant)
- Proper header merging with spread operator
- Default status code for redirect (302)
- Clean, minimal API surface

**React Router 7 Compliance**: PASS
- Uses `Response.json()` not `json()` helper from Remix
- No `@remix-run` imports
- Follows new React Router 7 patterns

### app/lib/analytics/schemas.ts

**Lines**: 71
**Type Definitions**: 3 schemas
**Validation**: Zod schemas (runtime validation)
**Type Safety Score**: 10/10

**Schema Contracts**:

```typescript
// Revenue Response Schema
export const RevenueResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    revenue: z.number(),
    transactions: z.number(),
    avgOrderValue: z.number(),
  }).optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  sampled: z.boolean(),
});
export type RevenueResponse = z.infer<typeof RevenueResponseSchema>;

// Traffic Response Schema
export const TrafficResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    sessions: z.number(),
    users: z.number(),
    pageviews: z.number(),
  }).optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  sampled: z.boolean(),
});
export type TrafficResponse = z.infer<typeof TrafficResponseSchema>;

// Conversion Rate Response Schema
export const ConversionRateResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    rate: z.number(),
    transactions: z.number(),
    sessions: z.number(),
  }).optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  sampled: z.boolean(),
});
export type ConversionRateResponse = z.infer<typeof ConversionRateResponseSchema>;

// Backwards compatibility alias
export const ConversionResponseSchema = ConversionRateResponseSchema;
export type ConversionResponse = ConversionRateResponse;
```

**Strengths**:
- Runtime validation with Zod (prevents schema drift)
- Consistent response envelope pattern across all schemas
- `sampled` flag for GA4 sampling detection
- `error` field optional (allows error responses)
- Backwards compatibility alias maintained
- Type inference from Zod schemas (single source of truth)

**Contract Characteristics**:
- Success/Error pattern: `success: boolean` discriminates response type
- Optional data: When `success: false`, `data` is undefined
- Timestamp inclusion: All responses include ISO timestamp
- Sampling transparency: `sampled` flag exposed to consumers

### app/lib/analytics/sampling-guard.ts

**Lines**: 38
**Functions**: 2
**Type Safety Score**: 6/10

**Function Signatures**:

```typescript
// Contract: Check if error indicates GA4 sampling
export function isSamplingError(error: any): boolean
// Request: error: any (should be Error | unknown)
// Response: boolean
// Error Cases: Handles null/undefined safely
// Type Issue: Uses 'any' type parameter

// Contract: Validate GA4 response is not sampled
export function validateUnsampled(response: any): void
// Request: response: any (should be GA4 response type)
// Response: void (throws on sampled data)
// Error Cases: Throws Error with specific message
// Type Issue: Uses 'any' type parameter
```

**Strengths**:
- Clear error messages for sampling detection
- Multiple detection patterns (metadata + samplingMetadatas)
- Throws synchronously (easy to catch)

**Concerns**:
- Uses `any` type for both functions (should use `unknown` or specific types)
- No JSDoc for expected response structure
- String matching on error messages (brittle pattern)

**Recommended Type Improvements**:
```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// File: app/lib/analytics/sampling-guard.ts

interface GA4ResponseMetadata {
  dataQuality?: string;
  samplingMetadatas?: Array<{ quotaUser?: string }>;
}

interface GA4Response {
  metadata?: GA4ResponseMetadata;
  samplingMetadatas?: Array<any>;
}

export function isSamplingError(error: unknown): boolean {
  // ... existing implementation
}

export function validateUnsampled(response: GA4Response): void {
  // ... existing implementation
}
```

### app/lib/seo/diagnostics.ts

**Lines**: 20
**Functions**: 2
**Type Safety Score**: 8/10

**Contracts**:

```typescript
// Interface: SEO Diagnostic
export interface SEODiagnostic {
  type: string;
  severity: "info" | "warning" | "error";
  message: string;
}

// Contract: Run diagnostics (stub)
export function runDiagnostics(data: any): SEODiagnostic[]
// Stub: YES - returns []

// Contract: Build SEO diagnostics (stub)
export function buildSeoDiagnostics(data: any): SEODiagnostic[]
// Stub: YES - returns []
```

**Strengths**:
- Clear interface with severity enum
- Return type explicit

**Concerns**:
- Stub implementation (no logic)
- Parameter type `any` (should be specific SEO data type)

### app/lib/seo/pipeline.ts

**Lines**: 37
**Functions**: 2 + 1 class
**Type Safety Score**: 7/10

**Contracts**:

```typescript
// Interface: SEO Pipeline Config
export interface SEOPipelineConfig {
  threshold?: number;
  window?: string;
}

// Contract: Create pipeline (stub)
export function createPipeline(config?: SEOPipelineConfig) {
  return { process: async (data: any) => data };
}

// Class: GA Sampling Error
export class GaSamplingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GaSamplingError";
  }
}

// Contract: Build SEO anomaly bundle (stub)
export function buildSeoAnomalyBundle(data: any) {
  return { anomalies: [], summary: {} };
}
```

**Strengths**:
- Custom error class for sampling errors
- Config interface defined
- Named error class (easy to catch)

**Concerns**:
- Stub implementations (minimal logic)
- Parameter types use `any`
- Return type not explicitly typed

---

## Error Handling Review

### Approvals Service (app/services/approvals.ts)

**Try-catch Blocks**: 0
**Error Responses**: NONE (stubs always succeed)
**Timeout Handling**: NO
**Retry Logic**: NO
**Score**: 2/10

**Critical Gaps**:
1. No database error handling (Supabase calls will be added)
2. No network timeout configuration
3. No retry logic for transient failures
4. Stubs return hardcoded success (masks errors)
5. `getApprovals` returns `error: null` always

**Expected Error Patterns** (when implemented):

```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// File: app/services/approvals.ts

import { createClient } from "~/utils/supabase.server";
import { ServiceError } from "~/services/types";

export async function getApprovals(filters?: {
  state?: string;
  kind?: string;
  limit?: number;
  offset?: number;
}): Promise<{ approvals: Approval[]; total: number; error: string | null }> {
  try {
    const supabase = createClient();

    let query = supabase
      .from("approvals")
      .select("*", { count: "exact" });

    if (filters?.state) query = query.eq("state", filters.state);
    if (filters?.kind) query = query.eq("kind", filters.kind);

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Supabase has built-in timeout (default 10s)
    const { data, count, error } = await query;

    if (error) {
      console.error("[Approvals] Query error:", error);
      return {
        approvals: [],
        total: 0,
        error: error.message,
      };
    }

    return {
      approvals: data || [],
      total: count || 0,
      error: null,
    };
  } catch (error: any) {
    console.error("[Approvals] Unexpected error:", error);
    return {
      approvals: [],
      total: 0,
      error: error.message || "Failed to fetch approvals",
    };
  }
}

export async function approveRequest(
  id: string,
  grades?: { tone: number; accuracy: number; policy: number }
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();

    const updates: any = {
      state: "approved",
      reviewer: "current-user", // TODO: Get from session
      updated_at: new Date().toISOString(),
    };

    if (grades) {
      updates.grades = grades;
    }

    const { error } = await supabase
      .from("approvals")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[Approvals] Approve error:", error);
      throw new ServiceError("Failed to approve request", {
        scope: "approvals.approve",
        code: "SUPABASE_ERROR",
        retryable: true,
        cause: error,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Approvals] Approve failed:", error);
    return { success: false };
  }
}
```

**Recommended Error Handling Improvements**:

1. **Wrap Supabase calls in try-catch**
2. **Return error details in response** (already structured in `getApprovals`)
3. **Log errors with context** (console.error with service prefix)
4. **Use ServiceError for retryable errors** (match existing patterns)
5. **Supabase timeout**: Default 10s (acceptable for database queries)
6. **No retry needed**: Database operations should not be retried automatically (may cause duplicate state changes)

### HTTP Utilities (app/utils/http.server.ts)

**Error Responses**: STRUCTURED
**Status Codes**: PROPER (accepts ResponseInit)
**Score**: 9/10

**Strengths**:
- Accepts `ResponseInit` for custom status codes
- Header merging prevents overwrites
- Clean wrapper around Response.json()

**Usage in Routes**:
```typescript
// SUCCESS: app/routes/api.analytics.revenue.ts
return json(validated); // Default 200

// ERROR: app/routes/api.analytics.revenue.ts
return json(errorResponse, { status: isSampled ? 503 : 500 });

// ERROR: app/routes/api.seo.anomalies.ts
return json({ success: false, error: error.message }, { status: 500 });
```

**Error Response Pattern**: EXCELLENT
- Consistent `{ success, error }` envelope
- Appropriate HTTP status codes (500, 502, 503)
- Error messages preserved

### Analytics Schemas (app/lib/analytics/schemas.ts)

**Validation**: RUNTIME (Zod)
**Error Handling**: IMPLICIT (Zod throws on invalid data)
**Score**: 9/10

**Strengths**:
- Zod validation catches contract violations at runtime
- Schema parsing will throw if API response doesn't match
- Used consistently in routes (see `api.analytics.revenue.ts` line 36, 53)

**Example Usage**:
```typescript
// app/routes/api.analytics.revenue.ts:36
const validated = RevenueResponseSchema.parse(response);
// Throws ZodError if response doesn't match schema
```

### Sampling Guard (app/lib/analytics/sampling-guard.ts)

**Error Detection**: YES
**Error Throwing**: YES
**Score**: 8/10

**Strengths**:
- Specific error messages for sampling
- Used in routes to set appropriate status codes (503 for sampling)

**Usage Pattern**:
```typescript
// app/routes/api.analytics.revenue.ts:43
const isSampled = isSamplingError(error);
return json(errorResponse, { status: isSampled ? 503 : 500 });
```

**Recommended Enhancement**:
- Return specific error object instead of boolean for more context

### SEO Pipeline (app/lib/seo/pipeline.ts)

**Custom Error Class**: YES (GaSamplingError)
**Score**: 7/10

**Usage**:
```typescript
// app/routes/api.seo.anomalies.ts:109
if (error instanceof GaSamplingError) {
  return json({ success: false, error: error.message }, { status: 502 });
}
```

**Strengths**:
- Custom error class for specific error type
- Allows instanceof checks in routes
- Different status code for sampling errors (502)

---

## API Contract Documentation

### Approvals Service Contracts

**Provider**: Supabase (PostgreSQL + RLS)
**Consumer**: React Router loaders/actions
**State**: STUB (contracts defined, implementation pending)

#### Contract 1: Get Pending Approvals

```typescript
GET /internal (service function)
Function: getPendingApprovals()

Request:
  None

Response:
  Type: Approval[]
  Example: []
  Error: None (stub returns empty array)

State: STUB
Notes: Will query Supabase approvals table with state='pending_review'
```

#### Contract 2: Get Approval by ID

```typescript
GET /internal (service function)
Function: getApprovalById(id: string)

Request:
  id: string (UUID)

Response:
  Type: Approval | null
  Example: null
  Error: None (stub returns null)

State: STUB
Notes: Will query Supabase approvals table with id match
```

#### Contract 3: Approve Request

```typescript
POST /internal (service function)
Function: approveRequest(id: string, grades?: {...})

Request:
  id: string (UUID)
  grades?: {
    tone: number (1-5)
    accuracy: number (1-5)
    policy: number (1-5)
  }

Response:
  Type: { success: boolean }
  Example: { success: true }
  Error: None (stub always succeeds)

State: STUB
Notes: Will update Supabase approvals table state to 'approved'
       Grades optional (only for kind='cx_reply')
```

#### Contract 4: Reject Request

```typescript
POST /internal (service function)
Function: rejectRequest(id: string, reason: string)

Request:
  id: string (UUID)
  reason: string

Response:
  Type: { success: boolean }
  Example: { success: true }
  Error: None (stub always succeeds)

State: STUB
Notes: Will update Supabase approvals table state to 'rejected'
       Reason stored in rejection_reason field
```

#### Contract 5: Get Approvals with Filters

```typescript
GET /internal (service function)
Function: getApprovals(filters?: {...})

Request:
  filters?: {
    state?: string (approval state)
    kind?: string (approval kind)
    limit?: number (default 50)
    offset?: number (default 0)
  }

Response:
  Type: {
    approvals: Approval[]
    total: number
    error: string | null
  }
  Example: { approvals: [], total: 0, error: null }
  Error: Returns error in response.error field

State: STUB
Notes: Will query Supabase approvals table with filters
       Pagination via limit/offset
       Error handling in response (not thrown)
```

#### Contract 6: Get Approval Counts

```typescript
GET /internal (service function)
Function: getApprovalCounts()

Request:
  None

Response:
  Type: Record<string, number>
  Example: {}
  Error: None (stub returns empty object)

State: STUB
Notes: Will query Supabase approvals table grouped by state
       Returns counts for each state (pending_review, approved, etc.)
```

### Analytics API Contracts

**Provider**: Google Analytics 4 API
**Consumer**: Dashboard tiles
**State**: PRODUCTION (with schema validation)

#### Contract 1: Revenue Metrics

```typescript
GET /api/analytics/revenue

Request:
  Query params: None
  Headers: Shopify session (via loader)

Response Schema:
  {
    success: boolean
    data?: {
      revenue: number
      transactions: number
      avgOrderValue: number
    }
    error?: string
    timestamp: string (ISO)
    sampled: boolean
  }

Status Codes:
  200: Success
  500: General error
  503: Sampling error (GA4 data sampled)

Error Cases:
  - GA4 API timeout (30s)
  - GA4 sampling detected
  - Invalid credentials
  - Network errors

Retry: NO (handled by underlying api-client.server.ts)
Timeout: Inherited from GA4 integration (likely 30s)
```

#### Contract 2: Traffic Metrics

```typescript
GET /api/analytics/traffic

Request:
  Query params: None
  Headers: Shopify session (via loader)

Response Schema:
  {
    success: boolean
    data?: {
      sessions: number
      users: number
      pageviews: number
    }
    error?: string
    timestamp: string (ISO)
    sampled: boolean
  }

Status Codes:
  200: Success
  500: General error
  503: Sampling error

Error Cases: Same as Revenue Metrics
```

#### Contract 3: Conversion Rate

```typescript
GET /api/analytics/conversion-rate

Request:
  Query params: None
  Headers: Shopify session (via loader)

Response Schema:
  {
    success: boolean
    data?: {
      rate: number
      transactions: number
      sessions: number
    }
    error?: string
    timestamp: string (ISO)
    sampled: boolean
  }

Status Codes:
  200: Success
  500: General error
  503: Sampling error

Error Cases: Same as Revenue Metrics
```

### SEO Anomalies API Contract

**Provider**: Google Analytics 4 + Search Console (mocked)
**Consumer**: Dashboard SEO tile
**State**: PARTIAL (GA4 live, Search Console mocked)

```typescript
GET /api/seo/anomalies

Request:
  Query params:
    shop?: string (default: "default-shop.myshopify.com")

Response:
  {
    success: boolean
    data?: {
      shopDomain: string
      traffic: TrafficAnomaly[]
      ranking: RankingAnomaly[]
      vitals: VitalsAnomaly[]
      crawl: CrawlError[]
      generatedAt?: string
      sources: {
        traffic: string
        ranking: string
        vitals: string
        crawl: string
      }
      isSampled: boolean
      diagnostics: SEODiagnostic[]
    }
    error?: string
    timestamp: string
  }

Status Codes:
  200: Success
  500: General error
  502: GA4 sampling error (GaSamplingError)

Error Cases:
  - GA4 API errors (traffic anomalies)
  - Search Console API errors (future)
  - Sampling detected

Notes:
  - Search Console integration stubbed (returns [])
  - Core Web Vitals stubbed (returns [])
  - Crawl errors stubbed (returns [])
  - Only traffic anomalies from GA4 are real
```

---

## Breaking Changes Analysis

**Breaking Changes**: 0

**Reason**: All services are new additions (not modifications to existing contracts).

**New Contracts Introduced**:
1. `app/services/approvals.ts` - New service (no prior contract)
2. `app/utils/http.server.ts` - New utility (no prior contract)
3. `app/lib/analytics/schemas.ts` - New schemas (additive)
4. `app/lib/analytics/sampling-guard.ts` - New utility (additive)
5. `app/lib/seo/diagnostics.ts` - New utility (stub)
6. `app/lib/seo/pipeline.ts` - New utility (stub)

**Backwards Compatibility**:
- `ConversionResponseSchema` alias maintained in schemas.ts (line 69-70)
- This ensures existing code using old name continues to work

**Migration Requirements**: NONE (all new services)

---

## React Router 7 Compliance

**Status**: COMPLIANT

**Checklist**:

- [x] Uses Response.json() not json() helper from Remix
  - **Location**: `app/utils/http.server.ts:15`
  - **Pattern**: `return Response.json(data, {...})`

- [x] No @remix-run imports
  - **Verification**: Grepped all 6 files - ZERO @remix-run imports

- [x] LoaderFunctionArgs typed correctly
  - **Example**: `app/routes/approvals/route.tsx:24`
  - **Pattern**: `import type { LoaderFunctionArgs } from "react-router"`

- [x] Uses react-router imports only
  - **Verification**: All route files use `from "react-router"`

**Evidence**:

```typescript
// app/utils/http.server.ts:14-22 (COMPLIANT)
export function json<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, {  // ✓ React Router 7 pattern
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
}

// app/routes/api.analytics.revenue.ts:16 (COMPLIANT)
import { json } from "~/utils/http.server"; // ✓ Local wrapper
return json(validated); // ✓ Uses Response.json internally
```

**No Violations Found**: All code follows React Router 7 patterns.

---

## Stub vs. Implementation Analysis

**Stub Functions**: 8 (out of 12 total functions)
**Production-Ready**: 4
**Documented Stubs**: YES (inline comments)
**Impact**: NON-BLOCKING

### Stub Functions Breakdown

| File | Function | Stub? | Reason | Blocker? |
|------|----------|-------|--------|----------|
| `approvals.ts` | `getPendingApprovals` | YES | Awaiting Supabase implementation | NO |
| `approvals.ts` | `getApprovalById` | YES | Awaiting Supabase implementation | NO |
| `approvals.ts` | `approveRequest` | YES | Awaiting Supabase implementation | NO |
| `approvals.ts` | `rejectRequest` | YES | Awaiting Supabase implementation | NO |
| `approvals.ts` | `getApprovals` | YES | Awaiting Supabase implementation | NO |
| `approvals.ts` | `getApprovalCounts` | YES | Awaiting Supabase implementation | NO |
| `seo/diagnostics.ts` | `runDiagnostics` | YES | SEO diagnostics logic pending | NO |
| `seo/diagnostics.ts` | `buildSeoDiagnostics` | YES | SEO diagnostics logic pending | NO |

### Production-Ready Functions

| File | Function | Status | Notes |
|------|----------|--------|-------|
| `http.server.ts` | `json` | PROD | React Router 7 wrapper |
| `http.server.ts` | `redirect` | PROD | Standard redirect helper |
| `sampling-guard.ts` | `isSamplingError` | PROD | Error detection logic |
| `sampling-guard.ts` | `validateUnsampled` | PROD | Validation logic |

### Stub Documentation Quality

**Status**: GOOD

All stub functions have inline comments:
```typescript
// Line 13: getPendingApprovals
// Stub implementation

// Line 21: getApprovalById
// Stub implementation
```

**Recommendation**: Add TODO comments with task references:
```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// Stub implementation
// TODO(#108): Implement Supabase query for pending approvals
```

---

## Timeout and Retry Configuration

### Existing Patterns in Codebase

Based on analysis of `app/utils/api-client.server.ts` and `app/services/shopify/client.ts`:

**Standard Configuration**:
```typescript
// app/utils/api-client.server.ts:19-25
timeout: 10000,           // 10 second default
maxRetries: 2,            // 2 retry attempts
retryDelay: 1000,         // 1 second base delay
backoff: exponential,     // 2^attempt multiplier
jitter: 10%,              // Random 0-10% added to delay
```

**Shopify GraphQL Configuration**:
```typescript
// app/services/shopify/client.ts:25-26
MAX_RETRIES: 2,           // 2 retry attempts
BASE_DELAY_MS: 500,       // 500ms base delay
backoff: exponential,     // 2^attempt multiplier
jitter: 10%,              // Random 0-10% jitter
retryOn: [429, 5xx]       // Rate limit + server errors
```

### Service-Specific Recommendations

#### Approvals Service (Supabase)

```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// File: app/services/approvals.ts

// Supabase client configuration (when implemented)
const supabase = createClient({
  db: {
    schema: "public",
  },
  global: {
    headers: { "x-client-info": "hot-dash/1.0" },
  },
  // Supabase default timeout: 10s (acceptable for DB queries)
  // NO retry needed: State mutations should not retry automatically
});
```

**Rationale**:
- **Timeout**: 10s (Supabase default) - sufficient for database queries
- **Retry**: NO - Approval state changes are mutations, retrying risks duplicate operations
- **Error Handling**: Return error in response object (already designed in `getApprovals`)

#### Analytics APIs (GA4)

```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// Current timeout not visible (handled by underlying GA4 client)
// Recommended: 30-60s for GA4 queries

// GA4 queries can be slow due to:
// - Large date ranges
// - Complex dimensions/metrics
// - Sampling calculations

// Retry: YES for 5xx errors, NO for sampling errors
if (error.status >= 500) {
  // Retry with exponential backoff
} else if (isSamplingError(error)) {
  // DO NOT retry - sampling is persistent for the query
  throw new Error("GA4 data sampled - adjust date range");
}
```

**Current Implementation**: Not explicitly configured (delegated to GA4 integration)
**Recommendation**: Document expected timeout in route comments

#### SEO Anomalies API (Multi-source)

```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// File: app/routes/api.seo.anomalies.ts

// Multiple API sources with different characteristics:
// - GA4: 30-60s timeout, retry on 5xx
// - Search Console: 20-30s timeout, retry on 5xx
// - PageSpeed Insights: 60-90s timeout (rendering + metrics)

// Parallel fetching with Promise.allSettled
const [gaResult, scResult, psiResult] = await Promise.allSettled([
  getLandingPageAnomalies({ shopDomain }), // GA4
  getSearchConsoleData({ shopDomain }),    // Future
  getPageSpeedMetrics({ shopDomain }),     // Future
]);

// Aggregate results (tolerate partial failures)
```

**Current State**: Only GA4 live, others mocked
**Recommendation**: Document timeout expectations when implementing real integrations

---

## Rate Limiting Considerations

### Shopify Admin GraphQL

**Existing Implementation**: `app/services/shopify/client.ts`

```typescript
// Lines 28-29: Retry on 429 (rate limit)
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}
```

**Pattern**: REACTIVE (retry after rate limit hit)

**Shopify Rate Limits**:
- REST: 2 calls/second
- GraphQL: Cost-based (default 1000 points, refills 50/second)
- Retry-After header: Respected by exponential backoff

**Status**: COMPLIANT

### Google Analytics 4 API

**Rate Limits**:
- 10 queries per second per project
- 100 queries per 100 seconds per project
- Daily quota: 25,000 requests

**Current Implementation**: Not visible (handled by underlying GA4 client)

**Recommendation**: Add client-side throttling for dashboard auto-refresh

```typescript
// FOR REFERENCE ONLY - DO NOT AUTO-APPLY
// File: app/routes/_index/route.tsx (or dashboard loader)

// Throttle GA4 queries to max 1 per 5 seconds
const MIN_QUERY_INTERVAL_MS = 5000;
let lastQueryTime = 0;

export async function loader({ request }: LoaderFunctionArgs) {
  const now = Date.now();
  const elapsed = now - lastQueryTime;

  if (elapsed < MIN_QUERY_INTERVAL_MS) {
    // Return cached data or wait
    await new Promise(resolve =>
      setTimeout(resolve, MIN_QUERY_INTERVAL_MS - elapsed)
    );
  }

  lastQueryTime = Date.now();
  // Proceed with GA4 queries
}
```

### Supabase (Future - Approvals Service)

**Rate Limits**:
- Supabase default: No strict rate limits for authenticated requests
- RLS policies enforce row-level access
- Connection pooling: PgBouncer (default 15 connections)

**Recommendation**: No rate limiting needed (database queries)

---

## Production Readiness Assessment

### Ready for Production

**Status**: PARTIAL

**Components Ready**:
1. HTTP utilities (`http.server.ts`) - READY
2. Analytics schemas (`schemas.ts`) - READY
3. Sampling guard (`sampling-guard.ts`) - READY
4. SEO pipeline error class (`pipeline.ts::GaSamplingError`) - READY

**Components Blocked**:
1. Approvals service - BLOCKED (Supabase integration needed)
2. SEO diagnostics - BLOCKED (logic implementation needed)
3. SEO pipeline processing - BLOCKED (implementation needed)

### Remaining Work

#### Critical Path (Blocks Production)

1. **Approvals Service Implementation** (HIGH PRIORITY)
   - Supabase schema migration (approvals table)
   - RLS policies for approvals access
   - Implement 6 service functions
   - Add error handling (try-catch + ServiceError)
   - Create API routes for HTTP endpoints
   - Add integration tests

2. **SEO Diagnostics Implementation** (MEDIUM PRIORITY)
   - Implement `runDiagnostics` logic
   - Implement `buildSeoDiagnostics` logic
   - Define diagnostic rules (traffic drops, ranking losses, etc.)

3. **SEO Pipeline Implementation** (MEDIUM PRIORITY)
   - Implement `createPipeline` processing logic
   - Implement `buildSeoAnomalyBundle` aggregation
   - Add anomaly detection algorithms

#### Non-Critical (Can Deploy)

1. HTTP utilities - NO WORK NEEDED
2. Analytics schemas - NO WORK NEEDED
3. Sampling guard - NO WORK NEEDED (may need type improvements)

### Risk Assessment

**Deployment Risk**: LOW (with caveats)

**Safe to Deploy**:
- All stub functions documented
- No breaking changes
- Type-safe contracts defined
- React Router 7 compliant

**Risks**:
1. **Stub functions may mask errors** - Frontend won't know if backend is missing
   - Mitigation: Frontend should handle empty results gracefully
   - Already implemented: `app/routes/approvals/route.tsx:216` shows empty state

2. **No timeout handling in stubs** - Could hang if called with real backend expectations
   - Mitigation: Stubs return immediately (synchronous)
   - Low risk until implementation

3. **Missing error types** - ServiceError not used in approvals service
   - Mitigation: Add during implementation phase
   - Non-blocking for current PR

### Deployment Checklist

**Before Production**:
- [ ] Supabase approvals table created
- [ ] RLS policies configured
- [ ] Approvals service functions implemented
- [ ] Error handling added (try-catch + ServiceError)
- [ ] Integration tests written
- [ ] API routes created (`/api/approvals/*`)
- [ ] Frontend tested with real backend
- [ ] SEO diagnostics implemented (or feature flagged)

**Current PR (#107)**:
- [x] Contracts defined
- [x] Types explicit
- [x] Stubs documented
- [x] React Router 7 compliant
- [x] No breaking changes
- [x] HTTP utilities production-ready

---

## Warnings

1. **STUB_FUNCTIONS**: 6 approval service functions are stubs returning hardcoded values. Frontend will not error but may display empty/incorrect data until implemented.

2. **MISSING_ERROR_HANDLING**: Approvals service has no try-catch blocks. When Supabase integration is added, errors will cause unhandled promise rejections.

3. **NO_TIMEOUT_CONFIG**: Approvals service does not configure timeouts. Will inherit Supabase defaults (10s) when implemented.

4. **TYPE_SAFETY_ANY**: `sampling-guard.ts` and `seo/diagnostics.ts` use `any` type for parameters. Should use `unknown` or specific types for better type safety.

5. **GA4_TIMEOUT_UNDOCUMENTED**: Analytics routes don't document expected timeout values. Recommend adding comments about 30-60s typical response time.

6. **NO_RETRY_IN_APPROVALS**: Approvals service has no retry logic (correct for mutations, but should be documented).

7. **STUB_SEO_PIPELINE**: SEO pipeline functions are stubs. Used in `api.seo.anomalies.ts` but return empty results.

8. **PARTIAL_INTEGRATION**: SEO anomalies route mocks Search Console, Core Web Vitals, and crawl errors. Only GA4 traffic anomalies are real.

---

## Recommendations

### Immediate (This PR)

1. **Add TODO comments to stubs** with issue references
   ```typescript
   // TODO(#108): Implement Supabase integration
   ```

2. **Document timeout expectations** in route files
   ```typescript
   // GA4 queries typically take 30-60s
   // Timeout handled by underlying client
   ```

3. **Add JSDoc to public functions** with error cases
   ```typescript
   /**
    * Get approvals with optional filters
    * @throws {ServiceError} When database query fails (when implemented)
    */
   ```

4. **Improve sampling-guard types** (low priority)
   ```typescript
   export function isSamplingError(error: unknown): boolean
   export function validateUnsampled(response: GA4Response): void
   ```

### Next PR (Implementation)

1. **Implement Approvals Service**
   - Add Supabase client initialization
   - Wrap queries in try-catch blocks
   - Use ServiceError for retryable errors
   - Log errors with context
   - Add integration tests

2. **Add Contract Tests**
   ```typescript
   // FOR REFERENCE ONLY - DO NOT AUTO-APPLY
   // File: tests/contract/approvals.contract.test.ts

   describe("Approvals Service Contract", () => {
     it("getApprovals returns correct shape", async () => {
       const result = await getApprovals();
       expect(result).toHaveProperty("approvals");
       expect(result).toHaveProperty("total");
       expect(result).toHaveProperty("error");
     });

     it("approveRequest handles database errors", async () => {
       // Mock Supabase error
       const result = await approveRequest("invalid-id");
       expect(result.success).toBe(false);
     });
   });
   ```

3. **Create API Routes**
   ```typescript
   // FOR REFERENCE ONLY - DO NOT AUTO-APPLY
   // File: app/routes/api/approvals.$id.approve.ts

   import { type ActionFunctionArgs } from "react-router";
   import { json } from "~/utils/http.server";
   import { approveRequest } from "~/services/approvals";

   export async function action({ params, request }: ActionFunctionArgs) {
     const { id } = params;
     const body = await request.json();

     try {
       const result = await approveRequest(id!, body.grades);
       return json(result);
     } catch (error: any) {
       return json(
         { success: false, error: error.message },
         { status: 500 }
       );
     }
   }
   ```

4. **Implement SEO Diagnostics**
   - Define diagnostic rules (traffic thresholds, etc.)
   - Implement `runDiagnostics` with real logic
   - Add unit tests for diagnostic rules

5. **Implement SEO Pipeline**
   - Define pipeline processing stages
   - Implement `buildSeoAnomalyBundle` aggregation
   - Add streaming support for long-running queries

### Future Enhancements

1. **Rate Limiting Dashboard**
   - Track GA4 query rate
   - Display quota usage
   - Throttle auto-refresh if approaching limits

2. **Circuit Breaker Pattern**
   - Add circuit breaker for external APIs
   - Prevent cascading failures
   - Fallback to cached data

3. **Response Caching**
   - Cache GA4 responses for 5 minutes
   - Reduce API quota usage
   - Faster dashboard loads

4. **Observability**
   - Add metrics for timeout rates
   - Track retry attempts
   - Alert on high error rates

---

## Contract Test Recommendations

Below are example contract tests to validate the API contracts defined in this PR. These tests should be created when implementations are added.

**FOR REFERENCE ONLY - DO NOT AUTO-APPLY**

### Approvals Service Contract Tests

```typescript
// File: tests/contract/approvals.service.contract.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import {
  getPendingApprovals,
  getApprovalById,
  approveRequest,
  rejectRequest,
  getApprovals,
  getApprovalCounts,
} from "~/services/approvals";

describe("Approvals Service Contract Tests", () => {
  describe("getPendingApprovals", () => {
    it("returns array of Approval objects", async () => {
      const result = await getPendingApprovals();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getApprovalById", () => {
    it("accepts string id parameter", async () => {
      const result = await getApprovalById("test-id");
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("returns null for non-existent id", async () => {
      const result = await getApprovalById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("approveRequest", () => {
    it("returns success boolean", async () => {
      const result = await approveRequest("test-id");
      expect(result).toHaveProperty("success");
      expect(typeof result.success).toBe("boolean");
    });

    it("accepts optional grades parameter", async () => {
      const result = await approveRequest("test-id", {
        tone: 4,
        accuracy: 5,
        policy: 5,
      });
      expect(result).toHaveProperty("success");
    });
  });

  describe("rejectRequest", () => {
    it("requires reason parameter", async () => {
      const result = await rejectRequest("test-id", "Not compliant");
      expect(result).toHaveProperty("success");
    });
  });

  describe("getApprovals", () => {
    it("returns object with approvals, total, and error", async () => {
      const result = await getApprovals();
      expect(result).toHaveProperty("approvals");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("error");
      expect(Array.isArray(result.approvals)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(result.error === null || typeof result.error === "string").toBe(true);
    });

    it("accepts optional filters", async () => {
      const result = await getApprovals({
        state: "pending_review",
        kind: "cx_reply",
        limit: 10,
        offset: 0,
      });
      expect(result).toHaveProperty("approvals");
    });
  });

  describe("getApprovalCounts", () => {
    it("returns record of string to number", async () => {
      const result = await getApprovalCounts();
      expect(typeof result).toBe("object");
      Object.entries(result).forEach(([key, value]) => {
        expect(typeof key).toBe("string");
        expect(typeof value).toBe("number");
      });
    });
  });
});
```

### Analytics Schema Contract Tests

```typescript
// File: tests/contract/analytics.schemas.contract.test.ts

import { describe, it, expect } from "vitest";
import {
  RevenueResponseSchema,
  TrafficResponseSchema,
  ConversionRateResponseSchema,
} from "~/lib/analytics/schemas";

describe("Analytics Schema Contract Tests", () => {
  describe("RevenueResponseSchema", () => {
    it("validates success response", () => {
      const validResponse = {
        success: true,
        data: {
          revenue: 1000.50,
          transactions: 25,
          avgOrderValue: 40.02,
        },
        timestamp: "2025-10-20T12:00:00Z",
        sampled: false,
      };

      const result = RevenueResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("validates error response", () => {
      const errorResponse = {
        success: false,
        error: "GA4 API error",
        timestamp: "2025-10-20T12:00:00Z",
        sampled: false,
      };

      const result = RevenueResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it("rejects invalid response", () => {
      const invalidResponse = {
        success: true,
        // Missing data field
        timestamp: "2025-10-20T12:00:00Z",
        sampled: false,
      };

      const result = RevenueResponseSchema.safeParse(invalidResponse);
      // Should pass because data is optional
      expect(result.success).toBe(true);
    });

    it("rejects missing required fields", () => {
      const invalidResponse = {
        success: true,
        // Missing timestamp and sampled
      };

      const result = RevenueResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("TrafficResponseSchema", () => {
    it("validates complete response", () => {
      const validResponse = {
        success: true,
        data: {
          sessions: 500,
          users: 350,
          pageviews: 1200,
        },
        timestamp: "2025-10-20T12:00:00Z",
        sampled: false,
      };

      const result = TrafficResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe("ConversionRateResponseSchema", () => {
    it("validates complete response", () => {
      const validResponse = {
        success: true,
        data: {
          rate: 0.05,
          transactions: 25,
          sessions: 500,
        },
        timestamp: "2025-10-20T12:00:00Z",
        sampled: false,
      };

      const result = ConversionRateResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});
```

### HTTP Utilities Contract Tests

```typescript
// File: tests/contract/http.server.contract.test.ts

import { describe, it, expect } from "vitest";
import { json, redirect } from "~/utils/http.server";

describe("HTTP Server Utilities Contract Tests", () => {
  describe("json", () => {
    it("returns Response with JSON content-type", () => {
      const data = { test: "value" };
      const response = json(data);

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get("Content-Type")).toBe("application/json");
    });

    it("accepts custom ResponseInit", () => {
      const data = { error: "Not found" };
      const response = json(data, { status: 404 });

      expect(response.status).toBe(404);
    });

    it("merges custom headers", () => {
      const data = { test: "value" };
      const response = json(data, {
        headers: { "X-Custom": "header" },
      });

      expect(response.headers.get("Content-Type")).toBe("application/json");
      expect(response.headers.get("X-Custom")).toBe("header");
    });

    it("preserves type safety with generic", async () => {
      interface TestData {
        id: string;
        name: string;
      }

      const data: TestData = { id: "1", name: "Test" };
      const response = json<TestData>(data);

      const parsed = await response.json();
      expect(parsed).toEqual(data);
    });
  });

  describe("redirect", () => {
    it("returns Response with Location header", () => {
      const response = redirect("/dashboard");

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get("Location")).toBe("/dashboard");
    });

    it("defaults to 302 status", () => {
      const response = redirect("/dashboard");
      expect(response.status).toBe(302);
    });

    it("accepts custom status code", () => {
      const response = redirect("/login", 301);
      expect(response.status).toBe(301);
    });
  });
});
```

### Sampling Guard Contract Tests

```typescript
// File: tests/contract/sampling-guard.contract.test.ts

import { describe, it, expect } from "vitest";
import { isSamplingError, validateUnsampled } from "~/lib/analytics/sampling-guard";

describe("Sampling Guard Contract Tests", () => {
  describe("isSamplingError", () => {
    it("detects sampling error messages", () => {
      const error = new Error("Data is sampled");
      expect(isSamplingError(error)).toBe(true);
    });

    it("detects quota exceeded errors", () => {
      const error = new Error("Exceeded quota - data quality reduced");
      expect(isSamplingError(error)).toBe(true);
    });

    it("returns false for non-sampling errors", () => {
      const error = new Error("Network timeout");
      expect(isSamplingError(error)).toBe(false);
    });

    it("handles null error safely", () => {
      expect(isSamplingError(null)).toBe(false);
    });
  });

  describe("validateUnsampled", () => {
    it("throws on sampled data quality", () => {
      const response = {
        metadata: { dataQuality: "SAMPLED" },
      };

      expect(() => validateUnsampled(response)).toThrow("sampled");
    });

    it("throws on sampling metadatas", () => {
      const response = {
        samplingMetadatas: [{ quotaUser: "user1" }],
      };

      expect(() => validateUnsampled(response)).toThrow("sampled");
    });

    it("passes on unsampled response", () => {
      const response = {
        metadata: { dataQuality: "UNSAMPLED" },
      };

      expect(() => validateUnsampled(response)).not.toThrow();
    });
  });
});
```

---

## Summary

PR #107 introduces 6 new service and utility files with the following characteristics:

**Strengths**:
- Explicit return types (type safety: 8/10)
- React Router 7 compliant (no @remix-run imports)
- Zod schema validation for analytics responses
- Custom error classes (GaSamplingError)
- Consistent error response patterns
- Well-documented stubs

**Concerns**:
- 8 stub functions (66% of total) need implementation
- No error handling in approvals service (no try-catch)
- Missing timeout/retry documentation
- Some `any` types (sampling-guard, diagnostics)
- SEO pipeline stubs return empty results

**Production Readiness**: 4/10
- HTTP utilities: READY
- Analytics schemas: READY
- Sampling guard: READY
- Approvals service: BLOCKED (needs Supabase)
- SEO diagnostics: BLOCKED (needs implementation)
- SEO pipeline: BLOCKED (needs implementation)

**Deployment Risk**: LOW (with monitoring)
- Safe to deploy (stubs documented)
- Frontend handles empty results gracefully
- No breaking changes
- Implementation can follow incrementally

**Next Steps**:
1. Implement Supabase integration for approvals service
2. Add error handling (try-catch + ServiceError)
3. Create API routes for approval actions
4. Implement SEO diagnostics logic
5. Add contract tests
6. Document timeout expectations

---

**Files Analyzed**:
- `/home/justin/HotDash/hot-dash/app/services/approvals.ts`
- `/home/justin/HotDash/hot-dash/app/utils/http.server.ts`
- `/home/justin/HotDash/hot-dash/app/lib/analytics/schemas.ts`
- `/home/justin/HotDash/hot-dash/app/lib/analytics/sampling-guard.ts`
- `/home/justin/HotDash/hot-dash/app/lib/seo/diagnostics.ts`
- `/home/justin/HotDash/hot-dash/app/lib/seo/pipeline.ts`

**Related Files Reviewed**:
- `/home/justin/HotDash/hot-dash/app/routes/approvals/route.tsx` (usage patterns)
- `/home/justin/HotDash/hot-dash/app/routes/api.analytics.revenue.ts` (usage patterns)
- `/home/justin/HotDash/hot-dash/app/routes/api.seo.anomalies.ts` (usage patterns)
- `/home/justin/HotDash/hot-dash/app/utils/api-client.server.ts` (timeout/retry patterns)
- `/home/justin/HotDash/hot-dash/app/services/shopify/client.ts` (timeout/retry patterns)
