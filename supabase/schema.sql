-- Pewfinder — schema + RLS
-- Run against a Supabase Postgres project (SQL editor, or `supabase db push`).
-- Ported from the Pewfinder.dc.html / Pewfinder Church Admin.dc.html /
-- Pewfinder Staff Admin.dc.html prototypes.

create extension if not exists pgcrypto;

-- ============================================================== profiles --
-- One row per authenticated user, whatever surface they use.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default 'Member',
  home_town text,
  zip text,
  priorities text[] not null default '{}',            -- "what matters most to you"
  worship_style text,
  seeking_status text,
  willing_distance text,
  age_band text,
  household text[] not null default '{}',
  consent_analytics boolean not null default false,     -- required at signup for seeker Qs
  default_anonymous boolean not null default false,
  restricted boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles: read own" on profiles for select using (auth.uid() = id);
create policy "profiles: update own" on profiles for update using (auth.uid() = id);
create policy "profiles: insert own" on profiles for insert with check (auth.uid() = id);
-- Pewfinder staff need the Members directory (search, moderation actions);
-- defined after staff_members/is_staff() below, so it's added there instead
-- to avoid a forward reference.

-- ------------------------------------------------------- staff / roles --
create table staff_members (
  profile_id uuid primary key references profiles(id) on delete cascade,
  role text not null check (role in ('admin','moderator')),
  created_at timestamptz not null default now()
);

create table church_staff (
  -- no inline "references churches(id)" here: churches doesn't exist yet at
  -- this point in the script. The FK is added via ALTER TABLE further down,
  -- right after churches is created.
  church_id uuid not null,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner','editor','responder','viewer')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (church_id, profile_id)
);

-- security-definer helpers so RLS policies can check role membership
-- without recursing back into the tables they guard.
create or replace function is_staff(uid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(select 1 from staff_members where profile_id = uid);
$$;

create or replace function is_staff_admin(uid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(select 1 from staff_members where profile_id = uid and role = 'admin');
$$;

create or replace function church_role(uid uuid, cid uuid) returns text
  language sql stable security definer set search_path = public as $$
  select role from church_staff where profile_id = uid and church_id = cid;
$$;

create or replace function is_church_staff(uid uuid, cid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(select 1 from church_staff where profile_id = uid and church_id = cid);
$$;

alter table staff_members enable row level security;
create policy "staff_members: any staff reads the roster" on staff_members for select using (is_staff(auth.uid()));
create policy "staff_members: admin inserts" on staff_members for insert with check (is_staff_admin(auth.uid()));
create policy "staff_members: admin updates" on staff_members for update
  using (is_staff_admin(auth.uid())) with check (is_staff_admin(auth.uid()));
create policy "staff_members: admin deletes" on staff_members for delete using (is_staff_admin(auth.uid()));

create policy "profiles: staff reads all (Members directory)" on profiles for select using (is_staff(auth.uid()));
create policy "profiles: staff moderates (warn/restrict/suspend)" on profiles for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

alter table church_staff enable row level security;
create policy "church_staff: self or staff read" on church_staff for select
  using (auth.uid() = profile_id or is_staff(auth.uid()) or is_church_staff(auth.uid(), church_id));
create policy "church_staff: owner manages" on church_staff for all
  using (church_role(auth.uid(), church_id) = 'owner' or is_staff(auth.uid()))
  with check (church_role(auth.uid(), church_id) = 'owner' or is_staff(auth.uid()));

-- Minimal lookup so a church owner can add a staff member (or a member can
-- be found for other invite flows) by email without profiles' RLS opening
-- read access to everyone's contact info.
create or replace function find_profile_id_by_email(lookup_email text) returns uuid
  language sql stable security definer set search_path = public as $$
  select id from profiles where email = lookup_email limit 1;
$$;
revoke all on function find_profile_id_by_email(text) from public;
grant execute on function find_profile_id_by_email(text) to authenticated;

-- ================================================================ churches --
create table churches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  denomination text not null,
  street text not null,
  town text not null check (town in (
    'Absecon','Atlantic City','Brigantine','Buena','Buena Vista Twp','Corbin City',
    'Egg Harbor City','Egg Harbor Twp','Estell Manor','Folsom','Galloway Twp',
    'Hamilton Twp','Hammonton','Linwood','Longport','Margate City','Mays Landing',
    'Mullica Twp','Northfield','Pleasantville','Port Republic','Somers Point',
    'Ventnor City','Weymouth Twp'
  )),
  county text not null default 'Atlantic',
  zip text not null default '08234',
  -- real coordinates for "near me" distance search — town-center precision
  -- where a per-church address wasn't geocoded, still accurate enough to
  -- rank/filter by actual distance from the visitor.
  lat numeric(8,5),
  lng numeric(8,5),
  distance_mi numeric(4,1) not null default 0,
  service_times text not null default 'Service times not listed',
  first_visit_note text,
  phone text,
  facts text[] not null default '{}',
  claimed boolean not null default false,
  verified boolean not null default false,
  verification_method text,
  verified_at timestamptz,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text not null default 'active' check (status in ('active','suspended')),
  hero_photo_url text,
  thumbnail_photo_url text,
  -- placement (0-100) on the static map tile, only set for churches worth
  -- pinning (rated + claimed) so the map stays readable — real lat/lng
  -- geocoding is a follow-up once a maps provider is chosen.
  map_x numeric(5,2),
  map_y numeric(5,2),
  -- maintained summary counters (see triggers below) rather than an
  -- expensive live aggregate — lets a seeded church carry a realistic
  -- rating/count history without fabricating hundreds of review rows.
  avg_rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);

-- church_staff.church_id couldn't reference churches(id) inline (churches
-- didn't exist yet when church_staff was created above) — added now instead.
-- Without this, PostgREST has no declared relationship to embed churches(...)
-- under a church_staff select, and that query 400s.
alter table church_staff add constraint church_staff_church_id_fkey
  foreign key (church_id) references churches(id) on delete cascade;

alter table churches enable row level security;
create policy "churches: public read active" on churches for select using (status = 'active' or is_staff(auth.uid()));
create policy "churches: staff edit" on churches for update
  using (is_church_staff(auth.uid(), id) or is_staff(auth.uid()));
create policy "churches: pewfinder staff manage" on churches for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create table review_categories (
  key text primary key,
  label text not null,
  sort_order int not null
);
alter table review_categories enable row level security;
create policy "review_categories: public read" on review_categories for select using (true);
create policy "review_categories: staff admin manages" on review_categories for all
  using (is_staff_admin(auth.uid())) with check (is_staff_admin(auth.uid()));

create table category_subquestions (
  id uuid primary key default gen_random_uuid(),
  category_key text not null references review_categories(key) on delete cascade,
  sub_key text not null,
  label text not null,
  sort_order int not null,
  heading text,
  note text,
  unique (category_key, sub_key)
);
alter table category_subquestions enable row level security;
create policy "category_subquestions: public read" on category_subquestions for select using (true);
create policy "category_subquestions: staff admin manages" on category_subquestions for all
  using (is_staff_admin(auth.uid())) with check (is_staff_admin(auth.uid()));

create table program_catalog (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  label text not null,
  sort_order int not null
);
alter table program_catalog enable row level security;
create policy "program_catalog: public read" on program_catalog for select using (true);
create policy "program_catalog: staff admin manages" on program_catalog for all
  using (is_staff_admin(auth.uid())) with check (is_staff_admin(auth.uid()));

-- Maintained per-category summary (see triggers below). Seeded from the
-- prototype's baked-in scores, then blended with real submissions.
create table church_category_scores (
  church_id uuid not null references churches(id) on delete cascade,
  category_key text not null references review_categories(key),
  avg_score numeric(3,2) not null default 0,
  n int not null default 0,
  primary key (church_id, category_key)
);
alter table church_category_scores enable row level security;
create policy "church_category_scores: public read" on church_category_scores for select using (true);

create table church_programs (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  program_id uuid references program_catalog(id) on delete cascade,
  custom_label text,
  created_at timestamptz not null default now(),
  check ((program_id is not null) <> (custom_label is not null))
);
alter table church_programs enable row level security;
create policy "church_programs: public read" on church_programs for select using (true);
create policy "church_programs: church staff manage" on church_programs for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table church_media (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  kind text not null check (kind in ('photo','video')),
  url text not null,
  title text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table church_media enable row level security;
create policy "church_media: public read" on church_media for select using (true);
create policy "church_media: church staff manage" on church_media for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table church_social_links (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  platform text not null,
  url text not null
);
alter table church_social_links enable row level security;
create policy "church_social_links: public read" on church_social_links for select using (true);
create policy "church_social_links: church staff manage" on church_social_links for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table church_program_links (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  program_label text not null,
  url text not null,
  cta_label text not null default 'Sign up'
);
alter table church_program_links enable row level security;
create policy "church_program_links: public read" on church_program_links for select using (true);
create policy "church_program_links: church staff manage" on church_program_links for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table sermon_notes (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  title text not null,
  scripture text,
  date_preached date not null default current_date,
  summary text not null,
  media_link text,
  notify_saved boolean not null default true,
  created_at timestamptz not null default now()
);
alter table sermon_notes enable row level security;
create policy "sermon_notes: public read" on sermon_notes for select using (true);
create policy "sermon_notes: church staff manage" on sermon_notes for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table saved_churches (
  member_id uuid not null references profiles(id) on delete cascade,
  church_id uuid not null references churches(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (member_id, church_id)
);
alter table saved_churches enable row level security;
create policy "saved_churches: own" on saved_churches for all
  using (auth.uid() = member_id) with check (auth.uid() = member_id);

-- ================================================================ reviews --
create table reviews (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  -- nullable: seeded sample reviews (ported from the prototype) aren't tied
  -- to a real auth account, only to a denormalized author name below. Real
  -- reviews created through the app always set this to auth.uid().
  member_id uuid references profiles(id) on delete set null,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  well_text text,
  improve_text text,
  visited_on date not null,
  is_anonymous boolean not null default false,
  author_display_name text not null,
  author_initials text not null,
  -- topical highlight chips shown under a review (e.g. "Friendliness / welcome",
  -- "Kids & nursery"). Display-only — NOT the source of a church's category
  -- scores, which live in church_category_scores. A reviewer doesn't pick
  -- these today; they're populated for imported/seed reviews.
  tags text[] not null default '{}',
  -- baseline "found helpful" count carried over from seeded/historical
  -- reviews. The displayed count is this plus live review_helpful_votes.
  seed_helpful_count int not null default 0,
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_church_idx on reviews(church_id);
alter table reviews enable row level security;
create policy "reviews: public read published" on reviews for select
  using (status = 'published' or member_id = auth.uid() or is_staff(auth.uid())
         or is_church_staff(auth.uid(), church_id));
create policy "reviews: member creates own" on reviews for insert
  with check (
    member_id = auth.uid()
    and not exists (select 1 from profiles p where p.id = auth.uid() and (p.restricted or p.suspended))
  );
create policy "reviews: member edits own within 24h" on reviews for update
  using (member_id = auth.uid() and created_at > now() - interval '24 hours');
create policy "reviews: staff moderates" on reviews for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create table review_category_ratings (
  review_id uuid not null references reviews(id) on delete cascade,
  category_key text not null references review_categories(key),
  rating smallint not null check (rating between 1 and 5),
  primary key (review_id, category_key)
);
alter table review_category_ratings enable row level security;
create policy "review_category_ratings: public read" on review_category_ratings for select using (true);
create policy "review_category_ratings: owner writes" on review_category_ratings for insert
  with check (exists(select 1 from reviews r where r.id = review_id and r.member_id = auth.uid()));
create policy "review_category_ratings: owner deletes" on review_category_ratings for delete
  using (exists(select 1 from reviews r where r.id = review_id and r.member_id = auth.uid()));

create table review_subcategory_ratings (
  review_id uuid not null references reviews(id) on delete cascade,
  category_key text not null,
  sub_key text not null,
  rating smallint not null check (rating between 1 and 5),
  primary key (review_id, category_key, sub_key)
);
alter table review_subcategory_ratings enable row level security;
create policy "review_subcategory_ratings: public read" on review_subcategory_ratings for select using (true);
create policy "review_subcategory_ratings: owner writes" on review_subcategory_ratings for insert
  with check (exists(select 1 from reviews r where r.id = review_id and r.member_id = auth.uid()));
create policy "review_subcategory_ratings: owner deletes" on review_subcategory_ratings for delete
  using (exists(select 1 from reviews r where r.id = review_id and r.member_id = auth.uid()));

create table review_helpful_votes (
  review_id uuid not null references reviews(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, member_id)
);
alter table review_helpful_votes enable row level security;
create policy "review_helpful_votes: public read" on review_helpful_votes for select using (true);
create policy "review_helpful_votes: own writes" on review_helpful_votes for all
  using (member_id = auth.uid()) with check (member_id = auth.uid());

create table review_replies (
  review_id uuid primary key references reviews(id) on delete cascade,
  church_id uuid not null references churches(id) on delete cascade,
  -- nullable for the same reason as reviews.member_id: seeded historical
  -- replies aren't tied to a real auth account.
  author_profile_id uuid references profiles(id),
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table review_replies enable row level security;
create policy "review_replies: public read" on review_replies for select using (true);
create policy "review_replies: church staff writes" on review_replies for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table review_flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  flagged_by_type text not null check (flagged_by_type in ('church','member')),
  flagged_by_profile_id uuid references profiles(id),
  flagged_by_church_id uuid references churches(id),
  reason text,
  note text,
  status text not null default 'open' check (status in ('open','decided')),
  outcome text check (outcome in ('keep','remove','edit','strike')),
  decision_note text,
  decided_by_profile_id uuid references profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
alter table review_flags enable row level security;
create policy "review_flags: staff and involved parties read" on review_flags for select
  using (is_staff(auth.uid()) or flagged_by_profile_id = auth.uid()
         or is_church_staff(auth.uid(), flagged_by_church_id));
create policy "review_flags: member or church staff creates" on review_flags for insert
  with check (
    (flagged_by_type = 'member' and flagged_by_profile_id = auth.uid())
    or (flagged_by_type = 'church' and is_church_staff(auth.uid(), flagged_by_church_id))
  );
create policy "review_flags: staff decides" on review_flags for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create table church_claims (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  -- nullable: seeded demo claims stand in for people who haven't signed up
  -- yet in this environment; real claims set this to auth.uid().
  claimant_profile_id uuid references profiles(id),
  claimant_name text not null,
  claimant_email text not null,
  method text not null,
  proof_text text,
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by_profile_id uuid references profiles(id)
);
alter table church_claims enable row level security;
create policy "church_claims: own or staff read" on church_claims for select
  using (claimant_profile_id = auth.uid() or is_staff(auth.uid()));
create policy "church_claims: member creates own" on church_claims for insert
  with check (claimant_profile_id = auth.uid());
create policy "church_claims: staff decides" on church_claims for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  title text not null,
  blurb text,
  event_when text,
  cost text default 'Free',
  place text,
  link text,
  audience text[] not null default '{}',
  radius_miles int not null default 10,
  towns text[] not null default '{}',
  channel_pinned boolean not null default true,
  channel_push boolean not null default true,
  channel_feed boolean not null default false,
  flier_url text,
  reach_estimate int not null default 0,
  status text not null default 'draft' check (status in ('draft','waiting','approved','sent_back')),
  decision_note text,
  submitted_at timestamptz,
  decided_at timestamptz,
  decided_by_profile_id uuid references profiles(id),
  created_at timestamptz not null default now()
);
alter table campaigns enable row level security;
create policy "campaigns: public read approved" on campaigns for select
  using (status = 'approved' or is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));
create policy "campaigns: church staff manage" on campaigns for all
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()))
  with check (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table subscriptions (
  church_id uuid primary key references churches(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text not null default 'active' check (status in ('active','comped','cancelled','card_failed')),
  started_at timestamptz not null default now(),
  renews_at timestamptz,
  card_last4 text
);
alter table subscriptions enable row level security;
create policy "subscriptions: church staff or pewfinder staff read" on subscriptions for select
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));
create policy "subscriptions: church owner or staff writes" on subscriptions for all
  using (church_role(auth.uid(), church_id) = 'owner' or is_staff(auth.uid()))
  with check (church_role(auth.uid(), church_id) = 'owner' or is_staff(auth.uid()));

create table billing_receipts (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  occurred_on date not null default current_date,
  description text not null,
  amount_cents int not null
);
alter table billing_receipts enable row level security;
create policy "billing_receipts: church staff or pewfinder staff read" on billing_receipts for select
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references profiles(id),
  action text not null,
  target_type text not null,
  target_id text,
  note text,
  created_at timestamptz not null default now()
);
alter table audit_log enable row level security;
create policy "audit_log: staff reads" on audit_log for select using (is_staff(auth.uid()));
create policy "audit_log: authenticated writes own action" on audit_log for insert
  with check (actor_profile_id = auth.uid());

create table church_page_views (
  id bigint generated always as identity primary key,
  church_id uuid not null references churches(id) on delete cascade,
  viewer_profile_id uuid references profiles(id),
  event_type text not null check (event_type in
    ('view','save','directions','service_times','photo','sermon_note','search')),
  search_term text,
  created_at timestamptz not null default now()
);
alter table church_page_views enable row level security;
create policy "church_page_views: anyone logs" on church_page_views for insert with check (true);
create policy "church_page_views: church staff or pewfinder staff read" on church_page_views for select
  using (is_church_staff(auth.uid(), church_id) or is_staff(auth.uid()));

-- ================================================================== views --
-- security_invoker so these views enforce RLS as the querying role (anon /
-- authenticated via PostgREST), not the view owner's — Postgres views
-- default to the owner's rights otherwise, which would silently bypass RLS.
create view review_helpful_counts with (security_invoker = true) as
  select review_id, count(*) as helpful_count from review_helpful_votes group by review_id;

-- One row per church with its category scores folded into a single jsonb
-- map ({"parking": 4.8, ...}) — saves the client a second round trip and a
-- client-side pivot for every Discover list / profile page render.
create view church_list with (security_invoker = true) as
  select c.*,
    coalesce(
      (select jsonb_object_agg(cs.category_key, cs.avg_score)
       from church_category_scores cs where cs.church_id = c.id),
      '{}'::jsonb
    ) as category_scores
  from churches c;

-- ============================================================== triggers --
-- Keep churches.avg_rating / review_count and church_category_scores
-- incrementally in sync as real reviews come in, blending with the seeded
-- baseline rather than requiring hundreds of fabricated review rows.
create or replace function bump_church_rating() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'published' then
    update churches set
      avg_rating = round((((avg_rating * review_count) + new.overall_rating) / (review_count + 1))::numeric, 2),
      review_count = review_count + 1
    where id = new.church_id;
  end if;
  return new;
end;
$$;
create trigger trg_bump_church_rating
  after insert on reviews
  for each row execute function bump_church_rating();

create or replace function bump_category_score() returns trigger
  language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select church_id into cid from reviews where id = new.review_id;
  insert into church_category_scores (church_id, category_key, avg_score, n)
    values (cid, new.category_key, new.rating, 1)
  on conflict (church_id, category_key) do update set
    avg_score = round((((church_category_scores.avg_score * church_category_scores.n) + new.rating)
                / (church_category_scores.n + 1))::numeric, 2),
    n = church_category_scores.n + 1;
  return new;
end;
$$;
create trigger trg_bump_category_score
  after insert on review_category_ratings
  for each row execute function bump_category_score();
