import { useEffect, useMemo, useState } from 'react'
import { Printer, Mail, Users } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { ProLock } from './ProLock.jsx'
import { CATEGORY_LABEL } from '../data/constants.js'

const MIN_SAMPLE = 10

const BLOCKS = [
  { key: 'traffic', label: 'Views & saves', sub: 'Page activity, 30 days' },
  { key: 'search', label: 'Search terms', sub: 'What surfaced your church' },
  { key: 'gaps', label: 'Category gaps', sub: 'You against the area average' },
  { key: 'who', label: "Who's looking", sub: 'Age bands and household stage' },
  { key: 'where', label: 'Where they come from', sub: 'Towns and drive distance' },
  { key: 'seek', label: 'What they want', sub: 'Worship style, denomination, kids' },
  { key: 'churched', label: 'Churched or looking', sub: 'Where they are right now' },
]

export function InsightsScreen() {
  const { church, isPro } = useAdmin()
  const [active, setActive] = useState('traffic')
  const [views, setViews] = useState([])
  const [categoryScores, setCategoryScores] = useState([])
  const [distinctViewers, setDistinctViewers] = useState(0)

  useEffect(() => {
    if (!isPro) return
    supabase.from('church_page_views').select('event_type, search_term, viewer_profile_id').eq('church_id', church.id)
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .then(({ data }) => {
        setViews(data || [])
        setDistinctViewers(new Set((data || []).map((v) => v.viewer_profile_id).filter(Boolean)).size)
      })
    supabase.from('church_category_scores').select('church_id, category_key, avg_score, n').then(({ data }) => setCategoryScores(data || []))
  }, [church, isPro])

  const trafficRows = useMemo(() => {
    const counts = {}
    views.forEach((v) => { counts[v.event_type] = (counts[v.event_type] || 0) + 1 })
    const labels = { view: 'Page views', save: 'Saved your church', directions: 'Tapped directions', service_times: 'Tapped service times', photo: 'Opened a photo', sermon_note: 'Opened a sermon note' }
    const max = Math.max(1, ...Object.values(counts))
    return Object.entries(labels).map(([key, label]) => ({ label, value: counts[key] || 0, pct: ((counts[key] || 0) / max) * 100 }))
  }, [views])

  const searchRows = useMemo(() => {
    const counts = {}
    views.filter((v) => v.event_type === 'search' && v.search_term).forEach((v) => { counts[v.search_term] = (counts[v.search_term] || 0) + 1 })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const max = Math.max(1, ...entries.map((e) => e[1]))
    return entries.map(([term, n]) => ({ label: term, value: n, pct: (n / max) * 100 }))
  }, [views])

  const gapRows = useMemo(() => {
    const mine = Object.fromEntries(categoryScores.filter((r) => r.church_id === church?.id).map((r) => [r.category_key, r.avg_score]))
    const others = {}
    categoryScores.filter((r) => r.church_id !== church?.id && r.n > 0).forEach((r) => {
      others[r.category_key] = others[r.category_key] || []
      others[r.category_key].push(r.avg_score)
    })
    return Object.entries(CATEGORY_LABEL).map(([key, label]) => {
      const areaAvg = others[key]?.length ? others[key].reduce((a, b) => a + b, 0) / others[key].length : null
      return { label, mine: mine[key], area: areaAvg }
    }).filter((r) => r.mine != null && r.area != null)
  }, [categoryScores, church])

  if (!isPro) return <ProLock section="insights" />

  const block = BLOCKS.find((b) => b.key === active)
  const needsProfiles = ['who', 'where', 'seek', 'churched'].includes(active)
  const notEnoughData = needsProfiles && distinctViewers < MIN_SAMPLE

  return (
    <div className="flex flex-col gap-[22px] max-w-[820px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Insights</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Aggregate only — nothing shown below {MIN_SAMPLE} people.</p>
      </div>

      <div className="flex gap-[7px] flex-wrap">
        {BLOCKS.map((b) => (
          <button key={b.key} onClick={() => setActive(b.key)} className="border" style={{ fontSize: 12, padding: '7px 11px', borderColor: active === b.key ? 'var(--color-accent)' : 'var(--color-divider)', color: active === b.key ? 'var(--color-accent-800)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
            {b.label}
          </button>
        ))}
      </div>

      <div className="border flex flex-col gap-[14px]" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
        <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{block.label}</span>

        {notEnoughData && (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
            Not enough data yet — fewer than {MIN_SAMPLE} identified visitors have viewed your page. This fills in as more signed-in members visit.
          </p>
        )}

        {!notEnoughData && active === 'traffic' && (
          <BarRows rows={trafficRows} formatValue={(v) => v.toLocaleString()} />
        )}
        {!notEnoughData && active === 'search' && (
          searchRows.length ? <BarRows rows={searchRows} formatValue={(v) => v.toLocaleString()} /> : <Empty />
        )}
        {!notEnoughData && active === 'gaps' && (
          gapRows.length ? (
            <div className="flex flex-col gap-[10px]">
              {gapRows.map((r) => {
                const below = r.mine < r.area
                return (
                  <span key={r.label} className="grid items-center" style={{ gridTemplateColumns: '210px 1fr 90px', gap: 14 }}>
                    <span style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>{r.label}</span>
                    <span className="block" style={{ height: 7, background: 'var(--color-neutral-200)' }}>
                      <span className="block" style={{ height: 7, width: `${(r.mine / 5) * 100}%`, background: below ? 'var(--color-neutral-600)' : 'var(--color-accent)' }} />
                    </span>
                    <span style={{ fontSize: 12.5, textAlign: 'right', color: below ? 'var(--color-accent-800)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{r.mine.toFixed(1)} / {r.area.toFixed(1)}</span>
                  </span>
                )
              })}
            </div>
          ) : <Empty />
        )}
      </div>

      <div className="flex items-center gap-[12px] flex-wrap border-t" style={{ paddingTop: 18, borderColor: 'var(--color-divider)' }}>
        <button className="flex items-center gap-2 border" style={{ borderColor: 'var(--color-divider)', padding: '10px 15px', fontSize: 12.5 }}><Printer size={14} strokeWidth={1.6} /><span>One-page report for the board</span></button>
        <button className="flex items-center gap-2 border" style={{ borderColor: 'var(--color-divider)', padding: '10px 15px', fontSize: 12.5 }}><Mail size={14} strokeWidth={1.6} /><span>Email this monthly to staff</span></button>
        <span className="flex-1" />
        <span className="flex items-center gap-[7px]" style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)' }}><Users size={13} strokeWidth={1.6} /><span>Aggregate only · nothing shown below {MIN_SAMPLE} people</span></span>
      </div>
    </div>
  )
}

function BarRows({ rows, formatValue }) {
  return (
    <div className="flex flex-col gap-[10px]">
      {rows.map((r) => (
        <span key={r.label} className="grid items-center" style={{ gridTemplateColumns: '210px 1fr 60px', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 72%,transparent)' }}>{r.label}</span>
          <span className="block" style={{ height: 7, background: 'var(--color-neutral-200)' }}>
            <span className="block" style={{ height: 7, width: `${r.pct}%`, background: 'var(--color-accent)' }} />
          </span>
          <span style={{ fontSize: 12.5, textAlign: 'right' }}>{formatValue(r.value)}</span>
        </span>
      ))}
    </div>
  )
}

function Empty() {
  return <p style={{ margin: 0, fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Nothing to show yet.</p>
}
