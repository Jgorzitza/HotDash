# Production Deployment Pipeline (Enhanced IPv6)

## Overview

This document describes the enhanced production deployment pipeline for HotDash with IPv6 database configuration and CI/CD automation.

## Features

### IPv6 Database Configuration
- **IPv6 Networking**: Full IPv6 support for database connections
- **Connection Optimization**: Enhanced database pool settings for production
- **High Availability**: Multi-machine deployment with auto-scaling

### CI/CD Automation
- **Automated Testing**: Comprehensive health checks and validation
- **Rollback Capability**: Automatic rollback on deployment failure
- **Notification System**: Email alerts for deployment status
- **Security**: Environment variable protection and secret management

### Production Optimizations
- **Performance**: Increased memory and CPU allocation
- **Monitoring**: Health checks and status monitoring
- **Documentation**: Comprehensive deployment metadata tracking

## Configuration Files

### fly.production.toml
```toml
app = 'hotdash-production'
primary_region = 'ord'

[env]
  HOST = '0.0.0.0'
  PORT = '3000'
  NODE_ENV = 'production'
  # IPv6 database configuration
  ECTO_IPV6 = 'true'
  ERL_AFLAGS = '-proto_dist inet6_tcp'
  # Database connection optimization
  DATABASE_POOL_SIZE = '10'
  DATABASE_TIMEOUT = '30000'

[deploy]
  release_command = "npx prisma generate"
  strategy = "rolling"

[[vm]]
  memory = '2gb'
  cpu_kind = 'shared'
  cpus = 2
```

### GitHub Actions Workflow
- **File**: `.github/workflows/deploy-production-enhanced.yml`
- **Triggers**: Manual workflow dispatch
- **Features**: IPv6 setup, health checks, rollback, notifications

## Deployment Process

### 1. Pre-deployment Validation
- **Business Hours Check**: Only allows deployments Monday-Friday 9am-5pm PT
- **Staging Health Check**: Verifies staging environment is healthy
- **CI Checks**: Ensures all required CI checks have passed

### 2. Infrastructure Setup
- **IPv6 Allocation**: Allocates public and private IPv6 addresses
- **Database Configuration**: Sets IPv6 database environment variables
- **App Creation**: Creates Fly.io app if it doesn't exist

### 3. Build Process
- **Node.js Setup**: Uses Node.js 20 with npm caching
- **Dependencies**: Installs production dependencies
- **Build**: Creates optimized production build
- **Artifacts**: Uploads build artifacts for deployment

### 4. Deployment
- **Fly.io Deploy**: Deploys using enhanced configuration
- **Health Monitoring**: Monitors deployment progress
- **Metadata Recording**: Records comprehensive deployment metadata

### 5. Health Checks
- **Endpoint Testing**: Tests health and root endpoints
- **Machine Status**: Verifies Fly.io machine status
- **IPv6 Connectivity**: Tests IPv6 connectivity if enabled

### 6. Rollback (on failure)
- **Automatic Rollback**: Rolls back to previous version on failure
- **Health Verification**: Verifies rollback success
- **Notification**: Sends rollback notification

## Environment Variables

### Required Secrets
```bash
# Set via: fly secrets set KEY=VALUE --app hotdash-production
DATABASE_URL="postgresql://..."
SHOPIFY_API_KEY="..."
SHOPIFY_API_SECRET="..."
SUPABASE_URL="..."
SUPABASE_ANON_KEY="..."
FLY_API_TOKEN="..."
NOTIFICATION_EMAIL_USERNAME="..."
NOTIFICATION_EMAIL_PASSWORD="..."
```

### IPv6 Configuration
```bash
# Automatically set by deployment pipeline
ECTO_IPV6=true
ERL_AFLAGS="-proto_dist inet6_tcp"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
```

## Manual Deployment

### Via GitHub Actions
1. Go to Actions tab in GitHub repository
2. Select "Deploy to Production (Enhanced IPv6)"
3. Click "Run workflow"
4. Fill in deployment reason
5. Choose IPv6 configuration options
6. Click "Run workflow"

### Via Fly.io CLI
```bash
# Deploy using production configuration
flyctl deploy --config fly.production.toml --app hotdash-production

# Check deployment status
flyctl status --app hotdash-production

# View logs
flyctl logs --app hotdash-production
```

## Monitoring and Maintenance

### Health Checks
- **Endpoint**: `https://hotdash-production.fly.dev/health`
- **Status**: `flyctl status --app hotdash-production`
- **Logs**: `flyctl logs --app hotdash-production`

### IPv6 Connectivity
```bash
# Check IPv6 addresses
flyctl ips list --app hotdash-production

# Test IPv6 connectivity
flyctl machines list --app hotdash-production --json | jq -r '.[] | .private_ip'
```

### Database Configuration
```bash
# Check database connection
flyctl ssh console --app hotdash-production -C "npm run verify:db"

# View environment variables
flyctl secrets list --app hotdash-production
```

## Troubleshooting

### Common Issues

#### Deployment Failures
1. Check GitHub Actions logs for specific error messages
2. Verify all required secrets are set
3. Ensure staging environment is healthy
4. Check Fly.io app status and quotas

#### IPv6 Connectivity Issues
1. Verify IPv6 addresses are allocated
2. Check IPv6 environment variables are set
3. Test database connectivity from app console
4. Review Fly.io network configuration

#### Health Check Failures
1. Check application logs for errors
2. Verify database connectivity
3. Test endpoints manually
4. Review machine resource usage

### Rollback Procedure
```bash
# Manual rollback if needed
flyctl releases --app hotdash-production
flyctl deploy --app hotdash-production --image <previous-image>

# Verify rollback
flyctl status --app hotdash-production
curl -f https://hotdash-production.fly.dev/health
```

## Security Considerations

### Environment Variables
- All sensitive data stored in Fly.io secrets
- No secrets in code or configuration files
- Regular rotation of API keys and tokens

### Network Security
- HTTPS enforced for all external connections
- IPv6 networking for internal communication
- Private network isolation where possible

### Access Control
- GitHub Actions requires manual approval
- Fly.io API tokens with limited scope
- Email notifications for all deployment events

## Performance Optimization

### Resource Allocation
- **Memory**: 2GB per machine
- **CPU**: 2 shared CPUs per machine
- **Min Machines**: 2 for high availability
- **Auto-scaling**: Enabled based on load

### Database Optimization
- **Connection Pool**: 10 connections
- **Timeout**: 30 seconds
- **IPv6**: Optimized for Fly.io networking

### Build Optimization
- **Node.js**: Version 20 with memory optimization
- **Caching**: npm cache for faster builds
- **Artifacts**: Build artifacts retained for 30 days

## Compliance and Audit

### Deployment Tracking
- All deployments logged with metadata
- Comprehensive audit trail in GitHub Actions
- Rollback events recorded and notified

### Documentation
- Deployment metadata stored as artifacts
- Configuration changes tracked in git
- Runbook updated with each deployment

### Monitoring
- Health checks every 30 seconds
- Automatic failure detection
- Email notifications for all events

## Support and Maintenance

### Regular Tasks
- Monitor deployment success rates
- Review and update secrets as needed
- Test rollback procedures quarterly
- Update documentation with changes

### Emergency Procedures
- Contact: justin@hotrodan.com
- Emergency rollback: Use manual rollback procedure
- Escalation: Check Fly.io status page for platform issues

---

**Last Updated**: 2025-10-23  
**Version**: 1.0  
**Maintained by**: DevOps Team
