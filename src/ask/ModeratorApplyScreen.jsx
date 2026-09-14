import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, Clock, X } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { fetchModeratorStatus, applyForModerator } from '../lib/questions.js'

export function ModeratorApplyScreen() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [status, setStatus] = useState(undefined) // undefined = loading, null = never applied
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justApplied, setJustApplied] = useState(false)

  useEffect(() => {
    if (!user) { setStatus(null); return }
    fetchModeratorStatus(user.id).then(setStatus).catch(console.error)
  }, [user])

  if (!user) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center justify-center gap-4 text-center px-8" style={{ padding: '80px 32px' }}>
        <h1 className="pf-h" style={{ fontSize: 24 }}>Sign in to apply</h1>
        <button onClick={() => navigate('/churches/signup')} className="btn btn-primary-solid" style={{ padding: '10px 18px' }}>Create an account</button>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (text.trim().length < 30 || submitting) return
    setSubmitting(true)
    try {
      await applyForModerator(user.id, text.trim())
      setJustApplied(true)
    } catch (e) {
      console.error(e)
      alert('Something went wrong submitting your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const Header = () => (
    <div className="flex items-center gap-[10px] border-b px-4" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 20, paddingBottom: 12, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}>
      <button onClick={() => navigate(-1)} style={{ width: 32, height: 32 }} className="flex items-center justify-center"><ChevronLeft size={18} strokeWidth={1.7} /></button>
      <span className="pf-h flex-1" style={{ fontSize: 17 }}>Become a moderator</span>
    </div>
  )

  if (status === undefined) {
    return <div className="pf-scroll pf-screen flex-1" style={{ padding: 60 }}>Loading&hellip;</div>
  }

  if (justApplied || status?.status === 'applied') {
    return (
      <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
        <Header />
        <div className="text-center flex flex-col items-center gap-[14px]" style={{ padding: '70px 32px' }}>
          <Clock size={30} strokeWidth={1.3} style={{ color: 'var(--color-accent-2-600)' }} />
          <h2 className="pf-h" style={{ fontSize: 22, fontWeight: 400 }}>Application under review</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
            Get-God staff review every moderator application by hand. We&rsquo;ll let you know once yours has been decided.
          </p>
        </div>
      </div>
    )
  }

  if (status?.status === 'approved') {
    return (
      <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
        <Header />
        <div className="text-center flex flex-col items-center gap-[14px]" style={{ padding: '70px 32px' }}>
          <ShieldCheck size={30} strokeWidth={1.3} style={{ color: 'var(--color-accent-2-600)' }} />
          <h2 className="pf-h" style={{ fontSize: 22, fontWeight: 400 }}>You&rsquo;re an approved moderator</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
            Any video answer you post is automatically badged as a moderator answer and sorted to the top of the thread.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary-solid" style={{ marginTop: 6, padding: '9px 15px', fontSize: 15 }}>Go answer questions</button>
        </div>
      </div>
    )
  }

  if (status?.status === 'rejected' || status?.status === 'revoked') {
    return (
      <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
        <Header />
        <div className="text-center flex flex-col items-center gap-[14px]" style={{ padding: '70px 32px' }}>
          <X size={28} strokeWidth={1.4} style={{ color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }} />
          <h2 className="pf-h" style={{ fontSize: 22, fontWeight: 400 }}>Not approved at this time</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
            You&rsquo;re still welcome to post community video answers — those just won&rsquo;t carry the moderator badge.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <Header />
      <div className="px-5" style={{ paddingTop: 22 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)' }}>
          Moderators are trained, badged answerers whose video responses are pinned above the community&rsquo;s. Tell us about your
          background, training, and how you&rsquo;d approach hard questions with honesty and care.
        </p>
        <label style={{ display: 'block', marginTop: 20, fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          Tell us about yourself
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Ministry or theological background, how long, what you're trained in, why you'd want to do this well…"
          className="input"
          style={{ width: '100%', marginTop: 8, fontSize: 13.5 }}
        />
        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 30 || submitting}
          className="btn btn-primary-solid w-full"
          style={{ marginTop: 16, padding: 12, opacity: text.trim().length < 30 || submitting ? 0.5 : 1 }}
        >
          {submitting ? 'Submitting…' : 'Submit application'}
        </button>
      </div>
      <div style={{ height: 14 }} />
    </div>
  )
}
