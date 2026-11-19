# FRAME 2.0.0 · Beta

Deutsch · English · 한국어

[Web-App öffnen / Open web app / 웹 앱 열기](https://oyoungsoo97-hub.github.io/frame-camera/)

## Downloads

| Datei / File / 파일 | Inhalt / Contents / 내용 |
|---|---|
| `FRAME-HTML.zip` | HTML/PWA mit lokal enthaltenen Modellen. Über HTTPS hosten; nicht als lokale HTML-Datei öffnen. / Self-contained web assets for HTTPS hosting. / HTTPS 호스팅용 웹 파일 |
| `FRAME-Android-debug.apk` | Installierbare Android-Test-App, API 24+. Debug-Signierung; kein Play-Store-Release. / Android test build. / 안드로이드 테스트 앱 |
| `FRAME-iOS-Simulator.app.zip` | Kompilierte App für Xcode Simulator. **Nicht auf einem echten iPhone installierbar.** / Simulator only, not an iPhone IPA. / 실제 아이폰 설치 불가, 시뮬레이터 전용 |
| `FRAME-Web-iOS-Android-source.zip` | Vollständiges Projekt mit Xcode, Gradle, HTML, Tests und Dokumentation. / Complete source and docs. / 전체 소스 및 문서 |
| `SHA256SUMS.txt` | SHA-256-Prüfsummen der Downloads. / Download checksums. / 다운로드 체크섬 |

## Deutsch

Oberfläche, Live-Anweisungen, cm/m-Schätzwerte, Dialoge, Fehler und Sprachanleitung unterstützen Deutsch, Englisch und Koreanisch. Enthalten sind Posenpakete, Bildaufbau-Hilfe, Beste aus 3, automatische Aufnahme und lokale Galerie. Die Royalblau/Weiß/Schwarz-Oberfläche bleibt erhalten.

Die native iPhone-App benötigt dein Apple-Signing-Team in Xcode. Eine signierte IPA, TestFlight- oder Store-Veröffentlichung ist nicht enthalten. Sofort auf dem iPhone nutzbar: Web-App in Safari öffnen → Teilen → Zum Home-Bildschirm.

## English

German, English and Korean UI, live coaching, calibrated cm/m estimates, dialogs, errors and speech. Includes pose packs, composition suggestions, Best of 3, automatic capture and local gallery. Native iPhone installation requires your Apple signing team in Xcode. No signed IPA or store submission is included; use the web app immediately in Safari.

## 한국어

독일어·영어·한국어 UI, 실시간 안내, 보정된 cm/m 추정값, 대화상자, 오류 및 음성 안내를 제공합니다. 포즈 팩, 구도 제안, 베스트 3장, 자동 촬영, 기기 내 갤러리를 포함합니다. 실제 아이폰에 네이티브 앱을 설치하려면 Xcode에서 본인의 Apple 서명이 필요합니다. 서명된 IPA나 스토어 등록은 포함하지 않으며 Safari 웹 앱은 바로 사용할 수 있습니다.

## Verification and limits

The release workflow publishes these files only after Android and iOS simulator compilation, the 60-test automated suite and project checks succeed. Real iPhone/Android camera, performance and sharing have not been hardware-tested in this release. cm/m values are geometric estimates, not depth-sensor measurements. Camera and imported photos stay local unless you export/share them. The repository contains only the generated demo photo.

An Android CI debug key may differ between releases. Export important photos before replacing an existing installation. For production distribution, configure permanent signing and complete real-device tests.

[Documentation](https://github.com/oyoungsoo97-hub/frame-camera#dokumentation) · [Build and signing](https://github.com/oyoungsoo97-hub/frame-camera/blob/main/docs/BUILD-AND-RELEASE.md)
