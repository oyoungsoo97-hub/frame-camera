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
  ./gradlew :app:connectedDebugAndroidTest --no-daemon
)
FRAME_TEST_EXIT=$?
timeout 10s adb pull /sdcard/Android/data/io.github.oyoungsoo97hub.framecamera/files/. build/qa/native-screenshots/ || true
exit "$FRAME_TEST_EXIT"
