import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'

export function PromosScreen() {
  const { profile } = useAuth()
  const [promos, setPromos] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [sendBackNote, setSendBackNote] = useState('')

  const load = () => {
    supabase.from('campaigns').select('*, churches(name)').order('created_at', { ascending: false }).then(({ data }) => {
      setPromos(data || [])
      if (!selectedId && data?.length) setSelectedId(data[0].id)
    })
  }
  useEffect(load, [])

  const selected = promos.find((p) => p.id === selectedId) || promos[0]

  const decide = async (status, note) => {
    await supabase.from('campaigns').update({ status, decision_note: note || null, decided_at: new Date().toISOString(), decided_by_profile_id: profile.id }).eq('id', selected.id)
    setSendBackNote('')
    load()
  }

  if (!selected) return <div><h1 className="pf-h" style={{ fontSize: 27 }}>Promotions</h1><p style={{ fontSize: 13 }}>Nothing submitted yet.</p></div>

  return (
    <div className="grid gap-[26px]" style={{ gridTemplateColumns: '1fr 380px' }}>
      <div className="flex flex-col gap-4 min-w-0">
        <div>
          <h1 className="pf-h" style={{ fontSize: 27 }}>Promotions</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Every paid campaign is read before it reaches a member&rsquo;s notifications.</p>
        </div>
        <div className="flex flex-col gap-[9px]">
          {promos.map((p) => (
            <button key={p.id} onClick={() => setSelectedId(p.id)} className="grid items-center gap-[14px] border text-left" style={{ gridTemplateColumns: '1fr 130px 104px', borderColor: 'var(--color-divider)', borderLeft: `2px solid ${selected.id === p.id ? 'var(--color-accent)' : 'transparent'}`, background: selected.id === p.id ? 'var(--color-bg)' : 'transparent', padding: '15px 17px' }}>
              <span className="flex flex-col gap-1 min-w-0">
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{p.title}</span>
                <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 56%,transparent)' }}>{p.churches?.name} · {p.radius_miles} mi</span>
              </span>
              <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>
                {[p.channel_pinned && 'Pinned', p.channel_push && 'Push', p.channel_feed && 'Feed'].filter(Boolean).join(' + ')}
              </span>
              <span className="text-center border" style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 8px', borderColor: p.status === 'waiting' ? 'var(--color-accent)' : 'var(--color-divider)', color: p.status === 'waiting' ? 'var(--color-accent-800)' : 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{p.status}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border flex flex-col" style={{ borderColor: 'var(--color-divider)', position: 'sticky', top: 20 }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
          <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>As a member will see it</span>
        </div>
        <div className="flex flex-col gap-4" style={{ padding: 18 }}>
          <div className="border" style={{ borderColor: 'var(--color-divider)' }}>
            <div style={{ padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <span style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>Event near you</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{selected.title}</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)' }}>{selected.blurb}</span>
              <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{selected.event_when} · {selected.cost}</span>
              <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{selected.churches?.name}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[['Reach', `${selected.reach_estimate.toLocaleString()} members`], ['Audience', selected.audience.join(', ') || 'Anyone'], ['Channels', [selected.channel_pinned && 'Pinned', selected.channel_push && 'Push', selected.channel_feed && 'Feed'].filter(Boolean).join(', ')], ['Submitted', selected.submitted_at ? new Date(selected.submitted_at).toLocaleString() : '—']].map(([label, value]) => (
              <span key={label} className="grid items-baseline" style={{ gridTemplateColumns: '96px 1fr', gap: 12, fontSize: 12.5 }}>
                <span style={{ color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{label}</span>
                <span style={{ color: 'color-mix(in srgb,var(--color-text) 78%,transparent)' }}>{value}</span>
              </span>
            ))}
          </div>
          {selected.status === 'waiting' && (
            <div className="flex flex-col gap-[9px] border-t" style={{ paddingTop: 14, borderColor: 'var(--color-divider)' }}>
              <button onClick={() => decide('approved')} className="border" style={{ background: 'var(--color-accent-700)', color: 'var(--color-surface)', borderColor: 'var(--color-accent-700)', padding: '11px 14px', fontSize: 13 }}>Approve and start the run</button>
              <textarea value={sendBackNote} onChange={(e) => setSendBackNote(e.target.value)} placeholder="Note for the church (optional)" className="input" style={{ fontSize: 12.5, minHeight: 60 }} />
              <button onClick={() => decide('sent_back', sendBackNote)} className="border" style={{ borderColor: 'var(--color-divider)', padding: '11px 14px', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 68%,transparent)' }}>Send back with a note</button>
              <span style={{ fontSize: 11.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Approving starts the run and charges nothing extra — promotion is included in the church&rsquo;s $50.</span>
            </div>
          )}
          {selected.status !== 'waiting' && (
            <p style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
              {selected.status === 'approved' ? 'Approved.' : `Sent back${selected.decision_note ? `: ${selected.decision_note}` : '.'}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
