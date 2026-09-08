import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rss, ThumbsUp, Flag } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { fetchFeed, toggleHelpful, flagReviewAsMember } from '../lib/reviews.js'
import { StarRow } from '../components/ui/Stars.jsx'
import { avatarColor } from '../data/constants.js'

export function FeedScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [helpfulOn, setHelpfulOn] = useState({})
  const [flagged, setFlagged] = useState({})

  useEffect(() => { fetchFeed().then(setItems).catch(console.error) }, [])

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
      <div className="px-5 border-b" style={{ position: 'sticky', top: 0, zIndex: 2, paddingTop: 24, paddingBottom: 16, background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}>
        <div className="flex items-center gap-[5px]" style={{ color: 'var(--color-accent-600)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <Rss size={12} strokeWidth={1.6} /><span>Recent activity</span>
        </div>
        <h1 className="pf-h" style={{ fontSize: 33, fontWeight: 400, margin: '9px 0 0' }}>Lately, near you</h1>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>Newest reviews from churches around Egg Harbor Township and Mays Landing.</p>
      </div>

      {items.map((r) => (
        <div key={r.id} className="px-5 border-b" style={{ padding: '16px 20px', borderColor: 'var(--color-divider)' }}>
          <div className="flex items-center gap-[10px]">
            <div className="flex-none rounded-full border flex items-center justify-center" style={{ width: 32, height: 32, borderColor: 'var(--color-divider)', background: avatarColor(r.author_initials), fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-surface)' }}>
              {r.author_initials}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 13 }}><span style={{ fontWeight: 600 }}>{r.author_display_name}</span> reviewed</div>
              <button onClick={() => navigate(`/church/${r.churches.slug}`)} className="pf-h" style={{ fontSize: 16, color: 'var(--color-text)' }}>{r.churches.name}</button>
            </div>
            <span style={{ flex: 'none', fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)' }}>{timeAgo(r.created_at)}</span>
          </div>
          <div className="flex items-center gap-[7px]" style={{ marginTop: 9, color: 'var(--color-accent-2)' }}>
            <StarRow value={r.overall_rating} size={12} />
            <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Visited {r.visited_on}</span>
          </div>
          {r.well_text && <p style={{ margin: '9px 0 0', fontSize: 13.5, lineHeight: 1.62, color: 'color-mix(in srgb,var(--color-text) 82%,transparent)' }}>{r.well_text}</p>}
          {r.tags?.length > 0 && (
            <div className="flex gap-[6px] flex-wrap" style={{ marginTop: 10 }}>
              {r.tags.map((t) => (
                <span key={t} style={{ fontSize: 11.5, padding: '3px 7px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb,var(--color-accent) 12%,transparent)', color: 'var(--color-accent-700)' }}>{t}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4" style={{ marginTop: 11 }}>
            <button onClick={() => onHelpful(r)} className="flex items-center gap-[5px]" style={{ fontSize: 12, color: helpfulOn[r.id] ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
              <ThumbsUp size={12} strokeWidth={1.6} fill={helpfulOn[r.id] ? 'currentColor' : 'none'} />
              <span>Helpful · {r.helpfulCount + (helpfulOn[r.id] ? 1 : 0)}</span>
            </button>
            <button onClick={() => onFlag(r)} className="flex items-center gap-[5px]" style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>
              <Flag size={12} strokeWidth={1.6} /><span>{flagged[r.id] ? 'Reported' : 'Report'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}
