// Stripe calls this on every billing event. This is the ONLY place that
// writes churches.plan / subscriptions to 'pro' — never the client, and
// never create-checkout-session — so a browser closing early, a flaky
// network, or someone poking at the API directly can never grant Pro
// without Stripe actually confirming payment.
//
// Configure this URL as the endpoint in the Stripe Dashboard (Developers →
// Webhooks), subscribed to: checkout.session.completed,
// customer.subscription.updated, customer.subscription.deleted,
// invoice.payment_failed, invoice.payment_succeeded.
import Stripe from 'npm:stripe@^17.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})
const cryptoProvider = Stripe.createSubtleCryptoProvider()
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Service-role client: bypasses RLS (this function IS the billing system —
// see patch-007's protect_church_admin_fields trigger, which checks
// auth.role() = 'service_role' specifically so this write path works).
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret, undefined, cryptoProvider)
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const churchId = session.client_reference_id
        if (!churchId || !session.subscription || !session.customer) break
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSubscription(churchId, stripeSub, session.customer as string)
        break
      }
      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription
        const churchId = stripeSub.metadata?.church_id
        if (!churchId) break
        await upsertSubscription(churchId, stripeSub, stripeSub.customer as string)
        break
      }
      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription
        const churchId = stripeSub.metadata?.church_id
        if (!churchId) break
        await supabase.from('subscriptions')
          .update({ plan: 'free', status: 'cancelled' })
          .eq('church_id', churchId)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break
        await supabase.from('subscriptions')
          .update({ status: 'card_failed' })
          .eq('stripe_subscription_id', invoice.subscription as string)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break
        const { data: sub } = await supabase.from('subscriptions')
          .select('church_id')
          .eq('stripe_subscription_id', invoice.subscription as string)
          .maybeSingle()
        if (sub?.church_id) {
          await supabase.from('billing_receipts').insert({
            church_id: sub.church_id,
            occurred_on: new Date(invoice.created * 1000).toISOString().slice(0, 10),
            description: 'PewFinder Pro — monthly subscription',
            amount_cents: invoice.amount_paid,
          })
        }
        break
      }
      default:
        // Unhandled event types are expected and fine to ignore.
        break
    }
  } catch (e) {
    // Log and 500 so Stripe retries — swallowing this would silently drift
    // our subscriptions table away from what Stripe actually thinks happened.
    console.error(`Failed handling ${event.type}`, e)
    return new Response('Handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})

async function upsertSubscription(churchId: string, stripeSub: Stripe.Subscription, customerId: string) {
  const status = stripeSub.status === 'active' || stripeSub.status === 'trialing' ? 'active' : 'card_failed'
  const card = stripeSub.default_payment_method as Stripe.PaymentMethod | string | null
  const card_last4 = card && typeof card !== 'string' && card.card?.last4 ? card.card.last4 : undefined

  await supabase.from('subscriptions').upsert({
    church_id: churchId,
    plan: 'pro',
    status,
    stripe_customer_id: customerId,
    stripe_subscription_id: stripeSub.id,
    renews_at: new Date(stripeSub.current_period_end * 1000).toISOString(),
    ...(card_last4 ? { card_last4 } : {}),
  }, { onConflict: 'church_id' })
}
