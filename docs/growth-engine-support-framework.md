# Growth Engine Support Framework

## Overview

The Growth Engine Support Framework provides comprehensive support infrastructure for Growth Engine phases 9-12, ensuring compliance with MCP Evidence tracking, Heartbeat monitoring, and Dev MCP Ban enforcement.

## Components

### 1. MCP Evidence System

**Purpose**: Track MCP tool usage for all code changes to ensure proper documentation and compliance.

**Location**: `app/services/mcp-evidence.server.ts`

**Features**:
- JSONL file management for MCP tool usage evidence
- Validation of evidence entry format
- PR template generation
- Compliance checking

**Usage**:
```typescript
import { mcpEvidenceService } from '~/services/mcp-evidence.server';

// Initialize evidence file
await mcpEvidenceService.initializeEvidenceFile('support', '2025-10-22', 'shopify-dev');

// Log MCP usage
await mcpEvidenceService.appendEvidence('support', '2025-10-22', 'shopify-dev', {
  tool: 'shopify-dev',
  doc_ref: 'https://shopify.dev/docs/api/admin-rest',
  request_id: 'req_123',
  timestamp: '2025-10-22T14:30:00Z',
  purpose: 'Verify ProductVariant fields for inventory query'
});
```

### 2. Heartbeat System

**Purpose**: Monitor agent activity for tasks >2 hours to prevent idle agents and ensure continuous progress.

**Location**: `app/services/heartbeat.server.ts`

**Features**:
- NDJSON file management for heartbeat entries
- Stale heartbeat detection (>15 minutes)
- Automatic heartbeat monitoring
- PR template generation

**Usage**:
```typescript
import { heartbeatService } from '~/services/heartbeat.server';

// Initialize heartbeat file
await heartbeatService.initializeHeartbeatFile('support', '2025-10-22');

// Start monitoring
const interval = await heartbeatService.startHeartbeatMonitoring(
  'support', 
  '2025-10-22', 
  'SUPPORT-014', 
  15 // 15 minutes
);

// Update heartbeat
await heartbeatService.appendHeartbeat('support', '2025-10-22', {
  timestamp: '2025-10-22T14:00:00Z',
  task: 'SUPPORT-014',
  status: 'doing',
  progress: '40%',
  file: 'app/services/growth-engine-support.server.ts'
});
```

### 3. Dev MCP Ban System

**Purpose**: Enforce production safety by preventing Dev MCP imports in runtime bundles.

**Location**: `app/services/dev-mcp-ban.server.ts`

**Features**:
- Production code scanning for Dev MCP imports
- Violation detection and reporting
- CI check script generation
- Pre-commit hook creation

**Usage**:
```typescript
import { devMCPBanService } from '~/services/dev-mcp-ban.server';

// Validate production safety
const validation = await devMCPBanService.validateProductionSafety();
if (!validation.valid) {
  console.error('Dev MCP violations found:', validation.violations);
}

// Generate PR template section
const prSection = await devMCPBanService.generatePRTemplateSection();
```

### 4. Main Framework Service

**Purpose**: Coordinate all Growth Engine Support components in a unified interface.

**Location**: `app/services/growth-engine-support.server.ts`

**Features**:
- Unified configuration management
- Coordinated initialization
- PR template generation
- Compliance reporting

**Usage**:
```typescript
import { createGrowthEngineSupport } from '~/services/growth-engine-support.server';

// Initialize framework
const framework = createGrowthEngineSupport({
  agent: 'support',
  date: '2025-10-22',
  task: 'SUPPORT-014',
  estimatedHours: 3
});

await framework.initialize();

// Log MCP usage
await framework.logMCPUsage(
  'shopify-dev',
  'https://shopify.dev/docs/api/admin-rest',
  'req_123',
  'Verify ProductVariant fields'
);

// Update heartbeat
await framework.updateHeartbeat('doing', '40%', 'app/services/growth-engine-support.server.ts');

// Generate PR template
const prTemplate = await framework.generatePRTemplate();
```

## CI Guards

### 1. Guard MCP (`guard-mcp.yml`)

**Purpose**: Validate MCP Evidence in PRs to ensure proper documentation.

**Checks**:
- PR body contains "## MCP Evidence" section
- Evidence files exist and are valid JSONL
- No missing evidence files

**Failure Conditions**:
- Missing MCP Evidence section in PR body
- Missing or invalid evidence files
- Invalid JSONL format

### 2. Idle Guard (`idle-guard.yml`)

**Purpose**: Validate Heartbeat in PRs to ensure agents are actively working.

**Checks**:
- PR body contains "## Heartbeat" section
- Heartbeat files exist and are valid NDJSON
- No stale heartbeats (>15 minutes old)

**Failure Conditions**:
- Missing Heartbeat section in PR body
- Missing or invalid heartbeat files
- Stale heartbeat entries

### 3. Dev MCP Ban (`dev-mcp-ban.yml`)

**Purpose**: Enforce production safety by preventing Dev MCP imports.

**Checks**:
- No Dev MCP imports in `app/` directory
- PR body contains "## Dev MCP Check" section
- Verification statement present

**Failure Conditions**:
- Dev MCP imports found in production code
- Missing Dev MCP Check section in PR body
- No verification statement

## File Structure

```
artifacts/
├── <agent>/
│   └── <YYYY-MM-DD>/
│       ├── mcp/
│       │   ├── <topic>.jsonl
│       │   └── <tool>.jsonl
│       └── heartbeat.ndjson

app/services/
├── mcp-evidence.server.ts
├── heartbeat.server.ts
├── dev-mcp-ban.server.ts
└── growth-engine-support.server.ts

.github/
├── workflows/
│   ├── guard-mcp.yml
│   ├── idle-guard.yml
│   └── dev-mcp-ban.yml
└── pull_request_template.md
```

## Evidence File Formats

### MCP Evidence JSONL
```json
{"tool":"shopify-dev","doc_ref":"https://shopify.dev/docs/api/admin-rest","request_id":"req_123","timestamp":"2025-10-22T14:30:00Z","purpose":"Verify ProductVariant fields for inventory query"}
{"tool":"context7","doc_ref":"https://context7.io/docs","request_id":"req_124","timestamp":"2025-10-22T14:35:00Z","purpose":"Get library documentation for React components"}
```

### Heartbeat NDJSON
```json
{"timestamp":"2025-10-22T14:00:00Z","task":"SUPPORT-014","status":"doing","progress":"40%","file":"app/services/growth-engine-support.server.ts"}
{"timestamp":"2025-10-22T14:15:00Z","task":"SUPPORT-014","status":"doing","progress":"65%","file":"app/services/mcp-evidence.server.ts"}
{"timestamp":"2025-10-22T14:30:00Z","task":"SUPPORT-014","status":"done","progress":"100%","file":"tests passing"}
```

## PR Template Requirements

Every PR must include these sections:

### MCP Evidence
```markdown
## MCP Evidence (required for code changes)
- artifacts/<agent>/<date>/mcp/<topic>.jsonl
- artifacts/<agent>/<date>/mcp/<tool>.jsonl
OR
- No MCP usage - non-code change
```

### Heartbeat
```markdown
## Heartbeat (if task >2 hours)
- [ ] Heartbeat files present: artifacts/<agent>/<date>/heartbeat.ndjson
- [ ] OR task completed in single session (<2 hours, no heartbeat required)
```

### Dev MCP Check
```markdown
## Dev MCP Check (CRITICAL - Production Safety)
- [ ] No Dev MCP imports in runtime bundles (prod code only)
- [ ] Verified: No `mcp.*dev` or `dev.*mcp` imports in app/ (searched with grep)
```

## Compliance Rules

### MCP Evidence Rules
- **Required for**: All code changes
- **Format**: JSONL files in `artifacts/<agent>/<date>/mcp/`
- **Validation**: Valid JSON, required fields present
- **Failure**: Merge blocked if missing or invalid

### Heartbeat Rules
- **Required for**: Tasks >2 hours
- **Format**: NDJSON files in `artifacts/<agent>/<date>/`
- **Validation**: Not stale (>15 minutes old)
- **Failure**: Merge blocked if stale

### Dev MCP Ban Rules
- **Required for**: All production code
- **Format**: No Dev MCP imports in `app/` directory
- **Validation**: Grep check for banned patterns
- **Failure**: Build fails if violations found

## Best Practices

### MCP Evidence
1. Log every MCP tool call with proper context
2. Use descriptive purpose statements
3. Include relevant documentation URLs
4. Generate unique request IDs

### Heartbeat
1. Update heartbeat every 15 minutes during active work
2. Include progress indicators and current file
3. Use consistent status values
4. Stop monitoring when task completes

### Dev MCP Ban
1. Never import Dev MCP in `app/` directory
2. Use Dev MCP only in `scripts/`, `tests/`, `.cursor/`, `docs/`
3. Verify PR body includes Dev MCP Check section
4. Run local checks before pushing

## Troubleshooting

### Common Issues

#### MCP Evidence Missing
- **Problem**: PR fails guard-mcp check
- **Solution**: Add MCP Evidence section to PR body with file paths

#### Heartbeat Stale
- **Problem**: PR fails idle-guard check
- **Solution**: Update heartbeat file or complete task in single session

#### Dev MCP Violations
- **Problem**: Build fails due to Dev MCP imports
- **Solution**: Remove Dev MCP imports from `app/` directory

### Debug Commands

```bash
# Check MCP evidence files
ls -la artifacts/*/2025-10-22/mcp/

# Check heartbeat files
ls -la artifacts/*/2025-10-22/heartbeat.ndjson

# Check for Dev MCP imports
grep -r "mcp.*dev\|dev.*mcp" app/ --include="*.ts" --include="*.tsx" -i

# Validate JSONL format
cat artifacts/*/2025-10-22/mcp/*.jsonl | jq .

# Validate NDJSON format
cat artifacts/*/2025-10-22/heartbeat.ndjson | jq .
```

## Integration Examples

### React Component with MCP Evidence
```typescript
import { createGrowthEngineSupport } from '~/services/growth-engine-support.server';

export async function ProductComponent() {
  const framework = createGrowthEngineSupport({
    agent: 'support',
    date: '2025-10-22',
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

### API Route with Heartbeat
```typescript
import { heartbeatService } from '~/services/heartbeat.server';

export async function action() {
  // Update heartbeat
  await heartbeatService.appendHeartbeat('support', '2025-10-22', {
    timestamp: new Date().toISOString(),
    task: 'SUPPORT-014',
    status: 'doing',
    progress: 'API processing'
  });

  // Process request
  const result = await processRequest();

  // Update heartbeat
  await heartbeatService.appendHeartbeat('support', '2025-10-22', {
    timestamp: new Date().toISOString(),
    task: 'SUPPORT-014',
    status: 'done',
    progress: '100%'
  });

  return result;
}
```

## Monitoring and Metrics

### Key Metrics
- **MCP Evidence Coverage**: % of code changes with evidence
- **Heartbeat Freshness**: Average time between heartbeat updates
- **Dev MCP Violations**: Number of violations caught
- **CI Check Success Rate**: % of PRs passing all checks

### Dashboards
- **Compliance Dashboard**: Real-time compliance status
- **Agent Activity Dashboard**: Heartbeat monitoring
- **Quality Dashboard**: MCP usage patterns
- **Security Dashboard**: Dev MCP violation tracking

## Future Enhancements

### Planned Features
1. **Automated Evidence Generation**: Auto-generate evidence from MCP tool calls
2. **Real-time Monitoring**: Live dashboard for agent activity
3. **Predictive Analytics**: Forecast compliance issues
4. **Integration Testing**: Automated testing of framework components

### Roadmap
- **Phase 1**: Core framework implementation ✅
- **Phase 2**: CI/CD integration ✅
- **Phase 3**: Monitoring and analytics
- **Phase 4**: Advanced automation
- **Phase 5**: Machine learning integration

---

**Last Updated**: 2025-10-22  
**Version**: 1.0.0  
**Owner**: Support Team
