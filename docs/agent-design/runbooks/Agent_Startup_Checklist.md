# Agent Startup Checklist (Dev Agents)

**Goal:** Eliminate status chatter. Agents produce artifacts and PRs until done.

## Daily steps (no code)
1) Create today’s task files under `artifacts/<agent>/<YYYY‑MM‑DD>/`:
   - `tasks.todo.md` (human readable)
   - `tasks.todo.json` (machine readable; molecules 30–120 minutes)
2) Before any code change, write **MCP evidence** JSONL files at:
   - `artifacts/<agent>/<YYYY‑MM‑DD>/mcp/<topic_or_tool>.jsonl`
   - Each line includes: tool, doc_ref, request_id, timestamp, purpose.
3) In PR bodies, include a section titled exactly **“MCP Evidence:”** listing those relative paths.
4) While a task is `doing`, append a JSON heartbeat line every ~10 minutes to:
   - `artifacts/<agent>/<YYYY‑MM‑DD>/heartbeat.ndjson`
5) Follow allowlists:
   - Storefront MCP for catalog/cart/policies.
   - Customer Accounts MCP only via the Accounts Sub‑agent (OAuth/ABAC).
   - Dev MCP is never used in production flows.
6) Framework rule: React Router 7 only.

## Acceptance
- Tasks progress without chat.
- MCP evidence and heartbeat files are present when code changes.
- PRs show “MCP Evidence” paths and pass QA gates.
