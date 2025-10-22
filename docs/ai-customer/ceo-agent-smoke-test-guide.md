# CEO Agent Smoke Test Guide

**Owner**: AI-Customer  
**For**: Pilot Agent  
**Created**: 2025-10-22  
**Version**: 1.0  
**Estimated Time**: 5-10 minutes

---

## Purpose

Quick smoke test to verify CEO Agent UI is functional and integrated correctly. This is NOT comprehensive testing - it's a rapid validation that core features work.

**Use this guide when**:
- After deployment to staging/production
- After UI changes to CEO Agent components
- As part of pre-release checklist

---

## Pre-requisites

- [ ] Access to staging: https://hotdash-staging.fly.dev/app
- [ ] Mock mode enabled: append `?mock=1` to URL
- [ ] CEO Agent UI deployed (check dashboard for CEO Agent tile)
- [ ] Browser DevTools open (F12) to check console errors

---

## Smoke Test Checklist (5-10 minutes)

### ✅ Test 1: Dashboard Tile Visible (30 seconds)

**Steps**:
1. Navigate to `/app/dashboard`
2. Locate "CEO Agent" tile

**Expected**:
- ✅ CEO Agent tile visible on dashboard
- ✅ Tile shows status indicator (e.g., "Ready" or "4 pending approvals")
- ✅ Tile is clickable

**Pass Criteria**: Tile present and interactive

**Fail Actions**: 
- Screenshot missing tile
- Check console for React errors
- Verify tile component imported correctly

---

### ✅ Test 2: Agent Chat Interface Opens (30 seconds)

**Steps**:
1. Click CEO Agent tile
2. Verify chat interface opens

**Expected**:
- ✅ Chat modal or panel opens
- ✅ Input field visible
- ✅ "Send" or "Ask" button visible
- ✅ No console errors

**Pass Criteria**: Chat interface renders

**Fail Actions**:
- Check console for component errors
- Verify route exists: `/app/ceo-agent` or modal component loaded
- Check network tab for failed API calls

---

### ✅ Test 3: Simple Query Response (2 minutes)

**Steps**:
1. Type in chat: "What are my top 3 products this month?"
2. Click Send
3. Wait for response

**Expected**:
- ✅ Loading indicator appears
- ✅ Response generates within 5-10 seconds
- ✅ Response formatted nicely (markdown or structured)
- ✅ No error messages

**Pass Criteria**: Query completes successfully

**Fail Actions**:
- Check network tab for API call to `/api/ceo-agent/query` or similar
- Check console for errors
- Screenshot response or error
- Verify backend is running

**Known Issues to Ignore**:
- Mock data instead of real data (expected in mock mode)
- Slow response time (AI can take 5-10 seconds)

---

### ✅ Test 4: Approval Queue Access (1 minute)

**Steps**:
1. Navigate to approvals page (via nav or `/app/approvals`)
2. Check for pending approvals section

**Expected**:
- ✅ Approvals page loads
- ✅ "Pending Approvals" section visible
- ✅ Shows count (e.g., "4 pending" or "No pending approvals")
- ✅ List is readable

**Pass Criteria**: Approval queue accessible

**Fail Actions**:
- Screenshot approvals page
- Check if route exists
- Verify no 404 errors

---

### ✅ Test 5: Approval Details Display (1 minute)

**Steps**:
1. If pending approvals exist, click one
2. If none exist, skip this test OR create a test approval

**Expected** (if approval exists):
- ✅ Approval details modal/panel opens
- ✅ Shows: Action description, Evidence, Reasoning
- ✅ Shows: Approve and Reject buttons
- ✅ All text readable

**Pass Criteria**: Approval details display correctly

**Fail Actions**:
- Screenshot approval details
- Check for missing data fields
- Verify evidence section renders

**Skip Criteria**: If no approvals in queue, mark as "Not Tested - No Data"

---

### ✅ Test 6: Knowledge Base Integration (2 minutes)

**Steps**:
1. In CEO Agent chat, ask: "Find policy documentation for returns"
2. Wait for response

**Expected**:
- ✅ Response mentions KB query or search
- ✅ May include source citations (e.g., "Source: policies/returns.pdf")
- ✅ Response relevant to returns policy
- ✅ No errors

**Pass Criteria**: KB tool responds (even if mock data)

**Fail Actions**:
- Check if LlamaIndex KB tool called (network tab)
- Verify tool registration in agent
- Screenshot response

**Known Issues to Ignore**:
- Mock KB data in staging
- No real documents indexed yet

---

### ✅ Test 7: Tool Call Visibility (1 minute)

**Steps**:
1. Ask a question that requires data: "Show me sales data"
2. Observe response generation

**Expected**:
- ✅ May show "Querying Shopify..." or tool indicators
- ✅ Response includes data (even if mock)
- ✅ No "tool call failed" errors

**Pass Criteria**: Tools execute without visible errors

**Fail Actions**:
- Check console for tool errors
- Verify tool names match expected (shopify.products, supabase.analytics, etc.)
- Screenshot any error messages

---

### ✅ Test 8: No Console Errors (Continuous)

**Steps**:
1. Throughout all tests, monitor browser console
2. Note any errors (red text)

**Expected**:
- ✅ No React errors
- ✅ No network errors (or only expected 404s for missing mocks)
- ✅ No TypeScript errors
- ⚠️ Warnings acceptable (deprecations, etc.)

**Pass Criteria**: No critical console errors

**Fail Actions**:
- Screenshot all console errors
- Note which test triggered error
- Copy full error stack trace

---

## Quick Pass/Fail Summary

Use this checklist during smoke test:

```
[ ] Test 1: Dashboard tile visible ........................ PASS / FAIL
[ ] Test 2: Chat interface opens .......................... PASS / FAIL
[ ] Test 3: Simple query responds ......................... PASS / FAIL
[ ] Test 4: Approval queue accessible ..................... PASS / FAIL
[ ] Test 5: Approval details display ...................... PASS / FAIL / SKIP
[ ] Test 6: KB integration works .......................... PASS / FAIL
[ ] Test 7: Tool calls execute ............................ PASS / FAIL
[ ] Test 8: No console errors ............................. PASS / FAIL

Overall: ____ / 8 (or 7 if Test 5 skipped)
```

**Smoke Test Result**:
- 8/8 or 7/7: ✅ PASS - Proceed with full testing
- 6/8 or 6/7: ⚠️ MINOR ISSUES - Document and continue
- <6: ❌ FAIL - Escalate blockers before continuing

---

## Known Issues (As of 2025-10-22)

### Issue 1: CEO Agent Implementation Bug
**Status**: Blocking comprehensive testing (not smoke test)  
**Symptoms**: Tool schema parsing error  
**Impact**: May affect tool calls in UI  
**Workaround**: Use mock mode, verify UI renders correctly  
**Owner**: Engineer  
**ETA**: Pending fix

### Issue 2: Grading UI Deployment
**Status**: May not be deployed to staging yet  
**Symptoms**: Sliders missing in CX modal  
**Impact**: Cannot test customer agent grading  
**Workaround**: CEO Agent testing unaffected  
**Owner**: DevOps/Manager  

---

## Success Metrics for Smoke Test

**Primary Goal**: Verify UI renders and core interactions work

**NOT Testing** (save for comprehensive QA):
- ❌ Data accuracy (mock data is fine)
- ❌ Performance (rough timing only)
- ❌ Edge cases (separate test suite)
- ❌ Security (separate audit)
- ❌ Accessibility (separate a11y tests)

**IS Testing** (smoke test focus):
- ✅ UI components render
- ✅ Basic interactions work (click, type, submit)
- ✅ No critical errors block usage
- ✅ Happy path functional

---

## Reporting Template

After completing smoke test, report in `feedback/pilot/<date>.md`:

```markdown
## CEO Agent Smoke Test - [PASS/FAIL]

**Date**: 2025-10-22
**Environment**: Staging (mock mode)
**Duration**: X minutes

**Results**:
- Test 1 (Dashboard): PASS/FAIL
- Test 2 (Chat UI): PASS/FAIL
- Test 3 (Query): PASS/FAIL
- Test 4 (Approvals): PASS/FAIL
- Test 5 (Details): PASS/FAIL/SKIP
- Test 6 (KB): PASS/FAIL
- Test 7 (Tools): PASS/FAIL
- Test 8 (Console): PASS/FAIL

**Overall**: X/8 PASS

**Issues Found**:
1. [Description] - [Screenshot] - [Priority]
2. ...

**Recommendation**: PROCEED / BLOCK / MINOR FIXES NEEDED
```

---

## Troubleshooting

### Issue: Chat doesn't respond
**Check**:
- Network tab: Is API call made?
- Console: Any fetch errors?
- Backend: Is agent service running?

**Quick Fix**:
- Refresh page
- Check mock mode enabled
- Verify environment variables set

---

### Issue: Approval queue empty
**Check**:
- Is this expected? (may be no pending approvals)
- Query decision_log directly in Supabase
- Check if CEO Agent has generated any actions

**Quick Fix**:
- Not a failure - just no data yet
- Mark as "Not Tested - No Data"
- Can test with manufactured approval

---

### Issue: Tools not calling
**Check**:
- Console: Tool registration errors?
- Network: API routes exist?
- Query shows tool indicators?

**Quick Fix**:
- This may be the known CEO Agent bug
- Document and escalate
- Verify UI still renders

---

## Next Steps After Smoke Test

**If PASS**:
- ✅ Proceed to comprehensive QA testing
- ✅ Use test scenarios from `approval-queue-test-scenarios.md`
- ✅ Execute all 33 scenarios
- ✅ Document results

**If FAIL**:
- ❌ Log all failures with screenshots
- ❌ Escalate to Engineer + Manager
- ❌ Block further testing until fixes deployed
- ❌ Rerun smoke test after fixes

**If MINOR ISSUES**:
- ⚠️ Document issues but continue testing
- ⚠️ Prioritize issues (P0/P1/P2)
- ⚠️ Test what's working, skip broken features
- ⚠️ Full issue report at end

---

## References

**CEO Agent Implementation**:
- Backend: `packages/agents/src/ai-ceo.ts`
- UI Component: TBD (check `app/components/ceo-agent/` or `app/routes/app.ceo-agent.tsx`)
- API Routes: `app/routes/api.ceo-agent.*.ts`

**Approval System**:
- Approval Adapter: `app/services/ai-customer/approval-adapter.ts`
- Approvals UI: Check `app/routes/app.approvals.tsx` or similar

**Database**:
- Table: `decision_log`
- CEO actions: `scope='ceo_approval'`
- Customer actions: `action='chatwoot.approve_send'`

---

**Document Version**: 1.0  
**Created**: 2025-10-22T01:05:00Z  
**Owner**: AI-Customer Agent  
**For**: Pilot Agent  
**Type**: Quick Smoke Test (5-10 min)

*Smoke test guide ready for Pilot execution*

