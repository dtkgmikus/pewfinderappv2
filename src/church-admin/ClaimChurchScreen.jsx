import { useEffect, useState } from 'react'
import { Building2, ShieldCheck, Mail, Phone, FileText, Upload, Clock } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { fetchChurches } from '../lib/churches.js'
import { GateHeader } from '../components/ui/GateHeader.jsx'
import { Mark, Wordmark } from '../components/ui/Logo.jsx'

const METHODS = [
  { key: 'domain_email', icon: Mail, label: 'Email from your church domain', detail: 'Send from an @yourchurch.org address and we confirm the domain matches.', speed: 'Usually instant' },
  { key: 'phone_call', icon: Phone, label: 'Phone call to your listed number', detail: 'We call the number on file for your church and ask for you by name.', speed: '1 business day' },
  { key: 'postcard', icon: FileText, label: 'Postcard to your building', detail: 'We mail a code to your church address. Enter it here once it arrives.', speed: '5-7 days' },
  { key: 'upload', icon: Upload, label: 'Upload proof', detail: 'A bulletin, 501(c)(3) letter, or utility bill with your church’s name and address.', speed: '1-2 business days' },
]

export function ClaimChurchScreen({ onClaimed }) {
  const { user, profile, signOut } = useAuth()
  const [churches, setChurches] = useState([])
  const [churchId, setChurchId] = useState('')
  const [email, setEmail] = useState(user?.email || '')
  const [method, setMethod] = useState('domain_email')
  const [pendingClaim, setPendingClaim] = useState(undefined) // undefined = loading

  useEffect(() => {
    fetchChurches().then((list) => setChurches(list.filter((c) => !c.claimed))).catch(console.error)
  }, [])

  useEffect(() => {
    supabase
      .from('church_claims')
      .select('*, churches(name)')
      .eq('claimant_profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPendingClaim(data || null))
  }, [user.id])

  if (pendingClaim === undefined) return null

  if (pendingClaim?.status === 'pending') {
    return (
      <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: 'var(--color-bg)' }}>
        <GateHeader onSignOut={signOut} />
        <div className="flex-1 flex items-center justify-center p-8" style={{ overflowY: 'auto' }}>
          <div className="max-w-[520px] flex flex-col gap-4 text-center items-center">
            <Clock size={26} strokeWidth={1.4} style={{ color: 'var(--color-accent-700)' }} />
            <h1 className="pf-h" style={{ fontSize: 24 }}>Claim submitted for {pendingClaim.churches?.name}</h1>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
              PewFinder staff review claims within a day or two. You&rsquo;ll get an email either way. Submitted via {pendingClaim.method.replace('_', ' ')}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const submit = async () => {
    if (!churchId) return
    const { error } = await supabase.from('church_claims').insert({
      church_id: churchId,
      claimant_profile_id: user.id,
      claimant_name: profile?.name || user.email,
      claimant_email: email,
      method,
    })
    if (!error) { setPendingClaim({ status: 'pending', method, churches: { name: churches.find((c) => c.id === churchId)?.name } }); onClaimed?.() }
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <GateHeader onSignOut={signOut} />
      <div className="flex-1 flex justify-center p-6" style={{ overflowY: 'auto' }}>
      <div className="w-full max-w-[1180px] grid grid-cols-2 border" style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}>
        <div className="p-[52px] flex flex-col border-r" style={{ borderColor: 'var(--color-divider)' }}>
          <div className="flex items-center gap-[10px]">
            <Mark size={14} tone="light" />
            <Wordmark size={20} tone="light" suffix="for churches" />
          </div>
          <h1 className="pf-h" style={{ fontSize: 38, lineHeight: 1.1, margin: '40px 0 0' }}>Claim your church&rsquo;s page</h1>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)', maxWidth: '44ch' }}>
            Claiming is free. You can reply to reviews, correct your service times, keep your programs current, and flag anything that breaks the review rules.
          </p>
          <div className="flex flex-col gap-[14px]" style={{ marginTop: 34 }}>
            <label className="flex flex-col gap-[6px]">
              <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Church</span>
              <div className="flex items-center gap-[10px] border" style={{ borderColor: 'var(--color-divider)', padding: '11px 13px', background: 'var(--color-bg)' }}>
                <Building2 size={15} strokeWidth={1.5} />
                <select value={churchId} onChange={(e) => setChurchId(e.target.value)} className="flex-1 bg-transparent" style={{ fontSize: 14, border: 0, outline: 'none' }}>
                  <option value="">Search for your church…</option>
                  {churches.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.street}, {c.town}</option>)}
                </select>
              </div>
            </label>
            <label className="flex flex-col gap-[6px]">
              <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Your work email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input" style={{ background: 'var(--color-bg)' }} />
            </label>
          </div>
          <button onClick={submit} disabled={!churchId} className="btn btn-primary-solid" style={{ marginTop: 26, padding: '13px 18px', fontSize: 14 }}>Continue</button>
        </div>

        <div className="p-[52px]" style={{ background: 'var(--color-bg)' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Step 2 · Prove it&rsquo;s your church</span>
          <p style={{ margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 66%,transparent)', maxWidth: '42ch' }}>Pick whichever is easiest. Most churches finish in a day.</p>
          <div className="flex flex-col gap-[10px]" style={{ marginTop: 24 }}>
            {METHODS.map((v) => {
              const on = method === v.key
              const Icon = v.icon
              return (
                <button
                  key={v.key}
                  onClick={() => setMethod(v.key)}
                  className="grid gap-[14px] items-start border text-left"
                  style={{ gridTemplateColumns: 'auto 1fr auto', borderColor: on ? 'var(--color-accent)' : 'var(--color-divider)', background: on ? 'color-mix(in srgb,var(--color-accent) 7%,transparent)' : 'var(--color-surface)', padding: '15px 16px' }}
                >
                  <span className="flex items-center justify-center border" style={{ width: 30, height: 30, borderColor: 'var(--color-divider)', background: 'var(--color-surface)', color: 'var(--color-accent-700)' }}><Icon size={15} strokeWidth={1.5} /></span>
                  <span className="flex flex-col gap-1">
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>{v.label}</span>
                    <span style={{ fontSize: 12.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>{v.detail}</span>
                    <span style={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{v.speed}</span>
                  </span>
                  <span className="rounded-full border flex items-center justify-center" style={{ width: 16, height: 16, borderColor: on ? 'var(--color-accent)' : 'var(--color-neutral-400)', marginTop: 3 }}>
                    {on && <span className="rounded-full" style={{ width: 8, height: 8, background: 'var(--color-accent)' }} />}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex gap-[10px] items-start border-t" style={{ marginTop: 26, paddingTop: 18, borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            <ShieldCheck size={15} strokeWidth={1.5} />
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>Claiming a page never lets you edit, hide, or delete a member&rsquo;s review. It lets you reply, and it lets you ask us to look at one.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
