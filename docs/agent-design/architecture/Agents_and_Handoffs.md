# Agents & Handoffs (Architecture)

## Roles
- **Customer‑Front Agent (Chatwoot intake)**: Detects intent then **hands off** the thread to exactly one specialist:
  - **Accounts Sub‑agent** for authenticated customer tasks (order status, returns, account preferences) via **Customer Accounts MCP**.
  - **Storefront Sub‑agent** for catalog discovery, availability, policies via **Storefront MCP** plus RAG facts.
  The front agent reassembles a **redacted** reply. Operator approves (HITL) before sending.
- **CEO‑Front Agent**: Answers CEO questions strictly from the **Action Queue** evidence created by background agents; never invents data.
- **Background Specialists**: Analytics, Inventory, Content/SEO/Perf, Risk. They run on schedules and events, publishing standardized **Action** items.

## Handoff Pattern (must do)
- The front agent **triages** → **hands off** to exactly one sub‑agent → sub‑agent **owns** the work until completion → returns a structured result → front agent composes/redacts and obtains HITL approval.
- No fan‑out chatter (prevents token burn and conflicting state).

## Tool allowlists (must enforce)
- **Customer‑Front Agent**: may call **Storefront MCP** only. It must **not** call Customer Accounts MCP directly.
- **Accounts Sub‑agent**: the **only** agent allowed to call **Customer Accounts MCP** (token scoped per session).
- **CEO‑Front Agent**: read‑only Storefront MCP and Action Queue; no Customer Accounts MCP.
- **Dev MCP**: allowed **only** in dev/staging and never shipped in runtime builds.

## Evidence-first Replies
- A customer reply is drafted **only** after the sub‑agent returned valid MCP evidence (request IDs, structured data). The front agent formats the reply and attaches a PII card for operator‑only view.

## Acceptance criteria
- Every customer request shows one clear owner (which sub‑agent handled it).
- Every reply/action cites **MCP request IDs** and data sources.
- PII never leaves the PII card; public text is redacted.
- Front agents cannot invoke Dev MCP; production bundles contain no Dev MCP import.

## References
- OpenAI Agents SDK (handoffs): https://openai.github.io/openai-agents-js/guides/handoffs/
- Shopify Storefront MCP overview: https://shopify.dev/docs/apps/build/storefront-mcp
