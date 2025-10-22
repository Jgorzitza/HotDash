# Microcopy Guide: Notification System (Phase 4 - P1)

**File:** `docs/specs/microcopy-notifications.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-20  
**Status:** Ready for Engineer Implementation  
**Reference:** `docs/design/notification-system-design.md`, `docs/design/approvals_microcopy.md`

---

## Purpose

Microcopy guidance for the notification system including toast messages, banner alerts, and browser notifications (Phase 4, Priority P1).

---

## 1. Toast Messages

### 1.1 Success Toasts

**Duration:** 5 seconds (auto-dismiss)  
**Color:** Success tone (green)  
**Icon:** Checkmark

**Approval Actions:**

```
Pit stop complete! Action approved and executed.
```

**Rejection Actions:**

```
Action rejected. Agent will not proceed.
```

**General Success:**

```
Settings saved successfully.
```

```
Changes applied.
```

```
Feedback submitted. Thanks!
```

### 1.2 Error Toasts

**Duration:** 7 seconds (manual dismiss required)  
**Color:** Critical tone (red)  
**Icon:** Alert triangle

**Network Errors:**

```
Connection lost. Check your internet and try again.
[Retry]
```

**Server Errors:**

```
Something went wrong. Please try again.
[Retry]
```

**Validation Errors:**

```
Required fields missing. Please complete the form.
```

**Permission Errors:**

```
You don't have permission for this action.
```

### 1.3 Info Toasts

**Duration:** 5 seconds (auto-dismiss)  
**Color:** Info tone (blue)  
**Icon:** Info circle

**Queue Updates:**

```
3 new approvals need review.
[View Queue]
```

**Refresh Notifications:**

```
Queue refreshed. All up to date.
```

**Auto-save:**

```
Draft saved automatically.
```

**Sync Status:**

```
Syncing with Shopify...
```

### 1.4 Warning Toasts

**Duration:** 7 seconds (manual dismiss)  
**Color:** Warning tone (yellow)  
**Icon:** Warning triangle

**Approaching Limits:**

```
Queue approaching capacity (8/10).
[Review Queue]
```

**Performance Warnings:**

```
Approval rate below target (65%).
[View Metrics]
```

**Unsaved Changes:**

```
You have unsaved changes.
[Save] [Discard]
```

---

## 2. Banner Alerts

### 2.1 Queue Backlog Banner

**Trigger:** >10 pending approvals  
**Priority:** Warning  
**Dismissible:** Yes

**Content:**

```
Queue backlog detected
You have 12 pending approvals. Review queue to prevent delays.
[Review Queue] [Dismiss]
```

**Icon:** Warning triangle  
**Color:** Warning tone (yellow background)

### 2.2 Performance Banner

**Trigger:** Approval rate <70%  
**Priority:** Critical  
**Dismissible:** No (until resolved)

**Content:**

```
Approval rate below target
Current rate: 65% (target: ≥90%). Review pending approvals.
[View Queue] [View Metrics]
```

**Icon:** Alert circle  
**Color:** Critical tone (red background)

### 2.3 System Health Banner

**Trigger:** Service degradation detected  
**Priority:** Critical  
**Dismissible:** No

**Degraded Service:**

```
System running slowly
We're experiencing delays. Your work is still being saved.
[Status Page]
```

**Service Down:**

```
Service temporarily unavailable
We're working to restore service. Try again in a few minutes.
[Contact Support] [Status Page]
```

**Icon:** Alert triangle  
**Color:** Critical tone (red background)

### 2.4 Maintenance Banner

**Trigger:** Scheduled maintenance upcoming  
**Priority:** Info  
**Dismissible:** Yes

**Content:**

```
Scheduled maintenance
System will be unavailable Oct 21, 2:00-3:00 AM PST.
[Learn More] [Dismiss]
```

**Icon:** Info circle  
**Color:** Info tone (blue background)

### 2.5 Connection Status Banner

**Trigger:** Network disconnection  
**Priority:** Warning  
**Dismissible:** No (until reconnected)

**Offline:**

```
You're offline
Check your internet connection. Changes will sync when reconnected.
```

**Reconnecting:**

```
Reconnecting...
Attempting to restore connection.
```

**Reconnected:**

```
Back online
All changes synced successfully.
[Dismiss]
```

**Icon:** WiFi off / WiFi on  
**Color:** Warning → Success

---

## 3. Browser (Desktop) Notifications

### 3.1 Permission Request

**Title:**

```
Enable notifications?
```

**Body:**

```
Get alerts for new approvals, even when HotDash isn't open.
[Enable] [Not Now]
```

### 3.2 New Approval Notification

**Title:**

```
New approval needed
```

**Body:**

```
ai-customer wants to send an email to Jamie Lee.
```

**Action Buttons:**

```
[Review] [Dismiss]
```

**Sound:** Optional (configurable in settings)  
**Persistent:** Until clicked

### 3.3 SLA Breach Notification

**Title:**

```
SLA breached
```

**Body:**

```
Customer waiting 2h 15m. Response needed urgently.
```

**Action Buttons:**

```
[Respond Now] [Dismiss]
```

**Priority:** High (persistent + sound)

### 3.4 Queue Backlog Notification

**Title:**

```
Queue backlog
```

**Body:**

```
12 approvals pending. Review queue to prevent delays.
```

**Action Buttons:**

```
[View Queue] [Dismiss]
```

**Priority:** Medium

### 3.5 Action Completed Notification

**Title:**

```
Action approved
```

**Body:**

```
Email sent to Jamie Lee. Conversation #123 updated.
```

**Priority:** Low (no sound)  
**Auto-dismiss:** After 10 seconds

---

## 4. Notification Center (Slide-out Panel)

### 4.1 Panel Header

**Title:**

```
Notifications
```

**Badge Count:**

```
[X] unread
```

**Actions:**

```
[Mark all as read] [Settings]
```

### 4.2 Empty State

**Heading:**

```
All caught up!
```

**Body:**

```
No new notifications.
You'll see important updates here.
```

**Icon:** Checkmark or bell with slash

### 4.3 Notification Groups

**Grouping:** By date

**Headers:**

```
Today
Yesterday
This Week
Older
```

### 4.4 Notification Card

**Pattern:**

```
[Icon] [Title]
[Body]
[Timestamp]
[Action Button]
```

**Example - Approval:**

```
🔔 New approval needed
ai-customer wants to send an email
5 min ago
[Review]
```

**Example - Alert:**

```
⚠️ Queue backlog
12 approvals pending
2 hours ago
[View Queue]
```

**Example - System:**

```
ℹ️ Maintenance scheduled
Oct 21, 2:00 AM PST
1 day ago
[Learn More]
```

### 4.5 Mark as Read

**Unread Indicator:** Blue dot or bold text

**Mark Read Action:**

```
[Mark as read]
```

**Batch Action:**

```
[Mark all as read]
```

**Confirmation Toast:**

```
All notifications marked as read.
```

---

## 5. Notification Types & Icons

**Approval:** 🔔 Bell  
**Alert:** ⚠️ Warning triangle  
**System:** ℹ️ Info circle  
**Success:** ✅ Checkmark  
**Error:** ❌ X or alert  
**Escalation:** 🚨 Critical alert

---

## 6. Sound Effects (Optional)

**New Approval:** Soft chime (1 second)  
**SLA Breach:** Urgent tone (2 seconds)  
**Queue Backlog:** Alert tone (1.5 seconds)  
**Success:** Subtle success sound (0.5 seconds)

**Settings:** All sounds configurable (on/off)

---

## 7. CEO Tone Alignment

✅ **Voice Attributes:**

- Clear and urgent (when needed): "SLA breached"
- Positive framing: "All caught up!" not "No notifications"
- Action-oriented: "Review Queue" not "Click here"
- Brand theme: "Pit stop complete!" (success)

✅ **Language Style:**

- Concise: "3 new approvals need review" (short, scannable)
- Active voice: "Review queue" not "Queue should be reviewed"
- Helpful: "Changes will sync when reconnected" (reassuring)
- Numbers: Use digits for counts (12 not twelve)

❌ **Avoid:**

- Alarm language: "URGENT! IMMEDIATE ACTION REQUIRED!"
- Passive voice: "Approval has been requested"
- Redundancy: "Please review the queue as soon as possible"
- Jargon: "Action validation pending"

---

## 8. Hot Rodan Brand Theme

**Success Messages:**

- "Pit stop complete!" ✅
- "All caught up!" ✅
- "Back online" (simple, direct)

**Keep It Subtle:** Don't overuse racing metaphors in every notification

**Primary Color:** Hot Rodan Red (#E74C3C)

- Use sparingly for critical alerts
- Not for every notification (would lose impact)

---

## 9. Accessibility

**Toast Announcements:**

```
role="status"
aria-live="polite" (info, success)
aria-live="assertive" (error, warning)
```

**Banner Alerts:**

```
role="alert"
aria-live="assertive"
```

**Notification Center:**

```
role="region"
aria-label="Notifications"
```

**Unread Count:**

```
aria-label="[X] unread notifications"
```

**Focus Management:**

- Focus first interactive element when banner appears
- Return focus when notification center closes
- Keyboard shortcuts: `N` to open notifications

---

## 10. Implementation Checklist

**Engineer Tasks (ENG-011 to ENG-013):**

- [ ] Toast infrastructure
  - [ ] Success toasts with brand messages
  - [ ] Error toasts with retry buttons
  - [ ] Info toasts with action links
  - [ ] Warning toasts (dismissible)
  - [ ] Auto-dismiss timers
- [ ] Banner alerts
  - [ ] Queue backlog banner (>10 pending)
  - [ ] Performance banner (<70% rate)
  - [ ] System health banner
  - [ ] Connection status banner
  - [ ] Maintenance banner
- [ ] Browser notifications
  - [ ] Permission request
  - [ ] New approval notifications
  - [ ] SLA breach notifications
  - [ ] Action completion notifications
  - [ ] Sound preferences
- [ ] Notification center (Optional P2)
  - [ ] Slide-out panel
  - [ ] Grouped by date
  - [ ] Mark as read/unread
  - [ ] Empty state

**Designer Validation:**

- [ ] Visual QA on all toast placements
- [ ] Verify banner alert prominence
- [ ] Check notification center UI
- [ ] Confirm accessibility contrast

---

## Reference

**Source:** `docs/design/notification-system-design.md`  
**Additional:** `docs/design/approvals_microcopy.md` (lines 400-550)

---

## Version History

- **1.0** (2025-10-20): Initial microcopy guidance for Phase 4 notification system
