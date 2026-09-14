import { NavLink } from 'react-router-dom'
import { MessagesSquare, Search, CirclePlus, Church, CircleUserRound } from 'lucide-react'

const TABS = [
  { to: '/', end: true, icon: MessagesSquare, label: 'Ask' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/ask', icon: CirclePlus, label: 'Post', primary: true },
  { to: '/churches', icon: Church, label: 'Churches' },
  { to: '/account', icon: CircleUserRound, label: 'Account' },
]

export function AskBottomTabBar() {
  return (
    <div
      className="flex-none flex border-t px-1 pt-[9px] pb-[30px]"
      style={{ borderColor: 'var(--color-accent-2-200)', background: 'var(--color-chrome)' }}
    >
      {TABS.map(({ to, end, icon: Icon, label, primary }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="flex-1 flex flex-col items-center gap-1 py-[3px]"
          style={({ isActive }) => ({
            color: isActive
              ? 'var(--color-accent-2-700)'
              : primary
                ? 'var(--color-accent-2-600)'
                : 'color-mix(in srgb,var(--color-text) 50%,transparent)',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={primary ? 24 : 19} strokeWidth={isActive || primary ? 1.9 : 1.4} />
              <span className="text-[10.5px] tracking-[.05em]">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}
