import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronDown, CheckCheck } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { fetchChurches, fetchChurchBySlug } from '../lib/churches.js'
import { submitReview } from '../lib/reviews.js'
import { CATEGORIES, SUBCATEGORIES } from '../data/constants.js'
import { StarPicker } from '../components/ui/Stars.jsx'
import { PlatePhoto } from '../components/ui/PlatePhoto.jsx'

const OVERALL_LABELS = ['Tap to rate', 'Would not go back', 'A hard morning', 'Solid, with gaps', 'Would recommend', 'We are going back']

function lastSunday() {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d
}

export function WriteReviewScreen() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const slug = params.get('church')

  const [church, setChurch] = useState(null)
  const [picker, setPicker] = useState([])
  const [overall, setOverall] = useState(0)
  const [cats, setCats] = useState({})
  const [subs, setSubs] = useState({})
  const [wellText, setWellText] = useState('')
  const [improveText, setImproveText] = useState('')
  const [dateIdx, setDateIdx] = useState(0)
  const [customDate, setCustomDate] = useState('')
  const [anon, setAnon] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (slug) fetchChurchBySlug(slug).then(setChurch).catch(console.error)
    else fetchChurches().then(setPicker).catch(console.error)
  }, [slug])

  const visitedOn = useMemo(() => {
    const today = new Date()
    if (dateIdx === 0) { today.setDate(today.getDate() - 1); return today.toISOString().slice(0, 10) }
    if (dateIdx === 1) return lastSunday().toISOString().slice(0, 10)
    return customDate || today.toISOString().slice(0, 10)
  }, [dateIdx, customDate])

  if (!user) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center justify-center gap-4 text-center px-8" style={{ padding: '80px 32px' }}>
        <h1 className="pf-h" style={{ fontSize: 24 }}>Sign in to write a review</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
          Reviews are tied to an account so churches can trust the visit was real, even when you post anonymously.
        </p>
        <button onClick={() => navigate('/churches/signup')} className="btn btn-primary-solid" style={{ padding: '10px 18px' }}>Create an account</button>
      </div>
    )
  }

  if (!slug) {
    return (
      <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
        <div className="px-5" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 24, paddingBottom: 8, background: 'var(--color-chrome)' }}>
          <h1 className="pf-h" style={{ fontSize: 22 }}>Which church did you visit?</h1>
        </div>
        <div className="flex flex-col">
          {picker.map((c) => (
            <button key={c.id} onClick={() => navigate(`/churches/write?church=${c.slug}`)} className="pf-tap text-left px-5 border-t" style={{ padding: '13px 20px', borderColor: 'var(--color-divider)' }}>
              <div className="pf-h" style={{ fontSize: 16 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>{c.denomination} · {c.town}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!church) return <div className="flex-1 pf-scroll pf-screen" style={{ padding: 60 }}>Loading…</div>

  const canPost = overall > 0
  const detailCount = Object.values(cats).filter(Boolean).length

  const handleSubmit = async () => {
    if (!canPost || submitting) return
    setSubmitting(true)
    try {
      await submitReview({
        churchId: church.id,
        memberId: user.id,
        overall,
        categories: cats,
        subcategories: subs,
        wellText,
        improveText,
        visitedOn,
        anonymous: anon,
        authorName: profile?.name || 'Member',
      })
      setSubmitted(true)
    } catch (e) {
      console.error(e)
      alert('Something went wrong posting your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setSubmitted(false); setOverall(0); setCats({}); setSubs({}); setWellText(''); setImproveText('')
    navigate('/churches?tab=visits')
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div className="flex items-center gap-[10px] border-b px-4" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 20, paddingBottom: 12, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}>
        <button onClick={() => navigate(-1)} style={{ width: 32, height: 32 }} className="flex items-center justify-center"><ChevronLeft size={18} strokeWidth={1.7} /></button>
        <span className="pf-h flex-1" style={{ fontSize: 17 }}>Write a review</span>
        <button onClick={handleSubmit} disabled={!canPost} style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: canPost ? 'var(--color-accent)' : 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}>Post</button>
      </div>

      {submitted ? (
        <div className="text-center flex flex-col items-center gap-[14px]" style={{ padding: '70px 32px' }}>
          <CheckCheck size={34} strokeWidth={1.2} style={{ color: 'var(--color-accent)' }} />
          <h2 className="pf-h" style={{ fontSize: 26, fontWeight: 400 }}>Posted — thank you</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
            Your review of {church.name} is live. The church can reply, and other visitors can mark it helpful.
          </p>
          <button onClick={reset} className="btn btn-primary-solid" style={{ marginTop: 6, padding: '9px 15px', fontSize: 15 }}>Review another visit</button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 border-b px-5" style={{ padding: '16px 20px', borderColor: 'var(--color-divider)' }}>
            <div className="plate flex-none relative" style={{ width: 44, height: 44 }}><PlatePhoto url={church.thumbnail_photo_url} /></div>
            <div className="flex-1 min-w-0">
              <div className="pf-h" style={{ fontSize: 18 }}>{church.name}</div>
              <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{church.denomination}</div>
            </div>
            <button onClick={() => navigate('/churches/write')} style={{ fontSize: 12.5, color: 'var(--color-accent-600)' }}>Change</button>
          </div>

          <div className="text-center px-5" style={{ paddingTop: 24 }}>
            <p style={{ margin: 0, fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Overall</p>
            <div className="flex justify-center" style={{ marginTop: 11 }}>
              <StarPicker value={overall} onChange={setOverall} size={30} />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 14, fontStyle: 'italic', color: 'color-mix(in srgb,var(--color-text) 62%,transparent)', minHeight: 20 }}>{OVERALL_LABELS[overall]}</p>
          </div>

          <div className="px-5" style={{ paddingTop: 24 }}>
            <div className="flex items-baseline justify-between gap-[10px]">
              <h2 className="pf-h" style={{ fontSize: 16 }}>Detail by category</h2>
              <span style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>{detailCount ? `${detailCount} of 11 rated` : 'Optional'}</span>
            </div>
          </div>
          <div className="px-5" style={{ paddingTop: 8 }}>
            {CATEGORIES.map((c) => {
              const sub = SUBCATEGORIES[c.key]
              const rated = cats[c.key] || 0
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between gap-[10px] border-b" style={{ padding: '11px 0', borderColor: 'color-mix(in srgb,var(--color-text) 10%,transparent)' }}>
                    <span className="flex-1 min-w-0" style={{ fontSize: 13.5 }}>{c.label}</span>
                    <StarPicker value={rated} onChange={(n) => setCats((s) => ({ ...s, [c.key]: n }))} size={16} />
                  </div>
                  {sub && rated > 0 && (
                    <div style={{ margin: '2px 0 6px', padding: '10px 0 4px 13px', borderLeft: '1px solid var(--color-accent)' }}>
                      <div className="flex items-center gap-[5px]" style={{ color: 'var(--color-accent-600)', fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase' }}>
                        <ChevronDown size={12} strokeWidth={1.6} /><span>{sub.heading}</span>
                      </div>
                      {sub.items.map((u) => {
                        const key = `${c.key}|${u.key}`
                        return (
                          <div key={u.key} className="flex items-center justify-between gap-[10px] border-b" style={{ padding: '9px 0', borderColor: 'color-mix(in srgb,var(--color-text) 10%,transparent)' }}>
                            <span className="flex-1 min-w-0" style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 80%,transparent)' }}>{u.label}</span>
                            <StarPicker value={subs[key] || 0} onChange={(n) => setSubs((s) => ({ ...s, [key]: n }))} size={14} />
                          </div>
                        )
                      })}
                      <p style={{ margin: '9px 0 0', fontSize: 12, lineHeight: 1.55, fontStyle: 'italic', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{sub.note}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="px-5" style={{ paddingTop: 24 }}>
            <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>What they do well</label>
            <textarea value={wellText} onChange={(e) => setWellText(e.target.value)} rows={3} placeholder="Greeters at both doors caught us before we even found the sanctuary…" className="input" style={{ width: '100%', marginTop: 8, fontSize: 13.5 }} />
          </div>
          <div className="px-5" style={{ paddingTop: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Areas for improvement</label>
            <textarea value={improveText} onChange={(e) => setImproveText(e.target.value)} rows={3} placeholder="Written kindly — the church can read and reply to this." className="input" style={{ width: '100%', marginTop: 8, fontSize: 13.5 }} />
          </div>

          <div className="px-5" style={{ paddingTop: 22 }}>
            <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
              Date visited <span style={{ color: 'var(--color-accent-600)' }}>· required</span>
            </label>
            <div className="flex gap-[7px]" style={{ marginTop: 8 }}>
              {['Yesterday', 'Last Sunday', 'Pick a date'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setDateIdx(i)}
                  className="flex-1 border rounded-[var(--radius-md)]"
                  style={{
                    padding: '9px 6px', fontSize: 12.5,
                    borderColor: dateIdx === i ? 'var(--color-accent)' : 'var(--color-divider)',
                    background: dateIdx === i ? 'color-mix(in srgb,var(--color-accent) 13%,transparent)' : 'transparent',
                    color: dateIdx === i ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {dateIdx === 2 && (
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} className="input" style={{ marginTop: 8 }} max={new Date().toISOString().slice(0, 10)} />
            )}
          </div>

          <div className="border-t px-5" style={{ margin: '22px 20px 0', paddingTop: 14, borderColor: 'var(--color-divider)' }}>
            <button onClick={() => setAnon((v) => !v)} className="flex items-center gap-3 w-full text-left">
              <span className="flex-1 min-w-0">
                <span style={{ display: 'block', fontSize: 13.5 }}>Post anonymously</span>
                <span style={{ display: 'block', fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)', marginTop: 2 }}>
                  {anon ? 'Shown as "Anonymous visitor"' : `Shown as ${profile?.name || 'you'}`}
                </span>
              </span>
              <span className="flex-none relative rounded-full border" style={{ width: 42, height: 24, borderColor: anon ? 'var(--color-accent)' : 'var(--color-divider)', background: anon ? 'color-mix(in srgb,var(--color-accent) 35%,transparent)' : 'transparent' }}>
                <span className="absolute rounded-full" style={{ top: 2, left: anon ? 21 : 2, width: 18, height: 18, background: anon ? 'var(--color-accent)' : 'color-mix(in srgb,var(--color-text) 35%,transparent)', transition: 'left .18s ease' }} />
              </span>
            </button>
          </div>

          <div className="px-5" style={{ paddingTop: 20 }}>
            <button
              onClick={handleSubmit}
              disabled={!canPost || submitting}
              className="w-full border rounded-[var(--radius-md)]"
              style={{ padding: 12, borderColor: canPost ? 'var(--color-accent)' : 'var(--color-divider)', color: canPost ? 'var(--color-accent)' : 'color-mix(in srgb,var(--color-text) 42%,transparent)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}
            >
              {submitting ? 'Posting…' : 'Post review'}
            </button>
            <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)', textAlign: 'center' }}>
              {canPost ? 'The church may reply publicly. You can edit for 24 hours.' : 'An overall rating and a visit date are required.'}
            </p>
          </div>
          <div style={{ height: 14 }} />
        </div>
      )}
    </div>
  )
}
