---
epoch: 2025.10.E1
doc: docs/ops/SHOPIFY-AUTH-PATTERN.md
owner: manager
last_reviewed: 2025-10-11
---

# Shopify Authentication Pattern - ALL AGENTS READ THIS

## 🚨 CRITICAL: How Shopify Auth Works in Our App

**CEO Clarification** (2025-10-11): "The key shouldn't be being asked for if we are following our guidelines as the react/CLI3 setup generates auth when it is installed"

---

## ✅ CORRECT PATTERN (React Router 7 + Shopify CLI v3)

**How It Works**:

1. Shopify CLI v3 automatically handles OAuth during app installation
2. React Router 7 loaders use `authenticate.admin(request)` to get session
3. Session tokens are generated automatically per request
4. **NO manual API tokens needed**

**In Your Code**:

```typescript
// In any loader or action:
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);

  // admin.graphql() now works automatically!
  const response = await admin.graphql(`
    query {
      shop { name }
    }
  `);

  return json(await response.json());
}
```

**Key Points**:

- ✅ `authenticate.admin(request)` handles everything
- ✅ No SHOPIFY_ADMIN_TOKEN variable needed
- ✅ No manual OAuth flow
- ✅ Works in loaders, actions, and API routes

---

## ❌ INCORRECT PATTERNS (Don't Do This)

**Don't Ask For**:

- ❌ SHOPIFY_ADMIN_TOKEN environment variable
- ❌ SHOPIFY_ACCESS_TOKEN
- ❌ Manual API token generation
- ❌ Hardcoded auth headers

**Don't Try To**:

- ❌ Build custom OAuth flow
- ❌ Store tokens in database
- ❌ Pass tokens between requests

---

## 🔧 FOR SERVICES OUTSIDE THE MAIN APP

**If you're building a separate service** (like Agent SDK):

**Option A: Call Back to Main App** (Recommended):

- Create API endpoints in main app (app/routes/api.shopify.\*.tsx)
- Use authenticate.admin in those endpoints
- Call those endpoints from your service
- **Why**: Auth stays in main app where it belongs

**Option B: Use Session Token from Webhook**:

- When webhook comes from main app, it includes session data
- Extract session, use for that specific shop's request
- Don't store long-term, request new session for each operation

**Option C: Install Shopify App in Service** (Last Resort):

- Only if service needs independent Shopify access
- Go through full OAuth flow for that service
- Requires separate Shopify app registration

**For Agent SDK**: Use Option A - call back to main app's Shopify endpoints

---

## 📋 REFERENCE DOCS

**Shopify App Bridge v3**:

- npm package: `@shopify/app-bridge-react`
- Our implementation: `app/shopify.server.ts`

**React Router 7 Auth Pattern**:

- Doc: `docs/dev/authshop.md`
- Example: `app/routes/app._index.tsx` (uses authenticate.admin)

**Session Storage**:

- Doc: `docs/dev/session-storage.md`
- Implementation: Prisma session adapter

---

## ⚡ QUICK REFERENCE

**Need Shopify Data in Main App?**
→ Use `authenticate.admin(request)` in loader/action

**Need Shopify Data in External Service?**
→ Create API endpoint in main app, call from service

**Need to Store Shopify Token?**
→ You don't - request fresh session each time

**Getting Auth Errors?**
→ Check you're using `authenticate.admin`, not manual tokens

---

## 🚨 IF YOU'RE ASKING FOR SHOPIFY CREDENTIALS

**STOP** - You're doing it wrong.

**Check**:

1. Are you in a loader/action? Use `authenticate.admin(request)`
2. Are you in external service? Call back to main app's API
3. Are you trying to store tokens? Don't - request fresh per operation

**If Still Stuck**: Ask Manager with your specific use case

---

**Status**: Active pattern for ALL agents  
**Last Updated**: 2025-10-11  
**Owner**: Manager (based on CEO clarification)
