# Prisma + Supabase Connection Solution

## Problem
Prisma was caching old IPv6 connection strings despite updating `.env` files. The connection kept using the old URL even after regenerating the Prisma client.

## Root Cause
Two issues:
1. **Prisma Client Caching**: Prisma caches the generated client in `node_modules/.prisma/`. Simply updating `.env` files doesn't refresh this cache.
2. **DNS Resolution to IPv6**: The hostname `aws-1-us-east-1.pooler.supabase.com` resolves to both IPv4 and IPv6 addresses, and Prisma/Node.js was preferring IPv6, causing connection issues.

## Solution
Force IPv4 by using the IP address directly instead of the hostname:

### Updated Configuration

**For transaction pooling (serverless/scripts):**
```env
DATABASE_URL="postgresql://postgres.mmbjiyhsvniqxibzgyvx:[PASSWORD]@3.227.209.82:6543/postgres?pgbouncer=true"
```

**For migrations (direct connection):**
```env
DIRECT_URL="postgresql://postgres.mmbjiyhsvniqxibzgyvx:[PASSWORD]@3.227.209.82:5432/postgres"
```

### Files Updated
- `/home/justin/HotDash/hot-dash/.env`
- `/home/justin/HotDash/hot-dash/.env.local`

## How to Refresh Prisma Client

Whenever you update `DATABASE_URL` in your `.env` file:

```bash
cd ~/HotDash/hot-dash
rm -rf node_modules/.prisma
npx prisma generate
```

## Important Notes

### About `inet_server_addr()` Showing IPv6
This is **EXPECTED BEHAVIOR**! When you query `inet_server_addr()`, it returns the address of the backend PostgreSQL server, not the pooler:

```
Your App → Pooler (3.227.209.82:6543) → Database Server (IPv6:5432)
                                          ↑ This is what inet_server_addr() shows
```

The connection IS going through the pooler correctly - you'll see this in the logs:
```
prisma:info Starting a postgresql pool with 13 connections in PgBouncer mode.
```

### Port Configuration
- **Port 6543**: Transaction pooling via PgBouncer (use for all app queries)
- **Port 5432**: Direct connection (use only for migrations)

### Testing the Connection

```bash
cd ~/HotDash/hot-dash
npx tsx --env-file=.env -e "import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); prisma.session.findMany({ take: 1 }).then((sessions) => { console.log('✅ Connected! Found', sessions.length, 'session(s)'); return prisma.\$disconnect(); });"
```

## Verification Checklist
- [x] DATABASE_URL uses IPv4 (3.227.209.82)
- [x] DATABASE_URL uses port 6543
- [x] DATABASE_URL includes `?pgbouncer=true`
- [x] DIRECT_URL uses IPv4 (3.227.209.82)
- [x] DIRECT_URL uses port 5432
- [x] Prisma client regenerated
- [x] Test query successful

## References
- [Supabase Prisma Guide](https://supabase.com/docs/guides/database/prisma)
- [PgBouncer Connection Pooling](https://www.pgbouncer.org/)

---

**Resolved**: 2025-10-22  
**Duration**: ~45 minutes  
**Resolution**: Force IPv4 by using IP address (3.227.209.82) instead of hostname + regenerate Prisma client

