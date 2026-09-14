// POST { church_id } with the church owner's Supabase access token as a
// Bearer Authorization header. Returns { url } — a Stripe Checkout URL to
// redirect the browser to. On successful payment, Stripe calls the
// stripe-webhook function (checkout.session.completed), which is what
// actually marks the church Pro — this function only ever *starts*
// checkout, it never writes plan/status itself, so a browser tab closed
// mid-checkout can't leave the church in a half-upgraded state.
import Stripe from 'npm:stripe@^17.0.0'
import { verifyChurchOwner, AuthError } from '../_shared/verifyChurchOwner.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID')!
const SITE_URL = Deno.env.get('SITE_URL')! // e.g. https://pewfinder.app — no trailing slash

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const { church_id: churchId } = await req.json()
    if (!churchId) return json({ error: 'church_id is required' }, 400)

    const { email, serviceClient } = await verifyChurchOwner(req, churchId)

    // Reuse an existing Stripe customer for this church if one was already
    // created by an earlier (possibly abandoned) checkout attempt.
    const { data: existing } = await serviceClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('church_id', churchId)
      .maybeSingle()

    let customerId = existing?.stripe_customer_id as string | undefined
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { church_id: churchId } })
      customerId = customer.id
      // Row may not exist yet for a church that's never subscribed before —
      // upsert so the customer id is saved even before checkout completes.
      await serviceClient.from('subscriptions').upsert(
        { church_id: churchId, stripe_customer_id: customerId },
        { onConflict: 'church_id' },
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: churchId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      subscription_data: { metadata: { church_id: churchId } },
      success_url: `${SITE_URL}/admin/billing?checkout=success`,
      cancel_url: `${SITE_URL}/admin/upgrade?checkout=cancelled`,
    })

    return json({ url: session.url })
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 500
    console.error('create-checkout-session failed', e)
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, status)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
