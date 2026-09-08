/** The diamond-marker mark, picked in the design chat as direction "1c" —
 * a map pin abstracted into a rotated square, plus the wordmark. Two-tone:
 * the diamond stays saffron, the stem (the pin's "point") is plum. `tone`
 * picks the shade of plum so the stem still shows up on a dark sidebar. */
export function Mark({ size = 13, tone = 'light' }) {
  const stemColor = tone === 'dark' ? 'var(--color-accent-2-300)' : 'var(--color-accent-2)'
  const fillOpacity = tone === 'dark' ? 22 : 14
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span
        className="block rotate-45 border"
        style={{ width: size, height: size, borderColor: 'var(--color-accent)', background: `color-mix(in srgb,var(--color-accent) ${fillOpacity}%,transparent)` }}
      />
      <span className="block" style={{ width: 1, height: size * 0.55, background: stemColor }} />
    </span>
  )
}

/** Two-tone wordmark: "Pew" stays the ambient text color, "Finder" carries
 * the saffron pop. `suffix` renders a muted trailing label, e.g. "for churches". */
export function Wordmark({ size = 21, tone = 'light', suffix }) {
  const pewColor = tone === 'dark' ? 'color-mix(in srgb,white 88%,transparent)' : 'var(--color-text)'
  const finderColor = tone === 'dark' ? 'var(--color-accent-200)' : 'var(--color-accent-700)'
  const suffixColor = tone === 'dark' ? 'color-mix(in srgb,white 55%,transparent)' : 'color-mix(in srgb,var(--color-text) 45%,transparent)'
  return (
    <span className="pf-h" style={{ fontSize: size, fontWeight: 400 }}>
      <span style={{ color: pewColor }}>Pew</span>
      <span style={{ color: finderColor, fontWeight: 600 }}>Finder</span>
      {suffix && <span style={{ fontWeight: 400, color: suffixColor }}> {suffix}</span>}
    </span>
  )
}

export function Logo({ size = 21, tone = 'light' }) {
  return (
    <span className="flex items-center gap-[9px]">
      <Mark tone={tone} />
      <Wordmark size={size} tone={tone} />
    </span>
  )
}
