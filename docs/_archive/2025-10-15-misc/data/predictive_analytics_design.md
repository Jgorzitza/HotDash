---
epoch: 2025.10.E1
doc: docs/data/predictive_analytics_design.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Predictive Analytics for Agent Performance Forecasting

## Overview

Time-series forecasting system for agent performance metrics using historical data to predict future performance, capacity needs, and potential degradation.

## Forecasting Targets

### 1. Agent Query Volume Prediction
**Model:** ARIMA or Prophet (seasonal)
**Input Features:**
- Historical query counts (hourly/daily)
- Day of week, time of day
- Recent trends (7-day, 30-day moving averages)

**Predictions:**
- Next hour query volume (±10% confidence interval)
- Next 24 hours total queries
- Weekly capacity forecast

### 2. Latency Trend Forecasting
**Model:** Exponential smoothing + linear regression
**Input Features:**
- Historical latency percentiles (P50, P95, P99)
- Query volume correlation
- Agent type

**Predictions:**
- Expected latency next hour
- Performance degradation probability
- Capacity threshold alerts

### 3. Approval Queue Depth Forecast
**Model:** Queue theory + time-series
**Input Features:**
- Historical queue depth
- Arrival rate (new approvals/hour)
- Service rate (approvals processed/hour)
- Time of day patterns

**Predictions:**
- Queue depth in 1 hour, 4 hours, 24 hours
- Wait time estimates
- Staffing requirements

## SQL Implementation

### Forecasting Views

```sql
-- Historical baseline for forecasting
CREATE OR REPLACE VIEW v_agent_performance_baseline AS
SELECT 
  agent,
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as query_count,
  AVG(latency_ms) as avg_latency,
  STDDEV(latency_ms) as latency_stddev,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency
FROM agent_queries
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY agent, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Simple moving average forecast (7-day window)
CREATE OR REPLACE VIEW v_agent_forecast_simple AS
WITH hourly_stats AS (
  SELECT 
    agent,
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as query_count,
    AVG(latency_ms) as avg_latency
  FROM agent_queries
  WHERE created_at > NOW() - INTERVAL '7 days'
  GROUP BY agent, DATE_TRUNC('hour', created_at)
)
SELECT 
  agent,
  ROUND(AVG(query_count) OVER (PARTITION BY agent ORDER BY hour ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as forecast_queries_next_hour,
  ROUND(AVG(avg_latency) OVER (PARTITION BY agent ORDER BY hour ROWS BETWEEN 23 PRECEDING AND CURRENT ROW), 2) as forecast_latency_next_hour,
  ROUND(STDDEV(query_count) OVER (PARTITION BY agent ORDER BY hour ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as forecast_uncertainty
FROM hourly_stats
ORDER BY hour DESC, agent;

-- Exponential smoothing forecast (alpha = 0.3)
CREATE OR REPLACE FUNCTION forecast_agent_metrics(
  p_agent TEXT,
  p_horizon_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
  forecast_hour TIMESTAMPTZ,
  predicted_queries INTEGER,
  predicted_latency_ms NUMERIC,
  confidence_lower NUMERIC,
  confidence_upper NUMERIC
) AS $$
DECLARE
  alpha NUMERIC := 0.3;
BEGIN
  -- Simplified exponential smoothing
  -- Production version would use dedicated forecasting library
  RETURN QUERY
  SELECT 
    NOW() + (h * INTERVAL '1 hour') as forecast_hour,
    ROUND(AVG(query_count))::INTEGER as predicted_queries,
    ROUND(AVG(avg_latency), 2) as predicted_latency_ms,
    ROUND(AVG(avg_latency) - (1.96 * STDDEV(avg_latency)), 2) as confidence_lower,
    ROUND(AVG(avg_latency) + (1.96 * STDDEV(avg_latency)), 2) as confidence_upper
  FROM (
    SELECT 
      DATE_TRUNC('hour', created_at) as hour,
      COUNT(*) as query_count,
      AVG(latency_ms) as avg_latency
    FROM agent_queries
    WHERE agent = p_agent 
      AND created_at > NOW() - INTERVAL '7 days'
    GROUP BY DATE_TRUNC('hour', created_at)
  ) historical
  CROSS JOIN generate_series(1, p_horizon_hours) h
  GROUP BY h;
END;
$$ LANGUAGE plpgsql;
```

## Machine Learning Integration

### Feature Engineering Table

```sql
CREATE TABLE ml_agent_features (
  feature_id BIGSERIAL PRIMARY KEY,
  agent TEXT NOT NULL,
  feature_timestamp TIMESTAMPTZ NOT NULL,
  -- Volume features
  queries_last_hour INTEGER,
  queries_last_24h INTEGER,
  queries_trend_7d NUMERIC, -- % change from previous week
  -- Performance features
  avg_latency_1h NUMERIC,
  p95_latency_1h NUMERIC,
  latency_trend_7d NUMERIC,
  -- Quality features
  approval_rate_24h NUMERIC,
  edit_rate_24h NUMERIC,
  error_rate_24h NUMERIC,
  -- Context features
  hour_of_day INTEGER,
  day_of_week INTEGER,
  is_weekend BOOLEAN,
  -- Target variable (for training)
  next_hour_queries INTEGER,
  next_hour_avg_latency NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ml_agent_features_agent_ts_idx ON ml_agent_features (agent, feature_timestamp DESC);
CREATE INDEX ml_agent_features_ts_idx ON ml_agent_features (feature_timestamp DESC);
```

### Model Storage

```sql
CREATE TABLE ml_forecast_models (
  model_id BIGSERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'arima', 'prophet', 'exponential_smoothing', 'lstm'
  target_metric TEXT NOT NULL,
  hyperparameters JSONB,
  training_period_start TIMESTAMPTZ,
  training_period_end TIMESTAMPTZ,
  validation_metrics JSONB, -- MAE, RMSE, MAPE
  model_artifact_path TEXT, -- S3 or filesystem path
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ml_forecast_predictions (
  prediction_id BIGSERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES ml_forecast_models(model_id),
  agent TEXT,
  forecast_timestamp TIMESTAMPTZ NOT NULL,
  predicted_value NUMERIC NOT NULL,
  confidence_lower NUMERIC,
  confidence_upper NUMERIC,
  actual_value NUMERIC, -- Filled in after observation
  prediction_error NUMERIC, -- Actual - predicted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ml_forecast_predictions_agent_ts_idx ON ml_forecast_predictions (agent, forecast_timestamp DESC);
```

## Python Integration (Optional)

```python
# scripts/data/forecasting/agent_forecast.py
import pandas as pd
from prophet import Prophet
from sqlalchemy import create_engine

def forecast_agent_performance(agent: str, days: int = 7):
    """Generate Prophet forecast for agent query volume"""
    
    # Load historical data
    query = f"""
    SELECT 
        DATE_TRUNC('hour', created_at) as ds,
        COUNT(*) as y
    FROM agent_queries
    WHERE agent = '{agent}'
      AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('hour', created_at)
    ORDER BY ds
    """
    
    df = pd.read_sql(query, engine)
    
    # Train Prophet model
    model = Prophet(
        seasonality_mode='multiplicative',
        daily_seasonality=True,
        weekly_seasonality=True
    )
    model.fit(df)
    
    # Generate forecast
    future = model.make_future_dataframe(periods=days*24, freq='H')
    forecast = model.predict(future)
    
    # Save predictions to database
    predictions = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days*24)
    predictions.to_sql('ml_forecast_predictions', engine, if_exists='append')
    
    return forecast
```

## Alerting Logic

```sql
-- Forecast-based alerts
CREATE OR REPLACE FUNCTION check_forecast_alerts()
RETURNS TABLE(
  agent TEXT,
  alert_type TEXT,
  severity TEXT,
  message TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Alert 1: Predicted capacity breach
  SELECT 
    f.agent,
    'capacity_breach'::TEXT,
    'critical'::TEXT,
    format('Predicted query volume (%s) exceeds capacity threshold (100 queries/hour)', f.predicted_value)
  FROM ml_forecast_predictions f
  WHERE f.forecast_timestamp BETWEEN NOW() AND NOW() + INTERVAL '4 hours'
    AND f.predicted_value > 100
  
  UNION ALL
  
  -- Alert 2: Predicted performance degradation
  SELECT 
    f.agent,
    'latency_spike'::TEXT,
    'warning'::TEXT,
    format('Predicted latency (%sms) above threshold (150ms)', f.predicted_value)
  FROM ml_forecast_predictions f
  WHERE f.forecast_timestamp BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
    AND f.predicted_value > 150;
END;
$$ LANGUAGE plpgsql;
```

**Status:** Forecasting framework designed, ready for ML model integration

