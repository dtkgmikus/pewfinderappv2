import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { avatarColor, initialsOf } from '../data/constants.js'

const ROLES = [
  { key: 'owner', label: 'Owner', can: 'Everything — profile, billing, team, transfer ownership.' },
  { key: 'editor', label: 'Editor', can: 'Edit the profile, programs, sermon notes, and promotions.' },
  { key: 'responder', label: 'Responder', can: 'Reply to reviews and flag ones that break the rules.' },
  { key: 'viewer', label: 'Viewer', can: 'Read-only — dashboard and insights, no edits.' },
]

export function TeamScreen() {
  const { church, role } = useAdmin()
  const [team, setTeam] = useState([])
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('responder')
  const [error, setError] = useState('')

  const load = () => supabase.from('church_staff').select('*, profiles(name, email)').eq('church_id', church.id).then(({ data }) => setTeam(data || []))
  useEffect(() => { load() }, [church])

  const canManage = role === 'owner'

  const invite = async () => {
    setError('')
    if (!email.trim()) return
    const { data: profileId, error: rpcError } = await supabase.rpc('find_profile_id_by_email', { lookup_email: email.trim() })
    if (rpcError) { setError(rpcError.message); return }
    if (!profileId) {
      setError('No Get-God account with that email yet — ask them to sign up first, then invite them.')
      return
    }
    const { error: err } = await supabase.from('church_staff').insert({ church_id: church.id, profile_id: profileId, role: inviteRole })
    if (err) setError(err.message)
    else { setEmail(''); load() }
  }

  return (
    <div className="flex flex-col gap-[22px] max-w-[820px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Team</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Four roles. Give people the least they need.</p>
      </div>
      <div className="flex flex-col gap-2">
        {team.map((m) => (
          <div key={m.profile_id} className="grid items-center gap-[14px] border" style={{ gridTemplateColumns: '34px 1fr 150px', borderColor: 'var(--color-divider)', padding: '13px 15px', background: 'var(--color-bg)' }}>
            <span className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: avatarColor(initialsOf(m.profiles?.name)), fontSize: 11.5, color: 'var(--color-surface)' }}>{initialsOf(m.profiles?.name)}</span>
            <span className="flex flex-col gap-1">
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{m.profiles?.name}</span>
              <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{m.profiles?.email}</span>
            </span>
            <span className="border text-center" style={{ fontSize: 12.5, padding: '4px 9px', borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 68%,transparent)', textTransform: 'capitalize' }}>{m.role}</span>
          </div>
        ))}
      </div>

      {canManage && (
        <div className="flex flex-col gap-3 border" style={{ borderColor: 'var(--color-divider)', padding: '18px 20px', background: 'var(--color-bg)' }}>
          <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Invite someone</span>
          <div className="flex gap-2 flex-wrap items-center">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="their@email.com" className="input flex-1" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="input" style={{ width: 140 }}>
              {ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <button onClick={invite} className="border" style={{ borderColor: 'var(--color-accent-700)', color: 'var(--color-accent-800)', padding: '10px 15px', fontSize: 13 }}>Invite</button>
          </div>
          {error && <p style={{ margin: 0, fontSize: 12, color: 'var(--color-accent-700)' }}>{error}</p>}
        </div>
      )}

      <div className="border" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
        <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>What each role can do</span>
        <div className="flex flex-col gap-[11px]" style={{ marginTop: 14 }}>
          {ROLES.map((r) => (
            <span key={r.key} className="grid items-baseline" style={{ gridTemplateColumns: '104px 1fr', gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{r.can}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
