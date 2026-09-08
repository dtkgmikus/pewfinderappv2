import { useEffect, useState } from 'react'
import { Video, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAdmin } from './AdminContext.jsx'
import { ProLock } from './ProLock.jsx'

const BLANK = { title: '', scripture: '', date_preached: new Date().toISOString().slice(0, 10), summary: '', media_link: '' }

export function SermonsScreen() {
  const { church, isPro } = useAdmin()
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState(BLANK)

  const load = () => supabase.from('sermon_notes').select('*').eq('church_id', church.id).order('date_preached', { ascending: false }).then(({ data }) => setNotes(data || []))
  useEffect(() => { if (isPro) load() }, [church, isPro])

  if (!isPro) return <ProLock section="sermons" />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const post = async () => {
    if (!form.title.trim() || !form.summary.trim()) return
    await supabase.from('sermon_notes').insert({ church_id: church.id, ...form })
    setForm(BLANK)
    load()
  }
  const remove = async (id) => { await supabase.from('sermon_notes').delete().eq('id', id); load() }

  return (
    <div className="flex flex-col gap-[26px] max-w-[900px]">
      <div>
        <h2 className="pf-h" style={{ fontSize: 24 }}>Sermon notes</h2>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>A short summary and a link. Anyone who saved your church gets notified when you post.</p>
      </div>

      <div className="flex flex-col gap-[15px] max-w-[600px]">
        <Field label="Title"><input value={form.title} onChange={set('title')} className="input" /></Field>
        <div className="grid grid-cols-2 gap-[15px]">
          <Field label="Scripture"><input value={form.scripture} onChange={set('scripture')} className="input" /></Field>
          <Field label="Date preached"><input type="date" value={form.date_preached} onChange={set('date_preached')} className="input" /></Field>
        </div>
        <Field label="Summary"><textarea value={form.summary} onChange={set('summary')} rows={4} className="input" /></Field>
        <Field label="Audio or video link">
          <div className="flex items-center gap-[10px] border" style={{ borderColor: 'var(--color-divider)', padding: '11px 13px', background: 'var(--color-bg)' }}>
            <Video size={15} strokeWidth={1.6} />
            <input value={form.media_link} onChange={set('media_link')} className="flex-1 bg-transparent" style={{ border: 0, fontSize: 13.5, outline: 'none' }} />
          </div>
        </Field>
        <button onClick={post} className="btn btn-primary-solid self-start" style={{ padding: '11px 17px', fontSize: 13 }}>Post to our page</button>
      </div>

      <div className="flex flex-col gap-2 border-t" style={{ paddingTop: 20, borderColor: 'var(--color-divider)' }}>
        {notes.map((n) => (
          <div key={n.id} className="grid items-center gap-[14px] border" style={{ gridTemplateColumns: '1fr auto', borderColor: 'var(--color-divider)', padding: '13px 15px' }}>
            <span className="flex flex-col gap-1">
              <span style={{ fontSize: 13.5, fontWeight: 500 }}>{n.title}</span>
              <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>{n.scripture} · {n.date_preached}</span>
            </span>
            <button onClick={() => remove(n.id)} style={{ color: 'color-mix(in srgb,var(--color-text) 45%,transparent)' }}><Trash2 size={14} strokeWidth={1.6} /></button>
          </div>
        ))}
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
