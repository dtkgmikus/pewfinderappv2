import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { ProLock } from './ProLock.jsx'
import { Chip } from '../components/ui/Chip.jsx'

// Reference town populations used only to produce a reach *estimate* until
// real geographic signup analytics exist in volume.
const TOWNS = [['Egg Harbor Twp', 1940], ['Mays Landing', 760], ['Northfield', 410], ['Absecon', 330], ['Somers Point', 295], ['Linwood', 250], ['Pleasantville', 480], ['Galloway', 520]]
const AUDIENCES = ['Families', 'Youth', 'Young adults', 'Seniors', 'Recovery', 'Anyone new']

const BLANK = { title: '', blurb: '', event_when: '', cost: 'Free', place: '', link: '', audience: [], radius_miles: 10, towns: TOWNS.slice(0, 4).map((t) => t[0]), channel_pinned: true, channel_push: true, channel_feed: false }

export function PromoteScreen() {
  const { church, isPro } = useAdmin()
  const [campaigns, setCampaigns] = useState([])
  const [form, setForm] = useState(BLANK)

  const load = () => supabase.from('campaigns').select('*').eq('church_id', church.id).order('created_at', { ascending: false }).then(({ data }) => setCampaigns(data || []))
  useEffect(() => { if (isPro) load() }, [church, isPro])

  if (!isPro) return <ProLock section="promote" />

  const reach = () => {
    const base = TOWNS.filter((t) => form.towns.includes(t[0])).reduce((n, t) => n + t[1], 0)
    const f = Math.min(1, form.radius_miles / 14)
    return Math.round((base * f) / 10) * 10
  }
  const toggleTown = (name) => setForm((f) => ({ ...f, towns: f.towns.includes(name) ? f.towns.filter((t) => t !== name) : [...f.towns, name] }))
  const toggleAudience = (a) => setForm((f) => ({ ...f, audience: f.audience.includes(a) ? f.audience.filter((x) => x !== a) : [...f.audience, a] }))

  const submit = async () => {
    if (!form.title.trim()) return
    await supabase.from('campaigns').insert({
      church_id: church.id, title: form.title, blurb: form.blurb, event_when: form.event_when, cost: form.cost,
      place: form.place, link: form.link, audience: form.audience, radius_miles: form.radius_miles, towns: form.towns,
      channel_pinned: form.channel_pinned, channel_push: form.channel_push, channel_feed: form.channel_feed,
      reach_estimate: reach(), status: 'waiting', submitted_at: new Date().toISOString(),
    })
    setForm(BLANK)
    load()
  }

  return (
    <div className="grid gap-6 max-w-[900px]" style={{ gridTemplateColumns: '1fr 316px' }}>
      <div className="flex flex-col gap-[15px]">
        <div>
          <h2 className="pf-h" style={{ fontSize: 24 }}>Promote</h2>
          <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Put an event in front of people near you who are actually looking for a church.</p>
        </div>
        <Field label="Event"><input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input" /></Field>
        <Field label="One line about it"><input value={form.blurb} onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))} className="input" /></Field>
        <div className="grid grid-cols-2 gap-[15px]">
          <Field label="Date & time"><input value={form.event_when} onChange={(e) => setForm((f) => ({ ...f, event_when: e.target.value }))} className="input" placeholder="Sat 24 Oct, 4–7 pm" /></Field>
          <Field label="Cost"><input value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))} className="input" /></Field>
        </div>
        <Field label="Where"><input value={form.place} onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))} className="input" /></Field>
        <Field label="Link"><input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className="input" placeholder="https://…" /></Field>
        <div className="flex flex-col gap-[9px]">
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Who it&rsquo;s for</span>
          <div className="flex gap-[7px] flex-wrap">{AUDIENCES.map((a) => <Chip key={a} active={form.audience.includes(a)} onClick={() => toggleAudience(a)}>{a}</Chip>)}</div>
        </div>
        <div className="flex flex-col gap-[11px] border-t" style={{ paddingTop: 18, borderColor: 'var(--color-divider)' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>How it reaches people</span>
          {[['channel_pinned', 'Pinned in Discover', 'Sits above the church list for anyone inside your region.'],
            ['channel_push', 'Push notification', 'One notification per campaign. Members can turn these off.'],
            ['channel_feed', 'Events near you', 'A card in the feed, next to recent reviews.']].map(([key, label, detail]) => {
            const on = form[key]
            return (
              <button key={key} onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))} className="grid gap-[13px] items-start border text-left" style={{ gridTemplateColumns: 'auto 1fr', borderColor: on ? 'var(--color-accent)' : 'var(--color-divider)', background: on ? 'color-mix(in srgb,var(--color-accent) 6%,transparent)' : 'var(--color-bg)', padding: '14px 15px' }}>
                <span className="flex items-center justify-center" style={{ width: 16, height: 16, border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`, background: on ? 'var(--color-accent)' : 'transparent', color: 'var(--color-surface)', marginTop: 2 }}>{on && '✓'}</span>
                <span className="flex flex-col gap-1">
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>{detail}</span>
                </span>
              </button>
            )
          })}
        </div>

        {campaigns.length > 0 && (
          <div className="flex flex-col gap-2 border-t" style={{ paddingTop: 20, borderColor: 'var(--color-divider)' }}>
            <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Your campaigns</span>
            {campaigns.map((c) => (
              <div key={c.id} className="grid items-center gap-[14px] border" style={{ gridTemplateColumns: '1fr auto', borderColor: 'var(--color-divider)', padding: '12px 15px' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.title}</span>
                <span style={{ fontSize: 11, textTransform: 'uppercase', color: c.status === 'approved' ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4" style={{ position: 'sticky', top: 20 }}>
        <div className="flex flex-col gap-[14px] border" style={{ borderColor: 'var(--color-divider)', padding: 18, background: 'var(--color-bg)' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Where it goes</span>
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 30 }}>{form.radius_miles}</span>
            <span style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>miles from your building</span>
          </div>
          <input type="range" min={3} max={20} value={form.radius_miles} onChange={(e) => setForm((f) => ({ ...f, radius_miles: Number(e.target.value) }))} style={{ width: '100%' }} />
          <div className="flex justify-between" style={{ fontSize: 10.5, color: 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}><span>3 mi</span><span>20 mi</span></div>
          <div style={{ height: 1, background: 'var(--color-divider)' }} />
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Fine-tune by town</span>
          <div className="flex flex-col gap-[7px]">
            {TOWNS.map(([name, members]) => {
              const on = form.towns.includes(name)
              return (
                <button key={name} onClick={() => toggleTown(name)} className="grid items-center gap-[10px]" style={{ gridTemplateColumns: '16px 1fr auto' }}>
                  <span className="flex items-center justify-center" style={{ width: 15, height: 15, border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`, background: on ? 'var(--color-accent)' : 'transparent', color: 'var(--color-surface)' }}>{on && '✓'}</span>
                  <span style={{ fontSize: 13 }}>{name}</span>
                  <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}>{members.toLocaleString()}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col gap-[9px] border" style={{ borderColor: 'var(--color-accent-400)', background: 'color-mix(in srgb,var(--color-accent) 7%,transparent)', padding: 18 }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>Estimated reach</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 28 }}>{reach().toLocaleString()}</span>
          <span style={{ fontSize: 12.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>members inside your region (estimate, based on town population).</span>
        </div>
        <button onClick={submit} className="btn btn-primary-solid" style={{ padding: '13px 16px', fontSize: 13.5 }}>Submit for review</button>
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.55, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>PewFinder reviews new campaigns, usually within a day.</p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{label}</span>
      {children}
    </label>
  )
}
