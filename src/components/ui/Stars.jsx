import { Star } from 'lucide-react'

/** Fractional star display — mirrors the prototype's <star-rating> custom
 * element: each of 5 cells clips a filled star to the rated fraction over a
 * faint outline star. */
export function StarRow({ value = 0, size = 13, gap = 2 }) {
  const cells = [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.min(1, value - i)))
  return (
    <span className="inline-flex items-center" style={{ gap }}>
      {cells.map((frac, i) => (
        <span key={i} className="relative block" style={{ width: size, height: size }}>
          <Star size={size} strokeWidth={1.4} className="opacity-30 absolute inset-0" />
          {frac > 0 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${frac * 100}%` }}>
              <Star size={size} strokeWidth={1.4} fill="currentColor" />
            </span>
          )}
        </span>
      ))}
    </span>
  )
}

/** Interactive 1-5 star picker used on the write-a-review flow. */
export function StarPicker({ value = 0, onChange, size = 30 }) {
  return (
    <span className="inline-flex" style={{ gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-[3px]"
          style={{ color: n <= value ? 'var(--color-accent)' : 'color-mix(in srgb,var(--color-text) 30%,transparent)' }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star size={size} strokeWidth={1.2} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </span>
  )
}
