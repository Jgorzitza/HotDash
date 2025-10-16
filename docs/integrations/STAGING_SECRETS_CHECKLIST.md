# Staging Secrets Checklist (No values)

Purpose: Enumerate required environment variables for staging without storing any secrets. Use GitHub Environments/Secrets, Fly.io secrets, or .env.local (gitignored) for local dev.

How to use
- Store secrets in the proper secret store; never commit values
- Validate presence at boot via config guards (throws with helpful messages)

Shopify
- SHOPIFY_API_KEY
- SHOPIFY_API_SECRET
- SHOPIFY_APP_URL (staging domain)
- SCOPES

Supabase
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY

Chatwoot
- CHATWOOT_API_URL
- CHATWOOT_API_KEY
- CHATWOOT_ACCOUNT_ID

Google Analytics (GA4)
- GA4_PROPERTY_ID (or GA_PROPERTY_ID)
- GA4_SERVICE_ACCOUNT_PATH (local file path) OR GOOGLE_APPLICATION_CREDENTIALS
- GOOGLE_APPLICATION_CREDENTIALS_BASE64 (Fly.io option; base64 JSON)

Runtime flags / modes
- NODE_ENV=production
- STAGING=true (optional env switcher, see ENV_SWITCHERS.md)
- DASHBOARD_USE_MOCK=0 (ensure live mode when validating integrations)

Playwright (optional for e2e)
- PLAYWRIGHT_BASE_URL=https://<staging-host>
- PLAYWRIGHT_SHOPIFY_EMAIL
- PLAYWRIGHT_SHOPIFY_PASSWORD

Notes
- Do not log secret values
- Rotate credentials regularly (90 days)
- Verify Push Protection and Gitleaks are green before PR/merge

