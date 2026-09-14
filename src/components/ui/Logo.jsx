/** The mark: a bold "?" on a gold badge — the literal core of the product
 * (every screen is ultimately about a question), rendered in the display
 * face so it reads as a mark rather than a stray character. `tone` flips
 * it for a dark ground. */
export function Mark({ size = 24, tone = 'light' }) {
  const bg = tone === 'dark' ? 'var(--color-accent-300)' : 'var(--color-accent)'
  const glyph = tone === 'dark' ? 'var(--color-accent-900)' : 'var(--color-text)'
  return (
    <span
      className="pf-h flex items-center justify-center flex-none"
      style={{
        width: size, height: size, borderRadius: '30%',
        background: bg, color: glyph,
        fontSize: size * 0.62, lineHeight: 1, fontWeight: 800,
      }}
    >
      ?
    </span>
  )
}

/** Two-tone wordmark: "Get" stays the ambient text color, "God" carries the
 * gold "revelation" accent, and ".com" trails small and muted like a real
 * URL — the double entendre is in the words, not the styling, so it's set
 * plainly rather than played up. `suffix` renders a further muted trailing
 * label, e.g. "for churches". */
export function Wordmark({ size = 22, tone = 'light', suffix }) {
  const getColor = tone === 'dark' ? 'color-mix(in srgb,white 90%,transparent)' : 'var(--color-text)'
  const godColor = tone === 'dark' ? 'var(--color-accent-300)' : 'var(--color-accent-700)'
  const comColor = tone === 'dark' ? 'color-mix(in srgb,white 50%,transparent)' : 'color-mix(in srgb,var(--color-text) 42%,transparent)'
  const suffixColor = tone === 'dark' ? 'color-mix(in srgb,white 55%,transparent)' : 'color-mix(in srgb,var(--color-text) 45%,transparent)'
  return (
    <span className="pf-h" style={{ fontSize: size, fontWeight: 700 }}>
      <span style={{ color: getColor }}>Get</span>
      <span style={{ color: godColor }}>-God</span>
      <span style={{ color: comColor, fontSize: size * 0.62, fontWeight: 500 }}>.com</span>
      {suffix && <span style={{ fontWeight: 400, fontSize: size * 0.62, color: suffixColor }}> {suffix}</span>}
    </span>
  )
}

export function Logo({ size = 22, tone = 'light' }) {
  return (
    <span className="flex items-center gap-[9px]">
      <Mark size={size * 1.05} tone={tone} />
      <Wordmark size={size} tone={tone} />
    </span>
  )
}
