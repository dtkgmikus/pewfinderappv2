-- Local test-only stub of the bits of Supabase's `auth` schema our SQL
-- references, so schema.sql/seed.sql can be syntax- and logic-checked
-- against a plain local Postgres. NOT part of the real migration.
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid()
);
create or replace function auth.uid() returns uuid
  language sql stable as $$ select null::uuid; $$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
end $$;
