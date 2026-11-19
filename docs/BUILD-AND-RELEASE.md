# Build, signing, hosting and release

## Reproducible inputs

Use Node 22+ and the committed `package-lock.json`. Capacitor Core/CLI/iOS/Android are pinned to 8.6.2, Filesystem to 8.1.5 and Share to 8.0.3. Do not update only one core platform package. MediaPipe 0.10.21 and both model files are vendored under `dist/vendor/`.

```sh
npm ci
npm run build
npm test
npm run check
```

The build bundles only the small native bridge with esbuild. HTML/CSS and the main application are readable source modules. No API keys, backend database, paid inference service or remote web URL are required.

## HTML / PWA

Publish the **contents of `dist/`** at one HTTPS location. `index.html` must be at the served root. Include all model and WASM files; the largest file is approximately 9.6 MB. The app uses relative paths and supports the GitHub Pages `/frame-camera/` subdirectory.

Do not expose `node_modules`, signing files or development configuration. Opening a local HTML file is not a supported camera environment. Localhost is suitable for development; a phone cannot access the computer's `127.0.0.1` address.

### GitHub Pages

The `Publish web app` workflow builds, tests, verifies and publishes `dist/`. Repository Settings → Pages → Source must be **GitHub Actions**. The intended project URL is `https://oyoungsoo97-hub.github.io/frame-camera/`; confirm the successful deployment before distributing it.

Keep the repository/project name stable. The old `trycloudflare.com` URLs were temporary and are not the permanent entry point. A custom domain is optional. A domain change creates a separate browser storage origin; export old photos before moving users.

## iOS / Apple

Requirements: macOS, Xcode 26+, iOS 15+, Node/npm. Swift Package Manager is used; CocoaPods is not required for this project.

```sh
npm ci
npm run build
npx cap sync ios
npx cap open ios
```

Open `ios/App/App.xcodeproj`, select the `App` scheme and a simulator or paired device. In Signing & Capabilities select your Apple development team. The initial bundle identifier is `io.github.oyoungsoo97hub.framecamera`.

For a simulator-only build without signing:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath build/ios CODE_SIGNING_ALLOWED=NO build
```

The `.app` is under `build/ios/Build/Products/Debug-iphonesimulator/`. A simulator app is **not** an iPhone installation file. The CI artifact `FRAME-iOS-Simulator` contains a zipped simulator app.

### Device / IPA / TestFlight

1. Configure your own signing team, unique bundle ID and provisioning in Xcode.
2. Connect a device for local development, or select a generic iOS device for Archive.
3. Build and verify camera start, tracking, gallery, export and all languages on real hardware.
4. Product → Archive; use Organizer's distribution flow appropriate to your account.
5. For TestFlight/App Store, finish your App Store Connect app record, privacy disclosures, screenshots and review information.

This repository contains no Apple credentials, certificate, provisioning profile or signed IPA. Adding a certificate to the repository is not an acceptable signing setup. Use Xcode's signing tools or separately authorized CI secrets when a signed release is requested.

`Info.plist` contains camera/photo-add usage descriptions; localized `InfoPlist.strings` cover de/en/ko. `PrivacyInfo.xcprivacy` declares local filesystem timestamp access under C617.1. Reassess declarations if adding SDKs or data collection.

## Android

Requirements: Android Studio 2025.2.1+ or compatible command-line tooling, JDK 21, Android SDK platform 36 and matching build tools. Runtime minimum is API 24.

```sh
npm ci
npm run build
npx cap sync android
npx cap open android
```

For a debug APK:

```sh
cd android
chmod +x gradlew
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`. The CI artifact `FRAME-Android-debug` contains this test APK after a successful job. Debug certificates on ephemeral CI runners may change; builds signed with a different certificate cannot update an existing installation in place. Export important photos before any reinstall.

For a store build, configure a persistent release keystore outside version control, add signing configuration via local/CI secret values and run `./gradlew bundleRelease`. This produces an Android App Bundle, not an iOS file. Complete the Play Console listing and Data safety declarations before publishing. Store submission is outside the current implementation.

The Android manifest requests CAMERA and INTERNET, marks camera hardware optional for demo/import use and disables automatic app backup. There is no microphone permission. INTERNET allows app/model infrastructure and WebView operation; camera images are not sent to a backend.

## GitHub Actions

- `pages.yml`: static web build/test/deploy with `contents: read`, `pages: write`, `id-token: write`.
- `native.yml`: Linux Android debug build and macOS 26 iOS simulator build, with read-only repository access.
- Native artifacts are retained for 30 days. Download them from a successful workflow run; a failed job has no usable artifact.
- A build is not proof of real-device behavior. Review `docs/TESTING.md` before a public release.

## Updating a release

1. Edit `dist/`, translations and/or native source.
2. Bump version in `package.json`, Android versionCode/versionName and Xcode build/marketing version as appropriate.
3. If web resources change, bump the query version in HTML/module imports and the service-worker cache name together.
4. Run build, tests, project checks and browser QA in all three languages.
5. Run `npx cap sync` so native projects receive current web assets and plugin metadata.
6. Push to main, inspect each workflow, download/test native artifacts and verify the production web URL.
7. Update release notes and verification records with actual results. Do not label untested hardware behavior as verified.

## References

[Capacitor environment](https://capacitorjs.com/docs/getting-started/environment-setup), [Capacitor workflow](https://capacitorjs.com/docs/basics/workflow), [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Filesystem privacy manifest](https://capacitorjs.com/docs/apis/filesystem).
