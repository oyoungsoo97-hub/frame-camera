import {Capacitor} from '@capacitor/core';
import {Filesystem,Directory} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
export const isNative=Capacitor.isNativePlatform();
export async function shareNativePhoto(blob,name){
  if(!isNative)return false;
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(blob);});
  const {uri}=await Filesystem.writeFile({directory:Directory.Cache,path:'frame-share/'+name,data,recursive:true});
  await Share.share({title:'FRAME',files:[uri]});
  return true;
}
