Title: A/B Harness — Cookie & GA4 Dimension (dev)

Cookie

- Format: `ab_variant=<experiment_key>:<arm_name>`
- TTL: 30 days; Path=/; Secure; SameSite=Lax
- Assignment: weighted random per `arms[]` in registry; sticky per cookie

GA4

- Custom dimension: `ab_variant` (scope=session) — adapter logs only in dev/staging
- Mapping: pass cookie value to GA4 via client event or server-side session tagging

Failure Modes & Guards

- If cookie missing: assign on first eligible page load
- If arm disabled: fallback to control and set cookie accordingly
- Max concurrent experiments: 3 per session; ignore overflow

Rollback/Promote

- Promote: copy winner into default branch; expire cookie
- Rollback: set cookie to previous winner; disable variant arms

Evidence

- Proof calls logged in artifacts/seo/YYYY-MM-DD/\*.log; MCP Evidence section in PR
