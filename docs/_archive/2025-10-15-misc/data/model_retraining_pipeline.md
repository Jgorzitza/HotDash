---
epoch: 2025.10.E1
doc: docs/data/model_retraining_pipeline.md
owner: data
last_reviewed: 2025-10-11
---

# Automated Model Retraining Pipeline

## Overview
Automated pipeline for detecting model degradation and triggering retraining with fresh data.

## Retraining Triggers

### Scheduled Retraining
- **Frequency:** Weekly (Sundays 03:00 UTC)
- **Condition:** Automatic (keep models fresh)

### Performance-Based Retraining
- **Trigger:** Accuracy drops >10% from baseline
- **Condition:** MAE increases >20%
- **Action:** Immediate retrain + alert

### Drift-Based Retraining
- **Trigger:** Data drift detected (KS-test p <0.05)
- **Condition:** Feature distribution shift
- **Action:** Retrain within 24 hours

## Pipeline Stages

### Stage 1: Trigger Detection
```sql
CREATE OR REPLACE FUNCTION check_retrain_needed(p_model_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_mae NUMERIC;
  v_baseline_mae NUMERIC;
  v_drift_detected BOOLEAN;
BEGIN
  -- Check recent MAE vs baseline
  SELECT AVG(ABS(prediction_error))
  INTO v_current_mae
  FROM ml_model_predictions
  WHERE model_id = p_model_id
    AND predicted_at > NOW() - INTERVAL '7 days';
  
  SELECT metric_value
  INTO v_baseline_mae
  FROM ml_model_metrics
  WHERE model_id = p_model_id AND metric_name = 'baseline_mae'
  LIMIT 1;
  
  -- Check for drift
  SELECT EXISTS(
    SELECT 1 FROM ml_drift_alerts
    WHERE model_id = p_model_id AND detected_at > NOW() - INTERVAL '24 hours'
  ) INTO v_drift_detected;
  
  -- Return true if retrain needed
  RETURN (v_current_mae > v_baseline_mae * 1.2) OR v_drift_detected;
END;
$$ LANGUAGE plpgsql;
```

### Stage 2: Data Preparation
- Extract training data from agent_feedback
- Apply quality filters (safe_to_send != false)
- Split train/validation/test (70/15/15)

### Stage 3: Model Training
- Load latest training dataset version
- Train model with hyperparameters
- Validate on holdout set

### Stage 4: Model Validation
- Compare to current production model
- A/B test on sample data
- Validate business metrics

### Stage 5: Model Deployment
- Promote to production if improved
- Create new model version
- Log deployment event

## Automation Script
```bash
#!/bin/bash
# Automated model retraining pipeline

# 1. Check if retrain needed
RETRAIN=$(psql $DB_URL -t -c "SELECT check_retrain_needed(1);")

if [ "$RETRAIN" = "t" ]; then
  # 2. Export training data
  ./scripts/data/export-training-data.sh
  
  # 3. Train model (Python)
  python scripts/ml/train_model.py --model-id 1
  
  # 4. Validate and deploy
  python scripts/ml/deploy_model.py --model-id 1
fi
```

**Status:** Retraining pipeline designed with automated triggers

