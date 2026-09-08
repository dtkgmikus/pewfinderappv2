import { BookOpen, Megaphone, TrendingUp, ImagePlus } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'

const CARDS = [
  { icon: BookOpen, title: 'Sermon notes', body: 'Post a short summary and a link. Everyone who saved your church gets notified.' },
  { icon: ImagePlus, title: 'Photos, video & links', body: 'A gallery, YouTube or Facebook links, and program signup pages of your own.' },
  { icon: Megaphone, title: 'Promoted events', body: 'Pick a radius, pick the towns, and put your event in front of people already looking.' },
  { icon: TrendingUp, title: 'Insights', body: 'Who is looking, what they want, and where your categories sit against the area.' },
]

export function UpgradeScreen() {
  const { church, isPro, role, refresh } = useAdmin()

  const upgrade = async () => {
    if (role !== 'owner') return
    await supabase.from('subscriptions').upsert({ church_id: church.id, plan: 'pro', status: 'active', started_at: new Date().toISOString(), renews_at: new Date(Date.now() + 30 * 86400000).toISOString() })
    await supabase.from('churches').update({ plan: 'pro' }).eq('id', church.id)
    refresh()
  }

  return (
    <div className="flex flex-col gap-[26px] max-w-[880px]">
      <div>
        <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>PewFinder Pro · $50 a month</span>
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
        <button onClick={upgrade} disabled={isPro} className="btn btn-primary-solid" style={{ padding: '13px 18px', fontSize: 14 }}>{isPro ? 'You are on Pro' : 'Upgrade to Pro'}</button>
        <span style={{ fontSize: 12.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)', maxWidth: '38ch' }}>No contract. Cancel and your Pro content is hidden but kept — it returns if you come back.</span>
      </div>
    </div>
  )
}
