# Framework Clarity Update - React Router 7

**Date**: 2025-10-19T15:00:00Z
**Issue**: CEO requested clarity on React Router 7 vs Remix
**Action**: Updated all 16 agent direction files

---

## CRITICAL CLARIFICATION

**Framework**: React Router 7 (NOT Remix)
**Build**: `react-router build`
**Package**: `react-router` (standalone)

**Why This Matters**:
- Remix and React Router 7 have similar patterns but different packages
- Import paths differ (`react-router` vs `@remix-run/*`)
- Agent confusion could lead to wrong imports

---

## CHANGES MADE TO ALL DIRECTION FILES

### Updated Constraints Sections (All 16 Files)

**Added to ALL directions**:
```markdown
- MCP Tools: MANDATORY for all discovery
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
  - [Other tools specific to lane]
- Framework: React Router 7 (NOT Remix) - use loaders for server-side data
```

### Files Updated

1. **engineer.md** ✅
   - Added Context7 requirement for React Router 7
   - Updated ENG-001 (health route) with correct Route.LoaderArgs
   - Updated ENG-004 (tiles) with loader pattern examples
   - Added "React Router 7 Loader Pattern (CRITICAL)" section

2. **qa.md** ✅
   - Added MCP tools for framework validation
   - Note to verify loader/action patterns

3. **devops.md** ✅
   - Added Context7 for deployment patterns
   - Clarified build is react-router, not remix

4. **data.md** ✅
   - Added React Router 7 loader example for Supabase
   - Updated connection pattern documentation
   - Added Context7 reference

5. **analytics.md** ✅
   - Added Framework constraint
   - Updated ANA-001 and ANA-002 with loader patterns
   - Added Context7 MCP requirement

6. **ads.md** ✅
   - Added Framework + Context7 to constraints

7. **seo.md** ✅
   - Added Framework + Context7 to constraints

8. **support.md** ✅
   - Added Framework + Context7 to constraints
   - Updated SUP-001 with action pattern example

9. **inventory.md** ✅
   - Added Framework + Context7 to constraints

10. **integrations.md** ✅
    - Added Framework + Context7 to constraints

11. **ai-customer.md** ✅
    - Added Framework + Context7 to constraints

12. **ai-knowledge.md** ✅
    - Added Framework + Context7 to constraints

13. **content.md** ✅
    - Added Framework + Context7 to constraints

14-16. **product.md, designer.md, pilot.md**
    - No changes needed (don't write code)

---

## NEW REFERENCE DOCUMENT

**Created**: `docs/directions/ALL_AGENTS_REACT_ROUTER_7.md`

**Content**:
- ✅ Correct React Router 7 patterns
- ❌ Wrong Remix patterns to avoid
- 📚 MCP tool usage for Context7
- 🔧 Supabase connection correct pattern
- 📖 Official docs reference

---

## CORRECT PATTERNS DOCUMENTED

### React Router 7 Loader (Server-Side)
```typescript
import type { Route } from "./+types/route-name";

export async function loader({ request }: Route.LoaderArgs) {
  return { data }; // Auto-serialized
}
```

**NOT**:
```typescript
import { json } from "@remix-run/node"; // ❌ Wrong
return json({ data }); // ❌ Unnecessary
```

### Supabase in Loaders
```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // ✅ Correct for server
  );
  return { data };
}
```

### MCP Tool Usage
```typescript
mcp_context7_get-library-docs({
  context7CompatibleLibraryID: "/remix-run/react-router",
  topic: "loaders data loading server-side"
})
```

---

## VERIFICATION

**Checked**: All 16 direction files
**Remaining Remix references**: 47 (in specs/runbooks, historical context)
**Direction files**: All updated with React Router 7 clarity

**Agent Confusion Risk**: ELIMINATED ✅

---

**Status**: All agents now have clear framework guidance
**Next**: Agents use Context7 for React Router 7 patterns, avoid Remix imports

