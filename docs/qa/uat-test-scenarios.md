---
epoch: 2025.10.E1
doc: docs/qa/uat-test-scenarios.md
owner: qa
last_reviewed: 2025-10-13
expires: 2025-10-20
---

# UAT Test Scenarios - HotDash Operator Control Center

## Detailed Test Scenarios for User Acceptance Testing

### Dashboard Overview Scenarios

#### Scenario 1.1: Initial Dashboard Load
**Test Case ID**: UAT-DASH-001
**Priority**: Critical
**Preconditions**: User has access to dashboard URL
**Test Steps**:
1. Navigate to `http://127.0.0.1:4173/app?mock=1`
2. Wait for page to fully load
3. Verify "Operator Control Center" heading is visible
4. Confirm mock data indicator shows "Displaying sample data"
**Expected Results**:
- Page loads within 3 seconds
- All 6 dashboard tiles are visible
- Mock data indicator is displayed
- No JavaScript errors in console
**Test Data**: N/A
**Browser**: All supported

#### Scenario 1.2: Tile Content Validation
**Test Case ID**: UAT-DASH-002
**Priority**: High
**Preconditions**: Dashboard loaded successfully
**Test Steps**:
1. Review each of the 6 tiles for data accuracy
2. Verify tile titles match expected names
3. Check that data appears realistic and business-relevant
4. Confirm data-testid attributes are present for automation
**Expected Results**:
- Ops Pulse: Shows operational metrics
- Sales Pulse: Displays order and revenue data
- Fulfillment Flow: Shows fulfillment status
- Inventory Watch: Displays inventory alerts
- CX Pulse: Shows customer service metrics
- SEO Pulse: Displays SEO performance data
**Test Data**: Mock data should represent realistic business scenarios
**Browser**: All supported

#### Scenario 1.3: Responsive Design Check
**Test Case ID**: UAT-DASH-003
**Priority**: High
**Preconditions**: Dashboard accessible
**Test Steps**:
1. Test on desktop browser (1920x1080)
2. Resize browser to tablet size (768x1024)
3. Resize browser to mobile size (375x667)
4. Verify tiles remain visible and usable at all sizes
**Expected Results**:
- Desktop: 6 tiles in grid layout, clearly visible
- Tablet: Tiles adapt to smaller screen, remain readable
- Mobile: Tiles stack vertically, touch-friendly interactions
- No horizontal scrolling required at any breakpoint
**Test Data**: N/A
**Browser**: Chrome, Firefox, Safari

### Data Interaction Scenarios

#### Scenario 2.1: Modal Interactions (If Available)
**Test Case ID**: UAT-DASH-004
**Priority**: Medium
**Preconditions**: Modal functionality implemented
**Test Steps**:
1. Click on Sales Pulse tile (if modal trigger exists)
2. Verify modal opens with detailed data
3. Close modal using close button or escape key
4. Repeat for CX Pulse tile if available
**Expected Results**:
- Modal opens smoothly without page refresh
- Detailed data displays correctly
- Modal closes properly via multiple methods
- Focus returns to triggering element
**Test Data**: N/A
**Browser**: All supported

#### Scenario 2.2: Data Refresh Behavior
**Test Case ID**: UAT-DASH-005
**Priority**: Medium
**Preconditions**: Dashboard loaded
**Test Steps**:
1. Note current data values in tiles
2. Refresh the page (F5 or browser refresh)
3. Verify data persists or updates appropriately
4. Check for any loading states or errors
**Expected Results**:
- Page refreshes without errors
- Mock data remains consistent
- No broken states after refresh
- Loading indicators work if implemented
**Test Data**: N/A
**Browser**: All supported

### Navigation and Integration Scenarios

#### Scenario 3.1: Navigation Menu
**Test Case ID**: UAT-NAV-001
**Priority**: High
**Preconditions**: Dashboard loaded
**Test Steps**:
1. Locate navigation menu (if present)
2. Click on "Approvals" link
3. Verify navigation to approvals page
4. Use browser back button to return to dashboard
**Expected Results**:
- Navigation links are visible and functional
- Page transitions work smoothly
- Browser navigation works correctly
- User can return to dashboard easily
**Test Data**: N/A
**Browser**: All supported

#### Scenario 3.2: Shopify Admin Integration
**Test Case ID**: UAT-INT-001
**Priority**: Critical
**Preconditions**: Dashboard in Shopify admin context
**Test Steps**:
1. Access dashboard through Shopify admin
2. Verify embedded experience works
3. Check that Shopify admin navigation remains functional
4. Confirm app doesn't interfere with Shopify admin features
**Expected Results**:
- Dashboard loads correctly in Shopify admin
- Shopify admin navigation remains accessible
- No conflicts with Shopify admin functionality
- Proper authentication flow
**Test Data**: N/A
**Browser**: Chrome (Shopify admin requirement)

### Performance and Accessibility Scenarios

#### Scenario 4.1: Performance Validation
**Test Case ID**: UAT-PERF-001
**Priority**: High
**Preconditions**: Dashboard accessible
**Test Steps**:
1. Load dashboard and start timer
2. Wait for all tiles to fully render
3. Note total loading time
4. Test with slower network if possible
**Expected Results**:
- Initial page load < 3 seconds
- All tiles render within 5 seconds
- No long-running JavaScript blocking UI
- Smooth animations and transitions
**Test Data**: N/A
**Browser**: All supported

#### Scenario 4.2: Accessibility Check
**Test Case ID**: UAT-ACC-001
**Priority**: Medium
**Preconditions**: Dashboard loaded
**Test Steps**:
1. Test keyboard navigation (Tab, Enter, Escape)
2. Check for proper heading hierarchy (h1, h2, h3)
3. Verify color contrast meets WCAG standards
4. Test with screen reader if available
**Expected Results**:
- All interactive elements keyboard accessible
- Proper semantic HTML structure
- Sufficient color contrast ratios
- Screen reader compatibility
**Test Data**: N/A
**Browser**: All supported

### Error Handling Scenarios

#### Scenario 5.1: Error State Management
**Test Case ID**: UAT-ERR-001
**Priority**: Medium
**Preconditions**: Dashboard loaded
**Test Steps**:
1. Check for any error indicators in tiles
2. Verify error messages are user-friendly
3. Test error recovery mechanisms
4. Confirm application remains stable
**Expected Results**:
- Error states clearly communicated to users
- Helpful error messages provided
- Users can recover from error states
- Application doesn't crash or become unusable
**Test Data**: N/A
**Browser**: All supported

### Cross-Browser Compatibility Scenarios

#### Scenario 6.1: Browser Compatibility Matrix
**Test Case ID**: UAT-COMPAT-001
**Priority**: High
**Preconditions**: Dashboard accessible in multiple browsers
**Test Steps**:
1. Test in Chrome (latest)
2. Test in Firefox (latest)
3. Test in Safari (latest on macOS)
4. Test in Edge (latest)
**Expected Results**:
- Consistent appearance across all browsers
- All functionality works identically
- No browser-specific errors or warnings
- Performance acceptable in all browsers
**Test Data**: N/A
**Browser**: Chrome, Firefox, Safari, Edge

## Test Execution Notes

- **Session Duration**: 45-60 minutes per test session
- **Break Frequency**: 10-minute breaks every hour
- **Issue Reporting**: Use UAT feedback form for all findings
- **Screenshots**: Capture screenshots for any visual issues
- **Environment**: Ensure consistent test environment across sessions

## Success Criteria

- **Overall Pass Rate**: ≥ 95%
- **Critical Scenarios**: 100% pass rate
- **High Priority**: ≥ 90% pass rate
- **User Satisfaction**: Average score ≥ 4/5
- **No Critical Defects**: Zero P0 defects remaining

## Post-UAT Activities

1. **Defect Review**: QA team reviews all reported issues
2. **Prioritization**: Product team prioritizes fixes
3. **Re-testing**: Critical fixes re-tested before production
4. **Documentation**: UAT results documented for future reference
5. **Feedback Session**: Debrief with test participants
