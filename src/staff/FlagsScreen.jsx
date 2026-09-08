import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { Chip } from '../components/ui/Chip.jsx'

const OUTCOMES = [
  { key: 'keep', label: 'Keep it up', detail: 'It does not break a rule. The church keeps its public reply.' },
  { key: 'remove', label: 'Remove the review', detail: 'Comes down for everyone and stops counting toward the average.' },
  { key: 'edit', label: 'Remove the naming only', detail: 'Strips the named individual and leaves the rest standing.' },
  { key: 'strike', label: 'Remove and strike the account', detail: 'For fakes and repeat offenders. Second strike restricts reviewing.' },
]
const FILTERS = ['Open', 'From churches', 'From members', 'Decided']

export function FlagsScreen() {
  const { profile } = useAuth()
  const [flags, setFlags] = useState([])
  const [filter, setFilter] = useState('Open')
  const [selectedId, setSelectedId] = useState(null)
  const [outcome, setOutcome] = useState('')
  const [note, setNote] = useState('')

  const load = () => {
    supabase
      .from('review_flags')
      .select('*, reviews(*, churches(name)), churches!flagged_by_church_id(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFlags(data || [])
        if (!selectedId && data?.length) setSelectedId(data[0].id)
      })
  }
  useEffect(load, [])

  const filtered = flags.filter((f) => {
    if (filter === 'Open') return f.status === 'open'
    if (filter === 'From churches') return f.flagged_by_type === 'church'
    if (filter === 'From members') return f.flagged_by_type === 'member'
    if (filter === 'Decided') return f.status === 'decided'
    return true
  })
  const selected = flags.find((f) => f.id === selectedId) || filtered[0]

  const decide = async () => {
    if (!outcome || !selected) return
    await supabase.from('review_flags').update({
      status: 'decided', outcome, decision_note: note, decided_by_profile_id: profile.id, decided_at: new Date().toISOString(),
    }).eq('id', selected.id)

    if (outcome === 'remove' || outcome === 'strike') {
      await supabase.from('reviews').update({ status: 'removed' }).eq('id', selected.review_id)
    }
    if (outcome === 'strike' && selected.reviews?.member_id) {
      await supabase.from('profiles').update({ restricted: true }).eq('id', selected.reviews.member_id)
    }
    setOutcome(''); setNote('')
    load()
  }

  if (!selected) return <div className="flex flex-col gap-4"><h1 className="pf-h" style={{ fontSize: 27 }}>Flagged reviews</h1><p style={{ fontSize: 13 }}>Nothing flagged.</p></div>

  return (
    <div className="grid gap-[26px]" style={{ gridTemplateColumns: '1fr 400px' }}>
      <div className="flex flex-col gap-4 min-w-0">
        <div>
          <h1 className="pf-h" style={{ fontSize: 27 }}>Flagged reviews</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Reviews stay public while you decide. Every decision emails both sides.</p>
        </div>
        <div className="flex gap-[7px] flex-wrap">{FILTERS.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}</div>
        <div className="flex flex-col gap-[9px]">
          {filtered.map((f) => (
            <button key={f.id} onClick={() => { setSelectedId(f.id); setOutcome(''); setNote('') }} className="border text-left flex flex-col gap-[8px]" style={{ borderColor: 'var(--color-divider)', borderLeft: `2px solid ${selected.id === f.id ? 'var(--color-accent)' : 'transparent'}`, background: selected.id === f.id ? 'var(--color-bg)' : 'transparent', padding: '15px 17px' }}>
              <span className="flex items-center gap-[10px] flex-wrap">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{f.reviews?.churches?.name}</span>
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{f.reviews?.author_display_name} · {'★'.repeat(f.reviews?.overall_rating || 0)}</span>
                <span className="flex-1" />
                <span className="border" style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', padding: '3px 7px', borderColor: 'var(--color-divider)' }}>{f.reason}</span>
              </span>
              <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>{f.reviews?.well_text?.slice(0, 140)}</span>
              <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)' }}>{f.status === 'decided' ? `Decided — ${f.outcome}` : 'Public while under review'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border flex flex-col" style={{ borderColor: 'var(--color-divider)', position: 'sticky', top: 20 }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
          <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Decision</span>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, marginTop: 6 }}>{selected.reviews?.churches?.name}</div>
          <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)', marginTop: 3 }}>{selected.reviews?.author_display_name} · {'★'.repeat(selected.reviews?.overall_rating || 0)} · visited {selected.reviews?.visited_on}</div>
        </div>
        <div className="flex flex-col gap-4" style={{ padding: '18px 20px' }}>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>{selected.reviews?.well_text}</p>

          <div className="flex flex-col gap-2 border-t" style={{ paddingTop: 14, borderColor: 'var(--color-divider)' }}>
            <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Flagged by</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)' }}>{selected.flagged_by_type === 'church' ? selected.churches?.name : 'A member'}</span>
            {selected.note && <span style={{ fontSize: 12.5, lineHeight: 1.6, fontStyle: 'italic', color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>&ldquo;{selected.note}&rdquo;</span>}
          </div>

          {selected.status !== 'decided' && (
            <div className="flex flex-col gap-[9px] border-t" style={{ paddingTop: 14, borderColor: 'var(--color-divider)' }}>
              <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Outcome</span>
              {OUTCOMES.map((o) => (
                <button key={o.key} onClick={() => setOutcome(o.key)} className="grid gap-[11px] items-start border text-left" style={{ gridTemplateColumns: '16px 1fr', borderColor: outcome === o.key ? 'var(--color-accent)' : 'var(--color-divider)', background: outcome === o.key ? 'color-mix(in srgb,var(--color-accent) 7%,transparent)' : 'var(--color-bg)', padding: '11px 12px' }}>
                  <span className="rounded-full border flex items-center justify-center" style={{ width: 15, height: 15, borderColor: outcome === o.key ? 'var(--color-accent)' : 'var(--color-neutral-400)', marginTop: 2 }}>
                    {outcome === o.key && <span className="rounded-full" style={{ width: 7, height: 7, background: 'var(--color-accent)' }} />}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{o.label}</span>
                    <span style={{ fontSize: 11.5, lineHeight: 1.5, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>{o.detail}</span>
                  </span>
                </button>
              ))}
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to file. The first sentence is what both sides receive." className="input" style={{ minHeight: 82, fontSize: 12.5 }} />
              <button onClick={decide} disabled={!outcome} className="border" style={{ background: outcome ? 'var(--color-accent-700)' : 'transparent', color: outcome ? 'var(--color-surface)' : 'color-mix(in srgb,var(--color-text) 45%,transparent)', borderColor: 'var(--color-accent-700)', padding: '11px 14px', fontSize: 13 }}>
                {outcome ? 'Record decision and notify both sides' : 'Pick an outcome'}
              </button>
            </div>
          )}
          {selected.status === 'decided' && (
            <p style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--color-accent-800)' }}>Recorded {selected.outcome}. {selected.decision_note}</p>
          )}
        </div>
      </div>
    </div>
  )
}
