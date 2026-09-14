import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { startProCheckout, openBillingPortal, webBillingUrl } from '../lib/billing.js'
import { isNativeApp, openExternal } from '../lib/platform.js'

const FREE_FEATURES = ['Flag reviews that break the rules', 'Edit your profile & service times', 'Programs checklist']
const PRO_FEATURES = ['Everything in Free', 'Reply to reviews', 'Sermon notes with member notifications', 'Photos, video, and program links', 'Promoted events with geographic targeting', 'Insights — who is looking and what they want', 'Board & monthly reports']

export function BillingScreen() {
  const { church, subscription, isPro, role } = useAdmin()
  const [receipts, setReceipts] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('billing_receipts').select('*').eq('church_id', church.id).order('occurred_on', { ascending: false }).then(({ data }) => setReceipts(data || []))
  }, [church])

  const canManage = role === 'owner'

  // Upgrading starts real Stripe Checkout; the church becomes Pro only once
  // Stripe confirms payment via the stripe-webhook function. Downgrading /
  // cancelling and updating a card both happen in Stripe's own billing
  // portal, not by writing this table directly — see supabase/functions/.
  //
  // Starting a NEW subscription is never done from inside the wrapped
  // iOS/Android app (App Store / Play Store billing policy — see
  // MOBILE.md); managing/cancelling an existing one via Stripe's portal is
  // fine there since it isn't a new purchase.
  const managePlan = async () => {
    if (!canManage || busy) return
    if (isPro) return openBillingPortal(church.id)
    if (isNativeApp()) return openExternal(webBillingUrl(church.id))
    setBusy(true)
    setError('')
    try {
      await startProCheckout(church.id)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-[22px] max-w-[820px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Plan &amp; billing</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
          {isPro ? `On Get-God Pro since ${new Date(subscription.started_at).toLocaleDateString()}.` : "You're on the free tier — claimed and verified, no card on file."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 items-start">
        <PlanCard title="Claimed" price="Free" features={FREE_FEATURES} highlighted={!isPro} />
        <div className="border flex flex-col gap-[14px]" style={{ borderColor: 'var(--color-accent-500)', padding: 22, background: 'color-mix(in srgb,var(--color-accent) 6%,transparent)' }}>
          <div className="flex items-baseline justify-between gap-[10px]">
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>Get-God Pro</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>$50<span style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}> / month</span></span>
          </div>
          <FeatureList items={PRO_FEATURES} />
          <button onClick={managePlan} disabled={!canManage || busy} className="border" style={{ background: isPro ? 'transparent' : 'var(--color-accent-700)', color: isPro ? 'var(--color-accent-800)' : 'var(--color-surface)', borderColor: 'var(--color-accent-700)', padding: '12px 16px', fontSize: 13.5, marginTop: 4 }}>
            {busy ? 'Redirecting…' : isPro ? 'Manage billing / cancel' : isNativeApp() ? 'Upgrade on the web' : 'Upgrade to Pro'}
          </button>
          <span style={{ fontSize: 11.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            Month to month, cancel any time. If you cancel, your sermon notes, videos, and links are hidden but kept.
          </span>
          {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 12.5 }}>{error}</p>}
        </div>
      </div>

      {isPro && receipts.length > 0 && (
        <div className="border flex flex-col gap-3" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Receipts</span>
          <div className="flex flex-col gap-[7px]">
            {receipts.map((r) => (
              <span key={r.id} className="grid items-center border-b" style={{ gridTemplateColumns: '120px 1fr auto', gap: 14, fontSize: 13, padding: '7px 0', borderColor: 'var(--color-divider)' }}>
                <span style={{ color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{r.occurred_on}</span>
                <span>{r.description}</span>
                <span>${(r.amount_cents / 100).toFixed(2)}</span>
              </span>
            ))}
          </div>
          {subscription?.card_last4 && <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Billed to card ending {subscription.card_last4}</span>}
        </div>
      )}
    </div>
  )
}

function PlanCard({ title, price, features }) {
  return (
    <div className="border flex flex-col gap-[14px]" style={{ borderColor: 'var(--color-divider)', padding: 22 }}>
      <div className="flex items-baseline justify-between gap-[10px]">
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19 }}>{price}</span>
      </div>
      <FeatureList items={features} />
    </div>
  )
}

function FeatureList({ items }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((f) => (
        <span key={f} className="flex items-start gap-[9px]" style={{ fontSize: 13, lineHeight: 1.5 }}>
          <Check size={12} strokeWidth={2.4} style={{ color: 'var(--color-accent-700)', marginTop: 2 }} />
          <span>{f}</span>
        </span>
      ))}
    </div>
  )
}
