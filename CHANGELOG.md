# 2.1.0 — preparation, not a store release

- Replaced regex lookbehind that prevented translations from parsing on Safari/iOS 15.
- Set iOS minimum to 15.4 and Android WebView minimum to 90; added old-WebView update screen and viewport-height fallbacks.
- Added native background camera shutdown and Android back handling; iOS permission alerts do not trigger native background shutdown.
- Added three-language public privacy/support pages accessible in mobile Options.
- Fixed first-photo gallery initialization racing with capture; added explicit export warning and paused automatic capture when a photo cannot be persisted.
- Prepared paid-download metadata (€2.99), signing configuration, release audits and explicit device/account release gates.
- Added native integration suites, generated-demo screenshots and a report distinguishing simulator/emulator checks from missing hardware acceptance.

# Changelog

## 2.0.0 — 2026-11-19

- Shared HTML/PWA, generated iOS/Xcode and Android/Gradle projects.
- German, English and Korean UI, guidance, errors, accessibility and speech locale.
- Persistent language choice and immediate switching, including shooting options.
- Native photo export via the OS share sheet; localized iOS permission resources.
- Native launcher icons, camera permissions and iOS privacy manifest.
- GitHub Pages and Android/iOS-simulator build workflows.
- Detailed user, architecture, privacy, localization, testing and release documentation.
- 60 automated checks at initial v2 verification; hardware validation remains separate.

## 1.0.5 / web release 6.2 — 2026-11-19

- Full-screen shooting and an options sheet.
- Background/light/possible-horizon composition assistance.
- Best of 3 with eye state, sharpness and frame-change checks.
- Travel, café, full-body and seated pose packs.

## Earlier web betas — 2026-11-18

- Camera startup fixes validated by the user in iPhone Safari.
- English royal-blue/white/black interface.
- Visible movement arrows and calibrated cm/m estimates.
