// Camera permission and video startup must remain independent of ML initialization.
export function withDeadline(promise, { timeoutMs=25000, signal, timeoutName='CameraTimeoutError', onLateResolve=()=>{} }={}) {
  return new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(fn,value)=>{if(settled)return false;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);fn(value);return true;};
    const abort=()=>finish(reject,new DOMException('Camera start cancelled','AbortError'));
    const timer=setTimeout(()=>finish(reject,new DOMException('Camera start timed out',timeoutName)),timeoutMs);
    Promise.resolve(promise).then(value=>{if(!finish(resolve,value))onLateResolve(value);},error=>finish(reject,error));
    if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
  });
}

export function requestCamera(mediaDevices, facing, options={}) {
  // Call getUserMedia immediately in the button's user-activation task.
  const request=mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facing}}});
  return withDeadline(request,{...options,timeoutName:'CameraPermissionTimeout',onLateResolve:stream=>stream.getTracks().forEach(track=>track.stop())});
}

export function playCamera(video,stream,options={}) {
  // Make the element visible BEFORE attaching/playing a stream on WebKit.
  video.hidden=false;
  video.muted=true;
  video.defaultMuted=true;
  video.autoplay=true;
  video.playsInline=true;
  video.setAttribute('playsinline','');
  video.setAttribute('webkit-playsinline','');
  video.setAttribute('muted','');
  video.srcObject=stream;
  return withDeadline(video.play(),{timeoutMs:12000,...options,timeoutName:'CameraPlaybackTimeout'});
}
