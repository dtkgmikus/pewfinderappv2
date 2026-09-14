import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MessageCircle, Video as VideoIcon } from 'lucide-react'
import { fetchQuestionFeed, fetchQuestionTags } from '../lib/questions.js'
import { avatarColor } from '../data/constants.js'

export function AskFeedScreen() {
  const navigate = useNavigate()
  const [tags, setTags] = useState([])
  const [activeTag, setActiveTag] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestionTags().then(setTags).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchQuestionFeed({ limit: 30, tagKey: activeTag })
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeTag])

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div
        className="px-5 border-b"
        style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 24, paddingBottom: 14, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}
      >
        <div className="flex items-center justify-between">
          <h1 className="pf-h" style={{ fontSize: 33, fontWeight: 400, margin: 0 }}>Ask about God</h1>
          <button
            onClick={() => navigate('/search')}
            className="flex-none rounded-full flex items-center justify-center pf-tap"
            style={{ width: 36, height: 36, background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}
            aria-label="Search questions"
          >
            <Search size={16} strokeWidth={1.8} style={{ color: 'var(--color-text)' }} />
          </button>
        </div>
        <p style={{ margin: '8px 0 14px', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>
          Real questions, answered on video by trained moderators and people who&rsquo;ve been there.
        </p>

        <div className="flex gap-[7px] flex-nowrap" style={{ overflowX: 'auto', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
          <TagChip label="All" active={activeTag === null} onClick={() => setActiveTag(null)} />
          {tags.map((t) => (
            <TagChip key={t.key} label={t.label} active={activeTag === t.key} onClick={() => setActiveTag(t.key)} />
          ))}
        </div>
      </div>

      {loading && (
        <p style={{ padding: '28px 20px', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Loading questions&hellip;</p>
      )}

      {!loading && items.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>No questions here yet — be the first to ask.</p>
          <button onClick={() => navigate('/ask')} className="btn btn-primary-solid" style={{ marginTop: 14, padding: '10px 20px' }}>Ask a question</button>
        </div>
      )}

      {items.map((q) => (
        <button
          key={q.id}
          onClick={() => navigate(`/question/${q.id}`)}
          className="px-5 border-b block w-full text-left"
          style={{ padding: '16px 20px', borderColor: 'var(--color-divider)' }}
        >
          <div className="flex items-center gap-[10px]">
            <div
              className="flex-none rounded-full border flex items-center justify-center"
              style={{ width: 32, height: 32, borderColor: 'var(--color-divider)', background: avatarColor(q.author_initials), fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-surface)' }}
            >
              {q.author_initials || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{q.author_display_name}</span> asked
              </div>
              {q.question_tags?.label && (
                <span style={{ fontSize: 11, color: 'var(--color-accent-2-700)' }}>{q.question_tags.label}</span>
              )}
            </div>
            <span style={{ flex: 'none', fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)' }}>{timeAgo(q.created_at)}</span>
          </div>

          <h2 className="pf-h" style={{ fontSize: 17, fontWeight: 600, margin: '10px 0 0' }}>{q.title}</h2>

          {q.body_text && (
            <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 78%,transparent)' }}>
              {q.body_text.length > 140 ? q.body_text.slice(0, 140) + '…' : q.body_text}
            </p>
          )}
          {!q.body_text && q.video_asset && (
            <div className="flex items-center gap-[6px]" style={{ marginTop: 8, fontSize: 12.5, color: 'var(--color-accent-2-700)' }}>
              <VideoIcon size={13} strokeWidth={1.8} /><span>Video question</span>
            </div>
          )}

          <div className="flex items-center gap-[14px]" style={{ marginTop: 11 }}>
            <span className="flex items-center gap-[5px]" style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
              <MessageCircle size={13} strokeWidth={1.6} />
              {q.answerCount > 0 ? `${q.answerCount} answer${q.answerCount === 1 ? '' : 's'}` : 'No answers yet'}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

function TagChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-none pf-tap"
      style={{
        padding: '6px 13px',
        borderRadius: 999,
        fontSize: 12.5,
        whiteSpace: 'nowrap',
        border: active ? '1px solid var(--color-accent-2-600)' : '1px solid var(--color-divider)',
        background: active ? 'var(--color-accent-2-600)' : 'var(--color-surface)',
        color: active ? 'white' : 'var(--color-text)',
      }}
    >
      {label}
    </button>
  )
}

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}
