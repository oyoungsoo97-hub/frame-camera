# Troubleshooting

| Symptom | Check and recovery |
|---|---|
| Start does nothing | Use the current production URL directly in Safari/Chrome. Reload after an update. The request must originate from a tap. |
| Camera denied | Allow the site in Safari settings, or the installed app in system permissions. Then retry. |
| No HTTPS | Use the HTTPS deployment. Plain LAN HTTP is not a secure camera context. |
| Preview timeout | Close competing camera apps and retry; confirm a physical camera exists. |
| Native preview unavailable | Verify camera manifest/Info.plist, WebView/OS version and a real device. A simulator may not supply a camera. |
| Loading model fails | Check all `vendor/` files, MIME handling for WASM, network and device memory; manual capture remains available. |
| Eye check unavailable | Show a clear, sufficiently large face. Use the manual shutter; unknown eyes intentionally block quality-based auto capture. |
| Auto never captures | Hold alignment for two seconds. Check eyes, light and steadiness. Turn off Best of 3 if pose-only auto is intended. |
| Distances seem wrong | Re-enter measured height/distance while fully visible and upright; keep lens, zoom and posture fixed. |
| No cm/m while seated | Expected: standing-height calibration is not valid for seated geometry. |
| Arrows seem reversed | They follow the displayed screen, including selfie mirroring, not the subject's anatomical left/right. |
| Language partly English | Capture the exact source phrase and add it to the catalog/template tests. Unknown text falls back to English. |
| No speech | Check silent/output settings and installed voices. Some browsers need a direct tap before speech. |
| Gallery empty on new URL | Storage is origin-specific. The old address's gallery is not automatically transferred. |
| Photos disappear | Browser/app storage may have been cleared, private mode ended or the app reinstalled. Export important photos. |
| Native Save opens Share | Expected. The app exports a cache JPEG through the OS share sheet; choose a destination there. |
| Android update won't install | The debug signing key may differ between CI runs. Use a persistent release key for upgrades; export before reinstalling. |
| iOS simulator file won't install on iPhone | A simulator `.app` is not a signed device IPA. Build/archive with your Apple signing team. |
| Pages deployment fails | Repository Settings → Pages must use GitHub Actions. Review the workflow's failed step and artifact. |
| Native build cannot find local packages | Run `npm ci`, `npm run build`, then `npx cap sync` before opening the platform project. |
| Changes don't appear | Bump web query/cache versions together, reload, and sync native assets before rebuilding. |

When reporting a bug, include platform, OS/browser version, commit/version, language, reproduction steps and visible error. Do not attach private camera images unless you deliberately want to share them. A generated/synthetic fixture is often sufficient.
