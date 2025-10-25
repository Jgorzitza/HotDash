# Growth Engine Best Practices

## Overview

This document outlines best practices for implementing and using the Growth Engine system, covering all phases (9-12) and providing guidance for optimal performance and compliance.

## General Best Practices

### 1. Configuration Management

#### Environment-Specific Configuration
```typescript
// Use environment-specific configurations
const config = {
  development: {
    mcpEvidence: { enabled: true, strict: false },
    heartbeat: { enabled: true, interval: 30 },
    devMCPBan: { enabled: true, strict: false }
  },
  production: {
    mcpEvidence: { enabled: true, strict: true },
    heartbeat: { enabled: true, interval: 15 },
    devMCPBan: { enabled: true, strict: true }
  }
};
```

#### Secure Configuration Storage
```typescript
// Store sensitive configuration in environment variables
const config = {
  mcpEvidence: {
    directory: process.env.MCP_EVIDENCE_DIRECTORY || 'artifacts',
    format: process.env.MCP_EVIDENCE_FORMAT || 'jsonl'
  },
  heartbeat: {
    interval: parseInt(process.env.HEARTBEAT_INTERVAL || '15'),
    staleThreshold: parseInt(process.env.HEARTBEAT_STALE_THRESHOLD || '15')
  }
};
```

### 2. Error Handling

#### Graceful Degradation
```typescript
try {
  await framework.logMCPUsage(tool, docRef, requestId, purpose);
} catch (error) {
  console.warn('MCP Evidence logging failed:', error.message);
  // Continue execution without failing
}
```

#### Comprehensive Error Logging
```typescript
try {
  await framework.updateHeartbeat(status, progress, file);
} catch (error) {
  console.error('Heartbeat update failed:', {
    error: error.message,
    status,
    progress,
    file,
    timestamp: new Date().toISOString()
  });
  throw error; // Re-throw for critical failures
}
```

### 3. Performance Optimization

#### Efficient Evidence Logging
```typescript
// Batch evidence entries when possible
const evidenceEntries = [];
// ... collect multiple entries
await framework.logMCPUsageBatch(evidenceEntries);
```

#### Optimized Heartbeat Updates
```typescript
// Update heartbeat only when significant progress is made
if (progressChanged || statusChanged) {
  await framework.updateHeartbeat(status, progress, file);
}
```

## Phase-Specific Best Practices

### Phase 9: MCP Evidence System

#### Evidence File Management
```typescript
// Initialize evidence files early
await framework.initializeEvidenceFiles();

// Use descriptive topic names
await framework.logMCPUsage(
  'shopify-dev',
  'https://shopify.dev/docs/api/admin-rest',
  'req_123',
  'Get product data for inventory optimization'
);
```

#### Evidence Validation
```typescript
// Validate evidence before logging
const evidence = {
  tool: 'shopify-dev',
  doc_ref: 'https://shopify.dev/docs/api/admin-rest',
  request_id: 'req_123',
  timestamp: new Date().toISOString(),
  purpose: 'Get product data'
};

if (framework.validateEvidence(evidence)) {
  await framework.logMCPUsage(evidence);
} else {
  console.error('Invalid evidence format:', evidence);
}
```

### Phase 10: Heartbeat Monitoring

#### Heartbeat Timing
```typescript
// Update heartbeat at appropriate intervals
const HEARTBEAT_INTERVAL = 15 * 60 * 1000; // 15 minutes

setInterval(async () => {
  if (isTaskActive) {
    await framework.updateHeartbeat('doing', progress, currentFile);
  }
}, HEARTBEAT_INTERVAL);
```

#### Heartbeat Content
```typescript
// Include meaningful progress information
await framework.updateHeartbeat('doing', '65%', 'app/components/Product.tsx', {
  linesAdded: 45,
  testsPassing: 12,
  nextStep: 'Implement error handling'
});
```

### Phase 11: Dev MCP Ban

#### Production Safety Checks
```typescript
// Regular production safety validation
const validation = await framework.validateProductionSafety();
if (!validation.valid) {
  console.error('Production safety violations:', validation.violations);
  // Handle violations appropriately
}
```

#### Import Management
```typescript
// Use conditional imports for development tools
if (process.env.NODE_ENV === 'development') {
  const { devMCPTools } = await import('./dev-mcp-tools');
  // Use dev tools only in development
}
```

### Phase 12: CI Guards

#### PR Template Compliance
```typescript
// Generate comprehensive PR templates
const prTemplate = await framework.generatePRTemplate({
  includeMCPEvidence: true,
  includeHeartbeat: true,
  includeDevMCPCheck: true,
  includeComplianceSummary: true
});
```

#### CI Integration
```typescript
// Ensure CI checks are properly configured
const ciConfig = {
  guardMCP: { enabled: true, strict: true },
  idleGuard: { enabled: true, staleThreshold: 15 },
  devMCPBan: { enabled: true, strict: true }
};
```

## Integration Best Practices

### 1. Component Integration

#### React Component Pattern
```typescript
import { createGrowthEngineSupport } from '~/services/growth-engine-support.server';

export async function ProductComponent() {
  const framework = createGrowthEngineSupport({
    agent: 'support',
    date: '2025-10-23',
    task: 'SUPPORT-014',
    estimatedHours: 3
  });

  try {
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

    // Component logic
    return <div>Product Component</div>;
  } catch (error) {
    console.error('Component initialization failed:', error);
    throw error;
  } finally {
    await framework.cleanup();
  }
}
```

### 2. API Route Integration

#### API Route Pattern
```typescript
import { heartbeatService } from '~/services/heartbeat.server';

export async function action() {
  const taskId = 'SUPPORT-014';
  const agent = 'support';
  const date = '2025-10-23';

  try {
    // Update heartbeat
    await heartbeatService.appendHeartbeat(agent, date, {
      timestamp: new Date().toISOString(),
      task: taskId,
      status: 'doing',
      progress: 'API processing'
    });

    // Process request
    const result = await processRequest();

    // Update heartbeat
    await heartbeatService.appendHeartbeat(agent, date, {
      timestamp: new Date().toISOString(),
      task: taskId,
      status: 'done',
      progress: '100%'
    });

    return result;
  } catch (error) {
    // Update heartbeat with error status
    await heartbeatService.appendHeartbeat(agent, date, {
      timestamp: new Date().toISOString(),
      task: taskId,
      status: 'error',
      progress: 'Failed',
      error: error.message
    });

    throw error;
  }
}
```

### 3. Service Integration

#### Service Pattern
```typescript
import { mcpEvidenceService } from '~/services/mcp-evidence.server';

export class DataProcessingService {
  private agent: string;
  private date: string;
  private task: string;

  constructor(agent: string, date: string, task: string) {
    this.agent = agent;
    this.date = date;
    this.task = task;
  }

  async processData() {
    // Initialize evidence file
    await mcpEvidenceService.initializeEvidenceFile(
      this.agent, 
      this.date, 
      'data-processing'
    );

    try {
      // Log MCP usage
      await mcpEvidenceService.appendEvidence(
        this.agent, 
        this.date, 
        'data-processing', 
        {
          tool: 'context7',
          doc_ref: 'https://context7.io/docs',
          request_id: 'req_124',
          timestamp: new Date().toISOString(),
          purpose: 'Get library documentation for data processing'
        }
      );

      // Process data
      const result = await this.processDataInternal();

      return result;
    } catch (error) {
      console.error('Data processing failed:', error);
      throw error;
    }
  }

  private async processDataInternal() {
    // Implementation
  }
}
```

## Testing Best Practices

### 1. Unit Testing

#### Framework Testing
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
    
    const evidence = await framework.getEvidence();
    expect(evidence.length).toBeGreaterThan(0);
  });
});
```

### 2. Integration Testing

#### End-to-End Testing
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

    // Test MCP evidence
    await framework.logMCPUsage(
      'shopify-dev',
      'https://shopify.dev/docs/api/admin-rest',
      'req_123',
      'Test MCP usage'
    );

    // Test heartbeat
    await framework.updateHeartbeat('doing', '50%', 'test-file.ts');

    // Test production safety
    const validation = await framework.validateProductionSafety();
    expect(validation.valid).toBe(true);

    // Test PR template generation
    const prTemplate = await framework.generatePRTemplate();
    expect(prTemplate).toContain('MCP Evidence');
    expect(prTemplate).toContain('Heartbeat');
    expect(prTemplate).toContain('Dev MCP Check');

    await framework.cleanup();
  });
});
```

## Monitoring Best Practices

### 1. Health Monitoring

#### System Health Checks
```typescript
// Regular health checks
const healthCheck = async () => {
  const status = {
    mcpEvidence: await framework.checkMCPEvidenceHealth(),
    heartbeat: await framework.checkHeartbeatHealth(),
    devMCPBan: await framework.checkDevMCPBanHealth(),
    overall: 'healthy'
  };

  if (!status.mcpEvidence || !status.heartbeat || !status.devMCPBan) {
    status.overall = 'unhealthy';
  }

  return status;
};
```

### 2. Performance Monitoring

#### Metrics Collection
```typescript
// Collect performance metrics
const metrics = {
  mcpEvidenceLatency: await framework.getMCPEvidenceLatency(),
  heartbeatFrequency: await framework.getHeartbeatFrequency(),
  devMCPBanScanTime: await framework.getDevMCPBanScanTime(),
  overallPerformance: 'good'
};
```

## Security Best Practices

### 1. Access Control

#### Role-Based Access
```typescript
// Implement role-based access control
const accessControl = {
  admin: ['read', 'write', 'delete'],
  developer: ['read', 'write'],
  viewer: ['read']
};

const checkAccess = (userRole: string, action: string) => {
  return accessControl[userRole]?.includes(action) || false;
};
```

### 2. Data Protection

#### Sensitive Data Handling
```typescript
// Protect sensitive data
const sanitizeData = (data: any) => {
  const sensitiveFields = ['password', 'token', 'key', 'secret'];
  
  return Object.keys(data).reduce((acc, key) => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {});
};
```

## Troubleshooting Best Practices

### 1. Diagnostic Tools

#### System Diagnostics
```typescript
// Comprehensive system diagnostics
const runDiagnostics = async () => {
  const diagnostics = {
    directoryStructure: await framework.checkDirectoryStructure(),
    filePermissions: await framework.checkFilePermissions(),
    serviceHealth: await framework.checkServiceHealth(),
    configuration: await framework.validateConfiguration()
  };

  return diagnostics;
};
```

### 2. Recovery Procedures

#### Automated Recovery
```typescript
// Automated recovery procedures
const recoverFromFailure = async (failureType: string) => {
  switch (failureType) {
    case 'mcpEvidence':
      await framework.recoverMCPEvidence();
      break;
    case 'heartbeat':
      await framework.recoverHeartbeat();
      break;
    case 'devMCPBan':
      await framework.recoverDevMCPBan();
      break;
    default:
      console.error('Unknown failure type:', failureType);
  }
};
```

## Maintenance Best Practices

### 1. Regular Maintenance

#### Scheduled Maintenance
```typescript
// Regular maintenance tasks
const performMaintenance = async () => {
  // Clean up old evidence files
  await framework.cleanupOldEvidenceFiles();
  
  // Optimize heartbeat files
  await framework.optimizeHeartbeatFiles();
  
  // Validate system integrity
  await framework.validateSystemIntegrity();
};
```

### 2. Documentation Updates

#### Keep Documentation Current
```typescript
// Regular documentation updates
const updateDocumentation = async () => {
  // Update API documentation
  await framework.updateAPIDocumentation();
  
  // Update configuration documentation
  await framework.updateConfigurationDocumentation();
  
  // Update troubleshooting guides
  await framework.updateTroubleshootingGuides();
};
```

## Conclusion

Following these best practices will ensure optimal performance, compliance, and maintainability of the Growth Engine system. Regular review and updates of these practices will help maintain system quality over time.

---

**Last Updated**: 2025-10-23  
**Next Review**: 2025-11-23  
**Owner**: Pilot Team  
**Version**: 1.0.0
