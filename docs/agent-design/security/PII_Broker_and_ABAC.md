# Customer Data Security: PII Broker + ABAC

## Policy
- **Least privilege**: Only the Accounts Sub‑agent can call Customer Accounts MCP.
- **ABAC**: Allow calls only if (agent=accounts_sub) AND (session.customer_id matches) AND (tool in allowlist).
- **PII Broker**: Fronts Customer Accounts MCP; handles OAuth tokens, redaction, and audit logging.
- **Redaction**: Public replies contain no PII. Use a private **PII card** (operator‑only) for details.

## Audit
- Write an audit line per call: timestamp, agent, tool, purpose, minimal parameters, and MCP request_id.
- Keep logs separate from chat transcripts.

## Acceptance
- Red‑team test: attempt PII exfiltration via customer‑front agent → blocked or redacted.
- Operator approval is required for any reply containing account facts.
- Audit ledger shows end‑to‑end trace for an order‑status case.

## References
- Customer Accounts MCP (OAuth + scopes): https://shopify.dev/docs/apps/build/storefront-mcp/servers/customer-account
- Customer Account API concepts: https://shopify.dev/docs/api/customer
