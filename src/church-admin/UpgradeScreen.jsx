import { useState } from 'react'
import { BookOpen, Megaphone, TrendingUp, ImagePlus, MessageSquare } from 'lucide-react'
import { useAdmin } from './AdminContext.jsx'
import { startProCheckout, webBillingUrl } from '../lib/billing.js'
import { isNativeApp, openExternal } from '../lib/platform.js'

const CARDS = [
  { icon: MessageSquare, title: 'Reply to reviews', body: 'Thank them, answer what they raised, say what you’re changing — right under the review, for every visitor to see.' },
  { icon: BookOpen, title: 'Sermon notes', body: 'Post a short summary and a link. Everyone who saved your church gets notified.' },
  { icon: ImagePlus, title: 'Photos, video & links', body: 'A gallery, YouTube or Facebook links, and program signup pages of your own.' },
  { icon: Megaphone, title: 'Promoted events', body: 'Pick a radius, pick the towns, and put your event in front of people already looking.' },
  { icon: TrendingUp, title: 'Insights & detailed feedback', body: 'Who is looking, what they want, and where your categories sit against the area.' },
]

export function UpgradeScreen() {
  const { church, isPro, role } = useAdmin()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Only starts Stripe Checkout — the church is not actually marked Pro
  // until Stripe confirms payment and calls the stripe-webhook function.
  // See supabase/functions/create-checkout-session and stripe-webhook.
  //
  // Never started from inside the wrapped iOS/Android app — see
  // MOBILE.md and src/lib/billing.js for why. The native build sends
  // people to the web billing console instead.
  const upgrade = async () => {
    if (role !== 'owner' || busy) return
    if (isNativeApp()) return openExternal(webBillingUrl(church.id))
    setBusy(true)
    setError('')
    try {
      await startProCheckout(church.id)
    } catch (e) {
      setError(e.message || 'Could not start checkout. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-[26px] max-w-[880px]">
      <div>
        <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>Get-God Pro · $50 a month</span>
        <h2 className="pf-h" style={{ fontSize: 32, lineHeight: 1.12, letterSpacing: '-.015em', margin: '12px 0 0', maxWidth: '26ch' }}>Reach the people already looking for a church near you</h2>
        <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.68, color: 'color-mix(in srgb,var(--color-text) 64%,transparent)', maxWidth: '60ch' }}>
          Everything in the free tier stays free. Pro adds the things that take work off your plate and put your events in front of people who don&rsquo;t know you yet.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-[18px]">
        {CARDS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="border flex flex-col gap-[9px]" style={{ borderColor: 'var(--color-divider)', padding: 20 }}>
            <Icon size={17} strokeWidth={1.5} style={{ color: 'var(--color-accent-700)' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{title}</span>
            <span style={{ fontSize: 13, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{body}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-[16px] flex-wrap border-t" style={{ paddingTop: 20, borderColor: 'var(--color-divider)' }}>
        <button onClick={upgrade} disabled={isPro || busy} className="btn btn-primary-solid" style={{ padding: '13px 18px', fontSize: 14 }}>
          {isPro ? 'You are on Pro' : busy ? 'Redirecting to checkout…' : isNativeApp() ? 'Upgrade on the web' : 'Upgrade to Pro'}
        </button>
        <span style={{ fontSize: 12.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)', maxWidth: '38ch' }}>
          {isNativeApp() && !isPro ? 'Opens getgod.com in your browser to upgrade — ' : ''}No contract. Cancel and your Pro content is hidden but kept — it returns if you come back.
        </span>
      </div>
      {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 13 }}>{error}</p>}
    </div>
  )
}
