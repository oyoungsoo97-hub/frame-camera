# Third-party notices and provenance

## MediaPipe

`@mediapipe/tasks-vision` 0.10.21 is bundled under `dist/vendor/`. The Apache-2.0 license is included as `LICENSE-mediapipe.txt`; upstream documentation is retained in `MEDIAPIPE-README.md`.

Official model assets:

- [Pose Landmarker Lite, float16 v1](https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task)
- [Face Landmarker, float16 v1](https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task)

[Pose documentation](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) · [Face documentation](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)

## Capacitor and build tooling

Capacitor Core/CLI/iOS/Android 8.6.2, App 8.1.2, Filesystem 8.1.5 and Share 8.0.3 are official Ionic/OutSystems packages. Their MIT license notices are retained in `licenses/` and copied into the distributed `dist/licenses/`. The package lock records exact registry dependency resolutions and integrity values. esbuild 0.27.0 is build tooling under MIT; its notice is also retained.

Generated platform projects include the official Gradle wrapper and platform scaffolding. Their original package licenses remain applicable. GitHub Actions reference official actions for checkout, setup, artifact storage and Pages publishing.

## Images and original application

The example portrait was generated for FRAME with an image-generation tool, not taken from the user's camera. The original prompt is retained in `IMAGE-PROMPT.txt`. FRAME's original icon is used for web and native launcher assets. Native icon sizing is generated from the existing icon.

No additional open-source license is assigned to the original project code by this release. Public source visibility is separate from a redistribution license. Do not remove bundled third-party notices when repackaging.
