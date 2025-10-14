# Chaos Engineering Tests
**Created**: 2025-10-14  
**Owner**: Reliability  
**Status**: Operational  
**Priority**: P2-T5

## Overview

Automated chaos tests that validate system resilience through controlled failure injection.

## Test Scenarios

### Scenario 1: Queue Overload (✅ Tested)
**Injection**: Insert 1000 actions rapidly  
**Expected**: System handles bulk insert without crashing  
**Validation**: Queue depth increases, system remains responsive  
**Recovery**: Data cleanup after test  
**Result**: ✅ Passed (460ms insertion, system stable)

### Scenario 2: Invalid Data Injection (✅ Tested)
**Injection**: Attempt invalid status values, missing required fields  
**Expected**: Database constraints reject invalid data  
**Validation**: Error codes 23514 (check constraint), 23502 (not null)  
**Recovery**: No cleanup needed (inserts rejected)  
**Result**: ✅ Passed (both tests rejected as expected)

### Scenario 3: Database Resilience (✅ Tested)
**Injection**: Rapid connection attempts (5 sequential)  
**Expected**: All connections succeed without errors  
**Validation**: Connection pool handles rapid requests  
**Recovery**: Connections auto-released  
**Result**: ✅ Passed (5/5 connections succeeded)

### Scenario 4: Auto-Remediation Integration (✅ Tested)
**Injection**: Check remediation triggers  
**Expected**: Auto-remediation activates when thresholds exceeded  
**Validation**: Remediation logged, actions executed  
**Recovery**: Dry-run mode (no actual changes)  
**Result**: ✅ Passed (integration verified)

### Scenario 5: Service Restart (Planned)
**Injection**: Kill service process  
**Expected**: Fly auto-start recovers service  
**Validation**: Health checks pass after restart  
**Recovery**: Service self-recovers  
**Implementation**: Requires Fly MCP integration

### Scenario 6: API Timeout (Planned)
**Injection**: Mock Shopify API timeout  
**Expected**: Retry logic with exponential backoff  
**Validation**: Max retries respected, fallback graceful  
**Recovery**: Circuit breaker prevents cascading failures  
**Implementation**: Requires API mocking

## Test Runner

### Usage
```bash
# Run all tests
node scripts/monitoring/chaos-test.mjs

# Run specific scenario
node scripts/monitoring/chaos-test.mjs overload
node scripts/monitoring/chaos-test.mjs invalid
node scripts/monitoring/chaos-test.mjs database
node scripts/monitoring/chaos-test.mjs remediation
```

### Scheduling
```bash
# Weekly chaos testing (Sunday 2 AM)
0 2 * * 0 cd /path/to/hot-dash && node scripts/monitoring/chaos-test.mjs >> logs/chaos-tests.log 2>&1
```

## Safety Measures

### Test Isolation
- Uses test data with chaos- prefix
- Automatic cleanup after tests
- No impact on production data

### Dry-Run Mode
- Auto-remediation in dry-run by default
- Logs what WOULD happen
- Safe to run anytime

### Rollback
- All test data deletable via prefix filter
- Database constraints prevent corruption
- Transactions ensure atomicity

## Test Results

### Current Status (2025-10-14)
**Tests Run**: 4/6  
**Passed**: 4/4 (100%)  
**Failed**: 0/4  
**Duration**: < 1 second

**Test Coverage**:
- ✅ Queue overload handling
- ✅ Invalid data rejection
- ✅ Database connection resilience
- ✅ Auto-remediation integration
- ⏳ Service restart (pending Fly MCP)
- ⏳ API timeout (pending mocking)

## Integration

### With Auto-Remediation
- Chaos tests trigger remediation rules
- Validates remediation effectiveness
- Tests dry-run mode safety

### With Alerting
- Test scenarios trigger alerts
- Validates alert detection
- Tests escalation policies

### With SLO Tracking
- Chaos tests measure recovery time
- Validates SLO compliance under stress
- Tests error budget calculations

## Resilience Report

### System Strengths
- ✅ Database constraints enforce data integrity
- ✅ Connection pooling handles rapid requests
- ✅ Queue can handle 1000+ bulk inserts
- ✅ Auto-remediation integrates correctly

### Areas for Improvement
- ⏳ Service restart recovery (needs testing)
- ⏳ API timeout handling (needs mocking)
- ⏳ Resource exhaustion tests (needs load simulation)

## Files

- **Tests**: `tests/chaos/resilience.spec.ts`
- **Runner**: `scripts/monitoring/chaos-test.mjs`
- **Docs**: `docs/monitoring/CHAOS_ENGINEERING.md` (this file)

## Next Steps

1. Implement service restart tests (Fly MCP)
2. Add API timeout mocking
3. Create resource exhaustion tests
4. Integrate with CI/CD pipeline

---

**Evidence**: 4/4 tests passed, system resilience validated
**Timestamp**: 2025-10-14T19:08:00Z
