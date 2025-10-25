# Microcopy Guide: Settings & Onboarding (Phase 6 & 9)

**File:** `docs/specs/microcopy-settings-onboarding.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-20  
**Status:** Ready for Engineer Implementation  
**Reference:** `docs/design/dashboard-features-1K-1P.md`, `docs/design/dashboard-onboarding-flow.md`

---

## PART 1: SETTINGS PAGE (Phase 6 - P2)

---

## 1. Settings Route (`/settings`)

### 1.1 Page Title

```
Settings
```

### 1.2 Tab Navigation

**Tabs:**

```
Dashboard
Appearance
Notifications
Integrations
```

**Pattern:**

```
[Tab Name]
```

**Active State:** Underline + brand color

---

## 2. Dashboard Tab

### 2.1 Section: Tile Visibility

**Section Header:**

```
Tile Visibility
```

**Description:**

```
Choose which tiles appear on your dashboard.
```

**Checkbox Labels:**

```
☑ Ops Pulse
☑ Sales Pulse
☑ Fulfillment Health
☑ Inventory Heatmap
☑ CX Escalations
☑ SEO & Content Watch
☑ Idea Pool
☑ Approvals Queue
```

**Reset Button:**

```
Reset to default
```

**Confirmation:**

```
Are you sure you want to reset to default layout?
[Reset] [Cancel]
```

### 2.2 Section: Default View

**Section Header:**

```
Default View
```

**Description:**

```
How tiles are displayed on your dashboard.
```

**Radio Options:**

```
○ Grid view (compact)
○ List view (detailed)
```

### 2.3 Section: Auto-Refresh

**Section Header:**

```
Auto-Refresh
```

**Description:**

```
Automatically update dashboard tiles.
```

**Toggle:**

```
☑ Enable auto-refresh
```

**Frequency Dropdown:**

```
Every [5 seconds ▼]
```

**Options:**

- 5 seconds
- 10 seconds
- 30 seconds
- 1 minute
- 5 minutes

### 2.4 Save Button

**Primary CTA:**

```
Save Changes
```

**Success Toast:**

```
Dashboard settings saved.
```

---

## 3. Appearance Tab

### 3.1 Section: Theme

**Section Header:**

```
Theme
```

**Description:**

```
Choose your preferred color theme.
```

**Radio Options:**

```
○ Light
○ Dark
○ Auto (matches system)
```

**Preview:** Show color swatches for each theme

### 3.2 Section: Density

**Section Header:**

```
Content Density
```

**Description:**

```
Adjust spacing and tile size.
```

**Radio Options:**

```
○ Comfortable (more spacing)
○ Compact (fits more on screen)
```

### 3.3 Save Button

**Primary CTA:**

```
Save Changes
```

**Success Toast:**

```
Theme updated. Refreshing...
```

---

## 4. Notifications Tab

### 4.1 Section: Browser Notifications

**Section Header:**

```
Desktop Notifications
```

**Description:**

```
Get alerts even when HotDash isn't open.
```

**Toggle:**

```
☑ Enable desktop notifications
```

**Permission Status:**

- Granted: "Enabled ✓"
- Denied: "Blocked by browser settings"
- Default: "[Enable Notifications]" button

**Request Button:**

```
Enable Notifications
```

### 4.2 Section: Notification Types

**Section Header:**

```
Notify Me About
```

**Checkboxes:**

```
☑ New approvals
☑ SLA breaches
☑ Queue backlog (>10 pending)
☑ Performance alerts
☑ System updates
```

### 4.3 Section: Sound

**Section Header:**

```
Sound
```

**Toggle:**

```
☑ Play sound for notifications
```

**Volume Slider:**

```
Volume: [────●───] 70%
```

**Test Button:**

```
Test Sound
```

### 4.4 Section: Frequency

**Section Header:**

```
Notification Frequency
```

**Description:**

```
How often to check for new notifications.
```

**Radio Options:**

```
○ Real-time (recommended)
○ Every 5 minutes
○ Every 30 minutes
○ Hourly
```

### 4.5 Save Button

**Primary CTA:**

```
Save Changes
```

**Success Toast:**

```
Notification preferences saved.
```

---

## 5. Integrations Tab

### 5.1 Section: Shopify

**Section Header:**

```
Shopify
```

**Status:**

```
● Connected
```

**Details:**

```
Store: hotrodan.myshopify.com
Connected: Oct 15, 2025
```

**Actions:**

```
[Test Connection] [Reconnect]
```

**Test Result Toast:**

```
Connection successful ✓
```

### 5.2 Section: Chatwoot

**Section Header:**

```
Chatwoot (Customer Support)
```

**Status:**

```
● Connected
```

**Details:**

```
Account: hotrodan.chatwoot.com
Inbox: Website Live Chat
Health: All systems operational
```

**Actions:**

```
[Test Connection] [Reconfigure]
```

### 5.3 Section: Google Analytics

**Section Header:**

```
Google Analytics
```

**Status:**

```
● Connected
```

**Details:**

```
Property: Hot Rod AN
GA4 ID: G-XXXXXXXXXX
```

**Actions:**

```
[Test Connection] [Update Credentials]
```

### 5.4 Section: Publer (Social)

**Section Header:**

```
Publer (Social Media)
```

**Status:**

```
○ Not Connected
```

**Description:**

```
Connect Publer to schedule and publish social media content.
```

**Action:**

```
[Connect Publer]
```

### 5.5 Integration Status Badges

**Connected:**

```
● Connected
```

Color: Green

**Degraded:**

```
● Degraded
```

Color: Yellow

**Disconnected:**

```
○ Not Connected
```

Color: Gray

**Error:**

```
● Connection Error
```

Color: Red

---

## PART 2: ONBOARDING FLOW (Phase 9 - P3)

---

## 6. Welcome Modal (First Visit)

### 6.1 Modal Content

**Header:**

```
Welcome to HotDash!
```

**Subheader:**

```
Rev up your operations
```

**Body:**

```
HotDash centralizes your operations in one place:
• Monitor sales, inventory, and fulfillment
• Respond to customer conversations
• Approve AI-suggested actions with confidence

Let's get you set up in 3 quick steps.
```

**Icon:** Hot Rodan logo or speedometer

**CTA:**

```
Let's Go!
```

**Skip Link:**

```
Skip setup (I'll do this later)
```

**Don't Show Again:**

```
☐ Don't show this again
```

---

## 7. Setup Wizard (3 Steps)

### 7.1 Progress Indicator

**Pattern:**

```
Step [X] of 3
```

**Progress Bar:**

```
[████────────] 33%
```

### 7.2 Step 1: Connect Shopify

**Title:**

```
Connect Your Shopify Store
```

**Description:**

```
HotDash needs access to your store data to show real-time metrics.
```

**Instructions:**

```
1. Click "Connect Shopify" below
2. Log in to your Shopify store
3. Approve the connection
```

**CTA:**

```
Connect Shopify
```

**Skip:**

```
← Back | Skip →
```

**Success:**

```
✓ Connected successfully!
[Continue →]
```

### 7.3 Step 2: Configure Chatwoot

**Title:**

```
Set Up Customer Support
```

**Description:**

```
Connect Chatwoot to respond to customer messages from HotDash.
```

**Form Fields:**

```
Chatwoot URL: [https://__________.chatwoot.com]
API Key: [••••••••••••••••]
Inbox ID: [1]
```

**Help Text:**

```
Find your API key in Chatwoot Settings → Access Tokens
```

**CTA:**

```
Connect Chatwoot
```

**Skip:**

```
← Back | Skip →
```

### 7.4 Step 3: Connect Analytics

**Title:**

```
Add Google Analytics
```

**Description:**

```
Connect GA4 to monitor traffic and detect anomalies.
```

**Form Fields:**

```
Property ID: [G-__________]
Service Account JSON: [Upload file]
```

**CTA:**

```
Connect Analytics
```

**Skip:**

```
← Back | Skip →
```

**Or:**

```
I'll add this later
```

---

## 8. Completion Screen

**Header:**

```
You're all set!
```

**Subheader:**

```
Full throttle ahead
```

**Body:**

```
Your dashboard is ready to go. Here's what you can do now:

✓ Monitor live sales and inventory
✓ Respond to customer conversations
✓ Approve AI-suggested actions
✓ Track SEO and content performance
```

**CTA:**

```
Go to Dashboard
```

**Secondary Link:**

```
Take a quick tour
```

---

## 9. Dashboard Tour (4 Steps)

### 9.1 Tooltip Design

**Pattern:**

```
┌────────────────────────────────────┐
│ [Step X of 4]              [✕]    │
├────────────────────────────────────┤
│                                    │
│ [Title]                            │
│                                    │
│ [Description]                      │
│                                    │
│ [← Back]  [Skip Tour]  [Next →]   │
└────────────────────────────────────┘
```

**Spotlight:** Dim background, highlight target tile

### 9.2 Step 1: Dashboard Tiles

**Title:**

```
Your Dashboard
```

**Body:**

```
Each tile shows live data from your store. Click any tile for details and actions.
```

**Highlight:** All tiles

**CTA:**

```
Next →
```

### 9.3 Step 2: Approvals Queue

**Title:**

```
Approvals Queue
```

**Body:**

```
AI agents suggest actions like sending customer emails. You review and approve them here for full control.
```

**Highlight:** Approvals Queue tile

**CTA:**

```
Next →
```

### 9.4 Step 3: CX Escalations

**Title:**

```
Customer Support
```

**Body:**

```
See SLA breaches and respond to customers. AI drafts replies for you to review and send.
```

**Highlight:** CX Escalations tile

**CTA:**

```
Next →
```

### 9.5 Step 4: Customization

**Title:**

```
Make It Yours
```

**Body:**

```
Drag tiles to reorder them. Use Settings to hide tiles you don't need. You can restart this tour anytime from Settings.
```

**Highlight:** Settings link

**CTA:**

```
Finish Tour
```

---

## 10. CEO Tone Alignment

✅ **Voice Attributes:**

- Welcoming: "Welcome to HotDash!" (friendly)
- Motivational: "Rev up your operations" (brand theme)
- Clear: "Let's get you set up in 3 quick steps" (actionable)
- Positive: "You're all set!" (encouraging)

✅ **Language Style:**

- Active voice: "Let's Go!" not "Click to begin"
- Contractions: "You're" not "You are"
- Short sentences: "Full throttle ahead"
- Numbers: Use digits (3 not three)

❌ **Avoid:**

- Corporate: "Please complete the onboarding process"
- Passive: "The setup wizard will guide you"
- Jargon: "Initialize configuration workflow"
- Redundancy: "Please click the button below to continue"

---

## 11. Hot Rodan Brand Theme

**Welcome:**

- "Rev up your operations" ✅
- "Full throttle ahead" ✅
- "You're all set!" (simple, direct)

**Racing Metaphors - Use Sparingly:**

- Welcome/completion screens: YES
- Every tooltip: NO
- Error messages: NO

**Primary Color:** Hot Rodan Red (#E74C3C)

- Use for primary CTAs ("Let's Go!", "Go to Dashboard")
- Not for every button

---

## 12. Accessibility

**Modal:**

```
role="dialog"
aria-labelledby="welcome-title"
aria-modal="true"
```

**Progress Bar:**

```
role="progressbar"
aria-valuenow="33"
aria-valuemin="0"
aria-valuemax="100"
aria-label="Setup progress: step 1 of 3"
```

**Tour Tooltips:**

```
role="tooltip"
aria-live="polite"
```

**Focus Management:**

- Trap focus in modal
- First focusable element on open
- Return focus on close

**Keyboard Shortcuts:**

- `→` Next step
- `←` Previous step
- `Esc` Close/skip
- `?` Restart tour (from settings)

---

## 13. Implementation Checklist

**Engineer Tasks:**

**Phase 6 - Settings (ENG-018 to ENG-022):**

- [ ] Settings route with 4 tabs
- [ ] Dashboard tab (tile visibility, default view)
- [ ] Appearance tab (theme selector)
- [ ] Notifications tab (preferences, sound)
- [ ] Integrations tab (connection status)

**Phase 9 - Onboarding (ENG-029 to ENG-031):**

- [ ] Welcome modal (first visit detection)
- [ ] 3-step setup wizard
- [ ] Completion screen
- [ ] 4-step tooltip tour
- [ ] "Don't show again" preference
- [ ] Restart tour option in settings

**Designer Validation:**

- [ ] Visual QA on all copy placement
- [ ] Verify brand voice consistency
- [ ] Check tooltip positioning
- [ ] Confirm accessibility

---

## Reference

**Source:**

- `docs/design/dashboard-features-1K-1P.md` (Settings, Task 1K-1L)
- `docs/design/dashboard-onboarding-flow.md` (Complete onboarding spec)
- `docs/design/approvals_microcopy.md` (lines 600-723)

---

## Version History

- **1.0** (2025-10-20): Initial microcopy guidance for Phase 6 (Settings) and Phase 9 (Onboarding)
