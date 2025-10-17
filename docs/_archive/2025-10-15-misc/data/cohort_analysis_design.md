---
epoch: 2025.10.E1
doc: docs/data/cohort_analysis_design.md
owner: data
last_reviewed: 2025-10-11
---

# Cohort Analysis for Pilot Customer Behavior

## Overview

Cohort-based analysis framework for tracking pilot customer behavior, retention, and engagement over time.

## Cohort Definition

- **Cohort Key:** First interaction month
- **Segments:** By agent type, support tier, product category
- **Metrics:** Retention, engagement, satisfaction, conversion

## SQL Implementation

```sql
CREATE TABLE customer_cohorts (
  customer_id TEXT NOT NULL,
  cohort_month DATE NOT NULL,
  first_interaction_at TIMESTAMPTZ,
  acquisition_channel TEXT,
  PRIMARY KEY (customer_id, cohort_month)
);

CREATE OR REPLACE VIEW v_cohort_retention AS
SELECT
  cohort_month,
  COUNT(DISTINCT customer_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN activity_month = cohort_month THEN customer_id END) as month_0,
  COUNT(DISTINCT CASE WHEN activity_month = cohort_month + INTERVAL '1 month' THEN customer_id END) as month_1,
  COUNT(DISTINCT CASE WHEN activity_month = cohort_month + INTERVAL '2 months' THEN customer_id END) as month_2
FROM customer_cohorts
GROUP BY cohort_month;
```

**Status:** Cohort framework designed
