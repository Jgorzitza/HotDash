# Shopify Session Storage Reference

This file summarizes Shopify's official guidance for session persistence.

## Primary source
- https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/session-storage

## Key points
- The app templates (Remix and React Router) already wire in session persistence using the `@shopify/shopify-app-session-storage-<adapter>` packages.
- Our project uses the Prisma adapter (`@shopify/shopify-app-session-storage-prisma`).
- Ensure `Session` Prisma model matches the adapter (fields id, shop, state, isOnline, etc.).
- Migrations must include the Session table whenever we reset or bootstrap new environments.
- For new environments, instantiate storage in `shopifyApp({ sessionStorage: new PrismaSessionStorage(prisma) })`.

## HotDash usage
- `app/shopify.server.ts` already calls `PrismaSessionStorage(prisma)`.
- Migrations now target Supabase Postgres; confirm `prisma/schema.prisma` includes the Session model.
- QA should run `npm run setup` on fresh environments to ensure session table exists.
