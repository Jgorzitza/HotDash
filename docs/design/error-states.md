# Error States and Empty States

**File:** `docs/design/error-states.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Define error states, empty states, and user guidance patterns for all components in the Hot Rod AN Control Center, ensuring clear communication and recovery paths.

---

## 2. Error State Principles

### 2.1 Design Principles

1. **Be Specific** - Explain what went wrong
2. **Be Helpful** - Provide actionable next steps
3. **Be Empathetic** - Use friendly, non-technical language
4. **Be Visible** - Use color, icons, and placement to draw attention
5. **Be Recoverable** - Always provide a way forward

### 2.2 Error Severity Levels

| Level | Color | Icon | Use Case |
|-------|-------|------|----------|
| **Critical** | Red | ⚠️ | System failure, data loss risk |
| **Warning** | Yellow | ⚠️ | Potential issues, degraded functionality |
| **Info** | Blue | ℹ️ | Informational, no action required |
| **Success** | Green | ✓ | Confirmation, positive feedback |

---

## 3. Error State Patterns

### 3.1 Network Error

**Scenario:** API request failed due to network issues

**Message:**
```
Unable to connect
Check your network connection and try again.
```

**Component:**
```tsx
function NetworkError({ onRetry }) {
  return (
    <div className="occ-error occ-error-critical">
      <span className="occ-error-icon">⚠️</span>
      <div className="occ-error-content">
        <h3>Unable to connect</h3>
        <p>Check your network connection and try again.</p>
        <button onClick={onRetry} className="occ-button occ-button-secondary">
          Retry
        </button>
      </div>
    </div>
  );
}
```

**CSS:**
```css
.occ-error {
  display: flex;
  align-items: flex-start;
  gap: var(--occ-space-3);
  padding: var(--occ-space-4);
  border-radius: var(--occ-radius-md);
  border: 1px solid;
}

.occ-error-critical {
  background-color: var(--occ-status-attention-bg);
  border-color: var(--occ-status-attention-border);
  color: var(--occ-status-attention-text);
}

.occ-error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.occ-error-content h3 {
  margin: 0 0 var(--occ-space-2) 0;
  font-size: var(--occ-font-size-lg);
  font-weight: var(--occ-font-weight-semibold);
  color: var(--occ-text-primary);
}

.occ-error-content p {
  margin: 0 0 var(--occ-space-3) 0;
  color: var(--occ-text-secondary);
}
```

### 3.2 Authentication Error

**Scenario:** User session expired or invalid credentials

**Message:**
```
Authentication required
Your session has expired. Please reconnect to continue.
```

**Component:**
```tsx
function AuthError({ onReconnect }) {
  return (
    <div className="occ-error occ-error-warning">
      <span className="occ-error-icon">🔒</span>
      <div className="occ-error-content">
        <h3>Authentication required</h3>
        <p>Your session has expired. Please reconnect to continue.</p>
        <button onClick={onReconnect} className="occ-button occ-button-primary">
          Reconnect
        </button>
      </div>
    </div>
  );
}
```

### 3.3 Validation Error

**Scenario:** User input failed validation

**Message:**
```
Invalid input
Please check the highlighted fields and try again.
```

**Component:**
```tsx
function ValidationError({ errors }) {
  return (
    <div className="occ-error occ-error-warning">
      <span className="occ-error-icon">⚠️</span>
      <div className="occ-error-content">
        <h3>Invalid input</h3>
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### 3.4 Permission Error

**Scenario:** User lacks permission for action

**Message:**
```
Permission denied
You don't have permission to perform this action. Contact your administrator.
```

**Component:**
```tsx
function PermissionError() {
  return (
    <div className="occ-error occ-error-warning">
      <span className="occ-error-icon">🚫</span>
      <div className="occ-error-content">
        <h3>Permission denied</h3>
        <p>You don't have permission to perform this action. Contact your administrator.</p>
      </div>
    </div>
  );
}
```

### 3.5 Timeout Error

**Scenario:** Request took too long

**Message:**
```
Request timed out
The request took too long to complete. Please try again.
```

**Component:**
```tsx
function TimeoutError({ onRetry }) {
  return (
    <div className="occ-error occ-error-warning">
      <span className="occ-error-icon">⏱️</span>
      <div className="occ-error-content">
        <h3>Request timed out</h3>
        <p>The request took too long to complete. Please try again.</p>
        <button onClick={onRetry} className="occ-button occ-button-secondary">
          Try again
        </button>
      </div>
    </div>
  );
}
```

### 3.6 Server Error

**Scenario:** 500 Internal Server Error

**Message:**
```
Something went wrong
We're experiencing technical difficulties. Please try again later.
```

**Component:**
```tsx
function ServerError({ errorId }) {
  return (
    <div className="occ-error occ-error-critical">
      <span className="occ-error-icon">⚠️</span>
      <div className="occ-error-content">
        <h3>Something went wrong</h3>
        <p>We're experiencing technical difficulties. Please try again later.</p>
        {errorId && (
          <p className="occ-error-id">Error ID: {errorId}</p>
        )}
        <a href="mailto:support@hotrodan.com" className="occ-link">
          Contact support
        </a>
      </div>
    </div>
  );
}
```

---

## 4. Empty State Patterns

### 4.1 No Data Available

**Scenario:** No data to display (normal state)

**Message:**
```
No [data type] right now
Data will appear here when available.
```

**Component:**
```tsx
function EmptyState({ title, message, icon }) {
  return (
    <div className="occ-empty-state">
      {icon && <span className="occ-empty-icon">{icon}</span>}
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
```

**CSS:**
```css
.occ-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--occ-space-8);
  text-align: center;
  color: var(--occ-text-secondary);
}

.occ-empty-icon {
  font-size: 3rem;
  margin-bottom: var(--occ-space-4);
  opacity: 0.5;
}

.occ-empty-state h3 {
  margin: 0 0 var(--occ-space-2) 0;
  font-size: var(--occ-font-size-lg);
  font-weight: var(--occ-font-weight-semibold);
  color: var(--occ-text-primary);
}

.occ-empty-state p {
  margin: 0;
  max-width: 400px;
}
```

### 4.2 Unconfigured State

**Scenario:** Feature requires setup

**Message:**
```
Configuration required
Connect [integration] to enable this feature.
```

**Component:**
```tsx
function UnconfiguredState({ integration, onSetup }) {
  return (
    <div className="occ-empty-state">
      <span className="occ-empty-icon">⚙️</span>
      <h3>Configuration required</h3>
      <p>Connect {integration} to enable this feature.</p>
      <button onClick={onSetup} className="occ-button occ-button-primary">
        Set up {integration}
      </button>
    </div>
  );
}
```

### 4.3 Filtered Empty State

**Scenario:** No results match filters

**Message:**
```
No results found
Try adjusting your filters or search terms.
```

**Component:**
```tsx
function FilteredEmptyState({ onClearFilters }) {
  return (
    <div className="occ-empty-state">
      <span className="occ-empty-icon">🔍</span>
      <h3>No results found</h3>
      <p>Try adjusting your filters or search terms.</p>
      <button onClick={onClearFilters} className="occ-button occ-button-secondary">
        Clear filters
      </button>
    </div>
  );
}
```

### 4.4 Success Empty State

**Scenario:** All tasks complete (positive empty state)

**Message:**
```
All clear!
No pending approvals right now.
```

**Component:**
```tsx
function SuccessEmptyState() {
  return (
    <div className="occ-empty-state occ-empty-state-success">
      <span className="occ-empty-icon">✓</span>
      <h3>All clear!</h3>
      <p>No pending approvals right now.</p>
    </div>
  );
}
```

**CSS:**
```css
.occ-empty-state-success .occ-empty-icon {
  color: var(--occ-text-success);
}
```

---

## 5. Tile-Specific Error States

### 5.1 Ops Pulse Tile

**Error:** "Unable to load metrics. Retry?"  
**Empty:** "No activation data yet." / "No resolved breaches in window."

### 5.2 Sales Pulse Tile

**Error:** "Unable to load sales data. Check Shopify connection."  
**Empty:** "No orders in current window."

### 5.3 Fulfillment Health Tile

**Error:** "Unable to load fulfillment data."  
**Empty:** "All recent orders are on track."

### 5.4 Inventory Heatmap Tile

**Error:** "Unable to load inventory data."  
**Empty:** "No low stock alerts right now."

### 5.5 CX Escalations Tile

**Error:** "Unable to load conversations. Check Chatwoot connection."  
**Empty:** "No SLA breaches detected."

### 5.6 Approvals Queue

**Error:** "Unable to load approvals."  
**Empty:** "All clear! No pending approvals."

---

## 6. Inline Error Messages

### 6.1 Form Field Errors

```tsx
function TextField({ label, error, ...props }) {
  return (
    <div className="occ-field">
      <label>{label}</label>
      <input 
        className={error ? 'occ-input-error' : ''} 
        aria-invalid={!!error}
        aria-describedby={error ? 'error-message' : undefined}
        {...props} 
      />
      {error && (
        <p id="error-message" className="occ-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

**CSS:**
```css
.occ-input-error {
  border-color: var(--occ-status-attention-border);
}

.occ-field-error {
  margin: var(--occ-space-1) 0 0 0;
  font-size: var(--occ-font-size-sm);
  color: var(--occ-status-attention-text);
}
```

### 6.2 Banner Errors

**Polaris Banner component:**
```tsx
<Banner tone="critical" onDismiss={handleDismiss}>
  <p>Unable to save changes. Please try again.</p>
</Banner>
```

---

## 7. Toast Notifications

### 7.1 Error Toast

```tsx
function ErrorToast({ message, onDismiss }) {
  return (
    <div className="occ-toast occ-toast-error">
      <span className="occ-toast-icon">⚠️</span>
      <p>{message}</p>
      <button onClick={onDismiss} className="occ-toast-close">×</button>
    </div>
  );
}
```

**CSS:**
```css
.occ-toast {
  display: flex;
  align-items: center;
  gap: var(--occ-space-3);
  padding: var(--occ-space-4);
  border-radius: var(--occ-radius-md);
  box-shadow: var(--occ-shadow-lg);
  min-width: 300px;
  max-width: 500px;
}

.occ-toast-error {
  background-color: var(--occ-toast-error-bg);
  border: 1px solid var(--occ-toast-error-border);
  color: var(--occ-toast-error-text);
}

.occ-toast-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
}
```

### 7.2 Success Toast

```tsx
function SuccessToast({ message, onDismiss }) {
  return (
    <div className="occ-toast occ-toast-success">
      <span className="occ-toast-icon">✓</span>
      <p>{message}</p>
      <button onClick={onDismiss} className="occ-toast-close">×</button>
    </div>
  );
}
```

---

## 8. Accessibility

### 8.1 ARIA Attributes

**Error messages:**
```html
<div role="alert" aria-live="assertive">
  <p>Unable to save changes. Please try again.</p>
</div>
```

**Form errors:**
```html
<input 
  aria-invalid="true" 
  aria-describedby="error-message"
/>
<p id="error-message" role="alert">
  This field is required
</p>
```

### 8.2 Screen Reader Announcements

**Error announcement:**
```tsx
<div aria-live="assertive" aria-atomic="true" className="sr-only">
  Error: {errorMessage}
</div>
```

**Success announcement:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Success: {successMessage}
</div>
```

### 8.3 Focus Management

**Focus on error after submission:**
```tsx
useEffect(() => {
  if (error) {
    errorRef.current?.focus();
  }
}, [error]);
```

---

## 9. Error Recovery Patterns

### 9.1 Retry with Exponential Backoff

```tsx
function useRetry(fn, maxRetries = 3) {
  const [retryCount, setRetryCount] = useState(0);
  
  const retry = async () => {
    try {
      await fn();
      setRetryCount(0);
    } catch (error) {
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          retry();
        }, delay);
      }
    }
  };
  
  return { retry, retryCount };
}
```

### 9.2 Offline Detection

```tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

### 9.3 Graceful Degradation

```tsx
function TileCard({ tile }) {
  if (tile.status === 'error') {
    return <ErrorState error={tile.error} onRetry={handleRetry} />;
  }
  
  if (tile.status === 'unconfigured') {
    return <UnconfiguredState onSetup={handleSetup} />;
  }
  
  if (!tile.data) {
    return <EmptyState />;
  }
  
  return <TileContent data={tile.data} />;
}
```

---

## 10. Testing Checklist

### 10.1 Error State Testing

- [ ] Network error displays correctly
- [ ] Auth error displays correctly
- [ ] Validation errors display correctly
- [ ] Server error displays correctly
- [ ] Retry button works
- [ ] Error messages are clear and actionable

### 10.2 Empty State Testing

- [ ] No data empty state displays
- [ ] Unconfigured state displays
- [ ] Filtered empty state displays
- [ ] Success empty state displays
- [ ] Action buttons work

### 10.3 Accessibility Testing

- [ ] Error messages announced by screen readers
- [ ] `role="alert"` on critical errors
- [ ] Focus moves to error on submission
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works

---

## 11. Copy Guidelines

### 11.1 Error Message Structure

**Format:** `[What happened] [Why it happened] [What to do]`

**Good:**
- "Unable to connect. Check your network connection and try again."
- "Session expired. Please log in again to continue."

**Bad:**
- "Error 500" (too technical)
- "Something went wrong" (not specific enough)

### 11.2 Tone

- **Empathetic:** "We're sorry, something went wrong."
- **Helpful:** "Try refreshing the page or contact support."
- **Clear:** "Your session has expired. Please log in again."
- **Avoid:** Technical jargon, blame, vague messages

---

## 12. References

- Design tokens: `app/styles/tokens.css`
- Dashboard tiles: `docs/design/dashboard-tiles.md`
- Polaris error patterns: https://polaris.shopify.com/components/feedback-indicators/banner
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- Error message guidelines: https://www.nngroup.com/articles/error-message-guidelines/

