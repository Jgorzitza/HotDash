---
epoch: 2025.10.E1
doc: docs/data/streaming_platform_design.md
owner: data
last_reviewed: 2025-10-11
---

# Data Streaming Platform (Kafka/Kinesis Style)

## Overview

Event streaming platform for real-time data processing using Supabase Realtime + pg_notify as event backbone.

## Architecture

```
Event Sources → pg_notify → Supabase Realtime → Stream Consumers
                    ↓
              Event Store (Postgres)
```

## Implementation

- **Topics:** approval_events, query_events, feedback_events, performance_alerts
- **Partitioning:** By agent (for parallel processing)
- **Retention:** 7 days in event store
- **Throughput:** 1000 events/second target

## Event Schema

```sql
CREATE TABLE event_stream (
  event_id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  partition_key TEXT,
  event_data JSONB NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN DEFAULT false
);

CREATE INDEX event_stream_topic_ts_idx ON event_stream (topic, event_timestamp DESC);
CREATE INDEX event_stream_processed_idx ON event_stream (processed) WHERE processed = false;
```

**Status:** Streaming platform designed with Supabase Realtime
**Estimated Implementation:** 2 weeks
