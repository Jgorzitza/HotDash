# QA Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T17:05Z  
**Version**: 7.0  
**Status**: ACTIVE — Phase 9-12 Testing (Growth Engine)

---

## ✅ QA-001 COMPLETE

**Completed** (from feedback/qa/2025-10-21.md):
- ✅ QA-001: Code verification (React Router 7, Shopify GraphQL, security, TypeScript)
- **Found**: 1 TypeScript error (`app/services/seo/content-optimizer.ts:549` - unterminated string)
- **Pending**: Engineer fix required

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/qa/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/qa/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 ACTIVE TASKS: Phase 9-12 Testing (14 hours) — NO STANDBY

**Objective**: Validate all Growth Engine features as agents complete implementation

---

### QA-019: Phase 9 PII Card Testing (3h)

**Prerequisites**: Engineer completes ENG-029, 030, 031 + Designer validates DES-017

**Test Areas**:

1. **PII Redaction Utility** (30min):
   - Test email masking: `justin@hotrodan.com` → `j***@h***.com` ✅
   - Test phone masking: `555-123-4567` → `***-***-4567` ✅
   - Test address masking: City/region/country + postal prefix only ✅
   - Test order ID masking: Last 4 only ✅
   - Test tracking masking: Carrier + last event (no full URL) ✅
   - Edge cases: Empty strings, null values, special characters

2. **PII Card Component** (1h):
   - Warning banner visible and prominent ✅
   - Full customer details visible (not masked) ✅
   - Copy buttons functional (email, phone, address) ✅
   - Tracking URL opens in new tab ✅
   - Line items table renders correctly ✅
   - Accessibility: Keyboard nav, screen reader, ARIA labels ✅

3. **CX Escalation Modal Split UI** (1h):
   - Public reply shows redacted data only ✅
   - PII Card shows full details ✅
   - Validation catches unmasked PII in draft ✅
   - Approve button disabled if PII detected ✅
   - Modal accessible (focus management, Escape closes) ✅

4. **Security** (30min):
   - PII Card NOT sent to customer (verify API payloads) ✅
   - Public reply contains NO full PII ✅
   - Validation logic cannot be bypassed ✅

**Deliverable**: `artifacts/qa/phase-9-pii-card-test-results.md`

**MCP Required**: 
- Shopify Dev MCP → Polaris component validation
- Context7 → React testing patterns

**Acceptance**:
- ✅ All test cases executed
- ✅ No PII leaks found
- ✅ All accessibility tests passing
- ✅ Issues documented with severity
- ✅ Test report comprehensive

---

### QA-020: Phase 10 Vendor/ALC Testing (4h)

**Prerequisites**: Data (DATA-017, 018), Inventory (INVENTORY-016, 017, 018), Integrations (INTEGRATIONS-012) complete

**Test Areas**:

1. **Vendor Master** (1h):
   - Create vendor with all fields ✅
   - Reliability score calculated correctly ✅
   - Multi-SKU mapping works ✅
   - Vendor dropdown shows reliability + lead time + cost ✅
   - Soft delete works (is_active = FALSE) ✅

2. **ALC Calculation** (1h):
   - Test weighted average (includes previous inventory) ✅
   - Test freight distribution BY WEIGHT ✅
   - Test duty distribution BY WEIGHT ✅
   - Test cost history snapshots (before/after) ✅
   - Edge cases: First receipt (no previous), zero weight

3. **Shopify Cost Sync** (1h):
   - ALC pushed to Shopify `inventoryItem.unitCost` ✅
   - Shopify admin shows correct cost ✅
   - Batch updates work (multiple variants) ✅
   - Rate limiting enforced (500ms between requests) ✅
   - Error handling (userErrors, network failures) ✅

4. **Receiving Workflow** (1h):
   - PO receipt form submits correctly ✅
   - Item cost prefilled from PO (editable) ✅
   - Freight/duty inputs work ✅
   - ALC calculated correctly ✅
   - Vendor reliability updated ✅
   - Decision logged ✅

**Deliverable**: `artifacts/qa/phase-10-vendor-alc-test-results.md`

**Acceptance**:
- ✅ All test cases executed
- ✅ ALC calculations verified accurate
- ✅ Shopify sync verified
- ✅ Test report comprehensive

---

### QA-021: Phase 10 CI Guards Testing (2h)

**Prerequisites**: DevOps completes DEVOPS-014

**Test Areas**:

1. **guard-mcp** (MCP Evidence Verification) (30min):
   - Create PR with missing MCP evidence → CI fails ✅
   - Create PR with invalid JSONL → CI fails ✅
   - Create PR with valid MCP evidence → CI passes ✅
   - Create PR with "non-code change" → CI passes ✅
   - Error messages clear and actionable ✅

2. **idle-guard** (Heartbeat Verification) (30min):
   - Create PR with stale heartbeat (>15min) → CI fails ✅
   - Create PR with fresh heartbeat → CI passes ✅
   - Create PR with "<2h single session" → CI passes ✅
   - Error messages clear ✅

3. **dev-mcp-ban** (Production Safety) (30min):
   - Add Dev MCP import to `app/test.ts` → CI fails ✅
   - Remove import → CI passes ✅
   - Dev MCP in `scripts/` → CI passes (allowed) ✅
   - Error message clear and actionable ✅

4. **Integration** (30min):
   - All 3 guards run in deploy-staging.yml ✅
   - Guards run BEFORE deployment ✅
   - Deployment blocked if any guard fails ✅

**Deliverable**: `artifacts/qa/phase-10-ci-guards-test-results.md`

**Acceptance**:
- ✅ All 3 guards tested
- ✅ All test cases passing
- ✅ Error messages verified
- ✅ Integration with deploy workflow verified

---

### QA-022: Phase 11 Bundles-BOM Testing (2h)

**Prerequisites**: Integrations completes INTEGRATIONS-013, 014

**Test Areas**:

1. **Metafield Definitions** (30min):
   - BOM components metafield created ✅
   - is_component metafield created ✅
   - JSON schema validation works ✅

2. **Virtual Bundle Stock** (30min):
   - Calculate stock from BOM components ✅
   - Limiting component identified correctly ✅
   - Stock updates when component sold ✅

3. **Component Decrement** (30min):
   - Bundle sold → components decremented ✅
   - Correct variants decremented (parameterized) ✅
   - Qty correct (component_qty × bundle_qty) ✅

4. **Backward Compatibility** (30min):
   - Bundles with tags still work (picker payouts) ✅
   - Bundles with metafields work (inventory) ✅
   - Dual system works (tags + metafields) ✅

**Deliverable**: `artifacts/qa/phase-11-bundles-bom-test-results.md`

**Acceptance**:
- ✅ All test cases executed
- ✅ Virtual stock calculation verified
- ✅ Component decrement verified
- ✅ Backward compat verified

---

### QA-023: Phase 11 Action Attribution Testing (2h)

**Prerequisites**: DevOps (DEVOPS-015), Engineer (ENG-032, 033), Analytics (ANALYTICS-017) complete

**Test Areas**:

1. **GA4 Custom Dimension** (30min):
   - Dimension created in Property 339826228 ✅
   - Event scope configured ✅
   - Test event visible in DebugView ✅

2. **Client Tracking** (30min):
   - Action link includes `hd_action` param ✅
   - Session storage persists action_key ✅
   - gtag emits `hd_action_key` on page_view ✅
   - gtag emits on add_to_cart, begin_checkout, purchase ✅

3. **Attribution Service** (30min):
   - Query GA4 Data API for action_key ✅
   - Returns sessions, revenue, conversions ✅
   - Updates action record with realized ROI ✅
   - Re-ranks Action Queue (realized ROI priority) ✅

4. **End-to-End** (30min):
   - Approve action → action_key generated ✅
   - Click link → lands on page with param ✅
   - Make purchase → tracked in GA4 ✅
   - Nightly job updates attribution ✅
   - Action Queue re-ranked ✅

**Deliverable**: `artifacts/qa/phase-11-action-attribution-test-results.md`

**Acceptance**:
- ✅ All test cases executed
- ✅ GA4 tracking verified in DebugView
- ✅ Attribution calculation verified
- ✅ End-to-end flow works

---

### QA-024: Phase 12 CX → Product Loop Testing (1h)

**Prerequisites**: AI-Knowledge (AI-KNOWLEDGE-017, 018), Product (PRODUCT-015) complete

**Test Areas**:

1. **PII Sanitization** (15min):
   - Conversations sanitized (NO PII) ✅
   - Embeddings contain NO PII ✅
   - All 5 PII types removed (email, phone, address, postal, CC) ✅

2. **Theme Detection** (15min):
   - Recurring themes detected (min 3 occurrences) ✅
   - Product mentions extracted ✅
   - Similarity search works ✅

3. **Action Generation** (15min):
   - Themes converted to Action cards ✅
   - Draft copy generated (templates correct) ✅
   - Evidence included (customer queries) ✅

4. **End-to-End** (15min):
   - Nightly job runs ✅
   - Actions added to queue ✅
   - Operator can approve/reject ✅

**Deliverable**: `artifacts/qa/phase-12-cx-product-loop-test-results.md`

**Acceptance**:
- ✅ All test cases executed
- ✅ NO PII in embeddings verified
- ✅ Theme detection working
- ✅ Action generation working

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 9-12 Testing (14h)
- ✅ QA-019: Phase 9 PII Card testing (3h)
- ✅ QA-020: Phase 10 Vendor/ALC testing (4h)
- ✅ QA-021: Phase 10 CI Guards testing (2h)
- ✅ QA-022: Phase 11 Bundles-BOM testing (2h)
- ✅ QA-023: Phase 11 Action Attribution testing (2h)
- ✅ QA-024: Phase 12 CX → Product Loop testing (1h)
- ✅ All test reports comprehensive
- ✅ All issues documented with severity
- ✅ All test evidence saved to artifacts/

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Shopify Dev MCP**: For Polaris + Shopify testing
   - Validate components
   - Test GraphQL mutations

2. **Context7 MCP**: For library patterns
   - React testing patterns
   - Prisma query testing

3. **Chrome DevTools MCP**: For UI testing
   - Screenshots
   - Accessibility audit

4. **Web Search**: LAST RESORT ONLY

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/qa/<date>/mcp/phase-9-12-testing.jsonl`
2. **Heartbeat NDJSON**: `artifacts/qa/<date>/heartbeat.ndjson` (append every 15min if >2h)
3. **Test Reports**: Save all to `artifacts/qa/`
4. **PR Template**: Fill out all sections

---

## 🎯 Execution Order

**Reactive (Based on Agent Completion)**:

1. **QA-019**: Phase 9 PII Card Testing (3h) → When Engineer + Designer complete
2. **QA-020**: Phase 10 Vendor/ALC Testing (4h) → When Data + Inventory + Integrations complete
3. **QA-021**: Phase 10 CI Guards Testing (2h) → When DevOps completes DEVOPS-014
4. **QA-022**: Phase 11 Bundles-BOM Testing (2h) → When Integrations completes INTEGRATIONS-013, 014
5. **QA-023**: Phase 11 Action Attribution Testing (2h) → When DevOps + Engineer + Analytics complete
6. **QA-024**: Phase 12 CX Loop Testing (1h) → When AI-Knowledge + Product complete

**Total**: 14 hours (spread across Phases 9-12)

**Expected Output**:
- 6 comprehensive test reports (~300-500 lines each)
- 100+ test cases executed
- All issues documented with severity
- Evidence saved to artifacts/

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start testing immediately when prerequisites complete
2. **MCP FIRST**: Pull docs BEFORE testing
3. **Evidence**: Create `artifacts/qa/2025-10-21/` and save all test reports
4. **Thorough**: Test ALL cases (happy path + edge cases + error handling)
5. **Security Priority**: PII testing is CRITICAL (verify NO leaks)
6. **Feedback**: Update `feedback/qa/2025-10-21.md` every 2 hours

**Questions or blockers?** → Escalate immediately in feedback

**Let's test! ✅**

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'qa',
  action: 'task_completed',
  rationale: 'Task description with test results',
  evidenceUrl: 'artifacts/qa/2025-10-21/task-complete.md'
});
```

Call at EVERY task completion. 100% DB protection active.
