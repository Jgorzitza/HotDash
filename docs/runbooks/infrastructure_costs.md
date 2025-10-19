# Infrastructure Cost Tracking

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Track and optimize infrastructure spending

## Monthly Cost Breakdown

### Hosting (Fly.io)

**Production App**:

- Instance type: shared-cpu-1x
- Instances: 2 (for redundancy)
- Cost: ~$10-20/month (estimated)

**Staging App**:

- Instance type: shared-cpu-1x
- Instances: 1
- Cost: ~$5-10/month (estimated)

**Total Fly.io**: ~$15-30/month

### Database (Supabase)

**Tier**: Free (currently) or Pro ($25/month)

**Free Tier Limits**:

- Database size: 500 MB
- Bandwidth: 2 GB
- Storage: 1 GB

**When to upgrade to Pro**:

- Database >400 MB (80% of free tier)
- Need Point-in-Time Recovery (PITR)
- Need more than 7-day backups

**Pro Tier**: $25/month

### CI/CD (GitHub Actions)

**Free Tier**: 2000 minutes/month

**Current Usage** (estimated):

- ~50-100 workflow runs/day
- ~10 minutes average per run
- ~500-1000 minutes/day
- ~15000-30000 minutes/month

**⚠️ Exceeds Free Tier**: Need paid plan or optimization

**Cost (if paid)**:

- $0.008 per minute for Linux runners
- 15000 min × $0.008 = $120/month
- 30000 min × $0.008 = $240/month

**Optimization needed**: See `ci_optimization.md`

### MCP Servers (Self-hosted)

**Agent Service**:

- Fly.io app
- Instance: shared-cpu-1x
- Cost: ~$5/month

**LlamaIndex MCP**:

- Fly.io app
- Instance: shared-cpu-1x
- Cost: ~$5/month

**Total MCP**: ~$10/month

### Domain & DNS

**Domain**: hotrodan.com  
**Registrar**: <TBD>  
**Cost**: ~$12/year

**DNS**: Cloudflare (Free) or registrar included

### Third-Party Services

**Shopify**:

- Plan: Basic ($39/month) or higher
- App fees: None (embedded app)

**OpenAI** (for agents):

- GPT-4 API usage
- Estimated: $50-200/month (varies by usage)

**Google Analytics**:

- Free (GA4)

**Chatwoot** (self-hosted):

- Hosting cost included in Fly.io estimate above

## Total Monthly Cost Estimate

| Service        | Low     | High     | Average     |
| -------------- | ------- | -------- | ----------- |
| Fly.io (apps)  | $20     | $40      | $30         |
| Supabase       | $0      | $25      | $12         |
| GitHub Actions | $0      | $240     | $120        |
| MCP Services   | $10     | $10      | $10         |
| OpenAI API     | $50     | $200     | $125        |
| Domain/DNS     | $1      | $2       | $1.50       |
| **Total**      | **$81** | **$517** | **$298.50** |

**Note**: Excludes Shopify store costs (business expense, not infra)

## Cost Optimization Strategies

### Immediate (Free)

1. **Optimize CI usage**:
   - Implement concurrency limits
   - Cache dependencies
   - Skip unnecessary jobs
   - Target: Reduce 50% (save $60-120/month)

2. **Right-size instances**:
   - Monitor actual resource usage
   - Scale down if over-provisioned
   - Target: Reduce 20% (save $5-10/month)

3. **Optimize database queries**:
   - Add indexes for slow queries
   - Reduce connection pool if over-allocated
   - Target: Stay on free tier longer

### Short Term (<1 month)

4. **Self-host GitHub Actions runners**:
   - Use Fly.io instance as runner
   - Cost: $10/month vs $120/month
   - Savings: $110/month

5. **Implement aggressive caching**:
   - Cache API responses
   - Reduce Shopify API calls
   - Reduce OpenAI API calls
   - Target: 30% reduction ($15-60/month)

### Long Term (>1 month)

6. **Reserved capacity** (if available):
   - Commit to 1-year Fly.io plan (discount)
   - Commit to annual Supabase (2 months free)

7. **Optimize OpenAI usage**:
   - Use cheaper models where possible (GPT-3.5 vs GPT-4)
   - Implement prompt caching
   - Reduce token usage
   - Target: 50% reduction ($25-100/month)

## Cost Monitoring

### Weekly Review

```bash
# GitHub Actions usage
gh api /repos/Jgorzitza/HotDash/actions/billing/usage

# Fly.io usage (via dashboard)
fly dashboard -a hotdash-app

# Supabase usage (via dashboard)
# Database size, bandwidth, storage
```

### Monthly Report

**Template** (`reports/costs/YYYY-MM.md`):

```markdown
# Infrastructure Costs - YYYY-MM

**Period**: YYYY-MM-01 to YYYY-MM-30  
**Total**: $XXX.XX

## Breakdown

- Fly.io: $XX.XX
- Supabase: $XX.XX
- GitHub Actions: $XX.XX
- MCP Services: $XX.XX
- OpenAI API: $XX.XX
- Other: $XX.XX

## Trends

- vs Last Month: +/-X%
- vs Budget: Within / Over

## Optimization Actions

- [ ] <action>
```

### Budget Alerts

**Set alerts**:

- GitHub Actions >1500 min/month
- Fly.io >$50/month
- OpenAI >$200/month

**Action if exceeded**:

1. Investigate spike
2. Optimize immediately
3. Document cause
4. Adjust budget or limits

## Cost Attribution

### By Feature

| Feature          | Primary Costs                       |
| ---------------- | ----------------------------------- |
| Dashboard tiles  | Shopify API calls, OpenAI (minimal) |
| Approvals system | OpenAI API (moderate)               |
| Customer support | OpenAI API (high), Chatwoot hosting |
| Analytics        | GA MCP (free), database queries     |
| Nightly jobs     | Database operations, OpenAI         |

### By Agent

| Agent        | Primary Costs                              |
| ------------ | ------------------------------------------ |
| AI-Customer  | OpenAI API (high - reply drafting)         |
| AI-Knowledge | OpenAI API (moderate - content generation) |
| Analytics    | Database queries, GA API                   |
| Product      | OpenAI API (low - ideation)                |

## Related Documentation

- Monitoring: `docs/runbooks/monitoring_setup.md`
- CI Optimization: `docs/runbooks/ci_optimization.md`
- SLA Definitions: `docs/runbooks/sla_definitions.md`
