## GitHub Issue Creation — Auth Blocker (temporary)

- Context: Attempted to create issues via GitHub API for all lanes in reports/manager/lanes/2025-10-18.json.
- Result: API call failed (authentication not available in this environment).
- Scope: All lanes (23 issues) prepared locally as payloads.

Verification (self-checklist)
- Access validated: `git remote -v` confirms repo Jgorzitza/HotDash.
- Config/flags: Lanes + policy confirm MCP split and AUTOPUBLISH=OFF.
- Runbook/spec: Updated runbooks and specs committed.
- Workaround: Generated issue payloads for manual/CLI creation:
  - reports/manager/lanes/2025-10-18.issues.json
  - reports/manager/lanes/2025-10-18.issues.md

Options
1) Provide a GH token to enable API creation now (recommended), or
2) Run the following per-issue CLI command after `gh auth login`:
   - gh issue create --title "<title>" --body "$(cat body.md)" --label task --label agent:<agent> --label dev --label capability --label flagged --label autopublish:off

Recommendation
- Proceed with (2) at shutdown time if token is not provided; otherwise provide GH token and I will create all issues and write mapping to reports/manager/lanes/2025-10-18.issues.map.json.

---

## Storefront MCP Proof Call — Server Not Registered (2025-10-19 00:16 UTC)

- Context: Lane `aic-storefront-1` DoD requires running `codex exec --json -- "mcp shopify-storefront {'action':'tools.list'}"` to validate anonymous tools.
- Result (updated 2025-10-19 01:20 UTC): `shopify_storefront` server registered (`~/.codex/config.toml` + repo reference), but Codex MCP client fails handshake with `unexpected server response: empty sse stream` because Shopify endpoint responds with immediate JSON (no SSE). Fallback `curl` POST succeeds (artifacts/ai-customer/2025-10-18/storefront-tools.jsonl).
- Impact: Official proof command still fails; need guidance whether to introduce an MCP proxy that speaks SSE or to approve HTTP fallback as interim evidence.

Verification (self-checklist)
- Command executed twice; stderr logged in `feedback/ai-customer/2025-10-18.md`.
- Spec updated with validation checklist at `docs/specs/hitl/storefront-mcp.md`.
- Artifacts captured (headers + JSONL) demonstrating `tools/list` works over plain HTTP POST.

Request
1. Confirm whether we should stand up a Streamable HTTP proxy (or alternative transport) so Codex MCP handshake succeeds; or
2. Accept the documented HTTP POST fallback as lane evidence until Codex supports non-SSE storefront MCP endpoints.

Next action on unblock
- Re-run the proof command once transport issue resolved; keep fallback artifacts refreshed in the meantime.
