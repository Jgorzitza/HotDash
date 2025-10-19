# ALL AGENTS - REACT ROUTER 7 (NOT REMIX)

**Effective**: IMMEDIATELY
**Critical**: Framework clarity

## 🎯 WE USE REACT ROUTER 7

**NOT Remix** - React Router 7 is a standalone framework

**Build Command**: `react-router build` (NOT `remix build`)
**Serve Command**: `react-router-serve` (NOT `remix-serve`)
**Package**: `react-router` (NOT `@remix-run/*`)

---

## ✅ CORRECT PATTERNS (React Router 7)

### Server-Side Data Loading

```typescript
// ✅ CORRECT - React Router 7
import type { Route } from "./+types/route-name";

export async function loader({ request }: Route.LoaderArgs) {
  // This runs SERVER-SIDE (SSR enabled)
  const data = await fetchData();
  return { data }; // Auto-serialized to JSON
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.data}</div>;
}
```

```typescript
// ❌ WRONG - Remix pattern
import { json } from "@remix-run/node"; // ❌ Don't use
import type { LoaderFunction } from "@remix-run/node"; // ❌ Don't use

export const loader: LoaderFunction = async () => {
  return json({ data }); // ❌ No json() wrapper needed
};
```

### Server-Side Mutations

```typescript
// ✅ CORRECT - React Router 7
import type { Route } from "./+types/route-name";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await saveData(formData);
  return { success: true };
}
```

### Supabase Connection (Server-Side)

```typescript
// ✅ CORRECT - React Router 7 loader with SERVICE KEY
import type { Route } from "./+types/api.something";
import { createClient } from "@supabase/supabase-js";

export async function loader({ request }: Route.LoaderArgs) {
  // Server-side: Use SERVICE KEY (correct)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // ✅ Server-side only
  );

  const { data } = await supabase.from("table").select();
  return { data };
}
```

```typescript
// ❌ WRONG - Client-side pattern (we don't do this)
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY, // ❌ We use SERVICE KEY server-side
);
```

### Component Data Fetching

```typescript
// ✅ CORRECT - Fetch from loader route
import { useFetcher } from "react-router";

function MyComponent() {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    fetcher.load('/api/analytics/revenue');
  }, []);

  return <div>{fetcher.data?.revenue}</div>;
}
```

---

## 📚 MCP TOOL FOR REACT ROUTER 7

**ALWAYS use Context7 for React Router patterns**:

```typescript
mcp_context7_get -
  library -
  docs({
    context7CompatibleLibraryID: "/remix-run/react-router",
    topic: "loaders data loading server-side",
  });
```

**Topics to query**:

- "loaders" - Data loading
- "actions" - Mutations
- "server-side" - SSR patterns
- "useFetcher" - Client fetching
- "useLoaderData" - Accessing data

---

## 🚫 DON'T USE THESE (Remix-specific)

**Packages**:

- ❌ `@remix-run/node`
- ❌ `@remix-run/react`
- ❌ `@remix-run/server-runtime`

**Imports**:

- ❌ `import { json } from "@remix-run/node"`
- ❌ `import type { LoaderFunction } from "@remix-run/node"`

**Use instead**:

- ✅ `import type { Route } from "./+types/route-name"`
- ✅ Return objects directly (auto-serialized)

---

## 📖 CORRECT DOCUMENTATION

**Official Docs**: https://reactrouter.com
**Context7 Library ID**: `/remix-run/react-router`
**Version**: 7.x (check package.json)

**NOT**: Remix documentation (different framework)

---

**All agents**: Update your understanding. Use React Router 7 patterns. Query Context7 for examples.
