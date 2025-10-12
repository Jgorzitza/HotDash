---
epoch: 2025.10.E1
doc: docs/data/model_performance_monitoring.md
owner: data
last_reviewed: 2025-10-11
---

# Model Performance Monitoring

## Overview
Monitor ML model performance in production with drift detection, accuracy tracking, and degradation alerts.

## Monitoring Dimensions

### 1. Prediction Accuracy
- MAE, RMSE, MAPE for regression
- Precision, recall, F1 for classification
- Confusion matrix tracking

### 2. Data Drift
- Input feature distribution changes
- Concept drift detection
- Covariate shift monitoring

### 3. Model Latency
- Prediction latency percentiles
- Throughput (predictions/second)
- Resource utilization

### 4. Business Impact
- Revenue impact from predictions
- Cost savings from automation
- Customer satisfaction correlation

## Schema
```sql
CREATE TABLE ml_model_predictions (
  prediction_id BIGSERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES ml_forecast_models(model_id),
  entity_id TEXT,
  features JSONB,
  prediction NUMERIC,
  prediction_proba NUMERIC, -- For classification
  actual NUMERIC, -- Filled after observation
  prediction_error NUMERIC,
  latency_ms INTEGER,
  predicted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ml_model_metrics (
  metric_id BIGSERIAL PRIMARY KEY,
  model_id INTEGER,
  metric_date DATE,
  metric_name TEXT, -- 'mae', 'rmse', 'accuracy'
  metric_value NUMERIC,
  threshold_breached BOOLEAN,
  PRIMARY KEY (model_id, metric_date, metric_name)
);

CREATE TABLE ml_drift_alerts (
  alert_id BIGSERIAL PRIMARY KEY,
  model_id INTEGER,
  drift_type TEXT, -- 'data_drift', 'concept_drift', 'prediction_drift'
  severity TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Monitoring Queries
```sql
-- Daily model accuracy
CREATE OR REPLACE VIEW v_model_accuracy_daily AS
SELECT 
  model_id,
  DATE(predicted_at) as date,
  COUNT(*) as predictions,
  AVG(ABS(prediction_error)) as mae,
  SQRT(AVG(prediction_error ^ 2)) as rmse,
  100 * AVG(ABS(prediction_error / NULLIF(actual, 0))) as mape
FROM ml_model_predictions
WHERE actual IS NOT NULL
GROUP BY model_id, DATE(predicted_at);
```

**Status:** Model monitoring framework designed with drift detection

