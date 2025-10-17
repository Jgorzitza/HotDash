# Shopify Admin GraphQL API Notes

Source: https://shopify.dev/docs/api/admin-graphql

## Key points

- GraphQL schema versioned quarterly (YYYY-MM). Always target the latest supported version and pin updates intentionally.
- Authentication: use the Admin API access token (offline or online) obtained during OAuth/token exchange. Embedded apps call `authenticate.admin(request)` to retrieve the `admin.graphql` client.
- Requests must include the `X-Shopify-Access-Token` header; GraphQL playground available via Shopify Admin > Apps > Develop apps.
- Rate limits measured in cost (default budget 1,000 per minute). Inspect `extensions.cost` payload to plan throttling/retries.
- Use persisted queries/typed clients when possible. Deadlines: avoid deprecated fields before sunset.
- Webhooks & bulk operations available through GraphQL. Bulk queries run asynchronously and require polling the status.

## HotDash usage

- `app/routes/actions/*` and services call `admin.graphql`. Ensure queries stay within cost budgets and include error handling (GraphqlQueryError).
- Update direction docs when migrating API versions; track in `docs/deployment/env_matrix.md` and `feedback/engineer.md`.
- QA should validate GraphQL changes against the versioned schema before release.
