import {readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const config=await read('store/release-config.json'),pkg=await read('package.json');
assert.equal(config.version,pkg.version);assert.equal(config.base_price_eur,2.99);
assert.equal(config.business_model,'paid_download');
for(const key of ['ads','in_app_purchases','subscriptions'])assert.equal(config[key],false);
for(const lang of ['de-DE','en-US','ko-KR']){
 const data=await read(`store/metadata/${lang}.json`);
 for(const [key,max] of Object.entries({name:30,subtitle:30,short_description:80,keywords:100,promotional_text:170,description:4000})){
  assert.equal(typeof data[key],'string',`${lang}.${key}`);
  assert(data[key].length>0&&[...data[key]].length<=max,`${lang}.${key} exceeds limit`);
 }
}
for(const path of ['dist/privacy.html','dist/support.html','ios/App/App/PrivacyInfo.xcprivacy'])assert((await stat(path)).size>0);
const shared=await readFile('tests/native/scenarios.js','utf8');
for(const path of ['ios/App/FRAMEIntegrationTests/scenarios.js','android/app/src/androidTest/assets/scenarios.js'])assert.equal(await readFile(path,'utf8'),shared,'Native test copies differ');
console.log('Store files and metadata verified. This is not a submission approval.');
const outstanding=[];
if(!config.support_email)outstanding.push('Public support email');
if(!config.store_accounts_created)outstanding.push('Developer accounts, identity, paid agreements, banking/tax');
if(!config.availability_regions)outstanding.push('Sales regions and applicable publisher/trader details');
if(config.release_status!=='approved_for_submission')outstanding.push('Physical-device acceptance, signed beta builds, final assets/declarations and owner release decision');
console.log('Pending:',outstanding.join('; '));
if(process.argv.includes('--submission')&&outstanding.length)process.exitCode=2;
