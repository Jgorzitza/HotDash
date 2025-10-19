# CX Conversation UI Patterns

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Chatwoot CX conversation interface (North Star scope #3)

---

## 1. CX Dashboard Tile

### 1.1 Structure

```tsx
<TileCard title="CX Escalations" tile={cxState}>
  <Stack gap="base">
    {/* SLA summary */}
    <InlineStack align="space-between">
      <Text variant="bodySm">SLA Breaches</Text>
      <Badge tone={slaBreaches > 0 ? "critical" : "success"}>
        {slaBreaches}
      </Badge>
    </InlineStack>

    {/* Conversation queue */}
    <Stack gap="small" as="ol">
      {conversations.map((conv) => (
        <li key={conv.id}>
          <InlineStack align="space-between" blockAlign="center">
            <Stack gap="small-200">
              <Text fontWeight="semibold">{conv.customerName}</Text>
              <Text variant="bodySm" tone="subdued">
                {conv.status}
                {conv.slaBreached && " • SLA breached"}
              </Text>
            </Stack>
            <Button onClick={() => reviewConversation(conv.id)}>Review</Button>
          </InlineStack>
        </li>
      ))}
    </Stack>

    {/* Empty state */}
    {conversations.length === 0 && (
      <Text tone="subdued">No SLA breaches detected.</Text>
    )}
  </Stack>
</TileCard>
```

### 1.2 Microcopy

| Element       | Copy                                 | Notes          |
| ------------- | ------------------------------------ | -------------- |
| Tile title    | "CX Escalations"                     | Dashboard tile |
| Empty state   | "No SLA breaches detected."          | Success state  |
| SLA badge     | "{count}" with critical/success tone | Numeric badge  |
| Review button | "Review"                             | Opens CX modal |
| Status text   | "{status} • SLA breached"            | Inline alert   |

---

## 2. CX Escalation Modal (Detailed)

### 2.1 Full Modal Structure

```tsx
<Modal
  heading={`CX Escalation — ${customerName}`}
  size="large-100"
  onClose={handleClose}
>
  <Stack gap="base">
    {/* Conversation metadata */}
    <Text variant="bodySm" tone="subdued">
      Conversation #{conversationId} · Status: {status}
    </Text>

    {/* Conversation history */}
    <Box
      border="base"
      borderColor="subdued"
      borderRadius="base"
      padding="base"
      maxBlockSize="300px"
      overflow="scroll"
      role="log"
      aria-label="Conversation history"
    >
      {messages.length === 0 ? (
        <Text tone="subdued">No recent messages available.</Text>
      ) : (
        <Stack gap="small">
          {messages.map((msg) => (
            <Box
              key={msg.id}
              padding="small"
              background={msg.isCustomer ? "subdued" : "base"}
            >
              <Text variant="bodySm" fontWeight="semibold">
                {msg.sender}
              </Text>
              <Text>{msg.content}</Text>
              <Text variant="bodySm" tone="subdued">
                {formatTimestamp(msg.createdAt)}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Box>

    {/* AI suggested reply */}
    <Stack gap="small">
      <Text variant="headingMd">Suggested reply</Text>
      {suggestedReply ? (
        <TextField
          label="Reply text"
          labelAccessibilityVisibility="exclusive"
          multiline={6}
          value={replyText}
          onChange={setReplyText}
          placeholder={suggestedReply}
        />
      ) : (
        <Banner tone="warning">
          No template available. Draft response manually or escalate.
        </Banner>
      )}
    </Stack>

    {/* Internal note */}
    <TextField
      label="Internal note"
      multiline={3}
      placeholder="Add context for audit trail"
      value={internalNote}
      onChange={setInternalNote}
    />

    {/* Grading (post-approval) */}
    {showGrading && (
      <Card>
        <Stack gap="small">
          <Text variant="headingMd">Grades (HITL)</Text>

          <Stack gap="base">
            <Stack gap="small-200">
              <Text variant="bodySm">Tone: {toneGrade}</Text>
              <input
                type="range"
                min="1"
                max="5"
                value={toneGrade}
                onChange={(e) => setToneGrade(e.target.value)}
                aria-label="Tone grade from 1 to 5"
              />
            </Stack>

            <Stack gap="small-200">
              <Text variant="bodySm">Accuracy: {accuracyGrade}</Text>
              <input
                type="range"
                min="1"
                max="5"
                value={accuracyGrade}
                onChange={(e) => setAccuracyGrade(e.target.value)}
                aria-label="Accuracy grade from 1 to 5"
              />
            </Stack>

            <Stack gap="small-200">
              <Text variant="bodySm">Policy: {policyGrade}</Text>
              <input
                type="range"
                min="1"
                max="5"
                value={policyGrade}
                onChange={(e) => setPolicyGrade(e.target.value)}
                aria-label="Policy grade from 1 to 5"
              />
            </Stack>
          </Stack>
        </Stack>
      </Card>
    )}

    {/* Error display */}
    {error && (
      <Banner tone="critical" role="alert">
        {error}
      </Banner>
    )}

    {/* CTAs */}
    <ButtonGroup slot="primary-action">
      <Button onClick={handleClose}>Cancel</Button>
      <Button onClick={markResolved}>Mark resolved</Button>
      <Button onClick={escalate}>Escalate</Button>
      <Button variant="primary" onClick={approveAndSend} disabled={!replyText}>
        Approve & send
      </Button>
    </ButtonGroup>
  </Stack>
</Modal>
```

### 2.2 Accessibility Requirements

- [ ] Modal heading format: "CX Escalation — {Customer Name}" (contract test)
- [ ] Conversation history as `role="log"` with `aria-label`
- [ ] Scrollable history with keyboard access
- [ ] All form fields have visible labels
- [ ] Grading sliders have `aria-label`
- [ ] Error messages use `role="alert"`
- [ ] Focus trap in modal
- [ ] Escape closes modal

---

## 3. Conversation History Patterns

### 3.1 Message Bubble Styling

**Customer Message:**

```tsx
<Box padding="small" background="subdued" borderRadius="base">
  <Stack gap="small-200">
    <Text variant="bodySm" fontWeight="semibold">
      {customerName}
    </Text>
    <Text>{message.content}</Text>
    <Text variant="bodySm" tone="subdued">
      {formatTimestamp(message.createdAt)}
    </Text>
  </Stack>
</Box>
```

**Agent/System Message:**

```tsx
<Box padding="small" background="base" borderRadius="base">
  <Stack gap="small-200">
    <Text variant="bodySm" fontWeight="semibold">
      {agentName || "System"}
    </Text>
    <Text>{message.content}</Text>
    <Text variant="bodySm" tone="subdued">
      {formatTimestamp(message.createdAt)}
    </Text>
  </Stack>
</Box>
```

### 3.2 Empty State

```tsx
<Box padding="base">
  <Stack gap="small" align="center">
    <Icon type="chat" size="large" tone="subdued" />
    <Text tone="subdued">No recent messages available.</Text>
  </Stack>
</Box>
```

---

## 4. CX Queue View

### 4.1 Full Queue Interface

```tsx
<Page title="CX Queue">
  <Stack gap="base">
    {/* Filters */}
    <InlineStack gap="base">
      <Select
        label="Status"
        options={[
          { label: "All", value: "all" },
          { label: "Open", value: "open" },
          { label: "SLA Breached", value: "breached" },
          { label: "Resolved", value: "resolved" },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />
      <Select
        label="Channel"
        options={[
          { label: "All", value: "all" },
          { label: "Email", value: "email" },
          { label: "Live Chat", value: "chat" },
          { label: "SMS", value: "sms" },
        ]}
        value={channelFilter}
        onChange={setChannelFilter}
      />
    </InlineStack>

    {/* Queue table */}
    <Table>
      <thead>
        <tr>
          <th scope="col">Customer</th>
          <th scope="col">Channel</th>
          <th scope="col">Status</th>
          <th scope="col">Last Message</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {conversations.map((conv) => (
          <tr key={conv.id}>
            <th scope="row">
              <Stack gap="small-200">
                <Text fontWeight="semibold">{conv.customerName}</Text>
                {conv.slaBreached && (
                  <Badge tone="critical" icon="alert-circle">
                    SLA Breached
                  </Badge>
                )}
              </Stack>
            </th>
            <td>
              <Badge>{conv.channel}</Badge>
            </td>
            <td>{conv.status}</td>
            <td>
              <Text variant="bodySm" tone="subdued">
                {formatTimeAgo(conv.lastMessageAt)}
              </Text>
            </td>
            <td>
              <Button onClick={() => reviewConversation(conv.id)}>
                Review
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Stack>
</Page>
```

### 4.2 Microcopy

| Element        | Copy                                        | Notes           |
| -------------- | ------------------------------------------- | --------------- |
| Page title     | "CX Queue"                                  | h1 heading      |
| SLA badge      | "SLA Breached" with icon                    | Critical tone   |
| Channel badges | "Email", "Live Chat", "SMS"                 | Default tone    |
| Empty queue    | "No conversations in queue. All caught up!" | Success state   |
| Filter labels  | "Status", "Channel"                         | Clear dropdowns |

---

## 5. Grading Interface

### 5.1 Slider Pattern

**Individual Slider:**

```tsx
<Stack gap="small-200">
  <InlineStack align="space-between">
    <Text variant="bodySm">Tone</Text>
    <Text variant="bodySm" fontWeight="semibold">
      {toneGrade}
    </Text>
  </InlineStack>
  <input
    type="range"
    min="1"
    max="5"
    step="1"
    value={toneGrade}
    onChange={(e) => setToneGrade(Number(e.target.value))}
    aria-label="Tone grade: 1 is poor, 5 is excellent"
    aria-valuemin="1"
    aria-valuemax="5"
    aria-valuenow={toneGrade}
    aria-valuetext={`${toneGrade} out of 5`}
  />
  <InlineStack align="space-between">
    <Text variant="bodySm" tone="subdued">
      Poor
    </Text>
    <Text variant="bodySm" tone="subdued">
      Excellent
    </Text>
  </InlineStack>
</Stack>
```

### 5.2 Grading Defaults

- All sliders default to midpoint: `3`
- Display format: "Tone: 3"
- Min: 1, Max: 5, Step: 1
- Labels: "Poor" (1) to "Excellent" (5)

### 5.3 Grading Criteria Help

**Tone (1-5):**

- 5: Perfect brand voice, conversational, empathetic
- 3: Acceptable but could be warmer
- 1: Too formal or too casual

**Accuracy (1-5):**

- 5: All details correct, complete information
- 3: Minor details missing or unclear
- 1: Incorrect information provided

**Policy (1-5):**

- 5: Follows all policies, no legal/compliance issues
- 3: Minor policy deviation
- 1: Violates policy or legal requirement

---

## 6. Channel-Specific Patterns

### 6.1 Email

**Metadata Display:**

```tsx
<Stack gap="small-200">
  <Text variant="bodySm" tone="subdued">
    From: {customer.email}
  </Text>
  <Text variant="bodySm" tone="subdued">
    Subject: {emailSubject}
  </Text>
  <Text variant="bodySm" tone="subdued">
    Received: {formatTimestamp(receivedAt)}
  </Text>
</Stack>
```

### 6.2 Live Chat

**Real-Time Indicator:**

```tsx
<InlineStack gap="small-200">
  <Badge tone="success">
    <span className="pulse-dot" /> Live
  </Badge>
  <Text variant="bodySm" tone="subdued">
    Customer is online
  </Text>
</InlineStack>
```

### 6.3 SMS

**Phone Display:**

```tsx
<Text variant="bodySm" tone="subdued">
  From: {formatPhoneNumber(customer.phone)}
</Text>
<Text variant="bodySm" tone="subdued">
  Character count: {replyText.length}/160
</Text>
```

---

## 7. Responsive Behavior

### Desktop

- Side-by-side: conversation history + reply form
- Modal width: large-100

### Tablet

- Stacked: history above, reply below
- Modal width: large

### Mobile

- Full-screen modal
- Compact message bubbles
- Touch-optimized buttons (min 44px)

---

## 8. Accessibility Checklist

- [ ] Modal heading: "CX Escalation — {Customer Name}"
- [ ] Conversation history: `role="log"` with `aria-label`
- [ ] Suggested reply: visible label "Reply text"
- [ ] Internal note: visible label "Internal note"
- [ ] Grading sliders: `aria-label` with min/max/current
- [ ] All buttons have descriptive text
- [ ] Error messages: `role="alert"`
- [ ] Keyboard: Tab through all fields, Enter submits, Escape closes

---

## Change Log

- **2025-10-19:** v1.0 - CX conversation UI patterns (North Star scope #3)
