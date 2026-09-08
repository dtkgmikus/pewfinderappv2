# PewFinder

A church-review app for Atlantic County, NJ. Members
discover and rate churches across eleven categories; churches claim their
listing, reply to reviews, post sermon notes, and run promoted events on a
paid tier; PewFinder staff moderate flags, claims, and promotions.

This is the production implementation of the `Pewfinder.dc.html` /
`Pewfinder Church Admin.dc.html` / `Pewfinder Staff Admin.dc.html` prototypes
built in Claude Design (see `../chats` and `../README.md` in the repo root
for the design history). Built with React + Vite + Tailwind, backed by
Supabase (Postgres + Auth).

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema and seed data**, in order, via the SQL editor (or `psql`
   / `supabase db push` against your project's connection string):
   ```
   supabase/schema.sql
   supabase/seed.sql
   ```
   `supabase/_test_stub_auth.sql` is **not** part of this — it's a local-only
   stub used to test the SQL against a plain Postgres instance without a
   real Supabase project (see below).
3. **Copy `.env.example` to `.env`** and fill in your project's URL and anon
   key (Project Settings → API).
4. `npm install && npm run dev`.

### Adding staff accounts

Church staff sign up and claim a church themselves through `/admin`. PewFinder
staff (the `/staff` portal) and a church's *first* owner in a demo/seed
environment aren't self-serve — create the accounts via Supabase Auth
(dashboard → Authentication → Add user, or `auth.admin.createUser`), then
run `supabase/link-demo-staff.sql` with the real user ids filled in.

### Testing the SQL locally without Supabase

`supabase/_test_stub_auth.sql` stubs the pieces of Supabase's `auth` schema
(`auth.users`, `auth.uid()`) and the `anon`/`authenticated` roles that
`schema.sql`'s RLS policies reference, so the whole thing can be smoke-tested
against a vanilla local Postgres:
```
createdb pf_test
psql -d pf_test -f supabase/_test_stub_auth.sql -f supabase/schema.sql -f supabase/seed.sql
```

## Architecture

Three surfaces, one Supabase project, role-gated by two join tables
(`church_staff`, `staff_members`) rather than a single role column — a
person can be a member, a church's Responder, and nothing else, all at once.

- **Member app** (`/`) — Discover, Your visits, a church profile, Write a
  review (overall + 11 categories, with Preaching's sub-questions expanding
  when rated), Feed, Map, Signup.
- **Church admin console** (`/admin`) — claim & verify, dashboard, reviews
  (reply / flag with the keep-reply-vs-ask-us-to-remove split), profile
  (basics / times / programs / photos & video / links), sermon notes,
  promote (radius + towns + channels, submitted for staff review), insights
  (aggregate-only, 10-person floor), team roles, billing. Sermon notes,
  media/links, promote, and insights are gated behind the $50/mo Pro plan.
- **Staff portal** (`/staff`) — queue, flagged reviews (four outcomes: keep,
  remove, remove the naming, remove + strike), claims, promotions, a church
  directory with account actions, a member directory with moderation
  actions, billing, and policy. Destructive actions (suspend, restrict,
  transfer ownership, comp/cancel Pro) are Admin-only; Moderators get
  everything else.

## Deliberate simplifications vs. the prototype

The prototype fabricated sample data and demo-only affordances that don't
translate directly into a real backend. Rather than fake them, these were
either implemented for real against the schema or left as an honest empty
state:

- **Church photos** are a neutral placeholder until a church uploads a real
  one — the prototype's Adobe Stock comp images aren't licensed for
  production.
- **Insights demographic breakdowns** (age, household, town, seeking status)
  query real `profiles` + `church_page_views` data and correctly show "not
  enough data yet" on a fresh install rather than showing invented numbers.
  Traffic counts and the category-gap-vs-area-average block are real and
  populated from seed data immediately.
- **"Your visits" pending-visits list** (visited-but-not-yet-reviewed) was
  prototype flavor with no underlying data model; the real Visits tab shows
  your actual published reviews instead.
- **Billing** persists plan/subscription state for real, but there's no
  Stripe (or other processor) integration yet — upgrading/downgrading in
  the console doesn't move real money. That's the next piece to wire up
  before this goes live.
- **Team invites** look up the invitee by email among existing PewFinder
  accounts (via a minimal security-definer RPC) rather than sending an
  invite email, since that needs a server-side email step this pass didn't
  build.
- **Service times** are a single free-text field rather than the
  prototype's structured per-day rows — simpler to edit, same substance.
- **Promotion reach estimates** are computed from a static town-population
  reference table, not live geodata — flagged in the code as a placeholder
  pending a real geographic analytics source.

## Known follow-ups

- Stripe (or equivalent) for real Pro billing.
- Real photo/file upload (Supabase Storage) instead of pasting an image URL.
- Real geocoding for the map (currently static placement percentages).
- Email delivery for staff invites, claim decisions, flag decisions, and
  sermon-note notifications — all of this is written to the right tables
  today but nothing sends mail yet.
- An audit-log viewer (writes already happen for the RLS-covered mutations
  that need it; there's no read UI yet).
