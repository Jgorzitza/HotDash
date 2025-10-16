# Environment Switchers

Purpose: Document how the app switches between development, staging, and production.

Source of truth
- app/lib/config/environment.ts

How it works
- NODE_ENV controls base mode: `development`, `production`
- If NODE_ENV=production and STAGING=true, app treats environment as `staging`
- getConfig() resolves per-env keys from environment variables (no values here)

Helpers
- getEnvironment(): "development" | "staging" | "production"
- isDevelopment(), isStaging(), isProduction()

Client configs (resolved by getConfig())
- Shopify: apiUrl, apiVersion
- Supabase: url, anonKey, serviceKey
- Chatwoot: apiUrl, apiKey, accountId
- GA4: propertyId, serviceAccountPath

Recommended setups
- Local dev: NODE_ENV=development (mock permitted)
- Staging: NODE_ENV=production + STAGING=true (live, read-only-first)
- Production: NODE_ENV=production (HITL enforced, guarded writes)

Safety
- Never commit secret values
- Keep .env.local gitignored
- Use GitHub Secrets/Fly secrets for CI/CD

