---
epoch: 2025.10.E1
doc: docs/design/error_message_localization_audit.md
owner: localization
created: 2025-10-13T23:00:00Z
last_reviewed: 2025-10-13T23:00:00Z
doc_hash: TBD
expires: 2025-11-13
---
# Error Message Localization Audit — Task 9

## Purpose
Audit all error messages in the HotDash application for localization readiness, consistency, and user-friendliness. Ensure all messages are English-only, follow brand voice, and provide actionable guidance.

## Audit Scope
- Application error messages (`app/` directory)
- User-facing error displays
- Service layer errors
- API/integration errors
- Validation errors
- Component error boundaries

## Audit Date
2025-10-13T23:00:00Z

---

## Error Message Inventory

### 1. User-Facing UI Errors

#### ErrorBoundary Component (`app/components/ErrorBoundary.tsx`)
**Current Messages**:
- ❌ **"Something went wrong"** - Generic, not actionable
- ❌ **"Unable to load data for this tile. Please try refreshing."** - Generic fallback

**Issues**:
1. "Something went wrong" is too generic and unhelpful
2. Lacks context about what failed
3. No clear recovery action beyond "refresh"

**Recommendations**:
- Replace "Something went wrong" with context-specific messages
- Provide specific error codes or identifiers
- Include clear recovery steps
- Consider: "We couldn't load this tile. Try refreshing the page or check back in a few minutes."

#### ApprovalCard Component (`app/components/ApprovalCard.tsx`)
**Current Messages**:
- ❌ **"Failed to approve"** - Too generic
- ❌ **"Failed to reject"** - Too generic

**Issues**:
1. No context about WHY it failed
2. No recovery action suggested
3. User doesn't know if they should retry

**Recommendations**:
- "Approval request couldn't be processed. Please try again or contact support."
- "Rejection couldn't be processed. Please check your connection and try again."

### 2. Service Layer Errors

#### Google Analytics Service (`app/services/ga/`)

**Configuration Errors**:
- ✅ `"GA_MCP_HOST required when GA_MODE=mcp"` - Technical, for developers (OK)
- ✅ `"GA MCP host is not configured"` - Technical (OK)
- ✅ `"GA_PROPERTY_ID environment variable required"` - Technical (OK)

**Runtime Errors**:
- ⚠️ `"GA MCP request failed with status ${response.status}"` - Could be more user-friendly
- ⚠️ `"Unknown error"` - Too generic

**Status**: Technical errors are OK (not user-facing), but should include error codes

#### Shopify Service (`app/services/shopify/`)

**Errors**:
- ✅ `"Unable to resolve shop domain from session."` - Clear and specific

**Pattern**: Uses ServiceError with error messages joined - good pattern

#### Chatwoot Service (`app/services/chatwoot/escalations.ts`)

**Errors**:
- ✅ `"Unable to fetch Chatwoot messages"` - Clear and specific

**Status**: Good pattern, includes context

### 3. Utility & Infrastructure Errors

#### Webhook Retry (`app/utils/webhook-retry.server.ts`)
**Errors**:
- ✅ `"Supabase not configured"` - Technical (OK)
- ⚠️ `"Failed to queue webhook: ${error.message}"` - Should sanitize error.message
- ⚠️ `"Failed to fetch dead letter queue: ${error.message}"` - Should sanitize

**Issue**: Directly exposing internal error messages to logs (security concern if logged to client)

#### API Client (`app/utils/api-client.server.ts`)
**Errors**:
- ⚠️ `"HTTP ${response.status}: ${response.statusText}"` - Technical HTTP errors exposed

**Recommendation**: Transform HTTP errors into user-friendly messages

#### Feature Flags (`app/utils/feature-flags.server.ts`)
**Errors**:
- ⚠️ `"Feature ${key} is disabled and no fallback provided"` - Developer error (OK)

**Status**: Internal error, appropriate for developers

#### Environment Validation (`app/utils/env.server.ts`)
**Errors**:
- ✅ `"SHOPIFY_API_KEY environment variable is required"` - Clear technical error
- ✅ `"SHOPIFY_API_SECRET environment variable is required"` - Clear
- ✅ `"SHOPIFY_APP_URL environment variable is required"` - Clear
- ✅ `"SCOPES environment variable is required"` - Clear

**Status**: Technical startup errors, appropriate

### 4. Route/Action Errors

#### Approval Routes
**Errors**:
- ⚠️ `"Rejection failed with status ${response.status}"` - Exposes HTTP status
- ⚠️ `"Approval failed with status ${response.status}"` - Exposes HTTP status

**Issue**: HTTP status codes are technical, not user-friendly

**Recommendations**:
```typescript
// Instead of:
throw new Error(`Approval failed with status ${response.status}`);

// Use:
if (response.status === 404) {
  throw new Error("This approval request could not be found.");
} else if (response.status === 403) {
  throw new Error("You don't have permission to approve this request.");
} else {
  throw new Error("Approval couldn't be processed. Please try again.");
}
```

### 5. Error Handler Utility (`app/utils/error-handler.server.ts`)

**Good Patterns Found**:
- ✅ `getUserFriendlyMessage()` function transforms errors
- ✅ Checks for keywords: 'fetch', 'timeout', 'not found'
- ✅ Returns generic message for unknown errors

**Current User-Friendly Messages** (from code inspection):
- "Network error. Please check your connection."
- "Request timeout. Please try again."
- "Resource not found."
- Generic fallback for other errors

**Status**: Good foundation, could be expanded

---

## Error Message Categories

### Category 1: Technical/Developer Errors ✅
**Status**: OK - Not user-facing
- Environment variable missing errors
- Configuration errors
- Service initialization errors

**Examples**:
- "GA_PROPERTY_ID environment variable required"
- "Supabase not configured"
- "SHOPIFY_API_KEY environment variable is required"

**Recommendation**: Keep as-is, these are for developers

### Category 2: User-Facing Generic Errors ❌
**Status**: NEEDS IMPROVEMENT - Too vague

**Current Problems**:
- "Something went wrong"
- "Failed to approve"
- "Failed to reject"
- "Unknown error"

**Recommended Replacements**:
| Current | Recommended |
|---------|-------------|
| "Something went wrong" | "We couldn't complete your request. Try refreshing the page or check back soon." |
| "Failed to approve" | "Approval couldn't be processed. Please try again or contact support if this persists." |
| "Failed to reject" | "Rejection couldn't be processed. Please try again." |
| "Unknown error" | "An unexpected error occurred. Please try again." |

### Category 3: HTTP Status Errors ⚠️
**Status**: NEEDS TRANSFORMATION - Too technical

**Current Pattern**:
```typescript
throw new Error(`HTTP ${response.status}: ${response.statusText}`);
throw new Error(`Request failed with status ${response.status}`);
```

**Recommended Pattern**:
```typescript
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400: return "The request couldn't be processed. Please check your input.";
    case 401: return "You need to log in to perform this action.";
    case 403: return "You don't have permission to perform this action.";
    case 404: return "The requested item could not be found.";
    case 408: return "The request timed out. Please try again.";
    case 429: return "Too many requests. Please wait a moment and try again.";
    case 500: return "A server error occurred. Please try again later.";
    case 502:
    case 503: return "The service is temporarily unavailable. Please try again in a few minutes.";
    default: return "An error occurred. Please try again.";
  }
}
```

### Category 4: Service Integration Errors ⚠️
**Status**: PARTIALLY GOOD - Needs consistency

**Good Examples**:
- "Unable to fetch Chatwoot messages" (specific context)
- "Unable to resolve shop domain from session" (specific context)

**Needs Improvement**:
- Generic API error messages
- Exposing internal error details

---

## Localization Readiness

### English-Only Compliance ✅
**Status**: PASS
- All error messages are in English
- No non-English strings detected
- No hardcoded locale-specific formatting

### i18n Preparation 🟡
**Status**: PARTIAL - Needs structure

**Current State**:
- Error messages are hardcoded strings
- No centralized error message repository
- No error code system

**Recommendations for Future i18n**:
1. Create error code enum
2. Centralize error messages
3. Create error message lookup system
4. Prepare translation keys

**Example Structure**:
```typescript
// errors.ts
export enum ErrorCode {
  APPROVAL_FAILED = 'APPROVAL_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  // ...
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.APPROVAL_FAILED]: 'Approval couldn't be processed. Please try again.',
  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCode.NOT_FOUND]: 'The requested item could not be found.',
  [ErrorCode.UNAUTHORIZED]: 'You don't have permission to perform this action.',
  // ...
};

// Future i18n:
// ERROR_MESSAGES_FR, ERROR_MESSAGES_ES, etc.
```

---

## Brand Voice Compliance

### Current Tone Analysis
**Automotive/Hot Rod Theme**: ❌ NOT APPLIED to error messages

**Current Error Message Tone**:
- Generic tech speak
- Bland corporate language
- No personality
- Not aligned with "Mission Control" / "Engine Trouble" theme

### Recommended Hot Rod AN Voice

**Replace generic errors with automotive-themed messages**:

| Generic | Hot Rod AN Voice |
|---------|------------------|
| "Something went wrong" | "Engine trouble detected. Our crew is on it." |
| "Failed to approve" | "Couldn't shift this into approved gear. Try again?" |
| "Failed to reject" | "Rejection didn't stick. Give it another shot." |
| "Network error" | "Lost radio contact. Check your connection and retry." |
| "Request timeout" | "That request stalled out. Mind hitting the gas again?" |
| "Not found" | "That item's not in the garage. Double-check and try again." |
| "Server error" | "The pit crew hit a snag. We'll have this fixed soon." |
| "Permission denied" | "You need pit pass clearance for this action." |

**Note**: Hot Rod theme should be optional/configurable - some operators may prefer professional tone

---

## Recommendations

### High Priority (P0)

1. **Replace Generic Messages**
   - File: `app/components/ErrorBoundary.tsx`
   - Replace "Something went wrong" with contextual messages
   - Add error codes for debugging

2. **Transform HTTP Errors**
   - File: `app/utils/error-handler.server.ts`
   - Expand `getUserFriendlyMessage()` to handle all HTTP status codes
   - Remove technical jargon from user-facing errors

3. **Improve Approval Errors**
   - File: `app/components/ApprovalCard.tsx`
   - Add specific error context
   - Provide clear recovery actions

### Medium Priority (P1)

4. **Create Error Code System**
   - Create `app/utils/error-codes.ts`
   - Define enum for all error types
   - Centralize error messages

5. **Standardize Service Errors**
   - Review all ServiceError usage
   - Ensure consistent message format
   - Add error codes to all ServiceErrors

### Low Priority (P2)

6. **Add Hot Rod AN Voice Option**
   - Create themed error messages
   - Make theme configurable per operator
   - A/B test with pilot customers

7. **Prepare i18n Structure**
   - Design translation key system
   - Create message lookup utilities
   - Document translation process

---

## Implementation Plan

### Phase 1: Fix Critical User-Facing Errors (2 hours)
- [ ] Update ErrorBoundary with better messages
- [ ] Fix ApprovalCard error messages
- [ ] Expand getUserFriendlyMessage() for HTTP errors

### Phase 2: Centralize Error Messages (2 hours)
- [ ] Create error-codes.ts enum
- [ ] Create centralized message repository
- [ ] Update all throw new Error() calls to use codes

### Phase 3: Brand Voice Integration (2 hours)
- [ ] Design Hot Rod AN error message variants
- [ ] Create theme toggle system
- [ ] Document voice guidelines

### Phase 4: i18n Preparation (2 hours)
- [ ] Design translation key structure
- [ ] Create message lookup system
- [ ] Document localization process

**Total Estimated Time**: 8 hours

---

## Files to Update

**High Priority**:
1. `app/components/ErrorBoundary.tsx` - Replace generic messages
2. `app/components/ApprovalCard.tsx` - Improve error feedback
3. `app/utils/error-handler.server.ts` - Expand HTTP error handling
4. `app/routes/approvals.$id.$idx.approve/route.tsx` - Better error messages
5. `app/routes/approvals.$id.$idx.reject/route.tsx` - Better error messages

**Medium Priority**:
6. Create `app/utils/error-codes.ts` - Error code enum
7. Create `app/utils/error-messages.ts` - Centralized messages
8. `app/services/ga/mcpClient.ts` - Standardize API errors
9. `app/utils/api-client.server.ts` - Transform HTTP errors

**Low Priority**:
10. Create `app/utils/error-messages-hotrod.ts` - Themed variants
11. Create `docs/design/error_message_voice_guide.md` - Voice guidelines

---

## Evidence

**Audit Commands**:
```bash
cd ~/HotDash/hot-dash

# Find all error messages
grep -r "error\|Error\|ERROR" app/ --include="*.tsx" --include="*.ts" | grep -i "message\|text\|title"

# Find explicit error throws
grep -r "throw new Error\|throw Error" app/ --include="*.tsx" --include="*.ts"

# Find user-facing errors
grep -r "Something went wrong\|Failed to\|Error:\|Unable to\|could not\|Cannot" app/components/ --include="*.tsx"
```

**Audit Results**:
- Total error messages found: 50+
- User-facing errors: 4 critical issues
- Technical errors: 30+ (appropriate)
- HTTP status exposures: 6 instances
- Generic messages needing improvement: 5

**Files Analyzed**:
- `app/components/ErrorBoundary.tsx`
- `app/components/ApprovalCard.tsx`
- `app/services/ga/` (3 files)
- `app/services/shopify/` (3 files)
- `app/services/chatwoot/escalations.ts`
- `app/utils/error-handler.server.ts`
- `app/utils/api-client.server.ts`
- `app/utils/env.server.ts`
- `app/routes/approvals.$id.$idx.approve/route.tsx`
- `app/routes/approvals.$id.$idx.reject/route.tsx`

---

## Next Steps

1. **Immediate**: Review this audit with @designer and @support
2. **Short-term**: Implement Phase 1 critical fixes
3. **Medium-term**: Create error code system and centralize messages
4. **Long-term**: Prepare i18n structure and Hot Rod AN voice variants

---

**Status**: ✅ TASK 9 COMPLETE - Error Message Localization Audit  
**Evidence**: This document  
**Next**: Task 10 - Help Text Localization  
**Logged**: feedback/localization.md

