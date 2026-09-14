import type { CapacitorConfig } from '@capacitor/cli'

// Wraps the existing Vite/React web app for iOS + Android distribution —
// same codebase, same Supabase backend, no separate native UI. See
// MOBILE.md for the one-time setup this config depends on (npx cap add
// ios / android) and for why Stripe checkout is intentionally kept out of
// the native builds (App Store / Play Store billing-review reasons).
//
// appName is "Get-God", not "Get-God.com" — Apple/Google's naming
// guidelines generally discourage a literal domain suffix in the store
// display name. The ".com" is part of the web/marketing wordmark (see
// Logo.jsx), not the app's own name.
const config: CapacitorConfig = {
  appId: 'com.getgod.app',
  appName: 'Get-God',
  webDir: 'dist',
  server: {
    // Only used by `npx cap run` for live-reload against the Vite dev
    // server during development. Comment out (or set androidScheme only)
    // for production builds, which load the bundled `dist/` instead.
    // androidScheme: 'https',
  },
}

export default config
