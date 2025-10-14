---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---
# QA — Direction (Operator Control Center)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md
- Manager Feedback: feedback/manager.md (check for latest assignments)

## 🎉 P0 COMPLETE: Shopify App Testing (2025-10-13)

**Status**: ✅ ALL INITIAL TESTING COMPLETE
- 6/6 tiles verified working
- Test plans prepared (50+ test cases)
- Installation validated
- Performance baselines established

---

## 🚨 P1 UPCOMING: Test New Features (2025-10-13)

**Status**: WAITING ON FEATURE IMPLEMENTATION
**Your work blocked until Engineer completes new features**

### Task Q1: Chatwoot Email Integration Testing (WAITING)

**Dependency**: Chatwoot + Engineer complete (est. 2025-10-14T20:00:00Z)

**When Ready**:
1. **Email Receiving Test**:
   - Send test email to customer.support@hotrodan.com
   - Verify appears in Chatwoot as conversation
   - Check threading/formatting

2. **Email Sending Test**:
   - Reply from Chatwoot
   - Verify recipient receives from customer.support@hotrodan.com
   - Check email signature

3. **Live Chat Widget Test**:
   - Load dev store in browser
   - Verify widget appears bottom right
   - Test chat functionality
   - Mobile responsive check

4. **Edge Cases**:
   - Long email threads
   - Attachments (if supported)
   - HTML vs plain text
   - Special characters

**MCP Tools**: None required (manual testing)

**Timeline**: 2 hours
**Evidence**: Test report in docs/qa/chatwoot_email_test_report.md

---

### Task Q2: Picker Payment System Testing (WAITING)

**Dependency**: Data + Integrations + Engineer complete (est. 2025-10-16T18:00:00Z)

**When Ready**:
1. **Database Verification**:
   - Use Supabase MCP to verify schema
   - Check RLS policies active
   - Validate views return data

2. **Admin UI Testing**:
   - Test picker balance display
   - Test order assignment
   - Test payment recording
   - Test product picker_quantity editing

3. **Calculation Testing**:
   - Verify piece counts correct (BUNDLE, PACK, DROPSHIP tags)
   - Verify payment tiers (1-4=$2, 5-10=$4, 11+=$7)
   - Test edge cases (0 pieces, 100+ pieces)

4. **Data Integrity**:
   - Verify balances calculate correctly
   - Test payment history accuracy
   - Check audit trail

**MCP Tools**:
- ✅ Supabase MCP: mcp_supabase_list_tables (verify schema)
- ✅ Supabase MCP: mcp_supabase_get_advisors (check RLS)

**Timeline**: 4 hours
**Evidence**: Test report in docs/qa/picker_payment_test_report.md

---

### Task Q3: SEO Pulse Refinement Testing (WAITING)

**Dependency**: Engineer completes refinement (est. 2025-10-17T12:00:00Z)

**When Ready**:
1. **Visual Hierarchy**:
   - Verify only anomalies shown (not all 100 pages)
   - Check color coding (red/green/gray)
   - Verify icons (arrows) display
   - Test empty state

2. **Data Accuracy**:
   - Verify WoW percentages correct
   - Compare against GA dashboard
   - Test calculation edge cases

3. **Responsive Design**:
   - Desktop: 5-10 items
   - Mobile: 3-5 items
   - Tablet: Test in between

4. **Accessibility**:
   - Screen reader test
   - Keyboard navigation
   - Color contrast (4.5:1 minimum)

**MCP Tools**: None (manual UI testing)

**Timeline**: 2 hours
**Evidence**: Test report in docs/qa/seo_pulse_refinement_test_report.md

---

## Current Status Summary

**Completed** ✅:
- Initial Shopify app testing (6 tiles)
- Test infrastructure setup
- Baseline performance metrics

**Upcoming** ⏳:
- Q1: Chatwoot email (2h - after Chatwoot + Engineer)
- Q2: Picker payments (4h - after Data + Integrations + Engineer)
- Q3: SEO Pulse (2h - after Designer + Data + Engineer)

**Estimated Timeline**: Q1 in 2 days, Q2 in 4 days, Q3 in 5 days

---

## MCP Tools Requirements

**For Database Testing**:
- ✅ Supabase MCP: mcp_supabase_list_tables
- ✅ Supabase MCP: mcp_supabase_get_advisors (RLS validation)

**For Shopify Validation** (if needed):
- ✅ Shopify MCP: mcp_shopify_validate_graphql_codeblocks

## Evidence Gate

Every test must log in feedback/qa.md:
- Timestamp (YYYY-MM-DDTHH:MM:SSZ)
- Feature tested
- Test results (pass/fail with details)
- Screenshots
- Issues found (with severity)
- Test report path

## Coordination

- **Chatwoot**: Notifies when email ready for testing
- **Engineer**: Notifies when each feature deployed
- **Data**: Provides expected calculation logic
- **Manager**: Monitors progress in daily standups


---

## 🚨 UPDATED PRIORITY (2025-10-13T22:47:00Z) — Manager Assignment

**Status**: Agent launch checklist complete ✅  
**New Assignment**: End-to-End Testing & Quality Assurance

### P0: End-to-End Test Suite (4-5 hours)

**Goal**: Comprehensive E2E tests for critical user flows

**Tasks**:
1. **CEO Dashboard Flow**
   - Login → Dashboard → View all 6 tiles
   - Verify data accuracy
   - Test refresh functionality
   - Verify responsive design

2. **Approval Queue Flow**
   - Navigate to approval queue
   - View pending approvals
   - Approve/reject items
   - Verify notifications

3. **Hot Rod AN Integration Flow**
   - Test Shopify data sync
   - Test order processing
   - Test customer data
   - Verify analytics

4. **Error Handling**
   - Test offline scenarios
   - Test API failures
   - Test timeout handling
   - Verify error messages

**Evidence**: Playwright test suite, test results, coverage report

### P1: Regression Testing (2-3 hours)

**Goal**: Ensure no regressions from recent changes

**Tasks**:
1. Re-run all existing tests
2. Document any failures
3. Verify fixes
4. Update test documentation

**Evidence**: Test results, failure reports, fixes verified

### P2: User Acceptance Testing Prep (2-3 hours)

**Goal**: Prepare for CEO UAT

**Tasks**:
1. Create UAT test plan
2. Document test scenarios
3. Prepare test data
4. Create UAT feedback form

**Evidence**: UAT plan, test scenarios, feedback form

**Timeline**: Start with P0, report progress every 2 hours to feedback/qa.md

**Coordination**:
- Engineer: May need bug fixes
- QA Helper: Coordinate on test coverage
- Product: UAT scenarios

**When Complete**: Log completion in feedback/qa.md (manager monitors all feedback files)

---
