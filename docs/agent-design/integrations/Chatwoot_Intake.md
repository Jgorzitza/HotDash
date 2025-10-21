# Chatwoot Intake → Customer‑Front Agent

## Goal
Route all customer messages from Chatwoot to the Customer‑Front Agent, which performs intent detection and **hands off** to the correct sub‑agent.

## What to set up (non-code)
1. **Webhooks**: Enable Chatwoot webhooks for message events. Point to your intake endpoint.
2. **Intent slots**: Map common intents (order status, returns, product fit, policy) to handoff targets.
3. **Handoff rule**: Only one sub‑agent owns a thread at a time.
4. **Idempotency**: Deduplicate repeated webhook deliveries (use `conversation_id` and message timestamp).

## Acceptance
- New message → work item appears for the Customer‑Front Agent within 5 seconds.
- Handoff target matches the intent matrix.
- Duplicate webhook deliveries (if they occur) do not produce duplicate work items.

## References
- Chatwoot Webhooks basics: https://www.chatwoot.com/hc/user-guide/articles/1677693021-how-to-use-webhooks
- Advanced features / events reference: https://www.chatwoot.com/hc/user-guide/en/categories/advanced-features-explained
