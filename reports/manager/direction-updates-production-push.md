# Manager Direction Updates — Production Push (2025-10-19)

## Context

After consolidating 16 agent shutdown feedback, updating governance docs with improvements, and analyzing agent status:

- **10 agents COMPLETE**: Ready for Manager PRs (ai-knowledge, integrations, ai-customer, analytics, content, data, inventory, product, seo, support)
- **2 agents IN PROGRESS**: Engineer (server fix), Pilot (blocked by server)
- **4 agents NEED UPDATES**: Designer, Ads, DevOps, QA

---

## Production Readiness Checklist

For all agents, directions now focus on:

1. **Unblockers First** - Remove P0/P1 blockers before production work
2. **Production Features** - Deployment, monitoring, security, rollback
3. **15-20 Molecule Depth** - Strict enforcement per agent feedback
4. **Tool Correctness** - OpenAI SDK for customer agents, MCP for dev, CLI where appropriate
5. **Launch Alignment** - Every molecule contributes to working Shopify app in production

---

## Updated Directions

### 1. Designer (v4.0) - UI/UX Production Polish

**Status**: Blocked awaiting running app  
**Unblocker**: Engineer fixes server (ENG-000-P1)  
**Goal**: Complete visual review, design system compliance, a11y audit

**15 Molecules**:
1. **DES-000-P0**: BLOCKED - Await server fix (ETA: Engineer 30 min)
2. **DES-001**: Design system compliance audit (45 min) - Use Chrome DevTools MCP
3. **DES-002**: Dashboard tiles visual review (40 min) - Spacing, typography, Polaris alignment
4. **DES-003**: Approvals drawer review (35 min) - HITL UI polish
5. **DES-004**: Mobile responsiveness (40 min) - 375px, 768px, 1024px breakpoints
6. **DES-005**: Color contrast WCAG AA (25 min) - Chrome DevTools accessibility audit
7. **DES-006**: Loading states review (20 min) - Skeleton loaders, spinner timing
8. **DES-007**: Error states review (25 min) - Error messages, empty states
9. **DES-008**: Microcopy polish (30 min) - Button labels, help text, tooltips
10. **DES-009**: Icon consistency (20 min) - Polaris icon usage
11. **DES-010**: Animation review (25 min) - Transitions, timing functions
12. **DES-011**: Focus states (20 min) - Keyboard navigation indicators
13. **DES-012**: Documentation (25 min) - Design specs updates
14. **DES-013**: Screenshot gallery (30 min) - Production UI evidence
15. **DES-014**: WORK COMPLETE (10 min) - Feedback entry

**Evidence**: Chrome DevTools screenshots, a11y audit report, design system compliance doc

---

### 2. Ads (v5.0) - Ads Intelligence System (Fresh Start)

**Status**: Needs complete rewrite (previous direction outdated)  
**Goal**: Build production ads metrics, HITL campaign approvals, Publer integration

**20 Molecules** (production-focused):

**Phase 1: Foundation (unblockers)**
1. **ADS-001**: Ads domain audit (20 min) - Verify what exists, what's needed
2. **ADS-002**: Ads metrics schema (30 min) - Supabase tables for campaign tracking
3. **ADS-003**: Shopify ads GraphQL (40 min) - Use shopify-dev-mcp to validate queries
4. **ADS-004**: Meta/Google stubs (35 min) - Feature-flagged mocks until credentials approved

**Phase 2: Core Features**
5. **ADS-005**: ROAS/CPC/CPA calculations (40 min) - Helper functions with zero-guards
6. **ADS-006**: Campaign metrics API route (35 min) - React Router 7 loader pattern
7. **ADS-007**: Ads dashboard tile (40 min) - Polaris Card with key metrics
8. **ADS-008**: Platform breakdown (30 min) - Meta vs Google vs organic
9. **ADS-009**: Campaign list view (45 min) - Table with performance data

**Phase 3: HITL & Automation**
10. **ADS-010**: Campaign approval drawer (50 min) - HITL workflow
11. **ADS-011**: Publer integration (40 min) - Schedule campaign posts
12. **ADS-012**: Budget alerts (30 min) - Notify when campaigns exceed threshold
13. **ADS-013**: Performance alerts (30 min) - Low ROAS warnings

**Phase 4: Testing & Production**
14. **ADS-014**: Contract tests (35 min) - Ads metrics API shape validation
15. **ADS-015**: Unit tests (40 min) - ROAS/CPC/CPA calculations
16. **ADS-016**: Integration tests (35 min) - Full campaign workflow
17. **ADS-017**: Feature flags (20 min) - ADS_REAL_DATA toggle
18. **ADS-018**: Documentation (25 min) - Ads pipeline spec
19. **ADS-019**: Monitoring setup (30 min) - Ads metrics tracking
20. **ADS-020**: WORK COMPLETE (15 min) - Feedback entry

**Evidence**: 20 tests passing, ads metrics flowing to dashboard, HITL approval working

---

### 3. DevOps (v4.0) - CI/CD & Production Deployment

**Status**: Lint deferred (P2), focus on deployment readiness  
**Goal**: Production deployment pipeline, monitoring, rollback procedures

**18 Molecules**:

**Phase 1: CI/CD Hardening**
1. **DEV-001**: GitHub Actions optimization (30 min) - Parallel jobs, caching
2. **DEV-002**: Deploy previews (40 min) - PR preview deployments on Fly.io
3. **DEV-003**: Secrets management (35 min) - GitHub Environments prod/staging
4. **DEV-004**: Build artifacts (30 min) - Upload build artifacts for rollback

**Phase 2: Fly.io Production**
5. **DEV-005**: Fly.io app config (35 min) - Production fly.toml
6. **DEV-006**: Database connection (40 min) - Supabase pooler for production
7. **DEV-007**: Health checks (30 min) - Fly.io health monitoring
8. **DEV-008**: Auto-scaling (35 min) - Scale based on load
9. **DEV-009**: Deployment pipeline (45 min) - GitHub Actions → Fly.io

**Phase 3: Monitoring & Observability**
10. **DEV-010**: Prometheus metrics (40 min) - Export app metrics
11. **DEV-011**: Log aggregation (35 min) - Structured logging to Supabase
12. **DEV-012**: Error tracking (30 min) - Error reporting pipeline
13. **DEV-013**: Uptime monitoring (25 min) - External uptime checks

**Phase 4: Rollback & DR**
14. **DEV-014**: Rollback procedures (40 min) - One-command rollback
15. **DEV-015**: Database backups (35 min) - Automated daily backups
16. **DEV-016**: Incident runbook (30 min) - Production incident response
17. **DEV-017**: Documentation (25 min) - Deployment runbook
18. **DEV-018**: WORK COMPLETE (15 min) - Feedback entry

**Evidence**: Successful production deployment, health checks passing, rollback tested

---

### 4. QA (v2.0) - Production Retest & Sign-off

**Status**: Awaiting P0 fixes, ready to retest  
**Goal**: Full production QA after all blockers resolved, final go/no-go

**15 Molecules**:

**Phase 1: Retest After P0 Fixes**
1. **QA-001**: Verify Engineer server fix (15 min) - Server starts, /health 200
2. **QA-002**: Retest unit suite (30 min) - Verify 100% passing (was 97.1%)
3. **QA-003**: Retest smoke tests (25 min) - Build, health, server responding
4. **QA-004**: RLS verification (20 min) - Confirm Data agent's RLS fix applied

**Phase 2: Full Production Testing**
5. **QA-005**: End-to-end user flows (60 min) - Login → tiles → drawer → approval
6. **QA-006**: A11y full audit (50 min) - WCAG AA compliance, Chrome DevTools MCP
7. **QA-007**: Performance testing (40 min) - P95 tile load <3s verification
8. **QA-008**: Security scan (30 min) - Verify 0 secrets, RLS working
9. **QA-009**: Integration tests (45 min) - All 6 external APIs contract tests
10. **QA-010**: Browser compatibility (40 min) - Chrome, Firefox, Safari, Edge

**Phase 3: Production Sign-off**
11. **QA-011**: Load testing (50 min) - Concurrent users, stress test
12. **QA-012**: Rollback testing (35 min) - Verify rollback procedures work
13. **QA-013**: Final QA Packet (30 min) - GO/NO-GO with evidence
14. **QA-014**: Production checklist (25 min) - Pre-launch verification
15. **QA-015**: WORK COMPLETE (15 min) - Feedback entry

**Evidence**: Final QA Packet with GO decision, 100% test pass rate, all evidence artifacts

---

## Next Steps for Manager

1. ✅ **Commit these direction updates** to PR #98
2. ⏸️ **Wait for Engineer** to fix server (ENG-000-P1, ~30 min)
3. 🚀 **Unblock Designer & Pilot** with running app
4. 📋 **Create 10 PRs** for completed agents (sequential, prevent git contamination)
5. ✅ **Monitor progress** on updated directions (Designer, Ads, DevOps, QA)
6. 🎯 **Production launch** after QA gives GO decision

---

## Timeline to Production

**Immediate** (0-2 hours):
- Engineer fixes server
- Designer/Pilot/QA unblocked

**Short-term** (2-8 hours):
- Designer completes visual review (15 molecules)
- Ads builds foundation (20 molecules)
- DevOps sets up deployment (18 molecules)

**Medium-term** (8-24 hours):
- QA retests everything (15 molecules)
- Manager creates 10 PRs for completed agents
- Final QA sign-off

**Production** (24-48 hours):
- Deploy to Fly.io production
- Monitor health/metrics
- Rollback ready if needed

---

**Manager Status**: Governance updated ✅, 4 agent directions ready for update, 10 agents ready for PRs


