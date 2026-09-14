import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Inbox, Flag, ShieldCheck, Megaphone, Building2, Users, CreditCard, Scale, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { GateHeader } from '../components/ui/GateHeader.jsx'
import { Mark, Wordmark } from '../components/ui/Logo.jsx'

const NAV = [
  { to: '', end: true, icon: Inbox, label: 'Queue' },
  { to: 'flags', icon: Flag, label: 'Flagged reviews' },
  { to: 'claims', icon: ShieldCheck, label: 'Claims' },
  { to: 'promos', icon: Megaphone, label: 'Promotions' },
  { to: 'churches', icon: Building2, label: 'Churches' },
  { to: 'members', icon: Users, label: 'Members' },
  { to: 'billing', icon: CreditCard, label: 'Billing' },
  { to: 'policy', icon: Scale, label: 'Policy & staff' },
]

export function StaffLayout() {
  const { user, loading, staffRole, profile, signOut } = useAuth()

  if (loading) return null
  if (!user) return <StaffAuthForm />
  if (!staffRole) {
    return (
      <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: 'var(--color-bg)' }}>
        <GateHeader onSignOut={signOut} />
        <div className="flex-1 flex items-center justify-center p-8" style={{ overflowY: 'auto' }}>
          <div className="max-w-[440px] text-center flex flex-col gap-3">
            <h1 className="pf-h" style={{ fontSize: 22 }}>Not authorized</h1>
            <p style={{ fontSize: 13.5, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)' }}>Your account isn&rsquo;t on the Get-God staff list. Ask an admin to add you.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex" style={{ height: '100dvh', background: 'var(--color-bg)' }}>
      <aside className="flex-none w-[212px] flex flex-col" style={{ height: '100%', overflowY: 'auto', background: 'var(--color-neutral-900)' }}>
        <Link to="/" className="flex items-center gap-[10px] px-[18px] py-4">
          <Mark size={13} tone="dark" />
          <Wordmark size={15} tone="dark" suffix="staff" />
        </Link>
        <nav className="flex flex-col">
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to || 'root'}
              to={to}
              end={end}
              className="grid items-center gap-[11px] px-[18px]"
              style={({ isActive }) => ({
                gridTemplateColumns: '18px 1fr', padding: '9px 18px',
                background: isActive ? 'color-mix(in srgb,var(--color-accent-2) 24%,transparent)' : 'transparent',
                color: isActive ? 'var(--color-accent-2-300)' : 'color-mix(in srgb,white 62%,transparent)',
                borderLeft: `2px solid ${isActive ? 'var(--color-accent-2-300)' : 'transparent'}`,
              })}
            >
              <Icon size={15} strokeWidth={1.6} />
              <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <span className="flex-1" />
        <div style={{ padding: '16px 18px 0', borderTop: '1px solid color-mix(in srgb,white 12%,transparent)' }}>
          <div style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,white 40%,transparent)' }}>Signed in</div>
          <div style={{ fontSize: 12.5, color: 'color-mix(in srgb,white 82%,transparent)', marginTop: 4 }}>{profile?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-accent-300)', textTransform: 'capitalize' }}>{staffRole}</div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-[18px] py-3" style={{ color: 'color-mix(in srgb,white 55%,transparent)', fontSize: 12.5 }}>
          <LogOut size={14} strokeWidth={1.6} /> Sign out
        </button>
      </aside>
      <div className="flex-1 min-w-0 p-7" style={{ height: '100%', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}

function StaffAuthForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    const { error: err } = await signIn(email.trim(), password)
    if (err) setError(err.message)
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <GateHeader />
      <div className="flex-1 flex items-center justify-center" style={{ overflowY: 'auto' }}>
      <div className="w-full max-w-[380px] flex flex-col gap-4 p-8 border" style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Get-God staff sign-in</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@getgod.com" className="input" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="input" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 12.5 }}>{error}</p>}
        <button onClick={submit} className="btn btn-primary-solid" style={{ padding: 12 }}>Sign in</button>
        <p style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)' }}>
          Staff accounts are added by an existing admin (see supabase/link-demo-staff.sql).
        </p>
      </div>
      </div>
    </div>
  )
}
