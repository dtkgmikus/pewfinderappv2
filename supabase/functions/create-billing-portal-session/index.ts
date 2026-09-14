// POST { church_id } with the church owner's Supabase access token as a
// Bearer Authorization header. Returns { url } — Stripe's hosted billing
// portal, where the owner can update their card, see invoices, or cancel.
// Cancelling there fires customer.subscription.deleted, which the
// stripe-webhook function turns into plan='free' — this function itself
// never changes plan/status.
import Stripe from 'npm:stripe@^17.0.0'
import { verifyChurchOwner, AuthError } from '../_shared/verifyChurchOwner.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const SITE_URL = Deno.env.get('SITE_URL')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const { church_id: churchId } = await req.json()
    if (!churchId) return json({ error: 'church_id is required' }, 400)

    const { serviceClient } = await verifyChurchOwner(req, churchId)

    const { data: sub } = await serviceClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('church_id', churchId)
      .maybeSingle()
    if (!sub?.stripe_customer_id) return json({ error: 'No billing account on file yet — upgrade to Pro first.' }, 400)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${SITE_URL}/admin/billing`,
    })

    return json({ url: portalSession.url })
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 500
    console.error('create-billing-portal-session failed', e)
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, status)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
