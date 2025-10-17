# Shopify Adapter

## Responsibilities

- Verify webhook HMAC. Handle `orders/create`, `inventory_levels/update`.
- Read/write via Admin GraphQL. Respect rate limits; implement retries/backoff.
- Manage **metaobjects** (create/update; publish as pages; attach to products/collections).
- Publish content and storefront changes atomically with rollback plans.

## Key Operations

- **Create/Update Metaobject Entries** (vehicle_model_year, swap_recipe, compatibility_fact, howto_guide)
- **Publish as Pages**: set templates and routes; ensure SEO fields are populated.
- **Patch Title/Meta/Body** for articles/pages; update Liquid section JSON for banners/badges.
- **Bundles/Attach**: create hidden products or draft bundles when needed; never break existing PDPs.
- **Performance tasks**: upload optimized images; update theme settings to lazy-load where applicable.

## Safety

- All writes are dry-run previewable.
- Store prior values for rollback.
- Idempotency keys per action; log Admin API request IDs for support.
