import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { BottomTabBar } from '../components/ui/BottomTabBar.jsx'

// This is the "Find a Church" section — the original PewFinder app, now a
// secondary feature of Get-God.com. It deliberately keeps its own calmer,
// classical look (pf-legacy-theme, see legacy-classical.css) rather than
// the bold Ask-God theme the rest of the app uses now.
export function MemberLayout() {
  return (
    <div className="pf-legacy-theme flex justify-center" style={{ height: '100dvh', background: 'var(--color-neutral-300)' }}>
      <div
        className="w-full max-w-[430px] flex flex-col"
        style={{
          height: '100%',
          background: 'var(--color-bg)',
          fontSize: 15,
          lineHeight: 1.55,
          overflow: 'hidden',
          // No-ops in a browser tab; in the Capacitor-wrapped app these
          // keep content clear of the iOS notch/status bar and the home
          // indicator (see MOBILE.md).
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Link
          to="/"
          className="flex items-center gap-1 flex-none"
          style={{ padding: '9px 14px', fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 60%,transparent)', background: 'var(--color-chrome)', borderBottom: '1px solid var(--color-divider)' }}
        >
          <ChevronLeft size={13} strokeWidth={2} /> Back to Get-God
        </Link>
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
        <BottomTabBar />
      </div>
    </div>
  )
}
