# Shopify Storefront MCP Server Notes

Source: https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront

## Key points

- Storefront MCP servers allow custom agents to consume Storefront API data via the Model Context Protocol.
- Authentication uses Storefront API access tokens scoped to customer-facing data (orders, products, etc.).
- The server exposes actions/fonts to MCP clients (LLMs, agents). Each action maps to a Storefront GraphQL query/mutation.
- Responses must be tailored for end-user contexts; sanitize sensitive fields (PII) before returning.
- Requires HTTPS endpoint, schema definition, and secrets management for API keys.
- Rate limited separately from Admin API; follow Storefront API limits.

## HotDash usage

- Customer-facing agent should call the MCP server for order history, tracking info, and support workflows instead of hitting Admin API directly.
- Maintain the MCP server code under `packages/ai/` (or similar) and configure with Storefront API credentials stored in vault/GitHub.
- Document available actions and prompts in the enablement/support playbooks so agents know what the storefront agent can answer.
