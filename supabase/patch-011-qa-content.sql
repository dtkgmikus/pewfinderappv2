-- Patch 011: Ask-God question/answer content
--
-- Core content model for the Get-God.com pivot: members post a question
-- (text or video), and anyone (plus specially-approved "Q&A moderators")
-- can post a VIDEO answer — never a text answer, per product decision.
-- Every question and every answer is held as 'pending_review' until
-- PewFinder staff (the existing is_staff() role from schema.sql —
-- the same people who already review flags/claims) approve it. That's a
-- deliberately different group from "Q&A moderators" below: staff run the
-- publish queue; Q&A moderators are trained answerers whose videos get a
-- badge and sort to the top of a thread. One person can be both, but the
-- roles are separate on purpose.
--
-- Requires patch-010 (mux_assets) to already be applied.

-- ------------------------------------------------------------ tags --
create table question_tags (
  key text primary key,
  label text not null,
  sort_order int not null default 0
);
alter table question_tags enable row level security;
create policy "question_tags: public read" on question_tags for select using (true);
create policy "question_tags: staff admin manages" on question_tags for all
  using (is_staff_admin(auth.uid())) with check (is_staff_admin(auth.uid()));

insert into question_tags (key, label, sort_order) values
  ('doubt_faith',      'Doubt & Faith',            1),
  ('suffering_pain',   'Suffering & Pain',         2),
  ('salvation_grace',  'Salvation & Grace',        3),
  ('science_faith',    'Science & Faith',          4),
  ('relationships',    'Relationships & Family',   5),
  ('church_community', 'Church & Community',       6),
  ('prayer',           'Prayer',                   7),
  ('sin_forgiveness',  'Sin & Forgiveness',        8),
  ('end_times',        'End Times',                9),
  ('practical_living', 'Practical Living',        10);

-- ------------------------------------------------- Q&A moderators --
-- "Pre-selected trained moderators" who answer under a verified badge.
-- Applying doesn't grant anything by itself — status only becomes
-- 'approved' when staff act on it (see qa-moderation staff screen).
create table qa_moderators (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  application_text text not null,
  status text not null default 'applied'
    check (status in ('applied', 'approved', 'rejected', 'revoked')),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table qa_moderators enable row level security;
create policy "qa_moderators: self or staff read" on qa_moderators for select
  using (profile_id = auth.uid() or is_staff(auth.uid()));
create policy "qa_moderators: self applies" on qa_moderators for insert
  with check (profile_id = auth.uid());
create policy "qa_moderators: staff decides" on qa_moderators for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create or replace function is_qa_moderator(uid uuid) returns boolean as $$
  select exists (select 1 from qa_moderators where profile_id = uid and status = 'approved');
$$ language sql stable;

-- Shared guard (used by both questions and question_answers below): a row
-- with a video can't be flipped to 'published' while its mux_assets row
-- isn't actually 'ready' yet — closes the race where staff approve a
-- question/answer before Mux has finished processing (or after it came
-- back 'rejected_too_long'/'errored').
create or replace function enforce_video_ready_before_publish() returns trigger as $$
begin
  if new.status = 'published' and new.video_asset_id is not null then
    if not exists (select 1 from mux_assets m where m.id = new.video_asset_id and m.status = 'ready') then
      raise exception 'cannot publish: the linked video is not ready yet';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------- questions --
create table questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  tag_key text references question_tags(key),
  title text not null,                                 -- short caption, required even for a video question
  body_text text,                                       -- set for a text question
  video_asset_id uuid references mux_assets(id),        -- set for a video question
  is_anonymous boolean not null default false,
  author_display_name text not null,
  author_initials text not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'published', 'rejected', 'removed')),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body_text, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_has_content check (body_text is not null or video_asset_id is not null)
);
create index questions_search_idx on questions using gin(search_vector);
create index questions_tag_idx on questions(tag_key);
create index questions_status_idx on questions(status);

-- A question posted anonymous can never leak the real name through the
-- columns other members can actually see, whatever the client sends.
create or replace function enforce_question_anonymity() returns trigger as $$
begin
  if new.is_anonymous then
    new.author_display_name := 'Anonymous';
    new.author_initials := '?';
  end if;
  return new;
end;
$$ language plpgsql;
create trigger trg_enforce_question_anonymity
  before insert or update on questions
  for each row execute function enforce_question_anonymity();
create trigger trg_questions_video_ready
  before insert or update on questions
  for each row execute function enforce_video_ready_before_publish();

alter table questions enable row level security;
create policy "questions: public read published" on questions for select
  using (status = 'published' or author_id = auth.uid() or is_staff(auth.uid()));
create policy "questions: member creates own" on questions for insert
  with check (
    author_id = auth.uid()
    and not exists (select 1 from profiles p where p.id = auth.uid() and (p.restricted or p.suspended))
  );
create policy "questions: member edits own within 1h" on questions for update
  using (author_id = auth.uid() and created_at > now() - interval '1 hour');
create policy "questions: staff moderates" on questions for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

-- ------------------------------------------------------ answers --
-- Always video — there is no text answer path, by design.
create table question_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  video_asset_id uuid not null references mux_assets(id),
  is_moderator_answer boolean not null default false,
  author_display_name text not null,
  author_initials text not null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'published', 'rejected', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index question_answers_question_idx on question_answers(question_id);
create index question_answers_status_idx on question_answers(status);
-- Moderator-answers pin to the top of a published thread; within each tier,
-- newest first.
create index question_answers_sort_idx on question_answers(question_id, is_moderator_answer desc, created_at desc);

-- Whether an answer counts as an official moderator answer is decided by
-- the server from qa_moderators at the moment it's posted — never by
-- whatever the client claims.
create or replace function set_answer_moderator_flag() returns trigger as $$
begin
  new.is_moderator_answer := is_qa_moderator(new.author_id);
  return new;
end;
$$ language plpgsql;
create trigger trg_set_answer_moderator_flag
  before insert on question_answers
  for each row execute function set_answer_moderator_flag();
create trigger trg_question_answers_video_ready
  before insert or update on question_answers
  for each row execute function enforce_video_ready_before_publish();

alter table question_answers enable row level security;
create policy "question_answers: public read published" on question_answers for select
  using (status = 'published' or author_id = auth.uid() or is_staff(auth.uid()));
create policy "question_answers: member creates own" on question_answers for insert
  with check (
    author_id = auth.uid()
    and not exists (select 1 from profiles p where p.id = auth.uid() and (p.restricted or p.suspended))
  );
create policy "question_answers: member edits own within 1h" on question_answers for update
  using (author_id = auth.uid() and created_at > now() - interval '1 hour');
create policy "question_answers: staff moderates" on question_answers for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
