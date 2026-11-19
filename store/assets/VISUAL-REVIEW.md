# Sichtprüfung der nativen Screenshot-Entwürfe

Stand: 19. November 2026. Alle 30 aktuellen nativen QA-Bilder wurden anhand von Kontaktbögen geprüft. Die zuvor leere Android-12-Fotoansicht ist in de/en/ko sichtbar und bedienbar dargestellt. 27 Bilder bleiben als Entwürfe für die spätere Store-Auswahl. Keines ist bereits als Screenshot des signierten Produktionsbuilds freigegeben.

## Nicht für die Store-Auswahl verwenden

| Aufnahme | Beobachtung |
|---|---|
| `Android-QA-36-fold/FRAME-qa-de-guide.png` | Zeigt noch die englische Studioansicht statt der angeforderten deutschen Vollbildansicht. |
| `Android-QA-36-phone/FRAME-qa-en-guide.png` | Zeigt noch einen Analyse-Statusbalken. |
| `iPad/de-guide.png` | Der Auslöser ist am unteren Bildrand angeschnitten. |

Die DOM-/Funktionsprüfungen bestehen; die Pixelaufnahmen zeigen bei diesen drei Dateien trotzdem einen unpassenden Moment oder Zustand. Die Ursache ist mit diesen Bildern allein nicht sicher zwischen verspätetem Compositor-Snapshot und einem Übergangslayout zu unterscheiden. Diese Dateien deshalb nicht als bestandene visuelle Abnahme oder als Store-Screenshots verwenden. Den Wechsel in die Vollbildkamera auf einem echten iPad und Fold-Gerät ausdrücklich nachprüfen und die Aufnahmen aus dem akzeptierten signierten Build wiederholen. Die anderen Sprachaufnahmen derselben Ansichten sind unauffällig, ersetzen aber diesen Nachtest nicht.

Im lokalen Store Kit stehen die 27 ausgewählten Entwürfe unter `screenshots/`, die drei ausgeschlossenen unter `rejected-screenshots/`. Die ursprünglichen 30 Dateien bleiben unverändert im QA-Nachweis. Für deutsche/englische/koreanische Android-Telefonentwürfe ist die vollständige API-31-Serie enthalten; für iPhone ebenfalls eine vollständige Serie.

Das iOS-Simulatorpaket stammt aus dem gehosteten XCTest-Build und enthält das Test-Plug-in. Es ist nur für Simulator-/QA-Zwecke gedacht. Das separat geprüfte unsignierte Gerätearchiv enthält keine Test-Bundles, benötigt aber weiterhin Produktionssignierung und Store-Validierung.
