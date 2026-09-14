import { useRef, useState } from 'react'
import { Video, X } from 'lucide-react'
import { uploadAndWait, MAX_DURATION_SECONDS } from '../lib/mux.js'

/**
 * Record-or-pick a video, upload it to Mux, and wait for it to clear
 * processing (and the 5-minute cap — see patch-010). Calls onUploaded with
 * the resulting mux_assets row id once it's actually ready to attach to a
 * question/answer; the caller shouldn't let someone submit before that.
 */
export function VideoCapture({ onUploaded, onClear }) {
  const inputRef = useRef(null)
  const [state, setState] = useState('empty') // empty | checking | uploading | processing | ready | error
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)

  const reset = () => {
    setState('empty')
    setProgress(0)
    setError('')
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
    onClear?.()
  }

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setPreviewUrl(URL.createObjectURL(file))
    setState('checking')

    // Fast client-side check so an obviously-too-long clip never even
    // starts uploading — the real, unbypassable limit is the mux_assets
    // duration trigger, this is just a courtesy.
    const durationOk = await new Promise((resolve) => {
      const probe = document.createElement('video')
      probe.preload = 'metadata'
      probe.onloadedmetadata = () => resolve(probe.duration <= MAX_DURATION_SECONDS + 1)
      probe.onerror = () => resolve(true) // can't tell — let the server decide
      probe.src = URL.createObjectURL(file)
    })
    if (!durationOk) {
      setError(`That video is longer than ${MAX_DURATION_SECONDS / 60} minutes — please trim it and try again.`)
      setState('error')
      return
    }

    try {
      setState('uploading')
      const assetId = await uploadAndWait(file, (p) => {
        setProgress(p)
        if (p >= 1) setState('processing')
      })
      setState('ready')
      onUploaded(assetId)
    } catch (e) {
      setError(e.message || 'Upload failed — please try again.')
      setState('error')
    }
  }

  if (state === 'empty') {
    return (
      <label
        className="flex flex-col items-center justify-center gap-2 pf-tap"
        style={{
          border: '1.5px dashed var(--color-divider)', borderRadius: 'var(--radius-md)',
          padding: '32px 16px', textAlign: 'center', cursor: 'pointer',
        }}
      >
        <Video size={22} strokeWidth={1.5} style={{ color: 'var(--color-accent-2-600)' }} />
        <span style={{ fontSize: 13.5 }}>Record or choose a video</span>
        <span style={{ fontSize: 11.5, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>Up to {MAX_DURATION_SECONDS / 60} minutes</span>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          capture="user"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    )
  }

  return (
    <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {previewUrl && (
        <video src={previewUrl} muted playsInline style={{ width: '100%', maxHeight: 220, display: 'block', background: 'black' }} />
      )}
      <div className="flex items-center justify-between gap-2" style={{ padding: '10px 14px' }}>
        <span style={{ fontSize: 12.5 }}>
          {state === 'checking' && 'Checking video…'}
          {state === 'uploading' && `Uploading… ${Math.round(progress * 100)}%`}
          {state === 'processing' && 'Processing…'}
          {state === 'ready' && 'Ready to post'}
          {state === 'error' && <span style={{ color: 'var(--color-accent-2-600)' }}>{error}</span>}
        </span>
        <button onClick={reset} className="flex items-center gap-1" style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
          <X size={13} /> Remove
        </button>
      </div>
      {(state === 'uploading' || state === 'checking') && (
        <div style={{ height: 3, background: 'var(--color-neutral-200)' }}>
          <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: 'var(--color-accent-2)', transition: 'width .2s' }} />
        </div>
      )}
    </div>
  )
}
