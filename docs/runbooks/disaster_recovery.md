# Disaster Recovery Plan

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Complete disaster recovery strategy for business continuity

## Disaster Scenarios

### Scenario 1: Complete Data Center Failure

**Impact**: Application and database both unavailable  
**Probability**: Low (Fly.io multi-region)  
**RTO**: 2 hours  
**RPO**: 24 hours (daily backup)

**Recovery Steps**:

1. Verify Fly.io status (https://status.flyio.net)
2. Deploy to alternative region:
   ```bash
   fly deploy --region <alternative-region>
   ```
3. Restore database from latest backup
4. Update DNS if needed
5. Verify application functional

### Scenario 2: Database Catastrophic Failure

**Impact**: All data loss, database unrecoverable  
**Probability**: Very Low (Supabase redundancy)  
**RTO**: 4 hours  
**RPO**: 24 hours (daily backup)

**Recovery Steps**:

1. Create new Supabase project
2. Restore from latest backup:
   ```bash
   gunzip -c backups/latest.sql.gz | psql $NEW_DB_URL
   ```
3. Apply any pending migrations
4. Update DATABASE_URL in application
5. Verify data integrity
6. Deploy application

### Scenario 3: Compromised Credentials

**Impact**: Security breach, unauthorized access  
**Probability**: Medium (if credentials exposed)  
**RTO**: 1 hour  
**RPO**: 0 (no data loss expected)

**Recovery Steps**:

1. Immediately rotate ALL credentials:
   - Shopify API keys
   - Supabase service keys
   - GitHub tokens
   - Third-party API keys
2. Review access logs for breach scope
3. Force logout all sessions
4. Deploy application with new credentials
5. Audit for data exfiltration
6. Report to affected parties if needed

### Scenario 4: Complete Code Repository Loss

**Impact**: Loss of application code  
**Probability**: Very Low (GitHub redundancy)  
**RTO**: 8 hours  
**RPO**: Last commit (0 if devs have local clones)

**Recovery Steps**:

1. Restore from developer local clones:
   ```bash
   # Any team member with recent clone
   cd ~/HotDash/hot-dash
   git remote add backup https://github.com/NEW-REPO
   git push backup --all
   git push backup --tags
   ```
2. Or restore from GitHub backup (if configured)
3. Reconfigure CI/CD
4. Restore secrets
5. Deploy application

### Scenario 5: Key Personnel Unavailable

**Impact**: Knowledge loss, slower response  
**Probability**: Medium  
**RTO**: Varies by role  
**RPO**: N/A

**Mitigation**:

- **Documentation**: All procedures documented in runbooks ✅
- **Cross-training**: Multiple people can execute procedures
- **Automated**: Critical operations automated
- **Escalation**: Clear escalation paths

## Recovery Procedures

### Phase 1: Declare Disaster (0-15 min)

**Criteria for disaster declaration**:

- Application unavailable >30 minutes
- Data loss confirmed
- Security breach active
- Infrastructure provider major outage

**Actions**:

1. Create incident (P0):
   ```bash
   gh issue create --title "[DISASTER] <description>" --label "disaster,P0"
   ```
2. Notify all stakeholders
3. Activate disaster recovery team
4. Begin parallel recovery tracks

### Phase 2: Assess & Prioritize (15-30 min)

**Assessment**:

- Scope of disaster
- Data availability (backups)
- Infrastructure availability
- Estimated recovery time
- Resource requirements

**Prioritize**:

1. Data recovery first
2. Critical functionality (read-only dashboard)
3. Full functionality restore
4. Performance optimization

### Phase 3: Execute Recovery (30 min - 4 hours)

**Track 1: Data** (Highest priority)

- Locate latest good backup
- Create recovery database
- Restore data
- Verify integrity

**Track 2: Application**

- Deploy to available infrastructure
- Configure with recovery database
- Test basic functionality
- Enable read-only mode if needed

**Track 3: Infrastructure**

- Provision new resources if needed
- Configure DNS
- Set up monitoring
- Apply security hardening

### Phase 4: Verification (1-2 hours)

**Verify**:

- [ ] Database accessible and intact
- [ ] Application deployed and healthy
- [ ] All critical features working
- [ ] No data corruption
- [ ] Monitoring operational
- [ ] Secrets secured

**Test**:

```bash
# Run smoke test suite
npm run test:smoke --url=<recovery-url>

# Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Check recent transactions
psql $DATABASE_URL -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;"
```

### Phase 5: Restore Normal Operations (2-8 hours)

**Actions**:

- Migrate traffic to recovered environment
- Enable write operations
- Resume normal deployment cadence
- Conduct post-mortem
- Implement improvements

## Business Continuity

### Critical Business Functions

| Function                   | RTO     | Workaround if Down           |
| -------------------------- | ------- | ---------------------------- |
| View dashboard (read-only) | 30 min  | Manual Shopify admin access  |
| Process orders             | 1 hour  | Direct Shopify admin         |
| Customer support           | 2 hours | Email fallback (no CX agent) |
| Inventory management       | 4 hours | Spreadsheet + manual Shopify |

### Communication Plan

**Stakeholders**:

- CEO (immediate)
- Team members (immediate)
- Customers (if >2 hour outage)

**Channels**:

- Internal: Slack/email
- External: Status page, email
- Social: Twitter/Facebook (major outages only)

## Recovery Resources

### Required Access

**Must Have**:

- GitHub repository access
- Fly.io account access
- Supabase account access
- Domain registrar access (for DNS)

**Should Have**:

- Backup storage access
- Monitoring service access
- Third-party API credentials backup

### Contact Information

**Infrastructure Providers**:

- Fly.io Support: https://fly.io/docs/about/support/
- Supabase Support: support@supabase.io
- GitHub Support: https://support.github.com
- Shopify Support: https://help.shopify.com

**Internal**:

- CEO: <contact>
- DevOps: <contact>
- Engineering Lead: <contact>

## Testing & Drills

### Quarterly Disaster Recovery Drill

**Scope**: Simulate complete infrastructure failure  
**Duration**: 4 hours  
**Participants**: DevOps, Manager, CEO

**Procedure**:

1. Announcement: "DR drill starting at HH:MM"
2. Simulate failure (use test environment)
3. Execute recovery procedures
4. Document time taken for each phase
5. Identify gaps and improvements
6. Update DR plan

**Success Criteria**:

- Recovery completed within RTO
- All data verified intact
- Application fully functional
- No major procedure gaps

### Annual Full Recovery Test

**Scope**: Complete recovery from backup to production  
**Duration**: 1 day  
**Date**: Low-traffic day (e.g., Thanksgiving)

**Procedure**:

1. Take production offline (maintenance mode)
2. Perform complete infrastructure rebuild
3. Restore all data from backups
4. Verify 100% functionality
5. Document complete process
6. Return to normal operations

## Related Documentation

- Backup/Recovery: `docs/runbooks/backup_recovery.md`
- Incident Response: `docs/runbooks/incident_response.md`
- Production Deploy: `docs/runbooks/production_deploy.md`
- Recovery Drill: `docs/runbooks/recovery_drill_monthly.md`
