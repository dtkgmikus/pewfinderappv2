import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flag, ShieldCheck, Megaphone } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

export function QueueScreen() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState({ flags: 0, claims: 0, promos: 0, pro: 0 })
  const [flags, setFlags] = useState([])
  const [claims, setClaims] = useState([])
  const [promos, setPromos] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('review_flags').select('*, reviews(church_id, churches(name))').eq('status', 'open').order('created_at'),
      supabase.from('church_claims').select('*, churches(name)').eq('status', 'pending').order('created_at'),
      supabase.from('campaigns').select('*, churches(name)').eq('status', 'waiting').order('submitted_at'),
      supabase.from('subscriptions').select('church_id', { count: 'exact', head: true }).eq('plan', 'pro'),
    ]).then(([f, c, p, pro]) => {
      setFlags(f.data || []); setClaims(c.data || []); setPromos(p.data || [])
      setKpis({ flags: f.data?.length || 0, claims: c.data?.length || 0, promos: p.data?.length || 0, pro: pro.count || 0 })
    })
  }, [])

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h1 className="pf-h" style={{ fontSize: 27 }}>Queue</h1>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Everything waiting on a decision, in order.</p>
      </div>

      <div className="grid grid-cols-4 gap-[14px]">
        {[['Flags open', kpis.flags], ['Claims to check', kpis.claims], ['Promotions waiting', kpis.promos], ['Pro subscriptions', kpis.pro]].map(([label, value]) => (
          <div key={label} className="border flex flex-col gap-[7px]" style={{ borderColor: 'var(--color-divider)', padding: '16px 18px' }}>
            <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 27, lineHeight: 1 }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[10px]">
        {flags.map((f) => (
          <QueueRow key={`f-${f.id}`} icon={Flag} title={`${f.reviews?.churches?.name} disputes a review`} sub={f.reason} age={ago(f.created_at)} tag="Flag" onClick={() => navigate('/staff/flags')} />
        ))}
        {claims.map((c) => (
          <QueueRow key={`c-${c.id}`} icon={ShieldCheck} title={`${c.churches?.name} submitted a claim`} sub={`${c.claimant_name} · ${c.method.replace('_', ' ')}`} age={ago(c.created_at)} tag="Claim" onClick={() => navigate('/staff/claims')} />
        ))}
        {promos.map((p) => (
          <QueueRow key={`p-${p.id}`} icon={Megaphone} title={p.title} sub={`${p.churches?.name} · ${p.reach_estimate.toLocaleString()} reach`} age={ago(p.submitted_at)} tag="Promotion" onClick={() => navigate('/staff/promos')} />
        ))}
        {flags.length + claims.length + promos.length === 0 && <p style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Queue is clear.</p>}
      </div>
    </div>
  )
}

function QueueRow({ icon: Icon, title, sub, age, tag, onClick }) {
  return (
    <button onClick={onClick} className="grid items-center gap-[16px] border text-left" style={{ gridTemplateColumns: '32px 1fr 100px 116px', borderColor: 'var(--color-divider)', padding: '15px 18px', background: 'var(--color-bg)' }}>
      <span className="border flex items-center justify-center" style={{ width: 32, height: 32, borderColor: 'var(--color-divider)', background: 'var(--color-surface)', color: 'var(--color-accent-700)' }}><Icon size={15} strokeWidth={1.6} /></span>
      <span className="flex flex-col gap-1 min-w-0">
        <span style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</span>
        <span className="truncate" style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>{sub}</span>
      </span>
      <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{age}</span>
      <span className="text-center border" style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 8px', borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{tag}</span>
    </button>
  )
}

function ago(iso) {
  if (!iso) return ''
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days < 1) return 'today'
  if (days === 1) return '1 day'
  return `${days} days`
}
