-- Patch 008: create the profiles row at signup via a database trigger,
-- instead of the client writing it after supabase.auth.signUp() resolves.
--
-- Bug this fixes: supabase.auth.signUp() only returns an active session
-- immediately when email confirmation is disabled project-wide. With
-- Supabase's default (confirmation required), signUp() returns no session,
-- so the client has no authenticated request to write `profiles` with (RLS
-- requires auth.uid() = id, and there is no auth.uid() yet) — every answer
-- from the signup questionnaire (priorities, home town, household, etc.)
-- was silently discarded, and the member got a bare default profile the
-- first time they actually logged in.
--
-- Fix: signUp() now passes the questionnaire answers as auth option `data`
-- (stored on auth.users.raw_user_meta_data, set at signup time regardless
-- of confirmation status), and this trigger creates the real profiles row
-- from that metadata the moment the auth.users row is created — no client
-- write, no race, works whether or not confirmation is required.

create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into profiles (
    id, email, name, home_town, priorities, worship_style,
    seeking_status, willing_distance, age_band, household, consent_analytics
  ) values (
    new.id,
    new.email,
    coalesce(nullif(meta->>'name', ''), split_part(new.email, '@', 1)),
    nullif(meta->>'home_town', ''),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(meta->'priorities', '[]'::jsonb)) x), '{}'),
    nullif(meta->>'worship_style', ''),
    nullif(meta->>'seeking_status', ''),
    nullif(meta->>'willing_distance', ''),
    nullif(meta->>'age_band', ''),
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(meta->'household', '[]'::jsonb)) x), '{}'),
    coalesce((meta->>'consent_analytics')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
