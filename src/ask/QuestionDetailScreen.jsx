import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, Video as VideoIcon } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { fetchQuestion, submitAnswer } from '../lib/questions.js'
import { VideoPlayer } from './VideoPlayer.jsx'
import { VideoCapture } from './VideoCapture.jsx'
import { avatarColor } from '../data/constants.js'

export function QuestionDetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answering, setAnswering] = useState(false)
  const [answerAssetId, setAnswerAssetId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => fetchQuestion(id).then(setQuestion).catch(console.error).finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const handlePostAnswer = async () => {
    if (!answerAssetId || submitting) return
    setSubmitting(true)
    try {
      await submitAnswer({ questionId: id, authorId: user.id, videoAssetId: answerAssetId, authorName: profile?.name || 'Member' })
      setAnswering(false)
      setAnswerAssetId(null)
      alert('Your answer is in for review — it will appear once approved.')
    } catch (e) {
      console.error(e)
      alert('Something went wrong posting your answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex-1 pf-scroll pf-screen" style={{ padding: 60 }}>Loading&hellip;</div>
  if (!question) return <div className="flex-1 pf-scroll pf-screen" style={{ padding: 60 }}>Question not found.</div>

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div className="flex items-center gap-[10px] border-b px-4" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 20, paddingBottom: 12, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}>
        <button onClick={() => navigate(-1)} style={{ width: 32, height: 32 }} className="flex items-center justify-center"><ChevronLeft size={18} strokeWidth={1.7} /></button>
        <span className="pf-h flex-1" style={{ fontSize: 17 }}>Question</span>
      </div>

      <div className="px-5" style={{ paddingTop: 20 }}>
        <div className="flex items-center gap-[10px]">
          <div
            className="flex-none rounded-full border flex items-center justify-center"
            style={{ width: 34, height: 34, borderColor: 'var(--color-divider)', background: avatarColor(question.author_initials), fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-surface)' }}
          >
            {question.author_initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 13 }}><span style={{ fontWeight: 600 }}>{question.author_display_name}</span> asked</div>
            {question.question_tags?.label && <span style={{ fontSize: 11, color: 'var(--color-accent-2-700)' }}>{question.question_tags.label}</span>}
          </div>
        </div>

        <h1 className="pf-h" style={{ fontSize: 23, fontWeight: 600, margin: '16px 0 0' }}>{question.title}</h1>

        {question.body_text && (
          <p style={{ margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 82%,transparent)' }}>{question.body_text}</p>
        )}
        {question.video_asset?.mux_playback_id && (
          <div style={{ marginTop: 14 }}>
            <VideoPlayer playbackId={question.video_asset.mux_playback_id} />
          </div>
        )}
      </div>

      <div className="px-5" style={{ paddingTop: 28 }}>
        <div className="flex items-center justify-between border-t" style={{ paddingTop: 18, borderColor: 'var(--color-divider)' }}>
          <h2 className="pf-h" style={{ fontSize: 16, margin: 0 }}>
            {question.answers.length > 0 ? `${question.answers.length} answer${question.answers.length === 1 ? '' : 's'}` : 'No answers yet'}
          </h2>
          {user && !answering && (
            <button onClick={() => setAnswering(true)} style={{ fontSize: 13, color: 'var(--color-accent-2-700)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              Answer on video
            </button>
          )}
        </div>
      </div>

      {answering && (
        <div className="px-5" style={{ paddingTop: 14 }}>
          <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
              Answers are always on video, up to 5 minutes, and posted under your real name.
            </p>
            <VideoCapture onUploaded={setAnswerAssetId} onClear={() => setAnswerAssetId(null)} />
            <div className="flex gap-[8px]" style={{ marginTop: 12 }}>
              <button onClick={() => { setAnswering(false); setAnswerAssetId(null) }} className="flex-1" style={{ fontSize: 13, padding: '9px', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                Cancel
              </button>
              <button
                onClick={handlePostAnswer}
                disabled={!answerAssetId || submitting}
                className="flex-1 btn btn-primary-solid"
                style={{ padding: '9px', opacity: !answerAssetId || submitting ? 0.5 : 1 }}
              >
                {submitting ? 'Posting…' : 'Post answer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="px-5" style={{ paddingTop: 14 }}>
          <button onClick={() => navigate('/churches/signup')} style={{ fontSize: 13, color: 'var(--color-accent-2-700)' }}>Sign in to answer this question &rarr;</button>
        </div>
      )}

      <div className="px-5" style={{ paddingTop: 8 }}>
        {question.answers.map((a) => (
          <div key={a.id} className="border-t" style={{ padding: '16px 0', borderColor: 'var(--color-divider)' }}>
            <div className="flex items-center gap-[9px]">
              <div
                className="flex-none rounded-full border flex items-center justify-center"
                style={{ width: 28, height: 28, borderColor: 'var(--color-divider)', background: avatarColor(a.author_initials), fontFamily: 'var(--font-heading)', fontSize: 12.5, color: 'var(--color-surface)' }}
              >
                {a.author_initials}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{a.author_display_name}</span>
              {a.is_moderator_answer && (
                <span className="badge-moderator flex items-center gap-[4px]" style={{ fontSize: 10.5, padding: '3px 8px' }}>
                  <ShieldCheck size={11} strokeWidth={2} /> Moderator
                </span>
              )}
            </div>
            {a.video_asset?.mux_playback_id ? (
              <div style={{ marginTop: 10 }}>
                <VideoPlayer playbackId={a.video_asset.mux_playback_id} />
              </div>
            ) : (
              <div className="flex items-center gap-[6px]" style={{ marginTop: 8, fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
                <VideoIcon size={13} strokeWidth={1.6} /> Video processing&hellip;
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: 14 }} />
    </div>
  )
}
