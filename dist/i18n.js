import {messages} from './translations.js?v=7';
export const supportedLanguages=['de','en','ko'];
export function resolveLanguage(saved,languages=['en']) {
  if(supportedLanguages.includes(saved))return saved;
  for(const value of languages){const code=String(value).toLowerCase().split(/[-_]/)[0];if(supportedLanguages.includes(code))return code;}
  return 'en';
}
let language='en';
try{language=resolveLanguage(globalThis.localStorage?.getItem('frame-language'),globalThis.navigator?.languages??['en']);}catch{}
export const getLanguage=()=>language;
export const getLocale=()=>({de:'de-DE',en:'en-US',ko:'ko-KR'}[language]);
const sourceKeys=Object.keys(messages).sort((a,b)=>b.length-a.length);
const direction={de:{left:'nach links',right:'nach rechts',back:'zurück',closer:'näher heran',up:'nach oben',down:'nach unten'},ko:{left:'왼쪽으로',right:'오른쪽으로',back:'뒤로',closer:'앞으로',up:'위로',down:'아래로'}};
const pick=(lang,de,ko)=>lang==='de'?de:ko;
const amount=(v,lang)=>lang==='de'?v.replace(/(\d)\.(\d)/g,'$1,$2'):v;
export function translateText(input,lang=language){
  const raw=String(input??'');if(lang==='en'||!supportedLanguages.includes(lang)||!raw.trim())return raw;
  const leading=raw.match(/^\s*/)[0],trailing=raw.match(/\s*$/)[0],key=raw.trim().replace(/\s+/g,' ');
  const exact=messages[key]?.[lang];if(exact)return leading+exact+trailing;
  let m,value;
  const d=v=>direction[lang][v]??v;
  if((m=key.match(/^Move (left|right) (≈[\d.,]+ (?:cm|m))\.$/)))value=pick(lang,`${amount(m[2],lang)} ${d(m[1])} bewegen.`,`${d(m[1])} ${m[2]} 이동하세요.`);
  else if((m=key.match(/^Move camera (back|closer) (≈[\d.,]+ (?:cm|m))\.$/)))value=pick(lang,`Kamera ${amount(m[2],lang)} ${d(m[1])} bewegen.`,`카메라를 ${d(m[1])} ${m[2]} 이동하세요.`);
  else if((m=key.match(/^Move the (person|camera) (left|right|back|closer)\.$/)))value=pick(lang,`${m[1]==='person'?'Person':'Kamera'} ${d(m[2])} bewegen.`,`${m[1]==='person'?'사람이':'카메라를'} ${d(m[2])} 이동하세요.`);
  else if((m=key.match(/^Tilt camera (up|down) slightly\.$/)))value=pick(lang,`Kamera leicht ${d(m[1])} neigen.`,`카메라를 ${d(m[1])} 살짝 기울이세요.`);
  else if((m=key.match(/^Tilt until the person moves (up|down) to the guide\. Keep your distance; this is a rotation, not a step\.$/)))value=pick(lang,`Neige die Kamera, bis die Person ${d(m[1])} zur Kontur rückt. Abstand halten; nur drehen.`,`사람이 가이드에 맞게 ${d(m[1])} 보이도록 카메라를 기울이세요. 이동하지 말고 거리를 유지하세요.`);
  else if((m=key.match(/^The body is cropped\. Show the (head and feet|head and hips) before an amount can be estimated\.$/)))value=pick(lang,`Der Körper ist angeschnitten. Zeige ${m[1]==='head and feet'?'Kopf und Füße':'Kopf und Hüfte'} für eine Schätzung.`,`몸이 잘렸어요. ${m[1]==='head and feet'?'머리와 발':'머리와 골반'}이 보여야 이동량을 추정할 수 있어요.`);
  else if((m=key.match(/^Place the person on the (left|right) third\.$/)))value=pick(lang,`Platziere die Person im ${m[1]==='left'?'linken':'rechten'} Bilddrittel.`,`사람을 화면 ${m[1]==='left'?'왼쪽':'오른쪽'} 3분의 1 지점에 배치하세요.`);
  else if((m=key.match(/^Possible horizon: rotate the phone (clockwise|counterclockwise) about (\d+)°\.$/)))value=pick(lang,`Möglicher Horizont: Handy etwa ${m[2]}° ${m[1]==='clockwise'?'im':'gegen den'} Uhrzeigersinn drehen.`,`수평선 후보: 휴대폰을 ${m[1]==='clockwise'?'시계':'반시계'} 방향으로 약 ${m[2]}° 돌려보세요.`);
  else if((m=key.match(/^Capture timer: (\d+) seconds$/)))value=pick(lang,`Aufnahmetimer: ${m[1]} Sekunden`,`촬영 타이머: ${m[1]}초`);
  else if((m=key.match(/^(\d+) seconds until capture\.$/)))value=pick(lang,`Aufnahme in ${m[1]} Sekunden.`,`${m[1]}초 후 촬영합니다.`);
  else if((m=key.match(/^Best of 3 · (\d+) \/ (\d+)$/)))value=pick(lang,`Beste aus 3 · ${m[1]} / ${m[2]}`,`3장 중 베스트 · ${m[1]} / ${m[2]}`);
  else if((m=key.match(/^Frame (\d+)(, best pick)?$/)))value=pick(lang,`Bild ${m[1]}${m[2]?', bester Vorschlag':''}`,`${m[1]}번 사진${m[2]?', 베스트 후보':''}`);
  else if((m=key.match(/^(Captured photo|Demo photo|Burst frame) (\d+)$/)))value=pick(lang,`${m[1]==='Demo photo'?'Demofoto':m[1]==='Burst frame'?'Serienbild':'Aufgenommenes Foto'} ${m[2]}`,`${m[1]==='Demo photo'?'데모 사진':m[1]==='Burst frame'?'연속 촬영':'촬영한 사진'} ${m[2]}`);
  else if((m=key.match(/^Sharpness estimate (\d+)$/)))value=pick(lang,`Geschätzte Schärfe ${m[1]}`,`선명도 추정값 ${m[1]}`);
  else if(key==='Best of this burst')value=pick(lang,'Bester Vorschlag der Serie','이 연속 촬영의 베스트');
  else if(key==='★ Best')value=pick(lang,'★ Vorschlag','★ 베스트');
  else if((m=key.match(/^POSE \/ (\d+)$/)))value=pick(lang,`POSE / ${m[1]}`,`포즈 / ${m[1]}`);
  else if((m=key.match(/^(.+) Pose$/))&&messages[m[1]])value=pick(lang,`${messages[m[1]].de} – Pose`,`${messages[m[1]].ko} 포즈`);
  else if((m=key.match(/^(Back|Closer) (≈[\d.,]+ (?:cm|m))$/)))value=translateText(m[1],lang)+' '+amount(m[2],lang);
  else if((m=key.match(/^(→|←) Set scale$/)))value=m[1]+' '+translateText('Set scale',lang);
  else if((m=key.match(/^Could not start the camera\. Please try again\. \(([^)]+)\)$/)))value=pick(lang,`Kamerastart fehlgeschlagen. Versuche es erneut. (${m[1]})`,`카메라를 시작하지 못했어요. 다시 시도하세요. (${m[1]})`);
  else if(key.includes(' · '))value=key.split(' · ').map(x=>translateText(x,lang)).join(' · ');
  else if(sourceKeys.some(k=>key.startsWith(k+' '))){const prefix=sourceKeys.find(k=>key.startsWith(k+' '));value=translateText(prefix,lang)+' '+translateText(key.slice(prefix.length+1),lang);}
  else if(/(?<=[.!?])\s+(?=[A-Z])/.test(key))value=key.split(/(?<=[.!?])\s+(?=[A-Z])/).map(x=>translateText(x,lang)).join(' ');
  return value?leading+value+trailing:raw;
}
export function setLanguage(next){
  if(!supportedLanguages.includes(next))return false;
  language=next;try{globalThis.localStorage?.setItem('frame-language',next);}catch{}
  if(typeof document!=='undefined'){
    document.documentElement.lang=next;
    document.querySelectorAll('.language-picker').forEach(select=>select.value=next);
    refresh();window.dispatchEvent(new CustomEvent('frame-languagechange',{detail:{language:next}}));
  }
  return true;
}
// Presentation adapter: the analysis engine keeps stable English source messages.
// Text is written using nodeValue/attributes only, never translated HTML. A WeakMap
// retains the source for instant switching without replacing controls/listeners.
const sources=new WeakMap();let observer=null;
const attributes=['aria-label','alt','title','placeholder'];
function translateNode(node){
  if(node.nodeType===3){
    if(!node.parentElement||node.parentElement.closest('script,style,svg,[data-no-translate]'))return;
    const previous=sources.get(node),source=previous&&node.nodeValue===previous.rendered?previous.source:node.nodeValue;
    const rendered=translateText(source);sources.set(node,{source,rendered});if(node.nodeValue!==rendered)node.nodeValue=rendered;
  }else if(node.nodeType===1){
    if(node.matches('script,style,svg,[data-no-translate]'))return;
    const record=sources.get(node)??{};
    for(const name of attributes){if(!node.hasAttribute(name))continue;const value=node.getAttribute(name),old=record[name],source=old&&value===old.rendered?old.source:value,rendered=translateText(source);record[name]={source,rendered};if(value!==rendered)node.setAttribute(name,rendered);}
    sources.set(node,record);for(const child of [...node.childNodes])translateNode(child);
  }
}
function observe(){observer?.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});}
function refresh(){observer?.disconnect();translateNode(document.documentElement);observe();}
export function initLocalization(){
  if(typeof document==='undefined')return;
  document.querySelectorAll('.language-picker').forEach(select=>select.addEventListener('change',()=>setLanguage(select.value)));
  observer=new MutationObserver(records=>{observer.disconnect();const roots=new Set();for(const r of records){if(r.type==='childList')r.addedNodes.forEach(n=>roots.add(n));else roots.add(r.target);}for(const n of roots)translateNode(n);observe();});
  setLanguage(language);observe();
}
