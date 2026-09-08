import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * Persistent nav bar for screens that sit before a role-gated console
 * (sign-in forms, claim-pending, not-authorized) — those pages otherwise
 * have no way back to the member app or to sign out.
 */
export function GateHeader({ onSignOut }) {
  return (
    <div
      className="flex items-center justify-between px-4"
      style={{ height: 48, borderBottom: '1px solid var(--color-divider)', background: 'var(--color-surface)' }}
    >
      <Link to="/" className="flex items-center gap-1" style={{ fontSize: 12.5, color: 'var(--color-accent-700)' }}>
        <ChevronLeft size={14} strokeWidth={1.8} />
        <span>PewFinder</span>
      </Link>
      {onSignOut && (
        <button onClick={onSignOut} style={{ fontSize: 12.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
          Sign out
        </button>
      )}
    </div>
  )
}
