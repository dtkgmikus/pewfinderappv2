import { ImageIcon } from 'lucide-react'

/**
 * A church photo slot. Renders the real photo when one has been uploaded;
 * otherwise a neutral placeholder plate (the prototype used licensed Adobe
 * Stock comps here, which aren't cleared for production, so a real church
 * photo has to come from the church itself).
 */
export function PlatePhoto({ url, label = 'Photo', className = '', flat = false, iconSize = 18 }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={`${flat ? 'plate-flat' : 'plate'} object-cover w-full h-full ${className}`}
      />
    )
  }
  return (
    <div
      className={`pf-plate ${flat ? 'plate-flat' : 'plate'} w-full h-full flex flex-col items-center justify-center gap-1.5 ${className}`}
      style={{ color: 'color-mix(in srgb,var(--color-text) 42%,transparent)' }}
    >
      <ImageIcon size={iconSize} strokeWidth={1.3} />
      {label && <span className="text-[10.5px] text-center px-2 leading-tight">{label}</span>}
    </div>
  )
}
