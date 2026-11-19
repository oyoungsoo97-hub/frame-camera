import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {messages} from '../dist/translations.js';
import {translateText,resolveLanguage,setLanguage,getLanguage,getLocale} from '../dist/i18n.js';

test('locale selection respects saved choice and matches regional device languages',()=>{
 assert.equal(resolveLanguage('ko',['de-DE']),'ko');assert.equal(resolveLanguage(null,['fr-FR','de-AT']),'de');assert.equal(resolveLanguage('bad',['ko-KR']),'ko');assert.equal(resolveLanguage(null,['fr']),'en');
});
test('every catalog entry is translated in both non-source languages',()=>{
 assert.ok(Object.keys(messages).length>330);for(const [key,row] of Object.entries(messages))for(const lang of ['de','ko']){assert.equal(typeof row[lang],'string',key);assert.ok(row[lang].trim(),key);assert.equal(translateText(key,lang),row[lang]);}
});
test('metric directions preserve amount, actor and German decimal separator',()=>{
 assert.equal(translateText('Move right ≈10 cm.','de'),'≈10 cm nach rechts bewegen.');
 assert.equal(translateText('Move camera closer ≈1.5 m.','ko'),'카메라를 앞으로 ≈1.5 m 이동하세요.');
 assert.equal(translateText('Move camera back ≈1.5 m.','de'),'Kamera ≈1,5 m zurück bewegen.');
 assert.match(translateText('Move the person left.','ko'),/사람이 왼쪽/);
});
test('composed pose instructions translate complete source phrases',()=>{
 const value='Drop your shoulders. Let your arms relax. Keep your gaze relaxed, toward the camera.';
 assert.equal(translateText(value,'de'),messages['Drop your shoulders. Let your arms relax.'].de+' '+messages['Keep your gaze relaxed, toward the camera.'].de);
});
test('dynamic photo accessibility labels and quality summaries are localized',()=>{
 assert.equal(translateText('Frame 3, best pick','ko'),'3번 사진, 베스트 후보');
 assert.equal(translateText('Eyes appear open · Sharpness estimate 25 · Best of this burst','de'),'Augen scheinen offen · Geschätzte Schärfe 25 · Bester Vorschlag der Serie');
 assert.equal(translateText('Hands together Pose','ko'),'두 손 모으기 포즈');
});
test('horizon direction and degree value survive translation',()=>{
 assert.match(translateText('Possible horizon: rotate the phone counterclockwise about 5°.','de'),/5° gegen den Uhrzeigersinn/);
 assert.match(translateText('Place the person on the right third.','ko'),/오른쪽 3분의 1/);
});
test('unsupported languages do not mutate the selected locale',()=>{
 setLanguage('de');assert.equal(getLocale(),'de-DE');assert.equal(setLanguage('fr'),false);assert.equal(getLanguage(),'de');setLanguage('en');
});
test('unrecognized strings and whitespace retain safe text semantics',()=>{
 assert.equal(translateText('<not-a-catalog-entry>','ko'),'<not-a-catalog-entry>');assert.equal(translateText(' Start camera ','de'),' Kamera starten ');
});
test('native manifests declare camera and translated permission text without microphone access',()=>{
 const android=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');assert.match(android,/android.permission.CAMERA/);assert.doesNotMatch(android,/RECORD_AUDIO/);assert.match(android,/allowBackup="false"/);
 for(const lang of ['de','en','ko'])assert.match(readFileSync(new URL(`../ios/App/App/${lang}.lproj/InfoPlist.strings`,import.meta.url),'utf8'),/NSCameraUsageDescription/);
});
test('sentence fallback translates without iOS-incompatible lookbehind expressions',()=>{
 assert.equal(translateText('Unknown opening. Start camera','de'),'Unknown opening. Kamera starten');
 const source=readFileSync(new URL('../dist/i18n.js',import.meta.url),'utf8');
 assert.ok(!source.includes('(?<=')&&!source.includes('(?<!'),'iOS 15 cannot parse regexp lookbehind');
});
