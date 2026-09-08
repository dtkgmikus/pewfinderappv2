import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, X } from 'lucide-react'
import { fetchChurches } from '../lib/churches.js'
import { PlatePhoto } from '../components/ui/PlatePhoto.jsx'
import { StarRow } from '../components/ui/Stars.jsx'

// Atlantic County, NJ roughly spans Absecon Island to the Pine Barrens —
// this center + zoom shows the whole county on load.
const COUNTY_CENTER = [39.4600, -74.6200]
const COUNTY_ZOOM = 10

function pinIcon({ rating, selected }) {
  const bg = selected ? 'var(--color-accent-2)' : 'var(--color-accent)'
  const label = rating > 0 ? rating.toFixed(1) : '—'
  const size = selected ? 34 : 28
  const head = selected ? 24 : 20
  return L.divIcon({
    className: 'pf-map-pin',
    html: `
      <div style="width:${size}px;height:${size}px;position:relative;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));">
        <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${bg};transform:rotate(-45deg);position:absolute;top:0;left:0;"></div>
        <div style="width:${head}px;height:${head}px;border-radius:50%;background:var(--color-bg);position:absolute;top:${(size - head) / 2}px;left:${(size - head) / 2}px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:9.5px;font-weight:600;color:var(--color-text);">${label}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  })
}

/** Pans the map to the selected church without changing zoom abruptly. */
function FlyToSelected({ selected }) {
  const map = useMap()
  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 13), { duration: 0.5 })
  }, [selected?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export function MapScreen() {
  const navigate = useNavigate()
  const [churches, setChurches] = useState([])
  const [loadError, setLoadError] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchChurches().then((list) => {
      setChurches(list)
      const first = list.find((c) => c.lat != null && c.lng != null && c.rated)
      if (first) setSelectedId(first.id)
    }).catch((e) => { console.error(e); setLoadError(true) })
  }, [])

  const withCoords = useMemo(() => churches.filter((c) => c.lat != null && c.lng != null), [churches])

  const pins = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return withCoords
    return withCoords.filter((c) => `${c.name} ${c.denomination} ${c.town}`.toLowerCase().includes(q))
  }, [withCoords, query])

  const selected = churches.find((c) => c.id === selectedId)

  return (
    <div className="pf-screen flex-1 relative overflow-hidden">
      <MapContainer center={COUNTY_CENTER} zoom={COUNTY_ZOOM} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelected selected={selected} />
        {pins.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={pinIcon({ rating: p.avg_rating, selected: p.id === selectedId })}
            eventHandlers={{ click: () => setSelectedId(p.id) }}
          />
        ))}
      </MapContainer>

      <div className="absolute flex items-center gap-[9px] border rounded-[var(--radius-md)]" style={{ top: 56, left: 16, right: 16, padding: '10px 12px', borderColor: 'var(--color-divider)', background: 'color-mix(in srgb,var(--color-surface) 95%,transparent)', zIndex: 500 }}>
        <Search size={15} strokeWidth={1.5} style={{ flex: 'none' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this map"
          className="flex-1 min-w-0 border-0 bg-transparent text-[13px] outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ flex: 'none', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
            <X size={15} strokeWidth={1.6} />
          </button>
        )}
      </div>

      {loadError && (
        <div className="absolute rounded-[var(--radius-md)] border" style={{ left: 16, right: 16, top: 106, padding: '10px 12px', background: 'var(--color-surface)', borderColor: 'var(--color-accent-700)', fontSize: 13, color: 'var(--color-accent-700)', zIndex: 500 }}>
          Couldn&rsquo;t load churches — check your connection and try reloading.
        </div>
      )}
      {!loadError && churches.length > 0 && withCoords.length === 0 && (
        <div className="absolute rounded-[var(--radius-md)] border" style={{ left: 16, right: 16, top: 106, padding: '10px 12px', background: 'var(--color-surface)', borderColor: 'var(--color-accent-700)', fontSize: 13, color: 'var(--color-accent-700)', zIndex: 500 }}>
          {churches.length} churches loaded, but none have map coordinates yet — run <code>patch-002-county-wide-schema.sql</code> then <code>patch-003-atlantic-county-churches.sql</code> in Supabase.
        </div>
      )}
      {!loadError && churches.length > 0 && withCoords.length > 0 && query.trim() && pins.length === 0 && (
        <div className="absolute rounded-[var(--radius-md)] border" style={{ left: 16, right: 16, top: 106, padding: '10px 12px', background: 'var(--color-surface)', borderColor: 'var(--color-divider)', fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)', zIndex: 500 }}>
          No churches match &ldquo;{query.trim()}&rdquo;.
        </div>
      )}

      {selected && (
        <div className="absolute rounded-[var(--radius-lg)] border" style={{ left: 12, right: 12, bottom: 44, background: 'var(--color-bg)', borderColor: 'var(--color-divider)', boxShadow: 'var(--shadow-lg)', padding: 14, zIndex: 500 }}>
          <div className="flex gap-3 items-start">
            <div className="plate flex-none relative" style={{ width: 54, height: 54 }}><PlatePhoto url={selected.thumbnail_photo_url} /></div>
            <div className="flex-1 min-w-0">
              <button onClick={() => navigate(`/church/${selected.slug}`)} className="pf-h text-left" style={{ fontSize: 18, color: 'var(--color-text)' }}>{selected.name}</button>
              <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)', marginTop: 2 }}>{selected.denomination} · {selected.town} · {selected.service_times}</div>
              {selected.rated ? (
                <div className="flex items-center gap-[6px]" style={{ marginTop: 6, color: 'var(--color-accent-2)' }}>
                  <StarRow value={selected.avg_rating} size={12} />
                  <span style={{ fontSize: 12.5, color: 'var(--color-text)' }}>{selected.avg_rating.toFixed(1)}</span>
                  <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>({selected.review_count})</span>
                </div>
              ) : (
                <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-accent-600)' }}>No reviews yet — be the first</div>
              )}
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <button onClick={() => navigate(`/church/${selected.slug}`)} className="btn btn-primary-solid flex-1" style={{ padding: 9, fontSize: 14.5 }}>View profile</button>
            <button onClick={() => navigate(`/write?church=${selected.slug}`)} className="btn btn-secondary flex-1" style={{ padding: 9, fontSize: 14.5 }}>Review it</button>
          </div>
        </div>
      )}
    </div>
  )
}
