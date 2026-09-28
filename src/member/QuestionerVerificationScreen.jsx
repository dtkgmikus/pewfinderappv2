import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'

function normalizePhone(value) {
  const raw = value.trim()
  const digits = raw.replace(/\D/g, '')
  if (raw.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

export function QuestionerVerificationScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [phone, setPhone] = useState(user?.phone || '')
  const [zipCode, setZipCode] = useState(/^\d{5}$/.test(user?.user_metadata?.home_town || '') ? user.user_metadata.home_town : '')
  const [adultConfirmed, setAdultConfirmed] = useState(user?.user_metadata?.adult_confirmed_18 === true)
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  if (!user) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center justify-center gap-4 text-center px-8" style={{ padding: '70px 28px' }}>
        <h1 className="pf-h" style={{ fontSize: 24 }}>Sign in to verify your account</h1>
        <button onClick={() => navigate('/churches/login')} className="btn btn-primary-solid" style={{ padding: '10px 18px' }}>Sign in</button>
      </div>
    )
  }

  const emailConfirmed = Boolean(user.email_confirmed_at || user.confirmed_at)

  const completeVerification = async () => {
    const { error: rpcError } = await supabase.rpc('complete_questioner_verification', {
      p_zip_code: zipCode.trim(),
      p_attest_18_plus: adultConfirmed,
    })
    if (rpcError) throw rpcError
    setComplete(true)
  }

  const sendCode = async () => {
    setError('')
    if (!emailConfirmed) {
      setError('Please confirm your email address first, then sign in here to verify your mobile number.')
      return
    }
    if (!adultConfirmed) {
      setError('You must confirm that you are at least 18 years old to use Get-God.')
      return
    }
    if (!/^\d{5}$/.test(zipCode.trim())) {
      setError('Enter a valid 5-digit ZIP code.')
      return
    }
    const e164 = normalizePhone(phone)
    if (!e164) {
      setError('Enter a valid mobile number, including the country code if outside the US.')
      return
    }

    setBusy(true)
    try {
      if (user.phone === e164 && user.phone_confirmed_at) {
        await completeVerification()
        return
      }
      const { error: updateError } = await supabase.auth.updateUser({ phone: e164 })
      if (updateError) throw updateError
      setPhone(e164)
      setCodeSent(true)
    } catch (e) {
      setError(e?.message || 'We could not send a verification code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async () => {
    setError('')
    const e164 = normalizePhone(phone)
    if (!e164 || !/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code sent to your mobile number.')
      return
    }
    setBusy(true)
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ phone: e164, token: code.trim(), type: 'phone_change' })
      if (verifyError) throw verifyError
      await completeVerification()
    } catch (e) {
      setError(e?.message || 'We could not verify that code. Check it and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (complete) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center gap-4 text-center" style={{ padding: '72px 28px' }}>
        <ShieldCheck size={34} strokeWidth={1.3} style={{ color: 'var(--color-accent-2-600)' }} />
        <h1 className="pf-h" style={{ fontSize: 25 }}>You&rsquo;re verified</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
          Your email and mobile are verified, and your 18+ confirmation is recorded. You can now post questions.
        </p>
        <button onClick={() => navigate('/ask')} className="btn btn-primary-solid" style={{ padding: '10px 18px' }}>Return to your question</button>
      </div>
    )
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 18px' }}>
      <div className="flex items-center gap-[10px] border-b px-4" style={{ paddingTop: 20, paddingBottom: 12, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center justify-center" style={{ width: 32, height: 32 }}><ChevronLeft size={18} strokeWidth={1.7} /></button>
        <h1 className="pf-h flex-1" style={{ fontSize: 17, margin: 0 }}>Verify your account</h1>
      </div>
      <div className="px-5" style={{ paddingTop: 22 }}>
        <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 65%,transparent)' }}>
          To keep question posting safe, Get-God requires a confirmed email, a verified mobile number, and confirmation that you are at least 18.
        </p>
        <label className="flex flex-col gap-[6px]" style={{ marginBottom: 15 }}>
          <span style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Mobile number</span>
          <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(609) 555-0123" className="input" />
        </label>
        <label className="flex flex-col gap-[6px]" style={{ marginBottom: 15 }}>
          <span style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>ZIP code</span>
          <input inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="08234" className="input" />
        </label>
        <label className="flex items-start gap-3 border rounded-[var(--radius-md)]" style={{ padding: '13px 14px', borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}>
          <input type="checkbox" checked={adultConfirmed} onChange={(e) => setAdultConfirmed(e.target.checked)} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 13, lineHeight: 1.55 }}>I confirm that I am 18 years of age or older.</span>
        </label>
        {codeSent && (
          <label className="flex flex-col gap-[6px]" style={{ marginTop: 15 }}>
            <span style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Text message code</span>
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" className="input" />
          </label>
        )}
        {error && <p role="alert" style={{ margin: '14px 0 0', color: 'var(--color-accent-700)', fontSize: 13.5, lineHeight: 1.5 }}>{error}</p>}
        <button onClick={codeSent ? verifyCode : sendCode} disabled={busy} className="btn btn-primary-solid" style={{ width: '100%', padding: 13, marginTop: 18 }}>
          {busy ? 'Please wait…' : codeSent ? 'Verify mobile number' : 'Text me a verification code'}
        </button>
        {codeSent && <button onClick={() => { setCodeSent(false); setCode('') }} style={{ display: 'block', margin: '12px auto 0', fontSize: 13, color: 'var(--color-accent-2-700)' }}>Use a different number</button>}
      </div>
    </div>
  )
}
