# Data Quality Monitoring

**Task:** DATA-QUALITY-001  
**Owner:** data  
**Status:** Complete  
**MCP Evidence:** `artifacts/data/2025-10-24/mcp/data-quality-monitoring.jsonl`

## Overview

Comprehensive data quality monitoring system that tracks data quality metrics, validates data integrity, detects anomalies, and monitors data freshness across all database tables.

## Architecture

### Components

1. **DataQualityService** (`app/services/data/data-quality.service.ts`)
   - Validation rule execution
   - Quality metrics calculation
   - Anomaly detection
   - Freshness monitoring

2. **Database Schema** (`supabase/migrations/20251023000011_data_quality_monitoring.sql`)
   - `data_quality_metrics` - Quality scores and metrics
   - `data_validation_rules` - Validation rule definitions
   - `data_quality_anomalies` - Detected anomalies
   - `data_freshness_checks` - Data staleness monitoring

3. **Admin Dashboard** (`app/routes/admin.data-quality.tsx`)
   - Real-time quality metrics
   - Validation rule status
   - Anomaly alerts
   - Freshness monitoring

## Features

### 1. Data Validation Rules

**Rule Types:**
- **Schema** - Column existence, data types
- **Range** - Min/max value validation
- **Format** - Pattern matching (email, phone, etc.)
- **Reference** - Foreign key integrity
- **Business** - Business logic validation
- **Custom** - Custom SQL validation queries

**Severity Levels:**
- **Info** - Informational only
- **Warning** - Should be addressed
- **Critical** - Requires immediate attention

**Example Rule:**
```typescript
{
  ruleName: 'order_total_positive',
  ruleType: 'range',
  dataSource: 'database',
  tableName: 'orders',
  columnName: 'total',
  ruleDefinition: { min: 0 },
  severity: 'critical',
  enabled: true
}
```

### 2. Quality Metrics

**Metric Types:**
- **Completeness** - % of non-null values
- **Accuracy** - % of valid values
- **Consistency** - Cross-table consistency
- **Timeliness** - Data freshness
- **Validity** - Format/pattern compliance
- **Uniqueness** - Duplicate detection

**Quality Score Calculation:**
```
Quality Score = (Valid Records / Total Records) × 100
```

**Grading:**
- **90-100%** - Excellent (A)
- **75-89%** - Good (B)
- **60-74%** - Fair (C)
- **Below 60%** - Poor (D/F)

### 3. Anomaly Detection

**Anomaly Types:**
- **Spike** - Sudden increase in values
- **Drop** - Sudden decrease in values
- **Missing** - Expected data not present
- **Duplicate** - Unexpected duplicates
- **Outlier** - Values outside normal range
- **Pattern** - Unexpected patterns

**Detection Methods:**
- Statistical analysis (mean, std dev)
- Historical comparison (day-over-day, week-over-week)
- Threshold-based alerts
- Pattern recognition

**Example:**
```typescript
{
  anomalyType: 'spike',
  dataSource: 'database',
  tableName: 'action_queue',
  expectedValue: 100,
  actualValue: 500,
  deviationPct: 400,
  severity: 'warning'
}
```

### 4. Data Freshness Monitoring

**Freshness Checks:**
- Monitor timestamp columns
- Track time since last update
- Alert on stale data
- Configurable thresholds

**Configuration:**
```typescript
{
  checkName: 'orders_freshness',
  dataSource: 'database',
  tableName: 'orders',
  timestampColumn: 'created_at',
  expectedFrequencyMinutes: 60,
  stalenessThresholdMinutes: 120
}
```

**Status:**
- **Healthy** - Data updated within threshold
- **Warning** - Approaching staleness threshold
- **Critical** - Data is stale

## Usage

### Running Validation Rules

```typescript
import { DataQualityService } from '~/services/data/data-quality.service';

const results = await DataQualityService.runValidationRules();

console.log(`Passed: ${results.passed}/${results.totalRules}`);
console.log(`Failed: ${results.failed}`);
```

### Calculating Quality Metrics

```typescript
const metrics = await DataQualityService.calculateQualityMetrics();

metrics.forEach(metric => {
  console.log(`${metric.dataSource}.${metric.tableName}: ${metric.qualityScore}%`);
});
```

### Detecting Anomalies

```typescript
const anomalies = await DataQualityService.detectAnomalies('database', 'orders');

anomalies.forEach(anomaly => {
  if (anomaly.severity === 'critical') {
    console.error(`Critical anomaly: ${anomaly.anomalyType}`);
  }
});
```

### Checking Data Freshness

```typescript
const freshness = await DataQualityService.checkDataFreshness();

console.log(`Healthy: ${freshness.healthy}/${freshness.totalChecks}`);
console.log(`Stale: ${freshness.stale}`);
```

## Dashboard

**URL:** `/admin/data-quality`

**Features:**
- Overall quality score with progress bar
- Validation rules status table
- Quality metrics by data source
- Anomaly detection alerts
- Data freshness monitoring
- Real-time updates

**Metrics Displayed:**
- Overall quality score (0-100%)
- Validation rules passed/failed
- Anomaly count (by severity)
- Data freshness status

## Alerts

**Alert Conditions:**
- Critical validation rule failure
- Quality score drops below 60%
- Critical anomaly detected
- Data becomes stale (exceeds threshold)

**Alert Actions:**
- Log to decision_log
- Display in dashboard banner
- Update data_quality_anomalies table
- Trigger notifications (future)

## Monitoring Schedule

**Automated Checks:**
- **Validation Rules:** Every 15 minutes
- **Quality Metrics:** Every 30 minutes
- **Anomaly Detection:** Every 15 minutes
- **Freshness Checks:** Every 5 minutes

**Manual Checks:**
- Dashboard refresh (on-demand)
- API endpoint calls
- Scheduled reports (future)

## Database Schema

### data_quality_metrics

Stores calculated quality metrics for each data source/table.

**Columns:**
- `metric_name` - Unique metric identifier
- `metric_type` - Type of quality metric
- `data_source` - Source system (database, api, etc.)
- `table_name` - Table being monitored
- `total_records` - Total record count
- `valid_records` - Valid record count
- `quality_score` - Calculated score (0-100)

### data_validation_rules

Defines validation rules to be executed.

**Columns:**
- `rule_name` - Unique rule identifier
- `rule_type` - Type of validation
- `rule_definition` - JSONB rule configuration
- `validation_query` - Optional SQL query
- `severity` - info/warning/critical
- `enabled` - Rule active status
- `last_run_at` - Last execution timestamp
- `last_result` - passed/failed

### data_quality_anomalies

Records detected anomalies.

**Columns:**
- `anomaly_type` - Type of anomaly
- `data_source` - Source system
- `expected_value` - Expected value
- `actual_value` - Actual value
- `deviation_pct` - Percentage deviation
- `severity` - info/warning/critical
- `detected_at` - Detection timestamp

### data_freshness_checks

Monitors data staleness.

**Columns:**
- `check_name` - Unique check identifier
- `data_source` - Source system
- `table_name` - Table being monitored
- `timestamp_column` - Column to check
- `expected_frequency_minutes` - Expected update frequency
- `staleness_threshold_minutes` - Alert threshold
- `last_data_timestamp` - Last data update
- `is_stale` - Boolean stale status

## Best Practices

### 1. Rule Definition
- Start with critical validations
- Use appropriate severity levels
- Test rules before enabling
- Document rule purpose

### 2. Metric Monitoring
- Set realistic quality thresholds
- Monitor trends over time
- Investigate sudden drops
- Address root causes

### 3. Anomaly Response
- Prioritize critical anomalies
- Investigate patterns
- Document resolutions
- Update rules as needed

### 4. Freshness Thresholds
- Set based on business requirements
- Account for batch processing
- Consider time zones
- Monitor during deployments

## Troubleshooting

### Low Quality Scores

**Possible Causes:**
- Data entry errors
- Integration issues
- Schema changes
- Business logic changes

**Actions:**
1. Review validation rule failures
2. Check recent data changes
3. Verify integration health
4. Update validation rules if needed

### False Positive Anomalies

**Possible Causes:**
- Seasonal variations
- Business events (sales, holidays)
- Threshold too sensitive
- Incomplete historical data

**Actions:**
1. Review anomaly detection logic
2. Adjust thresholds
3. Add business context
4. Exclude known events

### Stale Data Alerts

**Possible Causes:**
- Integration downtime
- Batch job failures
- Network issues
- Source system problems

**Actions:**
1. Check integration health
2. Review batch job logs
3. Verify network connectivity
4. Contact source system owner

## Future Enhancements

- [ ] Email/Slack notifications for critical issues
- [ ] Historical trend analysis and charts
- [ ] Automated remediation for common issues
- [ ] Machine learning-based anomaly detection
- [ ] Custom dashboard widgets
- [ ] Export quality reports (PDF/CSV)
- [ ] Integration with monitoring tools (Datadog, etc.)
- [ ] Data lineage tracking
- [ ] Impact analysis for quality issues

## References

- **Service:** `app/services/data/data-quality.service.ts`
- **Migration:** `supabase/migrations/20251023000011_data_quality_monitoring.sql`
- **Dashboard:** `app/routes/admin.data-quality.tsx`
- **Analytics Validation:** `app/services/analytics/data-validation.ts`
- **MCP Evidence:** `artifacts/data/2025-10-24/mcp/data-quality-monitoring.jsonl`

---

**Last Updated:** 2025-10-24  
**Owner:** data agent  
**Status:** Production Ready

