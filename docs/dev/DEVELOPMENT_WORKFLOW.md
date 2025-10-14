# Development Workflow Guide

**Last Updated**: 2025-10-13  
**Owner**: Engineer  
**Audience**: New developers joining Hot Dash project

## Quick Start

### 1. One-Command Setup

```bash
./scripts/dev/setup-local-env.sh
```

This automated script will:
- ✅ Check prerequisites (Node.js, npm, Supabase CLI)
- ✅ Install dependencies
- ✅ Start local Supabase
- ✅ Create `.env.local` with connection details
- ✅ Run database migrations
- ✅ Build the application

### 2. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## Development Commands

### Essential Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm run typecheck        # Check TypeScript errors
npm run lint             # Run ESLint

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Database
npx supabase status      # Check Supabase status
npx supabase start       # Start local Supabase
npx supabase stop        # Stop local Supabase
npx supabase db reset    # Reset database (careful!)
npm run setup            # Run migrations

# Deployment
fly deploy --app hotdash-staging  # Deploy to staging
```

## Project Structure

```
hot-dash/
├── app/                      # React Router 7 application
│   ├── routes/              # Route modules
│   ├── components/          # React components
│   ├── services/            # Business logic & API clients
│   ├── utils/               # Utility functions
│   ├── middleware/          # Request middleware
│   └── styles/              # CSS files
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets
├── scripts/                 # Automation scripts
├── docs/                    # Documentation
├── feedback/                # Agent feedback logs
├── artifacts/               # Build artifacts & reports
└── vault/                   # Secrets (git-ignored)
```

## Workflow Patterns

### Creating a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b agent/engineer/feature-name
   ```

2. **Implement feature**
   - Create route in `app/routes/`
   - Add components in `app/components/`
   - Add services in `app/services/`
   - Update types as needed

3. **Add tests**
   - Unit tests: `*.test.ts` or `*.test.tsx`
   - Use fixtures from `app/test-fixtures/`

4. **Check quality**
   ```bash
   npm run typecheck  # Must pass with 0 errors
   npm run lint       # Fix any errors
   npm test           # All tests must pass
   ```

5. **Build and test**
   ```bash
   npm run build      # Must build successfully
   npm run dev        # Manual testing
   ```

6. **Document changes**
   - Update relevant docs in `docs/`
   - Log evidence in `feedback/engineer.md`

### Adding a New Route

**React Router 7 Pattern**:

```typescript
// app/routes/app.my-feature.tsx
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page } from "@shopify/polaris";

interface LoaderData {
  data: MyData[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Fetch data
  const data = await fetchMyData();
  
  return Response.json({ data });
}

export default function MyFeature() {
  const { data } = useLoaderData<LoaderData>();
  
  return (
    <Page title="My Feature">
      {/* Your UI here */}
    </Page>
  );
}
```

### Adding a New API Endpoint

```typescript
// app/routes/api.my-endpoint.tsx
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await fetchData();
    
    return Response.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### Adding Database Changes

1. **Create migration**
   ```bash
   npx prisma migrate dev --name add_my_feature
   ```

2. **Update Prisma schema**
   - Edit `prisma/schema.prisma`
   - Run migration

3. **Generate types**
   ```bash
   npx prisma generate
   ```

## Best Practices

### Code Quality

- ✅ **TypeScript**: Use strict mode, no `any` types
- ✅ **Naming**: Descriptive names, follow conventions
- ✅ **Comments**: JSDoc for public APIs
- ✅ **Formatting**: Consistent spacing and style
- ✅ **Imports**: Remove unused imports

### Performance

- ✅ **Lazy Loading**: Use `lazy()` for large components
- ✅ **Caching**: Use `withCache()` for expensive operations
- ✅ **Parallel**: Use `Promise.all()` for independent operations
- ✅ **Memoization**: Use `useMemo()`/`useCallback()` when appropriate

### Error Handling

- ✅ **Try-Catch**: Wrap async operations
- ✅ **Logging**: Log errors with context
- ✅ **User-Friendly**: Show helpful error messages
- ✅ **Recovery**: Provide recovery options

### Testing

- ✅ **Unit Tests**: Test business logic
- ✅ **Integration Tests**: Test API routes
- ✅ **Fixtures**: Use test fixtures for consistency
- ✅ **Coverage**: Aim for >80% coverage

## Debugging

### Development Tools

1. **React Router DevTools**: Built into dev server
2. **Shopify App Bridge**: Check console for messages
3. **Supabase Studio**: `http://localhost:54323`
4. **APM Metrics**: `GET /api/apm/metrics`
5. **Query Analysis**: `GET /api/queries/analyze`
6. **Health Check**: `GET /api/health`
7. **Performance**: `GET /api/performance/summary`
8. **Logs**: `GET /api/logs/recent`

### Common Issues

**Build fails**:
- Run `npm run typecheck` to find TypeScript errors
- Check for syntax errors in console

**Database errors**:
- Verify Supabase is running: `npx supabase status`
- Check migrations: `npx prisma migrate status`
- Reset if needed: `npx supabase db reset`

**Slow performance**:
- Check APM metrics: `curl http://localhost:3000/api/apm/metrics`
- Analyze queries: `curl http://localhost:3000/api/queries/analyze`
- Review slow requests in logs

## Environment Variables

### Required

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_KEY=your-service-key

# Shopify (or use mock mode)
SHOPIFY_API_KEY=your-api-key
SHOPIFY_API_SECRET=your-api-secret
```

### Optional

```bash
# Mock Mode (no Shopify required)
DASHBOARD_USE_MOCK=1

# Performance
CACHE_TTL_MS=300000        # 5 minutes
SLOW_QUERY_THRESHOLD=100    # 100ms

# Logging
LOG_LEVEL=info
```

## Code Review Checklist

Before submitting PR:

- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run lint` passes (or errors justified)
- [ ] `npm test` passes (all tests)
- [ ] `npm run build` succeeds
- [ ] Manual testing complete
- [ ] Documentation updated
- [ ] Evidence logged in `feedback/engineer.md`
- [ ] PR description includes:
  - What changed
  - Why it changed
  - How to test
  - Screenshots (if UI)

## Deployment Workflow

### Staging Deployment

```bash
# 1. Build
npm run build

# 2. Deploy to Fly.io
source vault/occ/fly/api_token.env
fly deploy --app hotdash-staging --remote-only

# 3. Verify
curl https://hotdash-staging.fly.dev/api/health

# 4. Test
# Visit https://hotdash-staging.fly.dev and test features
```

### Production Deployment

**Requires**: Manager approval, QA sign-off, security review

```bash
# Same process as staging, but:
fly deploy --app hotdash-production --remote-only
```

## Getting Help

- **Documentation**: `docs/` directory
- **Examples**: Look at existing routes in `app/routes/`
- **Feedback**: Check `feedback/engineer.md` for solved problems
- **Manager**: Log questions in `feedback/engineer.md`

## Tips & Tricks

### Fast Iteration

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Type checking (watch mode)
npm run typecheck -- --watch

# Terminal 3: Tests (watch mode)
npm run test:watch
```

### Mock Mode

For fast development without external dependencies:

```bash
# In .env.local
DASHBOARD_USE_MOCK=1

# Or via URL
http://localhost:3000/app?mock=1
```

### Supabase Studio

Access local database GUI:
```bash
# Open in browser
open http://localhost:54323
```

### Performance Profiling

```typescript
import { withProfiling } from '../utils/profiler.server';

const result = await withProfiling('my-operation', async () => {
  // Your code here
});
```

### API Testing

```bash
# Health check
curl http://localhost:3000/api/health | jq

# Performance metrics
curl http://localhost:3000/api/performance/summary | jq

# Query analysis
curl http://localhost:3000/api/queries/analyze | jq

# Recent logs
curl "http://localhost:3000/api/logs/recent?type=errors" | jq
```

---

**Happy coding!** 🚀

