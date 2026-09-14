-- Patch 010: Mux video assets (shared foundation for question/answer video)
--
-- One row per video anyone ever uploads to Mux — a question video or an
-- answer video both point here (see patch-011). The row is created by the
-- client the moment it asks for an upload URL (status 'uploading'), and
-- ONLY the mux-webhook edge function (running as service_role) or a staff
-- admin is ever allowed to move it past that — never the uploader. That
-- mirrors patch-007's protect_church_admin_fields pattern: RLS is row-level,
-- so a column-level guard needs its own trigger.
--
-- The 5-minute answer/question cap (README/MOBILE.md: "answer videos should
-- not be more than 5 minutes long") is enforced twice: the mux-webhook
-- function is expected to check duration before ever setting status to
-- 'ready', but a trigger here is the real backstop — no code path, present
-- or future, can mark an over-length asset 'ready'.

create table mux_assets (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references profiles(id) on delete cascade,
  mux_upload_id text,                      -- Mux Direct Upload id, set at creation
  mux_asset_id text,                       -- Mux Asset id, set once Mux finishes ingest
  mux_playback_id text,                    -- public playback id, set once status='ready'
  duration_seconds numeric,
  status text not null default 'uploading'
    check (status in ('uploading', 'preprocessing', 'ready', 'errored', 'rejected_too_long')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index mux_assets_owner_idx on mux_assets(owner_profile_id);

-- Belt-and-suspenders: an asset can never be marked 'ready' over the cap —
-- it's silently redirected to 'rejected_too_long' instead, whatever set the
-- status. 300 seconds = 5 minutes.
create or replace function enforce_mux_duration_cap() returns trigger as $$
begin
  if new.status = 'ready' and new.duration_seconds is not null and new.duration_seconds > 300 then
    new.status := 'rejected_too_long';
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_enforce_mux_duration_cap
  before insert or update on mux_assets
  for each row execute function enforce_mux_duration_cap();

-- Column-level lock: only the row's creation (status='uploading', the
-- client's own asset) is a normal write. Every field that matters for
-- trusting the video — status, duration, the Mux ids themselves — can only
-- change via service_role (the mux-webhook function, which verifies Mux's
-- signature) or a staff admin (manual correction).
create or replace function protect_mux_asset_fields() returns trigger as $$
begin
  if (new.status is distinct from old.status
      or new.duration_seconds is distinct from old.duration_seconds
      or new.mux_asset_id is distinct from old.mux_asset_id
      or new.mux_playback_id is distinct from old.mux_playback_id)
     and auth.role() <> 'service_role' and not is_staff_admin(auth.uid()) then
    raise exception 'mux_assets: status/duration/asset ids can only be set by the webhook or a staff admin';
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_protect_mux_asset_fields
  before update on mux_assets
  for each row execute function protect_mux_asset_fields();

alter table mux_assets enable row level security;
create policy "mux_assets: owner or staff read" on mux_assets for select
  using (owner_profile_id = auth.uid() or is_staff(auth.uid()));
create policy "mux_assets: owner creates the upload row" on mux_assets for insert
  with check (
    owner_profile_id = auth.uid()
    and not exists (select 1 from profiles p where p.id = auth.uid() and (p.restricted or p.suspended))
  );
create policy "mux_assets: owner, staff, or webhook updates" on mux_assets for update
  using (owner_profile_id = auth.uid() or is_staff(auth.uid()) or auth.role() = 'service_role');
