import test from 'node:test';
import assert from 'node:assert/strict';
import {requestCamera,playCamera} from '../dist/camera-session.js';

function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
test('camera permission is requested immediately without waiting for AI or another promise',async()=>{
  let requested=false;const stream={getTracks:()=>[]};
  const result=requestCamera({getUserMedia:options=>{requested=true;assert.equal(options.audio,false);assert.equal(options.video.facingMode.ideal,'environment');return Promise.resolve(stream);}},'environment');
  assert.equal(requested,true);assert.equal(await result,stream);
});
test('unanswered permission is bounded instead of leaving the start button locked',async()=>{
  await assert.rejects(requestCamera({getUserMedia:()=>new Promise(()=>{})},'environment',{timeoutMs:15}),{name:'CameraPermissionTimeout'});
});
test('a stream arriving after timeout is stopped',async()=>{
  const pending=deferred();let stops=0;
  await assert.rejects(requestCamera({getUserMedia:()=>pending.promise},'environment',{timeoutMs:15}),{name:'CameraPermissionTimeout'});
  pending.resolve({getTracks:()=>[{stop:()=>stops++}]});await Promise.resolve();await Promise.resolve();assert.equal(stops,1);
});
test('cancelled permission request stops any late camera access',async()=>{
  const pending=deferred(),controller=new AbortController();let stops=0;
  const result=requestCamera({getUserMedia:()=>pending.promise},'user',{signal:controller.signal});controller.abort();
  await assert.rejects(result,{name:'AbortError'});pending.resolve({getTracks:()=>[{stop:()=>stops++}]});await Promise.resolve();await Promise.resolve();assert.equal(stops,1);
});
test('video is visible, muted and inline before play is called',async()=>{
  const stream={};const attrs={};const video={hidden:true,muted:false,setAttribute:(k,v)=>attrs[k]=v,play(){assert.equal(this.hidden,false);assert.equal(this.muted,true);assert.equal(this.playsInline,true);assert.equal(this.srcObject,stream);assert.ok('webkit-playsinline'in attrs);return Promise.resolve();}};
  await playCamera(video,stream);
});
test('video startup timeout does not hang indefinitely',async()=>{
  const video={setAttribute(){},play:()=>new Promise(()=>{})};await assert.rejects(playCamera(video,{},{timeoutMs:15}),{name:'CameraPlaybackTimeout'});
});
test('permission denial remains distinguishable from a video playback failure',async()=>{
  await assert.rejects(requestCamera({getUserMedia:()=>Promise.reject(new DOMException('Denied','NotAllowedError'))},'environment'),{name:'NotAllowedError'});
});
