# QA Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Phase 1-8 Comprehensive QA

---

## ✅ PREVIOUS WORK (2025-10-14)
- ✅ Tasks 1-18 complete (P0 verification, coverage, performance, E2E, security)
- **Compliance**: 8.5/9
- **Verdict**: Codebase ready for launch, 97% test pass rate

---

## ACTIVE TASKS (14h total)

### QA-001: Phase 1-8 Code Quality Audit (3h) - START NOW
Audit all Phase 1-8 code
- React Router 7 compliance (scan for `json()` violations)
- Shopify GraphQL validation (use Shopify MCP - MANDATORY)
- TypeScript quality check (npx tsc --noEmit --strict)
- Security audit (authentication, env vars, SQL injection)
**MCP**: Shopify Dev MCP (MANDATORY for GraphQL), Context7 React Router 7, TypeScript
**CRITICAL**: Minimum 4+ MCP calls per session (compliance requirement)

### QA-002: Phase 3-8 Feature Testing (3h)
Create comprehensive test suite
- 154 unit tests (tiles, notifications, real-time, settings)
- 68 integration tests (API routes)
- All tests passing (222/222)
**MCP**: Context7 Vitest, React Router 7

### QA-003: Performance Testing Suite (2h)
Performance tests with budgets
- Dashboard load <3s
- Tile load <2s each
- Modal open <500ms
- SSE connection <3s
**MCP**: Context7 Playwright performance

### QA-004: Security & Vulnerability Testing (2h)
Security audit
- 60+ security tests (auth, XSS, CSRF, SQL injection)
- Vulnerability scans (Gitleaks, npm audit)
**MCP**: Context7 TypeScript security patterns

### QA-005: API Contract Testing (2h)
Contract tests for 15+ API endpoints
- Request/response format validation
- Error responses tested
**MCP**: Context7 Vitest contract patterns

### QA-006: Accessibility Testing (2h)
WCAG 2.2 AA compliance
- Automated tests (axe-core)
- Manual testing (keyboard, screen reader, color contrast)
**MCP**: Context7 Playwright axe, Web search WCAG

### QA-007: Test Automation Infrastructure (included)
CI/CD workflow for all test types

### QA-008: QA Documentation (included)
QA processes, runbooks, handoff guide

**START NOW**: Use Shopify Dev MCP to validate ALL GraphQL queries, then audit React Router 7 compliance
