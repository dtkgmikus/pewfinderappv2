import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Flag, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.jsx'
import { useAdmin } from './AdminContext.jsx'
import { avatarColor } from '../data/constants.js'
import { Chip } from '../components/ui/Chip.jsx'
import { ProLock } from './ProLock.jsx'

const REASONS = ['Never visited', 'Wrong church', 'Personal attack', 'False claim about a person', 'Spam or advertising']

export function AdminReviewsScreen() {
  const { church, isPro } = useAdmin()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('unanswered')
  const [selectedId, setSelectedId] = useState(params.get('review') || null)
  const [draft, setDraft] = useState('')
  const [flagOpen, setFlagOpen] = useState(false)
  const [removal, setRemoval] = useState(false)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [flagSentIds, setFlagSentIds] = useState({})

  const load = () => {
    if (!church) return
    supabase
      .from('reviews')
      .select('*, review_replies(text), review_flags(id, status)')
      .eq('church_id', church.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews(data || [])
        if (!selectedId && data?.length) setSelectedId(data[0].id)
      })
  }
  useEffect(load, [church])

  const filtered = useMemo(() => {
    if (filter === 'unanswered') return reviews.filter((r) => !r.review_replies)
    if (filter === 'flagged') return reviews.filter((r) => r.review_flags?.length)
    return reviews
  }, [reviews, filter])

  const selected = reviews.find((r) => r.id === selectedId) || filtered[0]

  const select = (r) => { setSelectedId(r.id); setFlagOpen(false); setRemoval(false); setDraft(''); setParams({}) }

  const postReply = async () => {
    if (!draft.trim() || !selected) return
    const { error } = await supabase.from('review_replies').insert({ review_id: selected.id, church_id: church.id, author_profile_id: user.id, text: draft.trim() })
    if (error) { console.error('Failed to post reply', error); return }
    setDraft('')
    load()
  }

  const submitFlag = async () => {
    if (!reason || !selected) return
    await supabase.from('review_flags').insert({ review_id: selected.id, flagged_by_type: 'church', flagged_by_church_id: church.id, reason, note })
    setFlagOpen(false); setRemoval(false); setReason(''); setNote('')
    setFlagSentIds((s) => ({ ...s, [selected.id]: true }))
    load()
  }

  if (!church) return null

  return (
    <div className="grid gap-[26px]" style={{ gridTemplateColumns: '1fr 400px' }}>
      <div className="flex flex-col gap-4 min-w-0">
        <div>
          <h1 className="pf-h" style={{ fontSize: 27 }}>Reviews</h1>
          <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{church.review_count} in total · {church.avg_rating.toFixed(1)} average</p>
        </div>
        <div className="flex gap-[7px] flex-wrap">
          {['unanswered', 'all', 'flagged'].map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f === 'unanswered' ? 'Unanswered' : f === 'all' ? 'All' : 'Flagged'}</Chip>
          ))}
        </div>
        <div className="flex flex-col gap-[9px]">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => select(r)}
              className="border text-left"
              style={{ padding: '15px 17px', borderColor: 'var(--color-divider)', borderLeft: `2px solid ${selected?.id === r.id ? 'var(--color-accent)' : 'transparent'}`, background: selected?.id === r.id ? 'var(--color-bg)' : 'transparent' }}
            >
              <div className="flex items-center gap-[10px] flex-wrap">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{r.author_display_name} · {'★'.repeat(r.overall_rating)}</span>
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="line-clamp-2" style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>{r.well_text}</p>
              {!r.review_replies && <span style={{ fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>Needs reply</span>}
            </button>
          ))}
          {filtered.length === 0 && <p style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Nothing here.</p>}
        </div>
      </div>

      {selected && (
        <div className="border flex flex-col" style={{ borderColor: 'var(--color-divider)', position: 'sticky', top: 20 }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-bg)' }}>
            <span className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: avatarColor(selected.author_initials), fontSize: 13, color: 'var(--color-surface)' }}>{selected.author_initials}</span>
            <div style={{ marginTop: 10, fontFamily: 'var(--font-heading)', fontSize: 18 }}>{selected.author_display_name}</div>
            <div style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{'★'.repeat(selected.overall_rating)} · visited {selected.visited_on}</div>
          </div>
          <div className="flex flex-col gap-4" style={{ padding: '18px 20px' }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>{selected.well_text}</p>
            {selected.improve_text && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>{selected.improve_text}</p>}

            {selected.review_replies?.text && (
              <div style={{ borderLeft: '2px solid var(--color-accent)', padding: '14px 18px', background: 'var(--color-bg)' }}>
                <span style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>Response from {church.name}</span>
                <p style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.65 }}>{selected.review_replies.text}</p>
              </div>
            )}

            {!selected.review_replies?.text && !flagOpen && !isPro && (
              <div className="flex flex-col gap-4 border" style={{ borderColor: 'var(--color-divider)', padding: '18px 20px' }}>
                <ProLock section="reviews" />
                <button onClick={() => setFlagOpen(true)} className="flex items-center gap-[7px] self-start border" style={{ borderColor: 'var(--color-divider)', padding: '10px 14px', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)' }}>
                  <Flag size={13} strokeWidth={1.7} /><span>Flag this review</span>
                </button>
              </div>
            )}

            {!selected.review_replies?.text && !flagOpen && isPro && (
              <div className="flex flex-col gap-3 border" style={{ borderColor: 'var(--color-divider)', padding: '18px 20px' }}>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Your public reply</span>
                </div>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Thank them, answer what they raised, and say what you're changing. Members can see this." className="input" style={{ minHeight: 104, fontSize: 13.5 }} />
                <div className="flex items-center gap-[10px] flex-wrap">
                  <button onClick={postReply} className="btn btn-primary-solid" style={{ padding: '10px 16px', fontSize: 13 }}>Post reply</button>
                  <button onClick={() => setFlagOpen(true)} className="flex items-center gap-[7px] border" style={{ borderColor: 'var(--color-divider)', padding: '10px 14px', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)' }}>
                    <Flag size={13} strokeWidth={1.7} /><span>Flag this review</span>
                  </button>
                </div>
              </div>
            )}

            {flagOpen && (
              <div className="border" style={{ borderColor: 'var(--color-accent-300)', background: 'color-mix(in srgb,var(--color-accent) 6%,transparent)', padding: 20 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>What would you like to do?</span>
                <p style={{ margin: '7px 0 0', fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
                  A review can stay up even if you disagree with it. We only take one down when it breaks the rules.
                </p>
                <div className="flex flex-col gap-[9px]" style={{ marginTop: 16 }}>
                  <button onClick={() => setFlagOpen(false)} className="grid gap-3 items-start border text-left" style={{ gridTemplateColumns: 'auto 1fr', borderColor: 'var(--color-divider)', background: 'var(--color-surface)', padding: '14px 15px' }}>
                    <MessageSquare size={15} strokeWidth={1.6} style={{ color: 'var(--color-accent-700)' }} />
                    <span className="flex flex-col gap-1">
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>Just reply publicly</span>
                      <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>Say your side under the review. Nothing is hidden.</span>
                    </span>
                  </button>
                  <button onClick={() => setRemoval(true)} className="grid gap-3 items-start border text-left" style={{ gridTemplateColumns: 'auto 1fr', borderColor: 'var(--color-divider)', background: 'var(--color-surface)', padding: '14px 15px' }}>
                    <Flag size={15} strokeWidth={1.6} style={{ color: 'var(--color-accent-700)' }} />
                    <span className="flex flex-col gap-1">
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>Ask us to take it down</span>
                      <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>For reviews that break the rules. We read it and email you either way.</span>
                    </span>
                  </button>
                </div>
                {removal && (
                  <div className="flex flex-col gap-[10px] border-t" style={{ marginTop: 16, paddingTop: 16, borderColor: 'var(--color-accent-300)' }}>
                    <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Which rule does it break?</span>
                    <div className="flex gap-[7px] flex-wrap">
                      {REASONS.map((r) => <Chip key={r} active={reason === r} onClick={() => setReason(r)}>{r}</Chip>)}
                    </div>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything that helps us check — dates, who was involved, what actually happened." className="input" style={{ minHeight: 78, fontSize: 13 }} />
                    <div className="flex items-center gap-[12px]">
                      <button onClick={submitFlag} className="btn btn-primary-solid" style={{ padding: '10px 16px', fontSize: 13 }}>Send to Get-God</button>
                      <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>Usually reviewed within a day. It stays public meanwhile.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(flagSentIds[selected.id] || selected.review_flags?.length > 0) && !flagOpen && (
              <div className="flex gap-[11px] items-start border" style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)', padding: '16px 18px' }}>
                <Clock size={15} strokeWidth={1.6} style={{ color: 'var(--color-accent-700)', marginTop: 1 }} />
                <span className="flex flex-col gap-1">
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>Sent for review</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>We&rsquo;ll email you either way. The review stays visible while we look.</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
