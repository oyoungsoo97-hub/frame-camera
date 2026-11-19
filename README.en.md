> **2.1.0 store preparation:** [Release gates, owner requirements and test plan](store/README.md). Native camera tests on physical devices and production signing remain pending. The v2.0.0 release is historical.

# FRAME — Your camera coach

**[Deutsch](README.md) · [English](README.en.md) · [한국어](README.ko.md)**

FRAME coaches one person through framing, positioning and posing. Camera analysis runs on the device. The interface, guidance, errors, accessibility labels and speech support **German, English and Korean**.

[Open the web app](https://oyoungsoo97-hub.github.io/frame-camera/) · [Native build downloads](https://github.com/oyoungsoo97-hub/frame-camera/releases/tag/v2.0.0)

## Included formats

| Platform | Included | Requirements |
|---|---|---|
| Web / HTML / PWA | `dist/`, including models and WebAssembly | Static HTTPS hosting; Safari or Chrome |
| Apple iOS | `ios/App/App.xcodeproj`, Swift/Capacitor shell | macOS, Xcode 26+, iOS 15.4+; your Apple signing team for a real phone |
| Android | `android/`, Java/Gradle/Capacitor shell | Android Studio, JDK 21, API 36 SDK; runtime Android API 24+ |
| CI artifacts | Android debug APK and iOS simulator `.app.zip` | Available when the corresponding GitHub Actions job succeeds |

These are native projects with a bundled local web interface, not remote-site wrappers. The simulator app cannot be installed on an iPhone. A signed IPA/TestFlight release requires Apple signing; an Android store release requires your own release key. No store submission or signing credential is included.

## Features

Live skeleton and target outline; movement arrows; calibrated centimeter/meter estimates; travel/café/full-body/seated pose packs; background/light/horizon suggestions; three-frame capture with best candidate selection; alignment-based automatic capture; open-eye and steadiness gates; timer, crop, grid, front/rear camera; local gallery; web downloads and native sharing.

## Use it

1. Open the web URL directly in Safari or Chrome. On iPhone you can add it to the Home Screen from Safari's Share menu.
2. Select **Deutsch**, **English** or **한국어** at the top. In shooting view, open **Options**.
3. Start the camera and allow access, or try the demo without camera permission.
4. Pick a pack, framing style and pose. Follow the visible screen-direction arrow.
5. For cm/m, enter the person's height and current camera-to-person distance. Stand upright with the full body visible and phone level, then calibrate.
6. Capture. Best of 3 keeps all three frames; tap thumbnails to compare. Export photos you want to keep.

## Development

```sh
npm ci
npm run build
npm test
npm run check
npm start
```

Node 22+ is required. The web server uses Python 3. Opening HTML as a local file does not provide a working module/camera environment.

```sh
npm run build
npx cap sync ios
npm run ios
# or
npx cap sync android
npm run android
```

The app ID is `io.github.oyoungsoo97hub.framecamera`. Native permission strings are localized. Photo export uses Capacitor Filesystem's cache directory and the OS share sheet. No microphone permission is requested.

## Accuracy and privacy

Distance guidance is a calibrated geometric estimate, not a depth-sensor measurement. Keep the person, posture, lens and zoom unchanged and recalibrate after changes. Seated poses do not reuse a standing scale. Horizon detection may find walls or roofs. Gaze tips are not gaze tracking. Face analysis estimates eye state; it does not identify people or rate beauty.

Frames and imported images are processed locally. Gallery data is local to the app/browser origin. A new domain has a separate gallery. Clearing storage or uninstalling may remove photos. Export important images. Device backups and user-selected share destinations are governed by the operating system and your choices.

Build success is not a hardware test. Real iPhone/Android camera, performance, battery and sharing checks remain essential before a production release.

## Documentation

- [Architecture and calculations](docs/ARCHITECTURE.md)
- [Building, signing, hosting and releasing](docs/BUILD-AND-RELEASE.md)
- [Privacy and retention](docs/PRIVACY.md)
- [Localization](docs/LOCALIZATION.md)
- [Testing](docs/TESTING.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

Version 2.0.0 beta. The demo photo is AI-generated. Project code has no additional open-source license grant; bundled third-party materials retain their licenses.
