import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { Chip } from '../components/ui/Chip.jsx'
import { avatarColor, initialsOf } from '../data/constants.js'

const FILTERS = ['All', 'Restricted', 'Suspended']

export function MembersScreen() {
  const { staffRole } = useAuth()
  const isAdmin = staffRole === 'admin'
  const [members, setMembers] = useState([])
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [actedMsg, setActedMsg] = useState('')

  const load = () => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setMembers(data || [])
      if (!selectedId && data?.length) setSelectedId(data[0].id)
    })
  }
  useEffect(load, [])

  const selected = members.find((m) => m.id === selectedId) || members[0]

  const filtered = useMemo(() => {
    if (filter === 'Restricted') return members.filter((m) => m.restricted)
    if (filter === 'Suspended') return members.filter((m) => m.suspended)
    return members
  }, [members, filter])

  const act = async (fn, msg, needsAdmin) => {
    if (needsAdmin && !isAdmin) { setActedMsg('Admins only. Ask an admin to run this one.'); return }
    await fn()
    setActedMsg(msg)
    load()
  }

  if (!selected) return <div><h1 className="pf-h" style={{ fontSize: 27 }}>Members</h1><p style={{ fontSize: 13 }}>No members yet.</p></div>

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <h1 className="pf-h" style={{ fontSize: 27 }}>Members</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{members.length} members</p>
        </div>
        <div className="flex gap-[7px] flex-wrap">{FILTERS.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}</div>
      </div>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: '1fr 372px' }}>
        <div className="border min-w-0" style={{ borderColor: 'var(--color-divider)' }}>
          <div className="grid gap-[12px] border-b" style={{ gridTemplateColumns: '1.4fr .8fr .8fr', padding: '11px 16px', borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}>
            {['Member', 'Status', 'Joined'].map((h) => <span key={h} style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{h}</span>)}
          </div>
          {filtered.map((m) => {
            const initials = initialsOf(m.name)
            const state = m.suspended ? 'Suspended' : m.restricted ? 'Restricted' : 'Active'
            return (
              <button key={m.id} onClick={() => setSelectedId(m.id)} className="grid items-center gap-[12px] border-b w-full text-left" style={{ gridTemplateColumns: '1.4fr .8fr .8fr', padding: '12px 16px', borderColor: 'var(--color-divider)', background: selected.id === m.id ? 'var(--color-bg)' : 'transparent', borderLeft: `2px solid ${selected.id === m.id ? 'var(--color-accent)' : 'transparent'}` }}>
                <span className="flex items-center gap-[10px] min-w-0">
                  <span className="rounded-full flex-none flex items-center justify-center" style={{ width: 26, height: 26, background: avatarColor(initials), fontSize: 10.5, color: 'var(--color-surface)' }}>{initials}</span>
                  <span className="flex flex-col gap-[2px] min-w-0">
                    <span className="truncate" style={{ fontSize: 12.5, fontWeight: 500 }}>{m.name}</span>
                    <span className="truncate" style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)' }}>{m.home_town}</span>
                  </span>
                </span>
                <span style={{ fontSize: 11.5, color: state === 'Active' ? 'color-mix(in srgb,var(--color-text) 72%,transparent)' : 'var(--color-accent-700)' }}>{state}</span>
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{new Date(m.created_at).toLocaleDateString()}</span>
              </button>
            )
          })}
        </div>

        <div className="border flex flex-col" style={{ borderColor: 'var(--color-divider)', position: 'sticky', top: 20 }}>
          <div className="flex items-center gap-3" style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
            <span className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: avatarColor(initialsOf(selected.name)), fontSize: 12, color: 'var(--color-surface)' }}>{initialsOf(selected.name)}</span>
            <span className="flex flex-col gap-1 min-w-0">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{selected.name}</span>
              <span className="truncate" style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{selected.email}</span>
            </span>
          </div>
          <div className="flex flex-col gap-4" style={{ padding: '18px 20px' }}>
            <div className="flex flex-col gap-2">
              {[
                ['Status', selected.suspended ? 'Suspended' : selected.restricted ? 'Restricted' : 'Active'],
                ['Home town', selected.home_town || '—'],
                ['Joined', new Date(selected.created_at).toLocaleDateString()],
                ['Seeking status', selected.seeking_status || '—'],
                ['Priorities', (selected.priorities || []).join(', ') || '—'],
              ].map(([label, value]) => (
                <span key={label} className="grid items-baseline" style={{ gridTemplateColumns: '118px 1fr', gap: 12, fontSize: 12.5 }}>
                  <span style={{ color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{label}</span>
                  <span style={{ color: 'color-mix(in srgb,var(--color-text) 78%,transparent)' }}>{value}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-[7px] border-t" style={{ paddingTop: 14, borderColor: 'var(--color-divider)' }}>
              <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Account actions</span>
              <ActionBtn label="Send a warning" onClick={() => act(async () => {}, 'Warning noted (no messaging backend wired up yet).')} />
              <ActionBtn label={selected.restricted ? 'Lift restriction' : 'Restrict from reviewing'} needsAdmin isAdmin={isAdmin}
                onClick={() => act(() => supabase.from('profiles').update({ restricted: !selected.restricted }).eq('id', selected.id), selected.restricted ? 'Restriction lifted.' : 'Restricted. They keep the app but cannot post.', true)} />
              <ActionBtn label={selected.suspended ? 'Unsuspend the account' : 'Suspend the account'} needsAdmin isAdmin={isAdmin}
                onClick={() => act(() => supabase.from('profiles').update({ suspended: !selected.suspended }).eq('id', selected.id), selected.suspended ? 'Account unsuspended.' : 'Account suspended. Reviews stay up unless removed individually.', true)} />
              {actedMsg && <span style={{ fontSize: 11.5, lineHeight: 1.55, color: 'var(--color-accent-800)' }}>{actedMsg}</span>}
              <span style={{ fontSize: 11, lineHeight: 1.5, color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>
                {isAdmin ? 'Every action here is written to the audit log with your name against it.' : 'Restrict and suspend are admin-only. Warnings are yours to use.'}
              </span>
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
    <button onClick={onClick} className="border" style={{ borderColor: disabled ? 'var(--color-divider)' : 'var(--color-accent)', padding: '10px 12px', color: disabled ? 'color-mix(in srgb,var(--color-text) 45%,transparent)' : 'var(--color-accent-800)', fontSize: 12.5, textAlign: 'left' }}>
      {label}
    </button>
  )
}
