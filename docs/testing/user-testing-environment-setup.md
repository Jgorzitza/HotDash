# HotDash User Testing - Environment Setup
**Date**: 2025-10-24  
**Task**: PILOT-USER-TESTING-001  
**Purpose**: Prepare test environment for user testing sessions

---

## Environment Overview

### Staging Environment
**URL**: https://hotdash-staging.fly.dev  
**App**: hotdash-staging  
**Region**: ord (Chicago)  
**Status**: ✅ Operational

### Test Modes

#### Mock Mode (Recommended for Testing)
**URL**: `https://hotdash-staging.fly.dev/app?mock=1`

**Benefits**:
- No real Shopify data required
- Consistent test data
- No API rate limits
- Faster load times
- Safe for testing

**Use For**:
- New user onboarding
- UI/UX testing
- Feature demonstrations
- Most user testing scenarios

#### Live Mode (Optional)
**URL**: `https://hotdash-staging.fly.dev/app?mock=0`

**Requirements**:
- Valid Shopify store
- Admin credentials
- API access configured

**Use For**:
- Real data validation
- Performance testing
- Integration testing

---

## Pre-Testing Checklist

### 1. Verify Staging Environment

```bash
# Check staging status
curl -s https://hotdash-staging.fly.dev/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

**Status**: ⏳ Pending verification

---

### 2. Verify Critical Fixes

#### AppProvider Crash Fix
**Issue**: Interactive buttons crashed with "MissingAppProviderError"  
**Test**: Click "Review & respond" button on CX tile  
**Expected**: Modal opens without crash  
**Status**: ⏳ Pending verification

#### Missing Tiles Fix
**Issue**: Only 6 of 8 tiles visible  
**Test**: Count tiles on dashboard  
**Expected**: 8 tiles visible (Sales, Fulfillment, Inventory, Escalations, SEO, Ops Metrics, Idea Pool, Approvals Queue)  
**Status**: ⏳ Pending verification

---

### 3. Prepare Test Data

#### Mock Mode Data
**Location**: `tests/fixtures/`

**Available Fixtures**:
- ✅ Shopify Admin API responses
- ✅ Chatwoot conversations
- ✅ Agent SDK approval queue
- ✅ Sales pulse data
- ✅ Inventory alerts

**Mock Data Includes**:
- Orders with anomalies
- SLA breached conversations (2)
- Low inventory alerts (3)
- Template suggestions available

#### Test Accounts
**User 1**: New operator (no prior data)  
**User 2**: Experienced operator (with history)  
**User 3**: Mobile user (mobile device)  
**User 4**: Keyboard user (accessibility)  
**User 5**: CX specialist (customer service)

---

### 4. Browser & Device Setup

#### Desktop Browsers
- ✅ Chrome (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)

#### Mobile Devices
- ✅ iPhone (Safari)
- ✅ Android (Chrome)

#### Screen Sizes
- Desktop: 1280x720 (minimum)
- Tablet: 768x1024
- Mobile: 375x667 (iPhone SE)

---

### 5. Recording Setup

#### Screen Recording
**Tool**: Loom / Zoom / QuickTime  
**Settings**:
- Record screen + audio
- Include cursor
- 1080p resolution

#### Note Taking
**Tool**: Google Docs / Notion  
**Template**: User testing notes template

---

## Test Environment URLs

### Dashboard (Mock Mode)
```
https://hotdash-staging.fly.dev/app?mock=1
```

**Expected Elements**:
- Operator Control Center heading
- 8 dashboard tiles
- Navigation menu
- Connection indicator

---

### Approvals Queue (Mock Mode)
```
https://hotdash-staging.fly.dev/app/approvals?mock=1
```

**Expected Elements**:
- Pending approvals list
- Filter options
- Approval cards with details

---

### Health Check
```
https://hotdash-staging.fly.dev/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T..."
}
```

---

## Mock Data Scenarios

### Scenario 1: New User (Clean Slate)
**URL**: `?mock=1&scenario=new_user`

**Data**:
- No approval history
- Default tile order
- No user preferences
- Empty notification queue

---

### Scenario 2: Active Operator
**URL**: `?mock=1&scenario=active_operator`

**Data**:
- 5 pending approvals
- 2 CX escalations
- 3 inventory alerts
- Recent approval history

---

### Scenario 3: High Volume
**URL**: `?mock=1&scenario=high_volume`

**Data**:
- 15 pending approvals
- 5 CX escalations
- 8 inventory alerts
- Multiple notifications

---

## Playwright Test Automation

### Run Automated Tests Before User Testing

```bash
# Run mock mode tests
npx playwright test --project=mock-mode

# Run specific test
npx playwright test tests/playwright/dashboard.spec.ts

# Run with UI
npx playwright test --project=mock-mode --headed
```

**Expected Results**:
- All tests passing
- No console errors
- Dashboard loads < 3s

---

## Troubleshooting

### Issue: Staging Environment Down
**Check**: `curl https://hotdash-staging.fly.dev/health`  
**Fix**: Contact DevOps to restart staging app

### Issue: Mock Data Not Loading
**Check**: URL includes `?mock=1`  
**Fix**: Verify mock mode parameter in URL

### Issue: Tiles Not Visible
**Check**: Browser console for errors  
**Fix**: Verify critical fixes were deployed

### Issue: Slow Performance
**Check**: Network tab in browser dev tools  
**Fix**: Use mock mode for faster testing

---

## Session Preparation Checklist

### Before Each Session (15 min)

- [ ] Verify staging environment is up
- [ ] Test mock mode URL loads
- [ ] Verify 8 tiles are visible
- [ ] Test clicking a tile (no crash)
- [ ] Open approvals queue
- [ ] Test modal opens (no crash)
- [ ] Clear browser cache
- [ ] Prepare recording tool
- [ ] Open note-taking template
- [ ] Review test scenario

---

### During Session

- [ ] Start screen recording
- [ ] Share test URL with user
- [ ] Ask user to think aloud
- [ ] Take notes on observations
- [ ] Document bugs immediately
- [ ] Ask follow-up questions
- [ ] Thank user for participation

---

### After Session

- [ ] Save recording
- [ ] Compile notes
- [ ] Document bugs in tracker
- [ ] Update test metrics
- [ ] Prepare for next session

---

## Test Metrics to Track

### Quantitative
- Task success rate (%)
- Time to complete (seconds)
- Error count
- Click count
- Page load time

### Qualitative
- Confusion points
- Positive feedback
- Pain points
- Feature requests
- Overall satisfaction (1-5)

---

## Emergency Contacts

**DevOps**: For staging environment issues  
**Engineer**: For critical bugs  
**Manager**: For test plan changes  
**CEO**: For go/no-go decisions

---

## Next Steps

1. ✅ Environment setup guide created
2. ⏳ Verify staging environment
3. ⏳ Verify critical fixes deployed
4. ⏳ Test mock mode URLs
5. ⏳ Prepare recording tools
6. ⏳ Schedule user sessions

---

**Status**: Environment setup guide complete  
**Next**: Verify staging environment and critical fixes

