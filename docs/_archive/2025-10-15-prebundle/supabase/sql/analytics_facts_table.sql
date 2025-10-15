-- Supabase analytics facts table
-- Run this in the Supabase SQL editor (service role) or via `supabase db remote commit`
-- Mirrors Prisma dashboard analytics facts for parity checks and retention automation.

create extension if not exists pgcrypto;

create table if not exists facts (
  id uuid primary key default gen_random_uuid(),
  project text not null,
  topic text not null,
  key text not null,
  value jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists facts_topic_idx on facts (topic);
create index if not exists facts_topic_key_idx on facts (topic, key);
create index if not exists facts_created_at_idx on facts (created_at desc);

comment on table facts is 'Operator analytics facts mirrored from Prisma dashboard_fact (180 day retention).';
comment on column facts.project is 'Logical project namespace (e.g. occ).';
comment on column facts.topic is 'Analytics topic (e.g. dashboard.analytics).';
comment on column facts.key is 'Fact key inside the topic (e.g. view, refresh).';
comment on column facts.value is 'Serialized JSON payload of the fact.';
comment on column facts.created_at is 'Timestamp the fact was recorded (UTC).';
