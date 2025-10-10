# Shopify Embed Token Capture (Staging)

**Last updated:** 2025-10-10T07:45Z  
**Owner:** Reliability (escrow with Deployment)  
**Scope:** Enables localization/design to capture staging modal screenshots by providing an approved path for Shopify embed tokens.

---

## Preconditions
- You have access to the staging Shopify store `hotdash-staging.myshopify.com` (credentials in 1Password → “HotDash Staging Admin”).
- Shopify CLI bundle is current (re-run `scripts/deploy/shopify-dev-mcp-staging-auth.sh --check` if unsure).
- Fly staging host is warm: `https://hotdash-staging.fly.dev/app`.

## Host Parameter
Shopify embedded apps require the `host` query parameter (base64-encoded admin path):

- Plaintext: `admin.shopify.com/store/hotdash-staging/apps/4f72376ea61be956c860dd020552124d`
- Encoded (no padding, already URL-safe):

```
YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvaG90ZGFzaC1zdGFnaW5nL2FwcHMvNGY3MjM3NmVhNjFiZTk1NmM4NjBkZDAyMDU1MjEyNGQ=
```

Reference this value in any manual launches:

```
HOST_PARAM=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvaG90ZGFzaC1zdGFnaW5nL2FwcHMvNGY3MjM3NmVhNjFiZTk1NmM4NjBkZDAyMDU1MjEyNGQ=
https://hotdash-staging.fly.dev/app?embedded=1&mock=1&host=${HOST_PARAM}
```

## Capturing a Session (Embed) Token
1. Sign in to Shopify Admin: `https://admin.shopify.com/store/hotdash-staging/apps/hotdash`.  
   - If prompted, use the staging admin credentials from 1Password.
2. Launch the HotDash app inside Admin so App Bridge initializes.
3. Open Developer Tools (Chrome → View → Developer → JavaScript Console).
4. Paste the script below to load the SessionToken feature and fetch a fresh token:

```js
await window.shopify.loadFeatures([{name: "SessionToken"}]);
const token = await window.shopify.app.sessionToken.fetch();
copy(token); // copies to clipboard
token;
```

5. Store the token temporarily in a secure editor (never commit to Git). Tokens expire quickly—capture screenshots within 60 seconds.

## Using the Token Outside Admin
You can render the embedded app (for screenshots or automated runs) by including both the `host` parameter and the bearer token:

```
curl --silent \
  -H "Authorization: Bearer ${SESSION_TOKEN}" \
  "https://hotdash-staging.fly.dev/app?embedded=1&mock=1&host=${HOST_PARAM}"
```

- Swap `mock=1` with `mock=0` for live data once staging returns 200.
- For browser sessions (e.g., Playwright), inject the token as a `Authorization: Bearer` header or use Playwright’s `extraHTTPHeaders`.

## Evidence Logging
- Record the capture event (timestamp, who, purpose) in `feedback/localization.md` or `feedback/design.md`.
- Tokens must not be shared in plain text—use password-protected storage or discard after run.

## Incident Handling
- If the script throws an error, re-run `scripts/deploy/shopify-dev-mcp-staging-auth.sh` to refresh credentials, then reload Admin.
- If `host` mismatches, ensure the encoded value exactly matches the string above (no whitespace).
- Report persistent failures in `feedback/reliability.md` and ping deployment for scope changes.

---

**Revision Log**
- 2025-10-10: Initial guidance published by Reliability to unblock localization screenshot workflow.*** End Patch
