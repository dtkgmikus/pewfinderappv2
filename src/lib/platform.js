// Capacitor is only present once `npx cap add ios/android` has been run and
// the native shells are built (see MOBILE.md) — this file has to work fine
// before that, too, so it never imports `@capacitor/core` at the top level.
// `window.Capacitor` only exists inside a Capacitor-wrapped build; a normal
// browser tab (the marketing site, desktop, mobile web) never has it.

/** True only inside the Capacitor-wrapped iOS/Android app, never in a browser tab. */
export function isNativeApp() {
  return typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()
}

export function nativePlatform() {
  if (!isNativeApp()) return null
  return window.Capacitor.getPlatform?.() ?? null // 'ios' | 'android'
}

/**
 * Opens a URL in the system/in-app browser rather than navigating the
 * WebView away from the app. Falls back to a normal same-tab navigation
 * outside of Capacitor.
 */
export async function openExternal(url) {
  if (isNativeApp()) {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } else {
    window.location.href = url
  }
}
