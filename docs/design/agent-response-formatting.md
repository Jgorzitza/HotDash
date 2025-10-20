---
epoch: 2025.10.E1
doc: docs/design/agent-response-formatting.md
owner: designer
created: 2025-10-12
---

# Task 1B: Agent Response Formatting

## Purpose

Define how AI agent responses are displayed in the operator interface, including text formatting, code blocks, links, and attachments.

## Text Formatting Guidelines

### Basic Text Display

```typescript
<Text variant="bodyMd" as="p">
  {agentResponse}
</Text>
```

**Font**: Polaris default (Inter)
**Size**: 14px (bodyMd)
**Line height**: 1.5
**Color**: `--p-color-text`
**Max width**: None (use card padding for constraints)

### Formatting in Agent Responses

**Preserve line breaks**:

```typescript
<Text variant="bodyMd" as="p" style={{ whiteSpace: 'pre-wrap' }}>
  {agentResponse}
</Text>
```

**Bold text** (if agent includes **text**):

```typescript
// Parse markdown-style bold: **text** → <strong>text</strong>
const formatted = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

<Text variant="bodyMd" as="div" dangerouslySetInnerHTML={{ __html: formatted }} />
```

**Italic text** (if agent includes _text_):

```typescript
// Parse markdown-style italic: *text* → <em>text</em>
const formatted = response.replace(/\*(.*?)\*/g, "<em>$1</em>");
```

---

## Code Block Styling

### Inline Code

```typescript
// For inline code: `code here`
<code style={{
  backgroundColor: 'var(--p-color-bg-surface-tertiary)',
  color: 'var(--p-color-text-code)',
  padding: '2px 4px',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '13px',
}}>
  {codeContent}
</code>
```

**Visual**: Light gray background, monospace font
**Padding**: 2px vertical, 4px horizontal
**Border radius**: 3px (subtle)

### Block Code

````typescript
// For code blocks: ```code here```
<pre style={{
  backgroundColor: 'var(--p-color-bg-surface-tertiary)',
  color: 'var(--p-color-text)',
  padding: 'var(--p-space-400)',
  borderRadius: 'var(--p-border-radius-200)',
  overflow: 'auto',
  fontFamily: 'monospace',
  fontSize: '13px',
  lineHeight: '1.6',
}}>
  <code>{codeContent}</code>
</pre>
````

**Visual**: Light gray box, monospace font
**Padding**: 16px all sides
**Border radius**: 8px
**Overflow**: Horizontal scroll for long lines
**Max height**: None (let it grow)

### Code Block with Language Label

```typescript
<div style={{ position: 'relative' }}>
  <div style={{
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: '11px',
    color: 'var(--p-color-text-subdued)',
    textTransform: 'uppercase',
  }}>
    {language}
  </div>
  <pre>{codeContent}</pre>
</div>
```

**Visual**: Language label (e.g., "JSON", "PYTHON") in top-right corner
**Example**: Useful if agent specifies language in `json`

---

## Link and Button Styles

### Inline Links

```typescript
// For URLs in agent responses
<Link url={url} external>
  {linkText}
</Link>
```

**Visual**: Polaris Link component (blue, underlined)
**Behavior**: Opens in new tab if external
**Accessibility**: Announces "opens in new tab" to screen readers

### Call-to-Action Buttons (if agent suggests action)

```typescript
<Button onClick={handleAction}>
  {actionLabel}
</Button>
```

**Example**: Agent says "Click here to view order #1234"
**Visual**: Standard Polaris button (no variant = default)
**Placement**: Inline with text or below response

### Link List (multiple links)

```typescript
<List type="bullet">
  {links.map(link => (
    <List.Item key={link.url}>
      <Link url={link.url} external>{link.text}</Link>
    </List.Item>
  ))}
</List>
```

**Visual**: Bulleted list with Polaris Link components
**Use case**: Agent provides multiple resources

---

## Attachment Preview Patterns

### File Attachment Display

```typescript
<Card>
  <InlineStack gap="300" align="space-between" blockAlign="center">
    <InlineStack gap="200" blockAlign="center">
      <Icon source={AttachmentIcon} />
      <Text variant="bodyMd">{fileName}</Text>
    </InlineStack>
    <Button size="slim" onClick={downloadFile}>
      Download
    </Button>
  </InlineStack>
</Card>
```

**Visual**: Small card with file icon, name, and download button
**Icons**: Use Polaris `AttachmentIcon` or file-type specific icons
**Action**: Download button (opens file in new tab or downloads)

### Image Attachment

```typescript
<div style={{ maxWidth: '400px', marginTop: 'var(--p-space-400)' }}>
  <img
    src={imageUrl}
    alt={imageAlt}
    style={{
      width: '100%',
      height: 'auto',
      borderRadius: 'var(--p-border-radius-200)',
    }}
  />
  <Text variant="bodySm" tone="subdued">{imageCaption}</Text>
</div>
```

**Visual**: Image with rounded corners, caption below
**Max width**: 400px (scales down on mobile)
**Border radius**: 8px
**Caption**: Optional description below image

### Multiple Attachments

```typescript
<BlockStack gap="300">
  <Text variant="headingSm">Attachments</Text>
  {attachments.map(attachment => (
    <AttachmentCard key={attachment.id} attachment={attachment} />
  ))}
</BlockStack>
```

**Visual**: Stacked attachment cards with heading
**Spacing**: 12px gap between cards

---

## Markdown Support

### Recommended Markdown Parser

```bash
npm install react-markdown
```

### Implementation

```typescript
import ReactMarkdown from 'react-markdown';

<ReactMarkdown
  components={{
    // Override default elements with Polaris components
    h1: ({ children }) => <Text variant="headingLg" as="h1">{children}</Text>,
    h2: ({ children }) => <Text variant="headingMd" as="h2">{children}</Text>,
    p: ({ children }) => <Text variant="bodyMd" as="p">{children}</Text>,
    a: ({ href, children }) => <Link url={href} external>{children}</Link>,
    code: ({ inline, children }) =>
      inline
        ? <code className="inline-code">{children}</code>
        : <pre className="code-block"><code>{children}</code></pre>,
  }}
>
  {agentResponse}
</ReactMarkdown>
```

**Rationale**: Agents often return markdown-formatted text
**Benefit**: Automatic parsing of bold, italic, lists, links, headings, code
**Customization**: All elements styled with Polaris components

---

## Agent Response Container

### Full Response Layout

```typescript
<Card>
  <BlockStack gap="400">
    {/* Agent name */}
    <InlineStack gap="200" blockAlign="center">
      <Icon source={PersonIcon} />
      <Text variant="headingSm">{agentName}</Text>
    </InlineStack>

    {/* Response content */}
    <ReactMarkdown>{agentResponse}</ReactMarkdown>

    {/* Attachments (if any) */}
    {attachments.length > 0 && (
      <BlockStack gap="300">
        <Text variant="headingSm">Attachments</Text>
        {attachments.map(att => <AttachmentCard key={att.id} {...att} />)}
      </BlockStack>
    )}

    {/* Timestamp */}
    <Text variant="bodySm" tone="subdued">
      {formatTimestamp(createdAt)}
    </Text>
  </BlockStack>
</Card>
```

**Visual**: Clean card with clear sections
**Spacing**: 16px gap between sections
**Hierarchy**: Agent name → Response → Attachments → Timestamp

---

## Copy Guidelines

### Tone

- **Conversational but professional**: "I found 3 orders for this customer."
- **Action-oriented**: "I recommend approving this refund."
- **Transparent**: "I don't have enough information to answer that question."

### Clarity

- **Short sentences**: Easier to scan
- **Bullet points**: For lists of items
- **Bold key info**: Customer names, order numbers, amounts

### Error Messages

- **Agent error**: "I encountered an error processing your request. Please try again."
- **No results**: "I didn't find any orders matching that criteria."
- **Needs approval**: "This action requires operator approval before I can proceed."

---

## Examples

### Example 1: Order Lookup Response

```markdown
I found **2 orders** for customer Jane Doe:

- Order #1234 - $45.00 - Fulfilled
- Order #5678 - $120.00 - Pending

Would you like me to create a note on their Chatwoot conversation?
```

**Rendered**: Bold "2 orders", bulleted list, question at end

### Example 2: Code in Response

```markdown
The customer's shipping address is:
```

Jane Doe
123 Main St
San Francisco, CA 94102

```

Should I update their profile?
```

**Rendered**: Code block for address (preserves formatting), question at end

### Example 3: Links in Response

```markdown
I found the [order details](https://admin.shopify.com/orders/1234) and the [customer profile](https://admin.shopify.com/customers/5678).

The order is ready to ship.
```

**Rendered**: Two inline links, normal text

---

## Implementation Checklist

✅ **Text formatting**: Use Polaris Text component with `whiteSpace: 'pre-wrap'`
✅ **Code blocks**: Light gray background, monospace font, padding
✅ **Links**: Polaris Link component, external links open in new tab
✅ **Buttons**: Polaris Button for agent-suggested actions
✅ **Attachments**: Card with icon, filename, download button
✅ **Images**: Max width 400px, rounded corners, caption
✅ **Markdown**: Use react-markdown with Polaris component overrides
✅ **Container**: Card with BlockStack for clean layout

**Evidence**: Complete formatting specification for all agent response types
