# Evidence & Guards (Merge‑blocking)

## MCP Evidence JSONL (mandatory for code changes)
Path: `artifacts/<agent>/<YYYY‑MM‑DD>/mcp/<topic_or_tool>.jsonl`  
Line: `{"tool":"storefront|customer-accounts|context7|…","doc_ref":"<url>","request_id":"<id>","timestamp":"ISO","purpose":"<why>"}`

## PR body rule
Add a section titled **“MCP Evidence:”** listing those exact relative paths. Missing or invalid → **fail**.

## Heartbeat (no idle pauses)
While a task is `doing`, append JSON to `artifacts/<agent>/<date>/heartbeat.ndjson`:
`{"ts":"ISO","task":"ID","status":"doing"}`

## Required checks
- **guard-mcp**: verifies PR evidence section and file existence
- **idle-guard**: fails if heartbeat stale > 15 min while tasks are `doing`

## Dev MCP ban
Production build **fails** if any Dev MCP import/call appears in runtime bundles.
