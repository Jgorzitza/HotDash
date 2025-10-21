# Shopify MCP Split (Storefront vs Customer Accounts)

## Purpose
Use the right server for each task to balance helpfulness and safety.

### Storefront MCP — public shopping context
- Tools to help users **browse products, manage carts, and view policies** for a specific store.
- Used by: Customer‑Front Agent (general questions), CEO‑Front Agent (evidence for tiles).
- Never returns PII. Ideal for availability, pricing, cart links.

### Customer Accounts MCP — authenticated customer context
- Tools for **order status, returns, account details**.
- Requires **OAuth 2.0 with PKCE**; tokens scoped per customer session.
- Used only by the **Accounts Sub‑agent**. Responses are converted into **structured, redacted blocks** before rendering.

### Dev MCP
- For local development and exploration only. **Prohibited** in production flows.

## Security controls (must implement)
- **ABAC policy** in front of Customer Accounts MCP: (agent = accounts_sub) AND (session.customer_id matches) AND (tool in allowlist).
- **PII Broker**: stores/rotates tokens, redacts fields (emails, full addresses), and logs an audit line for each call.
- **Redaction discipline**: Customer‑Front Agent receives a redacted summary + a private PII card for operator approval.

## Acceptance
- Any task touching PII flows through the Accounts Sub‑agent with OAuth token proof.
- No production agent can import or call Dev MCP.
- Operator sees which MCP was used and can open the audit trail.

## References
- Storefront MCP server tools: https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront
- Customer Accounts MCP (auth & tools): https://shopify.dev/docs/apps/build/storefront-mcp/servers/customer-account
- Customer Account API background: https://shopify.dev/docs/api/customer
