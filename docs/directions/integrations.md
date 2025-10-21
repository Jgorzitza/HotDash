# Integrations Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:01Z  
**Version**: 5.2  
**Status**: ACTIVE — Phase 12 Publer Integration + API Rate Limiting

---

## Objective

**Build Publer integration for HITL social posting + Rate limiting for all APIs**

---

## MANDATORY MCP USAGE

```bash
# Publer API documentation
mcp_context7_resolve-library-id("Publer API")
# If not in Context7, use web_search:
web_search("Publer API official documentation authentication")

# TypeScript async patterns
mcp_context7_get-library-docs("/microsoft/TypeScript", "async await promises error handling")

# React Router 7 API routes
mcp_context7_get-library-docs("/websites/reactrouter", "API routes actions loaders")
```

---

## ACTIVE TASKS (9h total)

### INTEGRATIONS-001: Publer API Client (3h) - START NOW

**Requirements**:
- OAuth authentication with Publer
- Post scheduling API
- Account info fetch
- Error handling + retry logic

**MCP Required**: Pull Publer API docs OR web_search if not in Context7

**Implementation**:

**File**: `app/services/publer/client.ts` (new)
```typescript
// OAuth flow
// Post scheduling
// Account management
// Rate limiting
```

**File**: `app/services/publer/types.ts` (new)
- Type definitions for Publer API responses

**Credentials**: `vault/occ/publer/api_token.env` (check first)

**Deliverables**:
- Publer client service
- OAuth flow working
- Test with real account
- Error handling comprehensive

**Time**: 3 hours

---

### INTEGRATIONS-002: Publer Adapter (2h)

**Requirements**:
- HITL approval integration
- Draft → Pending → Approved → Published flow
- Store Publer receipt in social_posts table

**Implementation**:

**File**: `app/services/publer/adapter.ts` (new)
- Convert approval to Publer post format
- Handle scheduling
- Store receipt

**File**: `app/routes/api.social.publish.ts` (new)
- POST endpoint for publishing approved posts
- Validate approval exists
- Call Publer API
- Update social_posts.status

**Time**: 2 hours

---

### INTEGRATIONS-003: Social Post Queue (2h)

**Requirements**:
- Queue management for pending posts
- Retry failed posts
- Status tracking

**File**: `app/services/social/queue.ts` (new)

**Time**: 2 hours

---

### INTEGRATIONS-004: API Rate Limiting (2h)

**Requirements**:
- Rate limiting for Shopify, Publer, Chatwoot APIs
- Exponential backoff on 429 responses
- Queue requests if rate limited

**File**: `app/lib/rate-limiter.ts` (new)

**MCP Required**: TypeScript async patterns

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: Context7 for TypeScript, web_search for Publer API

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Integrations: Publer Client

**Working On**: INTEGRATIONS-001 (Publer API Client)
**Progress**: 60% - OAuth working, post scheduling testing

**Evidence**:
- File: app/services/publer/client.ts (187 lines)
- MCP: web_search for Publer API docs (official site)
- OAuth: Successfully authenticated with test account
- Test post: Scheduled successfully to draft queue

**Blockers**: None
**Next**: Error handling, retry logic, type definitions
```

---

**START WITH**: INTEGRATIONS-001 (Publer client) - Pull docs/web_search NOW

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
