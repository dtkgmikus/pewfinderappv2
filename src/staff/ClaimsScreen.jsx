import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'

export function ClaimsScreen() {
  const { profile } = useAuth()
  const [claims, setClaims] = useState([])

  const load = () => {
    supabase.from('church_claims').select('*, churches(name, town)').order('created_at', { ascending: false }).then(({ data }) => setClaims(data || []))
  }
  useEffect(load, [])

  const decide = async (claim, status) => {
    await supabase.from('church_claims').update({ status, decided_at: new Date().toISOString(), decided_by_profile_id: profile.id }).eq('id', claim.id)
    if (status === 'approved') {
      await supabase.from('churches').update({ claimed: true, verified: true, verification_method: claim.method, verified_at: new Date().toISOString() }).eq('id', claim.church_id)
      await supabase.from('church_staff').insert({ church_id: claim.church_id, profile_id: claim.claimant_profile_id, role: 'owner' })
      await supabase.from('subscriptions').upsert({ church_id: claim.church_id, plan: 'free', status: 'active' })
    }
    load()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="pf-h" style={{ fontSize: 27 }}>Claims &amp; verification</h1>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Domain and phone checks clear themselves. Postcards and uploads land here.</p>
      </div>
      <div className="border" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="grid gap-[14px] border-b" style={{ gridTemplateColumns: '1.4fr 1fr 1fr .9fr 190px', padding: '11px 18px', borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}>
          {['Church', 'Claimed by', 'Method', 'Waiting', ''].map((h) => (
            <span key={h} style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{h}</span>
          ))}
        </div>
        {claims.map((c) => (
          <div key={c.id} className="grid items-center gap-[14px] border-b" style={{ gridTemplateColumns: '1.4fr 1fr 1fr .9fr 190px', padding: '14px 18px', borderColor: 'var(--color-divider)' }}>
            <span className="flex flex-col gap-1 min-w-0">
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.churches?.name}</span>
              <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{c.churches?.town}</span>
            </span>
            <span className="flex flex-col gap-1 min-w-0">
              <span style={{ fontSize: 12.5 }}>{c.claimant_name}</span>
              <span className="truncate" style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{c.claimant_email}</span>
            </span>
            <span style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 68%,transparent)', textTransform: 'capitalize' }}>{c.method.replace('_', ' ')}</span>
            <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
            <span className="flex gap-[7px] items-center justify-end">
              {c.status === 'pending' ? (
                <>
                  <button onClick={() => decide(c, 'approved')} className="border" style={{ fontSize: 12, padding: '7px 12px', borderColor: 'var(--color-accent-700)', color: 'var(--color-accent-800)' }}>Approve</button>
                  <button onClick={() => decide(c, 'declined')} className="border" style={{ fontSize: 12, padding: '7px 12px', borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>Decline</button>
                </>
              ) : (
                <span className="border" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 8px', borderColor: c.status === 'approved' ? 'var(--color-accent)' : 'var(--color-divider)', color: c.status === 'approved' ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{c.status}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
