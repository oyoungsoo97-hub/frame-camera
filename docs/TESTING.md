# Testing and verification

## Automated suite

Run `npm test` (Node built-in test runner; no extra test framework). The current suite has 69 checks:

- Camera permission is requested immediately; timeout, denial, cancel and late-stream cleanup.
- Video visibility/mute/inline ordering and bounded playback startup.
- Visible crop, front-camera mirroring, missing/occluded joints and pose alignment.
- Direction and amount calculations, movement convergence and scale invalidation.
- Decimal input parsing, centimeter/meter formatting and seated calibration suppression.
- Background contrast, brightness and possible horizontal-edge behavior.
- Sharpness, frame change, eye uncertainty, burst ranking and fresh auto-capture gates.
- Locale preference/fallback, complete catalog entries, metric directions/amounts, composed guidance and native permission resources.
- Safari 15-compatible translation parsing.
- Initial gallery load ordering, blocked/late database opening, timeouts, committed writes and storage quota/abort failures.

`npm run check` verifies HTML asset references, required models/runtime files, pinned native runtimes and bundled native asset configuration. `npm run build` reproduces the native bridge.

## Browser scenarios

1. Start with a fresh page. Try demo without a camera permission request.
2. Switch de → en → ko → de; verify labels, guidance, dialogs, poses and persistence after reload.
3. Analyze the generated demo photo with the actual model. Calibrate hypothetical values, then verify translated cm/m guidance.
4. Test 390×844 and 390×664 layouts: no horizontal overflow, visible shutter, accessible Options and long German/Korean text.
5. Exercise composition, seated pack, gallery and dialog close/back behavior.
6. Synthetic-video checks can validate live frame processing/capture without exposing the developer's real camera. Keep test fixtures outside production `dist/`.

Earlier versions were verified with synthetic video for camera start, framing direction, three-frame capture, eye detection and persistence. Those checks are useful regression evidence but do not prove native hardware performance.

## Native build checks

GitHub Actions produces an Android debug APK and iOS simulator app only after successful compilation. Inspect the run linked from the README. An artifact proves a package was built, not that camera access works on a physical phone.

The development Mac used for initial v2 preparation has command-line tools but no full Xcode, Android SDK or JDK. Native compilation is therefore delegated to the committed CI workflows unless the local environment is subsequently installed.

## Real-device release checklist

- [ ] iPhone: first permission, deny/retry via Settings, rear and front camera.
- [ ] Android: first permission, denial, permission restoration, front/rear switch.
- [ ] Background, lock screen and return: no stale recording or stuck preview.
- [ ] Portrait and landscape safe areas; options and shutter remain reachable.
- [ ] Stable tracking in daylight, low light, backlight and partial occlusion.
- [ ] cm/m estimates with measured reference distance; calibration invalidation.
- [ ] Seated visual guidance never displays standing-distance estimates.
- [ ] Burst selection with open eyes, a blink and deliberately blurred frames.
- [ ] Auto capture does not fire on unknown eyes, stale measurements or lost pose.
- [ ] Import, local gallery, share sheet and save-to-photos behavior.
- [ ] Language switching, persistence, voice and screen-reader labels in de/en/ko.
- [ ] Extended use: heat, battery, frame rate, low storage and offline behavior.
- [ ] Signing, version upgrade and data retention for release packages.

Record device model, OS/WebView version, app commit, date and actual result. Do not mark unchecked items complete based on source inspection or a simulator build.

## Store preparation suite

`.github/workflows/store-checks.yml` runs hosted XCTest in actual iPhone/iPad WKWebViews and Android instrumentation in actual emulator WebViews. See [the current report](../store/reports/TEST-REPORT.md). Tests exercise bundled model inference, all three languages, responsive layout, capture, persisted gallery deletion, native file operations and Android emulated camera/background behavior. Screenshots are captured from the native app windows with the generated demo image. They are not physical-camera photographs.

Android permission is pre-granted in these automated tests; first-time system dialog, denial/recovery and actual OEM camera performance are explicitly real-device gates. iOS Simulator does not prove camera functionality. No test claims all devices are supported.
