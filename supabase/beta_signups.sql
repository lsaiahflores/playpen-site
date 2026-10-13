-- Playpen website: beta signup list.
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- The website posts straight to the REST endpoint with the project's public "anon" key.
-- Row-level security lets the anonymous role INSERT rows and nothing else: it cannot read, change or delete them.
-- You read the list yourself in the Supabase dashboard (Table editor), which uses your own login.

create table if not exists public.beta_signups (
  id             bigint generated always as identity primary key,
  email          text        not null,
  wants_updates  boolean     not null default false,
  source         text        not null default 'website',
  created_at     timestamptz not null default now(),
  constraint beta_signups_email_len    check (char_length(email) between 5 and 254),
  constraint beta_signups_email_shape  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  constraint beta_signups_source_len   check (char_length(source) <= 40)
);

-- one row per address, case-insensitive: a repeat signup comes back as HTTP 409, which the form shows as "already on the list"
create unique index if not exists beta_signups_email_unique on public.beta_signups (lower(email));

alter table public.beta_signups enable row level security;

drop policy if exists "anon can sign up" on public.beta_signups;
create policy "anon can sign up"
  on public.beta_signups
  for insert
  to anon
  with check (source = 'website');

-- no select / update / delete policy exists for anon, so those are refused.
-- Be explicit about table privileges as well (Supabase grants broadly by default):
revoke all on public.beta_signups from anon, authenticated;
grant insert on public.beta_signups to anon;
