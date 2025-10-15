-- Creates a lightweight table for Supabase Edge Function logging.
create table if not exists public.observability_logs (
  id bigserial primary key,
  level text not null default 'INFO',
  message text not null,
  metadata jsonb default '{}'::jsonb,
  request_id text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists observability_logs_created_at_idx on public.observability_logs (created_at desc);
create index if not exists observability_logs_level_idx on public.observability_logs (level);
