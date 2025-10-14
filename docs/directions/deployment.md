---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Deployment — Direction

## Canon
- North Star: docs/NORTH_STAR.md (MCP-First Development)
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md

> **Training Data WARNING**: We are in 2025. Shopify APIs in training from 2023 (2 YEARS OLD). React Router 7 training has v6/Remix (2+ years old). ALWAYS verify with appropriate MCP tools.
- Fly Deployment: docs/runbooks/agent-sdk-production-deployment.md

## Current Sprint Focus — Growth System Deployment (2025-10-14)

**Status**: Framework ready ✅, awaiting features for deployment

**Priority 0: Production Readiness** (This Week - 8-10 hours)

1. **Environment Configuration** (2 hours)
   - Production secrets setup (Supabase, OpenAI, Shopify)
   - Environment variables validation
   - Secret rotation verification

2. **Fly.io Configuration** (2 hours)
   - Scale memory to 2GB for growth workload
   - Configure health checks for action system
   - Auto-scaling rules for recommender jobs

3. **Database Migration Strategy** (1-2 hours)
   - Production migration plan for Action tables
   - Rollback procedures
   - Zero-downtime deployment

4. **Monitoring Setup** (2-3 hours)
   - Action execution metrics
   - Recommender performance tracking
   - Alert thresholds (failure rate, latency)

5. **Deployment Runbook** (1-2 hours)
   - Step-by-step production deploy
   - Rollback procedures
   - Incident response plan

**Priority 1: CI/CD Enhancement** (Week 2 - 10-12 hours)

6. **Automated Testing Pipeline** (3 hours)
   - Pre-deploy test gates (unit, integration, E2E)
   - Performance benchmarks
   - Security scans

7. **Blue-Green Deployment** (3-4 hours)
   - Zero-downtime deployments
   - Traffic switching mechanism
   - Automatic rollback on errors

8. **Feature Flags** (2 hours)
   - Toggle recommenders independently
   - Gradual rollout controls
   - A/B test deployment

9. **Database Backup Automation** (2 hours)
   - Hourly backups during growth deployment
   - Point-in-time recovery
   - Backup retention (30 days)

**Priority 2: Advanced Ops** (Week 3 - 8-10 hours)

10. **Multi-Region Deployment** (3 hours)
11. **Chaos Engineering** (2 hours)
12. **Cost Optimization** (2 hours)
13. **Performance Tuning** (2-3 hours)

## Evidence & Compliance

Report every 2 hours:
```
## YYYY-MM-DDTHH:MM:SSZ — Deployment: [Task] [Status]
**Working On**: [P0 task]
**Progress**: [% or milestone]
**Evidence**: 
- Config: [file path]
- Deploy: [Fly app status]
- Health: [endpoint check]
**Blockers**: [None or details]
**Next**: [Next task]
```

## Success Criteria

**P0 Complete**: Production ready, secrets secured, monitoring live  
**P1 Complete**: CI/CD automated, blue-green working, backups hourly  
**P2 Complete**: Multi-region, chaos tested, cost optimized

## Timeline

- Week 1: 8-10 hours (Production prep)
- Week 2: 10-12 hours (CI/CD)
- Week 3: 8-10 hours (Advanced)
- **Total**: 26-32 hours

---

## ⚠️ EXECUTION INSTRUCTION

**DO NOT STOP TO ASK "WHAT'S NEXT"**:
- Your direction file contains ALL your tasks (P0, P1, P2)
- Execute them sequentially until ALL complete
- Report progress every 2 hours (don't ask permission)
- Log blockers and move to next task if stuck
- Only stop when ALL assigned work is done

**See**: .cursor/rules/04-agent-workflow.mdc for complete execution rules

---

**Last Updated**: 2025-10-14T21:20:00Z  
**Start**: Environment config immediately  
**Evidence**: All work in `feedback/deployment.md`
