import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export function AccountScreen() {
  const { user, profile, churchRoles, staffRole, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="pf-scroll pf-screen flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
        <h1 className="pf-h" style={{ fontSize: 22 }}>You&rsquo;re not signed in</h1>
        <button onClick={() => navigate('/churches/signup')} className="btn btn-primary-solid" style={{ padding: '10px 18px' }}>Create an account</button>
        <button onClick={() => navigate('/churches/login')} style={{ fontSize: 13.5, color: 'var(--color-accent-700)' }}>Sign in</button>
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--color-divider)', width: '100%' }}>
          <p style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 50%,transparent)', marginBottom: 8 }}>Run a church, or work for Get-God?</p>
          <button onClick={() => navigate('/admin')} style={{ fontSize: 13.5, color: 'var(--color-accent-700)', display: 'block', margin: '0 auto 6px' }}>Claim your church &rarr;</button>
          <button onClick={() => navigate('/staff')} style={{ fontSize: 13.5, color: 'var(--color-accent-700)', display: 'block', margin: '0 auto' }}>Get-God staff sign-in &rarr;</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pf-scroll pf-screen flex-1" style={{ padding: '60px 20px 8px' }}>
      <h1 className="pf-h" style={{ fontSize: 27 }}>Account</h1>
      <p style={{ fontSize: 14, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)', marginTop: 6 }}>{profile?.name} · {user.email}</p>

      <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ marginTop: 20, padding: '11px 15px', display: 'block', width: '100%', textAlign: 'left' }}>
        {churchRoles.length > 0 ? `Church admin console — ${churchRoles[0].churches?.name}` : 'Claim your church'}
      </button>
      <button onClick={() => navigate('/staff')} className="btn btn-secondary" style={{ marginTop: 10, padding: '11px 15px', display: 'block', width: '100%', textAlign: 'left' }}>
        {staffRole ? 'Get-God staff portal' : 'Get-God staff sign-in'}
      </button>
      <button onClick={() => navigate('/moderate/apply')} className="btn btn-secondary" style={{ marginTop: 10, padding: '11px 15px', display: 'block', width: '100%', textAlign: 'left' }}>
        Apply to answer questions as a moderator
      </button>

      <button onClick={signOut} className="btn btn-secondary" style={{ marginTop: 24, padding: '11px 15px' }}>Sign out</button>
    </div>
  )
}
