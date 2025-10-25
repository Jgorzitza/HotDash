---
epoch: 2025.10.E1
doc: docs/design/error-states-deep-dive.md
owner: designer
created: 2025-10-12
task: 1G
---

# Task 1G: Error State Design Deep Dive

## Purpose

Design all possible error states with helpful messages and recovery actions for operators.

## Error State Catalog

### 1. Network Errors

#### Lost Connection

```typescript
<Banner tone="critical">
  <InlineStack gap="200" blockAlign="center">
    <Icon source={AlertCircleIcon} />
    <BlockStack gap="100">
      <Text variant="bodyMd" as="p">
        <strong>You're offline.</strong> Check your connection.
      </Text>
      <Button plain onClick={retry}>Try again</Button>
    </BlockStack>
  </InlineStack>
</Banner>
```

**Recovery**: Auto-retry every 5s, manual retry button

#### Slow Connection

```typescript
<Banner tone="info">
  <Text>Connection is slow. This may take a moment...</Text>
</Banner>
```

**Recovery**: Continue loading, show progress indicator

### 2. API Errors

#### 500 Internal Server Error

```typescript
<Banner tone="critical">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>Something went wrong.</strong> Our team has been notified.
    </Text>
    <Text variant="bodySm" tone="subdued">
      Error ID: {errorId} • {timestamp}
    </Text>
    <InlineStack gap="200">
      <Button onClick={retry}>Try again</Button>
      <Button plain url="/support">Contact support</Button>
    </InlineStack>
  </BlockStack>
</Banner>
```

**Recovery**: Retry button, error ID for support, support link

**Copy Guidelines**:

- ❌ "Internal server error" (too technical)
- ✅ "Something went wrong" (operator-friendly)
- ✅ "Our team has been notified" (reassurance)

#### 503 Service Unavailable

```typescript
<Banner tone="warning">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>Service temporarily unavailable.</strong> We're working on it.
    </Text>
    <Text variant="bodySm" tone="subdued">
      Try again in a few moments.
    </Text>
  </BlockStack>
</Banner>
```

**Recovery**: Auto-retry after 10s, suggest waiting

#### 404 Not Found

```typescript
<EmptyState
  heading="Page not found"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>This page doesn't exist or may have been removed.</p>
  <Button url="/">Go to dashboard</Button>
</EmptyState>
```

**Recovery**: Link to dashboard, clear explanation

### 3. Authorization Errors

#### 401 Unauthorized

```typescript
<Banner tone="critical">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>Your session has expired.</strong> Please sign in again.
    </Text>
    <Button onClick={handleSignIn}>Sign in</Button>
  </BlockStack>
</Banner>
```

**Recovery**: Redirect to login, preserve current URL for return

#### 403 Forbidden

```typescript
<Banner tone="critical">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>You don't have permission</strong> to perform this action.
    </Text>
    <Text variant="bodySm" tone="subdued">
      Contact your admin for access.
    </Text>
  </BlockStack>
</Banner>
```

**Recovery**: Clear explanation, admin contact info

### 4. Validation Errors

#### Missing Required Field

```typescript
<TextField
  label="Conversation ID"
  value={value}
  onChange={setValue}
  error="Conversation ID is required"
  helpText="Enter a valid conversation ID"
/>
```

**Recovery**: Inline error, clear guidance on what's needed

#### Invalid Format

```typescript
<TextField
  label="Email"
  value={email}
  onChange={setEmail}
  error="Please enter a valid email address"
  helpText="Example: operator@hotrodan.com"
/>
```

**Recovery**: Example of correct format, validation on blur

### 5. Conflict Errors

#### Already Processed

```typescript
<Banner tone="warning" onDismiss={() => removeCard(id)}>
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>This approval was already processed</strong> by another operator.
    </Text>
    <Button onClick={() => removeCard(id)}>Remove from queue</Button>
  </BlockStack>
</Banner>
```

**Recovery**: Remove from queue, avoid confusion

#### Expired Approval

```typescript
<Banner tone="info">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>This approval has expired.</strong> The conversation may have closed.
    </Text>
    <Button onClick={() => removeCard(id)}>Remove</Button>
  </BlockStack>
</Banner>
```

**Recovery**: Clear explanation, remove option

### 6. Data Errors

#### Empty State (No Data)

```typescript
<EmptyState
  heading="No approvals pending"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>All clear! Check back later.</p>
</EmptyState>
```

**Recovery**: Positive message, no action needed

#### Failed to Load Data

```typescript
<Banner tone="critical">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>Failed to load approvals.</strong>
    </Text>
    <InlineStack gap="200">
      <Button onClick={retry}>Try again</Button>
      <Button plain onClick={refreshPage}>Refresh page</Button>
    </InlineStack>
  </BlockStack>
</Banner>
```

**Recovery**: Retry button, full page refresh option

#### Partial Data Load

```typescript
<Banner tone="warning">
  <Text>Some data couldn't be loaded. Showing what's available.</Text>
</Banner>
```

**Recovery**: Show what loaded, acknowledge incomplete state

### 7. Action Errors

#### Failed to Approve

```typescript
<Toast
  content="Failed to approve. Please try again."
  error
  action={{
    content: 'Retry',
    onAction: () => handleApprove(id),
  }}
  duration={5000}
/>
```

**Recovery**: Toast notification, retry action

#### Failed to Reject

```typescript
<Toast
  content="Failed to reject. Please try again."
  error
  action={{
    content: 'Retry',
    onAction: () => handleReject(id),
  }}
  duration={5000}
/>
```

**Recovery**: Toast notification, retry action

### 8. Timeout Errors

#### Request Timeout

```typescript
<Banner tone="warning">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>Request timed out.</strong> This is taking longer than expected.
    </Text>
    <InlineStack gap="200">
      <Button onClick={retry}>Try again</Button>
      <Button plain onClick={cancel}>Cancel</Button>
    </InlineStack>
  </BlockStack>
</Banner>
```

**Recovery**: Retry or cancel, don't leave operator stuck

### 9. Rate Limit Errors

#### Too Many Requests

```typescript
<Banner tone="warning">
  <BlockStack gap="200">
    <Text variant="bodyMd" as="p">
      <strong>Slow down!</strong> You're making requests too quickly.
    </Text>
    <Text variant="bodySm" tone="subdued">
      Wait {waitSeconds} seconds and try again.
    </Text>
  </BlockStack>
</Banner>
```

**Recovery**: Clear wait time, auto-enable retry after wait

### 10. Browser/Client Errors

#### JavaScript Error (Uncaught)

```typescript
// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Page>
          <Banner tone="critical">
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">
                <strong>Something unexpected happened.</strong>
              </Text>
              <Button onClick={() => window.location.reload()}>
                Reload page
              </Button>
            </BlockStack>
          </Banner>
        </Page>
      );
    }
    return this.props.children;
  }
}
```

**Recovery**: Reload page, log error to monitoring

#### Local Storage Full

```typescript
<Banner tone="warning">
  <Text>
    <strong>Storage full.</strong> Clear your browser cache and reload.
  </Text>
</Banner>
```

**Recovery**: Clear instructions, link to help doc

## Error Message Templates

### Template Structure

```
[SEVERITY] [WHAT HAPPENED] [WHY (optional)] [WHAT TO DO]

Examples:
✅ "Failed to approve. Please try again."
✅ "You're offline. Check your connection."
✅ "This approval was already processed by another operator."
```

### Tone Guidelines

**DO**:

- ✅ Use simple language ("Something went wrong" not "Internal server error")
- ✅ Be specific ("Failed to approve" not "Error occurred")
- ✅ Provide action ("Try again" not just "Error")
- ✅ Reassure ("Our team has been notified")

**DON'T**:

- ❌ Blame user ("You did something wrong")
- ❌ Use technical jargon ("HTTP 500")
- ❌ Be vague ("Error")
- ❌ Leave user stuck (always provide recovery path)

## Recovery Action Patterns

### 1. Retry

```typescript
<Button onClick={handleRetry}>Try again</Button>
```

**When**: Transient errors (network, timeout, 500)

### 2. Refresh

```typescript
<Button onClick={() => window.location.reload()}>Refresh page</Button>
```

**When**: Data stale, persistent errors

### 3. Dismiss

```typescript
<Banner onDismiss={() => setError(null)}>
  {errorMessage}
</Banner>
```

**When**: Non-blocking errors, user can continue

### 4. Navigate

```typescript
<Button url="/dashboard">Go to dashboard</Button>
```

**When**: 404, forbidden, nowhere to go forward

### 5. Contact Support

```typescript
<Button plain url="/support">Contact support</Button>
```

**When**: Persistent errors, user stuck

## Error Logging

```typescript
function handleError(error: Error, context: string) {
  // Log to monitoring service
  console.error(`[${context}]`, error);

  // Send to error tracking (Sentry, etc.)
  logError({
    message: error.message,
    stack: error.stack,
    context,
    userId: currentUser.id,
    timestamp: new Date().toISOString(),
  });

  // Show user-friendly message
  showToast({
    content: getUserFriendlyMessage(error),
    error: true,
  });
}

function getUserFriendlyMessage(error: Error): string {
  if (error.message.includes("Network")) {
    return "You're offline. Check your connection.";
  }
  if (error.message.includes("500")) {
    return "Something went wrong. Our team has been notified.";
  }
  return "Failed to complete action. Please try again.";
}
```

## Testing Error States

```typescript
// Force errors in dev mode
if (import.meta.env.DEV) {
  window.forceError = (type: string) => {
    switch (type) {
      case "network":
        throw new Error("Network error");
      case "500":
        return { status: 500, message: "Internal server error" };
      case "timeout":
        return new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 100),
        );
    }
  };
}
```

---

**Status**: Comprehensive error state catalog - 10 error types, helpful messages, clear recovery paths
