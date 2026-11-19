# Native screenshot evidence

The [preserved QA package](https://github.com/oyoungsoo97-hub/frame-camera/releases/tag/qa-evidence-44545407442) includes 30 native QA screenshots: guide and pose-library views in de/en/ko for each configuration below. They show the generated demo image, not user camera photos.

| Configuration | PNG pixels | Evidence run |
|---|---|---|
| iPhone 17 Pro Max simulator | 1320×2868 | 44545407442 |
| iPad Pro 13-inch (M5) simulator | 2064×2752 | 44547058001 |
| Android 12/API 31 phone emulator | 1080×1920 | 44545407442 |
| Android 16/API 36 phone emulator | 1080×2400 | 44545407442 |
| Android 16/API 36 large-layout emulator | 906×1088 | 44545407442 |

XCTest/instrumentation captures the actual native app windows. iPhone/Android and native build samples come from commit 33bd45f. iPad captures come from the targeted recheck at 2d0bf84 after a test timer correction. The production app files are identical; test files and documentation differ. The large Android layout uses 210 dpi, preserving the same logical viewport as 1812×2176 pixels at 420 dpi. The original full-pixel run stalled; these scaled screenshots do not certify Fold5 resolution, graphics performance, hinge behavior or camera.

The local Store Kit exports opaque RGB PNGs without rescaling or altering rendered pixels. The original captures and test metadata are retained alongside them. These files document the beta build; final acceptance and store upload checks remain pending.

Before store submission, capture the accepted signed release, remove beta branding only after acceptance, verify current Apple/Google size requirements and inspect the exact files uploaded. Native screenshots do not prove physical camera performance.

Earlier Android 12 screenshots exposed a collapsed photo frame despite passing functional tests. The current build guards dynamic viewport CSS behind feature detection; geometry assertions now reject an empty photo/image area, and capture waits for analysis completion. Earlier QA packages are marked superseded.
