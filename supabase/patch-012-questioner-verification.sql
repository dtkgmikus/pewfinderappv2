-- Patch 012: complete questioner verification safely
--
-- Requires the private_member_data table and the existing
-- is_verified_questioner(uuid) function used by the questions INSERT policy.
-- Email and phone confirmation come from Supabase Auth; age is a user
-- attestation, not an age-estimation check.

create or replace function public.is_verified_questioner(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.private_member_data d on d.user_id = u.id
    where u.id = uid
      and u.email_confirmed_at is not null
      and u.phone is not null
      and u.phone_confirmed_at is not null
      and d.phone_e164 = u.phone
      and d.phone_verified_at is not null
      and d.adult_confirmed_at is not null
  );
$$;

revoke all on function public.is_verified_questioner(uuid) from public, anon;
grant execute on function public.is_verified_questioner(uuid) to authenticated;

create or replace function public.complete_questioner_verification(
  p_zip_code text,
  p_attest_18_plus boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user record;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Sign in before verifying your account';
  end if;
  if p_attest_18_plus is distinct from true then
    raise exception 'You must confirm that you are at least 18 years old';
  end if;
  if p_zip_code is null or p_zip_code !~ '^\d{5}$' then
    raise exception 'Enter a valid 5-digit ZIP code';
  end if;

  select u.phone, u.phone_confirmed_at, u.email_confirmed_at
    into v_user
    from auth.users u
    where u.id = v_uid;

  if v_user.email_confirmed_at is null then
    raise exception 'Confirm your email address before posting questions';
  end if;
  if v_user.phone is null or v_user.phone_confirmed_at is null then
    raise exception 'Verify your mobile number before posting questions';
  end if;

  insert into public.private_member_data as existing (
    user_id, phone_e164, zip_code, adult_confirmed_at, phone_verified_at
  ) values (
    v_uid, v_user.phone, p_zip_code, now(), v_user.phone_confirmed_at
  )
  on conflict (user_id) do update set
    phone_e164 = excluded.phone_e164,
    zip_code = excluded.zip_code,
    adult_confirmed_at = coalesce(existing.adult_confirmed_at, excluded.adult_confirmed_at),
    phone_verified_at = excluded.phone_verified_at,
    updated_at = now();
end;
$$;

revoke all on function public.complete_questioner_verification(text, boolean) from public, anon;
grant execute on function public.complete_questioner_verification(text, boolean) to authenticated;

-- Reproduce the active production rule: accounts must be verified and cannot
-- be restricted or suspended before creating a question.
drop policy if exists "questions: member creates own" on public.questions;
drop policy if exists "questions: verified member creates own" on public.questions;
create policy "questions: verified member creates own" on public.questions for insert
  with check (
    author_id = auth.uid()
    and public.is_verified_questioner(auth.uid())
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.restricted or p.suspended)
    )
  );
