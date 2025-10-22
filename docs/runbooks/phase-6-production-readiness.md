# Phase 6 Production Readiness Checklist

**Document**: `docs/runbooks/phase-6-production-readiness.md`  
**Created**: 2025-10-21  
**Owner**: Pilot Agent  
**Purpose**: Comprehensive go/no-go checklist for Phase 6 deployment to production

---

## Overview

This checklist ensures Phase 6 (Settings & Personalization) is production-ready before deployment. All P0 and P1 items must pass for GO decision.

**Phase 6 Features**:

- Settings page with 4 tabs (Dashboard, Appearance, Notifications, Integrations)
- Drag/drop tile reordering
- Theme switching (Light/Dark/Auto)
- Tile visibility toggles
- User preferences persistence
- Integration health checks

---

## 1. Performance Benchmarks (P0)

**Target**: Meet Core Web Vitals and NORTH_STAR.md performance goals

### Core Web Vitals

| Metric                              | Target        | Measurement           | Status |
| ----------------------------------- | ------------- | --------------------- | ------ |
| **LCP** (Largest Contentful Paint)  | < 2.5s (P75)  | Performance API       | ⬜     |
| **FID** (First Input Delay)         | < 100ms (P75) | Performance API       | ⬜     |
| **CLS** (Cumulative Layout Shift)   | < 0.1 (P75)   | Layout Shift API      | ⬜     |
| **TTFB** (Time to First Byte)       | < 600ms       | Navigation Timing API | ⬜     |
| **INP** (Interaction to Next Paint) | < 200ms (P75) | Event Timing API      | ⬜     |

**Measurement Tools**:

- Chrome DevTools Lighthouse (Performance score ≥ 90)
- WebPageTest (3 runs, median)
- Real User Monitoring (RUM) data if available

**Test Commands**:

```javascript
// Measure Core Web Vitals in browser console
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.value);
  }
}).observe({
  entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"],
});
```

---

### HotDash-Specific Performance Targets

| Metric                    | Target  | Test Method              | Status |
| ------------------------- | ------- | ------------------------ | ------ |
| **Dashboard Load** (P95)  | < 3s    | Performance timing       | ⬜     |
| **Settings Page Load**    | < 2s    | Navigation timing        | ⬜     |
| **Tile Reorder Response** | < 200ms | User timing marks        | ⬜     |
| **Theme Switch Time**     | < 100ms | Instant perceived change | ⬜     |
| **Preference Save Time**  | < 500ms | API response time        | ⬜     |
| **Modal Open Time**       | < 500ms | Render timing            | ⬜     |

**Evidence Required**:

- Chrome DevTools Performance recording (Settings page)
- Network waterfall (< 50 requests total)
- Bundle size report (JS < 500KB gzipped)

---

## 2. Accessibility Compliance (P0)

**Target**: WCAG 2.2 Level AA compliance with 0 critical violations

### Automated Testing

| Tool                         | Requirement           | Status |
| ---------------------------- | --------------------- | ------ |
| **axe DevTools**             | 0 critical violations | ⬜     |
| **WAVE Extension**           | 0 errors              | ⬜     |
| **Lighthouse Accessibility** | Score ≥ 95            | ⬜     |

### Manual Testing

| Test                     | Requirement                                                | Status |
| ------------------------ | ---------------------------------------------------------- | ------ |
| **Keyboard Navigation**  | All features accessible via Tab/Shift+Tab/Enter/Escape     | ⬜     |
| **Focus Indicators**     | Visible focus (4.5:1 contrast) on all interactive elements | ⬜     |
| **Focus Management**     | Focus returns to trigger after modal close                 | ⬜     |
| **Focus Trap**           | Tab cycles within modals, doesn't escape                   | ⬜     |
| **Screen Reader (NVDA)** | All content announced, logical tab order                   | ⬜     |
| **Color Contrast**       | All text ≥ 4.5:1 (AA standard)                             | ⬜     |
| **Alt Text**             | All images have descriptive alt attributes                 | ⬜     |
| **ARIA Labels**          | All buttons/controls properly labeled                      | ⬜     |
| **Headings**             | Proper hierarchy (h1→h2→h3)                                | ⬜     |
| **Form Labels**          | All inputs associated with labels                          | ⬜     |

---

## 3. Browser & Device Compatibility (P1)

### Desktop Browsers (Required)

| Browser     | Version          | Test Results            | Status |
| ----------- | ---------------- | ----------------------- | ------ |
| **Chrome**  | Latest, Latest-1 | All features functional | ⬜     |
| **Firefox** | Latest, Latest-1 | All features functional | ⬜     |
| **Safari**  | Latest (macOS)   | All features functional | ⬜     |
| **Edge**    | Latest           | All features functional | ⬜     |

### Mobile Browsers (Required)

| Browser    | Device                | Test Results                 | Status |
| ---------- | --------------------- | ---------------------------- | ------ |
| **Safari** | iOS 16+ (iPhone/iPad) | Touch gestures, theme switch | ⬜     |
| **Chrome** | Android 12+           | Touch gestures, drag/drop    | ⬜     |

### Mobile Responsiveness

| Breakpoint  | Width   | Test                                           | Status |
| ----------- | ------- | ---------------------------------------------- | ------ |
| **Mobile**  | 375px   | Settings stack vertically, touch targets ≥44px | ⬜     |
| **Tablet**  | 768px   | Settings grid 2-column                         | ⬜     |
| **Desktop** | 1280px+ | Settings grid full layout                      | ⬜     |

**Test Procedure**:

1. Chrome DevTools device emulation (iPhone SE, iPad, Desktop HD)
2. Real device testing (iOS Safari, Android Chrome)
3. Verify all interactive elements work via touch
4. Test drag/drop on mobile (if applicable)

---

## 4. Security Checklist (P0)

### Client-Side Security

| Check                  | Requirement                                  | Status |
| ---------------------- | -------------------------------------------- | ------ |
| **No Console Errors**  | 0 errors in production build                 | ⬜     |
| **No Exposed Secrets** | Gitleaks scan clean                          | ⬜     |
| **API Keys Masked**    | Settings show masked API keys (\*\*\*\*1234) | ⬜     |
| **HTTPS Only**         | All requests over HTTPS                      | ⬜     |
| **CSP Headers**        | Content Security Policy configured           | ⬜     |
| **XSS Protection**     | User inputs sanitized                        | ⬜     |
| **CORS Policy**        | Proper CORS headers on API                   | ⬜     |

### Authentication & Authorization

| Check                  | Requirement                               | Status |
| ---------------------- | ----------------------------------------- | ------ |
| **Session Management** | Sessions expire after inactivity          | ⬜     |
| **Protected Routes**   | Settings page requires auth               | ⬜     |
| **Permission Checks**  | User can only modify own preferences      | ⬜     |
| **Token Handling**     | Tokens stored securely (httpOnly cookies) | ⬜     |

### Data Privacy

| Check               | Requirement                                | Status |
| ------------------- | ------------------------------------------ | ------ |
| **User Data**       | Preferences stored per user (RLS enforced) | ⬜     |
| **Data Encryption** | Sensitive data encrypted at rest           | ⬜     |
| **Audit Trail**     | Preference changes logged                  | ⬜     |

**Security Scan Command**:

```bash
# Run gitleaks scan
gitleaks detect --source . --verbose

# Check for vulnerable dependencies
npm audit --production
```

---

## 5. Functional Testing (P0)

### Settings Page - Dashboard Tab

| Feature               | Test                       | Expected Result                        | Status |
| --------------------- | -------------------------- | -------------------------------------- | ------ |
| **Tile Visibility**   | Toggle 3+ tiles off/on     | Tiles show/hide immediately            | ⬜     |
| **Drag/Drop Reorder** | Drag tile to new position  | Order persists after refresh           | ⬜     |
| **Default View**      | Switch Grid ↔ List        | View preference saves                  | ⬜     |
| **Auto-Refresh**      | Toggle auto-refresh on/off | Setting persists                       | ⬜     |
| **Reset Defaults**    | Click "Reset to defaults"  | Confirmation modal, all settings reset | ⬜     |
| **Minimum Tiles**     | Try to hide all tiles      | Minimum 2 tiles always visible         | ⬜     |

### Settings Page - Appearance Tab

| Feature               | Test                            | Expected Result                 | Status |
| --------------------- | ------------------------------- | ------------------------------- | ------ |
| **Theme: Light**      | Select Light theme              | Applies immediately, no flicker | ⬜     |
| **Theme: Dark**       | Select Dark theme               | All components use dark palette | ⬜     |
| **Theme: Auto**       | Select Auto theme               | Follows system preference       | ⬜     |
| **Theme Persistence** | Logout, login                   | Theme restored correctly        | ⬜     |
| **System Change**     | Auto mode + change system theme | App theme updates automatically | ⬜     |

### Settings Page - Notifications Tab

| Feature              | Test                            | Expected Result                | Status |
| -------------------- | ------------------------------- | ------------------------------ | ------ |
| **Desktop Notifs**   | Toggle on, grant permission     | Test notification appears      | ⬜     |
| **Sound Toggle**     | Toggle sound on/off             | Preference saves               | ⬜     |
| **Threshold: Queue** | Set backlog threshold to 15     | Alert triggers at 15 items     | ⬜     |
| **Threshold: Perf**  | Set performance threshold to 3s | Alert triggers at 3s load time | ⬜     |
| **Frequency**        | Change Realtime → 5min → Hourly | Notification batching works    | ⬜     |

### Settings Page - Integrations Tab

| Feature            | Test                                  | Expected Result                        | Status |
| ------------------ | ------------------------------------- | -------------------------------------- | ------ |
| **Status Display** | View all integrations                 | Shopify/Chatwoot/GA/Publer status      | ⬜     |
| **Health Check**   | Click Chatwoot health check           | Status updates (Healthy/Unhealthy)     | ⬜     |
| **Last Sync Time** | View integration cards                | All show "Last synced X min ago"       | ⬜     |
| **Masked Keys**    | View API keys                         | Shown as \*\*\*\*1234                  | ⬜     |
| **Regenerate Key** | Test regenerate flow (if implemented) | Confirmation modal, new key shown once | ⬜     |

---

## 6. Error Handling & Edge Cases (P1)

### Error States

| Scenario            | Test                                | Expected Result                  | Status |
| ------------------- | ----------------------------------- | -------------------------------- | ------ |
| **API Failure**     | Disconnect network, save preference | Error toast with retry button    | ⬜     |
| **Timeout**         | Slow network (throttle to Slow 3G)  | Loading state, timeout after 30s | ⬜     |
| **Invalid Input**   | Save invalid preference value       | Validation error inline          | ⬜     |
| **Concurrent Edit** | Edit same preference in 2 tabs      | Last write wins, no data loss    | ⬜     |

### Edge Cases

| Scenario                     | Test                                       | Expected Result                   | Status |
| ---------------------------- | ------------------------------------------ | --------------------------------- | ------ |
| **All Tiles Hidden**         | Try to hide all 8 tiles                    | Minimum 2 tiles enforced          | ⬜     |
| **Rapid Theme Switch**       | Switch theme 10x rapidly                   | No flicker, no errors             | ⬜     |
| **Long Preference Value**    | Enter 1000-char note                       | Truncated or scrollable           | ⬜     |
| **Drag to Invalid Position** | Drag tile outside grid                     | Snaps back to valid position      | ⬜     |
| **Network Interruption**     | Save preference, disconnect during request | Retry logic, eventual consistency | ⬜     |

---

## 7. Data Integrity (P0)

### Database Schema

| Check            | Requirement                              | Status |
| ---------------- | ---------------------------------------- | ------ |
| **RLS Policies** | User can only read/write own preferences | ⬜     |
| **Indexes**      | Queries on user_id indexed               | ⬜     |
| **Constraints**  | NOT NULL on required fields              | ⬜     |
| **Defaults**     | Sensible defaults for all preferences    | ⬜     |

### Preference Persistence

| Test             | Procedure                        | Expected Result             | Status |
| ---------------- | -------------------------------- | --------------------------- | ------ |
| **Save**         | Change 5+ preferences, save      | All persist to database     | ⬜     |
| **Load**         | Logout, login                    | All preferences restored    | ⬜     |
| **Multi-Device** | Edit on device A, check device B | Syncs within 5s             | ⬜     |
| **Rollback**     | Save, then reset                 | Defaults restored correctly | ⬜     |

**Verification Query**:

```sql
-- Check user preferences table
SELECT * FROM user_preferences WHERE user_id = 'test-user-id';

-- Verify RLS
SELECT * FROM user_preferences; -- Should only return current user's data
```

---

## 8. Performance Under Load (P1)

### Settings Page Stress Tests

| Test                 | Procedure                     | Target                          | Status |
| -------------------- | ----------------------------- | ------------------------------- | ------ |
| **Rapid Saves**      | Save preferences 50x in 10s   | No errors, no rate limit issues | ⬜     |
| **Large Tile Order** | Reorder 8 tiles 20x           | No lag, order persists          | ⬜     |
| **Memory Leak**      | Open/close settings 20x       | Memory usage stable             | ⬜     |
| **Concurrent Users** | 100 users save simultaneously | No deadlocks, all saves succeed | ⬜     |

**Memory Leak Check**:

```javascript
// Chrome DevTools → Performance → Record
// Open settings, close settings, repeat 20x
// Check heap size growth in Memory panel
```

---

## 9. Monitoring & Observability (P1)

### Logging

| Requirement            | Implementation                               | Status |
| ---------------------- | -------------------------------------------- | ------ |
| **Preference Changes** | Log to decision_log or audit table           | ⬜     |
| **Errors**             | Client errors sent to error tracking service | ⬜     |
| **Performance**        | RUM data collected for Settings page         | ⬜     |

### Metrics

| Metric                   | Tool             | Alert Threshold                | Status |
| ------------------------ | ---------------- | ------------------------------ | ------ |
| **Settings Page Visits** | Analytics        | Track usage                    | ⬜     |
| **Theme Distribution**   | Analytics        | Light vs Dark vs Auto          | ⬜     |
| **Feature Adoption**     | Analytics        | % users with custom tile order | ⬜     |
| **Error Rate**           | Sentry/LogRocket | > 1% error rate                | ⬜     |
| **Save Success Rate**    | Analytics        | < 99% success                  | ⬜     |

---

## 10. Deployment Checklist (P0)

### Pre-Deployment

| Task                      | Responsible  | Status |
| ------------------------- | ------------ | ------ |
| **Gitleaks Scan**         | Pilot/DevOps | ⬜     |
| **npm audit**             | Engineer     | ⬜     |
| **Bundle Size Check**     | Engineer     | ⬜     |
| **Environment Variables** | DevOps       | ⬜     |
| **Database Migrations**   | DevOps       | ⬜     |
| **Backup Database**       | DevOps       | ⬜     |

### Deployment

| Task                      | Procedure                              | Status |
| ------------------------- | -------------------------------------- | ------ |
| **Deploy to Staging**     | `fly deploy --config fly.staging.toml` | ⬜     |
| **Smoke Test Staging**    | Run full checklist on staging          | ⬜     |
| **Deploy to Production**  | `fly deploy --config fly.toml`         | ⬜     |
| **Health Check**          | Verify /health endpoint                | ⬜     |
| **Smoke Test Production** | Test critical paths                    | ⬜     |

### Post-Deployment

| Task                    | Timeline           | Status |
| ----------------------- | ------------------ | ------ |
| **Monitor Error Rates** | First 1 hour       | ⬜     |
| **Monitor Performance** | First 24 hours     | ⬜     |
| **User Feedback**       | First week         | ⬜     |
| **Rollback Plan**       | Document procedure | ⬜     |

---

## 11. Go/No-Go Decision Criteria

### ✅ GO Decision (All must be TRUE)

- [ ] **P0 Performance**: All Core Web Vitals meet targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] **P0 Accessibility**: 0 critical axe violations, Lighthouse Accessibility ≥ 95
- [ ] **P0 Functional**: All Settings features work correctly (4 tabs, theme switch, drag/drop, persistence)
- [ ] **P0 Security**: Gitleaks clean, npm audit 0 high/critical, API keys masked
- [ ] **P0 Browser Compat**: Works in Chrome, Firefox, Safari, Edge (latest versions)
- [ ] **P0 Mobile**: Works on iOS Safari and Android Chrome (touch gestures functional)
- [ ] **P0 Data Integrity**: RLS enforced, preferences persist correctly
- [ ] **P0 Error Handling**: API failures show user-friendly errors with retry
- [ ] **P1 React Errors**: React errors (#418, #425, #423) investigated and documented (blocker if impacting functionality)
- [ ] **P1 Console Clean**: < 5 console warnings in production build

### 🚨 NO-GO Decision (Any TRUE → block deployment)

- [ ] **Critical Bug**: P0 feature completely broken
- [ ] **Security Issue**: Exposed secrets, XSS vulnerability, broken auth
- [ ] **Performance Fail**: LCP > 4s or CLS > 0.25 (poor Core Web Vitals)
- [ ] **Accessibility Block**: > 5 critical axe violations
- [ ] **Data Loss Risk**: User preferences not persisting or corrupting
- [ ] **Browser Break**: Completely non-functional in major browser
- [ ] **Mobile Break**: Unusable on iOS or Android
- [ ] **Production Errors**: > 5% error rate in staging smoke tests

### ⚠️ GO with Warnings (Document issues, deploy, monitor closely)

- [ ] **Minor A11Y Issues**: < 5 moderate axe violations (plan fix in next sprint)
- [ ] **React Console Errors**: Errors present but no functional impact (document investigation plan)
- [ ] **Performance Warning**: Metrics slightly above target but < 10% over (monitor RUM data)
- [ ] **Edge Case Bugs**: Non-critical edge cases fail (e.g., dragging tile while network down)

---

## 12. Phase 6 Success Metrics (Post-Launch)

### Week 1 Targets

| Metric                  | Target                           | Measurement      | Status |
| ----------------------- | -------------------------------- | ---------------- | ------ |
| **Settings Adoption**   | ≥ 30% users visit Settings       | Google Analytics | ⬜     |
| **Theme Customization** | ≥ 20% users change theme         | Analytics event  | ⬜     |
| **Tile Reordering**     | ≥ 10% users customize tile order | Analytics event  | ⬜     |
| **Error Rate**          | < 0.5%                           | Sentry           | ⬜     |
| **Settings Load Time**  | P95 < 2s                         | RUM data         | ⬜     |

### Month 1 Targets

| Metric                     | Target                            | Measurement      | Status |
| -------------------------- | --------------------------------- | ---------------- | ------ |
| **Repeat Customization**   | ≥ 50% of customizers edit again   | Analytics cohort | ⬜     |
| **Mobile Usage**           | ≥ 25% Settings visits from mobile | Analytics        | ⬜     |
| **Support Tickets**        | < 5 Settings-related tickets      | Support system   | ⬜     |
| **Performance Regression** | No degradation from baseline      | RUM trending     | ⬜     |

---

## 13. Rollback Plan

### Trigger Criteria (Any → initiate rollback)

- Error rate > 5% for > 10 minutes
- Core Web Vitals degrade > 50%
- Critical security issue discovered
- Data loss or corruption detected
- Major browser completely broken

### Rollback Procedure

1. **Immediate**: `fly deploy --app hotdash-production --image registry.fly.io/hotdash-production:previous`
2. **Verify**: Health check passes, error rate drops < 1%
3. **Notify**: Post in #incidents channel, notify CEO
4. **Investigate**: Root cause analysis in feedback/pilot/YYYY-MM-DD.md
5. **Fix Forward**: Plan fix, re-test, re-deploy

### Rollback Testing

- [ ] Verify rollback procedure on staging
- [ ] Document previous stable image tag
- [ ] Confirm database migrations are backward-compatible

---

## 14. Sign-Off

### Test Execution

| Role           | Name           | Date         | Status     | Signature          |
| -------------- | -------------- | ------------ | ---------- | ------------------ |
| **Pilot (QA)** | Pilot Agent    | 2025-10-21   | ⬜ Pending | ******\_\_\_****** |
| **Engineer**   | Engineer Agent | ****\_\_**** | ⬜ Pending | ******\_\_\_****** |
| **Designer**   | Designer Agent | ****\_\_**** | ⬜ Pending | ******\_\_\_****** |
| **Manager**    | Manager Agent  | ****\_\_**** | ⬜ Pending | ******\_\_\_****** |

### Final Decision

**Decision**: ☐ GO ☐ NO-GO ☐ GO with Warnings

**Rationale**: ********************************\_********************************

**Blockers**: ********************************\_********************************

**Warnings**: ********************************\_********************************

**Deployment Date**: ********\_\_\_********  
**Deployed By**: ********\_\_\_********  
**Deployment Tag**: ********\_\_\_********

---

## Appendix A: Testing Tools

### Required Tools

1. **Chrome DevTools**
   - Lighthouse (Performance, Accessibility, SEO)
   - Network panel (waterfall, timing)
   - Performance panel (profiling, memory)
   - Console (error tracking)

2. **Accessibility**
   - axe DevTools extension
   - WAVE extension
   - NVDA screen reader (Windows) or VoiceOver (macOS)

3. **Performance**
   - WebPageTest (webpagetest.org)
   - Chrome User Experience Report (CrUX)
   - Performance API (browser)

4. **Security**
   - Gitleaks (secret scanning)
   - npm audit (dependency vulnerabilities)
   - OWASP ZAP (optional, for penetration testing)

### MCP Tools Used

- `mcp_Chrome_DevTools_navigate_page` - Navigate to Settings page
- `mcp_Chrome_DevTools_take_snapshot` - Capture page state
- `mcp_Chrome_DevTools_take_screenshot` - Visual evidence
- `mcp_Chrome_DevTools_list_console_messages` - Error detection
- `mcp_Chrome_DevTools_evaluate_script` - Performance measurement

---

## Appendix B: Performance Measurement Scripts

### Core Web Vitals Measurement

```javascript
// Measure LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log("LCP:", lastEntry.renderTime || lastEntry.loadTime);
}).observe({ type: "largest-contentful-paint", buffered: true });

// Measure FID
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("FID:", entry.processingStart - entry.startTime);
  }
}).observe({ type: "first-input", buffered: true });

// Measure CLS
let clsValue = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      console.log("CLS:", clsValue);
    }
  }
}).observe({ type: "layout-shift", buffered: true });
```

### Settings Page Timing

```javascript
// Measure Settings page load
performance.mark("settings-start");

// ... navigate to /settings ...

performance.mark("settings-end");
performance.measure("settings-load", "settings-start", "settings-end");

const measure = performance.getEntriesByName("settings-load")[0];
console.log("Settings load time:", measure.duration, "ms");
```

### Theme Switch Performance

```javascript
// Measure theme switch time
performance.mark("theme-switch-start");

// ... click theme toggle ...

requestAnimationFrame(() => {
  performance.mark("theme-switch-end");
  performance.measure("theme-switch", "theme-switch-start", "theme-switch-end");

  const measure = performance.getEntriesByName("theme-switch")[0];
  console.log("Theme switch time:", measure.duration, "ms");
});
```

---

## Appendix C: Test Data Requirements

### User Accounts

- **Test User 1**: Default preferences (no customizations)
- **Test User 2**: Fully customized (theme: dark, tiles reordered, 3 tiles hidden)
- **Test User 3**: Mobile-only user (test touch interactions)
- **Test User 4**: Accessibility user (keyboard-only navigation)

### Test Environments

- **Local**: `http://localhost:3000` (development build)
- **Staging**: `https://hotdash-staging.fly.dev` (production build)
- **Production**: `https://hotdash-production.fly.dev` (live environment)

---

**Document Status**: DRAFT - Ready for Phase 6 testing  
**Last Updated**: 2025-10-21T03:35:00Z  
**Next Review**: After Phase 6 completion
