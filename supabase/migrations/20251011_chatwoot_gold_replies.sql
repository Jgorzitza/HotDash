-- Chatwoot curated replies schema with RLS
-- Owner: data (proposal; requires manager approval via PR)

create table if not exists public.support_curated_replies (
  id                bigserial primary key,
  message_body      text        not null,
  tags              text[]      not null default '{}',
  approver          text        not null,
  approved_at       timestamptz not null default now(),
  source_message_id text,
  conversation_id   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.support_curated_replies is 'Curated support replies approved by Support; used as gold dataset for AI evaluation.';
comment on column public.support_curated_replies.message_body is 'Approved answer text.';
comment on column public.support_curated_replies.tags is 'Topic tags for grouping and retrieval.';
comment on column public.support_curated_replies.approver is 'Email or identifier of approver.';
comment on column public.support_curated_replies.approved_at is 'Timestamp of approval.';
comment on column public.support_curated_replies.source_message_id is 'Upstream Chatwoot message ID (optional).';
comment on column public.support_curated_replies.conversation_id is 'Upstream Chatwoot conversation ID (optional).';

create index if not exists support_curated_replies_approved_at_idx on public.support_curated_replies (approved_at desc);
create index if not exists support_curated_replies_conversation_idx on public.support_curated_replies (conversation_id);
create index if not exists support_curated_replies_source_msg_idx on public.support_curated_replies (source_message_id);
create index if not exists support_curated_replies_updated_at_idx on public.support_curated_replies (updated_at desc);
create index if not exists support_curated_replies_created_at_idx on public.support_curated_replies (created_at desc);
create index if not exists support_curated_replies_tags_gin on public.support_curated_replies using gin (tags);

-- Row Level Security
alter table public.support_curated_replies enable row level security;

-- Roles used by RLS/JWT claims
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'ai_readonly') then
    create role ai_readonly noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'support_webhook') then
    create role support_webhook noinherit;
  end if;
end$$;

-- Insert allowed only for webhook role
create policy if not exists support_curated_replies_insert_by_webhook
  on public.support_curated_replies
  for insert
  with check (coalesce((auth.jwt() ->> 'role'),'') = 'support_webhook');

-- Read allowed for ai_readonly or any authenticated user
create policy if not exists support_curated_replies_read_ai
  on public.support_curated_replies
  for select
  using ((coalesce((auth.jwt() ->> 'role'),'') = 'ai_readonly') or (auth.role() = 'authenticated'));

-- Trigger to maintain updated_at
create or replace function public.set_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_support_curated_replies_updated_at on public.support_curated_replies;
create trigger trg_support_curated_replies_updated_at
before update on public.support_curated_replies
for each row execute procedure public.set_timestamp_updated_at();
