import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { rankedCategories } from '../lib/churches.js'
import { avatarColor } from '../data/constants.js'

export function DashboardScreen() {
  const { profile } = useAuth()
  const { church } = useAdmin()
  const navigate = useNavigate()
  const [unanswered, setUnanswered] = useState([])
  const [counts, setCounts] = useState({ programs: 0, media: 0, socials: 0, sermons: 0 })

  useEffect(() => {
    if (!church) return
    supabase
      .from('reviews')
      .select('id, overall_rating, well_text, author_display_name, author_initials, created_at, review_replies(review_id)')
      .eq('church_id', church.id)
      .eq('status', 'published')
      .order('created_at', { ascending: true })
      .then(({ data }) => setUnanswered((data || []).filter((r) => !r.review_replies).slice(0, 3)))

    Promise.all([
      supabase.from('church_programs').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
      supabase.from('church_media').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
      supabase.from('church_social_links').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
      supabase.from('sermon_notes').select('id', { count: 'exact', head: true }).eq('church_id', church.id),
    ]).then(([p, m, s, sn]) => setCounts({ programs: p.count || 0, media: m.count || 0, socials: s.count || 0, sermons: sn.count || 0 }))
  }, [church])

  if (!church) return null

  const scores = church.category_scores || {}
  const topBars = rankedCategories({ rated: true, scores }).slice(0, 4)
  const checklist = [
    { label: 'Add your service times', done: church.service_times !== 'Service times not listed', to: '/admin/profile?tab=times' },
    { label: 'Check off your programs', done: counts.programs > 0, to: '/admin/profile?tab=programs' },
    { label: 'Add photos', done: counts.media > 0, to: '/admin/profile?tab=media' },
    { label: 'Add your website & socials', done: counts.socials > 0, to: '/admin/profile?tab=links' },
    { label: 'Post a sermon note', done: counts.sermons > 0, to: '/admin/sermons' },
  ]
  const completePct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 26, letterSpacing: '-.01em' }}>Good {timeOfDay()}, {profile?.name?.split(' ')[0] || 'there'}</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
          {unanswered.length > 0 ? `${unanswered.length} review${unanswered.length > 1 ? 's' : ''} waiting on a reply — the daily job.` : "You're caught up on replies."}
        </p>
      </div>

      <div className="flex flex-col gap-[10px]">
        {unanswered.map((q) => (
          <div key={q.id} className="grid items-start border" style={{ gridTemplateColumns: '38px 1fr auto', gap: 16, borderColor: 'var(--color-divider)', padding: '18px 20px', background: 'var(--color-bg)' }}>
            <span className="rounded-full flex items-center justify-center" style={{ width: 38, height: 38, background: avatarColor(q.author_initials), fontSize: 12, color: 'var(--color-surface)' }}>{q.author_initials}</span>
            <span className="flex flex-col gap-[6px] min-w-0">
              <span className="flex items-center gap-[9px] flex-wrap">
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{q.author_display_name}</span>
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{'★'.repeat(q.overall_rating)}</span>
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 76%,transparent)' }}>{q.well_text}</span>
            </span>
            <button onClick={() => navigate(`/admin/reviews?review=${q.id}`)} className="border" style={{ borderColor: 'var(--color-accent-700)', color: 'var(--color-accent-800)', padding: '8px 14px', fontSize: 12.5, whiteSpace: 'nowrap' }}>Reply</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border" style={{ borderColor: 'var(--color-divider)', padding: 20 }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Your standing</span>
          <div className="flex items-baseline gap-[10px]" style={{ marginTop: 12 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 34, lineHeight: 1 }}>{church.avg_rating.toFixed(1)}</span>
            <span style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>from {church.review_count} reviews</span>
          </div>
          <div className="flex flex-col gap-[9px]" style={{ marginTop: 18 }}>
            {topBars.map((b) => (
              <span key={b.key} className="grid items-center" style={{ gridTemplateColumns: '132px 1fr 30px', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{b.label}</span>
                <span className="block" style={{ height: 5, background: 'var(--color-neutral-200)' }}>
                  <span className="block" style={{ height: 5, width: `${(b.score / 5) * 100}%`, background: 'var(--color-accent)' }} />
                </span>
                <span style={{ fontSize: 12, textAlign: 'right' }}>{b.score.toFixed(1)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="border flex flex-col" style={{ borderColor: 'var(--color-divider)', padding: 20 }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Finish your page</span>
          <span style={{ fontSize: 12.5, marginTop: 10, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{completePct}% complete</span>
          <span className="block" style={{ height: 5, background: 'var(--color-neutral-200)', marginTop: 10 }}>
            <span className="block" style={{ height: 5, width: `${completePct}%`, background: 'var(--color-accent)' }} />
          </span>
          <div className="flex flex-col gap-[9px]" style={{ marginTop: 16 }}>
            {checklist.map((c) => (
              <button key={c.label} onClick={() => navigate(c.to)} className="flex items-center gap-[9px]" style={{ fontSize: 12.5, color: c.done ? 'color-mix(in srgb,var(--color-text) 45%,transparent)' : 'var(--color-accent-700)' }}>
                <span>{c.done ? '✓' : '○'}</span>
                <span style={{ textDecoration: c.done ? 'line-through' : 'none' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
