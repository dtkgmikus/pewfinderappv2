import { useNavigate } from 'react-router-dom'
import { Video, MessagesSquare, Search, ShieldCheck, Church, Star, MessageSquare, Megaphone, TrendingUp, ImagePlus, BookOpen, Check, Apple, Smartphone } from 'lucide-react'
import { Logo, Mark } from '../components/ui/Logo.jsx'

const STEPS = [
  { icon: MessagesSquare, title: 'Ask it — text or video', body: 'Post the question you actually have, not the polite version. Ask anonymously, or under your name. It’s held for a quick review, then goes live on the board.' },
  { icon: Video, title: 'Get a real answer on video', body: 'Trained, approved moderators — and other people who’ve wrestled with it too — answer you back on camera, never in a text wall. Every answer is 5 minutes or less.' },
  { icon: Search, title: 'Search what’s already been asked', body: 'Chances are someone already asked your question. Search the board first, or add your own if it isn’t there yet.' },
]

const TOPICS = [
  'Doubt & faith', 'Suffering & pain', 'Salvation & grace', 'Science & faith', 'Relationships',
  'Church & community', 'Prayer', 'Sin & forgiveness', 'End times', 'Practical living',
]

const CHURCH_FREE = ['Claim & verify your listing', 'Flag reviews that break the rules', 'Edit your profile, service times & programs']
const CHURCH_PRO = ['Reply publicly to reviews', 'Post sermon notes with member notifications', 'Photos, video & program links', 'Promoted events, targeted by radius and town', 'Insights — who is looking and what they want']

export function LandingScreen() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100dvh' }}>
      <header className="flex items-center justify-between" style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-chrome)' }}>
        <Logo size={19} />
        <nav className="flex items-center gap-[22px]">
          <a href="#find-a-church" style={{ fontSize: 13.5, color: 'var(--color-text)' }} className="hidden md:inline">Find a church</a>
          <button onClick={() => navigate('/churches/login')} className="btn btn-secondary" style={{ padding: '8px 15px', fontSize: 13 }}>Sign in</button>
          <button onClick={() => navigate('/ask')} className="btn btn-primary-solid" style={{ padding: '8px 15px', fontSize: 13 }}>Ask something</button>
        </nav>
      </header>

      {/* ---------------------------------------------------------- hero -- */}
      <section className="flex flex-col items-center text-center" style={{ padding: '76px 24px 56px' }}>
        <div className="flex items-center gap-[7px]" style={{ color: 'var(--color-accent-2-700)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          <MessagesSquare size={13} strokeWidth={1.7} /><span>Real questions. Real video answers.</span>
        </div>
        <h1 className="pf-h" style={{ fontSize: 'clamp(34px, 6vw, 58px)', maxWidth: '16ch', margin: '18px 0 0' }}>
          Get&#8209;God.<br />Ask what you&rsquo;ve been afraid to ask.
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 16, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 65%,transparent)', maxWidth: '54ch' }}>
          Post your hardest question about God &mdash; by text or video, anonymously if you want. Trained moderators and
          people who&rsquo;ve been where you are answer you back on video, never a wall of text. No question is too sharp.
        </p>
        <div className="flex items-center gap-[14px] flex-wrap justify-center" style={{ marginTop: 30 }}>
          <button onClick={() => navigate('/ask')} className="btn btn-primary-solid" style={{ padding: '14px 22px', fontSize: 14.5 }}>Ask your question</button>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '14px 22px', fontSize: 14.5 }}>See what&rsquo;s been asked</button>
        </div>
        <div className="flex items-center gap-[16px] flex-wrap justify-center" style={{ marginTop: 26 }}>
          <StoreBadge icon={Apple} label="Download on the" name="App Store" />
          <StoreBadge icon={Smartphone} label="Get it on" name="Google Play" />
        </div>
      </section>

      {/* ------------------------------------------------------- how it works -- */}
      <section style={{ padding: '48px 24px', background: 'var(--color-surface)' }}>
        <div className="grid gap-[28px]" style={{ maxWidth: 1040, margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-col gap-[10px]">
              <span className="flex items-center gap-[8px]" style={{ color: 'var(--color-accent-2-700)' }}>
                <s.icon size={16} strokeWidth={1.7} />
                <span className="pf-h" style={{ fontSize: 12.5 }}>{String(i + 1).padStart(2, '0')}</span>
              </span>
              <h3 className="pf-h" style={{ fontSize: 19 }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- topics -- */}
      <section style={{ padding: '56px 24px', textAlign: 'center' }}>
        <h2 className="pf-h" style={{ fontSize: 28 }}>Ask about anything that&rsquo;s on your mind</h2>
        <p style={{ margin: '12px auto 0', fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)', maxWidth: '54ch' }}>
          Doubt, suffering, science, relationships, forgiveness &mdash; nothing is off the table, and no one has to know it was you asking.
        </p>
        <div className="flex flex-wrap justify-center gap-[9px]" style={{ marginTop: 26, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
          {TOPICS.map((label) => (
            <span key={label} style={{ fontSize: 13, padding: '9px 15px', border: '1px solid var(--color-divider)', borderRadius: 999, background: 'var(--color-surface)' }}>{label}</span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-[6px]" style={{ marginTop: 26, color: 'var(--color-accent-2-700)' }}>
          <ShieldCheck size={16} strokeWidth={1.7} />
          <span style={{ marginLeft: 4, fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Every question and answer is reviewed before it goes live &mdash; and answers carry a moderator badge when they come from someone trained and approved.</span>
        </div>
      </section>

      {/* ------------------------------------------------------- become a moderator -- */}
      <section style={{ padding: '48px 24px', background: 'var(--color-neutral-900)', color: 'var(--color-surface)' }}>
        <div className="flex flex-col items-center text-center" style={{ maxWidth: 640, margin: '0 auto' }}>
          <ShieldCheck size={22} strokeWidth={1.5} style={{ color: 'var(--color-accent-2-400)' }} />
          <h2 className="pf-h" style={{ fontSize: 26, margin: '14px 0 0', color: 'white' }}>Trained to answer hard questions well?</h2>
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.68, color: 'color-mix(in srgb,white 68%,transparent)' }}>
            Apply to become an approved moderator. Your video answers get pinned above the community&rsquo;s and carry a badge that says people can trust what you say.
          </p>
          <button onClick={() => navigate('/moderate/apply')} className="btn btn-primary-solid" style={{ padding: '12px 20px', fontSize: 14, marginTop: 20 }}>Apply to be a moderator</button>
        </div>
      </section>

      {/* ------------------------------------------------------- find a church -- */}
      <section id="find-a-church" style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="flex items-center gap-[10px]">
            <Church size={15} strokeWidth={1.6} style={{ color: 'var(--color-accent-700)' }} />
            <span style={{ fontSize: 11.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>Also inside Get-God</span>
          </div>
          <h2 className="pf-h" style={{ fontSize: 28, margin: '14px 0 0' }}>Ready to walk into a church? Find one that actually fits</h2>
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.65, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)', maxWidth: '62ch' }}>
            Get-God still ranks and reviews churches across eleven real categories &mdash; preaching, kids &amp; nursery, music,
            parking, and more &mdash; from people who actually visited. It&rsquo;s the same church-finder Get-God started as, now
            one tap away.
          </p>
          <div className="flex items-center gap-[6px]" style={{ marginTop: 18, color: 'var(--color-accent-2)' }}>
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />)}
            <span style={{ marginLeft: 8, fontSize: 13, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Rated by people who were actually there</span>
          </div>
          <button onClick={() => navigate('/churches')} className="btn btn-secondary" style={{ padding: '11px 18px', fontSize: 14, marginTop: 20 }}>Find a church near me</button>
        </div>
      </section>

      {/* ------------------------------------------------------- for churches -- */}
      <section style={{ padding: '56px 24px', background: 'var(--color-neutral-900)', color: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="flex items-center gap-[10px]">
            <Mark size={12} tone="dark" />
            <span style={{ fontSize: 11.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,white 60%,transparent)' }}>For churches</span>
          </div>
          <h2 className="pf-h" style={{ fontSize: 30, margin: '14px 0 0', color: 'white' }}>Claim your listing, free — reach the people already looking, on Pro</h2>
          <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.68, color: 'color-mix(in srgb,white 68%,transparent)', maxWidth: '62ch' }}>
            Any church can claim and verify its listing at no cost. Get-God Pro is $50 a month, cancel any time —
            it&rsquo;s what lets you reply to what people are saying, put an event in front of new visitors, and see
            the detailed feedback and analytics behind your rating.
          </p>
          <div className="grid gap-[18px]" style={{ marginTop: 30, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <PlanCard title="Claimed" price="Free" features={CHURCH_FREE} dark />
            <PlanCard title="Get-God Pro" price="$50/mo" features={CHURCH_PRO} dark accent icons={[MessageSquare, BookOpen, ImagePlus, Megaphone, TrendingUp]} />
          </div>
          <button onClick={() => navigate('/admin')} className="btn btn-primary-solid" style={{ padding: '13px 20px', fontSize: 14, marginTop: 28 }}>Register your church</button>
        </div>
      </section>

      <footer className="flex items-center justify-between flex-wrap gap-3" style={{ padding: '20px 24px', borderTop: '1px solid var(--color-divider)', fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
        <span>&copy; {new Date().getFullYear()} Get-God &middot; Atlantic County, NJ</span>
        <div className="flex items-center gap-[18px]">
          <button onClick={() => navigate('/churches/signup')} style={{ color: 'inherit' }}>Create an account</button>
          <a href="#find-a-church" style={{ color: 'inherit' }}>Find a church</a>
          <button onClick={() => navigate('/admin')} style={{ color: 'inherit' }}>Church sign in</button>
        </div>
      </footer>
    </div>
  )
}

function StoreBadge({ icon: Icon, label, name }) {
  // Placeholder badges until the Capacitor-wrapped app is actually live in
  // each store — swap for the official store artwork + real store links at
  // that point (see MOBILE.md).
  return (
    <span className="flex items-center gap-[9px]" style={{ padding: '9px 16px', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', opacity: 0.6 }} title="Coming soon">
      <Icon size={20} strokeWidth={1.5} />
      <span className="flex flex-col items-start" style={{ lineHeight: 1.15 }}>
        <span style={{ fontSize: 9.5 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
      </span>
    </span>
  )
}

function PlanCard({ title, price, features, dark, accent, icons }) {
  return (
    <div className="flex flex-col gap-[14px]" style={{
      padding: 22, borderRadius: 'var(--radius-lg)',
      border: `1px solid ${accent ? 'var(--color-accent-2-400)' : 'color-mix(in srgb,white 18%,transparent)'}`,
      background: accent ? 'color-mix(in srgb,var(--color-accent-2) 14%,transparent)' : 'color-mix(in srgb,white 5%,transparent)',
    }}>
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="pf-h" style={{ fontSize: 19, color: dark ? 'white' : undefined }}>{title}</span>
        <span className="pf-h" style={{ fontSize: 19, color: dark ? 'white' : undefined }}>{price}</span>
      </div>
      <div className="flex flex-col gap-[8px]">
        {features.map((f, i) => {
          const Icon = icons?.[i] || Check
          return (
            <span key={f} className="flex items-start gap-[9px]" style={{ fontSize: 13, lineHeight: 1.5, color: 'color-mix(in srgb,white 82%,transparent)' }}>
              <Icon size={13} strokeWidth={2} style={{ color: 'var(--color-accent-2-400)', marginTop: 2, flexShrink: 0 }} />
              <span>{f}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
