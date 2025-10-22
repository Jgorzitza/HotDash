# Engineer Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
git branch --show-current  # Verify: should show manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T20:30Z  
**Version**: 8.0  
**Status**: ✅ PHASE 9 + 11 COMPLETE — Awaiting Next Assignment (NO IDLE)

---

## ✅ PHASES 1-8 COMPLETE - VERIFIED

**All Previous Work Complete** (from feedback/engineer/2025-10-21.md):
- ✅ Phase 1: Approval Queue Foundation
- ✅ Phase 2: P0 Fixes (10 issues resolved)
- ✅ Phase 3: Missing Dashboard Tiles (Idea Pool, CEO Agent, Unread Messages)
- ✅ Phase 4: Notification System (Toast, Banner, Browser, Notification Center)
- ✅ Phase 5: Real-Time Features (SSE, Live Badge, Tile Refresh Indicators)
- ✅ Phase 6: Settings & Personalization (Drag & Drop, Theme, Tile Visibility)
- ✅ Phase 7-8: Growth Analytics UI (Social, SEO, Ads, Growth tiles with Chart.js)

**Total Output**: 45 files changed, ~6,200 lines added, all builds passing, TypeScript clean

**Phase 7-8 Status**: COMPLETE — Awaiting Designer validation (commits: ffa0bc6, 61fe5b1)

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Agent Orchestration Model
- **Front-End Agents**: Customer-Front (CX triage), CEO-Front (business intelligence)
- **Sub-Agents**: Accounts (orders, refunds), Storefront (inventory, products)
- **Specialist Agents**: Analytics, Inventory, Content/SEO, Risk (run in background to keep data fresh)
- **Pre-Generation + HITL**: Agents work in background (pre-generate replies, suggestions, insights) → idle until operator approval

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/engineer/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/engineer/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**Enforcement**: CI fails if evidence missing, heartbeat stale, or Dev MCP in prod

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## ✅ PHASE 9: PII Card Component (3 hours) — COMPLETE (2025-10-21)

**Completion**: 2025-10-21T22:55Z (6 hours session)  
**Scope**: ENG-029, ENG-030 delivered; ENG-031 deferred (CEO approved)

### Completed Work

**1. ENG-029: PII Redaction Utility** ✅ COMPLETE
- File: `app/utils/pii-redaction.ts` (178 lines)
- Tests: `tests/unit/pii-redaction.spec.ts` (167 lines, 13/13 passing ✅)
- Functions: maskEmail, maskPhone, maskAddress, maskOrderId, maskTracking, redactCustomerInfo
- Evidence: Commit d585824

**2. ENG-030: PII Card Component** ✅ COMPLETE
- File: `app/components/PIICard.tsx` (462 lines)
- Tests: `tests/unit/PIICard.spec.ts` (266 lines, 22/22 passing ✅)
- Features: Warning banner, operator-only display, copy-to-clipboard, ARIA compliant
- Evidence: Commit d585824

**3. ENG-031: CX Escalation Modal Integration** ⏭️ DEFERRED
- Reason: Architecture mismatch (order-based PII vs multi-context Chatwoot conversations)
- Decision: CEO approved deferral to Phase 11-12
- Evidence: Commit dad6ae4

### Context (Original)
**Growth Engine Handoff Pattern**:
```
Customer → Customer-Front (triage)
         → Sub-agent executes (Accounts/Storefront)
         → Returns structured JSON
         → Front agent composes reply (PII Broker enforces redaction)
         → Operator reviews:
            - PII Card (operator-only): Full details
            - Public Reply (redacted): NO email/phone/address
         → HITL approval → sent via Chatwoot
```

**Security Model**: PII Broker enforces split between public reply (redacted) and operator-only details (PII Card)

---

---

## ✅ PHASE 11: Action Attribution (2 hours) — COMPLETE (2025-10-21)

**Completion**: 2025-10-21T22:55Z  
**Scope**: ENG-032, ENG-033 delivered (both P0 CRITICAL per direction)

### Completed Work

**4. ENG-033: GA4 Event Emission** ✅ COMPLETE
- File: `app/utils/analytics.ts` (286 lines)
- Tests: `tests/unit/analytics.spec.ts` (123 lines, 10/10 passing ✅)
- Functions: trackEvent, trackPageView, trackAddToCart, trackBeginCheckout, trackPurchase
- Action key: set, get, clear, 24h TTL, URL param initialization
- Evidence: Commit 3b39b60

**5. ENG-032: Action Queue Card** ✅ COMPLETE
- File: `app/components/ActionQueueCard.tsx` (295 lines)
- Tests: `tests/unit/ActionQueueCard.spec.tsx` (135 lines, 16/16 passing ✅)
- Features: Attribution tracking, sessionStorage, "📊 Tracked" badge, ROI display
- Created from scratch (direction said UPDATE but component didn't exist)
- Evidence: Commits 60a9402, d1b2274

---

## ✅ BLOCKER-003: Test Auth Setup — COMPLETE (2025-10-21)

**6. Test Auth Documentation** ✅ COMPLETE
- File: `docs/runbooks/test-auth-setup.md` (280 lines)
- Fixed: `app/routes/settings.tsx` (mock mode bypass with `?mock=1`)
- Unblocked: PILOT-006 (Settings page smoke test)
- Evidence: Commit 8be7af6

---

## ✅ P0 CRITICAL FIX: Settings Tab Navigation (2025-10-21)

**7. Settings Tabs Fix** ✅ COMPLETE (30 min)
- Issue: `<s-tabs>` web component broke navigation (stringifies objects)
- Fix: Replaced with accessible button-based tabs
- File: `app/routes/settings.tsx` (accessible navigation with ARIA)
- Evidence: Commit e86d076
- Impact: Unblocked 3 of 4 settings tabs

---

## 📊 TOTAL SESSION OUTPUT (2025-10-21, 6 hours)

**Files Created/Updated**: 10
- 4 source files (pii-redaction.ts, PIICard.tsx, analytics.ts, ActionQueueCard.tsx)
- 4 test files (61 tests total, 100% passing)
- 1 documentation (test-auth-setup.md)
- 1 critical fix (settings.tsx)

**Test Results**: 61/61 passing (100%)
**MCP Calls**: 4 (Context7 + Shopify Dev)
**Commits**: 8
**Lines**: 2,422 lines added/modified

---


## 📊 MANDATORY: Progress Reporting (Database Feedback)

**Report progress via `logDecision()` every 2 hours minimum OR at task milestones.**

### Basic Usage

```typescript
import { logDecision } from '~/services/decisions.server';

// When starting a task
await logDecision({
  scope: 'build',
  actor: 'engineer',
  taskId: '{TASK-ID}',              // Task ID from this direction file
  status: 'in_progress',            // pending | in_progress | completed | blocked | cancelled
  progressPct: 0,                   // 0-100 percentage
  action: 'task_started',
  rationale: 'Starting {task description}',
  evidenceUrl: 'docs/directions/engineer.md',
  durationEstimate: 4.0             // Estimated hours
});

// Progress update (every 2 hours)
await logDecision({
  scope: 'build',
  actor: 'engineer',
  taskId: '{TASK-ID}',
  status: 'in_progress',
  progressPct: 50,                  // Update progress
  action: 'task_progress',
  rationale: 'Component implemented, writing tests',
  evidenceUrl: 'artifacts/engineer/2025-10-22/{task}.md',
  durationActual: 2.0,              // Hours spent so far
  nextAction: 'Complete integration tests'
});

// When completed
await logDecision({
  scope: 'build',
  actor: 'engineer',
  taskId: '{TASK-ID}',
  status: 'completed',              // CRITICAL for manager queries
  progressPct: 100,
  action: 'task_completed',
  rationale: '{Task name} complete, {X}/{X} tests passing',
  evidenceUrl: 'artifacts/engineer/2025-10-22/{task}-complete.md',
  durationEstimate: 4.0,
  durationActual: 3.5,              // Compare estimate vs actual
  nextAction: 'Starting {NEXT-TASK-ID}'
});
```

### When Blocked (CRITICAL)

**Manager queries blocked tasks FIRST during consolidation**:

```typescript
await logDecision({
  scope: 'build',
  actor: 'engineer',
  taskId: '{TASK-ID}',
  status: 'blocked',                // Manager sees this in query-blocked-tasks.ts
  progressPct: 40,
  blockerDetails: 'Waiting for {dependency} to complete',
  blockedBy: '{DEPENDENCY-TASK-ID}',  // e.g., 'DATA-017', 'CREDENTIALS-GOOGLE-ADS'
  action: 'task_blocked',
  rationale: 'Cannot proceed because {reason}',
  evidenceUrl: 'feedback/engineer/2025-10-22.md'
});
```

### Manager Visibility

Manager runs these scripts to see your work instantly:
- `query-blocked-tasks.ts` - Shows if you're blocked and why
- `query-agent-status.ts` - Shows your current task and progress  
- `query-completed-today.ts` - Shows your completed work

**This is why structured logging is MANDATORY** - Manager can see status across all 17 agents in <10 seconds.

### Markdown Backup (Optional)

You can still write to `feedback/engineer/2025-10-22.md` for detailed notes, but database is the primary method.

---
## 🔧 MANDATORY: DEV MEMORY SYSTEM (Effective Immediately)

**ALL ENGINEERS MUST**: Call `logDecision()` at task completion

**Usage**:
```typescript
import { logDecision } from '~/services/decisions.server';

// At end of every task:
await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'task_completed',
  rationale: 'ENG-029: PII redaction utility implemented with 13/13 tests passing',
  evidenceUrl: 'artifacts/engineer/2025-10-21/pii-card-complete.md'
});
```

**Why**: CEO mandated "from this point on" all dev work must be logged for audit trail

**Protection**: decision_log has 100% database protection (triggers prevent delete/update, even for Prisma)

**When to Call**:
- ✅ Task completion
- ✅ Blocker discovery
- ✅ Critical fix applied
- ✅ Design decision made

**Required**: Phase 9+ work (retroactive logging not required for completed work)

---

## 🎯 ARCHIVED TASKS (For Reference)

### ENG-029: PII Redaction Utility (1h) — ✅ DELIVERED

**File**: `app/utils/pii-redaction.ts`

**Functions**:

```typescript
// Mask email: justin@hotrodan.com → j***@h***.com
export function maskEmail(email: string): string;

// Mask phone: 555-123-4567 → ***-***-4567 (last 4 only)
export function maskPhone(phone: string): string;

// Mask address: Keep city/region/country + postal prefix (first 3-4)
// "123 Main St, Los Angeles, CA 90210" → "Los Angeles, CA 902**"
export function maskAddress(address: {
  address1?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}): string;

// Mask order ID: Show last 4 only
// "#1234567890" → "#***7890"
export function maskOrderId(orderId: string): string;

// Mask tracking URL: Keep carrier + last event only
// Full URL → "UPS: Delivered Oct 20"
export function maskTracking(tracking: {
  carrier: string;
  lastEvent: string;
  url: string;
}): string;

// Full PII redaction for public reply
export interface RedactedCustomerInfo {
  orderId: string; // masked
  email: string; // masked
  phone?: string; // masked
  shippingCity: string; // city only
  shippingRegion: string; // region only
  shippingCountry: string; // country only
  trackingCarrier?: string; // carrier only
  trackingLastEvent?: string; // last event only
}

export function redactCustomerInfo(fullInfo: CustomerInfo): RedactedCustomerInfo;
```

**Tests**: `app/utils/pii-redaction.test.ts`
- Test each masking function with edge cases
- Test full redaction with complete customer object
- Verify NO full PII in redacted output

**Acceptance**:
- ✅ All masking functions implemented
- ✅ Unit tests passing (100% coverage for redaction logic)
- ✅ TypeScript types defined
- ✅ No linter errors

**MCP Required**: Context7 → TypeScript best practices for string manipulation

---

### ENG-030: PII Card Component (2h)

**File**: `app/components/PIICard.tsx`

**Purpose**: Display full customer details (operator-only, NOT sent to customer)

**Fields to Display**:

```typescript
interface PIICardProps {
  orderId: string; // Full: "#1234567890"
  orderStatus: string; // e.g., "fulfilled"
  fulfillmentStatus: string; // e.g., "shipped"
  
  // Customer Details
  email: string; // Full: justin@hotrodan.com
  phone?: string; // Full: 555-123-4567
  
  // Shipping Address (Full)
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  
  // Tracking (Full)
  tracking?: {
    carrier: string;
    number: string;
    url: string;
    lastEvent: string;
    lastEventDate: string;
  };
  
  // Line Items
  lineItems: Array<{
    title: string;
    sku: string;
    quantity: number;
    price: string;
  }>;
}
```

**Design Requirements**:
- **Polaris Card** with warning banner: "⚠️ OPERATOR ONLY — NOT SENT TO CUSTOMER"
- **Color**: Yellow banner (`tone="warning"`)
- **Sections**:
  1. Order Details (ID, status, fulfillment status)
  2. Customer Contact (email, phone with copy buttons)
  3. Shipping Address (full address with copy button)
  4. Tracking (carrier, number, URL link, last event)
  5. Line Items (DataTable with title, SKU, qty, price)

**Polaris Components**:
- `Card`, `Banner`, `Text`, `InlineStack`, `BlockStack`, `Button` (copy), `Link`, `DataTable`

**Accessibility**:
- ARIA label: `aria-label="Customer PII - Operator Only"`
- Warning banner with `role="alert"`
- Copy buttons with descriptive labels: "Copy email", "Copy phone", "Copy address"

**Tests**: `app/components/PIICard.test.tsx`
- Renders all customer details correctly
- Warning banner present
- Copy buttons functional
- Tracking link opens in new tab
- Line items table renders correctly

**Acceptance**:
- ✅ PIICard component implemented with all fields
- ✅ Warning banner prominent and accessible
- ✅ Copy functionality working for email/phone/address
- ✅ Unit tests passing (component rendering + interactions)
- ✅ No linter errors

**MCP Required**: 
- Shopify Dev MCP → Polaris Card, Banner, DataTable, Button components + validate with `validate_component_codeblocks`

---

### ENG-031: CX Escalation Modal Integration — ⏸️ DEFERRED TO PHASE 11-12

**Status**: DEFERRED (Architecture Decision Required)

**Why Deferred**: Architecture mismatch between order-based PII Card and Chatwoot's multi-context conversations

**The Problem**:
- PII Card designed for order inquiries (requires: orderId, shipping address, tracking, line items)
- Chatwoot conversations span multiple contexts:
  - **Order-based CX** (30-40%): "Where's my order #1234?" → ✅ Has orderId, can use PII Card
  - **Non-order CX** (60-70%): "Do you ship to Canada?", "Is this in stock?" → ❌ No orderId, PII Card would crash
- Current CX Escalation Modal design assumes all conversations have order context (they don't)

**Architectural Options** (decision deferred to Phase 11-12):
- **Option A**: Conditional display (show PII Card only if order context exists)
- **Option B**: Separate modals (CX Escalation for general, Order Inquiry for order-based)
- **Option C**: Generic Customer Context (redesign PII Card to handle both order and non-order scenarios)

**When to Resolve**: Phase 11-12 (Customer-Front Agent implementation)
- Will clarify conversation handoff patterns (transfer_to_accounts vs transfer_to_storefront)
- Can make informed architectural decision with full context understanding

**What's Already Built** (still valuable):
- ✅ ENG-029: PII redaction utility (works for both scenarios)
- ✅ ENG-030: PII Card component (can be integrated once architecture resolved)

**Next Steps** (Phase 11-12):
1. Build Customer-Front Agent and understand conversation patterns
2. Choose Option A, B, or C based on actual usage patterns
3. Implement CX Escalation Modal integration with chosen architecture
4. Test with both order-based and non-order conversations

---

## 🔄 PHASE 11: Action Attribution Client Tracking (2 hours) — P0 CRITICAL

**Objective**: Enable GA4 action attribution for measuring ROI of approved actions

**Priority**: P0 (CEO stated this is CRITICAL, not nice-to-have)

### Context
**Action Queue → GA4 Attribution Flow**:
```
1. Action approved → action_key generated: "seo-fix-powder-board-2025-10-21"
2. CEO clicks link from approved action → lands on product page
3. Client emits GA4 event with hd_action_key custom dimension
4. Track: page_view, add_to_cart, begin_checkout, purchase
5. Analytics service queries GA4 (7d/14d/28d windows) → realized ROI
6. Action Queue re-ranks based on proven performance
```

**GA4 Custom Dimension**: `hd_action_key` (event scope) — already configured by DevOps in Property 339826228

---

### ENG-032: Action Link Click Handler (1h)

**File**: `app/components/ActionQueueCard.tsx` (existing file - UPDATE)

**Current State**: Action cards display recommendations

**Required Changes**:

1. **Add action_key to URL params** when user clicks action link:
   ```typescript
   // When action card clicked:
   const actionUrl = new URL(action.target_url);
   actionUrl.searchParams.set('hd_action', action.action_key);
   // Result: /products/powder-boards?hd_action=seo-fix-powder-board-2025-10-21
   ```

2. **Store action_key in session**:
   ```typescript
   // On link click:
   sessionStorage.setItem('hd_current_action', action.action_key);
   // Expires: 24 hours or session end
   ```

3. **Add visual indicator** on action cards:
   - Badge: "📊 Tracked" for actions with attribution enabled
   - Tooltip: "ROI tracked via GA4 for 28 days"

**Tests**: `app/components/ActionQueueCard.test.tsx` (UPDATE)
- Action link includes `hd_action` param
- Session storage set on click
- Badge renders for tracked actions

**Acceptance**:
- ✅ Action links include `hd_action` URL param
- ✅ Session storage persists action_key
- ✅ Visual indicator present
- ✅ Tests passing

**MCP Required**: Context7 → React hooks (useState, useEffect) for session storage

---

### ENG-033: GA4 Event Emission with Action Key (1h)

**File**: `app/utils/analytics.ts` (existing file - UPDATE)

**Current State**: Basic GA4 page_view tracking

**Required Changes**:

1. **Extend gtag wrapper** to include `hd_action_key`:
   ```typescript
   export function trackEvent(
     eventName: 'page_view' | 'add_to_cart' | 'begin_checkout' | 'purchase',
     params?: Record<string, any>
   ) {
     // Check for active action
     const actionKey = sessionStorage.getItem('hd_current_action');
     
     if (actionKey) {
       gtag('event', eventName, {
         ...params,
         hd_action_key: actionKey, // Custom dimension
       });
     } else {
       gtag('event', eventName, params);
     }
   }
   ```

2. **Add to critical conversion events**:
   - **page_view**: On every page load (if action_key present)
   - **add_to_cart**: Product added to cart (product page, collection page)
   - **begin_checkout**: Checkout initiated
   - **purchase**: Order completed

3. **Clear action_key** after 24 hours or purchase:
   ```typescript
   // After purchase event:
   sessionStorage.removeItem('hd_current_action');
   ```

4. **Debug mode** (dev only):
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     console.log('[GA4] Event:', eventName, 'Action Key:', actionKey);
   }
   ```

**Integration Points**:
- `app/routes/_app.dashboard.tsx` - page_view
- `app/routes/_app.products.$handle.tsx` - add_to_cart
- `app/routes/_app.cart.tsx` - begin_checkout
- `app/routes/_app.checkout.thank-you.tsx` - purchase

**Tests**: `app/utils/analytics.test.ts` (UPDATE)
- trackEvent includes `hd_action_key` when session storage set
- trackEvent excludes `hd_action_key` when not set
- Action key cleared after purchase
- Debug logs in dev mode only

**Acceptance**:
- ✅ GA4 events include `hd_action_key` custom dimension
- ✅ All 4 conversion events instrumented
- ✅ Session storage cleared after purchase
- ✅ Tests passing
- ✅ Verified in GA4 DebugView (dev environment)

**MCP Required**: 
- Context7 → Google Analytics 4 event tracking API
- Web search → "GA4 custom dimensions event scope implementation" (if needed)

---

## 📋 Acceptance Criteria (Phase 9 + 11)

### Phase 9: PII Card (4h)
- ✅ `app/utils/pii-redaction.ts` implemented with all masking functions
- ✅ `app/components/PIICard.tsx` implemented with warning banner
- ✅ `CXEscalationModal.tsx` updated with split UI (public reply + PII Card)
- ✅ All unit tests passing (redaction + component + modal)
- ✅ No full PII in public replies (validation enforced)
- ✅ Designer validated UI/UX
- ✅ TypeScript clean, no linter errors

### Phase 11: Action Attribution (2h)
- ✅ Action links include `hd_action` URL param
- ✅ Session storage persists action_key (24h TTL)
- ✅ GA4 events emit `hd_action_key` custom dimension (page_view, add_to_cart, begin_checkout, purchase)
- ✅ Action key cleared after purchase
- ✅ All unit tests passing
- ✅ Verified in GA4 DebugView (dev environment)
- ✅ TypeScript clean, no linter errors

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Shopify Dev MCP**: FIRST for all Shopify/Polaris
   - Polaris components (Card, Banner, DataTable, Tabs, Layout, Button, etc.)
   - `validate_component_codeblocks` for Polaris components (REQUIRED)
   - `validate_graphql_codeblocks` if fetching customer data

2. **Context7 MCP**: For non-Shopify libraries
   - React Router 7 data loading patterns
   - TypeScript best practices
   - Google Analytics 4 API
   - Chart.js (if needed)

3. **Web Search**: LAST RESORT ONLY if neither MCP has the info
   - Example: "GA4 custom dimensions event scope" (if Context7 doesn't have)

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/engineer/<date>/mcp/pii-card.jsonl` and `mcp/ga4-attribution.jsonl`
2. **Heartbeat NDJSON**: `artifacts/engineer/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/` before PR
4. **PR Template**: Fill out all sections (MCP Evidence + Heartbeat + Dev MCP Check)

### React Router 7 Enforcement
- ✅ Use `Response.json()` NOT `json()` (Manager fixed violation in commit 19c09b3)
- ✅ NO `@remix-run` imports (verify with `rg "@remix-run" app/`)
- ✅ Loaders return `Response` objects

### Testing
- Run `npm run test` after each task
- Fix any test failures immediately
- Ensure 100% pass rate before PR

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **ENG-029**: PII Redaction Utility (1h) → START IMMEDIATELY
   - Pull Context7: TypeScript string manipulation
   - Implement masking functions
   - Write unit tests
   - Verify 100% test pass

2. **ENG-030**: PII Card Component (2h)
   - Pull Context7: Polaris Card, Banner, DataTable
   - Implement PIICard.tsx
   - Write unit tests
   - Validate with Shopify Dev MCP

3. **ENG-031**: CX Escalation Modal Integration (1h)
   - Pull Context7: React Router 7 data loading
   - Update CXEscalationModal.tsx (split UI)
   - Integrate redaction utility
   - Update tests

4. **ENG-032**: Action Link Click Handler (1h)
   - Pull Context7: React hooks (session storage)
   - Update ActionQueueCard.tsx
   - Add URL param + session storage
   - Update tests

5. **ENG-033**: GA4 Event Emission (1h)
   - Pull Context7: Google Analytics 4 API
   - Update analytics.ts (custom dimension)
   - Integrate into 4 conversion events
   - Test in GA4 DebugView

**Total**: 6 hours (Phase 9: 4h, Phase 11: 2h)

**Expected Output**:
- 5 files modified (3 new, 2 updated)
- ~800-1,000 lines added
- All tests passing
- Designer validation (Phase 9 UI)
- GA4 DebugView verification (Phase 11)

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start ENG-029 immediately after reading this direction
2. **MCP FIRST**: Pull Context7 docs BEFORE every task
3. **Evidence JSONL**: Create `artifacts/engineer/2025-10-21/mcp/` directory and log every MCP call
4. **Heartbeat**: If any task >2h, append to `artifacts/engineer/2025-10-21/heartbeat.ndjson` every 15min
5. **Dev MCP Ban**: NO Dev MCP imports in `app/` (CI will fail)
6. **React Router 7**: Use `Response.json()` NOT `json()`
7. **Tests**: 100% pass rate required before PR
8. **Feedback**: Update `feedback/engineer/2025-10-21.md` every 2 hours with progress

**Questions or blockers?** → Escalate immediately in feedback with details

**Let's build! 🚀**

---

## 🔄 NEXT WORK: Designer/QA/Pilot Support (2 hours) — START NOW

**Strategic Deployment**: Phase 9 complete → Support downstream validation

### ENG-034: Designer PII Card Validation Support (1h) — P1

**Objective**: Support Designer (DES-017) with PII Card QA validation

**Work**:
- Provide walkthrough of PIICard component implementation
- Answer questions on copy-to-clipboard functionality  
- Clarify ARIA implementation for accessibility review
- Assist with any UI refinements Designer identifies

**Dependencies**: Designer starts DES-017 (now unblocked)

**Acceptance**: ✅ Designer validation complete, refinements implemented

---

### ENG-035: QA/Pilot Testing Support (1h) — P1

**Objective**: Support QA (QA-009) and Pilot (PILOT-012) with PII Card testing

**Work**:
- Clarify PII redaction test scenarios
- Provide test data examples
- Debug any test failures
- Answer questions on component behavior

**Dependencies**: QA/Pilot start Phase 9 testing (now unblocked)

**Acceptance**: ✅ QA/Pilot tests passing

---

**Total Assigned**: 2 hours (NO IDLE - support downstream agents)

---

## 🔐 DEV MEMORY: MANDATORY

Call `logDecision({ scope: 'build' })` at EVERY task completion:
```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'task_completed',
  rationale: 'ENG-034: Supported Designer PII Card validation',
  evidenceUrl: 'artifacts/engineer/2025-10-21/designer-support.md'
});
```
