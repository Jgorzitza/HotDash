-- Supabase retention cron configuration (draft)
-- Run in Supabase SQL editor with service role after review.

select cron.schedule(
  'purge_decision_log',
  '0 3 * * *',
  $$
    delete from decision_log
    where created_at < now() - interval '12 months';
  $$
);

select cron.schedule(
  'purge_facts',
  '15 3 * * *',
  $$
    delete from facts
    where created_at < now() - interval '180 days';
  $$
);

-- Optional: log run results to an audit table for compliance evidence
-- insert into retention_audit(job_name, deleted_count, executed_at) values (...);
