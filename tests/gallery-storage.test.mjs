import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPhotoDatabase} from '../dist/gallery-storage.js';
function fakeDB(){
 const request={},read={};let closes=0;
 const db={close:()=>closes++,transaction:()=>({objectStore:()=>({getAll:()=>read})})};
 return {api:{open:()=>request},request,read,db,get closes(){return closes;},open(){request.result=db;request.onsuccess();},load(photos){read.result=photos;read.onsuccess();}};
}
test('gallery initialization waits for the disk read and returns newest photos first',async()=>{
 const f=fakeDB();let done=false;const pending=loadPhotoDatabase(f.api).then(v=>{done=true;return v;});
 f.open();await Promise.resolve();assert.equal(done,false);
 f.load([{id:'old',created:1},{id:'recent',created:3}]);
 const result=await pending;assert.equal(result.db,f.db);assert.deepEqual(result.photos.map(p=>p.id),['recent','old']);
});
test('capture queued behind initial gallery load retains the new image',async()=>{
 const f=fakeDB(),ready=loadPhotoDatabase(f.api);let photos=[];
 const startup=ready.then(v=>{photos=v.photos;});
 const capture=(async()=>{await startup;photos.unshift({id:'new',created:5});})();
 f.open();f.load([{id:'existing',created:1}]);await capture;
 assert.deepEqual(photos.map(p=>p.id),['new','existing']);
});
test('late database opening after timeout is closed without replacing in-memory photos',async()=>{
 const f=fakeDB();await assert.rejects(loadPhotoDatabase(f.api,5),/timed out/);
 f.open();assert.equal(f.closes,1);assert.equal(f.read.onsuccess,undefined);
});
test('a stalled initial read closes the database and rejects',async()=>{
 const f=fakeDB(),pending=loadPhotoDatabase(f.api,5);f.open();await assert.rejects(pending,/timed out/);assert.equal(f.closes,1);
});
test('blocked database initialization fails explicitly instead of hanging the shutter',async()=>{
 const f=fakeDB(),pending=loadPhotoDatabase(f.api);f.request.onblocked();await assert.rejects(pending,/blocked/);
});
