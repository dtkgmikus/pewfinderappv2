import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export function StaffBillingScreen() {
  const [subs, setSubs] = useState([])

  useEffect(() => {
    supabase.from('subscriptions').select('*, churches(name)').order('started_at', { ascending: false }).then(({ data }) => setSubs(data || []))
  }, [])

  const pro = subs.filter((s) => s.plan === 'pro')
  const mrr = pro.filter((s) => s.status === 'active').length * 50
  const failed = pro.filter((s) => s.status === 'card_failed').length
  const comped = pro.filter((s) => s.status === 'comped').length
  const cancelled = subs.filter((s) => s.status === 'cancelled').length

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h1 className="pf-h" style={{ fontSize: 27 }}>Billing</h1>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Pro subscriptions across the directory.</p>
      </div>
      <div className="grid grid-cols-4 gap-[14px]">
        {[['Monthly recurring', `$${mrr}`, `${pro.filter((s) => s.status === 'active').length} churches on Pro`], ['Comped', comped, 'No card required'], ['Cancelled', cancelled, 'Content hidden, kept'], ['Payment failed', failed, failed ? 'Needs a retry' : 'None']].map(([label, value, note]) => (
          <div key={label} className="border flex flex-col gap-[7px]" style={{ borderColor: 'var(--color-divider)', padding: '16px 18px' }}>
            <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 26, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{note}</span>
          </div>
        ))}
      </div>
      <div className="border" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="grid gap-[14px] border-b" style={{ gridTemplateColumns: '1.4fr .8fr .8fr .8fr', padding: '11px 18px', borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}>
          {['Church', 'State', 'Since', 'Renews'].map((h) => <span key={h} style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{h}</span>)}
        </div>
        {pro.map((s) => (
          <div key={s.church_id} className="grid items-center gap-[14px] border-b" style={{ gridTemplateColumns: '1.4fr .8fr .8fr .8fr', padding: '13px 18px', borderColor: 'var(--color-divider)' }}>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{s.churches?.name}</span>
            <span style={{ fontSize: 12, color: s.status === 'card_failed' ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)', textTransform: 'capitalize' }}>{s.status.replace('_', ' ')}</span>
            <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{new Date(s.started_at).toLocaleDateString()}</span>
            <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{s.renews_at ? new Date(s.renews_at).toLocaleDateString() : 'No charge'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
