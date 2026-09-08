import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Bookmark, Star, ChevronsUpDown, BadgeCheck, ThumbsUp, Flag,
  Building2, PlayCircle,
} from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { fetchChurchBySlug, rankedCategories } from '../lib/churches.js'
import { fetchReviewsForChurch, toggleHelpful, flagReviewAsMember } from '../lib/reviews.js'
import { PlatePhoto } from '../components/ui/PlatePhoto.jsx'
import { StarRow } from '../components/ui/Stars.jsx'
import { avatarColor } from '../data/constants.js'

export function ChurchProfileScreen() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [church, setChurch] = useState(null)
  const [reviews, setReviews] = useState([])
  const [notes, setNotes] = useState([])
  const [tab, setTab] = useState('reviews')
  const [showAllCats, setShowAllCats] = useState(false)
  const [saved, setSaved] = useState(false)
  const [helpfulOn, setHelpfulOn] = useState({})
  const [flagged, setFlagged] = useState({})

  useEffect(() => {
    let alive = true
    fetchChurchBySlug(slug).then(async (c) => {
      if (!alive || !c) return
      setChurch(c)
      const [rev, notesRes] = await Promise.all([
        fetchReviewsForChurch(c.id),
        supabase.from('sermon_notes').select('*').eq('church_id', c.id).order('date_preached', { ascending: false }),
      ])
      setReviews(rev)
      setNotes(notesRes.data || [])
      if (user) {
        const { data } = await supabase.from('saved_churches').select('church_id').eq('church_id', c.id).eq('member_id', user.id).maybeSingle()
        setSaved(!!data)
      }
    }).catch(console.error)
    return () => { alive = false }
  }, [slug, user])

  const ranked = useMemo(() => (church ? rankedCategories(church) : []), [church])
  const strengths = ranked.slice(0, 3)
  const weaknesses = ranked.slice(-3).reverse()
  const middle = ranked.slice(3, -3)

  if (!church) return <div className="flex-1 pf-scroll pf-screen" style={{ padding: 60 }}>Loading…</div>

  const toggleSave = async () => {
    if (!user) return navigate('/signup')
    if (saved) await supabase.from('saved_churches').delete().eq('church_id', church.id).eq('member_id', user.id)
    else await supabase.from('saved_churches').insert({ church_id: church.id, member_id: user.id })
    setSaved(!saved)
  }

  const onHelpful = async (r) => {
    if (!user) return navigate('/signup')
    const on = !!helpfulOn[r.id]
    await toggleHelpful(r.id, user.id, on)
    setHelpfulOn((s) => ({ ...s, [r.id]: !on }))
  }

  const onFlag = async (r) => {
    if (!user) return navigate('/signup')
    await flagReviewAsMember(r.id, user.id, 'Reported by a member')
    setFlagged((s) => ({ ...s, [r.id]: true }))
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div className="flex items-center gap-3 px-3" style={{ position: 'sticky', top: 0, zIndex: 2, height: 48, background: 'color-mix(in srgb,var(--color-bg) 92%,transparent)', backdropFilter: 'blur(6px)', borderBottom: '1px solid var(--color-divider)' }}>
        <button onClick={() => navigate(-1)} className="btn btn-icon btn-secondary flex-none flex items-center justify-center">
          <ChevronLeft size={17} strokeWidth={1.7} />
        </button>
        <span className="pf-h flex-1 min-w-0 truncate" style={{ fontSize: 14 }}>{church.name}</span>
        <button onClick={toggleSave} className="btn btn-icon btn-secondary flex-none flex items-center justify-center" style={{ color: saved ? 'var(--color-accent-800)' : 'var(--color-text)' }}>
          <Bookmark size={16} strokeWidth={1.7} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="relative">
        <div className="plate relative" style={{ height: 186, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
          <PlatePhoto url={church.hero_photo_url} label="Church exterior" />
        </div>
      </div>

      <div className="px-5" style={{ paddingTop: 16 }}>
        <h1 className="pf-h" style={{ fontSize: 29, fontWeight: 400 }}>{church.name}</h1>
        <div style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)', marginTop: 5 }}>
          {church.denomination} · {church.street} · {church.distance_mi.toFixed(1)} mi
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 11, color: 'var(--color-accent)' }}>
          {church.rated ? (
            <span className="flex items-center gap-2">
              <StarRow value={church.avg_rating} size={15} />
              <span className="pf-h" style={{ fontSize: 20, fontWeight: 400, color: 'var(--color-text)' }}>{church.avg_rating.toFixed(1)}</span>
              <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{church.review_count} reviews</span>
            </span>
          ) : (
            <span style={{ fontSize: 11.5, color: 'var(--color-accent-600)' }}>Unclaimed listing · no reviews yet</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-[7px] px-5" style={{ paddingTop: 15 }}>
        {church.facts.map((t, i) => (
          <span key={i} className="flex-none border rounded-[var(--radius-md)]" style={{ padding: '5px 9px', fontSize: 11, borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 68%,transparent)' }}>{t}</span>
        ))}
      </div>

      <div className="flex gap-[9px] px-5" style={{ paddingTop: 15 }}>
        <button onClick={() => navigate(`/write?church=${church.slug}`)} className="btn btn-primary-solid flex-1" style={{ padding: 10, fontSize: 14 }}>Write a review</button>
        <button onClick={() => navigate('/map')} className="btn btn-secondary flex-none" style={{ padding: '10px 13px', fontSize: 14 }}>Directions</button>
      </div>

      {!church.rated && (
        <div className="text-center flex flex-col items-center gap-[9px] border rounded-[var(--radius-md)]" style={{ margin: '26px 20px 0', padding: 20, borderColor: 'var(--color-divider)' }}>
          <Star size={22} strokeWidth={1.2} style={{ color: 'var(--color-accent)' }} />
          <h2 className="pf-h" style={{ fontSize: 19 }}>Nobody has reviewed this church</h2>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
            Service times and details aren&rsquo;t listed yet either. If you&rsquo;ve visited, your review is the first thing the next visitor will read.
          </p>
          <button onClick={() => navigate(`/write?church=${church.slug}`)} className="btn btn-primary-solid" style={{ marginTop: 4, padding: '9px 15px', fontSize: 13.5 }}>Write the first review</button>
        </div>
      )}

      {church.rated && (
        <>
          <div className="px-5" style={{ paddingTop: 26 }}>
            <div className="flex items-baseline justify-between">
              <h2 className="pf-h" style={{ fontSize: 19 }}>What visitors rate highest</h2>
              <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>Ranked</span>
            </div>
          </div>
          <div className="px-5 flex flex-col gap-[11px]" style={{ paddingTop: 12 }}>
            {strengths.map((s) => <ScoreBar key={s.key} s={s} accent />)}
          </div>

          <div className="px-5" style={{ paddingTop: 24 }}><h2 className="pf-h" style={{ fontSize: 19 }}>Room to grow</h2></div>
          <div className="px-5 flex flex-col gap-[11px]" style={{ paddingTop: 12 }}>
            {weaknesses.map((s) => <ScoreBar key={s.key} s={s} />)}
          </div>

          {middle.length > 0 && (
            <>
              <div className="px-5" style={{ paddingTop: 16 }}>
                <button onClick={() => setShowAllCats((v) => !v)} className="flex items-center gap-[6px]" style={{ fontSize: 12, color: 'var(--color-accent-600)' }}>
                  <ChevronsUpDown size={13} strokeWidth={1.6} />{showAllCats ? 'Hide the middle five' : 'Show all eleven categories'}
                </button>
              </div>
              {showAllCats && (
                <div className="px-5 flex flex-col gap-[9px]" style={{ paddingTop: 14 }}>
                  {middle.map((s) => (
                    <div key={s.key} className="flex items-center justify-between gap-[10px] border-b" style={{ paddingBottom: 8, borderColor: 'color-mix(in srgb,var(--color-text) 10%,transparent)' }}>
                      <span style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 78%,transparent)' }}>{s.label}</span>
                      <span className="flex items-center gap-[7px]" style={{ color: 'var(--color-accent)' }}>
                        <StarRow value={s.score} size={11} />
                        <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{s.score.toFixed(1)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-[18px] border-b px-5" style={{ marginTop: 26, borderColor: 'var(--color-divider)' }}>
            {[['reviews', 'Reviews'], ['notes', 'Sermon notes']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ fontSize: 12, letterSpacing: '.05em', textTransform: 'uppercase', padding: '9px 0', borderBottom: `2px solid ${tab === id ? 'var(--color-accent)' : 'transparent'}`, color: tab === id ? 'var(--color-text)' : 'color-mix(in srgb,var(--color-text) 48%,transparent)' }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'notes' && (
            <div style={{ paddingTop: 6 }}>
              {notes.map((n) => (
                <div key={n.id} className="px-5 border-b" style={{ padding: '16px 20px', borderColor: 'var(--color-divider)' }}>
                  <div className="flex items-baseline justify-between gap-[10px]">
                    <span className="pf-h" style={{ fontSize: 16 }}>{n.title}</span>
                    <span style={{ fontSize: 10.5, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)', whiteSpace: 'nowrap' }}>{n.date_preached}</span>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-accent-600)', marginTop: 6 }}>{n.scripture}</div>
                  <p style={{ margin: '9px 0 0', fontSize: 12.5, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 80%,transparent)' }}>{n.summary}</p>
                  {n.media_link && (
                    <a href={n.media_link} target="_blank" rel="noreferrer" className="flex items-center gap-[6px]" style={{ marginTop: 11, color: 'var(--color-accent-700)', fontSize: 11.5 }}>
                      <PlayCircle size={13} strokeWidth={1.6} /><span>Listen or watch</span>
                    </a>
                  )}
                </div>
              ))}
              {notes.length === 0 && (
                <div className="px-5" style={{ padding: '26px 20px', fontSize: 12.5, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                  This church hasn&rsquo;t posted sermon notes. Save them and you&rsquo;ll be notified if they start.
                </div>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <>
              <div className="px-5" style={{ paddingTop: 22 }}>
                <h2 className="pf-h" style={{ fontSize: 19 }}>{church.review_count === 1 ? '1 review' : `${church.review_count} reviews`}</h2>
              </div>
              {reviews.map((r) => (
                <div key={r.id} className="px-5 border-t" style={{ marginTop: 14, padding: '15px 20px 16px', borderColor: 'var(--color-divider)' }}>
                  <div className="flex items-center gap-[10px]">
                    <div className="flex-none rounded-full border flex items-center justify-center" style={{ width: 34, height: 34, borderColor: 'var(--color-divider)', background: avatarColor(r.author_initials), fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-surface)' }}>
                      {r.author_initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.author_display_name}</div>
                      <div style={{ fontSize: 10.5, color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Visited {r.visited_on}</div>
                    </div>
                    <span style={{ flex: 'none', color: 'var(--color-accent)' }}><StarRow value={r.overall_rating} size={12} /></span>
                  </div>
                  {r.well_text && <p style={{ margin: '10px 0 0', fontSize: 12.5, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 82%,transparent)' }}>{r.well_text}</p>}
                  {r.tags?.length > 0 && (
                    <div className="flex gap-[6px] flex-wrap" style={{ marginTop: 10 }}>
                      {r.tags.map((t) => (
                        <span key={t} style={{ fontSize: 10.5, padding: '3px 7px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb,var(--color-accent) 12%,transparent)', color: 'var(--color-accent-700)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {r.reply && (
                    <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: '1px solid var(--color-accent)' }}>
                      <div className="flex items-center gap-[5px]" style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--color-accent-600)' }}>
                        <BadgeCheck size={12} strokeWidth={1.6} /><span>Response from {church.name}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.6, fontStyle: 'italic', color: 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>{r.reply}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4" style={{ marginTop: 12 }}>
                    <button onClick={() => onHelpful(r)} className="flex items-center gap-[5px]" style={{ fontSize: 11, color: helpfulOn[r.id] ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                      <ThumbsUp size={12} strokeWidth={1.6} fill={helpfulOn[r.id] ? 'currentColor' : 'none'} />
                      <span>Helpful · {r.helpfulCount + (helpfulOn[r.id] ? 1 : 0)}</span>
                    </button>
                    <button onClick={() => onFlag(r)} className="flex items-center gap-[5px]" style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>
                      <Flag size={12} strokeWidth={1.6} /><span>{flagged[r.id] ? 'Reported' : 'Report'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {!church.claimed && (
        <div className="flex items-start gap-[10px] border-t px-5" style={{ margin: '26px 20px 0', paddingTop: 16, borderColor: 'var(--color-divider)' }}>
          <Building2 size={14} strokeWidth={1.6} style={{ color: 'var(--color-accent-600)', marginTop: 2 }} />
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Is this your church?</div>
            <p style={{ margin: '5px 0 0', fontSize: 11.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
              Claiming is free. Reply to reviews, fix your service times, keep your programs current.
            </p>
            <button onClick={() => navigate('/admin')} className="border" style={{ marginTop: 9, fontSize: 11.5, padding: '8px 13px', borderColor: 'var(--color-accent)', color: 'var(--color-accent-700)' }}>
              Claim this page
            </button>
          </div>
        </div>
      )}
      <div style={{ height: 1, background: 'var(--color-divider)', marginBottom: 12 }} />
    </div>
  )
}

function ScoreBar({ s, accent }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-[10px]">
        <span style={{ fontSize: 12.5 }}>{s.label}</span>
        <span style={{ fontSize: 12, color: accent ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{s.score.toFixed(1)}</span>
      </div>
      <div style={{ marginTop: 5, height: 3, background: 'color-mix(in srgb,var(--color-text) 12%,transparent)' }}>
        <div style={{ height: 3, width: `${(s.score / 5) * 100}%`, background: accent ? 'var(--color-accent)' : 'color-mix(in srgb,var(--color-text) 42%,transparent)' }} />
      </div>
    </div>
  )
}
