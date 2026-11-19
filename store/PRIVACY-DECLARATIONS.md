# Privacy declarations — review draft

Version 2.1.0; review against the exact signed binary before submission. These are evidence-based proposed answers, not completed store forms or a legal sign-off. Public support email and publisher contact details remain pending.

## Observed implementation

| Input/data | App behavior | Leaves the app? |
|---|---|---|
| Camera/imported photo | Local body/face landmarks, framing, eye state, sharpness | No automatic upload |
| Landmarks, height/distance | Session memory for guidance; no identity matching | No |
| Captured JPEG, date, pose/quality | Local IndexedDB gallery | Only on user-chosen export/share |
| Language/settings | Local preferences | No |
| Temporary share copy | Native cache, handed to OS share destination | User-initiated |
| Payment | Store purchase transaction | Processed by Apple/Google; FRAME has no billing integration |

No account, ads, analytics, crash-upload service, location, microphone recording, advertising identifier, remote inference endpoint or third-party tracking is implemented. Bundled runtime: Capacitor Core/App/Filesystem/Share and MediaPipe models/WASM. Native apps load assets locally. Browser version is served by GitHub Pages; that host sees normal connection metadata. External GitHub support and selected share destinations have separate processing.

## Apple App Privacy

Proposed answer: **Data Not Collected** by the developer/app SDKs, based on the current local-only implementation and Apple's definitions. Verify user-initiated sharing exceptions and SDK changes against [Apple's privacy guidance](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy). No tracking, no ATT prompt implemented. Face/body geometry is used transiently for guidance, not recognition; do not misdescribe it as no image processing.

`ios/App/App/PrivacyInfo.xcprivacy` declares no tracking/collection and the file-timestamp reason C617.1 used by Filesystem. Capacitor framework manifests must remain in the final archive. Review Xcode's aggregated privacy report and signing warnings; a source plist is not proof of an accepted archive. Camera and photo-add usage strings exist in de/en/ko. No microphone or location usage string is added.

## Google Data safety / App content

Proposed Data safety: no developer/SDK collection or sharing under the [Google definitions](https://support.google.com/googleplay/android-developer/answer/10787469), subject to final binary and the user-directed sharing exception. No account creation, so there is no FRAME server account to delete. Local photo deletion is available; exported copies are outside FRAME's control. Do not claim independent security certification or universal encrypted storage. Apps and OS backups differ.

Ads: no. App access: no login required. CAMERA and INTERNET are expected; source manifests do not request microphone, location, contacts or broad photo/storage access. Audit the **merged release manifest**, not only the source. Imported images use user selection; exports use app cache and the OS share flow. Android automatic backup is disabled; iOS backup follows OS settings.

## Policy publication

The three-language policy is `dist/privacy.html`, support is `dist/support.html`; they are accessible from mobile Options. Before submission, replace provisional support contact with the owner's public email, complete any required legal contact/rights information and verify both HTTPS URLs in a private browser without login. The script `scripts/prepare-store-content.py` prepares draft text; review changes before regeneration.

Changes to ads, analytics, remote APIs, account features, support attachments or billing require a fresh review of declarations and policy. Never copy these answers blindly into a future version.
