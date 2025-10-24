# SQL Injection Vulnerability Fixes - Phase 1

**Date:** 2025-01-24  
**Engineer:** engineer agent  
**Priority:** P0 - CRITICAL SECURITY

## Summary

Fixed 3 SQL injection vulnerabilities by replacing unsafe `$queryRawUnsafe` calls with Prisma's safe `$queryRaw` template literal syntax.

## Vulnerabilities Fixed

### 1. Knowledge Base Vector Search (`app/services/knowledge/search.ts`)

**Location:** Lines 63-85

**Vulnerability:**
```typescript
// UNSAFE - String interpolation in SQL query
const embeddingVector = `[${embedding.join(",")}]`;
const results = await prisma.$queryRawUnsafe<any[]>(`
  SELECT ...
  WHERE ${whereClause}
    AND 1 - (embedding <=> '${embeddingVector}'::vector) >= ${minSimilarity}
  LIMIT ${limit}
`);
```

**Attack Vector:**
- Malicious input in `embedding` array could inject SQL
- `whereClause` built from user-controlled filters
- `minSimilarity` and `limit` parameters vulnerable

**Fix:**
```typescript
// SAFE - Prisma template literals with parameterized queries
const embeddingVector = `[${embedding.join(",")}]`;
const results = await prisma.$queryRaw<any[]>`
  SELECT ...
  WHERE is_current = ${filters.isCurrentOnly !== false}
    AND project = ${filters.project || 'occ'}
    ${filters.shopDomain ? Prisma.sql`AND shop_domain = ${filters.shopDomain}` : Prisma.empty}
    AND 1 - (embedding <=> ${embeddingVector}::vector) >= ${minSimilarity}
  LIMIT ${limit}
`;
```

**Impact:** HIGH - Could expose entire knowledge base or execute arbitrary SQL

---

### 2. Similar Articles Search (`app/services/knowledge/search.ts`)

**Location:** Lines 130-162

**Vulnerability:**
```typescript
// UNSAFE - String interpolation in SQL query
const results = await prisma.$queryRawUnsafe<any[]>(`
  SELECT ...
  WHERE id != '${articleId}'
    AND 1 - (embedding <=> '${sourceArticle.embedding}'::vector) >= ${minSimilarity}
  LIMIT ${limit}
`);
```

**Attack Vector:**
- `articleId` parameter could contain SQL injection
- `sourceArticle.embedding` from database but still interpolated unsafely
- `minSimilarity` and `limit` parameters vulnerable

**Fix:**
```typescript
// SAFE - Prisma template literals with parameterized queries
const embeddingVector = sourceArticle.embedding as string;
const results = await prisma.$queryRaw<any[]>`
  SELECT ...
  WHERE id != ${articleId}
    AND 1 - (embedding <=> ${embeddingVector}::vector) >= ${minSimilarity}
  LIMIT ${limit}
`;
```

**Impact:** HIGH - Could expose knowledge base or execute arbitrary SQL

---

### 3. Specialist Agents API (`app/routes/api.growth-engine.specialist-agents.ts`)

**Location:** Lines 12-19 (createDbShim function)

**Vulnerability:**
```typescript
// UNSAFE - Wrapper function that allows $queryRawUnsafe
function createDbShim(prisma: any) {
  return {
    query: async (sql: string, params?: any[]) => {
      const result = await prisma.$queryRawUnsafe(sql, ...(params ?? []));
      return { rows: Array.isArray(result) ? result : [] };
    },
  };
}
```

**Attack Vector:**
- Any code using `db.query()` could pass unsafe SQL
- Even with parameterized queries, the function allows unsafe usage
- Creates a dangerous abstraction that bypasses Prisma's safety

**Fix:**
```typescript
// SAFE - Removed unsafe wrapper, use Prisma directly
// All queries now use $queryRaw with template literals

// Example before:
const { rows } = await db.query(
  `SELECT * FROM specialist_agent_runs WHERE agent_name = $1`,
  [agent]
);

// Example after:
const rows = await prisma.$queryRaw<any[]>`
  SELECT * FROM specialist_agent_runs
  WHERE agent_name = ${agent}
`;
```

**Impact:** CRITICAL - Created a dangerous pattern that could be misused throughout the codebase

---

## Technical Details

### Prisma Safe Query Methods

**✅ SAFE:**
```typescript
// Template literal syntax - automatically parameterized
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;

// Prisma.sql for dynamic queries
await prisma.$queryRaw`
  SELECT * FROM users
  WHERE ${condition ? Prisma.sql`status = ${status}` : Prisma.empty}
`;
```

**❌ UNSAFE:**
```typescript
// String interpolation - vulnerable to SQL injection
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);

// String concatenation - vulnerable to SQL injection
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`);
```

### Why Template Literals Are Safe

Prisma's `$queryRaw` with template literals:
1. **Automatically parameterizes** all interpolated values
2. **Escapes special characters** to prevent injection
3. **Type-checks** parameters at compile time
4. **Prevents** string concatenation attacks

Example:
```typescript
const userId = "1' OR '1'='1"; // Malicious input

// UNSAFE - SQL injection succeeds
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
// Executes: SELECT * FROM users WHERE id = '1' OR '1'='1'
// Returns ALL users!

// SAFE - SQL injection prevented
await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
// Executes: SELECT * FROM users WHERE id = $1
// With parameter: ['1\' OR \'1\'=\'1']
// Returns NO users (escaped string doesn't match)
```

## Testing

### Manual Testing

```bash
# Test knowledge base search with malicious input
curl -X POST http://localhost:3000/api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "filters": {"shopDomain": "test'\'' OR 1=1--"}}'

# Should return empty results, not all records
```

### Automated Testing

```typescript
// Add to tests/security/sql-injection.test.ts
test('Knowledge base search prevents SQL injection', async () => {
  const maliciousInput = {
    query: 'test',
    filters: {
      shopDomain: "test' OR '1'='1"
    }
  };
  
  const results = await searchKnowledgeBase(maliciousInput);
  
  // Should return empty results, not all records
  expect(results.length).toBe(0);
});
```

## Verification

### Code Review Checklist

- [x] All `$queryRawUnsafe` calls replaced with `$queryRaw`
- [x] All SQL queries use template literal syntax
- [x] No string interpolation in SQL queries
- [x] Dynamic conditions use `Prisma.sql` or `Prisma.empty`
- [x] Prisma import added where needed
- [x] All function signatures updated
- [x] No unsafe wrapper functions remain

### Security Scan

```bash
# Search for remaining unsafe patterns
grep -r "queryRawUnsafe" app/ --include="*.ts" --include="*.tsx"
# Should return: No matches

# Search for string interpolation in SQL
grep -r '\${\|`.*SELECT.*\${' app/ --include="*.ts" --include="*.tsx"
# Review all matches to ensure they use $queryRaw template literals
```

## Remaining Work

### Phase 2 (Future)

1. **Audit all raw SQL queries** - Review all `$queryRaw` usage
2. **Prefer Prisma ORM methods** - Replace raw SQL with type-safe Prisma queries where possible
3. **Add SQL injection tests** - Comprehensive test suite for all query endpoints
4. **Security training** - Document safe query patterns for all developers

### Recommended Prisma ORM Usage

Instead of raw SQL:
```typescript
// Instead of this:
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// Use this:
const users = await prisma.user.findMany({
  where: { email }
});
```

Benefits:
- **Type-safe** - Compile-time type checking
- **Injection-proof** - No SQL injection possible
- **Maintainable** - Easier to read and modify
- **Performant** - Optimized queries

## References

- [Prisma Raw Database Access](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

## Commit Message

```
fix(security): Fix 3 SQL injection vulnerabilities (Phase 1)

CRITICAL SECURITY FIX

Fixed 3 SQL injection vulnerabilities by replacing unsafe $queryRawUnsafe
calls with Prisma's safe $queryRaw template literal syntax.

Vulnerabilities fixed:
1. Knowledge base vector search (app/services/knowledge/search.ts:63-85)
2. Similar articles search (app/services/knowledge/search.ts:130-162)
3. Specialist agents API unsafe wrapper (app/routes/api.growth-engine.specialist-agents.ts:12-19)

All queries now use parameterized queries via Prisma template literals,
preventing SQL injection attacks.

Impact: HIGH - Could have exposed entire database or allowed arbitrary SQL execution
```

