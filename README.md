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

### Billing (Stripe)

Pro is real, paid billing — not a toggle in the console. `create-checkout-session`
and `create-billing-portal-session` are the only things the browser ever
calls; `stripe-webhook` is the only thing that ever marks a church Pro, and
only once Stripe confirms payment. See `supabase/functions/`.

1. **Apply `supabase/patch-009-stripe-columns.sql`** (adds the Stripe
   customer/subscription id columns `subscriptions` needs) — after
   `schema.sql`/`seed.sql` and patch-001 through patch-008.
2. **In Stripe**, create one recurring Price for PewFinder Pro ($50/month)
   and note its price id (`price_...`).
3. **Deploy the three edge functions** (Supabase CLI, from the repo root):
   ```
   supabase functions deploy create-checkout-session
   supabase functions deploy create-billing-portal-session
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
   `stripe-webhook` needs `--no-verify-jwt` — Stripe calls it directly, with
   no Supabase session, and authenticates the request itself via the
   Stripe-Signature header instead.
4. **Set these as Supabase Edge Function secrets** (`supabase secrets set
   KEY=value`, or Dashboard → Edge Functions → Secrets) — never as
   `VITE_...` variables, which ship to the browser:
   - `STRIPE_SECRET_KEY` — your Stripe secret key.
   - `STRIPE_PRO_PRICE_ID` — the price id from step 2.
   - `STRIPE_WEBHOOK_SECRET` — from step 5 below.
   - `SITE_URL` — where the app is deployed (e.g. `https://pewfinder.app`,
     no trailing slash) — used to build Checkout/portal redirect URLs.
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are
     already provided automatically inside deployed Edge Functions; only set
     these yourself if testing with `supabase functions serve` locally.
5. **In Stripe, add a webhook endpoint** pointing at the deployed
   `stripe-webhook` function's URL, subscribed to: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`, `invoice.payment_succeeded`. Copy the signing
   secret it gives you into `STRIPE_WEBHOOK_SECRET` above.
6. **Enable the Stripe customer portal** (Stripe Dashboard → Settings →
   Billing → Customer portal) so `create-billing-portal-session` has
   something to open.

### Video (Mux)

Question and answer videos are uploaded straight from the browser to Mux —
this backend never handles the video bytes. `create-mux-upload-url` is the
only thing the browser calls; `mux-webhook` is the only thing that ever
marks a video 'ready' (and reports its real duration), once Mux has
actually finished processing it. See `supabase/functions/` and
`patch-010-mux-assets.sql`.

1. **Apply `supabase/patch-010-mux-assets.sql` and `patch-011-qa-content.sql`**
   (in that order, after patch-001 through patch-009).
2. **Create a [Mux](https://mux.com) account** and grab an API access token
   (Settings → API Access Tokens) — note the Token ID and Token Secret.
3. **Deploy the two edge functions**:
   ```
   supabase functions deploy create-mux-upload-url
   supabase functions deploy mux-webhook --no-verify-jwt
   ```
   `mux-webhook` needs `--no-verify-jwt` for the same reason `stripe-webhook`
   does — Mux calls it directly with no Supabase session, and it
   authenticates the request itself via the Mux-Signature header.
4. **Set these as Supabase Edge Function secrets**:
   - `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` — from step 2.
   - `MUX_WEBHOOK_SECRET` — from step 5 below.
   - `SITE_URL` — already set if you did the Stripe setup above; also used
     as the CORS origin Mux allows direct uploads from.
5. **In the Mux Dashboard, add a webhook** pointing at the deployed
   `mux-webhook` function's URL, subscribed to at least `video.asset.ready`
   and `video.asset.errored`. Copy its signing secret into
   `MUX_WEBHOOK_SECRET` above.

The 5-minute cap on answer (and question) videos is enforced in the
database (`patch-010`'s `enforce_mux_duration_cap` trigger) — no code path
can mark an over-length video 'ready', regardless of what any client or
edge function sends it.

### Mobile (iOS / Android)

The same app wraps into native iOS and Android builds via Capacitor —
config and scripts are already in the repo (`capacitor.config.ts`,
`npm run cap:add` / `cap:sync` / `cap:ios` / `cap:android`). See
[`MOBILE.md`](./MOBILE.md), including why Stripe checkout is intentionally
disabled inside the native app.

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
  (aggregate-only, 10-person floor), team roles, billing. Replying to
  reviews, sermon notes, media/links, promote, and insights are gated
  behind the $50/mo Pro plan (real Stripe billing — see Setup above).
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
- **Billing** is real Stripe Checkout + a webhook (`supabase/functions/`) —
  upgrading redirects to actual Stripe Checkout, and only Stripe confirming
  payment (via `stripe-webhook`) ever marks a church Pro; the browser can't
  grant itself Pro by calling the API directly (enforced by
  `patch-007-security-hardening.sql`'s `protect_church_admin_fields` trigger
  and the `subscriptions` RLS policy). Cancelling/updating a card goes
  through Stripe's own hosted billing portal.
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

- Real photo/file upload (Supabase Storage) instead of pasting an image URL.
- Real geocoding for the map (currently static placement percentages).
- Email delivery for staff invites, claim decisions, flag decisions, and
  sermon-note notifications — all of this is written to the right tables
  today but nothing sends mail yet.
- An audit-log viewer (writes already happen for the RLS-covered mutations
  that need it; there's no read UI yet).
