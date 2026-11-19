from pathlib import Path
import json,html
root=Path(__file__).resolve().parent.parent
store=root/'store';(store/'metadata').mkdir(parents=True,exist_ok=True)
common={'developer':'Youngsoo Oh','version':'2.1.0','bundle_id':'io.github.oyoungsoo97hub.framecamera','business_model':'paid_download','base_price_eur':2.99,'ads':False,'in_app_purchases':False,'subscriptions':False,'support_url':'https://oyoungsoo97-hub.github.io/frame-camera/support.html','privacy_url':'https://oyoungsoo97-hub.github.io/frame-camera/privacy.html','support_email':None,'release_status':'preparation_only','store_accounts_created':False,'availability_regions':None}
if (store/'release-config.json').exists():common.update(json.loads((store/'release-config.json').read_text()))
(store/'release-config.json').write_text(json.dumps(common,ensure_ascii=False,indent=2)+'\n')
rows={
'de-DE':{'name':'FRAME – Kamera-Coach','subtitle':'Dein Foto. Dein bester Winkel.','short_description':'Live-Hilfe für Position, Bildausschnitt und Pose – direkt in deiner Kamera.','keywords':'kamera,foto,pose,porträt,komposition,reise,selbstauslöser','promotional_text':'Finde deinen Bildausschnitt, probiere eine Pose und folge der Live-Anleitung. Einmal kaufen, ohne Werbung und ohne In-App-Käufe.','description':'''Eine kleine Bewegung kann ein Foto verändern. FRAME hilft dir beim Ausrichten einer Person – mit einer Zielkontur, sichtbaren Richtungshinweisen und passenden Posen.

DEIN LIVE-COACH
Sieh direkt im Kamerabild, wer sich nach links, rechts, näher oder weiter weg bewegen soll. Wähle Reise, Café, Ganzkörper oder eine Sitzpose.

BEWEGUNG IN CM UND M
Gib Körpergröße und Kameraabstand ein. FRAME schätzt daraus die nötige Bewegung. Die Angaben sind keine Tiefensensor-Messungen; Haltung, Zoom und Kalibrierung beeinflussen die Genauigkeit.

MEHR AUSWAHL BEIM FOTOGRAFIEREN
Beste aus 3 speichert drei Bilder und markiert einen Vorschlag anhand von geschätztem Augenstatus, Schärfe und Bewegung. Vergleiche selbst und behalte deinen Favoriten. Timer, Raster und automatische Aufnahme unterstützen dich.

DEINE FOTOS AUF DEINEM GERÄT
Die Bildanalyse läuft lokal. FRAME lädt deine Kamerabilder nicht zu einem KI-Dienst hoch. Fotos bleiben in der lokalen Galerie, bis du sie löschst oder exportierst. Wichtige Fotos solltest du zusätzlich speichern.

DEUTSCH, ENGLISH, 한국어
Wechsle Sprache jederzeit in den Optionen. Sprachansagen hängen von den auf deinem Gerät verfügbaren Stimmen ab.

Einmaliger Kauf. Keine Werbung, keine In-App-Käufe und kein Abonnement. Für eine Person pro Aufnahme. Erkennung und Vorschläge hängen von Licht, Sichtbarkeit und Gerätegeschwindigkeit ab. Die App bewertet weder Schönheit noch Identität.'''},
'en-US':{'name':'FRAME – Camera Coach','subtitle':'Live framing and pose guidance','short_description':'Find your framing, position and pose with guidance directly in your camera.','keywords':'camera,photo,pose,portrait,composition,travel,selftimer','promotional_text':'Find your framing, choose a pose and follow live guidance. One purchase, with no ads, in-app purchases or subscriptions.','description':'''A small move can change a photo. FRAME helps you position one person with an outline, on-screen directions and pose suggestions.

YOUR LIVE COACH
See who should move left, right, closer or farther away. Choose travel, café, full-body or seated poses.

GUIDANCE IN CM AND M
Enter the person's height and camera distance for estimated movement. This is calibrated image geometry, not a depth-sensor measurement. Posture, zoom and your inputs affect accuracy.

MORE CHOICE WHEN YOU SHOOT
Best of 3 saves three frames and highlights a suggestion using estimated eye state, sharpness and movement. Compare the images yourself and keep your favorite. A timer, grid and automatic capture help you frame the moment.

PHOTOS ON YOUR DEVICE
Image analysis runs locally. FRAME does not send camera frames to an AI service. Photos stay in your local gallery until you delete or export them. Save important photos separately.

DEUTSCH, ENGLISH, 한국어
Change language in Options. Spoken guidance depends on the voices installed on your device.

One-time purchase. No ads, in-app purchases or subscriptions. Designed for one person per shot. Detection and suggestions depend on lighting, visibility and device performance. FRAME does not rate beauty or identify people.'''},
'ko-KR':{'name':'FRAME – 나만의 촬영 코치','subtitle':'구도와 포즈를 실시간으로 안내해요','short_description':'카메라 화면에서 위치·구도·포즈를 바로 안내받으세요.','keywords':'카메라,사진,포즈,인물,구도,여행,타이머','promotional_text':'원하는 구도와 포즈를 고르고 실시간 안내를 따라보세요. 한 번 구매하면 광고·인앱 결제·구독 없이 사용할 수 있어요.','description':'''작은 움직임으로 사진이 달라집니다. FRAME은 한 사람의 위치와 포즈를 목표 윤곽선과 화면 속 방향 안내로 도와줍니다.

나만의 실시간 코치
사람이나 카메라가 왼쪽·오른쪽·앞·뒤로 어떻게 움직여야 하는지 확인하세요. 여행, 카페, 전신, 앉은 자세 중에서 선택할 수 있어요.

CM와 M로 이동 안내
키와 카메라 거리를 입력하면 필요한 이동량을 추정합니다. 깊이 센서의 측정값이 아니며, 자세·줌·입력값에 따라 정확도가 달라져요.

3장 중 마음에 드는 사진을 선택
연속 3장을 저장하고 눈 상태·선명도·움직임 추정값으로 베스트 후보를 표시합니다. 직접 비교해 가장 마음에 드는 사진을 고르세요. 타이머, 격자, 자동 촬영도 지원합니다.

사진은 내 기기에
이미지 분석은 기기에서 실행합니다. 카메라 영상을 외부 AI 서비스에 업로드하지 않습니다. 사진은 삭제하거나 내보낼 때까지 기기 내 갤러리에 보관되며, 중요한 사진은 별도로 저장해 주세요.

한국어·영어·독일어
설정에서 언제든 언어를 바꿀 수 있습니다. 음성 안내는 기기에 설치된 음성에 따라 제공됩니다.

한 번 구매. 광고, 인앱 결제, 구독 없음. 한 번에 한 사람의 촬영을 돕습니다. 조명·가림·기기 성능에 따라 인식과 안내가 달라질 수 있으며 외모를 평가하거나 사람을 식별하지 않습니다.'''}
}
for locale,row in rows.items():
 row.update({'apple_category':'PHOTO_AND_VIDEO','google_category':'PHOTOGRAPHY','copyright':'2026 Youngsoo Oh'})
 assert len(row['name'])<=30 and len(row['subtitle'])<=30 and len(row['short_description'])<=80 and len(row['promotional_text'])<=170 and len(row['description'])<=4000 and len(row['keywords'])<=100
 (store/'metadata'/f'{locale}.json').write_text(json.dumps(row,ensure_ascii=False,indent=2)+'\n')
css='''body{font:16px/1.7 system-ui,sans-serif;color:#111217;background:#fff;margin:0}main{max-width:780px;margin:0 auto;padding:30px 24px 70px}header{border-bottom:1px solid #e5e7eb;padding-bottom:20px}h1{font-size:36px;line-height:1.2}h2{font-size:22px;margin-top:30px}a{color:#244eeb}nav{display:flex;flex-wrap:wrap;gap:18px}nav a{padding:10px 0}article{padding:18px 0 34px;border-bottom:1px solid #e5e7eb}.note{padding:16px;background:#f1f5ff;border-radius:12px}small{color:#526071}li{margin:8px 0}'''
policies={
'de':('Datenschutzerklärung', '''<p>Verantwortlich für FRAME: <strong>Youngsoo Oh</strong>. Kontakt: <a href="https://github.com/oyoungsoo97-hub/frame-camera/issues">FRAME-Support</a>. Bitte veröffentliche dort keine privaten Fotos oder vertraulichen Daten.</p><h2>Kamera und Bildanalyse</h2><p>FRAME verarbeitet Kamerabilder oder ein von dir ausgewähltes Bild auf deinem Gerät, um Körper- und Gesichtsmerkmale für Positions-, Posen- und Augenhinweise zu berechnen. Es erfolgt keine Identifizierung. Bilder werden nicht an einen KI-Dienst oder FRAME-Server gesendet. Das Mikrofon und dein Standort werden nicht verwendet.</p><h2>Lokale Speicherung</h2><p>Aufgenommene JPEGs, Zeitpunkte, gewählte Pose und Qualitätswerte bleiben in der lokalen Galerie. Sprache und Einstellungen werden lokal gespeichert. Körpergröße und Kalibrierung bleiben im Arbeitsspeicher der Sitzung. Du kannst Galerieeinträge einzeln löschen. Bei Löschen der App oder ihrer Daten können lokale Fotos verloren gehen; exportiere wichtige Fotos.</p><h2>Teilen und Sicherungen</h2><p>Erst wenn du Teilen oder Speichern auswählst, wird die ausgewählte Datei an das Betriebssystem und den von dir gewählten Dienst übergeben. Temporäre Exportkopien können bis zur Cache-Bereinigung gespeichert bleiben. Bereits exportierte Kopien werden beim Löschen aus FRAME nicht zurückgerufen. iOS- und Gerätebackups richten sich nach deinen Systemeinstellungen; automatische Android-App-Backups sind deaktiviert.</p><h2>Sprachansagen</h2><p>Optionale Sprachhinweise verwenden die Sprachausgabe deines Betriebssystems oder Browsers. Dabei wird nur der Hinweistext übergeben, kein Foto. Ob die gewählte Stimme eine Internetverbindung verwendet, hängt vom Sprachdienst und deinen Systemeinstellungen ab.</p><h2>Internet und Kauf</h2><p>Die native App enthält Programm und Analysemodelle lokal. Es gibt keine Werbung, Analyse-SDKs oder Benutzerkonten in FRAME. Beim Aufruf der Website erhält GitHub Pages technisch erforderliche Verbindungsdaten. Store-Kauf, Zahlung und eventuelle Erstattungen werden vom jeweiligen App Store bearbeitet. FRAME verarbeitet keine Zahlungsdaten.</p><h2>Kontakt und Änderungen</h2><p>Du kannst Fragen zur Verarbeitung über den Support stellen. Sende nur die zur Bearbeitung benötigten Angaben. Für GitHub und selbst gewählte Freigabedienste gelten zusätzlich deren Datenschutzbestimmungen. Diese Erklärung beschreibt die aktuelle App; bei Funktionsänderungen wird sie angepasst.</p>'''),
'en':('Privacy policy','''<p>FRAME is provided by <strong>Youngsoo Oh</strong>. Contact: <a href="https://github.com/oyoungsoo97-hub/frame-camera/issues">FRAME support</a>. Do not post private photos or confidential information there.</p><h2>Camera and image processing</h2><p>FRAME processes camera frames or a photo you select on your device to calculate body/face landmarks for framing, pose and eye-state guidance. It does not identify people. Images are not sent to an AI service or FRAME server. Microphone audio and location are not used.</p><h2>Local storage</h2><p>Captured JPEGs, timestamps, selected poses and quality estimates stay in the local gallery. Language and settings are stored locally. Height and calibration remain in session memory. You can delete individual gallery entries. Removing the app or its storage may erase local photos; export important images.</p><h2>Sharing and backups</h2><p>Only when you choose Share or Save is the selected file handed to the operating system and your chosen destination. Temporary export copies may remain until cache cleanup. Deleting a FRAME photo does not recall exported copies. iOS/device backups follow your system settings; automatic Android app backup is disabled.</p><h2>Spoken guidance</h2><p>Optional spoken guidance uses your operating system or browser speech service. Only the guidance text is supplied, not a photo. Whether the selected voice uses an internet connection depends on the speech service and your system settings.</p><h2>Network and purchase</h2><p>The native app bundles its code and analysis models. FRAME has no advertising, analytics SDKs or user accounts. Website access supplies normal connection metadata to GitHub Pages. App purchases, payments and refunds are handled by the relevant store. FRAME does not process payment details.</p><h2>Contact and changes</h2><p>Use support for data-processing questions and share only the details needed to address them. GitHub and any share destination you choose also have their own privacy policies. This policy describes the current app and will be revised if its behavior changes.</p>'''),
'ko':('개인정보 처리방침','''<p>FRAME 제공자: <strong>Youngsoo Oh</strong>. 문의: <a href="https://github.com/oyoungsoo97-hub/frame-camera/issues">FRAME 지원</a>. 공개 문의에 개인 사진이나 민감한 정보를 올리지 마세요.</p><h2>카메라와 이미지 처리</h2><p>FRAME은 카메라 영상 또는 선택한 사진을 기기에서 처리하여 위치·포즈·눈 상태 안내에 필요한 신체와 얼굴 특징점을 계산합니다. 사람을 식별하지 않으며 이미지를 외부 AI 서비스나 FRAME 서버로 보내지 않습니다. 마이크와 위치 정보는 사용하지 않습니다.</p><h2>기기 내 저장</h2><p>촬영한 JPEG, 촬영 시각, 선택한 포즈와 품질 추정값은 로컬 갤러리에 저장합니다. 언어와 설정도 기기에 저장합니다. 키와 보정값은 세션 메모리에만 유지합니다. 갤러리 항목을 개별 삭제할 수 있습니다. 앱 또는 저장 데이터를 삭제하면 사진이 사라질 수 있으므로 중요한 사진은 내보내 주세요.</p><h2>공유와 백업</h2><p>공유·저장을 선택할 때만 해당 파일을 운영체제와 선택한 대상으로 전달합니다. 임시 내보내기 사본은 캐시 정리 시까지 남을 수 있습니다. FRAME에서 삭제해도 이미 내보낸 사본은 삭제되지 않습니다. iOS 및 기기 백업은 시스템 설정에 따르며 Android 자동 앱 백업은 비활성화되어 있습니다.</p><h2>음성 안내</h2><p>선택 기능인 음성 안내는 운영체제 또는 브라우저의 음성 서비스를 이용합니다. 사진이 아닌 안내 문장만 전달하며, 선택한 음성이 인터넷을 사용하는지는 음성 서비스와 시스템 설정에 따라 달라집니다.</p><h2>인터넷과 구매</h2><p>네이티브 앱에는 프로그램과 분석 모델이 포함됩니다. FRAME에는 광고, 분석 SDK, 사용자 계정이 없습니다. 웹사이트 방문 시 GitHub Pages에 일반적인 접속 정보가 전달됩니다. 앱 구매·결제·환불은 해당 앱 스토어가 처리하며 FRAME은 결제 정보를 처리하지 않습니다.</p><h2>문의와 변경</h2><p>데이터 처리에 관한 문의는 지원 페이지를 이용하고 필요한 정보만 공유해 주세요. GitHub와 사용자가 선택한 공유 서비스에는 별도의 개인정보 처리방침이 적용됩니다. 이 방침은 현재 앱의 동작을 설명하며 기능 변경 시 수정합니다.</p>''')}
def page(title,articles):
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FRAME · '+title+'</title><style>'+css+'</style></head><body><main><header><a href="./">← FRAME</a><h1>'+title+'</h1><nav><a href="#de">Deutsch</a><a href="#en">English</a><a href="#ko">한국어</a></nav><small>2026-11-19 · Youngsoo Oh</small></header>'+''.join('<article lang="'+lang+'" id="'+lang+'"><h2>'+heading+'</h2>'+body+'</article>' for lang,(heading,body) in articles.items())+'</main></body></html>'
(root/'dist/privacy.html').write_text(page('Privacy · Datenschutz · 개인정보',policies))
support={
'de':('Hilfe & Support','''<p>FRAME unterstützt Deutsch, Englisch und Koreanisch. Die Sprachwahl findest du oben oder unter Optionen.</p><ul><li><strong>Kamera:</strong> Tippe auf Kamera starten. Erlaube den Kamerazugriff in den Systemeinstellungen, falls du ihn vorher abgelehnt hast.</li><li><strong>Android:</strong> Halte Android System WebView und Chrome aktuell. Wenn FRAME eine Aktualisierung verlangt, installiere sie über Google Play.</li><li><strong>iPhone:</strong> Die vorbereitete native Version setzt iOS 15.4 oder neuer voraus. Die Simulator-Datei ist nicht auf dem iPhone installierbar.</li><li><strong>cm/m:</strong> Zeige die ganze aufrechte Person. Gib gemessene Größe und Entfernung ein und kalibriere bei Änderungen erneut.</li><li><strong>Fotos:</strong> Öffne die Galerie und teile oder speichere wichtige Aufnahmen zusätzlich.</li></ul><p><a href="https://github.com/oyoungsoo97-hub/frame-camera/issues">Fehler melden oder Hilfe anfragen</a>. Nenne App-Version, Gerät, Betriebssystem und die Schritte zum Fehler. Bitte keine privaten Fotos veröffentlichen.</p><p><a href="privacy.html#de">Datenschutzerklärung</a></p>'''),
'en':('Help & support','''<p>FRAME supports German, English and Korean. Change the language at the top or in Options.</p><ul><li><strong>Camera:</strong> Tap Start camera. If access was denied, enable camera access in device settings.</li><li><strong>Android:</strong> Keep Android System WebView and Chrome updated through Google Play.</li><li><strong>iPhone:</strong> The prepared native version requires iOS 15.4 or later. Simulator files cannot be installed on a real iPhone.</li><li><strong>cm/m:</strong> Show the complete upright person. Enter measured height/distance and recalibrate after changes.</li><li><strong>Photos:</strong> Open Gallery to share or save important images separately.</li></ul><p><a href="https://github.com/oyoungsoo97-hub/frame-camera/issues">Report a problem or request help</a>. Include app version, device, OS and reproduction steps. Do not post private photos.</p><p><a href="privacy.html#en">Privacy policy</a></p>'''),
'ko':('도움말 및 지원','''<p>FRAME은 한국어·영어·독일어를 지원합니다. 상단이나 설정에서 언어를 바꿀 수 있어요.</p><ul><li><strong>카메라:</strong> 내 카메라로 시작을 누르세요. 이전에 거부했다면 기기 설정에서 카메라 접근을 허용하세요.</li><li><strong>Android:</strong> Google Play에서 Android System WebView와 Chrome을 최신 상태로 유지하세요.</li><li><strong>iPhone:</strong> 준비된 네이티브 버전에는 iOS 15.4 이상이 필요합니다. 시뮬레이터 파일은 실제 아이폰에 설치할 수 없습니다.</li><li><strong>cm/m:</strong> 똑바로 선 사람의 전신이 보이게 하고 측정한 키와 거리를 입력하세요. 조건이 바뀌면 다시 보정하세요.</li><li><strong>사진:</strong> 갤러리에서 중요한 사진을 공유하거나 별도로 저장하세요.</li></ul><p><a href="https://github.com/oyoungsoo97-hub/frame-camera/issues">오류 신고 및 지원 요청</a> 시 앱 버전, 기기, OS, 재현 순서를 알려주세요. 개인 사진은 공개하지 마세요.</p><p><a href="privacy.html#ko">개인정보 처리방침</a></p>''')}
(root/'dist/support.html').write_text(page('Support · Hilfe · 지원',support))
print('Prepared 3 localized store listings and privacy/support pages; support email and account details remain pending.')
