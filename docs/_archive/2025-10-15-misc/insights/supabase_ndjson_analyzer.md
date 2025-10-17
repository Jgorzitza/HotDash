# Supabase NDJSON Analyzer — Notebook Plan (2025-10-11)

## Objective

- Provide a reproducible workflow for quantifying Supabase decision sync health using the raw NDJSON exports delivered by reliability.
- Generate evidence bundles (JSON summaries, charts, narrative notes) that can be attached to `feedback/data.md`, manager updates, and incident retros.

## Parameterization

- `LOG_PATH`: Absolute or relative path to the NDJSON export (line-delimited JSON).
- `OUTPUT_DIR`: Destination for derived artifacts (defaults to `artifacts/monitoring/`).
- `WINDOW_HOURS` (optional): Slice the dataset to the last _n_ hours for focused failure analysis.

## Recommended Execution Flow

1. **Baseline Summary**
   - Run `npm run ops:analyze-supabase -- --input "$LOG_PATH"` to produce `supabase-sync-summary-latest.json` plus a timestamped snapshot.
   - Review `failureSamples` and `errors.byCode` in the JSON output; capture notable signatures in the notebook preface.
2. **Notebook Setup**
   - Load NDJSON with an incremental reader (e.g., pandas `read_json(lines=True)` or Node `readline` stream).
   - Parameterize the path via an environment cell: `LOG_PATH = os.environ.get("LOG_PATH", "../artifacts/logs/<export>.ndjson")`.
   - Cache parsed rows to an intermediate Parquet/Feather file for quick iteration.
3. **Analysis Sections**
   - Failure rate by hour and error code.
   - Retry effectiveness vs. latency (scatter plot with regression line).
   - Top decision scopes / shop domains impacted.
   - P95/P99 duration trend line compared against SLA threshold (default 1000 ms until updated).
4. **Outputs**
   - Export charts to `artifacts/data/supabase/` (PNG/SVG + CSV for underlying aggregates).
   - Summarize findings in a markdown cell tagged `## Mitigation Notes` for direct copy into `docs/insights/2025-10-09_supabase_decision_sync.md`.
   - Mirror any schema or telemetry drift to `feedback/data.md`.

## Pending Dependencies

- Staging `SUPABASE_SERVICE_KEY` to verify live parity queries.
- Reliability confirmation on NDJSON export cadence & naming convention.
- Decision log schema changelog (if new fields land during incident response).

## Checklist Before Publishing

- [ ] Attach analyzer JSON + charts to the relevant blocker entry in `feedback/data.md`.
- [ ] Update `docs/insights/2025-10-09_supabase_decision_sync.md` with headline metrics and next steps.
- [ ] Share highlights with engineering/reliability for cross-validation on mitigation effectiveness.

_Next revision: flesh out the actual notebook template once credentials and live exports are available._
