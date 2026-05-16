-- ============================================================================
-- HireMind AI — apply ALL database migrations in one run
-- ----------------------------------------------------------------------------
-- Use when your Supabase project has never had migrations applied (REST 404 on
-- /rest/v1/users, or interview /start fails). Prefer BUNDLE_all_migrations.sql
-- for production parity; use MINIMAL_interview_only.sql if the bundle errors
-- on storage or PayHere objects.
--
-- In Supabase: Dashboard → SQL Editor → New query → paste this entire file → Run.
-- Safe to re-run for most statements (IF NOT EXISTS / DROP IF EXISTS where needed).
-- ============================================================================

/*
  HireMind AI — initial schema
  -----------------------------
  Tables are intentionally locked down via RLS with no permissive policies.
  Use the Supabase service role key ONLY on trusted backend routes (never expose to clients).
*/

-- ── public.users (mirrors auth.users; trigger upserts row on signup)
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  plan_type text not null default 'free' check (plan_type in ('free', 'premium')),
  created_at timestamptz not null default now ()
);

create or replace function public.handle_auth_user_created ()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.users (id, name, email, plan_type)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email::text, ''), '@', 1),
      'User'
    ),
    coalesce(new.email::text, ''),
    'free'
  )
  on conflict (id)
  do update set
    email = excluded.email,
    name = excluded.name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created ();

-- ── profiles
create table if not exists public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  skills jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  target_role text,
  resume_url text,
  updated_at timestamptz not null default now ()
);

-- ── interviews
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null,
  mode text not null default 'free' check (mode in ('free', 'premium')),
  score numeric,
  created_at timestamptz not null default now ()
);

create index if not exists interviews_user_id_created_at_idx on public.interviews (user_id, created_at desc);

-- ── interview_messages
create table if not exists public.interview_messages (
  id uuid primary key default gen_random_uuid (),
  interview_id uuid not null references public.interviews (id) on delete cascade,
  speaker text not null check (speaker in ('AI', 'USER')),
  message text not null,
  posted_at timestamptz not null default now ()
);

create index if not exists interview_messages_interview_id_timestamp_idx on public.interview_messages (interview_id, posted_at);

-- ── feedback (1:1 with interview)
create table if not exists public.feedback (
  interview_id uuid primary key references public.interviews (id) on delete cascade,
  communication_score numeric not null,
  technical_score numeric not null,
  confidence_score numeric not null,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now ()
);

-- ── subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  plan_type text not null default 'premium' check (plan_type in ('free', 'premium')),
  status text not null check (status in ('pending', 'paid', 'failed', 'canceled')),
  payhere_payment_id text,
  payhere_order_id text,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create unique index if not exists subscriptions_payhere_payment_id_uidx on public.subscriptions (payhere_payment_id)
where
  payhere_payment_id is not null;

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- ── payment_orders (idempotent webhook key = order_id)
create table if not exists public.payment_orders (
  order_id text primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric (12, 2) not null,
  currency text not null default 'LKR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index if not exists payment_orders_user_id_idx on public.payment_orders (user_id);

-- ── Notify handler: SECURITY DEFINER RPC for webhook idempotency (called with service_role)
drop function if exists public.complete_payhere_order (
  text, text, numeric, text, integer
);

create or replace function public.complete_payhere_order (
  p_order_id text,
  p_payhere_payment_id text,
  p_payhere_amount numeric,
  p_payhere_currency text,
  p_status_code integer
)
  returns jsonb
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  ord public.payment_orders%rowtype;
  cur_amt numeric(12, 2);
  cur_cur text;
  trimmed_payment_id text;
begin
  select *
    into ord
    from public.payment_orders
    where order_id = p_order_id for update;

  if not found then
    return jsonb_build_object('error', 'order_not_found');
  end if;

  if ord.status = 'paid' then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  if p_status_code <> 2 then
    if ord.status = 'pending' then
      update public.payment_orders
      set status = 'failed',
          updated_at = now (),
          metadata = metadata || jsonb_build_object('last_status_code', p_status_code,
            'terminal', 'notify_non_success_status')
      where order_id = p_order_id;
    end if;

    return jsonb_build_object(
      'ok',
      true,
      'applied',
      false,
      'note',
      'ignored_non_success');

  end if;

  trimmed_payment_id := nullif(trim(p_payhere_payment_id), '');
  if trimmed_payment_id is null then
    return jsonb_build_object('error', 'missing_payhere_payment_id');
  end if;

  cur_amt := round(ord.amount::numeric, 2);
  cur_cur := upper(trim(ord.currency));

  if cur_amt <> round(p_payhere_amount::numeric, 2) then
    return jsonb_build_object('error', 'amount_mismatch');
  end if;

  if cur_cur <> upper(trim(p_payhere_currency)) then
    return jsonb_build_object('error', 'currency_mismatch');
  end if;

  update public.payment_orders
    set status = 'paid',
        updated_at = now (),
        metadata = metadata || jsonb_build_object('payhere_payment_id', trimmed_payment_id,
          'payhere_currency', cur_cur)
  where order_id = p_order_id;

  insert into public.subscriptions (user_id,
    plan_type,
    status,
    payhere_payment_id,
    payhere_order_id)
    values (
      ord.user_id,
      'premium',
      'paid',
      trimmed_payment_id,
      p_order_id
    )
    on conflict (payhere_payment_id)
      where payhere_payment_id is not null
    do nothing;

    update public.users
    set plan_type = 'premium'
    where id = ord.user_id;

    return jsonb_build_object(
      'ok',
      true,
      'applied',
      true,
      'user_id',
      ord.user_id::text,
      'currency',
      cur_cur);

end;

$$;

revoke execute on function public.complete_payhere_order (
  text, text, numeric, text, integer
) from public;

grant execute on function public.complete_payhere_order (
  text, text, numeric, text, integer
) to service_role;

-- ── RLS restrictive defaults (no permissive roles)
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_messages enable row level security;
alter table public.feedback enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_orders enable row level security;

-- ── Buckets created here; restrictive storage policies assumed server uploads via service role
insert into
  storage.buckets (id, name, public)
values ('resumes', 'resumes', false),
       ('interview-audio', 'interview-audio', false)
on conflict (id) do nothing;

-- ── 20260516140000 allow plan_type reads for authenticated users
drop policy if exists "users_select_own" on public.users;

create policy "users_select_own"
on public.users
for select
to authenticated
using (auth.uid() = id);

-- ── 20260516141000
alter table public.interviews
  add column if not exists personality_id text;

-- ── 20260516180000 backfill mirror rows for existing auth users
insert into public.users (id, name, email, plan_type)
select
  au.id,
  coalesce(
    au.raw_user_meta_data ->> 'name',
    au.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(au.email::text, ''), '@', 1),
    'User'
  ),
  coalesce(au.email::text, ''),
  'free'
from auth.users au
where
  not exists (
    select 1
    from public.users pu
    where pu.id = au.id
  );
