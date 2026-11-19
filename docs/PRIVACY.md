# Privacy and local storage

## What the app processes

FRAME uses camera video frames, or one imported image, to locate body/face landmarks and calculate guidance. Height and distance are entered by the user for calibration. Captured JPEGs, capture dates, selected framing/pose and burst-quality metadata are stored locally.

The app does not upload frames or photos, send images to an AI API, recognize identities, create face embeddings, rate appearance, use analytics, request location or record microphone audio. Both MediaPipe models are packaged with the app.

## Storage and retention

| Data | Location | Lifetime |
|---|---|---|
| Live frames and landmarks | App memory | Current camera session |
| Calibration | App memory | Until invalidated, stopped or reloaded |
| Photos and burst metadata | IndexedDB `frame-camera` | Until deleted or app/browser storage is removed |
| Language | Local storage `frame-language` | Until changed or storage cleared |
| Frame/pose preferences | Local storage `frame-settings` | Until changed or storage cleared |
| Web code and loaded models | Service-worker/browser cache | Until cache cleanup or version replacement |
| Native exported JPEG copies | App cache `frame-share/` | Until OS/app cache cleanup |

Web galleries belong to the website origin. Switching from a temporary tunnel to GitHub Pages creates a different gallery; it does not transfer the old origin's images. The native app has its own storage. The local Delete action removes the selected gallery record; it does not recall copies already exported or shared.

Download/export important photos. Browser quota, private browsing, storage cleanup and uninstalling can remove local data. A storage error is surfaced in the UI, but in-memory photos are not a durable backup.

## Network boundary

A web host delivers the application's static files and may observe normal request metadata such as IP address and user agent. FRAME itself does not attach photo data to those requests. In a native build, application/model files are bundled locally. Native share/export deliberately hands a selected file to the OS and the destination chosen by the user; that destination's privacy policy applies.

Android automatic app backup is disabled in the manifest. iOS/device backups remain governed by operating-system behavior and the user's device settings. This document describes app behavior, not a guarantee about OS/cloud backups or third-party sharing destinations.

## Permissions

- Camera: used after the user starts the camera; explanations are localized.
- Photo-add explanation on iOS: for user-initiated saving through the share flow.
- Android INTERNET: WebView/network capability; it is not used to upload camera images.
- No microphone or location permission is declared/requested by the app.

The web camera is stopped when the document becomes hidden. On gallery/pose views the active video track is disabled. Native lifecycle behavior must also be verified on actual devices.

## Public repository vs private photos

The public repository contains app source, libraries, models and an AI-generated demo image. It contains no captured user gallery, personal camera footage, signing credentials or calibration history. Publishing the repository does not upload local IndexedDB storage.

## Before a store release

Review Apple privacy labels, the privacy manifest, Google Play Data safety and all added SDKs against actual behavior. No app-store submission or claim of store approval is included in this project.
