import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, MessageCircle } from 'lucide-react'
import { searchQuestions, fetchQuestionFeed } from '../lib/questions.js'
import { avatarColor } from '../data/constants.js'

export function AskSearchScreen() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    fetchQuestionFeed({ limit: 20 }).then(setItems).catch(console.error).finally(() => setLoading(false))
  }, [])

  const runSearch = async (value) => {
    setLoading(true)
    setSearched(!!value.trim())
    try {
      const rows = value.trim() ? await searchQuestions(value) : await fetchQuestionFeed({ limit: 20 })
      setItems(rows)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div className="flex items-center gap-[10px] border-b px-4" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 20, paddingBottom: 12, background: 'var(--color-chrome)', borderColor: 'var(--color-divider)' }}>
        <button onClick={() => navigate(-1)} style={{ width: 32, height: 32 }} className="flex items-center justify-center"><ChevronLeft size={18} strokeWidth={1.7} /></button>
        <div className="flex-1 flex items-center gap-[8px]" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
          <Search size={14} strokeWidth={1.8} style={{ color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }} />
          <input
            autoFocus
            value={term}
            onChange={(e) => { setTerm(e.target.value); runSearch(e.target.value) }}
            placeholder="Search questions already asked&hellip;"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13.5, color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {loading && <p style={{ padding: '28px 20px', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Searching&hellip;</p>}

      {!loading && items.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            {searched ? 'No questions match that yet — you could be the first to ask it.' : 'Nothing posted yet.'}
          </p>
          <button onClick={() => navigate('/ask')} className="btn btn-primary-solid" style={{ marginTop: 14, padding: '10px 20px' }}>Ask a question</button>
        </div>
      )}

      {items.map((q) => (
        <button
          key={q.id}
          onClick={() => navigate(`/question/${q.id}`)}
          className="px-5 border-b block w-full text-left"
          style={{ padding: '14px 20px', borderColor: 'var(--color-divider)' }}
        >
          <div className="flex items-center gap-[9px]">
            <div
              className="flex-none rounded-full border flex items-center justify-center"
              style={{ width: 28, height: 28, borderColor: 'var(--color-divider)', background: avatarColor(q.author_initials), fontFamily: 'var(--font-heading)', fontSize: 12.5, color: 'var(--color-surface)' }}
            >
              {q.author_initials || '?'}
            </div>
            <span className="pf-h flex-1 min-w-0" style={{ fontSize: 15 }}>{q.title}</span>
          </div>
          <div className="flex items-center gap-[14px]" style={{ marginTop: 8 }}>
            {q.question_tags?.label && <span style={{ fontSize: 11.5, color: 'var(--color-accent-2-700)' }}>{q.question_tags.label}</span>}
            <span className="flex items-center gap-[5px]" style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
              <MessageCircle size={12} strokeWidth={1.6} />
              {q.answerCount > 0 ? `${q.answerCount} answer${q.answerCount === 1 ? '' : 's'}` : 'No answers yet'}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
