Status: Planned only — do NOT seed or ship yet

# Storefront MCP for Customer‑Facing Agents (separate from dev MCP)

Goal

- Power customer‑facing tasks (search, cart, policies, order status) using Shopify’s Storefront MCP servers with strict privacy/authentication, distinct from our internal/dev MCP usage.

References (MCP‑verified)

- Storefront MCP server (catalog, cart, policies): https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront
- Customer accounts MCP server (orders, account): https://shopify.dev/docs/apps/build/storefront-mcp/servers/customer-account
- Build agent (React Router) + optional customer auth: https://shopify.dev/docs/apps/build/storefront-mcp/build-storefront-ai-agent?framework=reactRouter

Scope (Day‑1)

- Anonymous tools (no auth): product search, policy/FAQ, cart (create/update/get), checkout URL
- Authenticated tools (optional Day‑1): customer orders lookup/status, order details (requires customer accounts OAuth)

Integration points

- Live chat (Chatwoot):
  - Anonymous: catalog Q&A, policy answers, cart create/show, share checkout URL
  - ‘Connect account’ CTA prompts OAuth (Customer Accounts) to enable order lookup
- Customer Replies composer: ‘Insert account order status’ uses authenticated tool when consented
- Social storefront links: deep links to PDP or checkout with UTM

Authentication & discovery

- Storefront MCP endpoint: `https://{storeDomain}/api/mcp` (unauthenticated)
- Customer accounts MCP endpoint: discover via `/.well-known/customer-account-api` then use `mcp_api` URL
- OAuth PKCE flow (401 → start auth): discover endpoints at `/.well-known/openid-configuration`, request token, store access token securely, retry tools

## Validation checklist (dev sandbox)

1. **Register the MCP client** with a `shopify_storefront` server entry that points to the target shop domain (`https://{storeDomain}/api/mcp`). Configuration belongs in the local MCP registry (for Codex CLI: `~/.config/codex/mcp.json`; for Cursor/Claude: reuse `mcp/mcp-config.json`). Never commit store domains or tokens.
2. **Smoke the anonymous tools** by running the proof command and capturing its output:

   ```bash
   codex exec --json -- "mcp shopify-storefront {'action':'tools.list'}"
   ```

   - Expected: HTTP 200 stream with available anonymous tool IDs (e.g., `search_shop_catalog`, `search_shop_policies_and_faqs`, `get_cart`, `update_cart`).
   - Evidence: paste command + JSON lines into `feedback/ai-customer/YYYY-MM-DD.md#storefront`.

3. **Document blockers immediately.** If the command times out, returns HTTP 4xx/5xx, or the MCP client reports “server not registered,” log the raw stderr to feedback and file an item in `reports/manager/ESCALATION.md` with store domain, command, and timestamp.
4. After anonymous tools succeed, **repeat for customer accounts MCP** once OAuth wiring is ready (requires PKCE + consent UI).

### Sample anonymous `tools.list` output

Captured output should resemble the following JSONL stream (one item per line):

```json
{
  "type": "tool_list",
  "tools": [
    {
      "name": "search_shop_catalog",
      "description": "Search storefront catalog by keyword",
      "input_schema": {
        "type": "object",
        "properties": { "query": { "type": "string" } },
        "required": ["query"]
      }
    },
    {
      "name": "search_shop_policies_and_faqs",
      "description": "Find policies or FAQs",
      "input_schema": {
        "type": "object",
        "properties": { "search_term": { "type": "string" } },
        "required": ["search_term"]
      }
    },
    {
      "name": "get_cart",
      "description": "Fetch a cart by ID",
      "input_schema": {
        "type": "object",
        "properties": { "cart_id": { "type": "string" } },
        "required": ["cart_id"]
      }
    },
    {
      "name": "update_cart",
      "description": "Modify cart line items",
      "input_schema": {
        "type": "object",
        "properties": {
          "cart_id": { "type": "string" },
          "lines": { "type": "array" }
        },
        "required": ["cart_id", "lines"]
      }
    }
  ]
}
```

- Store the raw JSONL under `artifacts/ai-customer/YYYY-MM-DD/storefront-tools.jsonl` (once the artifacts path is available for this lane).
- Summarize key fields (tool names, required inputs) in the feedback log for quick reviewer scan.

### Evidence capture checklist

- Commands, timestamps, and exit codes recorded in `feedback/ai-customer/YYYY-MM-DD.md#storefront`.
- Raw command output saved to artifacts (gzip if >1 MB) with filename convention `storefront-tools.<timestamp>.jsonl`.
- Note any discrepancies (missing tools, schema drift) and link to Shopify release notes if applicable.
- Cross-reference Supabase grading metadata to ensure storefront evidence can attach cleanly to reply drafts.
- If `codex exec --json -- "mcp …"` fails with an SSE handshake error (`unexpected server response: empty sse stream`), capture the fallback HTTP request below and include the stderr plus curl response headers in feedback.

**Fallback HTTP request (non-SSE)**

```bash
curl -s -D storefront-tools.headers \
  -o storefront-tools.jsonl \
  -X POST https://hotroddash.myshopify.com/api/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

- Store both `storefront-tools.headers` and `storefront-tools.jsonl` under `artifacts/ai-customer/YYYY-MM-DD/`.
- Note the SSE limitation in `reports/manager/ESCALATION.md` so the platform team can decide whether to proxy the endpoint through a full MCP transport.

Privacy & consent

- Anonymous mode: never access customer‑scoped data; no PII
- Auth mode: explicit consent; customer signs in; scope only their orders/account
- No tokens in logs; redact PII in transcripts; session‑scoped retention only

Tools (typical)

- Storefront MCP: `search_shop_catalog`, `search_shop_policies_and_faqs`, `get_cart`, `update_cart`
- Customer Accounts MCP: `get_most_recent_order_status`, `get_order_status`, `list_orders` (exact tool names discovered via `tools/list`)

UI & UX

- Storefront chat bubble (theme extension) with brand styling; streams responses
- “Connect my account” banner appears when the assistant needs order data; fallback to email/ZIP order lookup (HITL flow) if auth is declined
- Cart summary cards with thumbnail, title, price, checkout button

Rate limiting & errors

- Respect Shopify rate‑limits; backoff/retry; show user‑friendly errors
- Validation errors surfaced cleanly (e.g., ‘Order not found for #1234’)

Security

- Follow Level 2 protected customer data guidelines; request minimal scopes
- Use PKCE; store tokens securely; wipe on logout/session end

Evidence & auditing

- Store sanitized MCP transcripts for production evidence (no secrets/PII); link to conversation id

Open Items

- Decide initial authenticated features (order status vs full order list)
- Confirm in‑app vs redirect flow for connect banner from Chatwoot

## Fallback work queue (when storefront MCP is unavailable)

1. **Document the blocker** — keep `reports/manager/ESCALATION.md` updated with command output, timestamps, and requested manager action (e.g., register MCP server, provide credentials).
2. **Prepare evidence templates** — stage artifact filenames and feedback sections so successful output can be dropped in immediately once the server responds.
3. **Spec maintenance** — review Shopify’s Storefront MCP documentation weekly to update tool names, schemas, and scope notes here.
4. **Approval rehearsal** — draft the Private Note structure (evidence, risk, rollback, grading metadata) that will accompany storefront-powered replies so reviewers know what to expect the moment tools come online.
5. **Transport alignment** — work with the platform team to determine whether Codex should introduce a Streamable HTTP proxy; until then rely on the HTTP fallback to keep tooling evidence fresh.

- HotDash staging uses `hotroddash.myshopify.com`; ensure the MCP entry targets `https://hotroddash.myshopify.com/api/mcp`.
