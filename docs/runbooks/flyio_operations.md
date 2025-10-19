# Fly.io Operations Reference

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Common Fly.io commands and operations

## App Management

### View App Status

```bash
fly status -a hotdash-app
fly status -a hotdash-staging
```

### List All Apps

```bash
fly apps list
```

### Scale Application

```bash
# Scale to 2 instances
fly scale count 2 -a hotdash-app

# Scale instance size
fly scale vm shared-cpu-1x -a hotdash-app
```

### Restart App

```bash
fly apps restart hotdash-app
```

## Deployment

### Deploy from Local

```bash
fly deploy -a hotdash-app
```

### Deploy Specific Image

```bash
fly deploy -a hotdash-app --image registry.fly.io/hotdash:v1.0.0
```

### View Recent Releases

```bash
fly releases -a hotdash-app
```

### Rollback to Previous Release

```bash
# List releases
fly releases -a hotdash-app

# Rollback
fly releases rollback -a hotdash-app
```

## Logs & Monitoring

### View Live Logs

```bash
fly logs -a hotdash-app
```

### View Historical Logs

```bash
# Last 30 minutes
fly logs -a hotdash-app --since=30m

# Specific time range
fly logs -a hotdash-app --since=2025-10-19T08:00:00Z
```

### View Metrics

```bash
fly dashboard -a hotdash-app
```

## Secrets Management

### List Secrets

```bash
fly secrets list -a hotdash-app
```

### Set Secret

```bash
fly secrets set KEY=value -a hotdash-app

# Multiple secrets
fly secrets set KEY1=value1 KEY2=value2 -a hotdash-app

# From file
fly secrets import -a hotdash-app < secrets.txt
```

### Unset Secret

```bash
fly secrets unset KEY -a hotdash-app
```

## Database Operations

### Connect to Postgres

```bash
# Via Fly.io proxy
fly proxy 5432:5432 -a hotdash-postgres

# Then in another terminal
psql "postgresql://user:pass@localhost:5432/database"
```

### View Database Metrics

```bash
fly postgres db list -a hotdash-postgres
```

## SSH & Debugging

### SSH into Instance

```bash
fly ssh console -a hotdash-app
```

### Run Command in Instance

```bash
fly ssh console -a hotdash-app -C "ls -la"
```

### View Instance Configuration

```bash
fly config show -a hotdash-app
```

## Networking

### View IP Addresses

```bash
fly ips list -a hotdash-app
```

### Add IPv4 Address

```bash
fly ips allocate-v4 -a hotdash-app
```

### View Certificates

```bash
fly certs list -a hotdash-app
```

### Add Custom Domain

```bash
fly certs create app.hotrodan.com -a hotdash-app
```

## Monitoring & Health

### Check Health Endpoint

```bash
curl https://hotdash-app.fly.dev/health
```

### View Machines

```bash
fly machines list -a hotdash-app
```

### Stop/Start Machine

```bash
# Stop
fly machines stop <machine-id> -a hotdash-app

# Start
fly machines start <machine-id> -a hotdash-app
```

## Troubleshooting

### App Not Responding

1. **Check status**:

   ```bash
   fly status -a hotdash-app
   ```

2. **View logs**:

   ```bash
   fly logs -a hotdash-app --since=1h
   ```

3. **Check health**:

   ```bash
   curl -I https://hotdash-app.fly.dev/health
   ```

4. **Restart if needed**:
   ```bash
   fly apps restart hotdash-app
   ```

### Deployment Failing

1. **Check build logs**:

   ```bash
   fly logs -a hotdash-app | grep -i "error\|fail"
   ```

2. **Verify fly.toml**:

   ```bash
   fly config validate
   ```

3. **Check region availability**:
   ```bash
   fly platform regions
   ```

### High Memory Usage

```bash
# View current usage
fly status -a hotdash-app

# Scale up if needed
fly scale memory 512 -a hotdash-app

# Or scale instances
fly scale count 2 -a hotdash-app
```

## Related Documentation

- Production Deploy: `docs/runbooks/production_deploy.md`
- Incident Response: `docs/runbooks/incident_response.md`
- Monitoring: `docs/runbooks/monitoring_setup.md`
- Fly.io Docs: https://fly.io/docs
