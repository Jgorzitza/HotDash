# Shopify Admin Extensions Notes

Source: https://shopify.dev/docs/apps/build/admin

## Key points

- Admin extensions let apps surface UI directly inside Shopify Admin (App Bridge, admin blocks, action extensions).
- Built using Shopify CLI (`shopify app generate extension`), Polaris components, and extension APIs.
- Authentication handled by App Bridge; extensions should call backend APIs using session tokens (no manual JWTs).
- Each extension has its own `shopify.extension.toml` with surface targets, capabilities, and runtime config.
- Deployment packages include the extension bundle and need to be registered with Shopify using CLI or admin UI.
- Follow UX guidelines for embeds (loading states, skeletons, accessible components).

## HotDash usage

- Our React Router app already includes embedded dashboards; future admin extensions (e.g., bulk actions, contextual panels) should reference this doc.
- Keep extension code in `extensions/` workspace and document installation steps in deployment runbooks.
- QA should validate extensions via the Shopify Admin preview to ensure App Bridge context is provided correctly.
