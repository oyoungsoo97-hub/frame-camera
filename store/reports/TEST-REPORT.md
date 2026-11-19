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
| Android-Laufzeit API 31, API 36 Telefon/Fold-Größe | **Noch nicht freigegeben** | Emulatorabbruch in Lauf 44533261380; auch Folgelauf 44535083772 mit gleichem Grafikfehler; gezielter Guest-ANGLE-Prüflauf folgt |
| Lokale Browser-Prüfung | **Bestanden** | Chrome, 375×667, Demo-Modell, Galerie nach Neuladen, Datenschutz-/Supportnavigation de/en/ko |
| Physische Geräte / Store-Signierung / Portalvalidierung | **NICHT AUSGEFÜHRT** | Keine verfügbaren Geräte, Entwicklerkonten oder Produktionsschlüssel |

Referenz für die sechs iOS-Tests: [Lauf 44533261380](https://github.com/oyoungsoo97-hub/frame-camera/actions/runs/44533261380), Commit `e438dd47c1f9ebc57683b4875de881d7914e935f`. Der Gesamtlauf ist wegen Android rot; die beiden iOS-Jobs sowie ihre Archivprüfung sind separat erfolgreich. [Dauerhaftes QA-Paket](https://github.com/oyoungsoo97-hub/frame-camera/releases/tag/qa-evidence-44533261380) enthält die tatsächlichen Jobresultate, Protokolle, Paketprüfungen und iOS-Demo-Screenshots. Es ist keine Store-Veröffentlichung.

Die native iOS-Suite prüft Start und lokale Assets, Dateisystem-/Share-Bridge, drei Sprachen/Layout, echtes MediaPipe-Modell mit cm/m-Kalibrierung, Aufnahme/Galerie/Neuladen/Löschen und die Warnung bei simuliert vollem Speicher. Ein weiterer Test erzeugt je Sprache zwei Screenshots aus dem echten App-Fenster. Die zwölf iPhone-/iPad-Bilder wurden visuell auf abgeschnittene Bedienelemente und übersetzte Inhalte geprüft. Sie verwenden ausschließlich das generierte Demofoto. Es sind QA-Entwürfe; finale Store-Screenshots werden aus dem freigegebenen Release-Build erzeugt.

## Gefundene und behobene Fehler

- **Safari/iOS 15:** Ein regulärer Ausdruck mit Lookbehind verhinderte das Parsen der Übersetzungsdatei. Durch kompatiblen Ausdruck ersetzt und mit Regressionstest abgesichert.
- **Galerie:** Eine späte initiale Datenbankantwort konnte das erste neu aufgenommene Foto aus dem sichtbaren Zustand verdrängen. Aufnahme wartet jetzt auf den abgeschlossenen initialen Ladevorgang; Timeout-/Fehlerpfade sind begrenzt.
- **Speicher voll:** Nicht dauerhaft gespeicherte Fotos bleiben exportierbar und erhalten im Vorschaudialog eine übersetzte Warnung. Transaktionsabschluss wird abgewartet. Native iOS-Fehlerinjektion bestanden.
- **App-Wechsel:** Native Hintergrundereignisse stoppen Kamera/Sprachausgabe. iOS-Berechtigungsdialoge werden dabei nicht mit echtem Hintergrundbetrieb verwechselt. Android-Zurück behandelt Dialoge und Ansichten.
- **Build-Konfiguration:** Kotlin-Abhängigkeitskonflikte, nicht übersetzbare Paketkennungen, der XCTest-Rückgabetyp und das explizite Archiv-Scheme wurden korrigiert.

## Android-Diagnose

Im Lauf 44533261380 verschwanden die Emulatoren während der Ausführung aus ADB. Die gesicherten Protokolle zeigen wiederholte Fehler `GL2Encoder ... glFramebufferTextureLayer ... 0x502`; dies ist kein bestandener App-Test. Auch `software` allein beseitigte den Fehler nicht. Der nächste gezielte Android-Lauf aktiviert zusätzlich `GuestAngle`, damit GLES-Aufrufe im Gast in Vulkan übersetzt werden und den fehlerhaften GL-Encoder umgehen. Testinhalte und Produktionslogik werden nicht abgeschwächt. Host-/App-Protokolle bleiben erhalten und Diagnosebefehle haben ein Zeitlimit.

## Nicht durch diese Tests bewiesen

- Reale Kameraqualität, Erstberechtigung/Verweigerung, Linsenwechsel, Sperrbildschirm, Telefonunterbrechungen, exaktes OEM-Exportverhalten und langfristige Wärme/Akkulaufzeit.
- Ausführung auf iPhone 7/iOS 15.4, Galaxy S10/Fold5, bestimmten Pixel-Modellen, Android API 24–30 oder allen WebView-Versionen. „Duo“ ist noch keine eindeutig dokumentierte Modellbezeichnung.
- Genauigkeit als echte Entfernungsmessung: cm/m sind kalibrierte Schätzungen, keine Tiefensensormessungen.
- VoiceOver/TalkBack, große Systemschrift und alle Bedienhilfen auf echten Geräten.
- Update eines signierten Store-Builds, TestFlight-/Play-Testkanal, Apple Validate App, Google Pre-launch report, Store-Annahme oder Google-Produktionszugang.

Die vom Besitzer genannten Modellreihen sind **gewünschte Zielgeräte**, keine tatsächlich bereitgestellten Testgeräte. [Geräteplan](../DEVICE-TEST-PLAN.md) und `device-results.csv` bleiben deshalb offen. Einträge dürfen nur mit tatsächlichem Gerät, OS/WebView, Build, Tester, Datum und Ergebnis auf bestanden gesetzt werden.

## Freigabe und Wiederholung

`npm test`, `npm run check`, `node scripts/store-preflight.mjs`. Der Modus `--submission` beendet sich aktuell absichtlich mit Code 2: öffentliche Support-E-Mail, Konten/Verträge, Verkaufsländer, echte Geräteabnahme, sichere Signierung und finale Freigabe fehlen. Diesen Schutz nicht entfernen, um einen grünen Status zu erzeugen.

Die Mindestversionen sind konfigurierte Zielwerte, keine bestätigte Kompatibilitätsgarantie. Vor Veröffentlichung muss die unterste freigegebene Version tatsächlich getestet oder der unterstützte Bereich entsprechend eingeschränkt werden. Die [Konto-/Einreichungsanleitung](../ACCOUNT-AND-SUBMISSION.md) enthält die weiteren Schritte.
