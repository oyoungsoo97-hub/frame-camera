/* Injected only by native test bundles. Never copied into the production web directory. */
window.__frameQARun = async function(name, platform) {
  const $ = selector => document.querySelector(selector);
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const wait = async (predicate, message, timeout=60000) => {
    const start=Date.now();
    while(Date.now()-start<timeout) { if(await predicate())return; await new Promise(r=>setTimeout(r,150)); }
    // A synchronous shader/model task may finish while the final timer callback is delayed.
    if(await predicate()) { console.info('FRAME_QA predicate resolved after delayed timer',message,Date.now()-start);return; }
    throw Error(message+'; engine='+$('#engineLabel')?.textContent+'; status='+$('#statusMessage')?.textContent);
  };
  const visibleFinder = () => {
    const frame=$('#viewfinder').getBoundingClientRect();
    const picture=$('#sampleImage').getBoundingClientRect();
    assert(frame.width>=80&&frame.height>=100,'Photo frame collapsed: '+JSON.stringify({width:frame.width,height:frame.height}));
    assert(frame.top>=0&&frame.bottom<=$('#shutter').getBoundingClientRect().top+1,'Photo frame overlaps capture controls');
    assert(picture.width>=80&&picture.height>=100,'Photo image has no visible area');
    return {width:frame.width,height:frame.height};
  };
  const click = selector => { assert($(selector),'Missing '+selector); $(selector).click(); };
  const language = async code => {
    const select=$('.language-picker');select.value=code;select.dispatchEvent(new Event('change',{bubbles:true}));
    await wait(()=>document.documentElement.lang===code,'Language not applied',5000);
  };
  await wait(()=>$('#cameraBtn')?.onclick&&$('#shutter')?.onclick,'App did not initialize');
  if(name==='boot') {
    assert(window.Capacitor?.getPlatform()===platform,'Native platform bridge missing');
    assert(location.hostname==='localhost','App is not using bundled local assets');
    assert(typeof navigator.mediaDevices?.getUserMedia==='function','Camera API unavailable');
    assert(typeof HTMLDialogElement.prototype.showModal==='function','Dialog API unavailable');
    assert(typeof WebAssembly==='object','WASM unavailable');
    return {platform,url:location.origin,ua:navigator.userAgent,viewport:[innerWidth,innerHeight]};
  }
  if(name==='languages') {
    for(const [code,label] of [['de','Kamera starten'],['ko','내 카메라로 시작'],['en','Start camera']]) {
      await language(code);await wait(()=>$('#cameraBtn').textContent.includes(label),'Wrong camera translation '+code,5000);
      assert(localStorage.getItem('frame-language')===code,'Language preference not persisted');
    }
    return 'de/en/ko labels and stored preference';
  }
  await language('en');
  if(name==='modelAndCalibration') {
    click('#sampleAnalyzeBtn');
    await wait(()=>$('#engineLabel').textContent==='Demo pose tracking','Real pose model did not run');
    assert(!$('#movementHud').hidden,'No person detected in known demo');
    click('#metricSetupBtn');$('#heightCm').value='170';$('#distanceM').value='3';
    $('#scaleForm').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    await wait(()=>!$('#scaleDialog').open,'Calibration did not complete',5000);
    assert($('#finderTip').textContent.includes('cm'),'Metric guide missing');
    click('[data-pack="seated"]');
    assert(!$('#movementHud').textContent.includes('≈'),'Standing metric scale leaked into seated pose');
    click('[data-pack="travel"]');
    return 'Bundled MediaPipe model, detected person, cm calibration and seated invalidation';
  }
  if(name==='capture') {
    await wait(()=>$('#sampleImage').complete&&$('#sampleImage').naturalWidth>0,'Demo missing');
    const before=Number($('#galleryCount').textContent);click('#shutter');
    await wait(()=>$('#photoDialog').open,'Capture did not open photo');
    await wait(()=>$('#capturedPreview').naturalWidth>0,'Captured image failed to decode');
    assert(Number($('#galleryCount').textContent)===before+1,'Gallery count did not increase: before='+before+', after='+$('#galleryCount').textContent);
    $('#photoDialog').close();localStorage.setItem('frame-qa-capture-count',String(before+1));
    return {count:before+1,width:$('#capturedPreview').naturalWidth};
  }
  if(name==='storageFailure') {
    click('[data-view="studio"]');await wait(()=>$('#sampleImage').complete&&$('#sampleImage').naturalWidth>0,'Demo missing');
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(){throw new DOMException('Injected test quota failure','QuotaExceededError');};
    try {
      for(const auto of [false,true]) {
        if(($('#autoBtn').getAttribute('aria-checked')==='true')!==auto)click('#autoBtn');
        click('#shutter');await wait(()=>$('#photoDialog').open,'Failed-storage photo preview missing; auto='+auto);
        await wait(()=>$('#capturedPreview').naturalWidth>0,'Unsaved photo cannot be exported');
        assert(!$('#photoStorageWarning').hidden,'Storage failure warning is hidden');
        assert($('#photoStorageWarning').textContent.includes('this session'),'Missing session-only notice');
        assert($('#autoBtn').getAttribute('aria-checked')==='false','Auto capture was not paused after storage failure');
        $('#photoDialog').close();
      }
    }finally{IDBObjectStore.prototype.put=put;$('#photoDialog').close();}
    return 'Injected storage failure retains an exportable photo and shows an explicit warning';
  }
  if(name==='persistenceAndDelete') {
    const expected=Number(localStorage.getItem('frame-qa-capture-count'));
    assert(expected>0,'Capture setup missing');
    await wait(()=>Number($('#galleryCount').textContent)===expected,'Photo did not survive native WebView reload',10000);
    click('#mobileGallery');await wait(()=>$('#galleryGrid button'),'Gallery empty');
    click('#galleryGrid button');click('#deletePhotoBtn');
    await wait(()=>Number($('#galleryCount').textContent)===expected-1,'Delete did not update gallery');
    localStorage.removeItem('frame-qa-capture-count');
    return 'IndexedDB persistence across reload and deletion';
  }
  if(name==='layout') {
    click('[data-view="studio"]');click('#focusBtn');
    const finder=visibleFinder();
    const r=$('#shutter').getBoundingClientRect();
    assert(r.width>=44&&r.height>=44,'Shutter touch target too small');
    assert(r.top>=0&&r.bottom<=innerHeight+1,'Shutter outside viewport');
    assert(document.documentElement.scrollWidth<=innerWidth+1,'Horizontal overflow');
    click('#optionsBtn');await language('de');
    assert($('#controlsDialog').open,'Options did not open');
    assert($('#controlsDialog').getBoundingClientRect().top>=-1,'Options top is unreachable');
    $('#controlsDialog').close();await language('en');click('#exitFocusBtn');
    return {viewport:[innerWidth,innerHeight],finder,shutter:[r.width,r.height,r.top,r.bottom]};
  }
  if(name.startsWith('screenshot_')) {
    const [,lang,scene]=name.split('_');
    click('[data-view="studio"]');
    if(scene==='guide') {
      click('#sampleAnalyzeBtn');await wait(()=>$('#engineLabel').textContent==='Demo pose tracking'&&!$('#statusMessage').textContent.trim(),'Screenshot model did not finish');
      click('#focusBtn');
    } else { click('#exitFocusBtn');click('[data-view="poses"]'); }
    await language(lang);await new Promise(r=>setTimeout(r,400));
    if(scene==='guide')visibleFinder();
    return {scene,lang};
  }
  if(name==='nativeFiles') {
    const call=(plugin,method,options)=>window.Capacitor.nativePromise(plugin,method,options);
    const path='frame-share/qa-verification.txt';
    const result=await call('Filesystem','writeFile',{directory:'CACHE',path,data:btoa('FRAME native QA'),recursive:true});
    assert(!!result.uri,'No native file URI');
    const read=await call('Filesystem','readFile',{directory:'CACHE',path});
    assert(atob(read.data)==='FRAME native QA','Native file contents differ');
    await call('Filesystem','deleteFile',{directory:'CACHE',path});
    const canShare=await call('Share','canShare',{});assert(canShare.value===true,'Native share plugin unavailable');
    return 'Real native cache write/read/delete and share capability';
  }
  if(name==='cameraStart') {
    click('#cameraBtn');await wait(()=>$('#video').srcObject&&$('#video').videoWidth>0,'Emulator camera did not produce frames',30000);
    window.__qaTracks=$('#video').srcObject.getTracks();return 'Camera running';
  }
  if(name==='cameraStopped') {
    assert(window.__qaTracks?.length>0,'Camera setup missing');
    assert(window.__qaTracks.every(t=>t.readyState==='ended'),'Background camera tracks still active');
    assert(!$('#video').srcObject,'Camera stream still attached');return 'Camera released on native background';
  }
  if(name==='camera') {
    click('#cameraBtn');
    await wait(()=>$('#video').srcObject&&$('#video').videoWidth>0,'Emulator camera did not produce frames',30000);
    assert($('#video').srcObject.getAudioTracks().length===0,'Unexpected audio track');
    const tracks=$('#video').srcObject.getTracks();click('#cameraBtn');
    assert(tracks.every(t=>t.readyState==='ended'),'Camera tracks still active after stop');
    return 'Emulated camera frames, audio disabled, tracks stopped';
  }
  throw Error('Unknown scenario '+name);
};
