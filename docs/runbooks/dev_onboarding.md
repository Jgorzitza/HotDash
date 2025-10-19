# Developer Onboarding Checklist

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Standardized onboarding for new developers

## Day 1: Environment Setup

### Prerequisites

- [ ] GitHub account with access to Jgorzitza/HotDash repository
- [ ] Node.js 20+ installed
- [ ] Git configured with SSH keys
- [ ] Code editor (VS Code recommended)

### Repository Setup

```bash
# Clone repository
git clone git@github.com:Jgorzitza/HotDash.git
cd HotDash

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Configuration

**Edit `.env` with values from team lead**:

- SHOPIFY_API_KEY
- SHOPIFY_API_SECRET
- DATABASE_URL (local Supabase or shared dev)
- SUPABASE_URL
- SUPABASE_SERVICE_KEY

**Optional** (for full functionality):

- OPENAI_API_KEY
- CHATWOOT_BASE_URL
- GA*MCP*\* variables

### Verify Setup

```bash
# Run tests
npm test

# Start development server
npm run dev

# Verify application loads
open http://localhost:3000
```

## Day 2: Codebase Orientation

### Key Documentation

- [ ] Read `README.md` - Project overview
- [ ] Read `docs/NORTH_STAR.md` - Vision and goals
- [ ] Read `docs/OPERATING_MODEL.md` - How we work
- [ ] Read `docs/RULES.md` - Guardrails and process
- [ ] Skim `docs/runbooks/` - Operational procedures

### Architecture Overview

**Frontend**:

- React Router 7 (file-based routing)
- Polaris components (Shopify design system)
- Vite (build tool)

**Backend**:

- Node.js/TypeScript
- Supabase (Postgres + Auth + Storage)
- Prisma (database ORM)

**Infrastructure**:

- Fly.io (hosting)
- GitHub Actions (CI/CD)
- Supabase (managed Postgres)

### Code Tour

Key directories:

```
app/
├── components/      # React components
├── routes/          # React Router routes
├── lib/             # Business logic
├── services/        # External service integrations
└── middleware/      # Request/response middleware

docs/
├── directions/      # Agent task assignments
├── runbooks/        # Operational procedures
└── specs/           # Feature specifications

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
├── smoke/           # Smoke tests
└── playwright/      # E2E tests

.github/workflows/   # CI/CD automation
scripts/             # Automation scripts
```

## Day 3: Development Workflow

### Branch Strategy

**Never create branches** - Manager controls all git operations

**Work in assigned branches**:

```bash
# Manager will create branch
# You receive: batch-YYYYMMDD/agent-molecule-description

# Switch to it
git fetch
git checkout batch-YYYYMMDD/agent-molecule-description

# Make changes
# ... edit files ...

# Commit with issue reference
git commit -m "feat: description\n\nRefs #123"

# Push
git push origin HEAD
```

### Making Changes

**Process**:

1. Read your direction file: `docs/directions/<your-agent>.md`
2. Check allowed paths in direction
3. Make changes ONLY in allowed paths
4. Write tests for changes
5. Run local verification
6. Update feedback file
7. Commit and push

**Local Verification**:

```bash
# Format
npm run fmt

# Lint
npm run lint

# Tests
npm run test

# Type check
npm run typecheck
```

### Pull Requests

**Manager creates PRs**, not developers

**PR Requirements**:

- Issue linkage: `Fixes #123` in body
- Definition of Done from issue
- Allowed paths specified
- All CI checks passing

## Useful Commands

### Development

```bash
# Start dev server
npm run dev

# Run specific test file
npx vitest run tests/unit/example.spec.ts

# Watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database

```bash
# Connect to database
psql $DATABASE_URL

# Run migrations (local)
npx prisma migrate dev

# View database in browser
npx prisma studio
```

### Debugging

```bash
# View application logs (production)
fly logs -a hotdash-app

# View Shopify API requests
# Check browser DevTools → Network

# Run with debug logging
DEBUG=* npm run dev
```

## Common Tasks

### Add New Route

1. Create file: `app/routes/your-route.tsx`
2. Implement loader/action
3. Add tests: `tests/unit/routes/your-route.spec.ts`
4. Update relevant specs if API route

### Add New Component

1. Create file: `app/components/YourComponent.tsx`
2. Use Polaris components
3. Add tests: `tests/unit/components/YourComponent.spec.ts`
4. Export from index if reusable

### Add New API Endpoint

1. Create route: `app/routes/api.your-endpoint.ts`
2. Implement loader (GET) or action (POST/PUT/DELETE)
3. Add contract test: `tests/contract/your-endpoint.contract.spec.ts`
4. Document in API specs

### Run Integration Tests

```bash
# All integration tests
npm run test:integration

# Specific test
npx vitest run tests/integration/your-test.spec.ts
```

## Troubleshooting

### npm install fails

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

**Solution**:

```bash
# Regenerate Prisma client
npx prisma generate

# Clear TypeScript cache
rm -rf .react-router
npm run dev
```

### Tests fail locally but pass in CI

**Check**:

- Node version matches (v20)
- Environment variables set
- Database seeded properly

## Resources

**Internal**:

- Codebase: https://github.com/Jgorzitza/HotDash
- Runbooks: `docs/runbooks/`
- Specs: `docs/specs/`

**External**:

- React Router 7: https://reactrouter.com
- Polaris: https://polaris.shopify.com
- Shopify Admin API: https://shopify.dev/api/admin
- Supabase: https://supabase.com/docs

## Getting Help

**Questions about**:

- Architecture/design: Ask Engineer or Manager
- Testing: Ask QA
- Deployment: Ask DevOps
- Requirements: Check direction file or ask Manager

**Process**:

1. Check documentation first (runbooks, specs)
2. Search codebase for similar examples
3. Ask in team channel
4. Create issue if blocked

## Related Documentation

- Operating Model: `docs/OPERATING_MODEL.md`
- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
- Security: `docs/runbooks/security_hardening.md`
