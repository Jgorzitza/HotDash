# Shopify Embed Token Capture (Staging) [Deprecated]

Note: Under the current React Router 7 + Shopify CLI v3 development flow, manual embed/session token capture is not required. Prefer `shopify app dev` and the helper docs in docs/dev/appreact.md, docs/dev/authshop.md, and docs/dev/session-storage.md. Retain this document only for historical reference or emergency workflows.

**Last updated:** 2025-10-12T18:30Z  
**Owner:** Reliability (escrow with Deployment)  
**Scope:** Enables localization/design to capture staging modal screenshots by providing an approved path for Shopify embed tokens.

---

## Preconditions
- Shopify CLI 3.x installed and authenticated (`shopify login --store hotroddash.myshopify.com`).
- Dev store configured in `shopify.app.toml` (`[build].dev_store_url = "hotroddash.myshopify.com"`).
- App deployed or running locally via `shopify app dev`; confirm the embedded app loads inside the staging store Admin.
- Fly staging host is warm: `https://hotdash-staging.fly.dev/app`.

## Host Parameter
Shopify embedded apps require the `host` query parameter (base64-encoded admin path):

- Plaintext: `admin.shopify.com/store/hotrodddash/apps/4f72376ea61be956c860dd020552124d`
- Encoded (no padding, already URL-safe):

```
YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvaG90ZGFzaC1zdGFnaW5nL2FwcHMvNGY3MjM3NmVhNjFiZTk1NmM4NjBkZDAyMDU1MjEyNGQ=
```

Reference this value in any manual launches:

```
HOST_PARAM=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvaG90cm9kZGFzaC9hcHBzLzRmNzIzNzZlYTYxYmU5NTZjODYwZGQwMjA1NTIxMjRk
https://hotdash-staging.fly.dev/app?embedded=1&mock=1&host=${HOST_PARAM}
```

## Capturing a Session (Embed) Token
1. Authenticate with Shopify CLI if needed:
   ```bash
   shopify login --store hotroddash.myshopify.com
   ```
2. Run or tunnel the app so it is accessible inside Admin (for local development):
   ```bash
   shopify app dev --store hotroddash.myshopify.com
   ```
   Keep this command running; it updates the app URLs and opens the embedded app in Admin automatically.
3. In the Shopify Admin tab that opens (or visit `https://admin.shopify.com/store/hotrodddash/apps/hotdash`), wait for the embedded app to load.
4. In the left navigation, open **Session token tool** (`/app/tools/session-token`).
5. Click **Refresh now** if a token isn’t already displayed, then use **Copy token**. The tool auto-refreshes tokens before they expire and surfaces decoded claims so you can confirm the token is valid.
6. Store the token temporarily in a secure editor (never commit to Git). Tokens expire quickly—capture screenshots or run tests within 60 seconds.

## Using the Token Outside Admin
You can render the embedded app (for screenshots or automated runs) by including both the `host` parameter and the bearer token:

```
curl --silent \
  -H "Authorization: Bearer ${SESSION_TOKEN}" \
  "https://hotdash-staging.fly.dev/app?embedded=1&mock=1&host=${HOST_PARAM}"
```

- Swap `mock=1` with `mock=0` for live data once staging returns 200.
- For browser sessions (e.g., Playwright), inject the token as a `Authorization: Bearer` header or use Playwright’s `extraHTTPHeaders`.

## Playwright Pipeline Injection Plan
- **Storage:** Reliability will escrow the latest token in `vault/occ/shopify/embed_token_staging.env` and mirror to GitHub secret `SHOPIFY_EMBED_TOKEN_STAGING` (staging environment). Deployment owns refresh + distribution once reliability posts the updated token.
- **Environment wiring:** CI and local Playwright runs should export `PLAYWRIGHT_SHOPIFY_EMBED_TOKEN=${SHOPIFY_EMBED_TOKEN_STAGING}` alongside `PLAYWRIGHT_BASE_URL=https://hotdash-staging.fly.dev/app`. When running locally, source the vault file instead of the GitHub secret.
- **Header injection:** Update Playwright configuration or fixtures to append `Authorization: Bearer ${PLAYWRIGHT_SHOPIFY_EMBED_TOKEN}` and the `host=${HOST_PARAM}` query parameter for every request under `https://hotdash-staging.fly.dev/app`.
- **Utilities:** Leverage `tests/fixtures/shopify-admin` to centralize embedded navigation (`shopifyAdmin.goto`) so headers and host parameters propagate automatically when `PLAYWRIGHT_SHOPIFY_EMBED_TOKEN` / `PLAYWRIGHT_SHOPIFY_HOST_PARAM` are present.
- **Rotation cadence:** Treat the embed token as ephemeral—refresh before every localization capture batch and document completion (timestamp + operator) in `feedback/localization.md`. Discard exported tokens immediately after use.
- **Fallback shim:** If Shopify denies automated token issuance, coordinate with reliability to swap to an approved host proxy; update this runbook and Playwright fixtures accordingly.

## Evidence Logging
- Record the capture event (timestamp, who, purpose) in `feedback/localization.md` or `feedback/design.md`.
- Tokens must not be shared in plain text—use password-protected storage or discard after run.

## Incident Handling
- If the session token tool fails to load, re-run `scripts/deploy/shopify-dev-mcp-staging-auth.sh` to refresh credentials, then reload Admin.
- If `host` mismatches, ensure the encoded value exactly matches the string above (no whitespace).
- Report persistent failures in `feedback/reliability.md` and ping deployment for scope changes.

---

**Revision Log**
- 2025-10-10: Initial guidance published by Reliability to unblock localization screenshot workflow.*** End Patch
