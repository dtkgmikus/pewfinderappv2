-- Patch 009: columns needed to run real Stripe billing.
--
-- subscriptions already tracks plan/status/renews_at/card_last4, but had no
-- link back to the Stripe objects that actually drive those values — the
-- stripe-webhook edge function needs to find "which church is this Stripe
-- customer/subscription for" on every event, and create-checkout-session
-- needs to reuse an existing Stripe customer for a church that already has
-- one rather than creating a duplicate on every checkout attempt.

alter table subscriptions add column if not exists stripe_customer_id text;
alter table subscriptions add column if not exists stripe_subscription_id text;

create unique index if not exists subscriptions_stripe_customer_id_idx
  on subscriptions(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists subscriptions_stripe_subscription_id_idx
  on subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;
