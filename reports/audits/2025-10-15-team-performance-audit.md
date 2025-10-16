# HotDash Engineering & Agent Team Audit — 2025-10-15

**Prepared by:** Codex (external reviewer)  
**Audience:** Product & Engineering Management  
**Scope:** Repository state, code quality, agent-service readiness, documentation fidelity  
**Source Baseline:** `manager/docs-cleanup-2025-10-15` worktree as of 2025-10-15

---

## 1. Highlights (What’s Working)
- **Dashboard Orchestration:** `app/routes/app._index.tsx` successfully wires six live tiles with defensive loading, caching, and fact logging. Shopify, GA, Chatwoot, and metrics services are orchestrated through shared helpers (`app/services/shopify/orders.ts`, `app/services/metrics/aggregate.ts`, `app/services/chatwoot/escalations.ts`), showing production-grade patterns rather than stubs.
- **Governance & Evidence Rails:** Prisma schema (`prisma/schema.prisma`) captures `DashboardFact` and `DecisionLog` records; Danger rules forbid ad-hoc markdown edits and enforce issue linkage (`Dangerfile.js`). MCP documentation and tooling (`README.md`, `mcp/ALL_SYSTEMS_GO.md`) are thorough, enabling agent safety and repeatability.
- **Strategic Clarity:** Direction, design, and strategy docs are aligned to the North Star vision (`docs/NORTH_STAR.md`, `docs/directions/engineer.md`, `docs/design/dashboard-tiles.md`). Expectations for HITL approvals, accessibility, and performance are explicit—no ambiguity about “done”.
- **Approvals Backend Foundation:** The agent-service (`apps/agent-service/src/server.ts`) already handles Chatwoot webhooks, persists approval state (SQLite/FS or Postgres), and resumes OpenAI agent sessions. Store logic (`apps/agent-service/src/feedback/store.ts`) cleanly abstracts between local files and Supabase.

---

## 2. Critical Risks & Gaps
1. **Broken Build Surface**
   - `npm run lint` currently hard-fails with 534 violations. Root cause: dashboard component files use escaped operators (`\!==`, `\!`) rendering them invalid TypeScript (`app/components/dashboard/*.tsx`, `app/utils/feature-flags.ts`, `app/utils/telemetry.ts`).
   - ESLint also flags pervasive `any` usage, unused variables, import resolution failures in several API routes, and JSX accessibility violations (e.g., `app/components/modals/*.tsx`).

2. **Unrealised Approvals Experience**
   - UI fetches from hard-coded `http://localhost:8002` without authentication or environment awareness (`app/routes/approvals/route.tsx`) and simply dumps JSON via `ApprovalCard`. No evidence drawer, grading inputs, or telemetry despite status reports claiming completion (`feedback/engineer/2025-10-15.md`).
   - Approve/reject actions POST directly to agent-service endpoints and then reload the page, bypassing React Router actions (`app/components/ApprovalCard.tsx`). This sidesteps form submission protections and will break once Shopify session enforcement is restored.

3. **Undelivered API Contracts**
   - Newly added analytics/content API routes import Remix helpers not available in this React Router app (`app/routes/api/content.performance.ts`) and call placeholder services (`app/services/content/engagement-analyzer.ts`, `app/lib/seo/rankings.ts`) that return mock or empty structures. Consumers will see 500s or empty payloads after deploy.

4. **RAG Index Regression**
   - `scripts/rag/build-index.ts` clears `packages/memory/indexes/operator_knowledge/` via `fs.rm` before verifying an OpenAI key. During this audit the directory was deleted and not rebuilt, leaving the knowledge base unavailable.

5. **Failing Unit Test**
   - `npm run test:unit` fails in `tests/unit/utils.date.spec.ts` (off-by-one day). This indicates either locale-sensitive Date parsing or incorrect test expectations (`app/utils/date.server.ts:parseISODate`). CI is red until resolved.

6. **Status Reporting Drift**
   - Feedback files assert assets that do not exist (e.g., `app/components/approvals/ApprovalsDrawer.tsx`, drawer unit tests, expanded telemetry coverage). The codebase lacks these files, signalling either unmerged work or inaccurate reporting. This erodes trust in self-reported completion.

7. **Agent-Service Reliability**
   - Prior reliability reports note a Zod schema crash on startup (SEV-1) with instructions to fix and redeploy (`reports/reliability/2025-10-12-agent-sdk-deployment-status.md`). No remediation commit or deployment evidence was found; if unresolved, the approval loop endpoint the UI calls will remain offline.

---

## 3. Verification Artifacts
| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | ❌ | Parse errors + 534 ESLint violations across new dashboard/utility files. |
| `npm run test:unit` | ❌ | `parseISODate` expectation fails (`tests/unit/utils.date.spec.ts:50`). |
| `scripts/rag/build-index.ts` | ❌ | Removes persisted index, aborts without recreating when OpenAI key absent. |
| Documentation Review | ✅ | Direction/design/strategy docs match overall vision. |
| Agent-Service Source Audit | ⚠️ | Logic solid, but production health unresolved (see reliability reports). |

---

## 4. Recommendations & Required Actions
1. **Restore Build Health (Blocker)**
   - Fix escaped operators in dashboard/utility components and rerun ESLint until clean. Address remaining lint errors (`no-explicit-any`, `no-unused-vars`, `import/no-unresolved`, `jsx-a11y`). Re-run `npm run lint` in CI before merging any feature branches.
2. **Deliver True Approvals UI**
   - Parameterise agent-service endpoints, enforce Shopify auth, and implement the evidence/grade workflow described in design/direction docs. Add unit tests for the drawer and integration tests for approve/reject flows. Replace manual `fetch` calls with React Router actions to inherit CSRF/session guards.
3. **Stabilise API Routes**
   - Audit newer API handlers (`app/routes/api/**`) to ensure they import from the right router helpers, validate inputs, and return data from actual services. Backfill tests to cover expected behaviours and failure modes.
4. **Fix Date Utilities**
   - Update `parseISODate` (or adjust the test) to handle timezone offsets consistently. Confirm `npm run test:unit` passes locally and in CI.
5. **Rebuild Knowledge Index Safely**
   - Modify the RAG script to verify credentials before deleting persisted data; restore the operator knowledge index from backup or regenerate with valid keys.
6. **Rectify Status Reporting**
   - Align feedback logs with the repository state. If missing files exist on another branch, merge them; otherwise, update the logs to reflect true progress and outstanding gaps.
7. **Close the Agent-Service Incident**
   - Patch the Zod schema startup error, redeploy to Fly, and capture evidence (health endpoint, log tail). Without this, approvals remain non-functional regardless of UI fixes.

---

## 5. Suggested Follow-Up Cadence
- **48 hours:** Resolve lint/test failures and confirm CI green.  
- **This sprint:** Ship approvals drawer parity, agent-service redeploy, and RAG rebuild.  
- **Weekly:** Run `scripts/rag/build-index.ts --skip-test` (with creds) and agent-service health checks; include results in reliability reports.  
- **Per PR:** Require `Allowed paths` declaration, `npm run lint`, `npm run test:unit`, and screenshots/evidence of approvals flow.

---

## 6. Appendix — Key File References
- `app/routes/app._index.tsx` — Dashboard data orchestration  
- `app/components/dashboard/*.tsx` — Newly added tiles (currently invalid syntax)  
- `app/routes/approvals/route.tsx`, `app/components/ApprovalCard.tsx` — Approvals UI (incomplete)  
- `apps/agent-service/src/server.ts`, `apps/agent-service/src/feedback/store.ts` — Agent-service backend  
- `scripts/rag/build-index.ts` — RAG index builder (destructive path)  
- `tests/unit/utils.date.spec.ts` — Failing unit test  
- `reports/reliability/2025-10-12-agent-sdk-deployment-status.md` — Outstanding agent-service incident  
- `feedback/engineer/2025-10-15.md` — Overstated completion claims (requires correction)

---

**Bottom Line:** Strong architectural groundwork and documentation are in place, but the latest sprint introduces regressions (lint/test failures, missing approvals UI, broken RAG index) that must be corrected before further feature work. Focus on restoring build health, delivering the promised approvals experience, and ensuring the agent-service is stable in production.
