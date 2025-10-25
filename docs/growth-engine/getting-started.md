# Growth Engine Getting Started

## Overview

This guide will help you get started with the Growth Engine system, covering initial setup, configuration, and basic usage patterns.

## Prerequisites

- Node.js 18+ installed
- Access to the HotDash repository
- Understanding of the Growth Engine phases (9-12)
- Basic knowledge of TypeScript and React

## Initial Setup

### 1. Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Growth Engine Configuration
GROWTH_ENGINE_ENABLED=true
GROWTH_ENGINE_PHASE=9

# Agent Configuration
AGENT_NAME=your-agent-name
AGENT_DATE=2025-10-23
AGENT_TASK=YOUR-TASK-ID

# MCP Evidence Configuration
MCP_EVIDENCE_ENABLED=true
MCP_EVIDENCE_DIRECTORY=artifacts

# Heartbeat Configuration
HEARTBEAT_ENABLED=true
HEARTBEAT_INTERVAL=15

# Dev MCP Ban Configuration
DEV_MCP_BAN_ENABLED=true
DEV_MCP_BAN_STRICT=true
```

### 2. Directory Structure Setup

Create the required directory structure:

```bash
# Create artifacts directory
mkdir -p artifacts/<agent-name>/<YYYY-MM-DD>/mcp
mkdir -p artifacts/<agent-name>/<YYYY-MM-DD>/screenshots

# Set proper permissions
chmod 755 artifacts/<agent-name>/<YYYY-MM-DD>/mcp
chmod 755 artifacts/<agent-name>/<YYYY-MM-DD>/screenshots
```

### 3. Service Initialization

Initialize the Growth Engine services:

```typescript
import { createGrowthEngineSupport } from '~/services/growth-engine-support.server';

const config = {
  agent: 'your-agent-name',
  date: '2025-10-23',
  task: 'YOUR-TASK-ID',
  estimatedHours: 3,
  capabilities: {
    mcpEvidence: true,
    heartbeat: true,
    devMCPBan: true,
    aiFeatures: true,
    inventoryOptimization: true,
    advancedAnalytics: true
  }
};

const framework = createGrowthEngineSupport(config);
await framework.initialize();
```

## Basic Usage Patterns

### 1. MCP Evidence Logging

Log MCP tool usage for compliance:

```typescript
// Log MCP usage
await framework.logMCPUsage(
  'shopify-dev',
  'https://shopify.dev/docs/api/admin-rest',
  'req_123',
  'Get product data for component'
);
```

### 2. Heartbeat Monitoring

Update heartbeat for long-running tasks:

```typescript
// Update heartbeat
await framework.updateHeartbeat('doing', '50%', 'app/components/Product.tsx');
```

### 3. Dev MCP Ban Validation

Validate production safety:

```typescript
// Validate production safety
const validation = await framework.validateProductionSafety();
if (!validation.valid) {
  console.error('Dev MCP violations found:', validation.violations);
}
```

## Phase-Specific Setup

### Phase 9: MCP Evidence System

Enable MCP evidence tracking:

```typescript
const phase9Config = {
  mcpEvidence: {
    enabled: true,
    directory: 'artifacts/<agent>/<date>/mcp',
    format: 'jsonl',
    validation: true
  }
};
```

### Phase 10: Heartbeat Monitoring

Enable heartbeat monitoring:

```typescript
const phase10Config = {
  heartbeat: {
    enabled: true,
    interval: 15, // minutes
    directory: 'artifacts/<agent>/<date>',
    format: 'ndjson',
    staleThreshold: 15
  }
};
```

### Phase 11: Dev MCP Ban

Enable Dev MCP ban enforcement:

```typescript
const phase11Config = {
  devMCPBan: {
    enabled: true,
    strict: true,
    scanDirectories: ['app/'],
    allowedDirectories: ['scripts/', 'tests/', '.cursor/', 'docs/']
  }
};
```

### Phase 12: CI Guards

Enable CI guard integration:

```typescript
const phase12Config = {
  ciGuards: {
    enabled: true,
    guardMCP: true,
    idleGuard: true,
    devMCPBan: true,
    prTemplate: true
  }
};
```

## Common Patterns

### 1. Component Integration

Integrate Growth Engine with React components:

```typescript
import { createGrowthEngineSupport } from '~/services/growth-engine-support.server';

export async function ProductComponent() {
  const framework = createGrowthEngineSupport({
    agent: 'support',
    date: '2025-10-23',
    task: 'SUPPORT-014',
    estimatedHours: 3
  });

  await framework.initialize();

  // Log MCP usage
  await framework.logMCPUsage(
    'shopify-dev',
    'https://shopify.dev/docs/api/admin-rest',
    'req_123',
    'Get product data for component'
  );

  // Update heartbeat
  await framework.updateHeartbeat('doing', '50%', 'app/components/Product.tsx');

  return <div>Product Component</div>;
}
```

### 2. API Route Integration

Integrate Growth Engine with API routes:

```typescript
import { heartbeatService } from '~/services/heartbeat.server';

export async function action() {
  // Update heartbeat
  await heartbeatService.appendHeartbeat('support', '2025-10-23', {
    timestamp: new Date().toISOString(),
    task: 'SUPPORT-014',
    status: 'doing',
    progress: 'API processing'
  });

  // Process request
  const result = await processRequest();

  // Update heartbeat
  await heartbeatService.appendHeartbeat('support', '2025-10-23', {
    timestamp: new Date().toISOString(),
    task: 'SUPPORT-014',
    status: 'done',
    progress: '100%'
  });

  return result;
}
```

### 3. Service Integration

Integrate Growth Engine with services:

```typescript
import { mcpEvidenceService } from '~/services/mcp-evidence.server';

export async function processData() {
  // Initialize evidence file
  await mcpEvidenceService.initializeEvidenceFile('support', '2025-10-23', 'data-processing');

  // Log MCP usage
  await mcpEvidenceService.appendEvidence('support', '2025-10-23', 'data-processing', {
    tool: 'context7',
    doc_ref: 'https://context7.io/docs',
    request_id: 'req_124',
    timestamp: new Date().toISOString(),
    purpose: 'Get library documentation for data processing'
  });

  // Process data
  const result = await processDataInternal();

  return result;
}
```

## Testing

### Unit Tests

Create unit tests for Growth Engine components:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createGrowthEngineSupport } from '~/services/growth-engine-support.server';

describe('Growth Engine Support', () => {
  let framework: any;

  beforeEach(async () => {
    framework = createGrowthEngineSupport({
      agent: 'test',
      date: '2025-10-23',
      task: 'TEST-001',
      estimatedHours: 1
    });
    await framework.initialize();
  });

  afterEach(async () => {
    await framework.cleanup();
  });

  it('should initialize successfully', () => {
    expect(framework).toBeDefined();
  });

  it('should log MCP usage', async () => {
    await framework.logMCPUsage(
      'shopify-dev',
      'https://shopify.dev/docs/api/admin-rest',
      'req_123',
      'Test MCP usage'
    );
    
    // Verify evidence was logged
    const evidence = await framework.getEvidence();
    expect(evidence.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Create integration tests for Growth Engine workflows:

```typescript
describe('Growth Engine Integration', () => {
  it('should complete full workflow', async () => {
    const framework = createGrowthEngineSupport({
      agent: 'test',
      date: '2025-10-23',
      task: 'TEST-001',
      estimatedHours: 1
    });

    await framework.initialize();

    // Log MCP usage
    await framework.logMCPUsage(
      'shopify-dev',
      'https://shopify.dev/docs/api/admin-rest',
      'req_123',
      'Test MCP usage'
    );

    // Update heartbeat
    await framework.updateHeartbeat('doing', '50%', 'test-file.ts');

    // Validate production safety
    const validation = await framework.validateProductionSafety();
    expect(validation.valid).toBe(true);

    // Generate PR template
    const prTemplate = await framework.generatePRTemplate();
    expect(prTemplate).toContain('MCP Evidence');
    expect(prTemplate).toContain('Heartbeat');
    expect(prTemplate).toContain('Dev MCP Check');

    await framework.cleanup();
  });
});
```

## Troubleshooting

### Common Issues

1. **Initialization Failures**
   - Check configuration parameters
   - Verify directory permissions
   - Ensure all dependencies are installed

2. **MCP Evidence Issues**
   - Verify evidence directory exists
   - Check JSONL format validity
   - Ensure proper file permissions

3. **Heartbeat Issues**
   - Verify heartbeat interval configuration
   - Check NDJSON format validity
   - Ensure proper file permissions

4. **Dev MCP Ban Issues**
   - Scan for banned imports in app/ directory
   - Verify CI configuration
   - Check workflow triggers

### Debug Commands

```bash
# Check directory structure
ls -la artifacts/<agent>/<date>/

# Validate JSONL format
cat artifacts/<agent>/<date>/mcp/*.jsonl | jq .

# Validate NDJSON format
cat artifacts/<agent>/<date>/heartbeat.ndjson | jq .

# Check for Dev MCP imports
grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i
```

## Next Steps

1. **Read Best Practices**: Review [Best Practices](./best-practices.md) for recommended approaches
2. **Configure Advanced Features**: Follow [Configuration Reference](./configuration-reference.md)
3. **Implement Phase-Specific Features**: Use phase-specific documentation
4. **Set Up Monitoring**: Configure system monitoring and alerting
5. **Test Integration**: Run comprehensive tests to verify functionality

## Support

For additional help:
- Check [Common Issues](./common-issues.md)
- Review [Troubleshooting Guide](./growth-engine-troubleshooting.md)
- Contact the Pilot team for advanced support

---

**Last Updated**: 2025-10-23  
**Next Review**: 2025-11-23  
**Owner**: Pilot Team  
**Version**: 1.0.0
