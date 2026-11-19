# Native screenshot evidence

Twelve iOS QA screenshots are available in the [preserved evidence package](https://github.com/oyoungsoo97-hub/frame-camera/releases/tag/qa-evidence-44533261380): six iPhone 17 Pro Max images (1320×2868) and six iPad Pro 13-inch (M5) images (2064×2752). Each device has guide and pose-library views in de/en/ko. They were captured by XCTest from the actual app window at commit e438dd4, using the generated demo image.

All twelve were visually inspected on 19 November 2026. Labels, controls and translated guidance remain visible. The original PNGs use an alpha channel whose values are all 255 (fully opaque). The local Store Kit exports identical RGB pixels without that redundant alpha channel. This is a lossless encoding conversion, not a fabricated app screen.

These images document the beta build. Before store submission, capture the accepted signed release, remove beta branding only after acceptance, verify current Apple/Google size requirements and inspect the exact files uploaded. Android screenshots are not claimed complete while its emulator runtime gate is unresolved. Native screenshots do not prove physical camera performance.
