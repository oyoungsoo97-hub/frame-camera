# Verification record — 2026-11-19

## Build and deployment evidence

- Source commit `b5c0a1f8862ffec08f2d6090c202eca119f18270` was uploaded to the public `oyoungsoo97-hub/frame-camera` repository.
- [Native workflow run](https://github.com/oyoungsoo97-hub/frame-camera/actions/runs/44520431962): Android and iOS simulator jobs both succeeded. The run produced `FRAME-Android-debug` and `FRAME-iOS-Simulator` artifacts.
- [Web deployment run](https://github.com/oyoungsoo97-hub/frame-camera/actions/runs/44520432061): succeeded on attempt 2 after enabling GitHub Pages → GitHub Actions. The first attempt failed because Pages had not yet been enabled.
- The public HTTPS URL returned HTTP 200. The deployed demo loaded the actual bundled pose model and produced tracking/direction guidance under the `/frame-camera/` path.
- The Node suite passed 60/60 tests. Project asset/configuration checks passed. iOS plist/privacy/project syntax checks passed locally.
- CI currently emits upstream action-runtime deprecation warnings; both native compilations and deployment nevertheless succeeded.

## Browser checks performed

Chrome desktop with mobile viewport overrides; these are not physical iPhone tests.

- German → English → Korean → German switched labels, instructions, options, accessible names and dialogs without losing the current demo.
- Korean persisted after reload. The captured generated demo photo also persisted in the local gallery.
- Actual demo pose analysis and hypothetical 170 cm / 3 m calibration produced approximately 10 cm rightward guidance in all three languages.
- English composition dialog rendered light/horizon suggestions; Korean capture rendered translated quality, save/share and delete controls.
- Korean/German pose library and German gallery were inspected after language switches.
- 390×844 and 390×664 shooting views kept guidance and shutter visible; long German and Korean copy fit.
- No browser console errors were recorded during the deployed-app checks.

## Not verified

Physical iPhone/Android camera permission behavior, native hardware tracking, battery/thermal behavior, native share sheet and App Store/Play Store submission. No signed iPhone IPA or signed Android production AAB was produced. Use the real-device checklist in [TESTING.md](TESTING.md).

The generated demo is not evidence of metric accuracy in the real world. Calibration values used for screenshots were hypothetical.
