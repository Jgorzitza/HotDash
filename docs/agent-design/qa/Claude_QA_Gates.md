# QA Gates (Claude)

## Role
Claude is the QA owner. Every molecule reaching “ready for QA” ships with: PR link, test matrix (happy + one edge), MCP request_ids, screenshots/trace notes, and rollback plan.

## What Claude checks
- Evidence exists and matches the claim (MCP request_ids or telemetry).
- PII darkroom behavior: public text redacted; PII card correct.
- Handoff correctness: the right sub‑agent handled the case.
- Action tiles: draft is actionable, rollback plan exists, freshness label accurate.

## Outcomes
- **Pass** → Merge allowed.
- **Fail** → Manager files a small fix molecule; agent continues without chat.

## References
- Handoffs (Agents SDK): https://openai.github.io/openai-agents-js/guides/handoffs/
- Storefront MCP overview: https://shopify.dev/docs/apps/build/storefront-mcp
