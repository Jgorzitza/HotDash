# Growth Engine Integration Tests

This directory contains comprehensive integration tests for the Growth Engine system, covering the complete end-to-end workflow from telemetry data collection to action execution and audit trails.

## Test Overview

### QA-001: Growth Engine End-to-End Integration Testing

**Objective**: Test complete Growth Engine flow: telemetry → action queue → approval → execution → audit

**Acceptance Criteria**:
1. ✅ Test telemetry pipeline data flow from GSC/GA4 to action queue
2. ✅ Verify action queue ranking algorithm works correctly
3. ✅ Test approval drawer UI with real approval data
4. ✅ Test HITL approval workflow end-to-end
5. ✅ Verify action execution and audit trail
6. ✅ Test error handling and rollback scenarios
7. ✅ Document all test results and any issues found

## Test Structure

```
tests/integration/growth-engine/
├── end-to-end.spec.ts           # Main end-to-end integration tests
├── telemetry-pipeline.spec.ts   # Telemetry data flow tests
├── approval-workflow.spec.ts    # HITL approval workflow tests
├── test-config.ts               # Test configuration and utilities
├── README.md                    # This documentation
└── artifacts/                   # Test evidence and reports
```

## Test Suites

### 1. End-to-End Integration Tests (`end-to-end.spec.ts`)

**Purpose**: Test the complete Growth Engine workflow from start to finish.

**Test Categories**:
- **Telemetry Pipeline Data Flow**: GSC/GA4 data collection and processing
- **Action Queue Ranking Algorithm**: Scoring and ranking of actions
- **Approval Drawer UI**: Display and interaction with approval data
- **HITL Approval Workflow**: Human-in-the-loop approval process
- **Action Execution**: Execution of approved actions
- **Audit Trail**: Tracking and logging of all activities
- **Error Handling**: Failure scenarios and recovery
- **Performance Testing**: Load and concurrency testing

### 2. Telemetry Pipeline Tests (`telemetry-pipeline.spec.ts`)

**Purpose**: Test data collection and processing from external sources.

**Test Categories**:
- **GSC Data Collection**: Search Console API integration
- **GA4 Data Collection**: Google Analytics 4 API integration
- **Action Queue Creation**: Converting telemetry data to actionable items
- **Data Pipeline Integration**: End-to-end data processing

### 3. Approval Workflow Tests (`approval-workflow.spec.ts`)

**Purpose**: Test the human approval process and state management.

**Test Categories**:
- **Approval Creation**: Draft creation and submission
- **Human Review Process**: Review interface and decision making
- **Approval Execution**: Action execution after approval
- **State Management**: Approval state transitions
- **Performance and Concurrency**: Load testing

## Test Configuration

### Environment Variables

```bash
# Required for database tests
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for GA4 tests
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json

# Optional test configuration
TEST_SHOP_DOMAIN=test-shop.myshopify.com
TEST_OPERATOR_EMAIL=test-operator@example.com
```

### Test Data

The tests use mock data defined in `test-config.ts`:
- **GSC Data**: Search queries, clicks, impressions, CTR, position
- **GA4 Data**: Events, custom dimensions, revenue metrics
- **Action Queue**: Actions with scores, confidence, ease, risk tiers
- **Approval Data**: Complete approval objects with evidence and rollback plans

## Running Tests

### Run All Integration Tests

```bash
# Run all Growth Engine integration tests
npm run test:integration:growth-engine

# Or run the test runner script directly
npx tsx scripts/test-growth-engine-integration.ts
```

### Run Specific Test Suites

```bash
# Run end-to-end tests only
npx vitest run tests/integration/growth-engine/end-to-end.spec.ts

# Run telemetry pipeline tests only
npx vitest run tests/integration/growth-engine/telemetry-pipeline.spec.ts

# Run approval workflow tests only
npx vitest run tests/integration/growth-engine/approval-workflow.spec.ts
```

### Run Tests with Coverage

```bash
# Run with coverage report
npx vitest run tests/integration/growth-engine/ --coverage
```

## Test Evidence

### MCP Evidence JSONL

All tests log MCP tool usage to evidence files:

```json
{
  "tool": "shopify-dev|context7|chrome-devtools",
  "doc_ref": "https://shopify.dev/docs/...",
  "request_id": "req_123456",
  "timestamp": "2025-10-23T14:30:00Z",
  "purpose": "Verify Polaris component usage"
}
```

### Heartbeat Logging

Long-running tests (>2 hours) log heartbeat data:

```json
{
  "timestamp": "2025-10-23T14:00:00Z",
  "task": "QA-001",
  "status": "doing",
  "progress": "40%",
  "file": "tests/integration/growth-engine/end-to-end.spec.ts"
}
```

## Test Results

### Success Criteria

- ✅ All test suites pass
- ✅ Performance thresholds met
- ✅ No critical errors or failures
- ✅ Complete audit trail generated
- ✅ MCP evidence logged
- ✅ Test documentation updated

### Performance Thresholds

- **Execution Time**: < 5 seconds per test
- **Memory Usage**: < 100MB per test
- **Concurrent Executions**: < 10 simultaneous
- **Total Test Duration**: < 30 minutes

### Test Reports

Test results are logged to the database via `logDecision()` and saved to:

```
artifacts/qa-helper/2025-10-23/
├── mcp/
│   ├── end-to-end.jsonl
│   ├── telemetry-pipeline.jsonl
│   └── approval-workflow.jsonl
├── heartbeat.ndjson
└── test-results.json
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure test schema exists

2. **GA4 API Errors**
   - Verify service account credentials
   - Check API quotas and limits
   - Ensure property ID is correct

3. **Test Timeouts**
   - Increase timeout values in test config
   - Check for blocking operations
   - Verify test data setup

4. **Memory Issues**
   - Monitor memory usage during tests
   - Clean up test data after each test
   - Use smaller test datasets if needed

### Debug Mode

Run tests in debug mode for detailed logging:

```bash
DEBUG=true npx vitest run tests/integration/growth-engine/
```

## Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `*.spec.ts`
3. Use test configuration from `test-config.ts`
4. Log MCP evidence for tool usage
5. Update documentation

### Test Standards

- Use descriptive test names
- Include setup and teardown
- Mock external dependencies
- Log evidence for audit trail
- Follow performance thresholds

## Related Documentation

- [Growth Engine Architecture](../docs/growth-engine-architecture.md)
- [Approval Workflow Specification](../docs/specs/approvals_drawer_spec.md)
- [MCP Tools Documentation](../mcp/README.md)
- [Test Configuration Reference](./test-config.ts)
