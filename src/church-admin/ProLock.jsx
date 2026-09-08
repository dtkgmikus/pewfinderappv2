import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

const COPY = {
  sermons: ['Post sermon notes members can read before they visit', 'A short summary, the passage, and a link to the audio or the YouTube video. Everyone who saved your church gets a notification when you post.'],
  promote: ['Put an event in front of people near you', 'Pick a radius, pick the towns, pick whether it pins in Discover, goes out as a notification, or both. One campaign at a time, included in the $50.'],
  insights: ['See who is looking, and what they are looking for', 'Age, household, home town, how far they would drive, what they say matters, and where your categories sit against the churches around you. Aggregate only.'],
  media: ['Photos, video, and links', 'Photos are the most-opened part of any church page. Add a gallery, drop in YouTube or Facebook links, and point each program at its own signup page.'],
}

export function ProLock({ section }) {
  const navigate = useNavigate()
  const [title, body] = COPY[section] || COPY.sermons
  return (
    <div className="max-w-[640px] flex flex-col gap-4">
      <div className="flex items-center gap-[11px]" style={{ color: 'var(--color-accent-700)' }}>
        <Lock size={17} strokeWidth={1.7} />
        <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase' }}>PewFinder Pro</span>
      </div>
      <h2 className="pf-h" style={{ fontSize: 26, letterSpacing: '-.01em' }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 64%,transparent)' }}>{body}</p>
      <div className="flex items-center gap-[14px]">
        <button onClick={() => navigate('/admin/upgrade')} className="btn btn-primary-solid" style={{ padding: '12px 17px', fontSize: 13.5 }}>See what Pro includes</button>
        <span style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>$50 a month, cancel any time</span>
      </div>
    </div>
  )
}
