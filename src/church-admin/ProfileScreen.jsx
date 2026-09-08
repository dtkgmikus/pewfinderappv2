import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, ImagePlus, Play } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { ProLock } from './ProLock.jsx'
import { PROGRAM_GROUPS } from '../data/constants.js'

const TABS = [
  { key: 'basics', label: 'The basics' },
  { key: 'times', label: 'Service times' },
  { key: 'programs', label: 'Programs' },
  { key: 'media', label: 'Photos & video', pro: true },
  { key: 'links', label: 'Links & socials', pro: true },
]

export function ProfileScreen() {
  const { church, isPro } = useAdmin()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'basics'

  if (!church) return null
  const locked = TABS.find((t) => t.key === tab)?.pro && !isPro

  return (
    <div className="flex flex-col gap-5 max-w-[860px]">
      <div className="flex gap-[18px] border-b">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setParams({ tab: t.key })} style={{ fontSize: 13, padding: '9px 0', borderBottom: `2px solid ${tab === t.key ? 'var(--color-accent)' : 'transparent'}`, color: tab === t.key ? 'var(--color-text)' : 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
            {t.label}{t.pro && !isPro ? ' 🔒' : ''}
          </button>
        ))}
      </div>
      {locked && <ProLock section={tab} />}
      {!locked && tab === 'basics' && <BasicsTab />}
      {!locked && tab === 'times' && <TimesTab />}
      {!locked && tab === 'programs' && <ProgramsTab />}
      {!locked && tab === 'media' && <MediaTab />}
      {!locked && tab === 'links' && <LinksTab />}
    </div>
  )
}

function BasicsTab() {
  const { church, refresh } = useAdmin()
  const [form, setForm] = useState(church)
  useEffect(() => setForm(church), [church])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = async () => {
    await supabase.from('churches').update({
      name: form.name, denomination: form.denomination, phone: form.phone,
      street: form.street, town: form.town, zip: form.zip, first_visit_note: form.first_visit_note,
    }).eq('id', church.id)
    refresh()
  }
  return (
    <div className="flex flex-col gap-5">
      <h2 className="pf-h" style={{ fontSize: 24 }}>The basics</h2>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Church name" span2><input value={form.name || ''} onChange={set('name')} className="input" /></Field>
        <Field label="Denomination"><input value={form.denomination || ''} onChange={set('denomination')} className="input" /></Field>
        <Field label="Phone"><input value={form.phone || ''} onChange={set('phone')} className="input" /></Field>
        <Field label="Street" span2><input value={form.street || ''} onChange={set('street')} className="input" /></Field>
        <Field label="What a first-time visitor should know" span2>
          <textarea value={form.first_visit_note || ''} onChange={set('first_visit_note')} rows={4} className="input" />
        </Field>
      </div>
      <button onClick={save} className="btn btn-primary-solid self-start" style={{ padding: '11px 17px', fontSize: 13 }}>Save changes</button>
    </div>
  )
}

function TimesTab() {
  const { church, refresh } = useAdmin()
  const [value, setValue] = useState(church.service_times)
  useEffect(() => setValue(church.service_times), [church])
  const save = async () => { await supabase.from('churches').update({ service_times: value }).eq('id', church.id); refresh() }
  return (
    <div className="flex flex-col gap-5 max-w-[600px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Service times</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>The single most-tapped thing on your page. Keep holidays current.</p>
      </div>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className="input" placeholder="Sun 9:00 & 11:00" />
      <button onClick={save} className="btn btn-primary-solid self-start" style={{ padding: '11px 17px', fontSize: 13 }}>Save changes</button>
    </div>
  )
}

function ProgramsTab() {
  const { church } = useAdmin()
  const [catalog, setCatalog] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [custom, setCustom] = useState([])
  const [newProgram, setNewProgram] = useState('')

  const load = async () => {
    const { data: cat } = await supabase.from('program_catalog').select('*').order('sort_order')
    setCatalog(cat || [])
    const { data: cp } = await supabase.from('church_programs').select('*').eq('church_id', church.id)
    setSelected(new Set((cp || []).filter((r) => r.program_id).map((r) => r.program_id)))
    setCustom((cp || []).filter((r) => r.custom_label))
  }
  useEffect(() => { load() }, [church])

  const toggle = async (programId) => {
    if (selected.has(programId)) {
      await supabase.from('church_programs').delete().eq('church_id', church.id).eq('program_id', programId)
    } else {
      await supabase.from('church_programs').insert({ church_id: church.id, program_id: programId })
    }
    load()
  }
  const addCustom = async () => {
    if (!newProgram.trim()) return
    await supabase.from('church_programs').insert({ church_id: church.id, custom_label: newProgram.trim() })
    setNewProgram('')
    load()
  }
  const removeCustom = async (id) => { await supabase.from('church_programs').delete().eq('id', id); load() }

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Programs</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>{selected.size} checked. These are what members filter on.</p>
      </div>
      {PROGRAM_GROUPS.map(([groupName, items]) => (
        <div key={groupName} className="flex flex-col gap-[11px]">
          <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-800)', borderBottom: '1px solid var(--color-divider)', paddingBottom: 7 }}>{groupName}</span>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2">
            {items.map((label) => {
              const item = catalog.find((c) => c.label === label)
              if (!item) return null
              const on = selected.has(item.id)
              return (
                <button key={item.id} onClick={() => toggle(item.id)} className="flex items-center gap-[10px] py-[7px] text-left">
                  <span className="flex-none flex items-center justify-center" style={{ width: 16, height: 16, border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`, background: on ? 'var(--color-accent)' : 'transparent', color: 'var(--color-surface)' }}>
                    {on && '✓'}
                  </span>
                  <span style={{ fontSize: 13.5, color: on ? 'var(--color-text)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-col gap-3 border" style={{ borderColor: 'var(--color-divider)', padding: '18px 20px', background: 'var(--color-bg)' }}>
        <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Something we didn&rsquo;t list</span>
        <div className="flex gap-[9px] flex-wrap">
          {custom.map((c) => (
            <span key={c.id} className="flex items-center gap-[7px] border" style={{ fontSize: 12.5, padding: '6px 10px', borderColor: 'var(--color-accent-400)', background: 'color-mix(in srgb,var(--color-accent) 10%,transparent)' }}>
              {c.custom_label}
              <button onClick={() => removeCustom(c.id)}>×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-[9px] max-w-[520px]">
          <input value={newProgram} onChange={(e) => setNewProgram(e.target.value)} placeholder="e.g. Surf ministry" className="input flex-1" />
          <button onClick={addCustom} className="border" style={{ borderColor: 'var(--color-accent-700)', color: 'var(--color-accent-800)', padding: '10px 16px', fontSize: 13 }}>Add</button>
        </div>
      </div>
    </div>
  )
}

function MediaTab() {
  const { church } = useAdmin()
  const [media, setMedia] = useState([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('photo')

  const load = () => supabase.from('church_media').select('*').eq('church_id', church.id).order('sort_order').then(({ data }) => setMedia(data || []))
  useEffect(() => { load() }, [church])

  const add = async () => {
    if (!url.trim()) return
    await supabase.from('church_media').insert({ church_id: church.id, kind, url: url.trim(), title: title.trim() || null })
    setUrl(''); setTitle(''); load()
  }
  const remove = async (id) => { await supabase.from('church_media').delete().eq('id', id); load() }

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Photos &amp; video</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Members open photos more than anything else on a page.</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {media.map((m) => (
          <div key={m.id} className="border relative flex flex-col items-center justify-center gap-[7px]" style={{ aspectRatio: '4/3', borderColor: 'var(--color-neutral-400)' }}>
            {m.kind === 'photo' ? <img src={m.url} alt="" className="w-full h-full object-cover" /> : <Play size={17} strokeWidth={1.4} />}
            <button onClick={() => remove(m.id)} className="absolute top-1 right-1" style={{ fontSize: 11, background: 'var(--color-bg)', padding: '2px 6px' }}>×</button>
          </div>
        ))}
        <div className="border border-dashed flex flex-col items-center justify-center gap-[7px]" style={{ aspectRatio: '4/3', borderColor: 'var(--color-neutral-400)', color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>
          <ImagePlus size={17} strokeWidth={1.4} />
          <span style={{ fontSize: 11.5, textAlign: 'center', padding: '0 8px' }}>Add below</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t" style={{ paddingTop: 20, borderColor: 'var(--color-divider)' }}>
        <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Add a photo or video link</span>
        <div className="flex gap-2 flex-wrap items-center">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="input" style={{ width: 120 }}>
            <option value="photo">Photo URL</option>
            <option value="video">Video link</option>
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="input flex-1" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Caption (optional)" className="input" style={{ width: 200 }} />
          <button onClick={add} className="btn btn-primary-solid" style={{ padding: '10px 16px', fontSize: 13 }}><Plus size={14} /></button>
        </div>
      </div>
    </div>
  )
}

function LinksTab() {
  const { church } = useAdmin()
  const [socials, setSocials] = useState([])
  const [programLinks, setProgramLinks] = useState([])

  const load = async () => {
    const { data: s } = await supabase.from('church_social_links').select('*').eq('church_id', church.id)
    setSocials(s || [])
    const { data: pl } = await supabase.from('church_program_links').select('*').eq('church_id', church.id)
    setProgramLinks(pl || [])
  }
  useEffect(() => { load() }, [church])

  const upsertSocial = async (platform, url) => {
    const existing = socials.find((s) => s.platform === platform)
    if (existing) await supabase.from('church_social_links').update({ url }).eq('id', existing.id)
    else await supabase.from('church_social_links').insert({ church_id: church.id, platform, url })
    load()
  }

  const PLATFORMS = ['website', 'youtube', 'instagram', 'facebook', 'tiktok']

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Links &amp; socials</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Where people go next.</p>
      </div>
      <div className="flex flex-col gap-2">
        {PLATFORMS.map((platform) => {
          const existing = socials.find((s) => s.platform === platform)
          return (
            <div key={platform} className="grid items-center gap-[13px] border" style={{ gridTemplateColumns: '108px 1fr', borderColor: 'var(--color-divider)', padding: '11px 13px', background: 'var(--color-bg)' }}>
              <span style={{ fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)', textTransform: 'capitalize' }}>{platform}</span>
              <input
                defaultValue={existing?.url || ''}
                placeholder={`https://${platform}.com/...`}
                onBlur={(e) => e.target.value !== (existing?.url || '') && upsertSocial(platform, e.target.value)}
                style={{ border: 0, borderBottom: '1px solid var(--color-divider)', padding: '7px 0', fontSize: 13, background: 'transparent' }}
              />
            </div>
          )
        })}
      </div>
      {programLinks.length > 0 && (
        <div className="flex flex-col gap-2 border-t" style={{ paddingTop: 20, borderColor: 'var(--color-divider)' }}>
          <span style={{ fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Program links</span>
          {programLinks.map((pl) => (
            <div key={pl.id} className="grid items-center gap-[14px] border" style={{ gridTemplateColumns: '200px 1fr auto', borderColor: 'var(--color-divider)', padding: '11px 13px', background: 'var(--color-bg)' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{pl.program_label}</span>
              <span style={{ fontSize: 12.5, color: 'var(--color-accent-800)' }}>{pl.url}</span>
              <span style={{ fontSize: 11, textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}>{pl.cta_label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children, span2 }) {
  return (
    <label className="flex flex-col gap-[6px]" style={span2 ? { gridColumn: 'span 2' } : undefined}>
      <span style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>{label}</span>
      {children}
    </label>
  )
}
