import {loadPhotoDatabase} from './gallery-storage.js?v=8';
import {initLocalization,translateText,getLocale,getLanguage} from './i18n.js?v=8';
import {isNative,shareNativePhoto,bindNativeLifecycle} from './native-bridge.js?v=8';
import {styles,poses,cropRect,projectLandmarks,analyzePose,smoothLandmarks,clamp,posePacks} from './coach.js?v=8';
import {requestCamera,playCamera} from './camera-session.js?v=8';
import {createCalibration,sameCamera,estimateMetricGuide,metricPresentation,formatDistance} from './metric-guide.js?v=8';
import {qualityStats,eyeState,chooseBest,canAutoShoot,analyzeScene} from './photo-analysis.js?v=8';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={view:'studio',mode:'demo',style:'travel',pose:'relax',mirror:false,facing:'environment',grid:true,guide:true,voice:false,auto:false,timer:0,ratio:3/4,raw:null,result:null,stream:null,model:null,modelPromise:null,modelMode:'IMAGE',lastVideoTime:-1,lastInference:0,lastSpoken:'',lastSpeechAt:0,readySince:0,autoLatched:false,busy:false,epoch:0,photo:null,photos:[],db:null,objectUrls:[],imageUrl:null,previewUrl:null,loop:0,missingSince:0,cameraStarting:false,cameraAbort:null};
state.calibration=null;state.metricLostAt=0;
Object.assign(state,{pack:'travel',targetX:null,scene:null,focus:false,bestShot:true,faceModel:null,facePromise:null,faceStatus:'idle',quality:null,lastQuality:0,lastScene:0,lastFaceAt:0,lastEyes:'unknown',lastFaceSharpness:null,burstPreviewUrls:[]});
const sample=$('#sampleImage'), video=$('#video'), finder=$('#viewfinder');
const icons={find:'◎',distance:'↔',position:'↔',vertical:'↕',pose:'✧',ready:'✓',error:'!'};
const paths={
  relax:'M50 28v38m-16-34-6 23 4 15m34-38 6 23-4 15M34 32l16-5 16 5M50 66l-11 30m11-30 11 30',
  hip:'M50 28v38m-16-34-6 23 4 15m34-38 15 19-27 10M34 32l16-5 16 5M50 66l-11 30m11-30 11 30',
  step:'M50 28v38m-16-34-10 22 5 15m37-37 10 16-7 15M34 32l16-5 16 5M50 66l-8 16-16 14m24-30 12 16 8 14',
  hands:'M50 28v38m-16-34-5 18 21 11m16-29 5 18-21 11M34 32l16-5 16 5M50 66l-11 30m11-30 11 30',
  sit:'M50 28v35m-16-31-5 22 28 10m9-32 5 23-13 9M34 32l16-5 16 5M50 63l24 5-3 28M50 63l-20 8 3 25',
  chin:'M50 28v35m-16-31-5 22 28 10m9-32 10 15-24-22M34 32l16-5 16 5M50 63l24 5-3 28M50 63l-20 8 3 25',
  wave:'M50 28v38m-16-34-6 23 4 15m34-38 12 12 5-23M34 32l16-5 16 5M50 66l-11 30m11-30 11 30'
};
function poseSvg(id){return `<svg viewBox="0 0 100 108" aria-hidden="true"><circle cx="50" cy="15" r="8"/><path d="${paths[id]}"/></svg>`;}
function renderPoses(){
  const pack=posePacks.find(p=>p.id===state.pack);const visible=pack?poses.filter(p=>pack.poses.includes(p.id)):poses;
  const tabs=posePacks.map(p=>`<button data-pack="${p.id}" class="${state.pack===p.id?'active':''}" aria-pressed="${state.pack===p.id}">${p.name}</button>`).join('')+`<button data-pack="all" class="${state.pack==='all'?'active':''}" aria-pressed="${state.pack==='all'}">All</button>`;$('#packTabs').innerHTML=tabs;$('#libraryPacks').innerHTML=tabs;
  $('#poseCards').innerHTML=visible.map(p=>`<button class="pose-card ${state.pose===p.id?'active':''}" data-pose="${p.id}" aria-label="${p.name} Pose" aria-pressed="${state.pose===p.id}">${poseSvg(p.id)}<span>${p.name}</span></button>`).join('');
  $('#poseLibrary').innerHTML=visible.map((p,i)=>`<button class="library-pose" data-select-pose="${p.id}"><div class="library-pose-visual"><span class="library-pose-num">POSE / 0${i+1}</span>${poseSvg(p.id)}</div><div class="library-pose-text"><h3>${p.name}</h3><p>${p.tip}</p><p class="gaze-note">${p.gaze??'Keep your gaze relaxed, toward the camera.'}</p><span>Use this pose <b>↗</b></span></div></button>`).join('');
  const chosen=poses.find(p=>p.id===state.pose);$('#poseCaption').textContent=chosen.sub+' '+(chosen.gaze??'Keep your gaze relaxed, toward the camera.');
}
function selectPack(id){
  state.pack=id;const pack=posePacks.find(p=>p.id===id);
  if(pack){selectStyle(pack.style);selectPose(pack.poses[0]);}else renderPoses();savePrefs();
}
function selectPose(id){
  const pose=poses.find(p=>p.id===id);if(!pose)return;
  if(!!poses.find(p=>p.id===state.pose)?.seated!==!!pose.seated)clearCalibration('Posture changed. Calibrate again for standing poses.');
  state.pose=id;if(pose.seated&&state.style!=='seated')selectStyle('seated');else if(!pose.seated&&state.style==='seated')selectStyle('portrait');else if(id==='step'&&state.style==='portrait')selectStyle('full');
  state.readySince=0;state.autoLatched=false;renderPoses();updateAnalysis();savePrefs();
}
function activeStyle(){return {...styles[state.style],x:state.targetX??styles[state.style].x};}
function selectStyle(id){
  state.style=id;state.targetX=null;state.readySince=0;state.autoLatched=false;
  $$('[data-style]').forEach(b=>{b.classList.toggle('active',b.dataset.style===id);b.setAttribute('aria-pressed',String(b.dataset.style===id));});
  $('#styleDescription').textContent=styles[id].description;$('#photoType').textContent={travel:'TRAVEL PORTRAIT',full:'FULL BODY',portrait:'PORTRAIT',seated:'SEATED PORTRAIT'}[id];
  if(id==='seated'&&!poses.find(p=>p.id===state.pose)?.seated){state.pose='sit';clearCalibration();renderPoses();}
  if(id!=='seated'&&poses.find(p=>p.id===state.pose)?.seated){state.pose='relax';renderPoses();}
  if(id==='portrait'&&state.pose==='step'){state.pose='relax';renderPoses();}updateAnalysis();savePrefs();
}
function savePrefs(){try{localStorage.setItem('frame-settings',JSON.stringify({style:state.style,pose:state.pose,pack:state.pack,grid:state.grid,guide:state.guide}));}catch{}}
function showView(name){if(name!=='studio')setFocus(false);state.view=name;['studio','poses','gallery'].forEach(v=>$('#'+v+'View').hidden=v!==name);$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));$('#pageLabel').textContent={studio:'Studio',poses:'Pose library',gallery:'Gallery'}[name];if(state.stream)state.stream.getVideoTracks().forEach(t=>t.enabled=name==='studio');state.readySince=0;if(name==='gallery')renderGallery();window.scrollTo({top:0,behavior:'instant'});if(name==='studio')requestAnimationFrame(updateAnalysis);}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(state.toastTimeout);state.toastTimeout=setTimeout(()=>$('#toast').hidden=true,3800);}
function setStatus(message){$('#statusMessage').textContent=message;}
function cameraNotice(message,error=false){$('#cameraStatus').textContent=message;$('#cameraStatus').classList.toggle('error',error);}
function cameraButton(label,busy=false){$('#cameraBtn span').textContent=label;$('#cameraBtn').disabled=false;$('#cameraBtn').setAttribute('aria-busy',String(busy));}
function setEngine(text,error=false){$('#engineLabel').textContent=text;$('#engineLabel').classList.toggle('engine-error',error);}
function calibrationContext(){
  const live=state.mode==='camera',settings=state.stream?.getVideoTracks()[0]?.getSettings()??{};
  return {mode:state.mode,epoch:state.epoch,width:live?video.videoWidth:sample.naturalWidth,height:live?video.videoHeight:sample.naturalHeight,facing:live?state.facing:'photo',zoom:Number.isFinite(settings.zoom)?settings.zoom:1};
}
function syncCalibrationUi(){
  $('#metricSetupBtn').textContent=state.calibration?'Recalibrate':'Set cm / m';
  $('#metricState').textContent=state.calibration?(state.mode==='demo'?'Demo · cm / m estimates':'cm / m estimates'):'cm / m · needs setup';
  $('#clearScaleBtn').hidden=!state.calibration;
}
function clearCalibration(message=''){
  const wasSet=!!state.calibration;state.calibration=null;state.metricLostAt=0;syncCalibrationUi();
  if(message&&wasSet)toast(message);
}
function openCalibration(){
  if(state.style==='seated'){toast('Seated poses use visual guidance. Metric calibration needs an upright standing person.');return;}
  $('#scaleError').textContent='';
  $('#scaleContext').textContent=state.mode==='demo'?'Demo photo: use hypothetical values to preview the guide. These are not measurements of the person in this image.':state.mode==='upload'?'Photo preview: enter the person’s height and the camera distance when this photo was taken.':'Stand upright, face the camera and show your head and both feet. Keep the phone level. Enter the current distance, then hold still and calibrate.';
  $('#scaleDialog').showModal();
}
function calibrate(event){
  event.preventDefault();
  try{
    if(!state.raw)throw Error('Start the camera or tap Try demo first, then wait for a person to be detected.');
    const context=calibrationContext();
    const visible=projectLandmarks(state.raw,context.width,context.height,finder.clientWidth,finder.clientHeight,state.mode==='camera'&&state.mirror);
    state.calibration=createCalibration({heightCm:$('#heightCm').value,distanceM:$('#distanceM').value,raw:state.raw,visible,context});
    state.metricLostAt=0;state.readySince=0;syncCalibrationUi();$('#scaleDialog').close();updateAnalysis();
    toast(state.mode==='demo'?'Demo scale set. All distances are hypothetical estimates.':'Scale set. Movement estimates now use cm and m.');
  }catch(error){$('#scaleError').textContent=error.message;}
}
function setSource(mode){state.mode=mode;const live=mode==='camera';$('#sourceLabel').textContent=live?'LIVE':mode==='upload'?'Gallery':'Demo photo';$('#sourceTag').textContent=live?'On device':mode==='upload'?'Photo mode':'Demo mode';$('#sourceDot').classList.toggle('live',live);$('#analysisLabel').textContent=live?'LIVE GUIDANCE':mode==='upload'?'Photo guidance':'Demo guidance';$('#coachSubtitle').textContent=live?'Guidance that moves with you':'See exactly where to move.';$('#cameraBtn span').textContent=live?'Stop camera':'Start camera';$('#cameraBtn').classList.toggle('active',live);$('#demoBtn').hidden=mode==='demo';$('#sampleAnalyzeBtn').hidden=live;$('#shutter').setAttribute('aria-label',live?'Take photo':mode==='upload'?'Save this framing':'Capture demo photo');renderQuality();renderScene();}
async function ensureModel(mode='IMAGE'){
  if(!state.modelPromise){
    setEngine('Loading pose coach…');
    state.modelPromise=(async()=>{
      const {FilesetResolver,PoseLandmarker}=await import('./vendor/vision_bundle.mjs');
      const vision=await FilesetResolver.forVisionTasks(new URL('./vendor/wasm',location.href).href);
      const base={modelAssetPath:new URL('./vendor/pose_landmarker_lite.task',location.href).href};
      const opts={baseOptions:{...base,delegate:'GPU'},runningMode:'IMAGE',numPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5,outputSegmentationMasks:false};
      try{return await PoseLandmarker.createFromOptions(vision,opts);}catch{return await PoseLandmarker.createFromOptions(vision,{...opts,baseOptions:{...base,delegate:'CPU'}});}
    })().then(m=>{state.model=m;state.modelMode='IMAGE';return m;}).catch(e=>{state.modelPromise=null;state.model=null;throw e;});
  }
  const model=await state.modelPromise;
  if(state.modelMode!==mode){await model.setOptions({runningMode:mode});state.modelMode=mode;state.lastVideoTime=-1;}
  return model;
}
function modelError(error){
  console.error('Pose model unavailable:',error);state.raw=null;state.result=null;setEngine('Manual guide',true);
  setStatus('Pose tracking is unavailable. You can still take photos and follow the outline.');
  const retry=document.createElement('button');retry.textContent='Retry tracking';retry.className='text-button';retry.style.marginTop='7px';retry.onclick=async()=>{setStatus('');if(state.mode==='camera'){try{await ensureModel('VIDEO');setEngine('Live pose tracking');startLoop();}catch(e){modelError(e);}}else analyzeImage();};$('#statusMessage').append(retry);
  renderResult({detected:false,ready:false,score:null,kind:'error',instruction:'Follow the outline.',detail:'Use the outline to frame your photo while automatic tracking is unavailable.',metrics:[]});
}
async function analyzeImage(){
  const epoch=state.epoch;
  try{
    await sample.decode();if(state.mode==='camera'||epoch!==state.epoch)return;
    const model=await ensureModel('IMAGE');if(state.mode==='camera'||epoch!==state.epoch)return;
    const result=model.detect(sample);state.raw=result.landmarks[0]??null;setEngine(state.mode==='upload'?'Photo pose tracking':'Demo pose tracking');updateAnalysis();refreshScene();
  }catch(e){if(epoch===state.epoch&&state.mode!=='camera')modelError(e);}
}
function drawGuide(){
  const s=activeStyle(),cx=s.x*300;
  const top=s.top*400,bottom=(s.top+s.height)*400;
  const height=bottom-top;
  const scale=height/(state.style==='seated'?65:s.full?90:60);
  const color=state.result?.ready?'#7c9aff':'#ffffff';
  $('#targetGuide').innerHTML=state.guide?`<g transform="translate(${cx-50*scale} ${top-6*scale}) scale(${scale})" stroke="${color}" stroke-opacity=".70" stroke-width=".85" fill="none" stroke-dasharray="3 2"><circle cx="50" cy="15" r="9"/><path d="${paths[state.pose]}"/><path d="M35 31 39 66h22l4-35" stroke-opacity=".3"/></g><path d="M${cx-32} ${bottom+5}h64" stroke="${color}" stroke-width="1" stroke-dasharray="3 3"/>`:'';
  $('#targetLabel').hidden=!state.guide||state.result?.detected;$('#targetLabel').firstChild.textContent='Stand here ';
}
function updateAnalysis(){
  if(!finder.clientWidth)return;
  let projected=null;
  if(state.raw){const sw=state.mode==='camera'?video.videoWidth:sample.naturalWidth,sh=state.mode==='camera'?video.videoHeight:sample.naturalHeight;if(sw&&sh)projected=projectLandmarks(state.raw,sw,sh,finder.clientWidth,finder.clientHeight,state.mode==='camera'&&state.mirror);}
  state.projected=projected;
  const base=analyzePose(projected,state.style,state.pose,state.targetX),context=calibrationContext();
  if(state.calibration&&!sameCamera(state.calibration,context))clearCalibration('Camera or zoom changed. Set cm / m again.');
  if(state.calibration&&!base.detected){if(!state.metricLostAt)state.metricLostAt=performance.now();else if(performance.now()-state.metricLostAt>1000)clearCalibration('Tracking lost. Set cm / m again for this person.');}else state.metricLostAt=0;
  const metric=estimateMetricGuide(base,state.raw,state.calibration,context,state.style,finder.clientWidth/finder.clientHeight);
  state.result=metricPresentation(base,metric,!!state.calibration);if(state.style==='seated'&&!metric&&(base.kind==='distance'||base.kind==='position'))state.result.detail='Use the arrow and outline. Standing-height calibration does not apply to seated poses.';drawGuide();drawSkeleton(projected);renderResult(state.result);
}
function drawMovement(r){
  const layer=$('#movementGuide'),hud=$('#movementHud');
  layer.innerHTML='';hud.hidden=!state.guide||!r?.adjustments;
  if(!state.guide||!r?.adjustments)return;
  const {lateral:l,depth:d,vertical:v}=r.adjustments,s=activeStyle();
  const m=r.metric;
  const entries=[['PERSON',l.aligned?'✓ Aligned':`${l.direction==='right'?'→':'←'} ${m?formatDistance(m.lateral):'Set scale'}`,l.aligned],['CAMERA',d.aligned?'✓ Distance':d.change===null?'Check frame':m?`${d.direction==='back'?'Back':'Closer'} ${formatDistance(m.depth)}`:'Set scale',d.aligned],['TILT',!v.available?'—':v.aligned?'✓ Height':`${v.direction==='up'?'↑ Up':'↓ Down'}`,v.aligned&&v.available]];
  hud.innerHTML=entries.map(([label,value,good])=>`<div class="movement-cell ${good?'aligned':''}"><small>${label}</small><strong>${value}</strong></div>`).join('');
  const x=clamp(r.center,.06,.94)*300,tx=s.x*300,y=clamp(r.bodyCenter,.32,.60)*400;
  const arrows=[];
  if(!l.aligned){
    const sign=l.delta>0?1:-1;
    arrows.push(`<circle cx="${x}" cy="${y}" r="4" fill="#fff"/><path d="M${x} ${y}H${tx}"/><path d="M${tx-sign*7} ${y-6}L${tx} ${y}l${-sign*7} 6"/><path d="M${tx} ${y-19}v38" stroke-dasharray="3 3" stroke-width="1.2"/>`);
  }
  if(r.kind==='vertical'){
    const vy=clamp(r.bodyCenter,.2,.7)*400,ty=clamp(r.bodyCenter+v.delta,.2,.7)*400,sign=v.delta>0?1:-1;
    arrows.push(`<circle cx="${x}" cy="${vy}" r="4" fill="#fff"/><path d="M${x} ${vy}V${ty}"/><path d="M${x-6} ${ty-sign*7}L${x} ${ty}l6 ${-sign*7}"/>`);
  }
  // Side rails compare measured and target body size. No physical distance is implied.
  const top=clamp(r.head,.14,.96)*400,bottom=clamp(r.extent,.14,.96)*400;
  const targetTop=s.top*400,targetBottom=(s.top+s.height)*400;
  const rails=d.percent===null?'':`<path d="M18 ${top}h6v${bottom-top}h-6" stroke="#fff" stroke-width="1.5" opacity=".8"/><path d="M12 ${targetTop}H6v${targetBottom-targetTop}h6" stroke="#7c9aff" stroke-width="2" stroke-dasharray="3 3"/>`;
  layer.innerHTML=rails+`<g fill="none" stroke="#3157ed" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 1px 2px #fff)">${arrows.join('')}</g>`;
}
function drawSkeleton(p){
  if(!state.guide||!p){$('#skeleton').innerHTML='';return;}
  const visible=i=>p[i]&&(p[i].visibility??1)>.6&&p[i].x>0&&p[i].x<1&&p[i].y>0&&p[i].y<1;
  const lines=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
  $('#skeleton').innerHTML=lines.filter(([a,b])=>visible(a)&&visible(b)).map(([a,b])=>`<line x1="${p[a].x*300}" y1="${p[a].y*400}" x2="${p[b].x*300}" y2="${p[b].y*400}" stroke="#90aaff" stroke-opacity=".48" stroke-width=".8"/>`).join('')+[11,12,13,14,15,16,23,24,25,26,27,28].filter(visible).map(i=>`<circle cx="${p[i].x*300}" cy="${p[i].y*400}" r="1.7" fill="#d5e0ff" stroke="#fff" stroke-width=".4"/>`).join('');
}
function renderResult(r){
  const instruction=r.instruction;
  $('#instruction').textContent=instruction;$('#instructionDetail').textContent=r.detail;$('#tipTitle').textContent=instruction;$('#tipIcon').textContent=r.arrow??icons[r.kind];$('#instructionIcon').textContent=r.arrow??icons[r.kind];$('#tipWho').textContent=r.actor??'YOUR NEXT MOVE';
  $('#tipDetail').textContent=r.metric&&(r.kind==='position'||r.kind==='distance')?(state.mode==='demo'?'Demo estimate · hypothetical height & distance':'Estimate · keep zoom and posture unchanged'):r.detail;
  drawMovement(r);
  $('#metrics').innerHTML=(r.metrics.length?r.metrics:[{label:'Position',value:null},{label:'Framing',value:null},{label:'Pose',value:null}]).map(m=>`<div class="metric"><div class="metric-label"><span>${m.label}</span><b>${m.value===null?'—':m.value+'%'}</b></div><div class="metric-bar"><span style="width:${m.value??0}%"></span></div></div>`).join('');
  finder.classList.toggle('ready',r.ready);$('#shutter').classList.toggle('ready',r.ready);
  if(state.mode==='camera'&&state.view==='studio'&&!document.querySelector('dialog[open]')){
    const now=performance.now();
    if(state.voice&&instruction!==state.lastSpoken&&now-state.lastSpeechAt>6000){speak(instruction+'. '+r.detail);state.lastSpoken=instruction;state.lastSpeechAt=now;}
    if(r.ready&&(!state.bestShot||canAutoShoot(r.ready,state.quality,now))&&state.auto&&!state.busy&&!state.autoLatched&&!document.hidden){if(!state.readySince)state.readySince=now;if(now-state.readySince>2000){state.autoLatched=true;capture(false);}}
    else if(!r.ready||(state.bestShot&&!canAutoShoot(r.ready,state.quality,now))){state.readySince=0;if(!state.missingSince)state.missingSince=now;if(now-state.missingSince>1000)state.autoLatched=false;}
    if(r.ready)state.missingSince=0;
  } else state.readySince=0;
}
function speak(text){if(!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(translateText(text));u.lang=getLocale();u.rate=.98;const v=speechSynthesis.getVoices().find(x=>x.lang.toLowerCase().startsWith(getLanguage()));if(v)u.voice=v;speechSynthesis.speak(u);}catch{}}
async function startCamera(){
  if(state.cameraStarting){stopCamera();cameraNotice('Camera setup cancelled. You can start again whenever you are ready.');return;}
  if(state.busy){cameraNotice('Finish taking this photo before switching cameras.');return;}
  if(!isNative&&!window.isSecureContext){cameraNotice('Open the HTTPS link to enable your camera.',true);return;}
  if(!navigator.mediaDevices?.getUserMedia){cameraNotice('Camera access is unavailable here. Open this link directly in Safari on your iPhone.',true);return;}
  const epoch=++state.epoch,controller=new AbortController();state.cameraAbort=controller;state.cameraStarting=true;
  cameraButton('Allow camera · Cancel',true);cameraNotice('Choose Allow in the camera permission prompt. Tap the button again to cancel.');setStatus('');
  let stream;
  try{
    stream=await requestCamera(navigator.mediaDevices,state.facing,{signal:controller.signal});
    if(epoch!==state.epoch){stream.getTracks().forEach(t=>t.stop());return;}
    state.stream=stream;sample.hidden=true;cameraButton('Connecting · Cancel',true);cameraNotice('Connecting your camera preview…');
    try{await playCamera(video,stream,{signal:controller.signal});}catch(error){if(error.name==='NotAllowedError')throw new DOMException('Video playback needs another tap','CameraPlaybackBlocked');throw error;}
    if(epoch!==state.epoch){stream.getTracks().forEach(t=>t.stop());return;}
    const track=stream.getVideoTracks()[0],actualFacing=track?.getSettings().facingMode;
    state.mirror=actualFacing==='user'||(!actualFacing&&state.facing==='user');video.classList.toggle('mirror',state.mirror);
    state.raw=null;state.readySince=0;state.autoLatched=false;setSource('camera');setFocus(true);state.quality=null;state.lastQuality=0;state.lastScene=0;cameraButton('Stop camera');cameraNotice('Your camera is on. You can take photos while the pose coach loads.');setEngine('Loading pose coach…');updateAnalysis();
    track?.addEventListener('ended',()=>{if(state.stream===stream){stopCamera();cameraNotice('The camera disconnected. Tap Start camera to reconnect.',true);}});
    // Do not keep the camera button locked while the model downloads or initializes.
    requestAnimationFrame(()=>{ensureModel('VIDEO').then(()=>{if(epoch!==state.epoch||state.mode!=='camera')return;setEngine('Live pose tracking');cameraNotice('');startLoop();if(state.bestShot)ensureFaceModel();}).catch(error=>{if(epoch===state.epoch)modelError(error);});});
  }catch(error){
    if(stream)stream.getTracks().forEach(track=>track.stop());
    if(epoch!==state.epoch)return;
    state.stream=null;video.pause();video.srcObject=null;video.hidden=true;sample.hidden=false;setSource('demo');
    const messages={NotAllowedError:isNative?'Camera access is blocked. Allow FRAME to use the camera in your device settings, then try again.':'Camera access is blocked. In Safari, open the page menu, then Website Settings, and allow Camera access. Then try again.',NotFoundError:'No camera was found. Import a photo to try the guide.',NotReadableError:'Close other apps using the camera, then try again.',CameraPermissionTimeout:'The permission request timed out. Check camera access in Safari, then try again.',CameraPlaybackTimeout:'Camera access was granted, but the preview took too long to start. Try again.',CameraPlaybackBlocked:'Video playback was blocked. Tap Start camera again.',AbortError:'Camera setup cancelled. You can start again whenever you are ready.'};
    cameraNotice(messages[error.name]||'Could not start the camera. Please try again. ('+error.name+')',true);
  }finally{
    if(epoch===state.epoch){state.cameraStarting=false;state.cameraAbort=null;cameraButton(state.mode==='camera'?'Stop camera':'Start camera');}
  }
}
function stopCamera(returnToDemo=true){
  setFocus(false);state.quality=null;state.scene=null;state.targetX=null;state.lastEyes='unknown';state.lastFaceAt=0;state.lastFaceSharpness=null;renderQuality();
  clearCalibration();
  state.epoch++;state.cameraAbort?.abort();state.cameraAbort=null;state.cameraStarting=false;
  if(state.stream){const stream=state.stream;state.stream=null;stream.getTracks().forEach(t=>t.stop());}
  video.pause();video.srcObject=null;video.hidden=true;sample.hidden=false;cancelAnimationFrame(state.loop);state.raw=null;state.readySince=0;state.autoLatched=false;state.lastVideoTime=-1;state.busy=false;cameraButton('Start camera');cameraNotice('');
  if(returnToDemo){sample.src='assets/demo-portrait.jpg';if(state.imageUrl){URL.revokeObjectURL(state.imageUrl);state.imageUrl=null;}setSource('demo');setEngine('Ready when you are');updateAnalysis();}
}
function startLoop(){cancelAnimationFrame(state.loop);state.lastVideoTime=-1;state.lastInference=0;const tick=now=>{
  if(state.mode!=='camera'||!state.stream)return;
  if(!document.hidden&&state.view==='studio'&&video.readyState>=2&&video.currentTime!==state.lastVideoTime&&now-state.lastInference>160&&state.model&&state.modelMode==='VIDEO'){
    state.lastVideoTime=video.currentTime;state.lastInference=now;
    try{const result=state.model.detectForVideo(video,now);state.raw=smoothLandmarks(state.raw,result.landmarks[0]??null);if(!state.busy&&now-state.lastQuality>400){state.lastQuality=now;refreshQuality();}if(!state.busy&&now-state.lastScene>2000){state.lastScene=now;refreshScene();}updateAnalysis();}catch(e){modelError(e);return;}
  }
  state.loop=requestAnimationFrame(tick);
};state.loop=requestAnimationFrame(tick);}
async function importPhoto(file){
  if(!file)return;if(!file.type.startsWith('image/')){toast('Please choose an image file.');return;}if(file.size>30*1024*1024){toast('Choose a photo smaller than 30 MB.');return;}
  stopCamera(false);state.epoch++;if(state.imageUrl)URL.revokeObjectURL(state.imageUrl);state.imageUrl=URL.createObjectURL(file);sample.src=state.imageUrl;sample.alt='Imported photo';setSource('upload');setStatus('');setEngine('Analyzing photo…');
  try{await sample.decode();await analyzeImage();}catch{setStatus('This image could not be opened. Try a JPG or PNG file.');stopCamera();}
}
function frameCanvas(maxEdge=2048){
  const source=state.mode==='camera'?video:sample,sw=state.mode==='camera'?video.videoWidth:sample.naturalWidth,sh=state.mode==='camera'?video.videoHeight:sample.naturalHeight;
  if(!sw||!sh||!finder.clientWidth)throw Error('The image is not ready yet.');
  const c=document.createElement('canvas'),r=cropRect(sw,sh,finder.clientWidth,finder.clientHeight),factor=Math.min(1,maxEdge/Math.max(r.width,r.height));
  c.width=Math.round(r.width*factor);c.height=Math.round(r.height*factor);const ctx=c.getContext('2d');
  if(state.mode==='camera'&&state.mirror){ctx.translate(c.width,0);ctx.scale(-1,1);}ctx.drawImage(source,r.x,r.y,r.width,r.height,0,0,c.width,c.height);return c;
}
async function capture(useTimer=true){
  if(state.busy||state.view!=='studio')return;state.busy=true;const epoch=state.epoch;$('#shutter').disabled=true;
  try{
    await storageReady;
    if(epoch!==state.epoch||document.hidden)return;
    if(useTimer&&state.timer){for(let i=state.timer;i>0;i--){if(epoch!==state.epoch||document.hidden)return;$('#countdown').hidden=false;$('#countdown').textContent=i;await new Promise(r=>setTimeout(r,1000));}}$('#countdown').hidden=true;
    const count=state.mode==='camera'&&state.bestShot?3:1,frames=[],burstId=count>1?(crypto.randomUUID?.()??Date.now().toString()):null;let previous=null;
    for(let i=0;i<count;i++){
      if(epoch!==state.epoch||document.hidden)return;
      $('#burstStatus').hidden=count===1;$('#burstStatus').textContent=`Best of 3 · ${i+1} / ${count}`;
      const c=frameCanvas(),q=inspectQuality(c,previous,true);previous=q.gray;
      const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.94));if(!blob)throw Error('Image encoding failed');
      const {gray,...quality}=q;frames.push({id:crypto.randomUUID?.()??Date.now().toString()+'-'+i,blob,created:Date.now(),mode:state.mode,style:state.style,pose:state.pose,burstId,burstIndex:i,quality});
      if(i<count-1)await new Promise(resolve=>setTimeout(resolve,300));
    }
    if(epoch!==state.epoch||document.hidden)return;
    const winner=chooseBest(frames);frames.forEach((p,i)=>p.bestPick=count>1&&i===winner);
    for(const photo of frames){state.photos.unshift(photo);await persistPhoto(photo);}updateCount();
    $('#flash').classList.remove('fire');void $('#flash').offsetWidth;$('#flash').classList.add('fire');
    toast(count>1?'Three frames saved. Best pick selected.':state.mode==='demo'?'Demo photo added to your gallery.':'Captured. Open your gallery to save or share it.');
    if(!state.auto)openPhoto(frames[winner]);
  }catch(e){console.error('Capture failed',e);toast('Could not capture the photo. Please try again.');}finally{state.busy=false;$('#shutter').disabled=false;$('#countdown').hidden=true;$('#burstStatus').hidden=true;state.readySince=0;}
}
async function openDatabase(){
  try{const loaded=await loadPhotoDatabase(globalThis.indexedDB);state.db=loaded.db;state.photos=loaded.photos;}
  catch{state.db=null;setStatus('This browser cannot keep your photos between visits. Download them after shooting.');}
  updateCount();
}
async function persistPhoto(photo){if(!state.db)return;try{await new Promise((resolve,reject)=>{const tx=state.db.transaction('photos','readwrite');tx.objectStore('photos').put(photo);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}catch{toast('Browser storage is full. Download your photo to keep it.');}}
function updateCount(){$('#galleryCount').textContent=state.photos.length;$('#frameNumber').textContent='FRAME '+String(state.photos.length+1).padStart(3,'0');}
function renderGallery(){state.objectUrls.forEach(URL.revokeObjectURL);state.objectUrls=[];$('#emptyGallery').hidden=state.photos.length>0;$('#galleryGrid').innerHTML='';state.photos.forEach((photo,i)=>{const url=URL.createObjectURL(photo.blob);state.objectUrls.push(url);const button=document.createElement('button');button.className='gallery-item';button.innerHTML=`<img src="${url}" alt="${photo.mode==='demo'?'Demo photo':'Captured photo'} ${i+1}" loading="lazy"><div class="gallery-item-info"><strong>${photo.bestPick?'★ Best · ':photo.mode==='demo'?'Demo · ':''}${styles[photo.style]?.name??'Gallery'}</strong><span>${new Date(photo.created).toLocaleDateString(getLocale(),{month:'2-digit',day:'2-digit'})}</span></div>`;button.onclick=()=>openPhoto(photo);$('#galleryGrid').append(button);});}
function openPhoto(photo){
  state.photo=photo;state.readySince=0;if(state.previewUrl)URL.revokeObjectURL(state.previewUrl);state.previewUrl=URL.createObjectURL(photo.blob);$('#capturedPreview').src=state.previewUrl;
  $('#photoDialogTitle').textContent=photo.bestPick?'BEST PICK · 3-FRAME BURST':photo.mode==='demo'?'DEMO FRAME':'YOUR FRAME';
  $('#photoQuality').textContent=photo.quality?`${photo.quality.eyes==='open'?'Eyes appear open':photo.quality.eyes==='closed'?'Blink detected':'Eye check unavailable'} · Sharpness estimate ${Math.round(photo.quality.sharpness)}${photo.bestPick?' · Best of this burst':''}`:'';
  state.burstPreviewUrls.forEach(URL.revokeObjectURL);state.burstPreviewUrls=[];$('#burstFrames').innerHTML='';
  const group=photo.burstId?state.photos.filter(p=>p.burstId===photo.burstId).sort((a,b)=>a.burstIndex-b.burstIndex):[];
  for(const item of group){const url=URL.createObjectURL(item.blob);state.burstPreviewUrls.push(url);const button=document.createElement('button');button.className=item.id===photo.id?'active':'';button.setAttribute('aria-label',`Frame ${item.burstIndex+1}${item.bestPick?', best pick':''}`);button.innerHTML=`<img src="${url}" alt="Burst frame ${item.burstIndex+1}"><span>${item.bestPick?'★ Best':'Frame '+(item.burstIndex+1)}</span>`;button.onclick=()=>openPhoto(item);$('#burstFrames').append(button);}
  if(!$('#photoDialog').open)$('#photoDialog').showModal();
}
function filename(photo){return 'frame-'+new Date(photo.created).toISOString().replace(/[:.]/g,'-').slice(0,19)+(photo.mode==='demo'?'-example':'')+'.jpg';}
async function downloadPhoto(){if(!state.photo)return;if(isNative){try{await shareNativePhoto(state.photo.blob,filename(state.photo));}catch(e){if(!/cancel/i.test(e.message??''))toast('Native sharing is unavailable. Please try again.');}return;}const a=document.createElement('a');const url=URL.createObjectURL(state.photo.blob);a.href=url;a.download=filename(state.photo);a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function sharePhoto(){if(!state.photo)return;if(isNative)return downloadPhoto();const file=new File([state.photo.blob],filename(state.photo),{type:'image/jpeg'});try{if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'FRAME'});}else{downloadPhoto();toast('Download started. On iPhone, you can also touch and hold the photo to save it.');}}catch(e){if(e.name!=='AbortError'){downloadPhoto();toast('Sharing was unavailable. Your download has started.');}}}
async function deletePhoto(){if(!state.photo)return;const id=state.photo.id;try{if(state.db)await new Promise((resolve,reject)=>{const tx=state.db.transaction('photos','readwrite');tx.objectStore('photos').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});state.photos=state.photos.filter(p=>p.id!==id);state.photo=null;$('#photoDialog').close();updateCount();renderGallery();toast('Photo deleted.');}catch{toast('Could not delete the photo. Please try again.');}}

const coachPanel=$('.coach-panel'),coachAnchor=document.createComment('coach-home');coachPanel.before(coachAnchor);
function setFocus(on){
  state.focus=on;document.body.classList.toggle('shooting',on);$('#focusBtn').setAttribute('aria-pressed',String(on));
  if(!on&&$('#controlsDialog').open)$('#controlsDialog').close();
}
function openControls(){ $('#controlsContent').append(coachPanel);$('#controlsDialog').showModal(); }
$('#controlsDialog').addEventListener('close',()=>coachAnchor.after(coachPanel));
async function ensureFaceModel(){
  if(state.facePromise)return state.facePromise;
  state.faceStatus='loading';renderQuality();
  state.facePromise=(async()=>{
    const {FilesetResolver,FaceLandmarker}=await import('./vendor/vision_bundle.mjs');const vision=await FilesetResolver.forVisionTasks(new URL('./vendor/wasm',location.href).href);
    const opts={baseOptions:{modelAssetPath:new URL('./vendor/face_landmarker.task',location.href).href,delegate:'GPU'},runningMode:'IMAGE',numFaces:1,outputFaceBlendshapes:true};
    try{return await FaceLandmarker.createFromOptions(vision,opts);}catch{return await FaceLandmarker.createFromOptions(vision,{...opts,baseOptions:{...opts.baseOptions,delegate:'CPU'}});}
  })().then(model=>{state.faceModel=model;state.faceStatus='ready';renderQuality();return model;}).catch(error=>{console.warn('Eye check unavailable',error);state.faceStatus='error';state.facePromise=null;renderQuality();return null;});return state.facePromise;
}
function inspectQuality(canvas,previous,forceEyes=false){
  const small=document.createElement('canvas');small.width=96;small.height=Math.max(32,Math.round(canvas.height/canvas.width*96));const ctx=small.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,0,0,small.width,small.height);
  const q=qualityStats(ctx.getImageData(0,0,small.width,small.height),previous);let eyes=state.lastEyes;
  if(eyes==='open'&&state.lastFaceSharpness!==null)q.sharpness=state.lastFaceSharpness;
  if(state.faceModel&&(forceEyes||performance.now()-state.lastFaceAt>650)){
    try{
      let input=canvas,sourceFaceWidth=canvas.width,sourceFaceHeight=canvas.height;
      const nose=state.projected?.[0],a=state.projected?.[11],b=state.projected?.[12];
      if(nose&&a&&b&&(nose.visibility??1)>.6){
        const rw=clamp(Math.abs(a.x-b.x)*1.5,.14,.7),rh=clamp(Math.abs((a.y+b.y)/2-nose.y)*3.5,.18,.65),x=clamp(nose.x-rw/2,0,1-rw),y=clamp(nose.y-rh*.45,0,1-rh);
        sourceFaceWidth=rw*canvas.width;sourceFaceHeight=rh*canvas.height;const factor=Math.min(256/sourceFaceWidth,384/sourceFaceHeight);
        input=document.createElement('canvas');input.width=Math.max(1,Math.round(sourceFaceWidth*factor));input.height=Math.max(1,Math.round(sourceFaceHeight*factor));input.getContext('2d').drawImage(canvas,x*canvas.width,y*canvas.height,sourceFaceWidth,sourceFaceHeight,0,0,input.width,input.height);
      }
      state.lastFaceSharpness=null;const result=state.faceModel.detect(input);eyes=eyeState(result);
      const facePoints=result.faceLandmarks?.[0];if(facePoints){const xs=facePoints.map(p=>p.x),ys=facePoints.map(p=>p.y);if((Math.max(...xs)-Math.min(...xs))*sourceFaceWidth<24||(Math.max(...ys)-Math.min(...ys))*sourceFaceHeight<24)eyes='unknown';}
      state.lastEyes=eyes;state.lastFaceAt=performance.now();
      const points=result.faceLandmarks?.[0];if(points&&eyes!=='unknown'){
        const xs=points.map(p=>p.x),ys=points.map(p=>p.y),x=Math.max(0,Math.min(...xs)),y=Math.max(0,Math.min(...ys)),w=Math.min(1-x,Math.max(...xs)-x),h=Math.min(1-y,Math.max(...ys)-y);
        if(w>0&&h>0){const face=document.createElement('canvas');face.width=96;face.height=96;const fc=face.getContext('2d',{willReadFrequently:true});fc.drawImage(input,x*input.width,y*input.height,w*input.width,h*input.height,0,0,96,96);q.sharpness=qualityStats(fc.getImageData(0,0,96,96)).sharpness;state.lastFaceSharpness=q.sharpness;}
      }
    }catch{eyes='unknown';state.lastEyes='unknown';}
  }
  if(!state.faceModel||performance.now()-state.lastFaceAt>1000)eyes='unknown';
  return {...q,eyes,at:performance.now(),eyeAt:state.lastFaceAt};
}
function refreshQuality(){try{state.quality=inspectQuality(frameCanvas(960),state.quality?.gray);renderQuality();}catch{state.quality=null;renderQuality();}}
function renderQuality(){
  const q=state.quality;
  $('#qualityBadge').textContent=state.mode!=='camera'?(state.mode==='demo'?'Demo preview':'Photo preview'):!state.bestShot?'Single shot':state.faceStatus==='loading'?'Loading eye check…':q?.eyes==='closed'?'Blink · wait':q?.eyes==='open'?q.motion!==null&&q.motion<7?'Eyes open · steady':'Eyes open · hold steady':state.faceStatus==='error'?'Eye check unavailable':'Keep the face visible';
  $('#autoQualityHint').textContent=!state.bestShot?'Auto capture waits for an aligned pose.':state.faceStatus==='error'?'Eye checks unavailable. Use the shutter, or disable Best of 3 for pose-only auto capture.':'Auto waits for alignment, open eyes and a steady frame. If the face is too small, use the shutter.';
}
function refreshScene(){
  try{const c=frameCanvas(180),ctx=c.getContext('2d',{willReadFrequently:true});state.scene=analyzeScene(ctx.getImageData(0,0,c.width,c.height),state.projected);renderScene();}catch{state.scene=null;renderScene();}
}
function renderScene(){
  const r=state.scene;$('#sceneSummary').textContent=r?.summary??'Start the camera or try the demo.';$('#sceneReason').textContent=r?.reason??'Find a quieter background and a balanced frame.';
  $('#sceneLight').textContent=r?.lighting??'Light check is waiting for an image.';$('#sceneLevel').textContent=r?.level??'Horizon check is waiting for an image.';$('#applySceneBtn').disabled=!r;
  $('#sceneMini').textContent=r?.summary??'Analyze the background';
}
function openScene(){refreshScene();$('#sceneDialog').showModal();}
function applyScene(){
  const r=state.scene;if(!r)return;const seated=state.style==='seated';selectStyle(seated?'seated':r.style);state.targetX=r.targetX;state.readySince=0;updateAnalysis();$('#sceneDialog').close();toast('Suggested framing applied. Follow the updated outline.');
}
$('#focusBtn').onclick=()=>setFocus(true);$('#exitFocusBtn').onclick=()=>setFocus(false);$('#optionsBtn').onclick=openControls;$('#focusScaleBtn').onclick=openCalibration;
$('#sceneBtn').onclick=$('#focusSceneBtn').onclick=openScene;$('#applySceneBtn').onclick=applyScene;
$('#bestShotBtn').onclick=()=>{state.bestShot=!state.bestShot;$('#bestShotBtn').setAttribute('aria-checked',state.bestShot);state.readySince=0;if(state.bestShot&&state.mode==='camera')ensureFaceModel();renderQuality();};
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]'))setFocus(false);});

$$('[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view));$$('.back-studio').forEach(b=>b.onclick=()=>showView('studio'));$('#mobileGallery').onclick=()=>showView('gallery');$('#allPosesBtn').onclick=()=>showView('poses');
document.addEventListener('click',e=>{const pack=e.target.closest('[data-pack]');if(pack)selectPack(pack.dataset.pack);const p=e.target.closest('[data-pose]');if(p)selectPose(p.dataset.pose);const l=e.target.closest('[data-select-pose]');if(l){selectPose(l.dataset.selectPose);showView('studio');toast('Your new pose is ready.');}});
$$('[data-style]').forEach(b=>b.onclick=()=>selectStyle(b.dataset.style));
$('#cameraBtn').onclick=()=>state.mode==='camera'&&!state.cameraStarting?stopCamera():startCamera();
$('#metricSetupBtn').onclick=openCalibration;$('#scaleForm').onsubmit=calibrate;$('#clearScaleBtn').onclick=()=>{clearCalibration();$('#scaleDialog').close();updateAnalysis();};
$('#sampleAnalyzeBtn').onclick=()=>{cameraNotice('Analyzing the demo photo…');analyzeImage().then(()=>{if(state.mode==='demo')cameraNotice('');});};$('#demoBtn').onclick=()=>{stopCamera();setStatus('');};
$('#flipBtn').onclick=async()=>{if(state.mode!=='camera'){toast('Start your camera to switch between front and rear.');return;}if(state.busy)return;state.facing=state.facing==='environment'?'user':'environment';stopCamera(false);await startCamera();};
$('#uploadBtn').onclick=()=>$('#fileInput').click();$('#fileInput').onchange=e=>{importPhoto(e.target.files[0]);e.target.value='';};
$('#shutter').onclick=()=>capture();$('#timerBtn').onclick=()=>{state.timer=({0:3,3:5,5:0})[state.timer];$('#timerLabel').textContent=state.timer?state.timer:'';$('#timerBtn').classList.toggle('selected',!!state.timer);$('#timerBtn').setAttribute('aria-label','Capture timer: '+state.timer+' seconds');toast(state.timer?state.timer+' seconds until capture.':'Timer off.');};
$('#gridBtn').onclick=()=>{state.grid=!state.grid;$('#grid').hidden=!state.grid;$('#gridBtn').classList.toggle('selected',state.grid);$('#gridBtn').setAttribute('aria-pressed',state.grid);savePrefs();};
$('#guideBtn').onclick=()=>{state.guide=!state.guide;$('#guideBtn').setAttribute('aria-pressed',state.guide);drawGuide();drawSkeleton(state.projected);drawMovement(state.result);savePrefs();};
$('#ratioBtn').onclick=()=>{state.ratio=state.ratio===.75?1:.75;finder.style.aspectRatio=state.ratio===1?'1 / 1':'3 / 4';finder.style.setProperty('--frame-ratio',state.ratio);$('#ratioBtn').textContent=state.ratio===1?'1:1':'3:4';state.readySince=0;requestAnimationFrame(updateAnalysis);};
$('#voiceBtn').onclick=()=>{if(!('speechSynthesis'in window)){toast('Voice guidance is not supported in this browser.');return;}state.voice=!state.voice;$('#voiceBtn').setAttribute('aria-pressed',state.voice);$('#voiceBtn').setAttribute('aria-label','Voice guidance '+(state.voice?'off':'on'));if(state.voice){speak('Voice guidance is on. '+(state.result?.instruction??'Start your camera.'));state.lastSpeechAt=performance.now();}else speechSynthesis.cancel();toast(state.voice?'Voice guidance on.':'Voice guidance off.');};
$('#autoBtn').onclick=()=>{state.auto=!state.auto;state.readySince=0;state.autoLatched=false;$('#autoBtn').setAttribute('aria-checked',state.auto);toast(state.auto?(state.mode==='camera'?'Hold the guide for 2 seconds to capture a photo.':'Auto capture will start when your camera is on.'):'Auto capture off.');};
$('#helpBtn').onclick=$('#helpNav').onclick=()=>$('#helpDialog').showModal();$('#privacyBtn').onclick=()=>$('#privacyDialog').showModal();$$('.close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$('#downloadPhotoBtn').onclick=downloadPhoto;$('#sharePhotoBtn').onclick=sharePhoto;$('#deletePhotoBtn').onclick=deletePhoto;
function suspendCamera(){if(state.mode==='camera'||state.cameraStarting)stopCamera();if('speechSynthesis'in window)speechSynthesis.cancel();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendCamera();});window.addEventListener('pagehide',suspendCamera);
bindNativeLifecycle({onInactive:suspendCamera,onBack:()=>{const dialog=document.querySelector('dialog[open]');if(dialog){dialog.close();return true;}if(state.focus){setFocus(false);return true;}if(state.view!=='studio'){showView('studio');return true;}suspendCamera();return false;}}).catch(error=>console.error('Native lifecycle unavailable',error));
new ResizeObserver(()=>{clearTimeout(state.resizeTimeout);state.resizeTimeout=setTimeout(updateAnalysis,100);}).observe(finder);
try{const prefs=JSON.parse(localStorage.getItem('frame-settings')??'null');if(prefs){if(styles[prefs.style])state.style=prefs.style;if(posePacks.some(p=>p.id===prefs.pack)||prefs.pack==='all')state.pack=prefs.pack;if(poses.some(p=>p.id===prefs.pose))state.pose=prefs.pose;if(typeof prefs.grid==='boolean')state.grid=prefs.grid;if(typeof prefs.guide==='boolean')state.guide=prefs.guide;}}catch{}
renderPoses();selectStyle(state.style);$('#grid').hidden=!state.grid;$('#gridBtn').classList.toggle('selected',state.grid);$('#gridBtn').setAttribute('aria-pressed',state.grid);$('#guideBtn').setAttribute('aria-pressed',state.guide);drawGuide();renderScene();renderQuality();const storageReady=openDatabase();setSource('demo');setEngine('Ready when you are');renderResult({detected:false,ready:false,score:null,kind:'find',instruction:'Start with your camera.',detail:'Start your camera for live guidance, or try the demo to see how it works.',metrics:[]});
initLocalization();
window.addEventListener('frame-languagechange',()=>{state.lastSpoken='';if('speechSynthesis'in window)speechSynthesis.cancel();});
if(!isNative&&'serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js?v=8',{updateViaCache:'none'}).catch(()=>{});
