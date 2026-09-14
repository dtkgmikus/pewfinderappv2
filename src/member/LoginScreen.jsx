import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export function LoginScreen() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError('')
    const { error: err } = await signIn(email.trim(), password)
    setBusy(false)
    if (err) setError(err.message)
    else navigate('/')
  }

  return (
    <div className="pf-scroll pf-screen flex-1 flex flex-col justify-center gap-4 px-6">
      <h1 className="pf-h" style={{ fontSize: 26 }}>Sign in</h1>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {error && <p style={{ color: 'var(--color-accent-700)', fontSize: 13.5 }}>{error}</p>}
      <button onClick={submit} disabled={busy} className="btn btn-primary-solid" style={{ padding: 12 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <button onClick={() => navigate('/churches/signup')} style={{ fontSize: 13.5, color: 'var(--color-accent-700)', textAlign: 'center' }}>
        New here? Create an account
      </button>
    </div>
  )
}
