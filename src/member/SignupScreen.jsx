import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { SIGNUP_GROUPS } from '../data/constants.js'

export function SignupScreen() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [homeTown, setHomeTown] = useState('')
  const [answers, setAnswers] = useState({})
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)

  const toggle = (groupName, option, multi) => {
    setAnswers((prev) => {
      const cur = prev[groupName]
      let next
      if (multi) {
        const arr = cur || []
        next = arr.includes(option) ? arr.filter((x) => x !== option) : [...arr, option]
      } else {
        next = cur === option ? '' : option
      }
      return { ...prev, [groupName]: next }
    })
  }

  const requiredGroupsMet = SIGNUP_GROUPS.every(([groupName, , required, multi]) => {
    if (!required) return true
    const v = answers[groupName]
    return multi ? (v && v.length > 0) : !!v
  })
  const canSubmit = name.trim() && email.trim() && password.length >= 8 && homeTown.trim() && requiredGroupsMet && consent

  const priorityLabelToKey = {
    'Preaching': 'preaching', 'Friendliness / welcome': 'friendliness', 'Kids & nursery': 'kids_nursery',
    'Music / worship': 'music', 'Accessibility': 'accessibility', 'Parking': 'parking',
  }

  const handleSubmit = async () => {
    if (!canSubmit || busy) return
    setBusy(true)
    setError('')
    try {
      const { data, error: signUpError } = await signUp(email.trim(), password)
      if (signUpError) throw signUpError

      const priorities = (answers['What matters most to you'] || []).map((l) => priorityLabelToKey[l]).filter(Boolean)
      const profileFields = {
        name: name.trim(),
        home_town: homeTown.trim(),
        priorities,
        worship_style: answers['Worship style'] || null,
        seeking_status: answers['Where you are right now'] || null,
        willing_distance: answers['How far you would drive'] || null,
        age_band: answers['Your age'] || null,
        household: answers['Household'] || [],
        consent_analytics: consent,
      }

      if (data.session) {
        await supabase.from('profiles').upsert({ id: data.user.id, email: data.user.email, ...profileFields })
        navigate('/')
      } else {
        setCheckEmail(true)
      }
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <ShieldCheck size={28} strokeWidth={1.3} style={{ color: 'var(--color-accent)' }} />
        <h1 className="pf-h" style={{ fontSize: 22 }}>Check your email</h1>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
          We sent a confirmation link to {email}. Once confirmed, sign in and your preferences will be waiting.
        </p>
        <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '9px 15px' }}>Go to sign in</button>
      </div>
    )
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div className="px-5" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 20, paddingBottom: 4, background: 'var(--color-surface)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-[5px]" style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
          <ChevronLeft size={14} strokeWidth={1.7} /><span>Back</span>
        </button>
        <h1 className="pf-h" style={{ fontSize: 27, fontWeight: 400, marginTop: 16 }}>Tell us what you&rsquo;re looking for</h1>
        <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
          This is how PewFinder ranks churches for you rather than showing you an alphabetical list. Churches only ever see these answers as totals, never tied to your name.
        </p>
      </div>

      <div className="px-5 flex flex-col gap-5" style={{ paddingTop: 22 }}>
        <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="First name and last initial" className="input" /></Field>
        <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="We verify this before your first review" className="input" /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="input" /></Field>
        <Field label="Home town or zip"><input value={homeTown} onChange={(e) => setHomeTown(e.target.value)} placeholder="Egg Harbor Twp or 08234" className="input" /></Field>

        {SIGNUP_GROUPS.map(([groupName, options, required, multi]) => (
          <div key={groupName} className="flex flex-col gap-[9px]">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{groupName}</span>
              <span style={{ fontSize: 10, color: required ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 40%,transparent)' }}>{required ? 'required' : 'optional'}</span>
            </div>
            <div className="flex gap-[7px] flex-wrap">
              {options.map((opt) => {
                const on = multi ? (answers[groupName] || []).includes(opt) : answers[groupName] === opt
                return (
                  <button
                    key={opt}
                    onClick={() => toggle(groupName, opt, multi)}
                    style={{
                      fontSize: 12, padding: '8px 12px',
                      border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                      background: on ? 'color-mix(in srgb,var(--color-accent) 13%,transparent)' : 'var(--color-surface)',
                      color: on ? 'var(--color-accent-800)' : 'color-mix(in srgb,var(--color-text) 66%,transparent)',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <label className="border flex gap-[10px] items-start" style={{ borderColor: 'var(--color-divider)', padding: '14px 15px', background: 'var(--color-surface)' }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
          <span style={{ fontSize: 11.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 65%,transparent)' }}>
            Churches see these as counts across everyone who viewed them, and nothing at all when fewer than ten people match. Your reviews can be posted under your name or anonymously — that&rsquo;s a separate choice each time.
          </span>
        </label>

        {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 12.5 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={!canSubmit || busy} className="btn btn-primary-solid" style={{ padding: 14, fontSize: 13.5, textAlign: 'center', minHeight: 44 }}>
          {busy ? 'Creating account…' : 'Find churches near me'}
        </button>
        <p style={{ margin: '0 0 12px', fontSize: 11, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)', textAlign: 'center' }}>
          You can change any of this later in Account.
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{label}</span>
      {children}
    </label>
  )
}
