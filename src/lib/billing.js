import { supabase } from './supabase.js'
import { isNativeApp, openExternal } from './platform.js'

// Both edge functions read the caller's own Supabase access token (verified
// server-side against church_staff — see supabase/functions/_shared/
// verifyChurchOwner.ts) rather than trusting anything the client claims, so
// a church can only ever start checkout or open the billing portal for a
// church it actually owns.
async function invokeBilling(fn, churchId) {
  const { data, error } = await supabase.functions.invoke(fn, { body: { church_id: churchId } })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

/**
 * Redirects the browser to Stripe Checkout for this church's Pro
 * subscription. Deliberately refuses to run inside the Capacitor-wrapped
 * iOS/Android app — starting a real-money purchase for digital
 * services/content from inside a native app is what triggers App
 * Store / Play Store billing-policy rejections (see MOBILE.md). Callers on
 * native should route the user to `webBillingUrl(churchId)` instead — see
 * UpgradeScreen.jsx / BillingScreen.jsx for the pattern.
 */
export async function startProCheckout(churchId) {
  if (isNativeApp()) throw new Error('Start checkout on the web, not in the app.')
  const { url } = await invokeBilling('create-checkout-session', churchId)
  window.location.href = url
}

/**
 * Opens Stripe's hosted billing portal (update card, see invoices, cancel)
 * for an *existing* subscription. Managing/cancelling an already-active
 * subscription is not a new in-app purchase, so unlike checkout this is
 * fine to open from native — it's opened in the system/in-app browser
 * rather than navigating the app's own WebView away from the app.
 */
export async function openBillingPortal(churchId) {
  const { url } = await invokeBilling('create-billing-portal-session', churchId)
  await openExternal(url)
}

/** Where the native app should send someone who wants to start (or change) Pro billing. */
export function webBillingUrl(churchId) {
  const base = import.meta.env.VITE_SITE_URL || 'https://getgod.com'
  return `${base}/admin/billing?church=${churchId}`
}
