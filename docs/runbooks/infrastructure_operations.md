---
epoch: 2025.10.E1
doc: docs/runbooks/infrastructure_operations.md
owner: deployment
last_reviewed: 2025-10-14
expires: 2025-10-21
---
# Infrastructure Operations Runbook

**Owner**: Deployment Agent  
**Last Updated**: 2025-10-14  
**Purpose**: Operational procedures for Fly.io infrastructure management

---

## Infrastructure Overview

### Active Services

| Service | App Name | Region | Size | Auto-Stop | Purpose |
|---------|----------|--------|------|-----------|---------|
| **Staging App** | hotdash-staging | ord | shared-cpu-1x:1024MB | No | Main application (staging) |
| **Agent SDK** | hotdash-agent-service | ord | shared-cpu-1x:512MB | Yes | AI agent backend |
| **LlamaIndex MCP** | hotdash-llamaindex-mcp | iad | shared-cpu-1x:512MB | Yes | Knowledge base MCP server |
| **Chatwoot** | hotdash-chatwoot | ord | 2x shared-cpu-1x:2048MB | No | Customer support (web + worker) |

### Architecture Principles

- **Database**: Supabase-only posture (no Fly Postgres permitted per canon)
- **Auto-Stop**: Enabled on background services (agent-service, llamaindex-mcp)
- **Always-On**: Staging app and Chatwoot (customer support)
- **Secrets**: Managed via vault (`vault/occ/`) and Fly secrets

---

## Common Operations

### 1. Check Service Health

```bash
# All apps status
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
for app in hotdash-staging hotdash-agent-service hotdash-llamaindex-mcp hotdash-chatwoot; do
  echo "=== $app ==="
  ~/.fly/bin/fly status -a $app
  echo ""
done
```

### 2. View Service Logs

```bash
# Recent logs
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly logs -a hotdash-staging

# Follow logs in real-time
~/.fly/bin/fly logs -a hotdash-staging -f

# Specific machine logs
~/.fly/bin/fly logs -a hotdash-staging -i <machine-id>
```

### 3. Restart Service

```bash
# Restart entire app (rolling restart)
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly apps restart hotdash-staging

# Restart specific machine
~/.fly/bin/fly machine restart <machine-id> -a hotdash-staging
```

### 4. Scale Resources

```bash
# Scale memory
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly scale memory 2048 -a hotdash-chatwoot

# Scale machine count (not recommended - use auto-scaling)
~/.fly/bin/fly scale count 2 -a hotdash-staging
```

### 5. Manage Secrets

```bash
# List secrets
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly secrets list -a hotdash-staging

# Set secret (from vault)
source ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env
~/.fly/bin/fly secrets set DATABASE_URL="$DATABASE_URL" -a hotdash-staging

# Unset secret
~/.fly/bin/fly secrets unset OLD_SECRET_NAME -a hotdash-staging
```

---

## Incident Response

### Service Down / Unhealthy

**Symptoms**: 
- Health check failures
- 5xx errors
- Service unreachable

**Resolution Steps**:

1. **Check Service Status**
   ```bash
   source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
   ~/.fly/bin/fly status -a <app-name>
   ```

2. **Check Recent Logs**
   ```bash
   ~/.fly/bin/fly logs -a <app-name> --tail 100
   ```

3. **Verify Machine Health**
   ```bash
   ~/.fly/bin/fly machine list -a <app-name>
   ~/.fly/bin/fly machine status <machine-id> -a <app-name>
   ```

4. **Restart if Needed**
   ```bash
   ~/.fly/bin/fly apps restart <app-name>
   ```

5. **If Restart Fails, Check Secrets**
   ```bash
   ~/.fly/bin/fly secrets list -a <app-name>
   # Verify DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY exist
   ```

6. **Last Resort: Redeploy**
   ```bash
   # Trigger deployment via GitHub Actions or:
   cd ~/HotDash/hot-dash
   bash scripts/deploy/staging-deploy.sh
   ```

### High Memory Usage

**Symptoms**:
- OOM (Out of Memory) errors
- Machine restarts
- Slow response times

**Resolution Steps**:

1. **Check Current Usage**
   ```bash
   source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
   ~/.fly/bin/fly machine status <machine-id> -a <app-name> -d
   ```

2. **Scale Memory (Temporary)**
   ```bash
   ~/.fly/bin/fly scale memory 2048 -a <app-name>
   ```

3. **Update fly.toml (Permanent)**
   ```toml
   [vm]
   memory = "2048mb"
   ```

4. **Redeploy with New Config**
   ```bash
   fly deploy --config fly.toml
   ```

### Deployment Failure

**Symptoms**:
- Failed health checks after deploy
- Auto-rollback triggered
- GitHub issue created automatically

**Resolution Steps**:

1. **Check GitHub Actions Logs**
   - Navigate to failed workflow run
   - Review health check / smoke test failures

2. **Check Deployment Logs**
   ```bash
   source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
   ~/.fly/bin/fly logs -a hotdash-staging | grep -i "error\|fail"
   ```

3. **Verify Rollback Completed**
   ```bash
   ~/.fly/bin/fly status -a hotdash-staging
   # Check that previous version is running
   ```

4. **Manual Rollback (if auto-rollback failed)**
   ```bash
   # Trigger rollback workflow
   gh workflow run rollback-deployment.yml \
     --ref main \
     -f environment=staging \
     -f reason="Manual rollback after failed auto-rollback"
   ```

---

## Monitoring & Alerts

### Automated Monitoring

- **Infrastructure Monitoring**: Runs every 15 minutes via GitHub Actions
  - File: `.github/workflows/infrastructure-monitoring.yml`
  - Creates GitHub issues on failure

- **Metrics Dashboard**: On-demand metrics collection
  ```bash
  bash scripts/monitoring/fly-metrics-dashboard.sh
  ```

- **Executive Dashboard**: DORA metrics and operational health
  ```bash
  bash scripts/monitoring/executive-dashboard.sh
  ```

### Manual Health Checks

```bash
# Quick health check all services
for app in hotdash-staging hotdash-agent-service hotdash-llamaindex-mcp hotdash-chatwoot; do
  echo "Checking $app..."
  curl -f -s "https://$app.fly.dev/health" || curl -f -s "https://$app.fly.dev/hc" || echo "❌ Health check failed"
done
```

---

## Cost Optimization

### Current Optimization

- ✅ Auto-stop enabled on background services
- ✅ No Fly Postgres (Supabase-only)
- ✅ Orphaned resources cleaned up
- ✅ Stopped machines removed

### Monthly Cost Tracking

```bash
# View billing (requires Fly dashboard access)
# https://fly.io/dashboard/personal/billing

# Or estimate from machine list
source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
~/.fly/bin/fly apps list
~/.fly/bin/fly volumes list
```

### Cost Optimization Checklist

- [ ] Review machine sizes quarterly
- [ ] Check for stopped/orphaned machines monthly
- [ ] Verify auto-stop configuration on background services
- [ ] Audit unused volumes monthly
- [ ] Review and delete old apps/machines

---

## Disaster Recovery

### Backup Procedures

**Supabase** (Database):
- Managed by Supabase (automatic backups)
- Point-in-time recovery available
- Recovery procedure: See `docs/runbooks/backup-restore-week3.md`

**Application State**:
- Version controlled in Git
- Docker images stored in registry
- Secrets backed up in vault (`vault/occ/`)

### Recovery Steps

1. **Database Recovery** (if needed)
   - Use Supabase dashboard for point-in-time recovery
   - Or restore from backup: `supabase db dump` output

2. **Application Recovery**
   ```bash
   # Redeploy from last known good commit
   git checkout <last-good-commit>
   bash scripts/deploy/staging-deploy.sh
   
   # Or trigger production deploy via GitHub Actions
   gh workflow run deploy-production.yml --ref <tag>
   ```

3. **Secrets Recovery**
   ```bash
   # Re-apply secrets from vault
   source ~/HotDash/hot-dash/vault/occ/fly/api_token.env
   source ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env
   
   ~/.fly/bin/fly secrets set DATABASE_URL="$DATABASE_URL" -a hotdash-staging
   ```

---

## Maintenance Windows

### Planned Maintenance

1. **Schedule** (Notify team 24 hours ahead):
   - Post in relevant channels
   - Update status page (if available)

2. **Execute**:
   ```bash
   # Put in maintenance mode (if supported)
   # Then perform updates
   ~/.fly/bin/fly deploy --config fly.toml
   ```

3. **Verify**:
   ```bash
   bash scripts/deploy/automated-smoke-test.sh
   ```

4. **Close** (Notify team when complete)

### Emergency Maintenance

1. **Assess Impact**: Critical vs. Non-critical
2. **Notify**: Post in emergency channel
3. **Execute**: Minimal changes to restore service
4. **Verify**: Health checks + smoke tests
5. **Document**: Post-mortem in `artifacts/incidents/`

---

## Contacts & Escalation

### On-Call Rotation

- **Primary**: Deployment Agent (automated)
- **Secondary**: Reliability Agent
- **Manager Escalation**: For production incidents

### External Services

- **Fly.io Support**: https://fly.io/docs/about/support/
- **Supabase Support**: https://supabase.com/docs/guides/platform/support
- **GitHub Support**: https://support.github.com/

---

## References

- North Star: `docs/NORTH_STAR.md`
- Deployment Direction: `docs/directions/deployment.md`
- Credential Index: `docs/ops/credential_index.md`
- Agent SDK Monitoring: `docs/runbooks/agent-sdk-monitoring.md`
- Fly Monitoring Setup: `docs/runbooks/fly-monitoring-dashboard-setup.md`
- LlamaIndex Monitoring: `docs/runbooks/llamaindex-mcp-monitoring.md`

---

**Document Control**:
- Review Frequency: Weekly
- Update Trigger: Infrastructure changes, new services, incidents
- Approval: Manager required for major changes

