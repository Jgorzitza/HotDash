# Agent Coordination Map - Dependencies

**Version**: 1.0
**Created**: 2025-10-19

## Critical Path Dependencies

### Build & Test Foundation
```
Manager (create schemas) → Engineer (fix tests) → QA (validate)
                                ↓
                          Build PASSING → All agents can proceed
```

### Database Pipeline
```
DevOps (verify CI) → Data (staging migration) → DevOps (staging deploy)
                                ↓
                     Data (production migration) → All integrations enabled
```

### UI Components
```
Designer (specs complete) → Engineer (implement) → QA (validate) → Pilot (UX test)
                                ↓
                          UI Production Ready
```

### Analytics Pipeline
```
Data (tables ready) → Analytics (real data) → Dashboard (tiles working)
                                ↓
                         Product (metrics for Go/No-Go)
```

### HITL Flows
```
AI-Knowledge (RAG) → AI-Customer (drafts) → Approvals (review) → Action (apply)
                                ↓
                         CX Production Ready
```

---

## Agent Dependencies Matrix

| Agent | Depends On | Unblocks |
|-------|-----------|----------|
| Engineer | Manager (schemas ✅) | QA, All UI consumers |
| QA | Engineer (tests fixed) | Product (Go/No-Go) |
| DevOps | None | Data (staging), All (CI) |
| Data | DevOps (CI ✅) | Analytics, Integrations |
| Product | QA + Analytics | CEO (launch decision) |
| Analytics | Data (tables), Engineer (schemas ✅) | Dashboard, Product |
| Inventory | Data (tables) | Dashboard, Approvals |
| Integrations | Data (tables) | All API consumers |
| Support | None | AI-Customer |
| AI-Customer | AI-Knowledge (RAG) | CX tile, Approvals |
| AI-Knowledge | Data (tables) | AI-Customer |
| Ads | Manager (module ✅), Analytics | Dashboard, Approvals |
| SEO | Analytics (GA4) | Dashboard, Approvals |
| Content | Designer (specs ✅) | Publer, Approvals |
| Designer | None ✅ | Engineer, QA |
| Pilot | Engineer (UI), QA (tests) | Product (validation) |

---

## Execution Order (Optimal)

### Wave 1 (Parallel - No Dependencies)
1. DevOps - Verify CI, create scripts
2. Designer - Consolidate feedback (DONE)
3. Content - Consolidate feedback
4. Support - Chatwoot integration

### Wave 2 (After Manager Creates Infrastructure)
5. Engineer - Fix tests, build UI
6. Data - Staging migrations
7. AI-Knowledge - RAG pipeline
8. Ads - Finish module

### Wave 3 (After Engineer Fixes Tests)
9. QA - Full validation
10. Analytics - Real data integration
11. Inventory - ROP calculations
12. SEO - Monitoring

### Wave 4 (After Data Staging)
13. Integrations - Real Supabase
14. AI-Customer - With RAG
15. Pilot - Full UX validation

### Wave 5 (After All Features)
16. Product - Go/No-Go report
17. DevOps - Production deploy
18. Data - Production migration

---

## Coordination Checkpoints

**Checkpoint 1** (Hour 2):
- DevOps: CI status?
- Engineer: Tests fixed?
- If NO: Escalate to Manager

**Checkpoint 2** (Hour 4):
- Data: Staging migrated?
- QA: Tests passing?
- If NO: Reassess timeline

**Checkpoint 3** (Hour 6):
- All features: Implemented?
- Analytics: Real data working?
- If NO: Identify blockers

**Checkpoint 4** (Hour 8):
- Staging: Validated?
- Product: Go/No-Go ready?
- If GO: Deploy to production

---

**Created**: 2025-10-19
**Use**: Agent planning, blocker identification

