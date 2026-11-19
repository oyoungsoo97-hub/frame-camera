// Resolve only after the existing gallery has loaded. Callers must await this
// before adding a new photo, so a late initial read cannot overwrite a capture.
export function loadPhotoDatabase(indexedDB,timeoutMs=8000){
  return new Promise((resolve,reject)=>{
    let db,settled=false;
    const finish=(error,photos)=>{
      if(settled)return;settled=true;clearTimeout(timer);
      if(error){db?.close();reject(error);}else resolve({db,photos:photos.sort((a,b)=>b.created-a.created)});
    };
    const timer=setTimeout(()=>finish(Error('Gallery initialization timed out')),timeoutMs);
    try{
      const request=indexedDB.open('frame-camera',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('photos',{keyPath:'id'});
      request.onerror=()=>finish(request.error??Error('Gallery unavailable'));
      request.onblocked=()=>finish(Error('Gallery blocked by another session'));
      request.onsuccess=()=>{
        db=request.result;
        if(settled){db.close();return;}
        try{
          const read=db.transaction('photos').objectStore('photos').getAll();
          read.onsuccess=()=>finish(null,read.result);
          read.onerror=()=>finish(read.error??Error('Gallery could not be loaded'));
        }catch(error){finish(error);}
      };
    }catch(error){finish(error);}
  });
}
