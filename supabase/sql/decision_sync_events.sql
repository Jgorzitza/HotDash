-- Supabase decision sync events view + storage table
-- Restores the /rest/v1/decision_sync_events endpoint expected by data/QA tooling.

create table if not exists decision_sync_event_logs (
  id            bigserial primary key,
  decision_id   integer      not null,
  status        text         not null,
  duration_ms   numeric(10,2),
  error_code    text,
  attempt       integer      not null default 1,
  scope         text         not null default 'ops',
  notes         text,
  payload       jsonb,
  created_at    timestamptz  not null default now()
);

create index if not exists decision_sync_event_logs_decision_id_idx
  on decision_sync_event_logs (decision_id);

create index if not exists decision_sync_event_logs_created_at_idx
  on decision_sync_event_logs (created_at desc);

create index if not exists decision_sync_event_logs_scope_idx
  on decision_sync_event_logs (scope);

create or replace view decision_sync_events as
select
  decision_id  as "decisionId",
  status       as "status",
  duration_ms  as "durationMs",
  error_code   as "errorCode",
  attempt      as "attempt",
  created_at   as "timestamp",
  scope        as "scope"
from decision_sync_event_logs
order by created_at desc;

comment on table decision_sync_event_logs is 'Raw Supabase decision sync telemetry captured by reliability monitors.';
comment on view decision_sync_events is 'PostgREST view consumed by monitoring scripts (decisionId, status, durationMs, errorCode, attempt, timestamp, scope).';
