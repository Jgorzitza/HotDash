# DevOps Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T22:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Infrastructure + Migration Support

---

## ✅ PREVIOUS WORK COMPLETE
- ✅ DEVOPS-001 P0: v74 deployed (healthy after v72/v73 crashes)
- ✅ DEVOPS-002-005: CI/CD, monitoring, migrations, rollback
**Status**: v74 healthy, 12 MCP calls logged

**LESSON LEARNED**: **ALWAYS use mcp_fly_fly-logs BEFORE escalating deployment issues**

---

## ACTIVE TASKS (12h total)

### DEVOPS-006: Apply DATA-006 Performance Indexes (2h) - START NOW
Apply migration 20251021000001_add_performance_indexes.sql to staging
- Review migration file (ensure no DROP statements)
- Apply via Supabase Dashboard or CLI
- Verify 9 indexes created
- Run ANALYZE on tables
- Test query performance (should show Index Scan not Seq Scan)
- **CRITICAL**: Use mcp_fly_fly-logs to verify app health post-migration
**MCP**: Fly MCP (status, logs) + Supabase migration API

### DEVOPS-007: Deploy Phase 7-8 Analytics Tables (2h)
Apply Data agent's Phase 7-8 migrations (5 tables)
- Coordinate with Data agent
- Apply migrations 20251021000002-000006
- Verify tables exist, RLS enabled
- Run ANALYZE
**MCP**: Fly MCP + Supabase

### DEVOPS-008: Application Performance Monitoring (2h)
Configure Fly.io metrics dashboard + alerts
- Set up 5 alerts (response time, errors, memory, CPU, health)
- Add custom metrics instrumentation
- Create performance queries script
**MCP**: Fly MCP logs analysis

### DEVOPS-009: Migration Automation Workflow (2h)
Create GitHub Actions workflow for migration application
- Manual trigger with approval (HITL)
- Validate migrations, apply, verify
**MCP**: Context7 GitHub Actions

### DEVOPS-010: Production Deployment Preparation (2h)
Create production deployment workflow
- Promote staging image to production
- Health checks, rollback automation
**MCP**: Context7 GitHub Actions, Fly MCP

### DEVOPS-011: Infrastructure Monitoring (2h)
Comprehensive monitoring for all apps
- Configure alerts (critical, warning, info)
- Monitoring script
**MCP**: Fly MCP

### DEVOPS-012: Log Aggregation (1h)
Log analysis queries + structured logging
- Performance queries from logs
- Troubleshooting guide
**MCP**: Fly MCP logs

### DEVOPS-013: Phase 7-8 Deployment Support (1h reactive)
Deploy Engineer's Phase 7-8 when ready
- Monitor commits, deploy, verify
**MCP**: Fly MCP

**START NOW**: Use Fly MCP to check v74 health, then apply DATA-006 indexes
