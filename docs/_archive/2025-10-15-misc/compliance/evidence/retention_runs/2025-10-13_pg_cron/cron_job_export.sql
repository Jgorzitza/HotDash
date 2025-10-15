-- Supabase pg_cron job export captured 2025-10-10T14:20:05Z UTC
COPY (
  SELECT jobid,
         schedule,
         command,
         nodename,
         nodeport,
         database,
         username,
         active
  FROM cron.job
  WHERE command ILIKE '%purge_dashboard_data%'
) TO STDOUT WITH CSV HEADER;

jobid,schedule,command,nodename,nodeport,database,username,active
42,0 3 * * *,SELECT purge_dashboard_data();,db.hotdash-staging.supabase.co,5432,postgres,service_role,true
