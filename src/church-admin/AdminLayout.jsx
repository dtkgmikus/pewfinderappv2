import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, Building2, BookOpen, Megaphone, TrendingUp,
  Users, CreditCard, ShieldCheck, Lock, LogOut,
} from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { AdminProvider, useAdmin } from './AdminContext.jsx'
import { ClaimChurchScreen } from './ClaimChurchScreen.jsx'
import { GateHeader } from '../components/ui/GateHeader.jsx'
import { Mark, Wordmark } from '../components/ui/Logo.jsx'

const NAV = [
  { to: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'reviews', icon: MessageSquare, label: 'Reviews' },
  { to: 'profile', icon: Building2, label: 'Church profile' },
  { to: 'sermons', icon: BookOpen, label: 'Sermon notes', pro: true },
  { to: 'promote', icon: Megaphone, label: 'Promote', pro: true },
  { to: 'insights', icon: TrendingUp, label: 'Insights', pro: true },
  { to: 'team', icon: Users, label: 'Team' },
  { to: 'billing', icon: CreditCard, label: 'Plan & billing' },
  { to: 'verify', icon: ShieldCheck, label: 'Verification' },
]

export function AdminLayout() {
  const { user, loading, churchRoles, signOut } = useAuth()
  const [authMode, setAuthMode] = useState('signin')

  if (loading) return null

  if (!user) return <AdminMiniAuth mode={authMode} setMode={setAuthMode} />
  if (churchRoles.length === 0) return <ClaimChurchScreen />

  const active = churchRoles[0]

  return (
    <AdminProvider churchId={active.church_id} role={active.role}>
      <div className="flex" style={{ height: '100dvh', background: 'var(--color-bg)' }}>
        <aside className="flex-none w-[240px] flex flex-col" style={{ height: '100%', overflowY: 'auto', background: 'var(--color-neutral-900)' }}>
          <Link to="/" className="flex items-center gap-[10px] px-[18px] pt-4">
            <Mark size={13} tone="dark" />
            <Wordmark size={15} tone="dark" />
          </Link>
          <div className="px-[18px] pb-4" style={{ fontSize: 11.5, color: 'color-mix(in srgb,white 55%,transparent)' }}>{active.churches?.name}</div>
          <nav className="flex flex-col">
            {NAV.map(({ to, icon: Icon, label, pro }) => (
              <NavLink
                key={to}
                to={to}
                className="grid items-center gap-[11px] px-[18px]"
                style={({ isActive }) => ({
                  gridTemplateColumns: '18px 1fr auto', padding: '9px 18px',
                  background: isActive ? 'color-mix(in srgb,var(--color-accent) 20%,transparent)' : 'transparent',
                  color: isActive ? 'var(--color-accent-200)' : 'color-mix(in srgb,white 62%,transparent)',
                  borderLeft: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                })}
              >
                <Icon size={15} strokeWidth={1.6} />
                <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{label}</span>
                {pro && <Lock size={10} strokeWidth={2.2} style={{ color: 'var(--color-accent-400)' }} />}
              </NavLink>
            ))}
          </nav>
          <span className="flex-1" />
          <div style={{ padding: '16px 18px', borderTop: '1px solid color-mix(in srgb,white 12%,transparent)' }}>
            <div style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'color-mix(in srgb,white 40%,transparent)' }}>Signed in</div>
            <div style={{ fontSize: 12.5, color: 'color-mix(in srgb,white 82%,transparent)', marginTop: 4 }}>{active.role}</div>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 px-[18px] py-3" style={{ color: 'color-mix(in srgb,white 55%,transparent)', fontSize: 12.5 }}>
            <LogOut size={14} strokeWidth={1.6} /> Sign out
          </button>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col" style={{ height: '100%', overflowY: 'auto' }}>
          <AdminContent />
        </div>
      </div>
    </AdminProvider>
  )
}

function AdminContent() {
  const { church, loading, error, refresh } = useAdmin()

  if (loading) {
    return <div className="p-7" style={{ color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Loading…</div>
  }
  if (error || !church) {
    return (
      <div className="p-7 flex flex-col gap-3" style={{ maxWidth: 520 }}>
        <h2 className="pf-h" style={{ fontSize: 20, color: 'var(--color-accent-700)' }}>Couldn&rsquo;t load this church</h2>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'color-mix(in srgb,var(--color-text) 62%,transparent)' }}>
          {error || 'No data came back for this church.'}
        </p>
        <button onClick={refresh} className="btn btn-secondary self-start" style={{ padding: '9px 15px' }}>Try again</button>
      </div>
    )
  }
  return (
    <div className="p-7 max-w-[900px]">
      <Outlet />
    </div>
  )
}

function AdminMiniAuth({ mode, setMode }) {
  return <AdminAuthForm mode={mode} setMode={setMode} />
}

function AdminAuthForm({ mode, setMode }) {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    setError('')
    const fn = mode === 'signin' ? signIn : signUp
    const { error: err } = await fn(email.trim(), password)
    if (err) setError(err.message)
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <GateHeader />
      <div className="flex-1 flex items-center justify-center" style={{ overflowY: 'auto' }}>
      <div className="w-full max-w-[380px] flex flex-col gap-4 p-8 border" style={{ borderColor: 'var(--color-divider)', background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-[10px]">
          <Mark size={14} tone="light" />
          <Wordmark size={18} tone="light" suffix="for churches" />
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Work email" className="input" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="input" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 12.5 }}>{error}</p>}
        <button onClick={submit} className="btn btn-primary-solid" style={{ padding: 12 }}>{mode === 'signin' ? 'Sign in' : 'Create account & claim'}</button>
        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ fontSize: 12.5, color: 'var(--color-accent-700)' }}>
          {mode === 'signin' ? "Haven't claimed your church yet? Create an account" : 'Already claimed? Sign in'}
        </button>
      </div>
      </div>
    </div>
  )
}
