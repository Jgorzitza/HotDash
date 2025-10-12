# Agent Performance Metrics Implementation Specification

This document defines the schema, metrics, ingestion, and analytics
requirements for tracking AI agent performance across all operational
pipelines. The coding agent should implement the following in the
existing platform using the established data and logging framework.

------------------------------------------------------------------------

## 1. Core Metrics to Track

Each agent run must emit a structured log entry containing the following
metrics:

  -----------------------------------------------------------------------
  Field                   Description
  ----------------------- -----------------------------------------------
  `run_id`                Unique UUID per agent execution

  `agent_name`            Identifier for the specific agent

  `input_kind`            Type of work item (`ticket`, `order`, `faq`,
                          etc.)

  `started_at`            UTC timestamp for run start

  `ended_at`              UTC timestamp for run completion

  `resolution`            Enum: `resolved`, `escalated`, or `failed`

  `self_corrected`        Boolean --- true if the agent fixed its own
                          error

  `tokens_input`          Number of input tokens processed

  `tokens_output`         Number of output tokens produced

  `cost_usd`              Approximate cost of the run

  `sla_target_seconds`    SLA goal in seconds for this run

  `metadata`              JSON payload with contextual IDs (e.g. shop_id,
                          order_id)
  -----------------------------------------------------------------------

Optional metrics for derived dashboards: - **Average Resolution Time
(ART)** = avg(ended_at - started_at) - **Self-Correction Rate (SCR)** =
% of runs where `self_corrected = true` - **Escalation % (ESC)** = %
where `resolution = escalated` - **Resolution Quality (RQ)** = mean of
`quality_score` - **Cost per Resolution (CPR)** = avg(`cost_usd`) -
**Deflection Rate (DEF)** = % of issues resolved without human touch -
**SLA Hit Rate (SLA)** = % resolved within SLA target

------------------------------------------------------------------------

## 2. Database Schema

Create the following tables and view:

``` sql
create table agent_run (
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

create table agent_qc (
  run_id uuid references agent_run(run_id) on delete cascade,
  quality_score int check (quality_score between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

create view v_agent_kpis as
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
  avg(quality_score) as avg_quality
from agent_run r
left join agent_qc q using(run_id)
group by 1,2;
```

------------------------------------------------------------------------

## 3. Ingestion Requirements

Every agent execution must emit a single structured JSON log conforming
to the schema above.

**Example JSON payload:**

``` json
{
  "run_id": "6a90b3d1-2c6b-4a3a-8bb9-23a93ebffb8e",
  "agent_name": "support-triage",
  "input_kind": "ticket",
  "started_at": "2025-10-10T02:15:30Z",
  "ended_at": "2025-10-10T02:16:12Z",
  "resolution": "resolved",
  "self_corrected": true,
  "tokens_input": 3421,
  "tokens_output": 1890,
  "cost_usd": 0.0342,
  "sla_target_seconds": 600,
  "metadata": {
    "shop_id": "hotrodan",
    "ticket_id": "T-9123"
  }
}
```

The ingestion service must: - Accept and store JSON entries
atomically. - Validate mandatory fields and resolution enum. -
Automatically populate `started_at` and `ended_at` timestamps when
available.

------------------------------------------------------------------------

## 4. Dashboard KPIs

Implement dashboards powered by the `v_agent_kpis` view, exposing at
least these widgets:

  Widget                    Data Source                Type
  ------------------------- -------------------------- -------------
  Average Resolution Time   `avg_resolution_seconds`   Line
  Self-Correction Rate      `self_correction_rate`     Bar
  Escalation Percentage     `escalation_pct`           Stacked bar
  SLA Hit Rate              `sla_hit_rate`             Stat
  Cost per Resolution       `avg_cost_usd`             Scatter
  Quality Score             `avg_quality`              Heatmap

Each dashboard should support: - Filter by agent_name and date range. -
Aggregation by day, week, and month. - Drill-down to individual runs
(`run_id`).

------------------------------------------------------------------------

## 5. Alert Rules

Configure threshold-based alerts using the metrics view:

  -----------------------------------------------------------------------
  Condition                  Threshold                  Action
  -------------------------- -------------------------- -----------------
  ART \> baseline × 1.5 (30  Dynamic                    Notify
  min window)                                           `#ops-alerts`

  Escalation % \> 20 % over  Static                     Notify
  last 100 runs                                         `#ops-alerts`

  SLA Hit Rate \< 90 %       Static                     Notify
  (daily)                                               `#ops-alerts`

  Avg Cost per Resolution    Relative                   Notify
  +20 % week-over-week                                  `#finance-ops`
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Weekly Review Queries

Provide scheduled summary outputs using these reference queries:

``` sql
-- High-cost, low-quality agents
select agent_name, avg_cost_usd, avg_quality
from v_agent_kpis
where day > now() - interval '7 days'
order by avg_cost_usd desc, avg_quality asc
limit 10;

-- Self-correction wins
select agent_name, count(*) as self_fixes
from agent_run
where self_corrected and started_at > now() - interval '7 days'
group by 1
order by self_fixes desc;

-- SLA violations
select agent_name, count(*) as misses
from agent_run
where extract(epoch from (ended_at - started_at)) > sla_target_seconds
group by 1
order by misses desc;
```

------------------------------------------------------------------------

## 7. Implementation Deliverables

-   Schema migration executed successfully.
-   Logging hook integrated in each agent runtime.
-   Ingest endpoint tested with sample payloads.
-   KPIs verified through initial dashboard queries.
-   Alert conditions configured and active.

------------------------------------------------------------------------

**Ownership:** Engineering Ops\
**Review Cadence:** Weekly\
**Last Updated:** 2025-10-12

---

## 8. CEO Approval Requirement (Training Phase)

**Policy** (2025-10-12): ALL customer-facing agent actions require CEO approval during training phase.

**Why**: CEO trains agents to match their voice, validates technical accuracy, builds trust in responses.

**Workflow**:
1. Agent generates proposed customer response
2. Response goes to approval queue (pending_approvals table)
3. CEO reviews and decides: Approve / Edit / Reject
4. CEO's feedback captured in agent_qc table
5. Agents learn from approval patterns

**Training Goals**:
- Week 1: 20% approval rate
- Week 4: 50% approval rate  
- Week 12: 80% approval rate (agents match CEO voice)

**NO Auto-Execute**: During training, 100% human-in-the-loop for customer interactions.

**See**: Section 2 (Database Schema) for agent_qc table that stores CEO feedback.
