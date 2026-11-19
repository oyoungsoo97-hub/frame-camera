# FRAME 2.1 — Store-Vorbereitung

**Status: Vorbereitung, keine Store-Freigabe.** Die technischen Prüfungen und ihre Grenzen stehen in [reports/TEST-REPORT.md](reports/TEST-REPORT.md). Physische Geräte, Entwicklerkonten, Signierung und die öffentliche Support-E-Mail fehlen noch.

Festgelegt durch Youngsoo Oh: einmaliger Downloadpreis **2,99 €**, keine Werbung, keine In-App-Käufe, kein Abonnement. Die Preisfestlegung erfolgt in den Store-Konsolen, nicht im App-Code. Veröffentlichung als Einzelperson **Youngsoo Oh**, weltweit, soweit der jeweilige Store den Verkauf erlaubt. Andere Währungen werden dort separat geprüft. Es wurde kein Store-Konto angelegt und kein Kauf ausgelöst.

## Inhalt

- `metadata/de-DE.json`, `en-US.json`, `ko-KR.json`: lokalisierte Titel, Kurztexte, Beschreibung, Keywords und Kategorie.
- `release-config.json`: Entscheidungen und ausdrücklich leere Angaben für noch fehlende Informationen.
- [ACCOUNT-AND-SUBMISSION.md](ACCOUNT-AND-SUBMISSION.md): Konten, Signierung, Preis und Einreichung.
- [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md): begründete Entwürfe für App Privacy / Data safety.
- [REVIEW-NOTES.md](REVIEW-NOTES.md): Anleitung für die Store-Prüfung.
- [DEVICE-TEST-PLAN.md](DEVICE-TEST-PLAN.md): Abnahmetests mit echten Geräten.
- `device-results.csv`: Protokollvorlage; keine erfundenen Testresultate.
- `assets/`: Store-Icons und Grafiken; Screenshots müssen den finalen nativen Build zeigen.
- `ios/ExportOptions.plist.example`: Vorlage nach Einrichtung des Apple-Teams.

## Noch von Youngsoo benötigt

1. Apple Developer Program und Google Play Console registrieren und Identitätsprüfung abschließen. Verträge und Zahlungen selbst in den offiziellen Portalen bestätigen.
2. Öffentliche Support-E-Mail ergänzen. Der aktuelle Support-Link führt zur GitHub-Projektseite; eine E-Mail ist noch nicht erfunden oder veröffentlicht worden.
3. Die gewählte weltweite Verfügbarkeit und den Kontotyp Einzelperson in den Portalen umsetzen. Erforderliche Kontakt-/Händlerangaben, Bank- und Steuerdaten dort vervollständigen, nicht im öffentlichen Repository.
4. Echte Testgeräte/Testpersonen organisieren. Die genannten iPhone-, Galaxy- und Pixel-Modelle sind gewünschte Ziele, keine vorhandenen Testgeräte.
5. Nach Kontoerstellung Apple-Team und sichere Signierung einrichten; Android-Uploadschlüssel erstellen und außerhalb des Repositorys sichern. Keine Passwörter, privaten Schlüssel oder Ausweiskopien im Chat.

## Freigabekriterien

- CI des exakten Upload-Commits erfolgreich; keine offenen kritischen Fehler.
- Reale Kamera, Berechtigungsdialoge, Hintergrund/Unterbrechungen, Export und Langzeittest auf repräsentativen Geräten bestanden.
- Unterste unterstützte Version tatsächlich getestet; anderenfalls Mindestversion anheben oder Veröffentlichung zurückhalten.
- Store-Formulare, Kontaktdaten, Altersfreigabe, Exportfragen und territoriale Anforderungen abgeschlossen.
- Signierte Release-Pakete in TestFlight / Play-Testkanal getestet; keine Debug-Signatur verwenden.
- Finale Screenshots in allen drei Sprachen, App-Icon und Play-Grafik kontrolliert.
- Google-Produktionszugang nach gegebenenfalls erforderlichem geschlossenem Test genehmigt.

`node scripts/store-preflight.mjs` prüft Dateien und Metadaten. `node scripts/store-preflight.mjs --submission` muss bis zum Abschluss der offenen Punkte fehlschlagen. Ein grüner technischer Build ersetzt diese Freigabe nicht.
