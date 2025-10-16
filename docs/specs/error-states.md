# Error States and Empty States

Status: Draft (2025-10-16)
Owner: Designer
Applies to: Dashboard tiles, Approvals drawer

---

## Principles
- Be clear, calm, and actionable
- Don’t block unrelated work (localize errors to the component)
- Provide recovery steps and links to diagnostics

## Dashboard Tiles
- Error (recoverable): Inline Banner with concise message and retry
- Error (non-recoverable): Inline Banner + link to logs/evidence
- Empty: EmptyState with brief explanation and next action

### Copy Patterns
- Error: “We couldn’t load Revenue. Try again.” [Retry]
- Empty: “No data yet. Connect your analytics to see Revenue here.” [Connect]

## Approvals Drawer
- Validation errors: inline near field with helper text
- Global errors: top Banner summarizing issues
- Empty evidence: EmptyState describing what evidence is required

## Polaris Mapping
- Banner (critical/warning) for errors
- EmptyState for empty
- InlineError for form fields

## Accessibility
- Errors announced via role=alert
- Clear color + icon + text (not color alone)
- Focus directed to the first error on submit

## Acceptance
- Retry restores successful state without nav
- Error styles consistent across tiles/drawer
- Copy reviewed by product for tone

