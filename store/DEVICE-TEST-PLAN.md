# Reale Geräte: Abnahmetest

Alle unten genannten Geräte sind **geplante Ziele, bisher nicht physisch getestet**. Ein simulierter breiter Bildschirm belegt keine Samsung-Fold-Kompatibilität. „iPhone … Duo“ ist die gewünschte Bandbreite; die konkrete Modellbezeichnung und OS-Version für den Test müssen noch festgelegt werden.

## Priorisierte Matrix

| Gerät/Familie | Zweck | Zu protokollierende Version | Status |
|---|---|---|---|
| iPhone 7 | Ältestes gewünschtes Gerät, Speicher/Leistung | Installierte iOS-15-Version, mindestens 15.4 | NICHT GETESTET |
| iPhone SE, kleiner Bildschirm | Platz, große Schrift, Auslöser | Exakte Generation + iOS | NICHT GETESTET |
| Neueres iPhone mit Ausschnitt/Dynamic Island | Safe Areas, moderne Kamera | Modell + aktuelles iOS | NICHT GETESTET |
| Gewünschtes neuestes iPhone/Duo | Neueste Formfaktoren | Konkretes Gerät + iOS bestätigen | NICHT GETESTET |
| iPad | Universal-App, Share-Popover, Querformat | Modell + iPadOS | NICHT GETESTET |
| Galaxy S10 | Samsung-Kamera, ältere Android/WebView-Kombination | Android, One UI, WebView | NICHT GETESTET |
| Galaxy Z Fold5 | Außen-/Innenbildschirm, Falten während Aufnahme | Android, One UI, WebView | NICHT GETESTET |
| Pixel, Mittelklasse | Speicher-/CPU-/Kameraleistung | Modell, Android, WebView | NICHT GETESTET |
| Aktuelles Pixel | Neueste Android-Berechtigungen/Navigation | Modell, Android, WebView | NICHT GETESTET |
| Android API 24–30 bei Beibehaltung minSdk 24 | Tatsächliche Mindestunterstützung | Gerät + aktualisiertes WebView ≥90 | NICHT GETESTET |

Mindestversionen sind technische Einstellungen, keine Kompatibilitätszertifizierung. Ist ein Randgerät nicht verlässlich nutzbar, muss die Mindestversion/Geräteverfügbarkeit vor dem Verkauf angepasst werden.

## Ablauf pro Gerät

Pro Fall Buildnummer/Commit, Datum, Tester, Gerät, OS/WebView, Ergebnis und Fehlernummer in `device-results.csv` eintragen. Nur zustimmende Testpersonen fotografieren; keine privaten Fotos in öffentliche Issues hochladen.

1. **Installation/Start:** signierter Release-Testbuild sauber installieren; Erststart offline; Demo laden; App beenden und neu starten. Keine weiße/leere Oberfläche.
2. **Berechtigung erlauben:** Kamera erstmals starten, Systemdialog erscheint, nur Kamera wird angefordert; Livebild funktioniert. Mikrofonindikator bleibt aus.
3. **Berechtigung ablehnen:** frische Berechtigungen, ablehnen; klare Meldung, keine Endlosschleife. In Systemeinstellungen erlauben und erneut starten. Während offener Anfrage abbrechen/Hintergrund; verspäteter Stream wird geschlossen.
4. **Kamera:** vorne/hinten, 10 Wechsel, Auslöser/Timer/Best of 3; jedes Foto korrekt beschnitten, Frontbild nicht doppelt gespiegelt. Stopp beendet Kameraindikator. Keine nicht existierenden Zoom-/Objektiv-Funktionen versprechen.
5. **Unterbrechungen:** Home, App-Wechsel, Sperre, Systemdialog, Anrufunterbrechung; Kamera im Hintergrund beendet. Rückkehr zeigt bedienbaren Neustart. Android Zurück: Dialog → Kameraansicht → Studio, kein unerwarteter Verlust gespeicherter Bilder.
6. **Tracking:** einzelne Person bei Tageslicht, Gegenlicht, wenig Licht; Kopf/Füße abgeschnitten, Verdecken, Person verlässt Bild. Keine alte Freigabe für Autoaufnahme. Neue Person verlangt neue Kalibrierung.
7. **cm/m:** gemessene Referenzhöhe und 2/3/4 m Kameradistanz; Richtung korrekt, Werte als ≈Schätzung angezeigt; Werte bei Kamerabewegung/Zoom/Haltungswechsel nicht als präzise Messung ausgeben. Abweichungen protokollieren; keine unbelegte Genauigkeitsgrenze veröffentlichen.
8. **Aufnahmen:** Serienbilder mit offenen Augen/Blinzeln/Bewegung vergleichen; unsichere Augenmessung blockiert automatische Auslösung. Manuelle Aufnahme bleibt möglich. Galerie nach Prozessende/Neustart, Einzellöschung, Export nach Fotos/Dateien, Teilen abbrechen, Dateidekodierung prüfen.
9. **Layout:** Hoch-/Querformat, maximale Systemschrift, Safe Areas, Tastatur bei Kalibrierung, Split View/iPad, Fold5 während laufender Vorschau falten/entfalten. Auslöser und Schließen bleiben erreichbar, kein verdeckter Dialog.
10. **Sprachen/Accessibility:** Deutsch/Englisch/Koreanisch nach Neustart; Zahlen mit Komma/Punkt; VoiceOver/TalkBack Fokus, Buttonnamen und Sprachansagen; englische Resttexte als Fehler erfassen. Keine Accessibility-Zusagen ohne Prüfung.
11. **15 Minuten Nutzung:** 50 Aufnahmen, Serienbilder, Galerie, Hintergrundwechsel; Absturz, Arbeitsspeicher, Wärme, Akku und Reaktionszeiten protokollieren. Bei unbrauchbarer Wärme/Leistung abbrechen und analysieren.
12. **Speicher/Netz:** Flugmodus, wenig Speicher, verweigerte Speicherung, große/ungültige Importdatei; kein stiller Fotoverlust. Wichtige Bilder exportieren; Deinstallation löscht lokale App-Daten.
13. **Upgrade:** signierter Testbuild → nächster signierter Build mit gleichem App-Identifier/Schlüssel; Galerie/Sprachen bleiben. Debug- und Store-Signaturen nicht als Updatepfad verwechseln.

## Stop-Kriterien

Nicht veröffentlichen bei Absturz/Startblockade, nicht endender Kamera, verlorenem Foto ohne Meldung, unbedienbarem Auslöser, falschem Export, kritischen Datenschutzabweichungen oder falschen Store-Angaben. Nach Fix den betroffenen Fall und die angrenzenden Kernabläufe erneut ausführen. Für neue persönliche Google-Konten zusätzlich den geschlossenen Play-Test absolvieren; dieses Protokoll allein erfüllt ihn nicht.
