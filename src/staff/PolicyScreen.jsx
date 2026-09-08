import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { avatarColor, initialsOf } from '../data/constants.js'

const RULES = [
  { name: 'Never visited', detail: 'Reviewing a church you have not been to. The most common upheld flag.' },
  { name: 'Wrong church', detail: 'Clearly describing a different congregation. Offer to move it rather than delete it.' },
  { name: 'Names an individual', detail: 'Naming a volunteer or staff member in a complaint. Strip the name, keep the substance.' },
  { name: 'False factual claim', detail: 'A specific, checkable, untrue statement — finances, safeguarding, legal matters.' },
  { name: 'Fake or incentivised', detail: 'Bought, traded, or written by the church about itself. Strike the account.' },
  { name: 'Spam or advertising', detail: 'Any review whose purpose is to sell something.' },
]

export function PolicyScreen() {
  const [staff, setStaff] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    supabase.from('staff_members').select('*, profiles(name, email)').then(({ data }) => setStaff(data || []))
    supabase.from('review_categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
  }, [])

  return (
    <div className="flex flex-col gap-[22px] max-w-[900px]">
      <div>
        <h1 className="pf-h" style={{ fontSize: 27 }}>Policy &amp; staff</h1>
        <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>The rules moderators decide against, and who can decide.</p>
      </div>

      <div className="border flex flex-col gap-[13px]" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
        <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Grounds for removal</span>
        {RULES.map((r) => (
          <span key={r.name} className="grid items-baseline gap-[16px] border-b" style={{ gridTemplateColumns: '190px 1fr', paddingBottom: 11, borderColor: 'var(--color-divider)' }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 64%,transparent)' }}>{r.detail}</span>
          </span>
        ))}
        <span style={{ fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 58%,transparent)' }}>Disagreement is not grounds. A church that dislikes a fair review gets a reply, not a removal.</span>
      </div>

      <div className="border flex flex-col gap-[13px]" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
        <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Staff</span>
        {staff.map((s) => {
          const initials = initialsOf(s.profiles?.name)
          return (
            <span key={s.profile_id} className="grid items-center gap-[14px] border-b" style={{ gridTemplateColumns: '32px 1fr 130px', paddingBottom: 11, borderColor: 'var(--color-divider)' }}>
              <span className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: avatarColor(initials), fontSize: 11, color: 'var(--color-surface)' }}>{initials}</span>
              <span className="flex flex-col gap-1">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.profiles?.name}</span>
                <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>{s.profiles?.email}</span>
              </span>
              <span className="border text-center" style={{ fontSize: 12.5, padding: '4px 9px', borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 68%,transparent)', textTransform: 'capitalize' }}>{s.role}</span>
            </span>
          )
        })}
      </div>

      <div className="border flex flex-col gap-[13px]" style={{ borderColor: 'var(--color-divider)', padding: '20px 22px' }}>
        <span style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,var(--color-text) 52%,transparent)' }}>Review categories</span>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 64%,transparent)', maxWidth: '60ch' }}>
          The categories members rate. Changing this set changes every church&rsquo;s page and every historical average, so it needs two admins to sign off.
        </p>
        <div className="flex gap-[7px] flex-wrap">
          {categories.map((c) => <span key={c.key} className="border" style={{ fontSize: 12, padding: '5px 10px', borderColor: 'var(--color-divider)', color: 'color-mix(in srgb,var(--color-text) 68%,transparent)' }}>{c.label}</span>)}
        </div>
      </div>
    </div>
  )
}
