#!/usr/bin/env bash
# Preserve diagnostics even if the emulator disconnects; never wait forever on adb.
set -u
mkdir -p build/qa/native-screenshots
adb logcat -c
adb logcat > build/qa/android-logcat.txt 2>&1 &
FRAME_LOGGER_PID=$!
trap 'kill "$FRAME_LOGGER_PID" 2>/dev/null || true' EXIT
(
  cd android
  # Keep app-private screenshot files until adb has copied them. Gradle otherwise uninstalls the APK.
  timeout 12m ./gradlew :app:connectedDebugAndroidTest -Pandroid.injected.androidTest.leaveApksInstalledAfterRun=true --no-daemon
)
FRAME_TEST_EXIT=$?
timeout 30s adb pull /sdcard/Android/data/io.github.oyoungsoo97hub.framecamera/files/. build/qa/native-screenshots/ || true
if [ "$FRAME_TEST_EXIT" -eq 0 ]; then
  python3 - <<'CHECK'
from pathlib import Path
images = list(Path("build/qa/native-screenshots").rglob("FRAME-qa-*.png"))
assert len(images) == 6, f"Expected six Android screenshots, copied {len(images)}"
assert all(p.stat().st_size > 1024 for p in images), "Empty screenshot"
print("Preserved all six Android native screenshots.")
CHECK
  exit $?
fi
exit "$FRAME_TEST_EXIT"
