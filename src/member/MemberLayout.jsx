import { Outlet } from 'react-router-dom'
import { BottomTabBar } from '../components/ui/BottomTabBar.jsx'

export function MemberLayout() {
  return (
    <div className="flex justify-center" style={{ height: '100dvh', background: 'var(--color-neutral-300)' }}>
      <div
        className="w-full max-w-[430px] flex flex-col"
        style={{ height: '100%', background: 'var(--color-bg)', fontSize: 15, lineHeight: 1.55, overflow: 'hidden' }}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
        <BottomTabBar />
      </div>
    </div>
  )
}
