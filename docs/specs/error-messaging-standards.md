# Error Messaging Standards

**File:** `docs/specs/error-messaging-standards.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-21  
**Status:** Ready for Implementation  
**Purpose:** Standardized error messages with clear recovery steps

---

## Purpose

Comprehensive error messaging framework for HotDash. Defines 3 severity levels (Critical, Warning, Info) with clear, actionable messages and recovery steps. Ensures consistent error communication across the application.

---

## Error Message Principles

### Core Requirements

1. **Clarity Over Jargon**: Plain language, no technical codes
2. **Actionable Guidance**: Tell users what to do next
3. **Appropriate Urgency**: Match severity to actual risk
4. **No Blame**: Never blame the user
5. **Recovery Focus**: How to fix, not just what's wrong

### Voice Guidelines

- ✅ **Professional**: Serious tone for errors
- ✅ **Helpful**: Provide solutions, not just problems
- ✅ **Honest**: Don't hide or minimize issues
- ✅ **Clear**: Simple sentences, no ambiguity
- ❌ **No Hot Rodan Theme**: Errors need clarity, not creativity
- ❌ **No Humor**: Frustrated users don't want jokes

---

## Severity Levels

### 1. Critical (Red)

**Definition:** Blocks core functionality, immediate action required, data loss risk

**Visual Treatment:**

- Color: Red (#CC0000)
- Icon: ⚠ or 🚨
- Banner: Full-width persistent
- Sound: Alert tone (if enabled)

**Use For:**

- Data loss or corruption
- Security breaches
- Integration failures (Shopify disconnect)
- Payment processing errors
- Critical system outages

**Don't Use For:**

- Validation errors (use Warning)
- Network timeouts (use Warning)
- Missing optional data (use Info)

### 2. Warning (Yellow)

**Definition:** Impacts functionality but not blocking, attention needed soon, workarounds available

**Visual Treatment:**

- Color: Orange/Yellow (#FFA500)
- Icon: ⚠
- Banner: Top of section
- Toast: Optional
- Sound: Optional notification

**Use For:**

- Integration degraded (partial data)
- API rate limits approaching
- Validation errors
- Configuration issues
- Non-critical failures

**Don't Use For:**

- Total failures (use Critical)
- Informational messages (use Info)
- Success states (use Success toast)

### 3. Info (Blue)

**Definition:** Informational message, no action required or low priority, helpful context

**Visual Treatment:**

- Color: Blue (#0066CC)
- Icon: ℹ
- Banner: Subtle, dismissible
- Toast: Brief display
- Sound: None

**Use For:**

- Feature unavailable (not connected)
- Data limitations (historical not available)
- Suggestions and tips
- Status updates
- New feature announcements

**Don't Use For:**

- Errors requiring action (use Warning/Critical)
- Success messages (use Success toast)

---

## Error Message Templates

### Critical Errors

**1. Database Connection Lost**

```
⚠ Connection lost

Unable to connect to database. Your data is safe, but HotDash cannot load right now.

What to do:
• Refresh this page in 30 seconds
• Check status.hotrodan.com for updates
• Contact support if issue persists

[Retry Connection] [Check Status]
```

**2. Shopify Integration Failed**

```
🚨 Shopify connection lost

HotDash cannot access your Shopify store. Dashboard data will not update until reconnected.

What to do:
1. Go to Settings → Integrations
2. Click "Test Connection" for Shopify
3. Click "Reconnect" if test fails
4. Contact support if reconnection doesn't work

[Go to Settings] [Contact Support]
```

**3. Action Execution Failed**

```
⚠ Action failed

Unable to {action_description}. The action was not completed.

Error: {technical_error_message}

What to do:
• Check {service_name} connection in Settings
• Verify you have necessary permissions
• Try again in a few minutes
• Contact support if problem continues

[Retry] [Go to Settings]
```

**4. Data Corruption Detected**

```
🚨 Data integrity issue

Inconsistency detected in {data_type}. This may affect accuracy.

What we're doing:
• Automatic data validation running
• Backup being verified
• Support team notified

What you should do:
• Don't approve any {related_actions} until resolved
• Check {data_source} directly to verify
• Wait for confirmation email (within 1 hour)

[View Status] [Contact Support]
```

---

### Warning Errors

**1. Integration Degraded**

```
⚠ {Service} connection degraded

{Service_name} is responding slowly. Some features may be delayed or unavailable.

Affected features:
• {feature_1}
• {feature_2}

What to do:
• Core features still working
• Data may be delayed by {time_estimate}
• Check back in {time} for updates

[Retry] [Dismiss]
```

**2. API Rate Limit Approaching**

```
⚠ API quota: {percentage}% used

You've used {used} of {total} daily {service} API calls. Quota resets at midnight UTC.

What this means:
• {feature} may become unavailable if quota exceeded
• Reduce auto-refresh frequency to conserve quota

What to do:
• Adjust auto-refresh to 5 minutes (Settings → Dashboard)
• Manual refresh only when needed
• Quota resets in {hours_remaining} hours

[Adjust Settings] [Dismiss]
```

**3. Validation Error**

```
⚠ Invalid {field_name}

{Field_name} must {requirement}.

Examples of valid input:
• {example_1}
• {example_2}

[Got it]
```

**4. Permission Denied**

```
⚠ Permission required

You don't have permission to {action}.

This action requires: {permission_name}

What to do:
• Ask Shopify account owner to grant {permission_name}
• Or perform this action in Shopify Admin directly

[Learn More] [OK]
```

**5. Configuration Missing**

```
⚠ {Feature} not configured

{Feature_name} requires additional setup before use.

What's needed:
• {requirement_1}
• {requirement_2}

[Set Up Now] [Remind Me Later]
```

---

### Info Messages

**1. Feature Unavailable (Not Connected)**

```
ℹ {Feature} not connected

Connect {service_name} in Settings to enable {feature_name}.

Benefits:
• {benefit_1}
• {benefit_2}

[Connect Now] [Learn More] [Dismiss]
```

**2. Historical Data Not Available**

```
ℹ Historical data unavailable

{Metric_name} requires {time_period} of data. Current data: {current_period}.

Full analytics available after {date}.

[OK]
```

**3. Beta Feature Notice**

```
ℹ Beta feature

{Feature_name} is in beta. It works but may have limitations.

What this means:
• Feature may change based on feedback
• Report any issues to help us improve
• Not all edge cases may be handled

[Got it, show me] [No thanks]
```

**4. Data Sync Delay**

```
ℹ Data syncing

{Service_name} data is updating. This may take up to {time_estimate}.

Last successful sync: {timestamp}

Refresh in {time} for updated data.

[Refresh Now] [Dismiss]
```

---

## Validation Error Messages

### Form Validation

**Required Field:**

```
{Field_name} is required.
```

**Invalid Format:**

```
{Field_name} must be {format}.
Example: {example_value}
```

**Out of Range:**

```
{Field_name} must be between {min} and {max}.
```

**Too Short/Long:**

```
{Field_name} must be {min}-{max} characters.
Current: {current_length} characters.
```

**Already Exists:**

```
{Field_name} "{value}" already exists.
Choose a different {field_name}.
```

### Validation Examples

**Email:**

```
⚠ Invalid email address

Email must be in format: name@example.com

[OK]
```

**Number:**

```
⚠ Invalid quantity

Reorder quantity must be a positive number.
Minimum: 1 unit

[OK]
```

**Date:**

```
⚠ Invalid date range

End date must be after start date.

Start: {start_date}
End: {end_date}

[OK]
```

**File Upload:**

```
⚠ File too large

Maximum file size: {max_size} MB
Your file: {actual_size} MB

Compress the file or upload a smaller version.

[Choose Different File] [Cancel]
```

---

## Network & Connectivity Errors

### Network Errors

**1. Connection Timeout**

```
⚠ Request timed out

The server took too long to respond.

What to do:
• Check your internet connection
• Try again in a few seconds
• If problem persists, check status.hotrodan.com

[Retry] [Dismiss]
```

**2. Offline Mode**

```
⚠ No internet connection

You're offline. HotDash requires an internet connection to load live data.

What you can still do:
• View cached dashboard (data may be stale)
• Read help documentation

[Retry] [Work Offline]
```

**3. Server Error (500)**

```
⚠ Server error

Something went wrong on our end. Your data is safe.

Error ID: {error_id}

What to do:
• Try again in a minute
• If urgent, contact support with error ID above
• Check status.hotrodan.com for service updates

[Retry] [Contact Support]
```

**4. Not Found (404)**

```
⚠ Page not found

The page you're looking for doesn't exist or has moved.

What to do:
• Check the URL for typos
• Use navigation menu to find what you need
• Contact support if you expected this page to exist

[Go to Dashboard] [Contact Support]
```

---

## Authentication & Authorization Errors

**1. Session Expired**

```
ℹ Session expired

For security, we've logged you out after {time} of inactivity.

[Log In Again]
```

**2. Unauthorized**

```
⚠ Permission denied

You don't have permission to access this {resource}.

Contact your Shopify account owner to request access.

[Go Back] [Contact Owner]
```

**3. Invalid Token**

```
⚠ Authentication error

Your authentication token is invalid or expired.

What to do:
• Log out and log back in
• Clear browser cache and cookies
• Contact support if issue persists

[Log Out] [Contact Support]
```

---

## Integration-Specific Errors

**Shopify:**

```
⚠ Shopify API error

Unable to fetch {data_type} from Shopify.

Error: {shopify_error_message}

What to do:
• Verify Shopify store is online
• Check API credentials in Settings
• Retry in a few minutes
• Contact Shopify support if store issue

[Retry] [Check Settings]
```

**Google Analytics:**

```
⚠ Analytics data unavailable

Google Analytics connection failed.

Possible reasons:
• API credentials expired
• Property ID incorrect
• Account access revoked

What to do:
1. Settings → Integrations → Google Analytics
2. Click "Test Connection"
3. Reconnect if test fails

[Go to Settings] [Dismiss]
```

**Chatwoot:**

```
⚠ Chatwoot connection lost

Unable to load customer conversations.

What to do:
• Check Chatwoot service status
• Test connection in Settings
• Respond to customers directly in Chatwoot as workaround

[Test Connection] [Open Chatwoot]
```

---

## Error Message Formula

### Standard Structure

```
[Icon] {Error Type}

{What happened} (1 sentence)

{Why this matters or what's affected} (optional)

What to do:
• {Action step 1}
• {Action step 2}
• {Action step 3}

[Primary Action Button] [Secondary Action]
```

### Examples

**Good Example ✅:**

```
⚠ Unable to save settings

Your notification preferences couldn't be saved due to a connection error.

What to do:
• Check your internet connection
• Try saving again
• Changes won't take effect until saved

[Retry Save] [Cancel]
```

**Bad Example ❌:**

```
Error: ERR_SAVE_FAILED_500

An unexpected error occurred while processing your request to update user preferences in the notification configuration module.

Please try again later or contact administrator.

[OK]
```

**Why Bad:**

- Technical error code (ERR_SAVE_FAILED_500)
- Jargon ("configuration module")
- No specific guidance ("try again later" is vague)
- No helpful action (generic OK button)

---

## Error Context & Evidence

### When to Show Technical Details

**Show to Users:**

- Error ID (for support reference)
- Affected feature/data
- Timeframe (when issue started)
- Recovery steps

**Hide from Users:**

- Stack traces
- Database queries
- API response codes (except 404, 500 as context)
- Internal system paths

**Example:**

```
✅ Good:
Unable to load sales data. Error ID: ERR-2025-1021-042

❌ Bad:
Uncaught TypeError: Cannot read property 'revenue' of undefined at SalesPulse.tsx:47
```

### Error IDs

**Format:**

```
ERR-{YYYY}-{MMDD}-{sequential}
```

**Examples:**

- ERR-2025-1021-001
- ERR-2025-1021-042

**Purpose:**

- Helps support diagnose issues
- Links to server logs
- Tracks error frequency

**User-Facing:**

```
If this problem continues, contact support with error ID: ERR-2025-1021-042
```

---

## Recovery Actions

### Primary Actions (Buttons)

**Retry:**

```
When to use: Temporary failures (network, timeout)
Label: "Retry" or "Try Again"
Behavior: Repeat the failed action
```

**Go to Settings:**

```
When to use: Configuration or connection issues
Label: "Go to Settings" or "Check Settings"
Behavior: Navigate to relevant settings tab
```

**Contact Support:**

```
When to use: Unrecoverable errors, bugs, persistent issues
Label: "Contact Support"
Behavior: Open support email or chat with error context pre-filled
```

**Dismiss:**

```
When to use: User acknowledged, no immediate action needed
Label: "Dismiss" or "OK" or "Got it"
Behavior: Close error message
```

**Refresh Page:**

```
When to use: Stale state, session issues
Label: "Refresh Page"
Behavior: window.location.reload()
```

### Secondary Actions (Links)

- "Learn More" → Help documentation
- "Check Status" → Service status page
- "View Details" → Expand error details
- "Report Issue" → Bug report form

---

## Error Messages by Category

### 1. Network Errors

**Connection Failed:**

```
⚠ Connection failed

Unable to reach the server. Check your internet connection.

[Retry] [Dismiss]
```

**Request Timeout:**

```
⚠ Request timed out

The server didn't respond in time. This may be due to slow internet or high server load.

[Try Again] [Dismiss]
```

**Offline:**

```
⚠ You're offline

HotDash requires an internet connection. Connect to wifi or cellular data to continue.

[Retry] [Work Offline]
```

---

### 2. Authentication Errors

**Login Failed:**

```
⚠ Login failed

Email or password incorrect. Please try again.

Forgot your password? [Reset it here]

[Try Again]
```

**Session Expired:**

```
ℹ Session expired

For security, you've been logged out after {minutes} minutes of inactivity.

[Log In Again]
```

**Account Locked:**

```
⚠ Account temporarily locked

Too many failed login attempts. Account locked for {minutes} minutes.

For immediate access, reset your password.

[Reset Password] [Wait {minutes}m]
```

---

### 3. Integration Errors

**Shopify Not Connected:**

```
⚠ Shopify connection required

HotDash needs access to your Shopify store to display dashboard data.

[Connect Shopify Now] [Learn More]
```

**API Key Invalid:**

```
⚠ Invalid API credentials

{Service} API key is invalid or expired.

What to do:
1. Get a new API key from {service} settings
2. Update credentials in HotDash Settings → Integrations
3. Test connection to verify

[Update Credentials] [How to Get API Key]
```

**Service Unavailable:**

```
⚠ {Service} temporarily unavailable

{Service} is not responding. This is usually temporary.

What to do:
• Check {service} status page
• Try again in 5-10 minutes
• Use {alternative_action} as workaround

[Check Status] [Retry] [Dismiss]
```

---

### 4. Data Errors

**No Data Available:**

```
ℹ No data yet

{Feature} will show data once you've {requirement}.

{Explanation of what data will appear}

[{Setup Action}] [Dismiss]
```

**Data Load Failed:**

```
⚠ Unable to load {data_type}

{Data_type} couldn't be loaded due to a connection error.

Last successful load: {timestamp}

[Retry] [Use Cached Data] [Dismiss]
```

**Invalid Data Format:**

```
⚠ Data format error

{Service} returned data in an unexpected format.

What to do:
• This is likely a temporary issue
• Try refreshing in a few minutes
• Contact support if problem persists (Error ID: {id})

[Retry] [Contact Support]
```

---

### 5. User Action Errors

**Required Field Missing:**

```
⚠ Required field

{Field_name} is required to continue.

[OK]
```

**Invalid Input:**

```
⚠ Invalid {field_name}

{Field_name} must {requirement}.

Example: {valid_example}

[OK]
```

**Unsaved Changes:**

```
⚠ Unsaved changes

You have unsaved changes. Leave without saving?

[Save Changes] [Discard Changes] [Cancel]
```

**Duplicate Entry:**

```
⚠ Already exists

{Item} "{value}" already exists.

What to do:
• Choose a different name
• Edit the existing {item} instead
• Add a number to make it unique

[OK]
```

---

### 6. File Upload Errors

**File Too Large:**

```
⚠ File too large

Maximum file size: {max_size} MB
Your file: {actual_size} MB

Compress the file or choose a smaller one.

[Choose Another File] [Cancel]
```

**Invalid File Type:**

```
⚠ Unsupported file type

Allowed types: {allowed_types}
Your file: {actual_type}

[Choose Valid File] [Cancel]
```

**Upload Failed:**

```
⚠ Upload failed

File upload unsuccessful. This may be due to slow connection or server issue.

[Try Again] [Cancel]
```

---

### 7. Payment & Billing Errors

**Payment Failed:**

```
⚠ Payment declined

Your payment was declined by your card issuer.

What to do:
• Verify card details are correct
• Check with your bank
• Try a different payment method
• Contact support if problem continues

[Try Again] [Update Payment Method]
```

**Subscription Expired:**

```
⚠ Subscription expired

Your HotDash subscription ended on {date}.

Renew now to restore:
• Real-time data updates
• AI approvals
• Analytics reports
• Customer support integration

[Renew Subscription] [Learn More]
```

---

## Error Prevention

### Proactive Messaging

**Before Quota Exceeded:**

```
ℹ API quota: 80% used

You've used 80% of your daily {service} quota. Reduce auto-refresh to avoid hitting limit.

[Adjust Settings] [Dismiss]
```

**Before Session Expires:**

```
ℹ Session expiring soon

You'll be logged out in 5 minutes due to inactivity. Stay logged in?

[Stay Logged In] [Log Out]
```

**Before Data Loss:**

```
⚠ Unsaved changes

You have unsaved changes in {form/feature}. Save before leaving?

[Save] [Discard] [Cancel]
```

---

## Error Recovery Flows

### Example: Shopify Connection Lost

**Step 1: Detect**

```
Dashboard can't load → Display error immediately
```

**Step 2: Alert User**

```
🚨 Shopify connection lost

HotDash cannot access your store. Data will not update until reconnected.
```

**Step 3: Guide Recovery**

```
What to do:
1. Go to Settings → Integrations
2. Click "Test Connection" for Shopify
3. If test fails, click "Reconnect"
4. Authorize HotDash in Shopify again

[Go to Settings] [Contact Support]
```

**Step 4: Confirm Success**

```
✓ Shopify reconnected!

Your dashboard is loading fresh data now.

[Dismiss]
```

---

## Error Message Checklist

**Every Error Message Must Have:**

- [ ] Clear severity (Critical/Warning/Info)
- [ ] Simple description (what happened)
- [ ] User impact (why it matters)
- [ ] Recovery steps (what to do)
- [ ] Primary action button (how to fix)
- [ ] Error ID (for support reference, if applicable)
- [ ] Timestamp (when it occurred, if helpful)

**Every Error Message Should Avoid:**

- [ ] Technical jargon or error codes (except Error ID for support)
- [ ] Blaming the user ("You entered..." → "{Field} must be...")
- [ ] Vague guidance ("Try again later" without specifics)
- [ ] Multiple unrelated issues in one message
- [ ] Humor or casual tone
- [ ] Hot Rodan brand theme (errors need clarity)

---

## Accessibility

### Screen Reader Announcements

**Critical Errors:**

```html
<div role="alert" aria-live="assertive">{Critical error message}</div>
```

**Warnings:**

```html
<div role="status" aria-live="polite">{Warning message}</div>
```

**Info:**

```html
<div role="status" aria-live="polite">{Info message}</div>
```

### Focus Management

**After Error Displays:**

```
Move focus to error message (for keyboard users)
```

**After Dismissal:**

```
Return focus to triggering element
```

### Color Independence

**Don't Rely on Color Alone:**

```
✅ Good: Icon + Color + Text label
Red triangle + "Error" text

❌ Bad: Color only
Red background with no icon or label
```

---

## Error Logging (Internal)

### What to Log (Not User-Facing)

**Log Entry Should Include:**

- Timestamp (UTC)
- User ID
- Session ID
- Error type and severity
- Full error message (technical)
- Stack trace
- Request details (URL, method, payload)
- User action that triggered error
- Browser/device info

**Example Log Entry:**

```json
{
  "timestamp": "2025-10-21T07:45:23Z",
  "userId": "user_123",
  "sessionId": "sess_abc",
  "errorType": "IntegrationError",
  "severity": "CRITICAL",
  "service": "Shopify",
  "message": "Failed to fetch orders: 401 Unauthorized",
  "stack": "...",
  "userAction": "Clicked Sales Pulse tile",
  "browser": "Chrome 118",
  "errorId": "ERR-2025-1021-042"
}
```

---

## Quick Reference

### Severity Decision Tree

```
Can user continue working?
  NO → CRITICAL
  YES → Continue...

Does it affect data accuracy or functionality?
  YES → WARNING
  NO → INFO
```

### Message Length Guidelines

- **Toast (Inline)**: 1 sentence, max 100 characters
- **Banner**: 1-2 sentences, max 200 characters
- **Modal**: 3-5 sentences, clear recovery steps, helpful context

### Action Button Priority

**Primary (Bold, Colored):**

- Retry
- Fix Now
- Go to Settings
- Contact Support

**Secondary (Plain, Gray):**

- Dismiss
- Cancel
- Learn More
- View Details

---

**END OF DOCUMENT**

**Implementation Notes:**

1. Use consistent error patterns across application
2. Log all errors server-side for monitoring
3. Track error frequency to prioritize fixes
4. A/B test error message clarity with user feedback
5. Update error messages based on support ticket patterns

**Questions?** Contact Content team for error message reviews or additions.
