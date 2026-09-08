import { NavLink } from 'react-router-dom'
import { Compass, Map, SquarePen, Rss, CircleUserRound } from 'lucide-react'

const TABS = [
  { to: '/', end: true, icon: Compass, label: 'Discover' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/write', icon: SquarePen, label: 'Review' },
  { to: '/feed', icon: Rss, label: 'Feed' },
  { to: '/account', icon: CircleUserRound, label: 'Account' },
]

export function BottomTabBar() {
  return (
    <div
      className="flex-none flex border-t px-1 pt-[9px] pb-[30px]"
      style={{ borderColor: 'var(--color-accent-2-200)', background: 'var(--color-surface)' }}
    >
      {TABS.map(({ to, end, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="flex-1 flex flex-col items-center gap-1 py-[3px]"
          style={({ isActive }) => ({ color: isActive ? 'var(--color-accent-800)' : 'color-mix(in srgb,var(--color-text) 50%,transparent)' })}
        >
          {({ isActive }) => (
            <>
              <Icon size={19} strokeWidth={isActive ? 1.9 : 1.4} />
              <span className="text-[9.5px] tracking-[.05em]">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}
