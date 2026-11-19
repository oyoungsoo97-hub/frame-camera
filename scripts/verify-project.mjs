import {readFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const dist=path.join(root,'dist');
const html=await readFile(path.join(dist,'index.html'),'utf8');
const refs=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(x=>x[1]).filter(x=>!x.startsWith('#')&&!/^(https?:|data:)/.test(x));
for(const ref of refs)await stat(path.join(dist,ref.split('?')[0]));
for(const file of ['app.js','i18n.js','translations.js','native-bridge.js','vendor/face_landmarker.task','vendor/pose_landmarker_lite.task','vendor/wasm/vision_wasm_internal.wasm']){const s=await stat(path.join(dist,file));if(s.size===0)throw Error('Empty required asset: '+file);}
const config=JSON.parse(await readFile(path.join(root,'capacitor.config.json'),'utf8'));if(config.webDir!=='dist'||config.server?.url)throw Error('Native assets must be bundled locally');
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));for(const name of ['@capacitor/core','@capacitor/android','@capacitor/ios'])if(!/^\d+\.\d+\.\d+$/.test(pkg.dependencies[name]))throw Error('Pin native runtime versions');
console.log('Project verification passed: local assets, native config and pinned runtimes.');
