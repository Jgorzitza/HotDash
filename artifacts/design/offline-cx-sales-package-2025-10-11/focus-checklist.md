# Offline Focus Checklist — CX Escalations & Sales Pulse Modals

## Purpose
Keyboard walk-through script for QA and enablement when the Shopify Admin embed is unavailable. Use alongside the PNG mocks and JSX snippets in this package.

## CX Escalations Modal
1. Activate modal via tile CTA (or mock route). Confirm initial focus on the close button.
2. Press `Tab` to reach the suggested reply textarea; verify helper text references the support inbox.
3. Press `Tab` to internal note textarea; type sample text and ensure helper reminder is visible.
4. `Tab` through the button row in order: `Approve & send` → `Escalate` → `Mark resolved` → `Cancel`.
5. Trigger primary action; confirm success toast string `Reply sent to {customer}` is queued. On error mock, expect retry guidance.
6. Press `Esc` to close; ensure focus returns to originating tile CTA.

## Sales Pulse Modal
1. Open modal; confirm close button receives focus.
2. `Tab` to action select and switch between `Log follow-up` and `Escalate to ops`; observe submit button text updating accordingly.
3. `Tab` to notes textarea; confirm placeholder guides audit logging.
4. `Tab` to submit button, then `Tab` to `Cancel`; reverse-tab (`Shift+Tab`) to ensure order is symmetric.
5. Submit each action variant; record expected toast copy and confirm variance helper text mentions `customer.support@hotrodan.com`.
6. Validate that pointer focus (click into Top SKUs list) does not break keyboard return path: pressing `Shift+Tab` twice should land back on close button.

## Evidence capture
- Log tab sequence observations and toast strings in `feedback/qa.md` until live Playwright runs resume.
- Attach screenshots of the PNG mock with annotated notes when sharing with enablement or marketing.
