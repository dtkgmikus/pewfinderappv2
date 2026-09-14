# Mobile (iOS + Android via Capacitor)

PewFinder ships to the App Store and Play Store by wrapping this same React
web app in [Capacitor](https://capacitorjs.com/) rather than maintaining a
separate native codebase. Everything below can't be run inside this cloud
build environment (npm registry access is blocked here) — it's written so
the whole thing is a handful of commands on a real machine with Node and,
for iOS, Xcode.

## What's already in the repo

- `capacitor.config.ts` — app id (`org.pewfinder.app`), app name, and
  `webDir: 'dist'` (Vite's build output).
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`,
  `@capacitor/app`, `@capacitor/browser` added to `package.json`.
- `npm run cap:add` / `cap:sync` / `cap:ios` / `cap:android` scripts.
- `src/lib/platform.js` — `isNativeApp()` / `openExternal()` helpers.
- Safe-area padding on `MemberLayout` and `viewport-fit=cover` in
  `index.html`, so content clears the iOS notch/home indicator.
- The native billing carve-out described below, already wired into
  `UpgradeScreen.jsx` / `BillingScreen.jsx` / `src/lib/billing.js`.

## One-time setup (on your own machine)

```
npm install
npm run cap:add            # creates ios/ and android/ native projects
npm run cap:sync           # builds the web app and copies it + syncs plugins into both
```

That gives you real `ios/` (Xcode project) and `android/` (Android Studio /
Gradle project) folders. From there:

- **iOS**: `npm run cap:ios` opens the project in Xcode. You'll need an
  Apple Developer account, a bundle id matching `capacitor.config.ts`
  (`org.pewfinder.app`, or change it to whatever you register), and to set
  up signing in Xcode before you can run on a device or archive for
  TestFlight/App Store Connect.
- **Android**: `npm run cap:android` opens the project in Android Studio.
  You'll need a keystore for signing the release build and a Google Play
  Console developer account ($25 one-time) before you can upload to Play.
- Every time you change the web app: `npm run cap:sync` rebuilds `dist/`
  and copies it into both native shells before you open/run them again.

## App icon & splash screen

Not generated yet — there's no source artwork in the repo. The usual path
once you have a square 1024×1024 logo mark:
```
npm install -D @capacitor/assets
npx capacitor-assets generate
```
That produces every iOS/Android icon and splash size from one source image.

## Why Stripe checkout is blocked inside the native app

This is the part most likely to get a build rejected if skipped, so it's
enforced in code, not just documented:

Apple (App Store Review Guideline 3.1.1) and Google (Play's Billing policy)
generally require **digital** goods/services consumed inside an app to go
through Apple's In-App Purchase / Google Play Billing — not a third-party
processor like Stripe — and take their standard cut (15–30%). Starting a
Stripe Checkout session from inside the wrapped app for a new subscription
is exactly the kind of thing that gets an app rejected in review.

PewFinder Pro likely qualifies for the **"multiplatform services"**
exception both stores carve out for account-based B2B services that are
usable outside the app too (Guideline 3.1.3(b) on iOS; Play has a
comparable reading for services not primarily consumed as in-app digital
content) — a church's Pro subscription is a business tool for running
their listing, manageable from a browser, not a consumable unlocked purely
inside the app. That's a real exception, but it's Apple/Google's judgment
call at review time, not a guarantee — **do not treat this document as
legal or App Review advice; if the monthly fee is central to the business,
get a real review of this against the current guidelines (they change)
before submitting, ideally with someone who's shipped a paid B2B iOS app
before.**

Until/unless you've confirmed that, the code takes the conservative path:

- `startProCheckout()` (`src/lib/billing.js`) throws if called from inside
  the native app — Checkout can only start from a real browser tab.
- `UpgradeScreen.jsx` / `BillingScreen.jsx` detect `isNativeApp()` and show
  an **"Upgrade on the web"** button that opens `pewfinder.app/admin/billing`
  in the system browser instead of starting checkout in-app.
- Managing or cancelling an *already active* subscription
  (`openBillingPortal()`) still works from native — that's Stripe's hosted
  portal, opened externally via `@capacitor/browser`, and isn't a new
  purchase, so it doesn't carry the same review risk.

If you get an explicit go-ahead to sell Pro via in-app purchase instead,
that's a bigger change (StoreKit/Play Billing SDKs, server-side receipt
validation in a new edge function, mapping store subscriptions back to
`subscriptions`/`churches.plan`) — flag it and it can be scoped separately
rather than folded into this.

## Supabase auth in a WebView

Email/password signup and login (what the app uses today) work as-is —
they're plain POST requests, nothing that needs a browser redirect. If
OAuth/social login is ever added, it needs `@capacitor/browser`'s in-app
browser (not a bare `window.location` redirect) plus a custom URL scheme
or universal/app link so the OAuth callback can hand control back to the
app — not wired up yet since nothing in the app uses it today.

## Known gaps before a real store submission

- No app icon/splash source artwork (see above).
- No push notifications wired up (sermon-note / flag-decision notifications
  are DB rows today per `README.md`'s "Known follow-ups" — a native push
  channel would be a separate `@capacitor/push-notifications` + backend
  piece, not required for a first submission).
- Privacy manifest / data-collection disclosures (App Store's "App Privacy"
  questionnaire, Play's Data Safety form) aren't filled out anywhere in this
  repo — that's store-console configuration, not code, but budget time for
  it since it covers what `profiles`/`church_page_views` collects.
- Nothing here has been run — `npx cap add`/`sync`, an Xcode build, and a
  Gradle build all still need to happen on a real machine to confirm the
  native shells actually come up clean.
