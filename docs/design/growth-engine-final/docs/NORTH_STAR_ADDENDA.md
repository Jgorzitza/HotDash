# NORTH STAR — Addenda (Final alignment)

## Interactive‑only development agents

Replace any “background dev agents” references with **Specialist Interactive Agents** (invoked by Customer‑Front / CEO‑Front or the operator). No autonomous loops in dev.

## Tool‑based handoffs (one owner)

Triage → `transfer_to_accounts` or `transfer_to_storefront` → sub‑agent **owns** the request → returns structured result → front agent composes redacted reply → **HITL approve**. No broadcast fan‑outs.

## Evidence & heartbeat (merge blockers)

- **MCP Evidence JSONL** (mandatory for any code change): `artifacts/<agent>/<YYYY‑MM‑DD>/mcp/<topic_or_tool>.jsonl`
  - Line format: `{"tool":"storefront|customer-accounts|context7|…","doc_ref":"<url>","request_id":"<id>","timestamp":"ISO","purpose":"<why>"}`
- **PR body** must include a section exactly titled **“MCP Evidence:”** listing those relative paths.
- **Heartbeat** while a task is `doing`: append JSON lines to `artifacts/<agent>/<date>/heartbeat.ndjson`.
- **Required checks**: `guard-mcp` (evidence present) and `idle-guard` (heartbeat fresh) are required on `main`.

## Dev MCP ban in production

Dev MCP is for development/staging only. **Production builds must fail** if any Dev MCP import/call appears in runtime bundles.

## CEO agent evidence‑only policy

CEO‑Front answers strictly from **Action cards** and **read‑only Storefront MCP**; no writes and no Customer Accounts MCP.

## Store switch policy

Canonical API domain after cutover is `fm8vte-ex.myshopify.com`. All URLs, OAuth redirects, and telemetry IDs must be parameterized via environment (no literals).
