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
**Effective**: 2025-10-21T15:50Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 9 PII Card Component (Growth Engine)

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

## 🚀 PHASE 9: Customer-Front Agent + PII Card (4 hours) — P0 PRIORITY

**Objective**: Build PII Card component to enable redacted public replies with operator-only full customer details

### Context
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

### ENG-029: PII Redaction Utility (1h)

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
- Context7 → Polaris Card, Banner, DataTable, Button components
- Shopify Dev MCP → validate component usage with `validate_component_codeblocks`

---

### ENG-031: CX Escalation Modal Integration (1h)

**File**: `app/components/modals/CXEscalationModal.tsx` (existing file - UPDATE)

**Current State**: Single modal with draft reply only

**Required Changes**:

1. **Split UI into 2 sections** (side-by-side or tabs):
   - **Left/Top**: Public Reply (redacted) — sent to customer
   - **Right/Bottom**: PII Card (full details) — operator-only reference

2. **Update data flow**:
   ```typescript
   // Fetch full customer data from Shopify
   const fullCustomerData = await fetchCustomerDetails(orderId);
   
   // Generate redacted version for public reply
   const redactedData = redactCustomerInfo(fullCustomerData);
   
   // Display both:
   // - Draft reply uses redactedData (masked)
   // - PII Card uses fullCustomerData (full details)
   ```

3. **Layout**:
   - **Option A** (Side-by-side):
     ```
     |--------------------------|--------------------------|
     | Public Reply (Redacted)  | PII Card (Full Details) |
     | [Draft text area]        | [PIICard component]      |
     | [Preview with masked]    | [Warning banner]         |
     | [Approve/Reject buttons] | [All customer PII]       |
     |--------------------------|--------------------------|
     ```
   
   - **Option B** (Tabs):
     ```
     [Public Reply] [PII Card (Operator Only)]
     |------------------------------------------------|
     | [Active tab content]                          |
     |------------------------------------------------|
     ```

4. **Validation**:
   - Before sending, verify NO full PII in public reply text
   - Check: No unmasked email/phone/address in draft
   - Warning if PII detected: "⚠️ Full PII detected in public reply. Use masked version."

**Tests**: `app/components/modals/CXEscalationModal.test.tsx` (UPDATE)
- Public reply shows redacted data only
- PII Card shows full details
- Validation catches unmasked PII in draft
- Approve button sends redacted reply only
- PII Card NOT included in outbound message

**Acceptance**:
- ✅ Modal split into public reply + PII Card sections
- ✅ Redaction utility integrated
- ✅ Validation prevents full PII in public reply
- ✅ Tests updated and passing
- ✅ Designer validated UI/UX

**MCP Required**: 
- Context7 → React Router 7 data loading patterns
- Context7 → Polaris Layout, Tabs components

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
1. **Context7 MCP**: Pull docs BEFORE coding
   - React Router 7 data loading patterns
   - Polaris components (Card, Banner, DataTable, Tabs, Layout)
   - TypeScript best practices
   - Google Analytics 4 API

2. **Shopify Dev MCP**: Validate all Shopify code
   - `validate_component_codeblocks` for Polaris components
   - `validate_graphql_codeblocks` if fetching customer data

3. **Web Search**: Use for GA4 implementation details if Context7 doesn't have
   - "GA4 custom dimensions event scope"
   - "GA4 DebugView testing"

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
