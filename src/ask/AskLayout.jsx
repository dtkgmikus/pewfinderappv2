import { Outlet } from 'react-router-dom'
import { AskBottomTabBar } from './AskBottomTabBar.jsx'

// The primary app experience now — asking hard questions about God and
// getting real video answers. "Find a church" lives at /churches, a
// secondary feature with its own calmer, classical look (MemberLayout).
export function AskLayout() {
  return (
    <div className="flex justify-center" style={{ height: '100dvh', background: 'var(--color-neutral-300)' }}>
      <div
        className="w-full max-w-[430px] flex flex-col"
        style={{
          height: '100%',
          background: 'var(--color-bg)',
          fontSize: 15,
          lineHeight: 1.55,
          overflow: 'hidden',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
        <AskBottomTabBar />
      </div>
    </div>
  )
}
