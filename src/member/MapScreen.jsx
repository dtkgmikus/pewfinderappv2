import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Star } from 'lucide-react'
import { fetchChurches } from '../lib/churches.js'
import { PlatePhoto } from '../components/ui/PlatePhoto.jsx'
import { StarRow } from '../components/ui/Stars.jsx'

export function MapScreen() {
  const navigate = useNavigate()
  const [churches, setChurches] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    fetchChurches().then((list) => {
      setChurches(list)
      const pinned = list.find((c) => c.map_x != null)
      if (pinned) setSelectedId(pinned.id)
    }).catch(console.error)
  }, [])

  const pins = churches.filter((c) => c.map_x != null)
  const selected = churches.find((c) => c.id === selectedId)

  return (
    <div className="pf-screen flex-1 relative overflow-hidden">
      <div className="plate pf-plate absolute inset-0 flex items-center justify-center" style={{ border: 0 }}>
        <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9.5, letterSpacing: '.06em', color: 'color-mix(in srgb,var(--color-text) 40%,transparent)', textTransform: 'uppercase' }}>
          map tile — Egg Harbor Twp
        </span>
      </div>
      <div className="absolute flex items-center gap-[9px] border rounded-[var(--radius-md)]" style={{ top: 56, left: 16, right: 16, padding: '10px 12px', borderColor: 'var(--color-divider)', background: 'color-mix(in srgb,var(--color-neutral-100) 95%,transparent)' }}>
        <Search size={15} strokeWidth={1.5} />
        <span className="flex-1" style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 45%,transparent)', fontStyle: 'italic' }}>Search this area</span>
        <SlidersHorizontal size={15} strokeWidth={1.5} />
      </div>

      {pins.map((p) => (
        <button
          key={p.id}
          onClick={() => setSelectedId(p.id)}
          className="absolute flex flex-col items-center gap-[3px]"
          style={{ left: `${p.map_x}%`, top: `${p.map_y}%`, transform: 'translate(-50%,-100%)' }}
        >
          <span
            className="flex items-center gap-1 rounded-[var(--radius-md)] border"
            style={{
              padding: '4px 8px', fontSize: 11, boxShadow: 'var(--shadow-sm)',
              borderColor: p.id === selectedId ? 'var(--color-accent-700)' : 'var(--color-divider)',
              background: p.id === selectedId ? 'var(--color-accent)' : 'var(--color-neutral-100)',
              color: p.id === selectedId ? 'var(--color-accent-100)' : 'var(--color-text)',
            }}
          >
            <Star size={10} strokeWidth={1.6} fill="currentColor" />{p.avg_rating.toFixed(1)}
          </span>
          <span style={{ width: 1, height: 9, background: p.id === selectedId ? 'var(--color-accent-700)' : 'var(--color-divider)' }} />
        </button>
      ))}

      {selected && (
        <div className="absolute rounded-[var(--radius-lg)] border" style={{ left: 12, right: 12, bottom: 44, background: 'var(--color-bg)', borderColor: 'var(--color-divider)', boxShadow: 'var(--shadow-lg)', padding: 14 }}>
          <div className="flex gap-3 items-start">
            <div className="plate flex-none relative" style={{ width: 54, height: 54 }}><PlatePhoto url={selected.thumbnail_photo_url} /></div>
            <div className="flex-1 min-w-0">
              <div className="pf-h" style={{ fontSize: 18 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)', marginTop: 2 }}>{selected.denomination} · {selected.distance_mi.toFixed(1)} mi · {selected.service_times}</div>
              <div className="flex items-center gap-[6px]" style={{ marginTop: 6, color: 'var(--color-accent-2)' }}>
                <StarRow value={selected.avg_rating} size={12} />
                <span style={{ fontSize: 11.5, color: 'var(--color-text)' }}>{selected.avg_rating.toFixed(1)}</span>
                <span style={{ fontSize: 11, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>({selected.review_count})</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <button onClick={() => navigate(`/church/${selected.slug}`)} className="btn btn-primary-solid flex-1" style={{ padding: 9, fontSize: 13.5 }}>View profile</button>
            <button onClick={() => navigate(`/write?church=${selected.slug}`)} className="btn btn-secondary flex-1" style={{ padding: 9, fontSize: 13.5 }}>Review it</button>
          </div>
        </div>
      )}
    </div>
  )
}
