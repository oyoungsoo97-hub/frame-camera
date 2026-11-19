# Store assets

- `apple-icon-1024.png`: existing FRAME icon, 1024×1024.
- `google-play-icon-512.png`: existing FRAME icon, 512×512.
- `google-play-feature-{de,en,ko}-1024x500.png`: localized brand graphic, RGB PNG. These are promotional graphics, not fabricated screenshots.

Native screenshots are produced by the integration tests from actual iOS Simulator / Android emulator app windows in all three languages, using the bundled AI-generated demo photograph. They are retained in `native-screenshots` in each QA artifact. Review every image before use. Store submissions need final release screenshots after removal of beta labels, correct locale, no test alerts, and required target sizes.

Apple screenshot specifications: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
Google store-asset requirements: https://support.google.com/googleplay/android-developer/answer/9866151

Do not stretch screenshots or label a browser capture as a native device capture. Retain evidence of the device/simulator, screen size, build and language used. A screenshot does not certify camera hardware behavior.
