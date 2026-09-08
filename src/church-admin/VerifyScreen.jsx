import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'

export function VerifyScreen() {
  const { church, role, refresh } = useAdmin()
  const [busy, setBusy] = useState(false)

  const requestReverify = async () => {
    setBusy(true)
    await supabase.from('churches').update({ verified: false }).eq('id', church.id)
    setBusy(false)
    refresh()
  }

  return (
    <div className="flex flex-col gap-5 max-w-[720px]">
      <h2 className="pf-h" style={{ fontSize: 24 }}>Verification</h2>
      <div className="grid gap-4 items-start border" style={{ gridTemplateColumns: 'auto 1fr', borderColor: 'var(--color-divider)', padding: '20px 22px', background: 'var(--color-bg)' }}>
        <ShieldCheck size={20} strokeWidth={1.5} style={{ color: 'var(--color-accent-700)', marginTop: 2 }} />
        <span className="flex flex-col gap-[6px]">
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{church.verified ? `Verified via ${church.verification_method?.replace('_', ' ')}` : 'Not currently verified'}</span>
          <span style={{ fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
            {church.verified ? `Confirmed ${new Date(church.verified_at).toLocaleDateString()}.` : 'Contact PewFinder staff to complete verification.'} Members see a plain &ldquo;Verified&rdquo; mark on your page — the same one every claimed church gets, whether or not they pay.
          </span>
        </span>
      </div>
      <div className="flex flex-col gap-3 border" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
        <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Transferring the page</span>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 68%,transparent)' }}>
          If the pastor or office administrator changes, the current Owner should add the new person in Team and hand over ownership. If nobody has access any more, contact PewFinder staff to re-verify.
        </p>
        {role === 'owner' && (
          <button onClick={requestReverify} disabled={busy} className="border self-start" style={{ borderColor: 'var(--color-divider)', padding: '10px 15px', fontSize: 12.5 }}>
            {busy ? 'Requesting…' : 'Request re-verification'}
          </button>
        )}
      </div>
    </div>
  )
}
