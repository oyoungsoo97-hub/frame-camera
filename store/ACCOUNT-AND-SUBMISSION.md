# Konto, Signierung und Veröffentlichung

Stand der Recherche: 19. November 2026. Anforderungen unmittelbar vor Einreichung erneut in den offiziellen Portalen kontrollieren. Der Besitzer führt Vertragsannahmen, Identitätsprüfung und Zahlungen selbst aus.

## Apple

1. [Apple Developer Program](https://developer.apple.com/programs/enroll/) als Einzelperson unter Youngsoo Oh eröffnen (Entscheidung des Besitzers). Bei Einzelpersonen erscheint der rechtliche Name als Verkäufer. [Apple nennt 99 USD jährlich](https://developer.apple.com/help/account/membership/program-enrollment/), gegebenenfalls in lokaler Währung und mit regionalen Abgaben.
2. In App Store Connect den Vertrag für kostenpflichtige Apps sowie Bank-/Steuerdaten abschließen. [Preis einrichten](https://developer.apple.com/help/app-store-connect/manage-app-pricing/set-a-price/): EUR-Basispreis 2,99 €, weltweite Verfügbarkeit dort aktivieren, wo Verkauf zulässig ist, und andere Währungen kontrollieren. Keine In-App-Produkte anlegen.
3. Bundle-ID `io.github.oyoungsoo97hub.framecamera` im eigenen Team registrieren. Vor der ersten Veröffentlichung Verfügbarkeit prüfen. Falls Änderung nötig, Capacitor-Konfiguration, Xcode, Android und Test-/Workflow-Verweise gemeinsam ändern.
4. `npm ci && npm run build && npx cap sync ios`; Xcode-Projekt öffnen. App-Target → Signing & Capabilities → eigenes Team; automatische Signierung aktivieren. Projektversion 2.1.0, Build 20100; für spätere Uploads Buildnummer erhöhen.
5. Mit aktuellem Xcode ein echtes iOS-Archiv erstellen (Product → Archive), im Organizer **Validate App**, dann **Distribute App → App Store Connect**. Der CI-Build ohne Signierung ist kein uploadfähiges IPA. Nicht den Simulator-Build hochladen.
6. TestFlight auf echten iPhones/iPads prüfen. Externe Tests können eine Beta-Prüfung benötigen. App Store Connect: deutsche, englische und koreanische Metadaten, Support-/Datenschutz-URL, Supportkontakt, Screenshots, Kategorie, Inhaltsrechte, Altersfreigabe und Verschlüsselungsfragen ausfüllen. Keine vollständig unterstützten Accessibility-Funktionen deklarieren, bevor sie getestet sind.
7. [EU-Händlerstatus](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/) selbst beurteilen; erforderliche Kontaktdaten verifizieren. Keine privaten Anschriften im Quellcode ablegen.
8. Nach erfolgreichem Gerätetest und finaler Prüfung manuell zur Review einreichen. Apple entscheidet über Zulassung. BETA-Markierungen vor dem finalen Produktionspaket entfernen, nachdem die Beta-Abnahme abgeschlossen ist.

Seit 28. April 2026 verlangt Apple für iOS-Uploads Xcode 26 oder neuer mit iOS-26-SDK oder neuer: [offizielle Anforderung](https://developer.apple.com/news/upcoming-requirements/?id=04282026a). Das Deployment-Ziel des Projekts ist separat iOS 15.4; ein neues SDK beweist keine Ausführung auf alten iPhones.

## Google Play

1. [Play Console registrieren](https://support.google.com/googleplay/android-developer/answer/6112435): Google nennt einmalig 25 USD. Persönliches Konto gemäß Entscheidung des Besitzers wählen, Identität und erforderlichen Gerätebesitz verifizieren. Zahlungsprofil und Verkäuferdaten für kostenpflichtige Apps ergänzen.
2. App von Anfang an als **kostenpflichtig**, Standardpreis 2,99 €, ohne Werbung anlegen. Nicht vorübergehend als kostenlose Produktions-App veröffentlichen, um Tests zu vereinfachen; die Monetarisierungsumstellung ist eingeschränkt. App-Name und Paketregistrierung prüfen.
3. Dauerhaften **Uploadschlüssel** in Android Studio erstellen und verschlüsselt außerhalb des Repositories sichern. Play App Signing verwenden. Der Uploadschlüssel ist von Googles Auslieferungssignatur zu unterscheiden.
4. Umgebungsvariablen `FRAME_KEYSTORE`, `FRAME_KEYSTORE_PASSWORD`, `FRAME_KEY_ALIAS`, `FRAME_KEY_PASSWORD` sicher setzen (z.B. CI-Secret oder lokale geschützte Umgebung; keine Literale in Shell-Verlauf/Logs). Dann:

   ```sh
   npm ci
   npm run build
   npx cap sync android
   cd android
   ./gradlew bundleRelease -PframeRequireSigning=true
   ```

   Ausgabe: `app/build/outputs/bundle/release/app-release.aab`. Ohne vollständige Signierungsvariablen bleiben normale CI-Bundles **unsigniert**; der explizite Signierungsmodus bricht ab. Vor Upload Signatur mit `jarsigner -verify` und Play Console prüfen. Das Debug-APK ist kein Store-Paket.
5. Internen Test zuerst nutzen. Play Pre-launch report, Gerätekompatibilität, Manifestberechtigungen und etwaige Hinweise zur 16-KB-Unterstützung prüfen. Das Projekt zielt auf API 36; [aktuelle API-Regel](https://support.google.com/googleplay/android-developer/answer/11926878) vor Upload erneut kontrollieren.
6. Für neue persönliche Konten ist ein geschlossener Test mit **mindestens 12 durchgehend für 14 Tage angemeldeten Testern** nötig, anschließend Antrag auf Produktionszugang. Aktive Nutzung und Feedback dokumentieren; ein CI-Emulator zählt nicht als Tester. [Google-Anforderung](https://support.google.com/googleplay/android-developer/answer/14151465).
7. Bei einer bezahlten App zahlen Teilnehmer geschlossener/offener Tests nach den [Google-Testregeln](https://support.google.com/googleplay/android-developer/answer/9845334) normalerweise den Kaufpreis; interne Tests können kostenlos installiert werden. Vor Einladungen transparent kommunizieren. Interne Tests ersetzen den vorgeschriebenen geschlossenen Test nicht.
8. App access: keine Anmeldung nötig. Ads: nein. Data safety gemäß geprüftem Verhalten. Zielgruppe, IARC-Altersfreigabe, Inhaltsrechte, Datenschutz, Support-E-Mail, Screenshots und Feature Graphic vervollständigen. Keine Kinder-Zielgruppe oder Altersfreigabe ohne bewusste Bewertung behaupten.
9. Signierten finalen Build erneut testen und nach Produktionszugang zur Prüfung einreichen. Prüfung/Zulassung ist nicht garantiert.

## Dateien und Schlüssel

Das Repository enthält keine Produktionszertifikate oder Schlüssel. `.gitignore` schließt übliche Keystore-/Provisioning-/Zertifikatsdateien aus. Ein Keystore-Verlust darf nicht erst bei einem Update auffallen: Wiederherstellung/Backups vor der ersten Veröffentlichung klären. Keine Signierungsgeheimnisse in GitHub Issues, Artefakt-Logs oder Screenshots aufnehmen.
