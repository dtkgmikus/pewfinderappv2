import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, ArrowUpDown, MapPin, NotebookPen, SearchX, ThumbsUp, CircleUserRound, LocateFixed, Building2, Map as MapIcon } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { fetchChurches, sortChurches, rankedCategories, withDistanceFrom } from '../lib/churches.js'
import { supabase } from '../lib/supabase.js'
import { CATEGORY_LABEL, PRIORITY_CHIP_KEYS, SORT_OPTIONS, ATLANTIC_COUNTY_TOWNS, SEARCH_MODES, SEARCH_MODE_LABEL } from '../data/constants.js'
import { Logo } from '../components/ui/Logo.jsx'
import { Chip } from '../components/ui/Chip.jsx'
import { StarRow } from '../components/ui/Stars.jsx'
import { PlatePhoto } from '../components/ui/PlatePhoto.jsx'

const SEARCH_MODE_ICON = { near_me: LocateFixed, city: Building2, name: Search, county: MapIcon }

export function HomeScreen() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'visits' ? 'visits' : 'discover'
  return tab === 'visits' ? <VisitsTab setTab={() => setParams({ tab: 'visits' })} /> : <DiscoverTab />
}

function TopTabs({ tab }) {
  const [, setParams] = useSearchParams()
  return (
    <div className="flex gap-[22px] px-5 pt-[19px] border-b" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={() => setParams({})}
        className="pb-[9px] -mb-px font-[var(--font-heading)] font-semibold text-[17px]"
        style={{ borderBottom: `2px solid ${tab === 'discover' ? 'var(--color-accent)' : 'transparent'}`, color: tab === 'discover' ? undefined : 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}
      >
        Discover
      </button>
      <button
        onClick={() => setParams({ tab: 'visits' })}
        className="pb-[9px] -mb-px font-[var(--font-heading)] font-semibold text-[17px]"
        style={{ borderBottom: `2px solid ${tab === 'visits' ? 'var(--color-accent)' : 'transparent'}`, color: tab === 'visits' ? undefined : 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}
      >
        Your visits
      </button>
    </div>
  )
}

function DiscoverTab() {
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchMode, setSearchMode] = useState('name')
  const [nameQuery, setNameQuery] = useState('')
  const [cityValue, setCityValue] = useState('')
  const [countyValue, setCountyValue] = useState('')
  const [userCoords, setUserCoords] = useState(null)
  const [geoStatus, setGeoStatus] = useState('idle') // idle | loading | granted | denied | error
  const [sortIdx, setSortIdx] = useState(0)
  const [priorities, setPriorities] = useState([])

  useEffect(() => {
    fetchChurches().then(setChurches).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (profile) setPriorities(profile.priorities || [])
  }, [profile])

  const togglePriority = (key) => {
    setPriorities((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      if (user) {
        supabase.from('profiles').update({ priorities: next }).eq('id', user.id).then(({ error }) => {
          if (error) console.error('Failed to save priorities', error)
        })
      }
      return next
    })
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('error'); return }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoStatus('granted'); setSortIdx(1) },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: false, timeout: 12000 },
    )
  }

  const counties = useMemo(() => [...new Set(churches.map((c) => c.county).filter(Boolean))].sort(), [churches])

  const filtered = useMemo(() => {
    let list = churches
    if (searchMode === 'name' && nameQuery.trim()) {
      const q = nameQuery.trim().toLowerCase()
      list = list.filter((c) => `${c.name} ${c.denomination} ${c.street} ${c.town}`.toLowerCase().includes(q))
    }
    if (searchMode === 'city' && cityValue) list = list.filter((c) => c.town === cityValue)
    if (searchMode === 'county' && countyValue) list = list.filter((c) => c.county === countyValue)
    if (searchMode === 'near_me' && userCoords) list = withDistanceFrom(list, userCoords)
    return sortChurches(list, sortIdx, priorities)
  }, [churches, searchMode, nameQuery, cityValue, countyValue, userCoords, sortIdx, priorities])

  const noResults = searchMode === 'name' && !!nameQuery.trim() && filtered.length === 0

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--color-chrome)', paddingTop: 14 }}>
        <div className="px-5" style={{ position: 'relative' }}>
          <button onClick={() => navigate('/churches/account')} className="flex items-center gap-1" style={{ position: 'absolute', top: 0, right: 0, color: 'var(--color-accent-600)', fontSize: 9.5, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            {user ? <MapPin size={10} strokeWidth={1.6} /> : <CircleUserRound size={12} strokeWidth={1.6} />}
            <span>{user ? 'Atlantic County, NJ' : 'Sign in'}</span>
          </button>
          <div className="flex justify-center">
            <Logo size={30} />
          </div>
          <h1 className="pf-h text-center" style={{ fontSize: 22, fontWeight: 400, margin: '10px 0 0', whiteSpace: 'nowrap' }}>Find the Church for You</h1>
        </div>

        <TopTabs tab="discover" />
      </div>

      <div className="px-5 pt-4">
        <div className="flex gap-[6px]">
          {SEARCH_MODES.map((m) => {
            const Icon = SEARCH_MODE_ICON[m]
            return (
              <button
                key={m}
                onClick={() => setSearchMode(m)}
                className="flex-1 flex flex-col items-center gap-[5px] border rounded-[var(--radius-md)]"
                style={{
                  padding: '9px 4px',
                  borderColor: searchMode === m ? 'var(--color-accent-2)' : 'var(--color-divider)',
                  background: searchMode === m ? 'color-mix(in srgb,var(--color-accent-2) 13%,transparent)' : 'transparent',
                  color: searchMode === m ? 'var(--color-accent-2-700)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)',
                }}
              >
                <Icon size={15} strokeWidth={1.6} />
                <span style={{ fontSize: 9.5, letterSpacing: '.03em' }}>{SEARCH_MODE_LABEL[m]}</span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 10 }}>
          {searchMode === 'name' && (
            <div className="flex items-center gap-[9px] border rounded-[var(--radius-md)] px-3 py-[10px]" style={{ borderColor: 'var(--color-divider)', background: 'var(--color-neutral-100)' }}>
              <Search size={15} strokeWidth={1.5} />
              <input
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Church, denomination, or street"
                className="flex-1 min-w-0 border-0 bg-transparent text-[13.5px] outline-none"
              />
              {nameQuery && (
                <button onClick={() => setNameQuery('')} style={{ color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
                  <X size={15} strokeWidth={1.6} />
                </button>
              )}
            </div>
          )}

          {searchMode === 'city' && (
            <select
              value={cityValue}
              onChange={(e) => setCityValue(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: 14.5 }}
            >
              <option value="">All cities ({churches.length})</option>
              {ATLANTIC_COUNTY_TOWNS.map((t) => (
                <option key={t} value={t}>{t} ({churches.filter((c) => c.town === t).length})</option>
              ))}
            </select>
          )}

          {searchMode === 'county' && (
            <select
              value={countyValue}
              onChange={(e) => setCountyValue(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: 14.5 }}
            >
              <option value="">All counties ({churches.length})</option>
              {counties.map((co) => (
                <option key={co} value={co}>{co} County ({churches.filter((c) => c.county === co).length})</option>
              ))}
            </select>
          )}

          {searchMode === 'near_me' && (
            <div className="flex items-center gap-[9px] border rounded-[var(--radius-md)] px-3 py-[10px]" style={{ borderColor: 'var(--color-divider)', background: 'var(--color-neutral-100)' }}>
              <LocateFixed size={15} strokeWidth={1.5} style={{ color: geoStatus === 'granted' ? 'var(--color-accent-2)' : undefined, flex: 'none' }} />
              <span className="flex-1 min-w-0" style={{ fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 68%,transparent)' }}>
                {geoStatus === 'granted' && 'Showing distance from your location'}
                {geoStatus === 'loading' && 'Finding you…'}
                {geoStatus === 'denied' && "Location blocked — try City or County search instead"}
                {geoStatus === 'error' && "Couldn't get your location — try City or County search instead"}
                {geoStatus === 'idle' && 'Use your location to sort churches by distance'}
              </span>
              {geoStatus !== 'loading' && (
                <button onClick={useMyLocation} className="flex-none" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-2-700)' }}>
                  {geoStatus === 'granted' ? 'Refresh' : 'Use my location'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="m-0 px-5" style={{ padding: '17px 20px 8px', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
        What matters most to you
      </p>
      <div className="flex flex-wrap gap-[7px] px-5">
        {PRIORITY_CHIP_KEYS.map((key) => (
          <Chip key={key} active={priorities.includes(key)} onClick={() => togglePriority(key)}>
            {CATEGORY_LABEL[key]}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between px-5" style={{ padding: '17px 20px 9px' }}>
        <span style={{ fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          {searchMode === 'name' && nameQuery.trim() && `${filtered.length} ${filtered.length === 1 ? 'match' : 'matches'} for "${nameQuery.trim()}"`}
          {searchMode === 'name' && !nameQuery.trim() && `${filtered.length} churches · Atlantic County`}
          {searchMode === 'city' && `${filtered.length} churches · ${cityValue || 'all cities'}`}
          {searchMode === 'county' && `${filtered.length} churches · ${countyValue ? `${countyValue} County` : 'all counties'}`}
          {searchMode === 'near_me' && `${filtered.length} churches${geoStatus === 'granted' ? ', sorted by distance' : ''}`}
        </span>
        <button onClick={() => setSortIdx((i) => (i + 1) % SORT_OPTIONS.length)} className="flex items-center gap-[5px] text-[11.5px]" style={{ color: 'var(--color-accent-600)' }}>
          <ArrowUpDown size={12} strokeWidth={1.6} />{SORT_OPTIONS[sortIdx]}
        </button>
      </div>

      {!loading && filtered.map((c) => {
        const ranked = rankedCategories(c)
        return (
          <button
            key={c.id}
            onClick={() => navigate(`/churches/church/${c.slug}`)}
            className="pf-tap block w-full text-left px-5 py-[15px] border-t"
            style={{ borderColor: 'var(--color-divider)' }}
          >
            <div className="flex gap-[13px] items-start">
              <div className="plate flex-none relative" style={{ width: 62, height: 62 }}>
                <PlatePhoto url={c.thumbnail_photo_url} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="pf-h" style={{ fontSize: 19 }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)', marginTop: 3 }}>{c.denomination} · {c.street}</div>
                <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 48%,transparent)', marginTop: 2 }}>
                  {c.town}{searchMode === 'near_me' && geoStatus === 'granted' && !c.distance_unknown && ` · ${c.distance_mi.toFixed(1)} mi`}
                </div>
                {c.rated ? (
                  <div>
                    <div className="flex items-center gap-[6px]" style={{ marginTop: 7, color: 'var(--color-accent-2)' }}>
                      <StarRow value={c.avg_rating} size={12} />
                      <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{c.avg_rating.toFixed(1)}</span>
                      <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>({c.review_count})</span>
                    </div>
                    {ranked.length > 0 && (
                      <div className="flex gap-[6px] flex-wrap" style={{ marginTop: 9 }}>
                        <span style={{ fontSize: 11.5, padding: '3px 7px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb,var(--color-accent) 13%,transparent)', color: 'var(--color-accent-700)' }}>
                          Strong: {ranked[0].label}
                        </span>
                        <span style={{ fontSize: 11.5, padding: '3px 7px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>
                          Weak: {ranked[ranked.length - 1].label}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-[5px]" style={{ marginTop: 8, color: 'var(--color-accent-600)', fontSize: 12 }}>
                    <span>No reviews yet — be the first</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}

      {noResults && (
        <div className="text-center flex flex-col items-center gap-[9px] border-t" style={{ padding: '34px 32px', borderColor: 'var(--color-divider)' }}>
          <span style={{ color: 'var(--color-accent)' }}><SearchX size={22} strokeWidth={1.2} /></span>
          <h2 className="pf-h" style={{ fontSize: 18 }}>Nothing matches &ldquo;{nameQuery}&rdquo;</h2>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>
            Try a denomination, a street, or a shorter piece of the name.
          </p>
          <button onClick={() => setNameQuery('')} className="btn btn-secondary" style={{ marginTop: 4, padding: '8px 13px', fontSize: 14 }}>Clear search</button>
        </div>
      )}

      <div style={{ height: 1, background: 'var(--color-divider)' }} />
      <p style={{ margin: 0, padding: '18px 20px 6px', fontSize: 12.5, fontStyle: 'italic', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)', textAlign: 'center' }}>
        Only visits with a date count toward a rating.
      </p>
    </div>
  )
}

function VisitsTab() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('reviews')
      .select('id, overall_rating, well_text, visited_on, seed_helpful_count, created_at, is_anonymous, churches(name, slug)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data || []))
      .finally(() => setLoading(false))
  }, [user])

  const helpfulTotal = reviews.reduce((sum, r) => sum + (r.seed_helpful_count || 0), 0)

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '0 0 8px' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--color-chrome)', paddingTop: 14 }}>
        <div className="px-5" style={{ position: 'relative' }}>
          <div className="flex items-center gap-1" style={{ position: 'absolute', top: 0, right: 0, color: 'var(--color-accent-600)', fontSize: 9.5, letterSpacing: '.07em', textTransform: 'uppercase' }}>
            <NotebookPen size={10} strokeWidth={1.6} />
            <span>Your contributions</span>
          </div>
          <div className="flex justify-center">
            <Logo size={30} />
          </div>
          <h1 className="pf-h text-center" style={{ fontSize: 22, fontWeight: 400, margin: '10px 0 0' }}>
            {user ? 'Your reviews' : 'Sign up to review'}
          </h1>
        </div>

        <TopTabs tab="visits" />
      </div>

      {!user && (
        <div className="px-5 pt-6 flex flex-col gap-3">
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
            Create an account to write reviews, save churches, and see your review history here.
          </p>
          <button onClick={() => navigate('/churches/signup')} className="btn btn-primary-solid" style={{ padding: 12 }}>Get started</button>
        </div>
      )}

      {user && (
        <>
          <div className="flex gap-[9px] px-5 pt-[18px]">
            <div className="flex-1 border rounded-[var(--radius-md)]" style={{ borderColor: 'var(--color-divider)', padding: '11px 12px' }}>
              <div className="pf-h" style={{ fontSize: 25, fontWeight: 400 }}>{reviews.length}</div>
              <div style={{ fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Reviews written</div>
            </div>
            <div className="flex-1 border rounded-[var(--radius-md)]" style={{ borderColor: 'var(--color-divider)', padding: '11px 12px' }}>
              <div className="pf-h" style={{ fontSize: 25, fontWeight: 400 }}>{helpfulTotal}</div>
              <div style={{ fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Found helpful</div>
            </div>
          </div>

          <p style={{ margin: 0, padding: '24px 20px 9px', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 50%,transparent)', borderTop: '1px solid var(--color-divider)' }}>
            Published
          </p>
          {!loading && reviews.length === 0 && (
            <p className="px-5" style={{ fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
              No reviews yet. Find a church in Discover and write the first one.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="px-5 border-t" style={{ padding: '15px 20px', borderColor: 'var(--color-divider)' }}>
              <div className="flex items-baseline justify-between gap-[10px]">
                <button onClick={() => navigate(`/churches/church/${r.churches.slug}`)} className="pf-h" style={{ fontSize: 17, color: 'var(--color-text)' }}>{r.churches.name}</button>
                <span style={{ flex: 'none', fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{r.visited_on}</span>
              </div>
              <div className="flex items-center gap-[7px]" style={{ marginTop: 5, color: 'var(--color-accent-2)' }}>
                <StarRow value={r.overall_rating} size={11} />
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
                  {r.is_anonymous ? 'Posted anonymously' : `Posted as ${profile?.name || 'you'}`}
                </span>
              </div>
              {r.well_text && (
                <p style={{ margin: '7px 0 0', fontSize: 13.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 78%,transparent)' }}>{r.well_text}</p>
              )}
              <div className="flex items-center gap-[5px]" style={{ marginTop: 8, fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
                <ThumbsUp size={11} strokeWidth={1.6} />
                <span>{r.seed_helpful_count} found this helpful</span>
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--color-divider)', marginBottom: 10 }} />
        </>
      )}
    </div>
  )
}
