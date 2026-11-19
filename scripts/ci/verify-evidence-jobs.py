"""Fail packaging unless the explicitly selected native jobs passed."""
import json
from pathlib import Path

def jobs(prefix):
    return json.loads(Path(f"{prefix}-jobs.json").read_text())["jobs"]

ios = {job["name"]: job for job in jobs("qa")}
for name in ["logic-and-assets", "ios (iPhone)", "ios (iPad)"]:
    assert ios[name]["conclusion"] == "success", f"Required iOS/source job failed: {name}"
android = {job["name"]: job for job in jobs("android-qa")}
for name in ["logic-and-assets", "android (31, phone, 1080x1920, 420)",
             "android (36, phone, 1080x2400, 420)", "android (36, fold, 906x1088, 210)"]:
    assert android[name]["conclusion"] == "success", f"Required Android job failed: {name}"
print("Selected jobs passed: 2 iOS simulator configurations and 3 Android emulator configurations.")
