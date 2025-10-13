-- Agent Metrics schema and KPIs (local Supabase)
-- NOTE: Apply in local/staging only after review. RLS/policies to be finalized with Compliance.

create table if not exists agent_run (
  run_id uuid primary key,
  agent_name text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  input_kind text,
  resolution text check (resolution in ('resolved','escalated','failed')) not null,
  tokens_input int default 0,
  tokens_output int default 0,
  cost_usd numeric(10,5) default 0,
  self_corrected boolean default false,
  sla_target_seconds int,
  metadata jsonb
);

create index if not exists idx_agent_run_agent_time
  on agent_run (agent_name, started_at);

create table if not exists agent_qc (
  run_id uuid references agent_run(run_id) on delete cascade,
  quality_score int check (quality_score between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

create or replace view v_agent_kpis as
select
  agent_name,
  date_trunc('day', started_at) as day,
  count(*) as total_runs,
  avg(extract(epoch from (ended_at - started_at))) as avg_resolution_seconds,
  100.0 * avg(case when self_corrected then 1 else 0 end) as self_correction_rate,
  100.0 * avg(case when resolution='escalated' then 1 else 0 end) as escalation_pct,
  avg(cost_usd) as avg_cost_usd,
  100.0 * avg(case when ended_at is not null
                    and sla_target_seconds is not null
                    and extract(epoch from (ended_at-started_at)) <= sla_target_seconds
                   then 1 else 0 end) as sla_hit_rate,
  avg(q.quality_score) as avg_quality
from agent_run r
left join agent_qc q using(run_id)
group by 1,2;
