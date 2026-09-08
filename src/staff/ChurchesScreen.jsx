import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { Chip } from '../components/ui/Chip.jsx'

const FILTERS = ['All', 'Claimed', 'Unclaimed', 'Suspended']

export function ChurchesScreen() {
  const { staffRole } = useAuth()
  const isAdmin = staffRole === 'admin'
  const [churches, setChurches] = useState([])
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [staffByChurch, setStaffByChurch] = useState({})
  const [actedMsg, setActedMsg] = useState('')

  const load = () => {
    supabase.from('churches').select('*').order('name').then(({ data }) => {
      setChurches(data || [])
      if (!selectedId && data?.length) setSelectedId(data[0].id)
    })
  }
  useEffect(load, [])

  const selected = churches.find((c) => c.id === selectedId) || churches[0]

  useEffect(() => {
    if (!selected) return
    supabase.from('church_staff').select('role, profiles(name)').eq('church_id', selected.id).then(({ data }) => setStaffByChurch((s) => ({ ...s, [selected.id]: data || [] })))
    setActedMsg('')
  }, [selected?.id])

  const filtered = useMemo(() => {
    if (filter === 'All') return churches
    if (filter === 'Claimed') return churches.filter((c) => c.claimed && c.status === 'active')
    if (filter === 'Unclaimed') return churches.filter((c) => !c.claimed)
    if (filter === 'Suspended') return churches.filter((c) => c.status === 'suspended')
    return churches
  }, [churches, filter])

  const act = async (fn, msg, needsAdmin) => {
    if (needsAdmin && !isAdmin) { setActedMsg('Admins only. Ask an admin to run this one.'); return }
    await fn()
    setActedMsg(msg)
    load()
  }

  if (!selected) return null

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <h1 className="pf-h" style={{ fontSize: 27 }}>Churches</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{churches.length} listings · {churches.filter((c) => c.claimed).length} claimed · {churches.filter((c) => c.plan === 'pro').length} on Pro</p>
        </div>
        <div className="flex gap-[7px] flex-wrap">{FILTERS.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}</div>
      </div>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: '1fr 372px' }}>
        <div className="border min-w-0" style={{ borderColor: 'var(--color-divider)' }}>
          <div className="grid gap-[12px] border-b" style={{ gridTemplateColumns: '1.5fr .9fr .7fr .7fr', padding: '11px 16px', borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}>
            {['Listing', 'Status', 'Plan', 'Reviews'].map((h) => <span key={h} style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{h}</span>)}
          </div>
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className="grid items-center gap-[12px] border-b w-full text-left" style={{ gridTemplateColumns: '1.5fr .9fr .7fr .7fr', padding: '12px 16px', borderColor: 'var(--color-divider)', background: selected.id === c.id ? 'var(--color-bg)' : 'transparent', borderLeft: `2px solid ${selected.id === c.id ? 'var(--color-accent)' : 'transparent'}` }}>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{c.town}</span>
              </span>
              <span style={{ fontSize: 11.5, color: c.status === 'suspended' ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>{c.status === 'suspended' ? 'Suspended' : c.claimed ? 'Claimed' : 'Unclaimed'}</span>
              <span style={{ fontSize: 11.5, color: c.plan === 'pro' ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{c.plan === 'pro' ? 'Pro' : '—'}</span>
              <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{c.review_count || '—'}</span>
            </button>
          ))}
        </div>

        <div className="border flex flex-col" style={{ borderColor: 'var(--color-divider)', position: 'sticky', top: 20 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>{selected.name}</div>
            <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)', marginTop: 4 }}>{selected.town} · {selected.claimed ? 'Claimed' : 'Unclaimed'}{selected.plan === 'pro' ? ' · Pro' : ''}</div>
          </div>
          <div className="flex flex-col gap-4" style={{ padding: '18px 20px' }}>
            <div className="flex flex-col gap-2">
              {[
                ['Listing status', selected.status],
                ['Plan', selected.plan === 'pro' ? 'Pro' : 'No plan'],
                ['Reviews', selected.review_count ? `${selected.review_count} · ${selected.avg_rating.toFixed(1)} average` : 'None yet'],
                ['Verified', selected.verified ? `${selected.verification_method?.replace('_', ' ')}` : 'Not verified'],
              ].map(([label, value]) => (
                <span key={label} className="grid items-baseline" style={{ gridTemplateColumns: '112px 1fr', gap: 12, fontSize: 12.5 }}>
                  <span style={{ color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{label}</span>
                  <span style={{ color: 'color-mix(in srgb,var(--color-text) 78%,transparent)', textTransform: 'capitalize' }}>{value}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t" style={{ paddingTop: 14, borderColor: 'var(--color-divider)' }}>
              <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Staff on this page</span>
              {(staffByChurch[selected.id] || []).map((s, i) => (
                <span key={i} className="grid items-baseline" style={{ gridTemplateColumns: '1fr auto', gap: 10, fontSize: 12.5 }}>
                  <span className="truncate">{s.profiles?.name}</span>
                  <span style={{ color: 'color-mix(in srgb,var(--color-text) 52%,transparent)', textTransform: 'capitalize' }}>{s.role}</span>
                </span>
              ))}
              {(staffByChurch[selected.id] || []).length === 0 && <span style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Nobody has access</span>}
            </div>
            <div className="flex flex-col gap-[7px] border-t" style={{ paddingTop: 14, borderColor: 'var(--color-divider)' }}>
              <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Account actions</span>
              <ActionBtn label="Force re-verification" onClick={() => act(() => supabase.from('churches').update({ verified: false }).eq('id', selected.id), 'Re-verification requested.')} />
              <ActionBtn label={selected.plan === 'pro' ? 'Cancel Pro for this church' : 'Comp Pro for this church'} needsAdmin isAdmin={isAdmin}
                onClick={() => act(async () => {
                  const plan = selected.plan === 'pro' ? 'free' : 'pro'
                  await supabase.from('churches').update({ plan }).eq('id', selected.id)
                  await supabase.from('subscriptions').upsert({ church_id: selected.id, plan, status: plan === 'pro' ? 'comped' : 'active' })
                }, selected.plan === 'pro' ? 'Pro cancelled.' : 'Pro comped.', true)} />
              <ActionBtn label={selected.status === 'suspended' ? 'Restore this listing' : 'Suspend this listing'} needsAdmin isAdmin={isAdmin}
                onClick={() => act(() => supabase.from('churches').update({ status: selected.status === 'suspended' ? 'active' : 'suspended' }).eq('id', selected.id), selected.status === 'suspended' ? 'Listing restored.' : 'Listing suspended. Reviews are preserved.', true)} />
              {actedMsg && <span style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--color-accent-800)' }}>{actedMsg}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ label, onClick, needsAdmin, isAdmin }) {
  const disabled = needsAdmin && !isAdmin
  return (
    <button onClick={onClick} className="grid items-center gap-[10px] border" style={{ gridTemplateColumns: '1fr', borderColor: disabled ? 'var(--color-divider)' : 'var(--color-accent)', padding: '10px 12px', color: disabled ? 'color-mix(in srgb,var(--color-text) 45%,transparent)' : 'var(--color-accent-800)' }}>
      <span style={{ fontSize: 12.5 }}>{label}</span>
    </button>
  )
}
