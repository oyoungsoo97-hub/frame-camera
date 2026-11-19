# Architecture and algorithms

## Shared application, three delivery targets

`dist/` is the complete web application. The same directory is copied into the iOS and Android projects by Capacitor. Native applications load bundled assets at a local app origin; `capacitor.config.json` intentionally has no remote `server.url`.

```text
Camera / imported image
  → visible crop and mirror transform
  → MediaPipe pose landmarks
  → geometry + selected pose rules
  → optional calibrated metric estimates
  → movement HUD, outline, text and speech
  → capture / local IndexedDB gallery

Low-resolution crop → background/light/horizon suggestions
Face region → MediaPipe face blendshapes → eye state and face sharpness
Native export → temporary cache file → OS share sheet
```

## File map

| File | Responsibility |
|---|---|
| `dist/index.html`, `style.css` | Interface, dialogs, mobile/full-screen layout |
| `dist/app.js` | State, camera lifecycle, model scheduling, rendering, capture, persistence |
| `dist/camera-session.js` | Immediate permission request, bounded waits and cancellation |
| `dist/coach.js` | Crop projection, pose packs, confidence checks, geometric alignment |
| `dist/metric-guide.js` | Calibration, context validation, distance estimates |
| `dist/photo-analysis.js` | Brightness, edges, horizon candidates, sharpness, eye and auto gates |
| `dist/i18n.js`, `translations.js` | Language selection, presentation translation and dynamic templates |
| `scripts/native-entry.js` | Capacitor platform detection and native photo sharing |
| `dist/native-bridge.js` | Reproducible bundled native bridge, usable in ordinary browsers too |
| `dist/sw.js` | Same-origin web caching; disabled in native shells |
| `ios/`, `android/` | Platform projects, permissions, icons and build configuration |

## Camera lifecycle

The Start button requests `getUserMedia` in its user-activation task, before model initialization. Permission waiting is bounded at 25 seconds; video playback is bounded at 12 seconds. The video is made visible, muted and inline before attaching/playing the stream. Cancellation invalidates the session epoch and stops streams arriving late.

Pose loading occurs after the camera preview is available. Failed tracking leaves a manual outline/capture path. Inactive app views disable the video track. A hidden document stops the camera. Capture checks the session epoch and page visibility between frames, so a cancelled session does not continue a stale capture.

Hardware and WebView behavior still need device testing. The native shell does not replace the camera pipeline with AVFoundation or CameraX.

## Image coordinates

The viewfinder uses a center crop (`object-fit: cover`). Landmark projection applies the same crop and front-camera mirror before the guide is evaluated. Arrows therefore describe the displayed image direction. Do not use raw camera coordinates for overlay positions.

Travel, full body and portrait have different target height, top and horizontal center. Seated framing uses visible knees as its lower boundary. Composition recommendations can override the horizontal target, but only after the user applies a suggestion. Targets do not jump automatically as the background changes.

## Confidence and pose scoring

Landmarks must exceed visibility thresholds and lie inside the visible frame. Missing joints do not earn a confident score. Full-body poses require feet; seated checks require knees. Pose rules compare wrist/elbow/hip/knee geometry for relaxed arms, hand on hip, one step, wave, hands together, easy seat and thoughtful poses.

Scores measure similarity to a selected guide, not beauty, identity or professional photographic quality. Seated geometry and stylized pose outlines are approximations.

## Metric calibration

Inputs are known person height `H` and current camera distance `D0`. Calibration records raw-image head-to-foot span `h0` and head-to-hip span for portrait mode. The current frame supplies subject span `h`, target span `ht`, lateral normalized displacement `dx` and viewfinder aspect `a`.

For an unchanged camera, posture and focal length:

- estimated current distance: `D = D0 × h0 / h` (using corresponding raw spans);
- visible physical span: `P = H` for full body, or the calibrated proportional portrait span;
- sideways movement: `abs(dx) × a × P / visibleSpan`;
- camera movement: `abs(D × (visibleSpan / ht - 1))`.

The pinhole approximation assumes an upright person and near-level phone. Height and distance input errors propagate. Lens changes, zoom, source/session changes, cropped/uncertain bodies and tracking loss invalidate or suppress the scale. Seated poses do not use it. Rounding uses coarse 5 cm steps and decimeter precision for longer distances; displayed values must remain explicitly approximate.

## Composition assist

A small visible crop is converted to luminance. Reliable person landmarks define a rough exclusion rectangle. Adjacent-pixel edge differences outside that rectangle estimate background clutter on each side. A meaningful difference suggests a left or right third; busy backgrounds suggest a tighter portrait. Otherwise a balanced travel frame is suggested without claiming a clearly better side.

Brightness notices use measured average luminance and a face-region comparison. A possible horizon is a strong horizontally consistent luminance boundary fitted with a line. It may be a wall or roof; the UI states uncertainty. This is not semantic scene understanding.

## Best of 3 and auto capture

The live quality sample uses a small grayscale image for frame change. Sharpness is Laplacian variance, preferably from the face ROI. Face detection estimates eyeBlinkLeft/right blendshapes. Small/unclear faces remain unknown. Eye and sharpness estimates are kept consistent between lower-frequency face checks.

Manual Best of 3 captures three actual image frames approximately 300 ms apart and stores all of them. The ranking favors open eyes, then detail and low frame change; it does not claim an objectively best photograph. Quality metadata is stored with each frame.

Quality-based auto capture additionally requires fresh quality/eye timestamps, open eyes, movement below threshold, sufficient sharpness and pose alignment held for two seconds. Unknown eyes block this mode; manual capture remains available. Disabling Best of 3 permits pose-only automatic capture.

## Persistence

IndexedDB database `frame-camera`, schema 1, store `photos`, key `id`. Records include JPEG blob, timestamp, source mode, style, pose and optional burst/quality metadata. No face embeddings or identity profile are stored. Old single-frame records remain readable.

Language is stored as `frame-language`; framing preferences use `frame-settings`. Storage is origin/app-specific. Moving to a new web domain does not migrate an existing gallery.

## Native bridge

The ES module imports Capacitor Core, Filesystem and Share. In browsers it takes no native action. In native builds, export writes the selected JPEG to `Directory.Cache/frame-share/` and opens the OS share sheet with that file URI. The gallery original remains in IndexedDB. Cache files may remain until the OS or app data cleanup removes them.

Permissions: Android CAMERA and INTERNET; iOS camera usage description and photo-add description for explicit saving. The app requests no microphone stream. Android automatic backup is disabled. See the privacy document for OS backup boundaries.
