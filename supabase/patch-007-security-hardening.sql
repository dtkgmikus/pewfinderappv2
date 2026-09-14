-- Patch 007: close role/plan enforcement gaps that were client-UI-only.
--
-- Found in review: "Admin-only" staff actions (suspend/restore a church,
-- restrict/suspend a member, comp/cancel Pro, transfer church ownership)
-- and the church-side Owner/Editor/Responder/Viewer role model were only
-- checked in React components, never by RLS — any signed-in Moderator or
-- church "Viewer" could perform them directly against the Supabase API.
-- Separately, a church's Pro-gated features (sermon notes, photos/video,
-- links, promoted events) were only paywalled in the UI, and a church
-- could set its own `plan` column directly, i.e. self-upgrade for free.
--
-- This patch:
--   1. Adds a real strike counter to profiles (finding: "strike" restricted
--      on the first offense, contradicting its own "second strike" label).
--   2. Adds is_church_editor() (any role except 'viewer') and requires it,
--      instead of is_church_staff() (any role including 'viewer'), on every
--      write policy for church-managed content.
--   3. Tightens is_staff()-gated writes that should be admin-only
--      (staff_members aside, which was already admin-only) to
--      is_staff_admin(): profiles moderation, church_staff management
--      (adding/removing/transferring church staff), and subscriptions.
--   4. Adds church_is_pro() and requires it (or pewfinder staff override)
--      on the write policies for the four Pro-only tables.
--   5. Adds a trigger that blocks changing churches.plan / churches.status
--      unless the actor is a staff admin or the request carries the
--      service_role key (so the future Stripe webhook, which must write
--      plan changes without a human admin in the loop, still works) —
--      closes the self-upgrade hole at the table level, not just the UI.
--
-- Safe to run against a database that already has schema.sql + seed.sql +
-- patch-001 through patch-004 and patch-006 applied.

-- ---------------------------------------------------------------- strikes --
alter table profiles add column if not exists strikes int not null default 0;

-- --------------------------------------------------------------- helpers --
create or replace function is_church_editor(uid uuid, cid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from church_staff
    where profile_id = uid and church_id = cid and role <> 'viewer'
  );
$$;

create or replace function church_is_pro(cid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(select 1 from churches where id = cid and plan = 'pro');
$$;

-- ============================================================ churches --
drop policy if exists "churches: staff edit" on churches;
create policy "churches: staff edit" on churches for update
  using (is_church_editor(auth.uid(), id) or is_staff(auth.uid()));

-- Column guard: plan/status can only change via a staff admin action or the
-- service-role key (the Stripe webhook edge function). Everything else that
-- "churches: staff edit" / "churches: pewfinder staff manage" already allows
-- (name, address, verified, claimed, ...) is untouched by this trigger.
create or replace function protect_church_admin_fields() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if (new.plan is distinct from old.plan or new.status is distinct from old.status)
     and auth.role() <> 'service_role'
     and not is_staff_admin(auth.uid()) then
    raise exception 'Only a PewFinder admin (or the billing system) can change a church''s plan or suspension status';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_protect_church_admin_fields on churches;
create trigger trg_protect_church_admin_fields
  before update on churches
  for each row execute function protect_church_admin_fields();

-- ========================================================= church_staff --
-- Adding/removing church staff (including transferring ownership) from the
-- PewFinder side is an admin-only action; a church's own owner still manages
-- their own roster freely.
drop policy if exists "church_staff: owner manages" on church_staff;
create policy "church_staff: owner manages" on church_staff for all
  using (church_role(auth.uid(), church_id) = 'owner' or is_staff_admin(auth.uid()))
  with check (church_role(auth.uid(), church_id) = 'owner' or is_staff_admin(auth.uid()));

-- ============================================================= profiles --
-- Restricting/suspending a member is one of the actions the product spec
-- calls admin-only.
drop policy if exists "profiles: staff moderates (warn/restrict/suspend)" on profiles;
create policy "profiles: staff moderates (warn/restrict/suspend)" on profiles for update
  using (is_staff_admin(auth.uid())) with check (is_staff_admin(auth.uid()));

-- ========================================================= subscriptions --
-- Real billing (Stripe) writes this table via the service-role key from a
-- webhook, never from a signed-in church's own session — a church upgrading
-- itself for free by writing its own subscriptions row is exactly the bug
-- this closes. A staff admin keeps the ability to comp/cancel manually.
drop policy if exists "subscriptions: church owner or staff writes" on subscriptions;
create policy "subscriptions: staff admin or billing system writes" on subscriptions for all
  using (is_staff_admin(auth.uid()))
  with check (is_staff_admin(auth.uid()));

-- Keep churches.plan in sync with subscriptions automatically, however the
-- subscriptions row was written (webhook via service role, or admin comp).
create or replace function sync_church_plan_from_subscription() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  update churches set plan = new.plan where id = new.church_id and plan is distinct from new.plan;
  return new;
end;
$$;
drop trigger if exists trg_sync_church_plan on subscriptions;
create trigger trg_sync_church_plan
  after insert or update on subscriptions
  for each row execute function sync_church_plan_from_subscription();

-- ===================================================== church_programs --
-- Free-tier content, but still an edit (not a viewer action).
drop policy if exists "church_programs: church staff manage" on church_programs;
create policy "church_programs: church staff manage" on church_programs for all
  using (is_church_editor(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_editor(auth.uid(), church_id) or is_staff(auth.uid()));

-- ========================================================= church_media --
-- Pro-gated ("Photos & video" tab).
drop policy if exists "church_media: church staff manage" on church_media;
create policy "church_media: church staff manage" on church_media for all
  using ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()))
  with check ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()));

-- ================================================== church_social_links --
-- Pro-gated ("Links & socials" tab).
drop policy if exists "church_social_links: church staff manage" on church_social_links;
create policy "church_social_links: church staff manage" on church_social_links for all
  using ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()))
  with check ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()));

-- ================================================== church_program_links --
-- Also written from the Pro-gated "Links & socials" tab.
drop policy if exists "church_program_links: church staff manage" on church_program_links;
create policy "church_program_links: church staff manage" on church_program_links for all
  using ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()))
  with check ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()));

-- ============================================================ sermon_notes --
-- Pro-gated.
drop policy if exists "sermon_notes: church staff manage" on sermon_notes;
create policy "sermon_notes: church staff manage" on sermon_notes for all
  using ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()))
  with check ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()));

-- =============================================================== campaigns --
-- Pro-gated ("Promote").
drop policy if exists "campaigns: church staff manage" on campaigns;
create policy "campaigns: church staff manage" on campaigns for all
  using ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()))
  with check ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()));

-- ========================================================= review_replies --
-- Pro-gated: replying to reviews is part of the paid plan (product
-- decision — see BillingScreen/UpgradeScreen copy), same enforcement shape
-- as sermon_notes/church_media/campaigns above.
drop policy if exists "review_replies: church staff writes" on review_replies;
create policy "review_replies: church staff writes" on review_replies for all
  using ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()))
  with check ((is_church_editor(auth.uid(), church_id) and church_is_pro(church_id)) or is_staff(auth.uid()));

-- =========================================================== review_flags --
-- A church flagging a review is a content action too, not a viewer one.
drop policy if exists "review_flags: member or church staff creates" on review_flags;
create policy "review_flags: member or church staff creates" on review_flags for insert
  with check (
    (flagged_by_type = 'member' and flagged_by_profile_id = auth.uid())
    or (flagged_by_type = 'church' and is_church_editor(auth.uid(), flagged_by_church_id))
  );

-- ============================================================= strikes --
-- Atomic strike + conditional restrict (was: FlagsScreen set
-- profiles.restricted = true unconditionally on the FIRST strike, even
-- though its own label reads "Second strike restricts reviewing" — there
-- was no strike counter anywhere to make that true). Runs as a single
-- statement so two staff members deciding flags on the same member at once
-- can't race each other into an inconsistent count; admin-only, same as
-- every other destructive moderation action.
create or replace function strike_member(target_profile_id uuid) returns void
  language plpgsql security definer set search_path = public as $$
begin
  if not is_staff_admin(auth.uid()) then
    raise exception 'Only a PewFinder admin can strike a member';
  end if;
  update profiles
    set strikes = strikes + 1,
        restricted = (strikes + 1 >= 2)
    where id = target_profile_id;
end;
$$;
revoke all on function strike_member(uuid) from public;
grant execute on function strike_member(uuid) to authenticated;
