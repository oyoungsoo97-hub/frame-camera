# App Review / Play review notes — English draft

FRAME is a paid, locally processing camera coach for one person. No account, login, ads, in-app purchases or subscription. German, English and Korean are selectable in Options; device language supplies the initial choice.

## Review path

1. Launch and choose English if needed. Tap **View demo** to run the bundled pose model on the included AI-generated example image without granting camera permission.
2. Choose a scene and pose. **Set up cm / m** accepts height and measured camera distance. For the demo, 170 cm / 3 m are hypothetical example inputs, not measured ground truth.
3. For real functionality on a physical device, tap **Start camera** and allow camera access. One complete upright person should be visible. Align the outline and follow live directions. The camera screen has Options, shutter, gallery and exit controls.
4. Try rear/front cameras, timer and Best of 3. Automatic capture requires sufficiently fresh alignment/stability signals and, with Best of 3, an eye-state signal. It may deliberately refuse to auto-capture under poor visibility.
5. Take a photo. The local gallery persists after relaunch. Open a photo and use Save/Share to present the operating system's native share sheet. Deleting removes the local gallery entry, not copies already exported.
6. In Options, open Privacy policy / Help & support. Locking or backgrounding the app stops the camera; the user restarts it on return.

## Important limits

Centimeter/meter directions are **estimates from user calibration and image geometry**, not LiDAR/ARKit/depth measurements. Person size, posture, visibility, zoom and camera changes affect accuracy. Seated poses use visual guidance without applying the standing distance scale. Suggested eye state and sharpness can be uncertain; no identity or attractiveness assessment is performed. Images are not sent to an AI service.

iOS Simulator cannot establish physical camera correctness. Please review camera functionality on real hardware. Native app/model files are bundled; the app does not load a remote website to supply its interface.

## Before pasting into a store console

Add the owner's reviewer contact details privately in the console. Confirm actual tested device/OS versions, attach final native screenshots, remove any unresolved beta caveats only after their acceptance tests pass, and ensure that these instructions match the signed uploaded version. No demo credentials are required.
