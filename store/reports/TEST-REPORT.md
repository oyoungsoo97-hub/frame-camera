# FRAME 2.1.0 — Testbericht

Stand: 19. November 2026. **Noch keine Store-Freigabe und keine Zertifizierung aller Zielgeräte.** Entwickler: Youngsoo Oh; geplanter Einmalpreis 2,99 €, ohne Werbung, In-App-Käufe oder Abonnement.

## Nachgewiesene Ergebnisse

| Prüfung | Ergebnis | Nachweis / Grenze |
|---|---|---|
| Logik, Kalibrierung, Übersetzungen, Kameralebenszyklus, Galeriefehler | **69/69 bestanden** | Node-Tests lokal und GitHub CI |
| Projektdateien, Sprachkataloge und Store-Metadaten | **Bestanden** | `npm run check`, `node scripts/store-preflight.mjs` |
| Installierte Produktionsabhängigkeiten | **Bestanden** | `npm audit --omit=dev --audit-level=high`; kein Audit der vendorten Modelle dadurch behauptet |
| iPhone 17 Pro Max Simulator | **6/6 bestanden** | Echter WKWebView, iOS-Simulator; keine echte Kamera |
| iPad Pro 13-inch (M5) Simulator | **6/6 bestanden** | Echter WKWebView, iPad-Simulator; keine echte Kamera |
| iOS-Gerätearchiv | **Build und Inhaltsprüfung bestanden** | Version 2.1.0 / Build 20100, iOS-26.5-SDK, Mindestziel 15.4, absichtlich unsigniert |
| Android Release-AAB, Lint, App-/Test-APK | **Build und Inhaltsprüfung bestanden** | API 24 minimum, API 36 target, nicht debuggable, kein Mikrofon/Standort und keine nativen ELF-`.so`-Bibliotheken im Paket |
| Android 12 / API 31, Telefon 1080×1920, 420 dpi | **8/8 bestanden** | Echter Android-WebView, emulierte Kamera |
| Android 16 / API 36, Telefon 1080×2400, 420 dpi | **8/8 bestanden** | Echter Android-WebView, emulierte Kamera |
| Android 16 / API 36, großes Layout 906×1088, 210 dpi | **8/8 bestanden** | Gleiche logische Fläche wie 1812×2176/420 dpi; reduzierte Pixelzahl, keine Fold5-Leistungsmessung |
| Lokale Browser-Prüfung | **Bestanden** | Chrome, 375×667, Demo-Modell, Galerie nach Neuladen, Datenschutz-/Supportnavigation de/en/ko |
| Physische Geräte / Store-Signierung / Portalvalidierung | **NICHT AUSGEFÜHRT** | Keine verfügbaren Geräte, Entwicklerkonten oder Produktionsschlüssel |

## Herkunft der Nachweise

- **iPhone, Android und native Buildbeispiele:** [Lauf 44545407442](https://github.com/oyoungsoo97-hub/frame-camera/actions/runs/44545407442), Commit `33bd45fa5b75a22fc314e80cb35f0dab238d9ef7`. iPhone und alle drei Android-Konfigurationen bestehen. Der ursprüngliche iPad-Modelltest verfehlte ein Zeitlimit und wird nicht als bestanden gezählt.
- **Gezielter iPad-Nachtest:** [Lauf 44547058001](https://github.com/oyoungsoo97-hub/frame-camera/actions/runs/44547058001), Commit `2d0bf849f58c46ca8b298ee62521f60c3b3686a1`. Nach Korrektur der Test-Zeitgrenze werden dieselben sechs funktionalen Fälle geprüft. Nur der Testhelfer und CI-Steuerung änderten sich; die produktiven App-Dateien sind gleich.
- Der Testhelfer prüft eine Bedingung jetzt einmal erneut, nachdem ein verspäteter Timer zurückkehrt. Im ursprünglichen Fehlerprotokoll stand beim Zeitablauf bereits `Demo pose tracking`. Synchrone Shader-/Modellarbeit hatte die Timer-Ausführung verzögert. Das ist keine Zusage kurzer Modellladezeiten auf physischen Geräten; Leistung bleibt Teil der Geräteabnahme.

Das [dauerhafte QA-Paket](https://github.com/oyoungsoo97-hub/frame-camera/releases/tag/qa-evidence-44545407442) enthält tatsächliche Jobmetadaten beider Läufe, den ursprünglichen iPad-Fehlerlog, Paketprüfungen, 30 aktuelle native Demo-Screenshots und Buildbeispiele. Die Paketierung verlangt die ausdrücklich ausgewählten erfolgreichen Jobs, sechs Android-Screenshots je Konfiguration sowie identische produktive Dateien (Testordner werden getrennt betrachtet). Ein komplett grüner ursprünglicher Gesamtlauf wird nicht behauptet. Die früheren Pakete 44538808448/r2 sind nach dem visuellen Fund als ersetzt markiert.

Die **12 iOS-Tests** prüfen Start und lokale Assets, Dateisystem-/Share-Bridge, drei Sprachen/Layout, echtes MediaPipe-Modell mit cm/m-Kalibrierung, Aufnahme/Galerie/Neuladen/Löschen und Speicherfehler bei manuellen wie automatischen Aufnahmen. Je ein Test erzeugt sechs native Screenshots. Die **24 Android-Tests** prüfen zusätzlich emulierte Kameraframes, kein Audio und Kamerastopp beim App-Wechsel. Die Systemberechtigung ist in Android vorab erteilt; echte Berechtigungsdialoge sind damit nicht abgenommen.

Die Screenshot-Dateien entstehen aus echten nativen App-Fenstern mit dem generierten Demofoto, nicht aus echten Nutzerfotos. Sie sind QA-Entwürfe; finale Store-Screenshots werden aus dem akzeptierten Release-Build erzeugt. Einzelheiten und Größen: [Screenshot-Nachweis](../assets/NATIVE-SCREENSHOTS.md).

## Gefundene und behobene Fehler

- **Android 12 / WebView 91:** Die tatsächlichen Screenshots zeigten trotz grüner Funktionstests eine leere Vollbild-Fotoansicht. Eine CSS-Breite mit `var()` und nicht unterstütztem `dvh` wurde erst bei der Berechnung ungültig und überschattete den `vh`-Fallback. Die moderne Regel liegt jetzt hinter `@supports (height:100dvh)`. Layout- und Screenshot-Tests verlangen zusätzlich eine sichtbare Foto-/Bildfläche; Screenshots warten auf abgeschlossene Analyse.
- **Safari/iOS 15:** Ein regulärer Ausdruck mit Lookbehind verhinderte das Parsen der Übersetzungsdatei. Durch kompatiblen Ausdruck ersetzt und mit Regressionstest abgesichert.
- **Galerie:** Eine späte initiale Datenbankantwort konnte das erste neu aufgenommene Foto aus dem sichtbaren Zustand verdrängen. Aufnahme wartet jetzt auf den abgeschlossenen initialen Ladevorgang; Timeout-/Fehlerpfade sind begrenzt.
- **Speicher voll:** Nicht dauerhaft gespeicherte Fotos bleiben exportierbar und erhalten im Vorschaudialog eine übersetzte Warnung. Transaktionsabschluss wird abgewartet. Bei Speicherfehlern pausiert die App automatische Aufnahmen und öffnet sofort die erste ungespeicherte, exportierbare Vorschau. Der erweiterte Test besteht auf beiden iOS- und allen drei Android-Konfigurationen.
- **App-Wechsel:** Native Hintergrundereignisse stoppen Kamera/Sprachausgabe. iOS-Berechtigungsdialoge werden dabei nicht mit echtem Hintergrundbetrieb verwechselt. Android-Zurück behandelt Dialoge und Ansichten.
- **Build-Konfiguration:** Kotlin-Abhängigkeitskonflikte, nicht übersetzbare Paketkennungen, der XCTest-Rückgabetyp und das explizite Archiv-Scheme wurden korrigiert.

## Android-Diagnose

Frühe Emulatorläufe brachen mit `GL2Encoder ... glFramebufferTextureLayer ... 0x502` ab. `GuestAngle` beseitigte diesen Absturz in den erfolgreichen Läufen. Zwei weitere Fehler lagen im Testablauf: Ein Galerie-Neuladetest griff auf das alte Dokument zu; die JavaScript-Rückrufzeit war für Software-Shader zu kurz. Der Test wartet jetzt auf das neue Dokument und erlaubt 60 statt 15 Sekunden für den Rückruf. Die funktionalen Assertions wurden nicht entfernt.

Der Vollpixel-Lauf mit 1812×2176 bei 420 dpi blieb anschließend hängen. Ein gezielter Wiederholungslauf mit **906×1088 bei 210 dpi** besteht alle acht Tests und erhält dieselbe logische Fläche von ungefähr **690×829 dp**. Diese Anpassung reduziert die Last des Software-Renderers. Sie beweist weder Fold5-GPU-Leistung noch Scharnier-/Faltzustandswechsel oder reale Kameraeigenschaften. Der Testprozess ist nun auf zwölf Minuten begrenzt; Diagnoseprotokolle bleiben erhalten. Der ursprüngliche Hänger wird ausdrücklich als offene Grenze dokumentiert, nicht als bestandener Test gezählt.

Die Screenshot-Übernahme wurde zusätzlich abgesichert: Gradle hatte die Test-App nach erfolgreichem Test deinstalliert und damit ihre Bilder entfernt. Der CI-Aufruf erhält die App bis zur Übernahme und verlangt anschließend sechs nichtleere PNGs. Diese Einstellung betrifft ausschließlich den vergänglichen CI-Emulator ([AndroidX-Referenz](https://android.googlesource.com/platform/frameworks/support/+/eb74b1a4b3527414639994574a201f125aff90f5)).

Derselbe vollständige Lauf erstellt zusätzlich ein Debug-APK und eine iOS-Simulator-App aus den getesteten produktiven App-Dateien. Diese Pakete dienen Tests und sind keine Store-Uploads.

## Visuelle Abnahmegrenze

Die [Sichtprüfung](../assets/VISUAL-REVIEW.md) bestätigt den behobenen Android-12-Bildrahmen. Von 30 aktuellen QA-Aufnahmen sind 27 als Entwürfe ausgewählt; drei mit Zwischenzustand bzw. angeschnittenem Auslöser sind ausgeschlossen. Der erste Vollbildwechsel auf echtem iPad/Fold und finale Screenshots aus dem signierten Release bleiben offen. Grüne DOM-Tests ersetzen diese Pixelprüfung nicht. Das mitgelieferte iOS-Simulatorpaket enthält ein XCTest-Plug-in; das Gerätearchiv wurde separat ohne Test-Bundles geprüft.

## Nicht durch diese Tests bewiesen

- Reale Kameraqualität, Erstberechtigung/Verweigerung, Linsenwechsel, Sperrbildschirm, Telefonunterbrechungen, exaktes OEM-Exportverhalten und langfristige Wärme/Akkulaufzeit.
- Ausführung auf iPhone 7/iOS 15.4, Galaxy S10/Fold5, bestimmten Pixel-Modellen, Android API 24–30 oder allen WebView-Versionen. „Duo“ ist noch keine eindeutig dokumentierte Modellbezeichnung.
- Genauigkeit als echte Entfernungsmessung: cm/m sind kalibrierte Schätzungen, keine Tiefensensormessungen.
- VoiceOver/TalkBack, große Systemschrift und alle Bedienhilfen auf echten Geräten.
- Update eines signierten Store-Builds, TestFlight-/Play-Testkanal, Apple Validate App, Google Pre-launch report, Store-Annahme oder Google-Produktionszugang.

Die vom Besitzer genannten Modellreihen sind **gewünschte Zielgeräte**, keine tatsächlich bereitgestellten Testgeräte. [Geräteplan](../DEVICE-TEST-PLAN.md) und `device-results.csv` bleiben deshalb offen. Einträge dürfen nur mit tatsächlichem Gerät, OS/WebView, Build, Tester, Datum und Ergebnis auf bestanden gesetzt werden.

## Freigabe und Wiederholung

`npm test`, `npm run check`, `node scripts/store-preflight.mjs`. Der Modus `--submission` beendet sich aktuell absichtlich mit Code 2: öffentliche Support-E-Mail, Konten/Verträge, Umsetzung der weltweiten Verfügbarkeit, echte Geräteabnahme, sichere Signierung und finale Freigabe fehlen. Diesen Schutz nicht entfernen, um einen grünen Status zu erzeugen.

Die Mindestversionen sind konfigurierte Zielwerte, keine bestätigte Kompatibilitätsgarantie. Vor Veröffentlichung muss die unterste freigegebene Version tatsächlich getestet oder der unterstützte Bereich entsprechend eingeschränkt werden. Die [Konto-/Einreichungsanleitung](../ACCOUNT-AND-SUBMISSION.md) enthält die weiteren Schritte.
