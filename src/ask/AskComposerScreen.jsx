import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, CheckCheck, Type, Video as VideoIcon } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { fetchQuestionTags, submitQuestion } from '../lib/questions.js'
import { VideoCapture } from './VideoCapture.jsx'

export function AskComposerScreen() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [tags, setTags] = useState([])
  const [mode, setMode] = useState('text') // text | video
  const [tagKey, setTagKey] = useState(null)
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [videoAssetId, setVideoAssetId] = useState(null)
  const [anon, setAnon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [postedId, setPostedId] = useState(null)

  useEffect(() => {
    fetchQuestionTags().then(setTags).catch(console.error)
  }, [])

  if (!user) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center justify-center gap-4 text-center px-8" style={{ padding: '80px 32px' }}>
        <h1 className="pf-h" style={{ fontSize: 24 }}>Sign in to ask a question</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
          You can still post anonymously — an account just keeps the board honest and lets you find your question again.
        </p>
        <button onClick={() => navigate('/churches/signup')} className="btn btn-primary-solid" style={{ padding: '10px 18px' }}>Create an account</button>
        <button onClick={() => navigate('/churches/login')} style={{ fontSize: 13.5, color: 'var(--color-accent-2-700)' }}>Sign in</button>
      </div>
    )
  }

  const canPost = title.trim().length > 3 && (mode === 'text' || (mode === 'video' && videoAssetId)) && !submitting

  const handleSubmit = async () => {
    if (!canPost) return
    setSubmitting(true)
    try {
      const id = await submitQuestion({
        authorId: user.id,
        title: title.trim(),
        bodyText: mode === 'text' ? (bodyText.trim() || null) : null,
        videoAssetId: mode === 'video' ? videoAssetId : null,
        tagKey,
        anonymous: anon,
        authorName: profile?.name || 'Member',
      })
      setPostedId(id)
    } catch (e) {
      console.error(e)
      alert('Something went wrong posting your question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (postedId) {
    return (
      <div className="pf-scroll pf-screen flex-1 text-center flex flex-col items-center gap-[14px]" style={{ padding: '80px 32px' }}>
        <CheckCheck size={34} strokeWidth={1.2} style={{ color: 'var(--color-accent-2-600)' }} />
        <h2 className="pf-h" style={{ fontSize: 26, fontWeight: 400 }}>Question submitted</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
          It&rsquo;s in for review — once approved, it&rsquo;ll appear on the board and moderators can answer it on video.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary-solid" style={{ marginTop: 6, padding: '9px 15px', fontSize: 15 }}>Back to the board</button>
      </div>
    )
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div className="flex items-center gap-[10px] border-b px-4" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 20, paddingBottom: 12, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}>
        <button onClick={() => navigate(-1)} style={{ width: 32, height: 32 }} className="flex items-center justify-center"><ChevronLeft size={18} strokeWidth={1.7} /></button>
        <span className="pf-h flex-1" style={{ fontSize: 17 }}>Ask a question</span>
        <button onClick={handleSubmit} disabled={!canPost} style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: canPost ? 'var(--color-accent-2-600)' : 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}>
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>

      <div className="px-5" style={{ paddingTop: 20 }}>
        <div className="flex gap-[8px]">
          {[
            { key: 'text', label: 'Write it out', icon: Type },
            { key: 'video', label: 'Record video', icon: VideoIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="flex-1 flex items-center justify-center gap-[7px] border rounded-[var(--radius-md)]"
              style={{
                padding: '11px 8px', fontSize: 13.5,
                borderColor: mode === key ? 'var(--color-accent-2-600)' : 'var(--color-divider)',
                background: mode === key ? 'color-mix(in srgb,var(--color-accent-2) 12%,transparent)' : 'transparent',
                color: mode === key ? 'var(--color-accent-2-700)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)',
              }}
            >
              <Icon size={15} strokeWidth={1.7} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5" style={{ paddingTop: 22 }}>
        <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          Your question <span style={{ color: 'var(--color-accent-2-600)' }}>· required</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="If God is good, why is there so much suffering?"
          className="input"
          style={{ width: '100%', marginTop: 8, fontSize: 14.5 }}
          maxLength={140}
        />
      </div>

      {mode === 'text' ? (
        <div className="px-5" style={{ paddingTop: 16 }}>
          <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
            Add context <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={5}
            placeholder="Say as much or as little as you want — what's behind the question, what you've already tried to find out…"
            className="input"
            style={{ width: '100%', marginTop: 8, fontSize: 13.5 }}
          />
        </div>
      ) : (
        <div className="px-5" style={{ paddingTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
            Record your question
          </label>
          <VideoCapture onUploaded={setVideoAssetId} onClear={() => setVideoAssetId(null)} />
        </div>
      )}

      <div className="px-5" style={{ paddingTop: 22 }}>
        <label style={{ display: 'block', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          Topic <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <div className="flex gap-[7px] flex-wrap" style={{ marginTop: 8 }}>
          {tags.map((t) => (
            <button
              key={t.key}
              onClick={() => setTagKey((k) => (k === t.key ? null : t.key))}
              style={{
                padding: '6px 13px', borderRadius: 999, fontSize: 12.5,
                border: tagKey === t.key ? '1px solid var(--color-accent-2-600)' : '1px solid var(--color-divider)',
                background: tagKey === t.key ? 'var(--color-accent-2-600)' : 'transparent',
                color: tagKey === t.key ? 'white' : 'color-mix(in srgb,var(--color-text) 70%,transparent)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t px-5" style={{ margin: '22px 20px 0', paddingTop: 14, borderColor: 'var(--color-divider)' }}>
        <button onClick={() => setAnon((v) => !v)} className="flex items-center gap-3 w-full text-left">
          <span className="flex-1 min-w-0">
            <span style={{ display: 'block', fontSize: 13.5 }}>Ask anonymously</span>
            <span style={{ display: 'block', fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)', marginTop: 2 }}>
              {anon ? 'Shown as "Anonymous"' : `Shown as ${profile?.name || 'you'}`}
            </span>
          </span>
          <span className="flex-none relative rounded-full border" style={{ width: 42, height: 24, borderColor: anon ? 'var(--color-accent-2)' : 'var(--color-divider)', background: anon ? 'color-mix(in srgb,var(--color-accent-2) 35%,transparent)' : 'transparent' }}>
            <span className="absolute rounded-full" style={{ top: 2, left: anon ? 21 : 2, width: 18, height: 18, background: anon ? 'var(--color-accent-2)' : 'color-mix(in srgb,var(--color-text) 35%,transparent)', transition: 'left .18s ease' }} />
          </span>
        </button>
      </div>

      <div className="px-5" style={{ paddingTop: 20 }}>
        <button
          onClick={handleSubmit}
          disabled={!canPost}
          className="w-full border rounded-[var(--radius-md)]"
          style={{ padding: 12, borderColor: canPost ? 'var(--color-accent-2-600)' : 'var(--color-divider)', color: canPost ? 'var(--color-accent-2-600)' : 'color-mix(in srgb,var(--color-text) 42%,transparent)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}
        >
          {submitting ? 'Posting…' : 'Post question'}
        </button>
        <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)', textAlign: 'center' }}>
          A moderator reviews every question before it goes live.
        </p>
      </div>
      <div style={{ height: 14 }} />
    </div>
  )
}
