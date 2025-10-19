# Settings & Configuration UI Patterns

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Settings interface patterns for integrations & preferences

---

## 1. Settings Page Layout

```tsx
<Page title="Settings">
  <Layout>
    <Layout.Section>
      <Card>
        <Stack gap="base">
          <Text variant="headingLg">Integrations</Text>

          {/* Shopify */}
          <InlineStack align="space-between" blockAlign="center">
            <Stack gap="small-200">
              <Text fontWeight="semibold">Shopify Admin</Text>
              <Text variant="bodySm" tone="subdued">
                Connected • Store: {shopName}
              </Text>
            </Stack>
            <Badge tone="success">Active</Badge>
          </InlineStack>

          {/* Chatwoot */}
          <InlineStack align="space-between" blockAlign="center">
            <Stack gap="small-200">
              <Text fontWeight="semibold">Chatwoot CX</Text>
              <Text variant="bodySm" tone="subdued">
                {connected
                  ? `Connected • ${conversationCount} conversations`
                  : "Not configured"}
              </Text>
            </Stack>
            {connected ? (
              <Badge tone="success">Active</Badge>
            ) : (
              <Button onClick={configureChatwoot}>Configure</Button>
            )}
          </InlineStack>

          {/* Publer */}
          <InlineStack align="space-between" blockAlign="center">
            <Stack gap="small-200">
              <Text fontWeight="semibold">Publer Social</Text>
              <Text variant="bodySm" tone="subdued">
                {publerConnected
                  ? `Connected • ${accountCount} accounts`
                  : "Not configured"}
              </Text>
            </Stack>
            {publerConnected ? (
              <Badge tone="success">Active</Badge>
            ) : (
              <Button onClick={configurePubler}>Configure</Button>
            )}
          </InlineStack>
        </Stack>
      </Card>
    </Layout.Section>
  </Layout>
</Page>
```

---

## 2. Connection Status Patterns

### 2.1 Status Badges

| Status               | Badge Tone | Copy             | Icon             |
| -------------------- | ---------- | ---------------- | ---------------- |
| Connected & healthy  | `success`  | "Active"         | `check-circle`   |
| Connected but issues | `warning`  | "Degraded"       | `alert-triangle` |
| Disconnected         | `critical` | "Disconnected"   | `x-circle`       |
| Not configured       | neutral    | "Not configured" | -                |

### 2.2 Health Check Display

```tsx
<Banner tone={healthStatus === "healthy" ? "success" : "warning"}>
  <Stack gap="small">
    <Text fontWeight="semibold">
      {integration} Health: {healthStatus}
    </Text>
    <Text variant="bodySm">Last checked: {formatTimeAgo(lastCheckAt)}</Text>
    {healthStatus !== "healthy" && (
      <Button onClick={runHealthCheck}>Run Health Check</Button>
    )}
  </Stack>
</Banner>
```

---

## 3. Configuration Forms

### 3.1 Form Structure

```tsx
<Card>
  <form onSubmit={handleSave}>
    <Stack gap="base">
      <Text variant="headingMd">Chatwoot Configuration</Text>

      <TextField
        label="Chatwoot URL"
        type="url"
        value={chatwootUrl}
        onChange={setChatwootUrl}
        placeholder="https://app.chatwoot.com"
        required
        autoComplete="url"
      />

      <PasswordField
        label="API Token"
        value={apiToken}
        onChange={setApiToken}
        required
      />

      <Banner tone="info">
        Token is encrypted and stored securely. Never logged.
      </Banner>

      <ButtonGroup>
        <Button onClick={cancel}>Cancel</Button>
        <Button onClick={testConnection}>Test Connection</Button>
        <Button variant="primary" type="submit">
          Save Configuration
        </Button>
      </ButtonGroup>
    </Stack>
  </form>
</Card>
```

### 3.2 Microcopy

| Element           | Copy                                                    | Notes            |
| ----------------- | ------------------------------------------------------- | ---------------- |
| URL field label   | "Chatwoot URL"                                          | Clear identifier |
| Token field label | "API Token"                                             | Security context |
| Security banner   | "Token is encrypted and stored securely. Never logged." | Info tone        |
| Test button       | "Test Connection"                                       | Before saving    |
| Save button       | "Save Configuration"                                    | Primary action   |
| Success toast     | "Configuration saved. Connection verified."             | After save       |
| Error toast       | "Connection failed. Check URL and token."               | Critical tone    |

---

## 4. Accessibility Requirements

- [ ] All form fields have visible labels
- [ ] Required fields marked with `required` attribute
- [ ] Error messages linked via `aria-describedby`
- [ ] Success/error toasts use `aria-live="polite"`
- [ ] Password field masked with reveal option
- [ ] Test connection result announced to screen readers

---

## Change Log

- **2025-10-19:** v1.0 - Settings & configuration UI patterns
