# Growth Engine Infrastructure Setup

This document outlines the implementation of the Growth Engine infrastructure for phases 9-12, providing the foundation for agent orchestration, action queue management, and specialist agent coordination.

## Overview

The Growth Engine infrastructure enables a single operator to 10× sales through intelligent agent orchestration. It provides:

- **Agent Orchestration**: Customer-Front, CEO-Front, and Specialist agents with strict handoff patterns
- **Action Queue**: Unified interface for all specialist agent proposals with ranking and approval
- **Security Model**: PII Broker, ABAC policies, and audit logging
- **Telemetry Pipeline**: GSC and GA4 data integration for opportunity identification
- **Specialist Agents**: Analytics, Inventory, Content/SEO/Perf, and Risk agents

## Architecture Components

### 1. Action Queue System

**Location**: `app/lib/growth-engine/action-queue.ts`

**Purpose**: Standardized contract for all specialist agents to emit actions

**Key Features**:
- Ranking algorithm: Expected Revenue × Confidence × Ease
- Freshness and risk tier tie-breakers
- Evidence tracking with MCP request IDs
- Rollback plan requirements

**Database**: `action_queue` table with RLS policies

### 2. Agent Orchestration

**Location**: `app/lib/growth-engine/agent-orchestration.ts`

**Purpose**: Handoff pattern implementation and security model

**Key Features**:
- Strict handoff validation between agents
- PII Broker for redaction and audit
- ABAC policy engine for access control
- Agent configuration factory

**Database**: `agent_handoffs` and `pii_audit_log` tables

### 3. Telemetry Pipeline

**Location**: `app/lib/growth-engine/telemetry-pipeline.ts`

**Purpose**: Data flow from GSC and GA4 to Action Queue

**Key Features**:
- GSC Bulk Export integration
- GA4 Data API integration
- Analytics transform for opportunity identification
- Action Queue emission

**Database**: `telemetry_data` table

### 4. Specialist Agents

**Location**: `app/lib/growth-engine/specialist-agents.ts`

**Purpose**: Background agents that populate the Action Queue

**Agents**:
- **Analytics**: Traffic and conversion analysis
- **Inventory**: Stock monitoring and reorder proposals
- **Content/SEO/Perf**: Content and performance optimization
- **Risk**: Fraud detection and compliance monitoring

**Database**: `specialist_agent_runs` table

## Database Schema

### Core Tables

1. **action_queue**: Stores all agent proposals with ranking and approval status
2. **agent_handoffs**: Logs all agent handoff interactions
3. **pii_audit_log**: Tracks PII redaction and audit trail
4. **telemetry_data**: Stores GSC, GA4, and other telemetry data
5. **specialist_agent_runs**: Tracks specialist agent execution
6. **mcp_evidence**: Logs all MCP tool usage for compliance

### Key Functions

- `get_top_actions(limit)`: Returns top-ranked actions by score
- `get_agent_performance(start_date, end_date)`: Agent performance metrics
- `update_updated_at_column()`: Automatic timestamp updates

## API Endpoints

### Action Queue API

**Base**: `/api/growth-engine/action-queue`

**Endpoints**:
- `GET /`: List actions with filtering (status, agent, limit)
- `POST /`: Approve, reject, or execute actions

**Parameters**:
- `limit`: Number of actions to return (default: 10)
- `status`: Filter by status (pending, approved, rejected, executed)
- `agent`: Filter by agent name

### Specialist Agents API

**Base**: `/api/growth-engine/specialist-agents`

**Endpoints**:
- `GET /`: List agent runs with filtering
- `POST /`: Run specific agent or all agents

**Actions**:
- `run`: Run specific agent
- `run_all`: Run all specialist agents

## Frontend Components

### ActionQueueTile

**Location**: `app/components/growth-engine/ActionQueueTile.tsx`

**Features**:
- Displays top-ranked actions
- Approve/reject functionality
- Real-time updates
- Score and confidence display

### SpecialistAgentsTile

**Location**: `app/components/growth-engine/SpecialistAgentsTile.tsx`

**Features**:
- Agent run status display
- Manual agent execution
- Performance metrics
- Error handling

## Security Model

### PII Broker

**Purpose**: Redact PII from public replies and create operator-only PII cards

**Features**:
- Email, phone, and address redaction
- Audit trail logging
- ABAC policy enforcement
- Token management for Customer Accounts MCP

### ABAC Policies

**Purpose**: Attribute-Based Access Control for agent permissions

**Rules**:
- Customer-Front: Storefront MCP only
- Accounts Sub-Agent: Customer Accounts MCP only
- CEO-Front: Read-only Storefront MCP + Action Queue
- Dev MCP: Development/staging only

## Implementation Status

### ✅ Completed

1. **Action Queue Infrastructure**
   - Ranking algorithm implementation
   - Evidence tracking system
   - Database schema and RLS policies
   - API endpoints for CRUD operations

2. **Agent Orchestration**
   - Handoff pattern validation
   - PII Broker implementation
   - ABAC policy engine
   - Agent configuration factory

3. **Telemetry Pipeline**
   - GSC and GA4 integration structure
   - Analytics transform logic
   - Action Queue emission system

4. **Specialist Agents**
   - All four specialist agents implemented
   - Orchestrator for running agents
   - Database tracking for runs

5. **Database Schema**
   - All required tables created
   - RLS policies implemented
   - Helper functions and triggers

6. **API Endpoints**
   - Action Queue CRUD operations
   - Specialist agent execution
   - Error handling and validation

7. **Frontend Components**
   - Action Queue tile with approval workflow
   - Specialist agents tile with run management
   - Real-time updates and error handling

### 🔄 Next Steps

1. **Integration Testing**
   - Test agent handoff patterns
   - Validate PII redaction
   - Verify ABAC policy enforcement

2. **MCP Integration**
   - Connect to actual MCP servers
   - Implement evidence logging
   - Test telemetry pipeline

3. **UI Integration**
   - Add tiles to main dashboard
   - Implement approval workflow
   - Add real-time notifications

4. **Monitoring**
   - Set up agent performance metrics
   - Implement alerting for failures
   - Add audit trail visualization

## Usage Examples

### Running Specialist Agents

```typescript
// Run specific agent
const response = await fetch('/api/growth-engine/specialist-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'run',
    agent: 'analytics',
    runType: 'manual'
  })
});

// Run all agents
const response = await fetch('/api/growth-engine/specialist-agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'run_all'
  })
});
```

### Managing Action Queue

```typescript
// Get pending actions
const actions = await fetch('/api/growth-engine/action-queue?status=pending&limit=10');

// Approve action
const response = await fetch('/api/growth-engine/action-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'approve',
    actionId: 'action-uuid',
    operatorId: 'current-user'
  })
});
```

## Monitoring and Maintenance

### Key Metrics

- **Action Queue**: Pending count, approval rate, execution success
- **Agent Performance**: Run frequency, success rate, actions emitted
- **Security**: PII redaction accuracy, ABAC policy compliance
- **Telemetry**: Data freshness, pipeline health

### Maintenance Tasks

1. **Daily**: Monitor agent runs and action queue
2. **Weekly**: Review agent performance metrics
3. **Monthly**: Audit PII handling and security policies
4. **Quarterly**: Review and update opportunity rules

## Troubleshooting

### Common Issues

1. **Agent Runs Failing**
   - Check database connectivity
   - Verify MCP server availability
   - Review error messages in specialist_agent_runs

2. **Action Queue Not Updating**
   - Check agent run status
   - Verify database permissions
   - Review API endpoint logs

3. **PII Redaction Issues**
   - Check PII Broker configuration
   - Verify redaction rules
   - Review audit logs

### Debug Commands

```sql
-- Check agent run status
SELECT * FROM specialist_agent_runs ORDER BY start_time DESC LIMIT 10;

-- Check action queue status
SELECT * FROM action_queue WHERE status = 'pending' ORDER BY score DESC;

-- Check PII audit logs
SELECT * FROM pii_audit_log ORDER BY created_at DESC LIMIT 10;
```

## Conclusion

The Growth Engine infrastructure provides a robust foundation for agent orchestration and action management. With proper implementation and monitoring, it enables operators to scale operations through intelligent automation while maintaining security and audit compliance.

The system is designed to be extensible, allowing for additional specialist agents and action types as business needs evolve. Regular monitoring and maintenance ensure optimal performance and security.
