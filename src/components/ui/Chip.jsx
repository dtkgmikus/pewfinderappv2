/** Pill-style toggle button — the {border, bg, color} "chip" pattern used
 * throughout the prototype for filters, priorities, and single-choice rows. */
export function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-none px-[11px] py-[6px] text-[11.5px] border rounded-[var(--radius-md)] transition-colors ${className}`}
      style={{
        borderColor: active ? 'var(--color-accent-2)' : 'var(--color-divider)',
        background: active ? 'color-mix(in srgb,var(--color-accent-2) 13%,transparent)' : 'transparent',
        color: active ? 'var(--color-accent-2-700)' : 'color-mix(in srgb,var(--color-text) 62%,transparent)',
      }}
    >
      {children}
    </button>
  )
}

export function Eyebrow({ children, className = '' }) {
  return <span className={`label-eyebrow ${className}`}>{children}</span>
}
