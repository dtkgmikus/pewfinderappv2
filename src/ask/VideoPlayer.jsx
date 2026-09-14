import { useEffect, useRef } from 'react'

/**
 * Plays a Mux asset by playback id. iOS/Safari (and the Capacitor iOS
 * WebView, which shares WebKit) can play Mux's HLS stream natively; every
 * other browser (Chrome, Firefox, the Capacitor Android WebView) needs
 * hls.js, loaded on demand so it's never bundled for the browsers that
 * don't need it.
 */
export function VideoPlayer({ playbackId, className, style, autoPlay = false }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !playbackId) return
    const src = `https://stream.mux.com/${playbackId}.m3u8`
    let hls

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          hls = new Hls()
          hls.loadSource(src)
          hls.attachMedia(video)
        } else {
          // No HLS support at all (very old browser) — nothing more we can do.
          console.error('This browser cannot play HLS video.')
        }
      })
    }

    return () => hls?.destroy()
  }, [playbackId])

  if (!playbackId) return null

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      autoPlay={autoPlay}
      poster={`https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`}
      className={className}
      style={{ width: '100%', borderRadius: 'var(--radius-md)', background: 'black', ...style }}
    />
  )
}
