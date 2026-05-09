-- Conversation persistence schema for back/
-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.agent_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null unique,
  agent_name text not null,
  agent_role text,
  source_profile jsonb not null default '{}'::jsonb,
  grading_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  agent_a_id text not null,
  agent_b_id text not null,
  judge_agent_id text not null,
  opening_message text not null,
  turns_per_agent integer not null,
  max_rounds integer not null,
  status text not null default 'continue' check (status in ('match', 'no_match', 'continue')),
  compatibility jsonb not null default '{}'::jsonb,
  transcript jsonb not null default '[]'::jsonb,
  transcript_preview text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  speaker_agent_id text not null,
  body text not null,
  round integer not null,
  turn integer not null,
  message_index integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_identities_user_id on public.agent_identities(user_id);
create index if not exists idx_agent_identities_agent_id on public.agent_identities(agent_id);
create index if not exists idx_conversations_owner_user_id on public.conversations(owner_user_id, created_at desc);
create index if not exists idx_conversations_agent_a_id on public.conversations(agent_a_id);
create index if not exists idx_conversations_agent_b_id on public.conversations(agent_b_id);
create index if not exists idx_conversation_messages_conversation_id on public.conversation_messages(conversation_id, message_index asc);
create index if not exists idx_conversation_messages_owner_user_id on public.conversation_messages(owner_user_id);

alter table public.agent_identities enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;

drop policy if exists "Users can read own agent identities" on public.agent_identities;
create policy "Users can read own agent identities"
  on public.agent_identities
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own agent identities" on public.agent_identities;
create policy "Users can manage own agent identities"
  on public.agent_identities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own conversations" on public.conversations;
create policy "Users can read own conversations"
  on public.conversations
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Users can manage own conversations" on public.conversations;
create policy "Users can manage own conversations"
  on public.conversations
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists "Users can read own conversation messages" on public.conversation_messages;
create policy "Users can read own conversation messages"
  on public.conversation_messages
  for select
  using (auth.uid() = owner_user_id);

drop policy if exists "Users can manage own conversation messages" on public.conversation_messages;
create policy "Users can manage own conversation messages"
  on public.conversation_messages
  for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_agent_identities_updated_at on public.agent_identities;
create trigger set_agent_identities_updated_at
before update on public.agent_identities
for each row
execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();
